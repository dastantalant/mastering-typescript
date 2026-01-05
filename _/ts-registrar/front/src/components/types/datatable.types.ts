// src/components/types/datatable.types.ts

import {ButtonVariant, type ColumnPin, Severity, ToolbarPosition} from "./common.types.ts";
import type {FilterConfig, IFilterBuilder} from "./filter.types.ts";
import type {CellRendererSchema} from "./renderer.types.ts";


export * from './common.types';
export * from './renderer.types';
export * from './filter.types';

export enum SystemCommand {
    ClearFilters = 'clear-filters'
}
export interface DataTableContext<TData = any> {
    source: 'row' | 'toolbar';
    data?: TData;
    filters: Record<string, any>;
    items: TData[];
    totalRecords: number;
    refresh: () => void;
}
export type CommandHandler<TData = any> = (ctx: DataTableContext<TData>) => void;

export interface TableContext<TData = any> {
    filters: Record<string, any>;
    items: TData[];
    totalRecords: number;
}

export type ToolbarCallback<TData> = (context: TableContext<TData>) => boolean;

export type ActionCommand = SystemCommand |  string | ((ctx: TableContext) => void);

export interface ToolbarAction<TData = any> {
    label?: string;
    icon?: string;
    severity?: Severity | string;
    variant?: ButtonVariant;
    position?: ToolbarPosition;

    action: ActionCommand;
    disabled?: boolean | ToolbarCallback<TData>;
    show?: boolean | ToolbarCallback<TData>;
}

export interface ColumnDefinition<TData = any> {
    field?: string;
    header?: string;
    sortable?: boolean;
    style?: string | object;
    class?: string;
    pin?: ColumnPin;
    filter?: FilterConfig | boolean | IFilterBuilder;
    renderer?: CellRendererSchema<TData>;
}

export interface DataTableConfig<TData = any> {
    title?: string;
    dataKey?: string;

    columns: ColumnDefinition<TData>[];

    defaultStyle?: any;
    defaultClass?: any;
    toolbar?: ToolbarAction<TData>[];
}

export function defineTableConfig<TData>(config: DataTableConfig<TData>): DataTableConfig<TData> {
    return config;
}