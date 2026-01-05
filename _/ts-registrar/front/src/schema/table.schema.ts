// src/schema/table.schema.ts

import type { FieldType, Severity } from "./ui-types";

export enum ColumnPin { Left = 'left', Right = 'right' }

export interface FilterConfig {
    type: FieldType;
    options?: any[];
    props?: Record<string, any>;
}

export interface CellRenderer {
    type: FieldType;
    props?: Record<string, any> | ((data: any) => Record<string, any>);
    actions?: RowAction[];
}

export interface RowAction {
    action: string;
    icon?: string;
    severity?: Severity;
    tooltip?: string;
    isVisible?: string | ((data: any) => boolean);
}

export interface TableColumn {
    field?: string;
    header: string;
    pin?: ColumnPin;
    style?: string;
    sortable?: boolean;
    filter?: FilterConfig;
    renderer?: CellRenderer;
}

export interface TableToolbarAction {
    label?: string;
    icon?: string;
    variant?: any;
    action: string;
}

export interface TableConfig {
    title: string;
    dataKey: string;
    toolbar?: TableToolbarAction[];
    columns: TableColumn[];
}