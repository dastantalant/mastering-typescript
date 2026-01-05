import { defineStore } from 'pinia';

export const useSubscriberStore = defineStore('subscriber', {
    state: () => ({
        current: null as any
    }),
    actions: {
        setCurrent(subscriber: any) {
            this.current = subscriber;
        },
        clearCurrent() {
            this.current = null;
        }
    },
});