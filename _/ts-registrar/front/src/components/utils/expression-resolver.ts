/**
 * ==============================================================================
 *  EXPRESSION RESOLVER
 * ==============================================================================
 *
 * Этот класс — движок вычисления выражений
 * Он позволяет описывать логику отображения (цвета, видимость, тексты) в виде
 * строк (JSON), которые приходят с бэкенда.
 *
 * СИНТАКСИС (SpEL-like):
 * ------------------------------------------------------------------------------
 * 1. ПЕРЕМЕННЫЕ:
 *    Используйте `#{field}`, чтобы получить значение из данных строки.
 *    Поддерживается вложенность: `#{user.role.name}`.
 *    Пример: "Привет, #{firstName}!" -> "Привет, Дастан!"
 *
 * 2. ЛОГИЧЕСКИЕ ОПЕРАТОРЫ (для isVisible / disabled):
 *    Сравнивает значение слева и справа.
 *    - Равно:        `eq`, `==`      -> `#{status} eq 'ACTIVE'`
 *    - Не равно:     `ne`, `!=`      -> `#{type} ne 'DRAFT'`
 *    - Больше:       `gt`, `>`       -> `#{age} gt 18`
 *    - Больше/Равно: `ge`, `>=`      -> `#{price} ge 100.50`
 *    - Меньше:       `lt`, `<`       -> `#{count} lt 10`
 *    - Меньше/Равно: `le`, `<=`      -> `#{rating} le 5`
 *    - В списке:     `in`            -> `#{role} in 'ADMIN, EDITOR'`
 *    - Не в списке:  `nin`           -> `#{status} nin 'DELETED, ARCHIVED'`
 *
 * 3. ОТРИЦАНИЕ:
 *    Используйте `!` в начале выражения.
 *    Пример: `!#{isEditable}` (Скрыть, если isEditable === true)
 *
 * 4. ФУНКЦИЯ MAPPING (Условные значения):
 *    Позволяет выбирать значение на основе ключа.
 *    Синтаксис: `map(#{field}, 'CASE1':'VAL1', 'CASE2':'VAL2', 'DEFAULT':'DEF_VAL')`
 *
 *    Пример (Цвет тега):
 *    "map(#{status}, 'ERROR':'danger', 'SUCCESS':'success', 'DEFAULT':'info')"
 *
 * ==============================================================================
 */

// src/components/utils/expression-resolver.ts

import type {Source} from "../types/common.types.ts";


// Определение поддерживаемых операторов для генерации Regex
const OPERATORS = [
    'eq', '==', // Equal
    'ne', '!=', // Not Equal
    'gt', '>',  // Greater Than
    'ge', '>=', // Greater or Equal
    'lt', '<',  // Less Than
    'le', '<=', // Less or Equal
    'in',       // In List
    'nin'       // Not In List
];

export class ExpressionResolver {

    // --- REGEX PATTERNS ---

    // Поиск переменных: #{name} или #{user.id}
    private static readonly REGEX_VAR_GLOBAL = /#\{([\w.]+)\}/g;
    private static readonly REGEX_VAR_EXACT = /^#\{([\w.]+)\}$/;

    // Динамическая генерация Regex для операторов (сортируем по длине, чтобы '>=' матчилось раньше '>')
    // Результат: /^(.*?)\s+(nin|eq|ne|gt|ge|lt|le|in|==|!=|>=|<=|>|<)\s+(.*)$/i
    private static readonly REGEX_OPERATOR = new RegExp(
        `^(.*?)\\s+(${OPERATORS.sort((a, b) => b.length - a.length).join('|')})\\s+(.*)$`,
        'i');

