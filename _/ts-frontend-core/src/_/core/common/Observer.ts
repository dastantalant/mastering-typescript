// src/core/common/Observer.ts

export type Listener<T> = (val: T) => void;
export type Unsubscribe = () => void;

export class Observer<T> {
    private readonly listeners = new Set<Listener<T>>();

    subscribe(fn: Listener<T>): Unsubscribe {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    }

    notify(val: T): void {
        this.listeners.forEach(fn => fn(val));
    }
}