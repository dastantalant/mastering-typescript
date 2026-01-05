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
    label: string;
    value: any;
    [key: string]: any;
}

export interface DialogContext<T extends Record<string, any>> {
    formData: T;
    editData: Ref<T>;
    isEditing: Ref<boolean>;
}

export interface DialogAction<T extends Record<string, any>> {
    label: string;
    icon?: string;
    class?: string;
    visible?: ActionVisibility | ((context: DialogContext<T>) => boolean);
    action: (context: DialogContext<T>) => void;
}

export type Divider<T extends Record<string, any>> = {
    type: FieldType.Divider;
    label?: string;
    displayCondition?: (context: DialogContext<T>) => boolean;
};
export type FormButton<T extends Record<string, any>> = {
    type: FieldType.Button;
    label: string;
    icon?: string;
    class?: string;
    action: (context: DialogContext<T>) => void;
    displayCondition?: (context: DialogContext<T>) => boolean;
    disabledCondition?: (context: DialogContext<T>) => boolean;
    loadingCondition?: (context: DialogContext<T>) => boolean;
};

interface BaseField<T extends Record<string, any>> {
    field: string;
    label: string;
    defaultValue?: any;
    required?: boolean | string;
    requiredCondition?: (context: DialogContext<T>) => boolean;
    disabled?: boolean;
    editable?: boolean;
    displayCondition?: (context: DialogContext<T>) => boolean;
    disabledCondition?: (context: DialogContext<T>) => boolean;
    onChange?: (newValue: any, context: DialogContext<T>) => void;
    validation?: {
        pattern?: RegExp;
        patternMessage?: string;
        min?: number;
        minMessage?: string;
        max?: number;
        maxMessage?: string;
        len?: number;
        lenMessage?: string;
        validator?: (newValue: any, context: DialogContext<T>) => string | null | undefined;
    };
    warning?: (newValue: any, context: DialogContext<T>) => string | null | undefined;
    // NEW: Allow passing raw props to the underlying PrimeVue component
    props?: Record<string, any> | ((ctx: DialogContext<T>) => Record<string, any>);
}

export type FormField<T extends Record<string, any>> = BaseField<T> & (
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

export interface DialogConfig<T extends Record<string, any>> {
    title: string | number;
    fields: (FormField<T> | Divider<T> | FormButton<T>)[];
    photos?: Photo[];
    extraActions?: DialogAction<T>[];
    isRecordEditable?: boolean;
    onBeforeEdit?: (context: DialogContext<T>) => Promise<T | void>;
}
export interface DataEditorDialogProps<T extends Record<string, any>> {
    visible: boolean;
    loading?: boolean;
    topMessage?: TopMessage | null;
    config: DialogConfig<T>;
    initialData?: T;
}