    /**
     * Вычисляет ЗНАЧЕНИЕ (Value).
     * Используется для текстов, цветов, классов.
     *
     * @example
     * resolveValue("#{user.name}", data) -> "Alex"
     * resolveValue("map(#{status}, 'OK':'green')", data) -> "green"
     */
    static resolveValue<TData>(source: Source<TData, any>, data: TData): any {
        if (source === undefined || source === null) return undefined;

        // 1. JS Function (Client-side fast path)
        if (typeof source === 'function') {
            try {
                return source(data);
            } catch (e) {
                console.error('[ExpressionResolver] Function execution failed', e);
                return undefined;
            }
        }

        // 2. String Expression
        if (typeof source === 'string') {
            const trimmed = source.trim();

            // Функция map(...)
            if (trimmed.startsWith('map(') && trimmed.endsWith(')')) {
                return this.evaluateMap(trimmed, data);
            }

            // Переменные #{...}
            if (trimmed.includes('#{')) {
                // Оптимизация: точное совпадение возвращает исходный тип данных (число, булево)
                const exactMatch = this.REGEX_VAR_EXACT.exec(trimmed);
                if (exactMatch) {
                    return this.getValueByPath(data, exactMatch[1]);
                }

                // Шаблон строки: "ID: #{id} (new)" -> возвращает строку
                return trimmed.replace(this.REGEX_VAR_GLOBAL, (_, path) => {
                    const val = this.getValueByPath(data, path);
                    return val !== undefined && val !== null ? String(val) : '';
                });
            }
        }

        // 3. Static Value (Primitive)
        return source;
    }

    /**
     * Вычисляет БУЛЕВО УСЛОВИЕ (Boolean).
     * Используется для `isVisible`, `disabled`.
     *
     * @example
     * resolveBoolean("#{age} gt 18", data) -> true
     * resolveBoolean("!#{isDeleted}", data) -> false
     */
    static resolveBoolean<TData>(
        source: Source<TData, boolean> | undefined,
        data: TData,
        defaultValue: boolean
    ): boolean {
        if (source === undefined) return defaultValue;

        if (typeof source === 'boolean') return source;
        if (typeof source === 'function') return Boolean(source(data));

        if (typeof source === 'string') {
            const expr = source.trim();
            if (!expr) return defaultValue;

            // 1. Отрицание: !#{field} или !(выражение)
            if (expr.startsWith('!')) {
                const inner = this.resolveValue(expr.substring(1), data);
                return !Boolean(inner);
            }

            // 2. Операторы сравнения
            const match = this.REGEX_OPERATOR.exec(expr);
            if (match) {
                const [, leftRaw, op, rightRaw] = match;
                const leftVal = this.resolveValue(leftRaw, data); // Рекурсивно резолвим левую часть
                const rightVal = this.parseLiteral(rightRaw);     // Парсим литерал справа

                return this.compare(leftVal, op.toLowerCase(), rightVal);
            }

            // 3. Просто переменная (truthy check): #{isActive}
            const val = this.resolveValue(expr, data);
            return Boolean(val);
        }

        return Boolean(source);
    }

    // ==========================================================================
    //  PRIVATE HELPERS
    // ==========================================================================

    /**
     * Логика сравнения значений.
     * Приводит типы для корректного сравнения (числа как числа, строки как строки).
     */
    private static compare(left: any, op: string, right: any): boolean {
        // Приведение для нестрогого сравнения
        const sLeft = String(left);
        const sRight = String(right);
        const nLeft = Number(left);
        const nRight = Number(right);
        const isNumeric = !isNaN(nLeft) && !isNaN(nRight) && left !== '' && right !== '';

        switch (op) {
            case 'eq':
            case '==':
                return sLeft === sRight;

            case 'ne':
            case '!=':
                return sLeft !== sRight;

            case 'gt':
            case '>':
                return isNumeric ? nLeft > nRight : sLeft > sRight;

            case 'ge':
            case '>=':
                return isNumeric ? nLeft >= nRight : sLeft >= sRight;

            case 'lt':
            case '<':
                return isNumeric ? nLeft < nRight : sLeft < sRight;

            case 'le':
            case '<=':
                return isNumeric ? nLeft <= nRight : sLeft <= sRight;

            case 'in':
                return this.checkInList(left, right);

            case 'nin':
                return !this.checkInList(left, right);

            default:
                return false;
        }
    }

