// src/components/types/datatable.types.ts

import {ButtonVariant, type ColumnPin, Severity, ToolbarPosition} from "./common.types.ts";
import type {FilterConfig, IFilterBuilder} from "./filter.types.ts";
import type {CellRendererSchema} from "./renderer.types.ts";


export * from './common.types.ts';
export * from './renderer.types.ts';
export * from './filter.types.ts';

export enum SystemCommand {
    ClearFilters = 'clear-filters'
}
export interface DataTableContext<TData = never> {
    source: 'row' | 'toolbar';
    data?: TData;
    filters: Record<string, never>;
    items: TData[];
    totalRecords: number;
    refresh: () => void;
}
export type CommandHandler<TData = never> = (ctx: DataTableContext<TData>) => void;

export interface TableContext<TData = never> {
    filters: Record<string, never>;
    items: TData[];
    totalRecords: number;
}

export type ToolbarCallback<TData> = (context: TableContext<TData>) => boolean;

export type ActionCommand = SystemCommand |  string | ((ctx: TableContext) => void);

export interface ToolbarAction<TData = never> {
    label?: string;
    icon?: string;
    severity?: Severity | string;
    variant?: ButtonVariant;
    position?: ToolbarPosition;

    action: ActionCommand;
    disabled?: boolean | ToolbarCallback<TData>;
    show?: boolean | ToolbarCallback<TData>;
}

export interface ColumnDefinition<TData = never> {
    field?: string;
    header?: string;
    sortable?: boolean;
    style?: string | object;
    class?: string;
    pin?: ColumnPin;
    filter?: FilterConfig | boolean | IFilterBuilder;
    renderer?: CellRendererSchema<TData>;
}

export interface DataTableConfig<TData = never> {
    title?: string;
    dataKey?: string;

    columns: ColumnDefinition<TData>[];

    defaultStyle?: never;
    defaultClass?: never;
    toolbar?: ToolbarAction<TData>[];
}

export function defineTableConfig<TData>(config: DataTableConfig<TData>): DataTableConfig<TData> {
    return config;
}
