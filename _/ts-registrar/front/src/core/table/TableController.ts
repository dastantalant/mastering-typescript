// src/core/table/TableController.ts

import { Observer } from "../common/Observer";
import type { TableState, TableFetchParams, TableFetchResult } from "./TableTypes";

export class TableController<T> {
    private state: TableState<T>;

    public store = new Observer<TableState<T>>();

    constructor(
        private readonly fetcher: (params: TableFetchParams) => Promise<TableFetchResult<T>>,
        initialState?: Partial<TableState<T>>
    ) {
        this.state = {
            items: [],
            total: 0,
            loading: false,
            page: 0,
            size: 10,
            filters: {},
            sort: {},
            error: null,
            ...initialState
        };
    }

    getState(): TableState<T> {
        return { ...this.state };
    }

    async load() {
        this.update({ loading: true, error: null });

        try {
            const params: TableFetchParams = {
                page: this.state.page,
                size: this.state.size,
                filters: this.state.filters,
                sortField: this.state.sort.field,
                sortOrder: this.state.sort.order
            };

            const result = await this.fetcher(params);

            this.update({
                items: result.items,
                total: result.total,
                loading: false
            });
        } catch (error: any) {
            console.error('[TableController] Load Error:', error);
            this.update({
                loading: false,
                items: [],
                total: 0,
                error: error.message || 'Ошибка загрузки данных'
            });
        }
    }

    setPage(page: number) {
        this.update({ page });
        this.load().then(r => r);
    }

    setPageSize(size: number) {
        this.update({ size, page: 0 }); 
        this.load().then(r => r);
    }

    setFilter(key: string, value: any) {
        const newFilters = { ...this.state.filters };

        if (value === null || value === undefined || value === '') {
            delete newFilters[key];
        } else {
            newFilters[key] = value;
        }

        this.update({ filters: newFilters, page: 0 });
        this.load().then(r => r);
    }

    clearFilters() {
        this.update({ filters: {}, page: 0 });
        this.load().then(r => r);
    }

    setSort(field: string, order: 1 | -1 | 0) {
        this.update({ sort: { field, order } });
        this.load().then(r => r);
    }

    refresh() {
        this.load().then(r => r);
    }

    private update(partial: Partial<TableState<T>>) {
        this.state = { ...this.state, ...partial };
        this.store.notify(this.state);
    }
}