    /**
     * Проверка вхождения в список (строка через запятую или массив)
     */
    private static checkInList(value: any, list: any): boolean {
        const sValue = String(value);
        if (Array.isArray(list)) {
            return list.some(i => String(i) === sValue);
        }
        if (typeof list === 'string') {
            // "  A, B , C  " -> ["A", "B", "C"]
            const arr = list.split(',').map(s => this.stripQuotes(s.trim()));
            return arr.includes(sValue);
        }
        return false;
    }

    /**
     * Безопасное получение значения по пути "user.address.city"
     */
    private static getValueByPath(data: any, path: string): any {
        if (!path || !data) return undefined;
        if (!path.includes('.')) return data[path];

        return path.split('.').reduce((acc, key) =>
            (acc && acc[key] !== undefined) ? acc[key] : undefined, data
        );
    }

    /**
     * Парсер функции map(...)
     * map(#{status}, 'KEY':'VAL', 'DEFAULT':'VAL')
     */
    private static evaluateMap<TData>(expr: string, data: TData): any {
        // Убираем обертку map(...)
        const content = expr.substring(4, expr.length - 1);

        // Умный парсинг аргументов (учитывает запятые внутри кавычек)
        const args = this.parseFunctionArgs(content);
        if (args.length === 0) return null;

        // Первый аргумент - значение для проверки
        const targetVal = String(this.resolveValue(args[0], data));

        let defaultValue = null;

        // Проход по парам 'KEY':'VALUE'
        for (let i = 1; i < args.length; i++) {
            const pair = args[i];
            const sepIdx = pair.indexOf(':');
            if (sepIdx === -1) continue;

            const rawKey = pair.substring(0, sepIdx).trim();
            const rawVal = pair.substring(sepIdx + 1).trim();

            const key = this.stripQuotes(rawKey);
            const val = this.stripQuotes(rawVal);

            if (key === 'DEFAULT') defaultValue = val;
            if (key === targetVal) return val;
        }

        return defaultValue;
    }

    /**
     * Лексер аргументов функции: разделяет по запятой, но игнорирует запятые внутри кавычек.
     * "'Error, Fatal', 'Red'" -> ["'Error, Fatal'", "'Red'"]
     */
    private static parseFunctionArgs(str: string): string[] {
        const args: string[] = [];
        let current = '';
        let inQuote = false;
        let quoteChar = '';

        for (let i = 0; i < str.length; i++) {
            const char = str[i];

            if ((char === "'" || char === '"') && (i === 0 || str[i - 1] !== '\\')) {
                if (!inQuote) {
                    inQuote = true;
                    quoteChar = char;
                } else if (char === quoteChar) {
                    inQuote = false;
                }
            }

            if (char === ',' && !inQuote) {
                args.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        if (current.trim()) args.push(current.trim());
        return args;
    }

    /**
     * Удаляет внешние кавычки
     */
    private static stripQuotes(str: string): string {
        if ((str.startsWith("'") && str.endsWith("'")) || (str.startsWith('"') && str.endsWith('"'))) {
            return str.substring(1, str.length - 1);
        }
        return str;
    }

    /**
     * Парсит литералы (true, false, null, number, string)
     */
    private static parseLiteral(str: string): any {
        const s = str.trim();
        if (s === 'true') return true;
        if (s === 'false') return false;
        if (s === 'null') return null;
        if (s === 'undefined') return undefined;

        // Число (если не в кавычках и валидное)
        if (!isNaN(Number(s)) && !s.startsWith("'") && !s.startsWith('"') && s !== '') {
            return Number(s);
        }

        return this.stripQuotes(s);
    }
}