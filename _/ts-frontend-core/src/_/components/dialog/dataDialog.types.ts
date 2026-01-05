// src/components/dialog/dataDialog.types.ts

import type {Ref} from 'vue';
import {ActionVisibility, FieldType, MessageSeverity} from "./dataEditor.enums.ts";

export type {MessageSeverity} from './dataEditor.enums.ts';

export interface TopMessage {
    text: string;
    severity: MessageSeverity;
}

export interface Photo {
    id: string;
    name: string;
    type: string;
    url?: string;
}

export interface SelectOption {
    label: never;
    value: never;
    [key: string]: never;
}

export interface DialogContext<T extends Record<string, never>> {
    formData: T;
    editData: Ref<T>;
    isEditing: Ref<boolean>;
}

export interface DialogAction<T extends Record<string, never>> {
    label: string;
    icon?: string;
    class?: string;
    visible?: ActionVisibility | ((context: DialogContext<T>) => boolean);
    action: (context: DialogContext<T>) => void;
}

export type Divider<T extends Record<string, never>> = {
    type: FieldType.Divider;
    label?: string;
    displayCondition?: (context: DialogContext<T>) => boolean;
};
export type FormButton<T extends Record<string, never>> = {
    type: FieldType.Button;
    label: string;
    icon?: string;
    class?: string;
    action: (context: DialogContext<T>) => void;
    displayCondition?: (context: DialogContext<T>) => boolean;
    disabledCondition?: (context: DialogContext<T>) => boolean;
    loadingCondition?: (context: DialogContext<T>) => boolean;
};

interface BaseField<T extends Record<string, never>> {
    field: string;
    label: string;
    defaultValue?: never;
    required?: boolean | string;
    requiredCondition?: (context: DialogContext<T>) => boolean;
    disabled?: boolean;
    editable?: boolean;
    displayCondition?: (context: DialogContext<T>) => boolean;
    disabledCondition?: (context: DialogContext<T>) => boolean;
    onChange?: (newValue: never, context: DialogContext<T>) => void;
    validation?: {
        pattern?: RegExp;
        patternMessage?: string;
        min?: number;
        minMessage?: string;
        max?: number;
        maxMessage?: string;
        len?: number;
        lenMessage?: string;
        validator?: (newValue: never, context: DialogContext<T>) => string | null | undefined;
    };
    warning?: (newValue: never, context: DialogContext<T>) => string | null | undefined;
    // NEW: Allow passing raw props to the underlying PrimeVue component
    props?: Record<string, never> | ((ctx: DialogContext<T>) => Record<string, never>);
}

export type FormField<T extends Record<string, never>> = BaseField<T> & (
    { type: FieldType.Textarea, autoResize?: boolean, rows?: number } |
    { type: FieldType.Text | FieldType.Number | FieldType.Tag } |
    { type: FieldType.Date, dateFormat?: string, showTime?: boolean } |
    {
        type: FieldType.Select | FieldType.Dropdown | FieldType.MultiSelect;
        options: (string | SelectOption)[];
        optionLabel?: string;
        optionValue?: string;
        filter?: boolean;
        showClear?: boolean;
    } |
    {
        type: FieldType.DependentSelect;
        masterField: string;
        options: Record<string, (string | SelectOption)[]>;
        optionLabel?: string;
        optionValue?: string;
        showClear?: boolean;
    }
    );

export interface DialogConfig<T extends Record<string, never>> {
    title: string | number;
    fields: (FormField<T> | Divider<T> | FormButton<T>)[];
    photos?: Photo[];
    extraActions?: DialogAction<T>[];
    isRecordEditable?: boolean;
    onBeforeEdit?: (context: DialogContext<T>) => Promise<T | void>;
}
export interface DataEditorDialogProps<T extends Record<string, never>> {
    visible: boolean;
    loading?: boolean;
    topMessage?: TopMessage | null;
    config: DialogConfig<T>;
    initialData?: T;
}
