// src/utils/Fluent.ts
/**
 * ==========================
 * Fluent API Generator (Thenable / Awaitable)
 * ==========================
 */


export interface FluentOptions {
    caching?: boolean;
    ttl?: number;
    aliases?: Record<string, string>;
    debug?: boolean;
}

// =============================================================================
// Internal State
// =============================================================================

type CacheEntry = {
    data?: any;
    promise?: Promise<any>;
    expires?: number;
};

const instances = new WeakMap<any, any>();
const caches = new WeakMap<any, Map<string, CacheEntry>>();
const cacheableConfig = new WeakMap<any, Map<string, number | undefined>>();
const noCacheMethods = new WeakMap<any, Set<string>>();
const cleanupRegistry = new Set<Map<string, CacheEntry>>();
let globalCleanupTimer: any = null;

// =============================================================================
// Utilities
// =============================================================================

function registerCleanup(map: Map<string, CacheEntry>) {
    if (cleanupRegistry.has(map)) return;
    cleanupRegistry.add(map);

    if (!globalCleanupTimer) {
        globalCleanupTimer = setInterval(() => {
            const now = Date.now();
            if (cleanupRegistry.size === 0) {
                if (globalCleanupTimer) {
                    clearInterval(globalCleanupTimer);
                    globalCleanupTimer = null;
                }
                return;
            }
            for (const cacheMap of cleanupRegistry) {
                for (const [key, entry] of cacheMap.entries()) {
                    if (entry.expires && entry.expires <= now) {
                        cacheMap.delete(key);
                    }
                }
            }
        }, 30_000);
        if (typeof globalCleanupTimer.unref === 'function') globalCleanupTimer.unref();
    }
}

function stableStringify(val: any): string {
    if (val === undefined) return 'u';
    if (val === null) return 'n';
    if (typeof val === 'boolean') return val ? 't' : 'f';
    if (typeof val === 'number') return String(val);
    if (typeof val === 'string') return `"${val}"`;
    if (val instanceof Date) return `D:${val.getTime()}`;
    if (Array.isArray(val)) return `[${val.map(stableStringify).join(',')}]`;
    if (typeof val === 'object') {
        const keys = Object.keys(val).sort();
        return `{${keys.map(k => `${k}:${stableStringify(val[k])}`).join(',')}}`;
    }
    return String(val);
}

function makeCacheKey(methodName: string, args: any[]): string {
    return args.length === 0 ? methodName : `${methodName}(${args.map(stableStringify).join(',')})`;
}

function getSingleton(Ctor: new (...args: any[]) => any) {
    if (!instances.has(Ctor)) {
        instances.set(Ctor, new Ctor());
    }
    return instances.get(Ctor);
}

function getCache(Ctor: any): Map<string, CacheEntry> {
    if (!caches.has(Ctor)) {
        caches.set(Ctor, new Map<string, CacheEntry>());
    }
    return caches.get(Ctor)!;
}

// =============================================================================
// Fluent Executor
// =============================================================================

class FluentExecutor {
    private readonly queue: Array<{
        alias: string;
        realMethod: string;
        args: any[];
        promise: Promise<any>;
    }> = [];

    constructor(
        private readonly targetInstance: any,
        private readonly targetClass: any,
        private readonly options: FluentOptions
    ) {
    }

    get length() {
        return this.queue.length;
    }

    add(alias: string, args: any[]) {
        const realMethodName = this.options.aliases?.[alias] ?? alias;

        let method: Function | undefined;
        let context: any;

        if (typeof this.targetClass[realMethodName] === 'function') {
            method = this.targetClass[realMethodName];
            context = this.targetClass;
        } else if (typeof this.targetInstance[realMethodName] === 'function') {
            method = this.targetInstance[realMethodName];
            context = this.targetInstance;
        }

        if (!method) {
            console.warn(`[Fluent] Method "${alias}" not found`);
            return;
        }

        const methodConfigs = cacheableConfig.get(this.targetClass);
        const specificTTL = methodConfigs?.get(realMethodName);
        const isExplicitlyCached = methodConfigs?.has(realMethodName);
        const noCacheSet = noCacheMethods.get(this.targetClass);
        const isNoCache = noCacheSet?.has(realMethodName);

        const shouldCache = !isNoCache && (this.options.caching || isExplicitlyCached);
        const finalTTL = specificTTL ?? this.options.ttl;

        const cache = shouldCache ? getCache(this.targetClass) : null;
        const key = shouldCache ? makeCacheKey(realMethodName, args) : '';

        if (cache && finalTTL && finalTTL !== Infinity) registerCleanup(cache);

        const taskPromise = (async () => {
            if (cache) {
                const entry = cache.get(key);
                if (entry) {
                    if (entry.data !== undefined && (!entry.expires || entry.expires > Date.now())) {
                        if (this.options.debug) console.log(`[Fluent] HIT: ${key}`);
                        return entry.data;
                    }
                    if (entry.promise) return entry.promise;
                }
            }

            try {
                const resultPromise = method!.apply(context, args);
                if (cache) cache.set(key, {promise: resultPromise});

                const result = await resultPromise;

                if (cache) {
                    cache.set(key, {
                        data: result,
                        expires: (finalTTL && finalTTL !== Infinity) ? Date.now() + finalTTL : undefined,
                        promise: undefined
                    });
                }
                return result;
            } catch (error) {
                if (cache) cache.delete(key);
                throw error;
            }
        })();

        this.queue.push({alias, realMethod: realMethodName, args, promise: taskPromise});
    }

