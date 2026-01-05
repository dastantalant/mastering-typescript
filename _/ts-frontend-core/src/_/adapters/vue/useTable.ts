// src/adapters/vue/useTable.ts

import { ref, onMounted, onUnmounted, type Ref, computed } from 'vue';
import type {TableController} from "@/_/core/table/TableController.ts";
import type {TableState} from "@/_/core/table/TableTypes.ts";

export function useTable<T>(controller: TableController<T>) {
    const state = ref(controller.getState()) as Ref<TableState<T>>;

    let unsubscribe: () => void;

    onMounted(() => {
        unsubscribe = controller.store.subscribe((newState: any) => {
            state.value = newState;
        });
        controller.load().then(r => r);
    });

    onUnmounted(() => {
        if (unsubscribe) unsubscribe();
    });

    return {
        state,
        items: computed(() => state.value.items),
        total: computed(() => state.value.total),
        loading: computed(() => state.value.loading),
        filters: computed(() => state.value.filters),

        setPage: controller.setPage.bind(controller),
        setPageSize: controller.setPageSize.bind(controller),
        setSort: controller.setSort.bind(controller),
        setFilter: controller.setFilter.bind(controller),
        refresh: controller.refresh.bind(controller),
        clearFilters: controller.clearFilters.bind(controller)
    };
}
