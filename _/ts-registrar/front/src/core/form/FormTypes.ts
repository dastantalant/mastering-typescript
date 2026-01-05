// src/core/form/FormTypes.ts

export interface FormContext<T> {
    values: T;
    original: T;
    isEditing: boolean;
}

export interface FormFieldConfig<T> {
    field: keyof T | string;

    defaultValue?: any;

    masterField?: string;

    required?: boolean | string;
    requiredCondition?: (ctx: FormContext<T>) => boolean;

    validator?: (value: any, ctx: FormContext<T>) => string | null | undefined;
    pattern?: RegExp;
    patternMessage?: string;

    displayCondition?: (ctx: FormContext<T>) => boolean;
    disabledCondition?: (ctx: FormContext<T>) => boolean;

    onChange?: (newValue: any, ctx: FormContext<T>) => void;
}

export interface FormState<T> {
    values: T;
    errors: Record<string, string>;
    isValid: boolean;
    isDirty: boolean;
    isSubmitting: boolean;
    visibleFields: string[];
}