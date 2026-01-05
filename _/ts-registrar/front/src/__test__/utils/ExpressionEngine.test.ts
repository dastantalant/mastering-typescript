// src/utils/ExpressionEngine.test.ts

import { ExpressionEngine } from '../../utils/ExpressionEngine.ts';


/**
 * Группирует тесты в логические блоки (например, "Арифметика", "Массивы").
 * Использует console.group для красивого отступа в консоли браузера.
 */
function describe(name: string, fn: () => void) {
    console.group(`📂 ${name}`);
    try { fn(); } finally { console.groupEnd(); }
}

/**
 * Выполняет конкретный тест.
 * Если внутри функции произойдет ошибка (throw), тест считается проваленным.
 */
function test(name: string, fn: () => void) {
    try {
        fn();
        console.log(`✅ ${name}`);
    } catch (e: any) {
        console.error(`❌ ${name}`);
        console.error(`   Message: ${e.message}`);
    }
}

/**
 * Функция утверждений (Asserts).
 * Сравнивает полученное значение (received) с ожидаемым.
 */
function expect(received: any) {
    return {
        // Проверка на строгое равенство (===)
        toBe: (expected: any) => {
            if (received !== expected) {
                throw new Error(`Ожидалось '${expected}', получено '${received}'`);
            }
        },
        // Глубокое сравнение объектов/массивов через JSON.stringify
        toEqual: (expected: any) => {
            const r = JSON.stringify(received);
            const e = JSON.stringify(expected);
            if (r !== e) {
                throw new Error(`Ожидалось ${e}, получено ${r}`);
            }
        },
        // Проверка на истинность (true, 1, "str", {})
        toBeTruthy: () => {
            if (!received) throw new Error(`Ожидалось truthy значение, получено ${received}`);
        },
        // Проверка на ложность (false, 0, "", null, undefined)
        toBeFalsy: () => {
            if (received) throw new Error(`Ожидалось falsy значение, получено ${received}`);
        },
        // Проверка на undefined
        toBeUndefined: () => {
            if (received !== undefined) throw new Error(`Ожидалось undefined, получено ${received}`);
        },
        // Проверка длины массива
        toHaveLength: (len: number) => {
            if (!received || received.length !== len) {
                throw new Error(`Ожидалась длина массива ${len}, получено ${received?.length}`);
            }
        },
    };
}

// ============================================================================
// 📦 ТЕСТОВЫЕ ДАННЫЕ (MOCK CONTEXT)
// ============================================================================
// Этот объект имитирует реальные данные приложения (store, state, props),
// к которым будет обращаться движок выражений.
const ctx = {
    user: {
        name: 'Alex',
        role: 'ADMIN',
        age: 30,
        balance: 100.50,
        // Пример вложенного объекта с null значением для тестов
        settings: { theme: 'dark', notifications: null },
        tags: ['vip', 'staff']
    },
    // Список товаров для тестов методов массива (filter, map, sum)
    cart: [
        { id: 1, name: 'Laptop', price: 1000, qty: 1, category: 'tech' }, // Дорогой товар
        { id: 2, name: 'Mouse', price: 50, qty: 2, category: 'tech' },    // Дешевый товар
        { id: 3, name: 'Paper', price: 5, qty: 10, category: 'stationery' },
    ],
    emptyList: [],
    status: 'PENDING',
    rawString: '  hello  '
};

