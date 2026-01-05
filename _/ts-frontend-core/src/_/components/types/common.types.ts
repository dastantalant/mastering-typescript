// src/components/types/common.types.ts

export enum UIComponent {
    Text = 'Text',
    Date = 'Date',
    Tag = 'Tag',
    Button = 'Button',
    Icon = 'Icon',
    Avatar = 'Avatar',
    Actions = 'Actions',
}

export enum Severity {
    Info = 'info',
    Success = 'success',
    Warning = 'warning',
    Danger = 'danger',
    Secondary = 'secondary',
    Contrast = 'contrast',
    Help = 'help',
}

export enum ColumnPin {
    Left = 'left',
    Right = 'right',
}

export enum ButtonType {
    Button = 'button',
    Submit = 'submit',
    Reset = 'reset',
}

export enum FilterType {
    Text = 'text',
    Numeric = 'numeric',
    Select = 'select',
    Date = 'date',
    DateRange = 'dateRange',
}

export enum ToolbarPosition {
    Start = 'start',
    End = 'end',
}

export enum ButtonVariant {
    Text = 'text',
    Outlined = 'outlined',
    Filled = 'filled',
}


export type Source<TData, TValue> =
    | TValue
    | string
    | ((data: TData) => TValue | never);

export type PropMapper<TData, TProps> = {
    [K in keyof TProps]?: Source<TData, TProps[K]>;
};

export interface FetchDataParams {
    page: number;
    rows: number;
    sortField?: string;
    sortOrder?: 1 | -1 | 0 | null;
    filters: Record<string, never>;
}

export interface FetchDataResult<TData = never> {
    items: TData[];
    totalRecords: number;
}
