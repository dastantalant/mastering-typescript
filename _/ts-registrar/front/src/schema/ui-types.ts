// src/schema/ui-types.ts

export enum FieldType {
    Text = 'text',
    Number = 'number',
    Select = 'select',
    Date = 'date',
    DateRange = 'date-range',
    Tag = 'tag',
    Textarea = 'textarea',
    Actions = 'actions',
    Divider = 'divider',
    Button = 'button',
    DependentSelect = 'dependent-select',
    MultiSelect = 'multiselect'
}

export enum ButtonVariant {
    Text = 'text',
    Outlined = 'outlined',
    Contained = 'contained'
}

export enum Severity {
    Info = 'info',
    Success = 'success',
    Warning = 'warning',
    Danger = 'danger'
}

export interface SelectOption {
    label: string;
    value: any;
    [key: string]: any;
}