// src/components/types/filter.types.ts

import { FilterType } from './common.types';


export interface IFilterBuilder {
    build(): FilterConfig;
}

export interface FilterValidation {
    required?: boolean;
    pattern?: string | RegExp;
    min?: number;
    max?: number;
}

interface BaseFilterConfig {
    placeholder?: string;
    validation?: FilterValidation;
    props?: Record<string, any>;
}

export interface TextFilterConfig extends BaseFilterConfig {
    type: FilterType.Text;
}

export interface NumericFilterConfig extends BaseFilterConfig {
    type: FilterType.Numeric;
    grouping?: boolean;
}

export interface SelectFilterConfig extends BaseFilterConfig {
    type: FilterType.Select;
    options: any[];
    label?: string;
    value?: string;
    showSearch?: boolean;
}

export interface DateFilterConfig extends BaseFilterConfig {
    type: FilterType.Date | FilterType.DateRange;
    format?: string;
}

export type FilterConfig =
    | TextFilterConfig
    | NumericFilterConfig
    | SelectFilterConfig
    | DateFilterConfig;
