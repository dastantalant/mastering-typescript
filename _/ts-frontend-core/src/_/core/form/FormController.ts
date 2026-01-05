// src/core/form/FormController.ts

import {Observer} from "../common/Observer.ts";
import {Validator} from "./Validator.ts";
import type {FormContext, FormFieldConfig, FormState} from "./FormTypes.ts";

export class FormController<T extends Record<string, any>> {
    private state: FormState<T>;
    private originalValues: T;
    public store = new Observer<FormState<T>>();

    constructor(
        private readonly config: FormFieldConfig<T>[],
        initialValues: T
    ) {
        this.originalValues = structuredClone(initialValues);

        this.state = {
            values: structuredClone(initialValues),
            errors: {},
            isValid: true,
            isDirty: false,
            isSubmitting: false,
            visibleFields: []
        };

        this.initializeDefaults();
        this.recalculateLifecycle();
    }

    getState() { return { ...this.state }; }

    setFieldValue(field: keyof T | string, value: any) {
        this.state.values = {...this.state.values, [field]: value};

        const fieldConfig = this.config.find(f => f.field === field);
        const ctx = this.getContext();

        if (fieldConfig?.onChange) {
            fieldConfig.onChange(value, ctx);
        }

        this.handleDependencies(field as string);

        this.state.isDirty = true;
        this.recalculateLifecycle();

        this.notify();
    }

    async submit(handler: (data: T) => Promise<void>) {
        if (!this.validateAll()) {
            this.notify();
            return;
        }

        this.update({ isSubmitting: true });

        try {
            await handler(this.state.values);
            this.update({ isSubmitting: false, isDirty: false });
            this.originalValues = structuredClone(this.state.values);
        } catch (error) {
            console.error("Submit Error:", error);
            this.update({ isSubmitting: false });
            throw error;
        }
    }

    reset() {
        this.state.values = structuredClone(this.originalValues);
        this.state.errors = {};
        this.state.isDirty = false;
        this.recalculateLifecycle();
        this.notify();
    }

    private getContext(): FormContext<T> {
        return {
            values: this.state.values,
            original: this.originalValues,
            isEditing: true
        };
    }

    private initializeDefaults() {
        for (const field of this.config) {
            const currentVal = this.state.values[field.field];
            if (field.defaultValue !== undefined && (currentVal === undefined || currentVal === null)) {
                this.state.values[field.field as keyof T] = field.defaultValue;
            }
        }
    }

    private handleDependencies(changedField: string) {
        const dependents = this.config.filter(f => f.masterField === changedField);

        dependents.forEach(dep => {
            this.state.values[dep.field as keyof T] = null as any;
        });
    }

    private recalculateLifecycle() {
        const ctx = this.getContext();
        const errors: Record<string, string> = {};
        const visibleFields: string[] = [];
        let isValid = true;

        for (const field of this.config) {
            const isVisible = !field.displayCondition || field.displayCondition(ctx);
            if (isVisible) {
                visibleFields.push(field.field as string);
            }

            const error = Validator.validateField(field, this.state.values[field.field], ctx);
            if (error) {
                errors[field.field as string] = error;
                isValid = false;
            }
        }

        this.state.errors = errors;
        this.state.visibleFields = visibleFields;
        this.state.isValid = isValid;
    }

    private validateAll(): boolean {
        this.recalculateLifecycle();
        return this.state.isValid;
    }

    private update(partial: Partial<FormState<T>>) {
        this.state = { ...this.state, ...partial };
        this.notify();
    }

    private notify() {
        this.store.notify({ ...this.state });
    }
}
