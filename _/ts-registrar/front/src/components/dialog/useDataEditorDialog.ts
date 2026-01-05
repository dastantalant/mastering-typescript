// src/components/dataEditor/useDataEditorDialog.ts

import { ref, computed, watch } from 'vue';
import { DateTime } from 'luxon';
import { DefaultMessages, FieldType } from "./dataEditor.enums.ts";
import type { DataEditorDialogProps, FormField, DialogContext } from "./dataDialog.types.ts";

export function useDataEditorDialog<T extends Record<string, any>>(
    props: DataEditorDialogProps<T>,
    emit: (event: 'update:visible' | 'save' | 'cancel', ...args: any[]) => void
) {
    const isEditing = ref(false);
    const formData = ref<T>({} as T);
    const editData = ref<T>({} as T);
    const errors = ref<Record<string, string>>({});
    const warnings = ref<Record<string, string>>({});
    const isStartingEdit = ref(false);

    const isRecordEditable = computed(() => props.config.isRecordEditable ?? true);

    const formFieldsOnly = computed(() => {
        return props.config.fields.filter((f) => f.type !== FieldType.Divider && f.type !== FieldType.Button) as FormField<T>[];
    });

    const getContext = (): DialogContext<T> => ({
        editData: editData.value,
        formData: formData.value,
        isEditing: isEditing,
    });

    const applyDefaults = (data: T): T=> {
        const result = structuredClone(data) as Record<string, any>;
        for (const field of formFieldsOnly.value) {
            if (field.defaultValue !== undefined && (result[field.field] === undefined || result[field.field] === null)) {
                result[field.field] = typeof field.defaultValue === 'function'
                    ? field.defaultValue()
                    : structuredClone(field.defaultValue);
            }
        }
        return result as T;
    };

    watch(() => props.initialData, (newData) => {
        const baseData = newData ? structuredClone(newData) : {} as T;
        formData.value = applyDefaults(baseData);
    }, { immediate: true, deep: true });

    watch(() => props.visible, (isVisible) => {
        if (!isVisible) {
            isEditing.value = false;
        }
    });

    const validateField = (fieldDef: FormField<T>): boolean => {
        const { field, label, validation } = fieldDef;
        const value = editData.value[field];
        let error = '';

        const isRequired = fieldDef.required && (!fieldDef.requiredCondition || fieldDef.requiredCondition(getContext()));

        if (isRequired && (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0))) {
            error = typeof fieldDef.required === 'string' ? fieldDef.required : DefaultMessages.RequiredField.replace('{label}', label);
        }
        else if (value !== null && value !== undefined && value !== '') {
            if (validation) {
                if (validation.validator) {
                    const customError = validation.validator(value, getContext());
                    if (customError) error = customError;
                }
                if (!error) {
                    if (validation.pattern && !validation.pattern.test(String(value))) {
                        error = validation.patternMessage || DefaultMessages.InvalidFormat;
                    } else if (validation.len !== undefined && String(value).length !== validation.len) {
                        error = validation.lenMessage || DefaultMessages.LengthMustBe.replace('{label}', label).replace('{len}', String(validation.len));
                    } else if (typeof value === 'number') {
                        if (validation.min !== undefined && value < validation.min) {
                            error = validation.minMessage || DefaultMessages.MinLength.replace('{min}', String(validation.min));
                        } else if (validation.max !== undefined && value > validation.max) {
                            error = validation.maxMessage || DefaultMessages.MaxLength.replace('{max}', String(validation.max));
                        }
                    }
                }
            }
        }

        if (error) {
            errors.value[field] = error;
            return false;
        } else {
            delete errors.value[field];
            return true;
        }
    };

    const checkFieldWarning = (fieldDef: FormField<T>): void => {
        const { field, warning } = fieldDef;
        if (!warning) {
            delete warnings.value[field];
            return;
        }
        const value = editData.value[field];
        const warningMessage = warning(value, getContext());
        if (warningMessage) {
            warnings.value[field] = warningMessage;
        } else {
            delete warnings.value[field];
        }
    };

    const revalidateAllFields = () => {
        for (const field of formFieldsOnly.value) {
            validateField(field);
            checkFieldWarning(field);
        }
    };

    const handleFieldBlur = (fieldDef: FormField<T>) => {
        validateField(fieldDef);
        checkFieldWarning(fieldDef);
    };

    const onFieldValueUpdate = (fieldDef: FormField<T>, newValue: any) => {
        validateField(fieldDef);
        checkFieldWarning(fieldDef);

        for (const field of formFieldsOnly.value) {
            if (field.type === FieldType.DependentSelect && field.masterField === fieldDef.field) {
                editData.value[field.field] = null;
                validateField(field);
            }
        }

        if (fieldDef.onChange) {
            fieldDef.onChange(newValue, getContext());
        }
    };

    const validateForm = () => {
        let isValid = true;
        for (const field of formFieldsOnly.value) {
            if (isEditing.value && field.editable !== false) {
                const isDisplayed = !field.displayCondition || field.displayCondition(getContext());
                if (isDisplayed && !validateField(field)) {
                    isValid = false;
                }
            }
        }
        return isValid;
    };

    const startEditing = async () => {
        if (isStartingEdit.value) return;
        isStartingEdit.value = true;
        try {
            let dataForEditing = formData.value;
            if (props.config.onBeforeEdit) {
                const updatedData = await props.config.onBeforeEdit(getContext());
                if (updatedData) {
                    formData.value = structuredClone(updatedData);
                    dataForEditing = updatedData;
                }
            }
            editData.value = structuredClone(dataForEditing);
            isEditing.value = true;
            for (const field of formFieldsOnly.value) {
                checkFieldWarning(field)
            }
            validateForm();
        } catch (error) {
            console.error('Editing start error:', error);
        } finally {
            isStartingEdit.value = false;
        }
    };

    const cancelEditing = () => {
        isEditing.value = false;
        errors.value = {};
        warnings.value = {};
        editData.value = {} as T;
    };

    const handleSave = () => {
        if (validateForm()) {
            emit('save', getContext());
        }
    };

    const handleClose = () => {
        emit('cancel');
        emit('update:visible', false);
    };

    const isSaveDisabled = computed(() => {
        if (!isEditing.value) return false;
        if (Object.keys(errors.value).length > 0) return true;
        return false;
    });

    const dependentOptions = computed(() => {
        if (!formData.value) return {};
        const result: Record<string, any> = {};
        for (const field of formFieldsOnly.value) {
            if (field.type === FieldType.DependentSelect) {
                const masterValue = editData.value[field.masterField];
                result[field.field] = masterValue ? field.options[masterValue] || [] : [];
            }
        }
        return result;
    });

    const displayData = computed(() => {
        if (!formData.value) return {};
        const result: Record<string, any> = {...formData.value};

        for (const field of formFieldsOnly.value) {
            const value = formData.value[field.field];
            if (value === undefined || value === null || value === '' || value === 'null') {
                result[field.field] = DefaultMessages.Empty;
                continue;
            }

            if ([FieldType.Select, FieldType.Dropdown, FieldType.DependentSelect].includes(field.type)) {
                let options: any[] = [];
                if (field.type === FieldType.DependentSelect) {
                    const masterVal = formData.value[field.masterField];
                    options = masterVal ? field.options[masterVal] || [] : [];
                } else {
                    options = (field as any).options || [];
                }

                const valKey = (field as any).optionValue || 'value';
                const lblKey = (field as any).optionLabel || 'label';

                const found = options.find((opt: any) => (typeof opt === 'object' ? opt[valKey] === value : opt === value));
                if (found) {
                    result[field.field] = typeof found === 'object' ? found[lblKey] : found;
                }
            }
            else if (field.type === FieldType.Date && value) {
                try {
                    const fmt = (field as any).dateFormat ? (field as any).dateFormat.replace('yyyy', 'yy').replace('MM', 'mm') : 'dd.MM.yyyy';
                    const time = (field as any).showTime ? ' HH:mm' : '';
                    result[field.field] = DateTime.fromISO(value).toFormat(fmt + time);
                } catch { result[field.field] = value; }
            }
        }
        return result;
    });

    const isFieldDisabled = (field: FormField<T>): boolean => {
        if (!isEditing.value) return true;
        if (field.editable === false) return true;
        if (field.disabled) return true;
        if (field.type === FieldType.DependentSelect && !editData.value[field.masterField]) return true;
        return !!(field.disabledCondition?.(getContext()));
    };

    const updateEditData = (updates: Partial<T>) => {
        if (isEditing.value) {
            editData.value = {...editData.value, ...updates};
        }
    };

    return {
        isEditing,
        formData,
        editData,
        errors,
        warnings,
        isStartingEdit,
        isRecordEditable,
        isSaveDisabled,
        displayData,
        dependentOptions,
        getContext,
        startEditing,
        cancelEditing,
        handleSave,
        handleClose,
        handleFieldBlur,
        onFieldValueUpdate,
        isFieldDisabled,
        revalidateAllFields,
        updateEditData,
    };
}