    async executeAll(): Promise<Record<string, any>> {
        const results = await Promise.all(this.queue.map(q => q.promise));
        const output: Record<string, any> = {};
        this.queue.forEach((item, index) => {
            if (!Object.prototype.hasOwnProperty.call(output, item.alias)) {
                output[item.alias] = results[index];
            } else {
                output[`${item.alias}:${stableStringify(item.args)}`] = results[index];
            }
        });
        return output;
    }

    async executeLast(): Promise<any> {
        if (this.queue.length === 0) return undefined;
        return this.queue[this.queue.length - 1].promise;
    }
}

// =============================================================================
// Decorators
// =============================================================================

export function Fluent(options: FluentOptions = {}) {
    return function <T extends new (...args: any[]) => any>(TargetClass: T): T {
        return new Proxy(TargetClass, {
            get(target, prop, receiver) {
                if (prop === '$reset') {
                    return () => {
                        const cache = caches.get(TargetClass);
                        if (cache) cache.clear();
                    };
                }

                if (prop === 'prototype' || prop === 'name' || prop === 'length') {
                    return Reflect.get(target, prop, receiver);
                }

                const staticValue = Reflect.get(target, prop, receiver);
                if (staticValue !== undefined && typeof staticValue !== 'function') {
                    return staticValue;
                }

                const instance = getSingleton(TargetClass);
                const executor = new FluentExecutor(instance, TargetClass, options);

                const chainProxy = new Proxy(executor, {
                    get(targetExecutor, chainProp: string | symbol) {
                        if (chainProp === 'then') {
                            return (resolve: any, reject: any) => {
                                if (targetExecutor.length > 1) {
                                    targetExecutor.executeAll().then(resolve, reject);
                                } else {
                                    targetExecutor.executeLast().then(resolve, reject);
                                }
                            };
                        }

                        if (chainProp === 'all') return () => targetExecutor.executeAll();
                        if (chainProp === 'value') return () => targetExecutor.executeLast();
                        if (chainProp === 'catch') return (onRejected: any) => targetExecutor.executeLast().catch(onRejected);
                        if (chainProp === 'finally') return (onFinally: any) => targetExecutor.executeLast().finally(onFinally);

                        return (...args: any[]) => {
                            targetExecutor.add(String(chainProp), args);
                            return chainProxy;
                        };
                    }
                });

                if (typeof prop === 'string') {
                    return (...args: any[]) => {
                        // @ts-ignore
                        chainProxy[prop](...args);
                        return chainProxy;
                    };
                }

                return undefined;
            }
        });
    };
}

export const Cacheable = (ttl?: number) => (target: any, propertyKey: string | any) => {
    const name = typeof propertyKey === 'string' ? propertyKey : propertyKey.name;
    const Ctor = target.constructor;
    const storageKey = typeof target === 'function' ? target : Ctor;
    if (!cacheableConfig.has(storageKey)) cacheableConfig.set(storageKey, new Map());
    cacheableConfig.get(storageKey)!.set(name, ttl);
};

export const NoCache = () => (target: any, propertyKey: string | any) => {
    const name = typeof propertyKey === 'string' ? propertyKey : propertyKey.name;
    const Ctor = target.constructor;
    const storageKey = typeof target === 'function' ? target : Ctor;
    if (!noCacheMethods.has(storageKey)) noCacheMethods.set(storageKey, new Set());
    noCacheMethods.get(storageKey)!.add(name);
};

// =============================================================================
// Types
// =============================================================================

type UnboxPromise<T> = T extends Promise<infer U> ? U : T;

export type FluentChain<T, Acc = {}> = {
    [K in keyof T]: T[K] extends (...args: infer A) => infer R
        ? (...args: A) =>
            FluentChain<T, Acc & { [P in K]: UnboxPromise<R> }> &
            Promise<
                keyof Acc extends never
                    ? UnboxPromise<R>
                    : Acc & { [P in K]: UnboxPromise<R> }
            >
        : never;
} & {
    all(): Promise<Acc>;
    $reset(): void;
};

export type FluentService<T, C> = FluentChain<T> & C;