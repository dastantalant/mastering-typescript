// src/core/form/Validator.ts

import type { FormFieldConfig, FormContext } from "./FormTypes.ts";

export class Validator {
    static validateField<T>(
        config: FormFieldConfig<T>,
        value: any,
        ctx: FormContext<T>
    ): string | null {

        if (config.displayCondition && !config.displayCondition(ctx)) {
            return null;
        }

        const isRequired = config.required &&
            (!config.requiredCondition || config.requiredCondition(ctx));

        if (isRequired) {
            const isEmpty = value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
            if (isEmpty) {
                return typeof config.required === 'string' ? config.required : 'Поле обязательно для заполнения';
            }
        }

        if (value === null || value === undefined || value === '') {
            return null;
        }

        if (config.pattern && !config.pattern.test(String(value))) {
            return config.patternMessage || 'Неверный формат';
        }

        if (config.validator) {
            const customError = config.validator(value, ctx);
            if (customError) return customError;
        }

        return null;
    }
}
