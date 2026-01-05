// src/components/datatable/useDataTable.ts
import {ref, onMounted, type Ref} from 'vue';
import {useDebounceFn} from '@vueuse/core';
import type {DataTablePageEvent, DataTableSortEvent} from 'primevue/datatable';
import {FilterMatchMode} from '@primevue/core/api';
import {
    type ColumnDefinition,
    type FetchDataParams,
    type FetchDataResult, type FilterConfig,
    FilterType, type IFilterBuilder,
    UIComponent
} from "../types/datatable.types.ts";

export interface UseDataTableProps<TData = any> {
    columns: ColumnDefinition<TData>[];
    fetchDataFunction?: (params: FetchDataParams) => Promise<FetchDataResult<TData>>;
    initialData?: TData[];
}

export function useDataTable<TData extends Record<string, any> = any>(props: UseDataTableProps<TData>) {
    const loading = ref(false);
    const items = ref<TData[]>([]) as Ref<TData[]>;
    const totalRecords = ref(0);
    const filterErrors = ref<Record<string, string>>({});

    const lazyParams = ref({
        first: 0,
        rows: 10,
        sortField: undefined as string | undefined,
        sortOrder: undefined as 1 | -1 | undefined,
    });

    const resolveFilterConfig = (col: ColumnDefinition): FilterConfig | null => {
        if (!col.filter) return null;

        if (typeof (col.filter as any).build === 'function') {
            return (col.filter as IFilterBuilder).build();
        }

        if (typeof col.filter === 'object') {
            return col.filter as FilterConfig;
        }

        if (col.filter) {
            if (col.renderer?.type === UIComponent.Date) {
                const format = (col.renderer.props as any)?.format || 'dd.mm.yy';
                return {type: FilterType.Date, format};
            }
            return {type: FilterType.Text};
        }

        return null;
    };

    const initFilters = () => {
        const f: Record<string, { value: any, matchMode: string }> = {};
        for (const col of props.columns) {
            if (!col.field) continue;
            const config = resolveFilterConfig(col);
            if (!config) continue;
            let matchMode;
            switch (config.type) {
                case FilterType.Select:
                    matchMode = FilterMatchMode.EQUALS;
                    break;
                case FilterType.Date:
                case FilterType.DateRange:
                    matchMode = FilterMatchMode.BETWEEN;
                    break;
                case FilterType.Numeric:
                    matchMode = FilterMatchMode.EQUALS;
                    break;
                case FilterType.Text:
                default:
                    matchMode = FilterMatchMode.CONTAINS;
                    break;
            }
            f[col.field] = {value: null, matchMode};
        }
        return f;
    };

    const filters = ref(initFilters());

    const validateFilter = (field: string, value: any): boolean => {
        const col = props.columns.find(c => c.field === field);
        if (!col) {
            filterErrors.value[field] = '';
            return true;
        }

        const config = resolveFilterConfig(col);
        const validation = config?.validation;

        if (!validation) {
            filterErrors.value[field] = '';
            return true;
        }

        if (validation.required && isEmpty(value)) {
            return setErrorAndReturn(field, 'Поле обязательно');
        }

        if (validation.pattern && !isEmpty(value)) {
            const regex = getRegex(validation.pattern);
            if (!regex.test(String(value))) {
                return setErrorAndReturn(field, 'Неверный формат');
            }
        }

        if (typeof value === 'number') {
            if (hasMin(validation) && value < validation.min) {
                return setErrorAndReturn(field, `Минимум: ${validation.min}`);
            }
            if (hasMax(validation) && value > validation.max) {
                return setErrorAndReturn(field, `Максимум: ${validation.max}`);
            }
        }

        filterErrors.value[field] = '';
        return true;
    };

    const isEmpty = (v: any): boolean => v === null || v === undefined || v === '';

    const getRegex = (pattern: string | RegExp): RegExp => {
        if (pattern instanceof RegExp) return pattern;

        try {
            return new RegExp(pattern);
        } catch (e: any) {
            console.error(e.message, e.stack);
            console.warn(`Invalid regex pattern for field: ${pattern}`);
            return /.*/;
        }
    };

    const hasMin = (v: any): v is { min: number } => v.min !== undefined && v.min !== null;

    const hasMax = (v: any): v is { max: number } => v.max !== undefined && v.max !== null;

    const setErrorAndReturn = (field: string, message: string): false => {
        filterErrors.value[field] = message;
        return false;
    };

    const getFilterValues = () => {
        return Object.entries(filters.value).reduce((acc, [key, filter]: [string, any]) => {
            acc[key] = filter.value;
            return acc;
        }, {} as Record<string, any>);
    };

    const loadData = async () => {
        if (props.initialData && props.initialData.length > 0) {
            items.value = props.initialData;
            totalRecords.value = props.initialData.length;
            return;
        }
        if (!props.fetchDataFunction) return;
        const isValid = props.columns.every(col => {
            if (!col.filter) return true;
            if (!col.field) return true;
            return validateFilter(col.field, filters.value[col.field]?.value);
        });
        if (!isValid) return;
        loading.value = true;
        try {
            const params: FetchDataParams = {
                page: Math.floor(lazyParams.value.first / lazyParams.value.rows),
                rows: lazyParams.value.rows,
                sortField: lazyParams.value.sortField,
                sortOrder: lazyParams.value.sortOrder,
                filters: getFilterValues(),
            };

            const result = await props.fetchDataFunction(params);
            items.value = result.items;
            totalRecords.value = result.totalRecords;
        } catch (error) {
            console.error("DataTable Load Error:", error);
            items.value = [];
            totalRecords.value = 0;
        } finally {
            loading.value = false;
        }
    };

    const debouncedLoad = useDebounceFn(() => {
        lazyParams.value.first = 0;
        loadData().then(r => r);
    }, 400);

    const onFilterInput = (field: string, value: any) => {
        if (validateFilter(field, value)) {
            debouncedLoad().then(r => r);
        }
    };

    const clearAllFilters = () => {
        filters.value = initFilters();
        debouncedLoad().then(r => r);
    };

    const onPage = (e: DataTablePageEvent) => {
        lazyParams.value.first = e.first;
        lazyParams.value.rows = e.rows;
        loadData().then(r => r);
    };

    const onSort = (e: DataTableSortEvent) => {
        lazyParams.value.sortField = e.sortField as string;
        lazyParams.value.sortOrder = e.sortOrder as 1 | -1;
        loadData().then(r => r);
    };

    const refresh = () => loadData();

    onMounted(() => {
        loadData().then(r => r);
    });

    return {
        loading, items, totalRecords, filters, filterErrors, lazyParams,
        onPage, onSort, onFilterInput, clearAllFilters, refresh, getFilterValues,
        resolveFilterConfig
    };
}