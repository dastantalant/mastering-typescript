// src/core/table/TableTypes.ts

export interface TableFetchParams {
    page: number;
    size: number;
    filters: Record<string, any>;
    sortField?: string;
    sortOrder?: 1 | -1 | 0; // 1 = asc, -1 = desc
}

export interface TableFetchResult<T> {
    items: T[];
    total: number;
}

export interface TableState<T> {
    items: T[];
    total: number;
    loading: boolean;
    page: number;
    size: number;
    filters: Record<string, any>;
    sort: {
        field?: string;
        order?: 1 | -1 | 0;
    };
    error: string | null;
}