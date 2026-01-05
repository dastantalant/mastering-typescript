// src/utils/ExpressionEngine.ts

import jsep from 'jsep';
import jsepObject from '@jsep-plugin/object';

// 🔌 Plugins Registration / Регистрация плагинов
jsep.plugins.register(jsepObject);

// Try to register '??' operator. Fails silently if already registered.
// Попытка зарегистрировать оператор '??'.
try { jsep.addBinaryOp('??', 1); } catch {}

// --- TYPES / ТИПЫ ---
type AnyObj = Record<string, any>;
type BinaryHandler = (a: any, b: any) => any;

// --- SECURITY / БЕЗОПАСНОСТЬ ---
/**
 * Forbidden properties to prevent Prototype Pollution attacks.
 * Запрещенные свойства для предотвращения атак через прототипы.
 */
const FORBIDDEN_PROPS = new Set([
    '__proto__', 'prototype', 'constructor', 'caller', 'callee', 'arguments'
]);

// --- CACHE / КЕШ ---
/**
 * Simple LRU Cache to prevent memory leaks in long-running apps.
 * Простой LRU-кеш для предотвращения утечек памяти.
 */
class SimpleLRUCache<K, V> {
    private map = new Map<K, V>();
    constructor(private readonly max = 300) {}

    get(key: K) {
        const v = this.map.get(key);
        if (v !== undefined) {
            // Refresh item / Обновляем элемент (ставим в конец)
            this.map.delete(key);
            this.map.set(key, v);
        }
        return v;
    }

    set(key: K, value: V) {
        if (this.map.size >= this.max) {
            // Remove oldest / Удаляем самый старый
            const k = this.map.keys().next().value;
            if (k) this.map.delete(k);
        }
        this.map.set(key, value);
    }
}

/**
 * =======================
 *  EXPRESSION ENGINE
 * =======================
 *
 * A high-performance JIT-compiled evaluator
 * Features:
 *  - Compiles AST to native JS functions (extremely fast).
 *  - Secure sandbox execution (no access to window/globals).
 *  - Supports array predicates: `filter(items, 'price > 100')`.
 *
 * Высокопроизводительный движок выражений
 * Особенности:
 *  - JIT-компиляция AST в нативные JS функции (очень быстро).
 *  - Безопасная песочница (нет доступа к window/глобальным переменным).
 *  - Поддержка предикатов: `filter(items, 'price > 100')`.
 */
export class ExpressionEngine {
    // Caches / Кеши
    private static astCache = new SimpleLRUCache<string, jsep.Expression>(1000);
    private static fnCache = new SimpleLRUCache<string, Function>(1000);

    // Custom Ops / Кастомные операторы
    private static customBinaryHandlers = new Map<string, BinaryHandler>();

    // --- HELPERS / ХЕЛПЕРЫ ---
    private static helpers: Record<string, Function> = {
        // Math
        max: Math.max,
        min: Math.min,
        round: Math.round,
        ceil: Math.ceil,
        floor: Math.floor,
        abs: Math.abs,

        /**
         * Checks if value is empty (null, undefined, '', []).
         * Проверяет на пустоту.
         */
        isEmpty: (v: any) => v == null || v === '' || (Array.isArray(v) && v.length === 0),

        // --- ARRAY FUNCTIONS WITH AUTO-COMPILATION ---

        /**
         * Filters array based on string expression.
         * Example: `filter(items, 'price > 100')`
         */
        filter: (list: any[], pred: any) => Array.isArray(list) ? list.filter(ExpressionEngine.toFn(pred)) : [],

        /**
         * Maps array elements.
         * Example: `map(users, 'name')` or `map(items, 'price * qty')`
         */
        map: (list: any[], pred: any) => Array.isArray(list) ? list.map(ExpressionEngine.toFn(pred)) : [],

        find: (list: any[], pred: any) => Array.isArray(list) ? list.find(ExpressionEngine.toFn(pred)) : undefined,
        some: (list: any[], pred: any) => Array.isArray(list) ? list.some(ExpressionEngine.toFn(pred)) : false,
        every: (list: any[], pred: any) => Array.isArray(list) ? list.every(ExpressionEngine.toFn(pred)) : false,

        count: (list: any) => Array.isArray(list) ? list.length : 0,
        includes: (list: any[], val: any) => Array.isArray(list) ? list.includes(val) : false,

        /**
         * Sums up values in an array.
         * Example: `sum(items, 'total')`
         */
        sum: (list: any[], keyOrFn: any) => {
            if (!Array.isArray(list)) return 0;
            const fn = ExpressionEngine.toFn(keyOrFn);
            return list.reduce((acc, item) => acc + (Number(fn(item)) || 0), 0);
        },

        /**
         * Switch case equivalent.
         * Usage: `switch(status, 'ACTIVE', 'green', 'BANNED', 'red', 'gray')`
         * Last argument is default value.
         */
        switch: (val: any, ...args: any[]) => {
            // args format: [case1, res1, case2, res2, default?]
            for (let i = 0; i < args.length - 1; i += 2) {
                if (args[i] === val) return args[i+1];
            }
            // If odd number of args, last one is default
            return args.length % 2 === 1 ? args[args.length - 1] : undefined;
        }
    };

