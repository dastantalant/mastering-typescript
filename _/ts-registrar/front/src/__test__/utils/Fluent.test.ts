// src/utils/Fluent.test.ts
import {Fluent, Cacheable, NoCache, type FluentClass} from '../../utils/Fluent.ts';

// ============================================================================
// 🧪 НАДЕЖНЫЙ ТЕСТОВЫЙ КОНТЕКСТ
// ============================================================================
// Мы используем "Внешнее состояние" (testState) вместо свойств внутри класса.
// ПРИЧИНА: При разработке (особенно с Vue/Vite HMR) классы могут перезагружаться,
// но прокси-объекты могут сохранять старые ссылки. Внешний объект гарантирует,
// что мы проверяем актуальные счетчики вызовов в каждом тесте.

const testState = {
    userCalls: [] as string[], // Лог вызовов (например: ["byId(1)", "byId(1)"])
    mathCalls: 0
};

// Утилита для эмуляции асинхронности (задержка сети)
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// Очистка перед каждым тестом.
// Вызывается автоматически в runTest.
function resetTestState() {
    testState.userCalls = [];
    testState.mathCalls = 0;
    // Принудительно чистим внутренний кеш Fluent API через встроенный метод $reset
    try { UserAPI.$reset(); } catch {}
    try { MathAPI.$reset(); } catch {}
}

// Простой раннер тестов (Micro-framework)
// Позволяет запускать тесты последовательно и видеть красивые логи в консоли браузера.
async function runTest(name: string, fn: () => Promise<void>) {
    // 1. Жесткий сброс всего состояния перед запуском
    resetTestState();

    try {
        // 2. Выполнение теста
        await fn();
        console.log(`✅ ${name}`);
    } catch (e: any) {
        // 3. Логирование ошибки с контекстом
        console.error(`❌ ${name}`);
        console.error(`   Error: ${e.message}`);
        console.error(`   Actual Calls: ${JSON.stringify(testState.userCalls)}`);
    }
}

// Утилита утверждений (Assertions), похожая на Jest
function expect(received: any) {
    return {
        toBe: (expected: any) => {
            if (received !== expected) throw new Error(`Expected '${expected}', got '${received}'`);
        },
        notToBe: (expected: any) => {
            if (received === expected) throw new Error(`Expected value to NOT be '${expected}'`);
        },
        toEqual: (expected: any) => {
            const r = JSON.stringify(received);
            const e = JSON.stringify(expected);
            if (r !== e) throw new Error(`Expected ${e}, got ${r}`);
        },
        toHaveProperty: (prop: string) => {
            if (received === null || received === undefined || !Object.prototype.hasOwnProperty.call(received, prop)) {
                throw new Error(`Expected object to have property '${prop}'`);
            }
        },
        rejects: async () => {
            try {
                await received;
                throw new Error('Expected promise to reject, but it resolved.');
            } catch (e) {
                return; // Успех, промис действительно упал
            }
        }
    };
}

// ============================================================================
// 📦 MOCK СЕРВИСЫ (Имитация бэкенда)
// ============================================================================

/**
 * Сервис пользователя.
 * - Включено глобальное кеширование.
 * - TTL по умолчанию: 2 секунды.
 * - Есть алиас: byId -> getUserById.
 */
@Fluent({
    caching: true,
    ttl: 2000,
    aliases: { byId: 'getUserById' }
})
class UserService {

    async getUserById(id: number) {
        // Логируем вызов во внешний стейт
        testState.userCalls.push(`byId(${id})`);
        await sleep(50); // Имитация задержки сети
        return { id, name: `User${id}` };
    }

    // Переопределение TTL: этот метод кешируется на 3 секунды (дольше глобального)
    @Cacheable(3000)
    async heavyStats(type: string) {
        testState.userCalls.push(`stats(${type})`);
        await sleep(50);
        return { type, ts: Date.now() };
    }

    // Полное отключение кеша для данных реального времени
    @NoCache()
    async realtime() {
        return Date.now();
    }

    // Метод, который всегда падает с ошибкой
    async errorMethod() {
        await sleep(10);
        throw new Error('Boom!');
    }
}

// Интерфейс для TypeScript, чтобы он видел методы алиасов и $reset
interface UserAliases {
    byId(id: number): Promise<{ id: number, name: string }>;
    $reset(): void;
}
// Создаем "Fluent" версию класса
const UserAPI = UserService as unknown as FluentClass<UserService & UserAliases>;


/**
 * Математический сервис.
 * - Глобальное кеширование ВЫКЛЮЧЕНО.
 */
@Fluent({ caching: false })
class MathService {
    async add(a: number, b: number) { return a + b; }

    // Включаем кеш точечно только для этого метода
    @Cacheable()
    async pi() {
        testState.mathCalls++;
        return 3.1415926;
    }
}
interface MathAliases { $reset(): void; }
const MathAPI = MathService as unknown as FluentClass<MathService & MathAliases>;