// ============================================================================
// 🚀 ЗАПУСК ТЕСТОВ
// ============================================================================
export function runExpressionEngineTest() {
    console.clear(); // Очищаем консоль перед запуском
    console.log('🚀 ЗАПУСК ПРОВЕРКИ EXPRESSION ENGINE...');

    // 1. БАЗОВАЯ АРИФМЕТИКА И ЛОГИКА
    describe('1. Arithmetic & Logic', () => {
        test('Basic math (Приоритет операций)', () => {
            // Умножение должно выполниться раньше сложения
            expect(ExpressionEngine.evaluate('2 + 2 * 2')).toBe(6);
            // Скобки меняют приоритет
            expect(ExpressionEngine.evaluate('(2 + 2) * 2')).toBe(8);
            // Доступ к данным из контекста + арифметика
            expect(ExpressionEngine.evaluate('user.balance * 2', ctx)).toBe(201);
        });

        test('Comparisons (Сравнения)', () => {
            expect(ExpressionEngine.evaluate('user.age >= 18', ctx)).toBe(true);
            expect(ExpressionEngine.evaluate('user.age < 20', ctx)).toBe(false);
            expect(ExpressionEngine.evaluate('user.name == "Alex"', ctx)).toBe(true);
            // != работает корректно
            expect(ExpressionEngine.evaluate('user.name != "John"', ctx)).toBe(true);
        });

        test('Logical operators (&&, ||, !)', () => {
            // Оба условия должны быть true
            expect(ExpressionEngine.evaluate('user.role == "ADMIN" && user.age > 20', ctx)).toBe(true);
            // Хотя бы одно условие true (role не GUEST, но баланс > 0)
            expect(ExpressionEngine.evaluate('user.role == "GUEST" || user.balance > 0', ctx)).toBe(true);
            // Отрицание: theme='dark' (truthy) -> !theme -> false
            expect(ExpressionEngine.evaluate('!user.settings.theme', ctx)).toBe(false);
        });

        test('Ternary Operator (Тернарный оператор)', () => {
            // Условие ? Если истина : Если ложь
            expect(ExpressionEngine.evaluate('user.age >= 18 ? "Adult" : "Minor"', ctx)).toBe("Adult");
        });
    });

    // 2. ДОСТУП К ОБЪЕКТАМ И БЕЗОПАСНОСТЬ
    describe('2. Object Access & Safety', () => {
        test('Deep access (Вложенные свойства)', () => {
            expect(ExpressionEngine.evaluate('user.settings.theme', ctx)).toBe('dark');
        });

        test('Safe Navigation (Защита от undefined)', () => {
            // Обращение к несуществующему свойству не должно ломать код (как user.address?.city)
            expect(ExpressionEngine.evaluate('user.address.city', ctx)).toBeUndefined();
            // Глубокое обращение к несуществующему
            expect(ExpressionEngine.evaluate('user.settings.notifications.email', ctx)).toBeUndefined();
        });

        test('Null Coalescing (Оператор ??)', () => {
            // Если левая часть null/undefined, берем правую
            // user.settings.notifications === null, значит берем "enabled"
            expect(ExpressionEngine.evaluate('user.settings.notifications ?? "enabled"', ctx)).toBe("enabled");

            // user.settings.theme существует ('dark'), значит берем его
            expect(ExpressionEngine.evaluate('user.settings.theme ?? "light"', ctx)).toBe("dark");
        });
    });

    // 3. РАБОТА С МАССИВАМИ (Мощные функции)
    describe('3. Array Helpers (Power Features)', () => {
        test('map() - Извлечение свойств', () => {
            // Превращаем массив объектов в массив строк (только имена)
            const names = ExpressionEngine.evaluate("map(cart, 'name')", ctx);
            expect(names).toEqual(['Laptop', 'Mouse', 'Paper']);
        });

        test('filter() - Фильтрация списка', () => {
            // Оставляем только товары дороже 100
            const expensive = ExpressionEngine.evaluate("filter(cart, 'price > 100')", ctx);
            expect(expensive).toHaveLength(1); // Должен остаться только Laptop
            // @ts-ignore
            expect(expensive[0].name).toBe('Laptop');
        });

        test('sum() simple - Простое сложение', () => {
            // Суммируем поле 'qty' (количество): 1 + 2 + 10 = 13
            expect(ExpressionEngine.evaluate("sum(cart, 'qty')", ctx)).toBe(13);
        });

        test('sum() complex - Сложение вычисляемого выражения', () => {
            // Считаем общую стоимость корзины: (цена * кол-во) для каждого товара
            // Laptop: 1000*1 + Mouse: 50*2 + Paper: 5*10 = 1150
            expect(ExpressionEngine.evaluate("sum(cart, 'price * qty')", ctx)).toBe(1150);
        });

        test('includes() - Проверка в массиве строк', () => {
            expect(ExpressionEngine.evaluate("includes(user.tags, 'vip')", ctx)).toBe(true);
            expect(ExpressionEngine.evaluate("includes(user.tags, 'banned')", ctx)).toBe(false);
        });

        test('find() - Поиск элемента', () => {
            // Ищем конкретный объект (мышь с id=2)
            const item = ExpressionEngine.evaluate("find(cart, 'id == 2')", ctx);
            expect(item).toEqual(ctx.cart[1]);
        });
    });

    // 4. СЛОЖНЫЕ ЦЕПОЧКИ (Вложенность функций)
    describe('4. Complex Chains', () => {
        test('filter + map combined', () => {
            // Сценарий: Найти цены всех технологических товаров
            // 1. filter: берем товары с category == 'tech' (Laptop, Mouse)
            // 2. map: из полученного списка берем только 'price'
            const prices = ExpressionEngine.evaluate("map(filter(cart, 'category == \"tech\"'), 'price')", ctx);
            expect(prices).toEqual([1000, 50]);
        });

        test('isEmpty check (Проверка на пустоту)', () => {
            expect(ExpressionEngine.evaluate("isEmpty(emptyList)", ctx)).toBe(true);
            expect(ExpressionEngine.evaluate("isEmpty(cart)", ctx)).toBe(false);
            expect(ExpressionEngine.evaluate("isEmpty(user.settings.notifications)", ctx)).toBe(true); // null считается пустым
        });
    });

    // 5. УТИЛИТЫ И ХЕЛПЕРЫ
    describe('5. Utility Helpers', () => {
        test('switch() - Аналог switch-case', () => {
            // Если статус PENDING -> 'Ждем', если DONE -> 'Готово', иначе -> 'Неизвестно'
            const expr = "switch(status, 'PENDING', 'Ждем', 'DONE', 'Готово', 'Неизвестно')";
            expect(ExpressionEngine.evaluate(expr, ctx)).toBe('Ждем');
        });

        test('Math helpers', () => {
            expect(ExpressionEngine.evaluate("max(10, 20, 5)")).toBe(20);
            expect(ExpressionEngine.evaluate("min(10, 20, 5)")).toBe(5);
            expect(ExpressionEngine.evaluate("round(10.6)")).toBe(11);
        });
    });

    // 6. ПРОВЕРКИ БЕЗОПАСНОСТИ (ОЧЕНЬ ВАЖНО)
    describe('6. Security Checks', () => {
        test('Prototype pollution protection (Защита прототипа)', () => {
            // Пользователь не должен иметь доступ к прототипам JS объектов,
            // чтобы не сломать приложение или не получить доступ к нативным методам.
            expect(ExpressionEngine.evaluate("user.__proto__", ctx)).toBeUndefined();
            expect(ExpressionEngine.evaluate("user.constructor", ctx)).toBeUndefined();
        });

        test('Function constructor protection (Защита от выполнения кода)', () => {
            // Попытка создать новую функцию через конструктор и выполнить её
            // (это классическая атака для выхода из песочницы).
            // Движок должен вернуть undefined.
            expect(ExpressionEngine.evaluate("map.constructor('alert(1)')()", ctx)).toBeUndefined();
        });
    });
}