    /**
     * Converts a predicate (string or function) into an executable function.
     * Преобразует предикат (строку или функцию) в исполняемую функцию.
     */
    private static toFn(pred: any): (item: any) => any {
        if (typeof pred === 'function') return pred;
        return this.compilePredicate(String(pred));
    }

    // --- PUBLIC API ---

    /**
     * Registers a global helper function.
     * Регистрирует глобальную функцию-хелпер.
     */
    static registerHelper(name: string, fn: Function) { this.helpers[name] = fn; }

    /**
     * Registers a custom binary operator handler.
     * Регистрирует обработчик кастомного оператора.
     */
    static registerOperator(symbol: string, handler: BinaryHandler) { this.customBinaryHandlers.set(symbol, handler); }

    /**
     * Evaluates an expression against a context.
     * Вычисляет выражение на основе переданного контекста.
     *
     * @param expression String expression (e.g. "#{ user.age + 1 }")
     * @param context Data object (e.g. { user: { age: 10 } })
     */
    static evaluate(expression: string | unknown, context: AnyObj = {}) {
        if (!expression || typeof expression !== 'string') return expression;

        // Strip #{ } / Удаляем обертку
        const raw = expression.trim().replace(/^#\{|\}$/g, '');

        // 1. Check Compiled Cache (Fastest) / Проверка кеша функций
        let fn = this.fnCache.get(raw);
        if (fn) return fn(context);

        // 2. Check AST Cache / Проверка кеша AST
        let ast = this.astCache.get(raw);
        if (!ast) {
            try {
                ast = jsep(raw);
                this.astCache.set(raw, ast);
            } catch (e) {
                console.warn('[ExpressionEngine] Parse Error:', expression);
                return undefined;
            }
        }

        // 3. Compile & Execute / Компиляция и выполнение
        try {
            fn = this.compile(ast);
            this.fnCache.set(raw, fn);
            return fn(context);
        } catch (e) {
            console.warn('[ExpressionEngine] Compile Error:', e);
            return undefined;
        }
    }

    // --- COMPILER INTERNALS (JIT) ---

    /**
     * Compiles a small predicate string for array methods.
     * Компилирует строку предиката для методов массива.
     */
    private static compilePredicate(expr: string) {
        const key = 'PRED:' + expr;
        let fn = this.fnCache.get(key);
        if (fn) return fn as (ctx: any) => any;

        try {
            const ast = jsep(expr);
            // Predicates use the item as 'ctx' / Предикаты используют item как ctx
            fn = this.compile(ast);
            this.fnCache.set(key, fn);
            return fn as (ctx: any) => any;
        } catch {
            return () => undefined;
        }
    }

    /**
     * Compiles AST into a native Function using `new Function`.
     * Компилирует AST в нативную функцию.
     */
    private static compile(ast: jsep.Expression): Function {
        const body = this.build(ast);

        // Dependency Injection via arguments to keep the generated code clean
        // Внедрение зависимостей через аргументы для чистоты генерируемого кода
        const func = new Function('ctx', 'h', 'ops', 'fbd', `
            "use strict";
            try { return ${body}; } catch(e) { return undefined; }
        `);

        return (ctx: AnyObj) => func(ctx, this.helpers, this.customBinaryHandlers, FORBIDDEN_PROPS);
    }

    private static build(node: jsep.Expression): string {
        switch (node.type) {
            case 'Literal':
                return JSON.stringify(node.value);

            case 'Identifier': {
                const name = (node as jsep.Identifier).name;
                if (name === 'this' || name === '$root') return 'ctx';
                // Safe access / Безопасный доступ
                return `(ctx && ctx[${JSON.stringify(name)}])`;
            }

            case 'UnaryExpression':
                const u = node as jsep.UnaryExpression;
                return `(${u.operator}(${this.build(u.argument)}))`;

            case 'BinaryExpression':
                return this.buildBinary(node as jsep.BinaryExpression);

            case 'MemberExpression':
                return this.buildMember(node as jsep.MemberExpression);

            case 'CallExpression':
                return this.buildCall(node as jsep.CallExpression);

            case 'ConditionalExpression':
                const c = node as jsep.ConditionalExpression;
                return `(${this.build(c.test)} ? ${this.build(c.consequent)} : ${this.build(c.alternate)})`;

            case 'ArrayExpression':
                const arr = (node as jsep.ArrayExpression).elements
                    .map(e => e ? this.build(e) : 'null')
                    .join(',');
                return `[${arr}]`;
            case 'ObjectExpression':
                // @ts-ignore
                const props = node.properties.map((p: any) => {
                    const key = p.key.type === 'Identifier' ? p.key.name : p.key.value;
                    return `${JSON.stringify(key)}:${this.build(p.value)}`;
                }).join(',');
                return `{${props}}`;

            default: return 'undefined';
        }
    }

    private static buildBinary(node: jsep.BinaryExpression): string {
        const l = this.build(node.left);
        const r = this.build(node.right);
        const op = node.operator;

        if (this.customBinaryHandlers.has(op)) {
            return `ops.get('${op}')(${l}, ${r})`;
        }

        // Handle specific JS vs Expression operators
        if (op === 'in') return `(Array.isArray(${r}) ? ${r}.includes(${l}) : (${r} && ${l} in ${r}))`;
        if (op === '??') return `((${l}) != null ? (${l}) : (${r}))`;

        // Default JS operator
        return `(${l} ${op} ${r})`;
    }

    private static buildMember(node: jsep.MemberExpression): string {
        const obj = this.build(node.object);
        const prop = node.computed
            ? this.build(node.property)
            : JSON.stringify((node.property as jsep.Identifier).name);

        // Security Check (fbd = forbidden props)
        // Checks are done inside the generated function
        return `((function(o,p){
            if(o==null || fbd.has(p)) return undefined;
            return o[p];
        })(${obj}, ${prop}))`;
    }

    private static buildCall(node: jsep.CallExpression): string {
        const args = node.arguments.map(a => this.build(a)).join(',');

        // Global Helper Call / Вызов глобального хелпера
        if (node.callee.type === 'Identifier') {
            const name = (node.callee as jsep.Identifier).name;
            return `(h['${name}'] ? h['${name}'](${args}) : undefined)`;
        }

        // Method Call / Вызов метода объекта
        if (node.callee.type === 'MemberExpression') {
            const mem = node.callee as jsep.MemberExpression;
            const obj = this.build(mem.object);
            const prop = mem.computed
                ? this.build(mem.property)
                : JSON.stringify((mem.property as jsep.Identifier).name);

            return `((function(o,p){
                if(o==null || fbd.has(p)) return undefined;
                const m = o[p];
                return typeof m === 'function' ? m.call(o, ${args}) : undefined;
            })(${obj}, ${prop}))`;
        }
        return 'undefined';
    }
}