// ============================================================================
// 🚀 ЗАПУСК ТЕСТОВ
// ============================================================================

export async function runFluentTest() {
    console.clear();
    console.log('🚀 ЗАПУСК ТЕСТОВ FLUENT API (FINAL)...');

    // --- Группа 1: Базовый функционал ---

    await runTest('Singleton Pattern', async () => {
        // Проверяем, что API возвращает данные и делает вызов
        const res1 = await UserAPI.byId(1).value();
        expect(res1).toEqual({ id: 1, name: 'User1' });
        expect(testState.userCalls.length).toBe(1);
    });

    await runTest('Method Chaining', async () => {
        // Проверяем цепочку вызовов .byId(2).byId(3)
        const res = await UserAPI.byId(2).byId(3).all();

        // Ожидаем объект с результатами обоих вызовов
        expect(Object.keys(res).length).toBe(2);
        // Проверяем, что физически были вызваны оба метода
        expect(testState.userCalls).toEqual(['byId(2)', 'byId(3)']);
    });

    // --- Группа 2: Кеширование и TTL ---

    await runTest('Cache HIT (Global TTL)', async () => {
        // Вызываем метод 3 раза подряд с одинаковым аргументом
        await UserAPI.byId(10).value();
        await UserAPI.byId(10).value();
        await UserAPI.byId(10).value();

        // Ожидаем, что реальный вызов (сетевой запрос) был ТОЛЬКО ОДИН
        expect(testState.userCalls.length).toBe(1);
        expect(testState.userCalls[0]).toBe('byId(10)');
    });

    await runTest('Cache Expiration (TTL)', async () => {
        // 1. Делаем вызов
        await UserAPI.byId(20).value();
        expect(testState.userCalls.length).toBe(1);

        // 2. Ждем, пока протухнет TTL (2000ms)
        console.log('   ⏳ Ждем истечения TTL (2100ms)...');
        await sleep(2100);

        // 3. Делаем вызов снова
        await UserAPI.byId(20).value();

        // Ожидаем, что кеш сбросился и произошел второй вызов
        expect(testState.userCalls.length).toBe(2);
        expect(testState.userCalls).toEqual(['byId(20)', 'byId(20)']);
    });

    await runTest('@Cacheable override', async () => {
        // heavyStats имеет свой TTL = 3000ms (глобальный = 2000ms)
        await UserAPI.heavyStats('A').value();

        await sleep(2100); // Глобальный истек, но локальный (3000) еще жив
        await UserAPI.heavyStats('A').value();
        expect(testState.userCalls.length).toBe(1); // Все еще 1 вызов (кеш жив)

        await sleep(1000); // 2100 + 1000 = 3100ms total -> теперь протух
        await UserAPI.heavyStats('A').value();
        expect(testState.userCalls.length).toBe(2); // Пошел новый запрос
    });

    await runTest('@NoCache works', async () => {
        // Метод возвращает текущее время. С @NoCache результаты всегда должны быть разными.
        const t1 = await UserAPI.realtime().value();
        await sleep(20);
        const t2 = await UserAPI.realtime().value();
        expect(t1).notToBe(t2);
    });

    // --- Группа 3: Конкурентность и Гонки (Race Conditions) ---

    await runTest('Deduplication (Parallel calls)', async () => {
        // Запускаем 3 запроса ОДНОВРЕМЕННО (Promise.all)
        const p1 = UserAPI.byId(99).value();
        const p2 = UserAPI.byId(99).value();
        const p3 = UserAPI.byId(99).value();

        await Promise.all([p1, p2, p3]);

        // Механизм дедупликации должен объединить их в один промис.
        // Реальный вызов должен быть только 1.
        expect(testState.userCalls.length).toBe(1);
        expect(testState.userCalls[0]).toBe('byId(99)');
    });

    await runTest('Different args do NOT merge', async () => {
        // Запускаем параллельно, но с РАЗНЫМИ аргументами
        const p1 = UserAPI.byId(500).value();
        const p2 = UserAPI.byId(501).value();

        await Promise.all([p1, p2]);

        // Дедупликация не должна сработать, так как ключи кеша разные.
        expect(testState.userCalls.length).toBe(2);

        // Проверяем наличие обоих вызовов
        const str = JSON.stringify(testState.userCalls);
        if (!str.includes('byId(500)') || !str.includes('byId(501)')) {
            throw new Error('Calls missing: ' + str);
        }
    });

    // --- Группа 4: Обработка ошибок ---

    await runTest('Error handling', async () => {
        // 1. Вызываем метод, который падает
        const p1 = UserAPI.errorMethod().value();
        await expect(p1).rejects();

        // Важно: После ошибки кеш должен очиститься для этого ключа.
        // 2. Вызываем снова — он должен снова попытаться выполнить запрос (и снова упасть),
        // а не вернуть "закешированную ошибку" или зависнуть.
        const p2 = UserAPI.errorMethod().value();
        await expect(p2).rejects();
    });
}