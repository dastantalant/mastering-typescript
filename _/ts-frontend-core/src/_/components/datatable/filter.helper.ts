// src/components/datatable/filter.helper.ts

import type {
    DateFilterConfig, FilterConfig, IFilterBuilder,
    NumericFilterConfig,
    SelectFilterConfig,
    TextFilterConfig
} from "../types/filter.types.ts";
import {FilterType} from "../types/common.types.ts";

class BaseBuilder<TConfig extends FilterConfig> implements IFilterBuilder {
    public config: TConfig;

    constructor(initialConfig: TConfig) {
        this.config = initialConfig;
    }

    build(): FilterConfig {
        return this.config;
    }

    props(props: Record<string, any>) {
        this.config.props = {...this.config.props, ...props};
        return this;
    }
}

export const Filter = {

    Text: (initial?: Partial<TextFilterConfig>) => {
        const config: TextFilterConfig = {
            type: FilterType.Text,
            ...initial
        };

        const builder = new BaseBuilder<TextFilterConfig>(config);

        return Object.assign(builder, {
            placeholder(text: string) {
                builder.config.placeholder = text;
                return this;
            }
        });
    },

    Numeric: (initial?: Partial<NumericFilterConfig>) => {
        const config: NumericFilterConfig = {
            type: FilterType.Numeric,
            ...initial
        };

        const builder = new BaseBuilder<NumericFilterConfig>(config);

        return Object.assign(builder, {
            placeholder(text: string) {
                builder.config.placeholder = text;
                return this;
            },
            grouping(enable: boolean) {
                builder.config.grouping = enable;
                return this;
            }
        });
    },

    Select: (arg: any[] | Partial<SelectFilterConfig>) => {
        let initConfig: SelectFilterConfig;

        if (Array.isArray(arg)) {
            initConfig = {
                type: FilterType.Select,
                options: arg,
                label: 'name',
                value: 'value'
            };
        } else {
            initConfig = {
                type: FilterType.Select,
                options: [],
                ...arg
            };
        }

        const builder = new BaseBuilder<SelectFilterConfig>(initConfig);

        return Object.assign(builder, {
            placeholder(text: string) {
                builder.config.placeholder = text;
                return this;
            },
            searchable(isEnabled = true) {
                builder.config.props ??= {};
                builder.config.props.filter = isEnabled;
                return this;
            },
            label(field: string) {
                builder.config.label = field;
                return this;
            },
            value(field: string) {
                builder.config.value = field;
                return this;
            }
        });
    },

    Date: (formatOrConfig?: string | Partial<DateFilterConfig>) => {
        const config: DateFilterConfig = {
            type: FilterType.Date,
            format: typeof formatOrConfig === 'string' ? formatOrConfig : 'dd.mm.yy',
            ...(typeof formatOrConfig === 'object' ? formatOrConfig : {})
        };

        const builder = new BaseBuilder<DateFilterConfig>(config);

        return Object.assign(builder, {
            format(fmt: string) {
                builder.config.format = fmt;
                return this;
            },
            placeholder(text: string) {
                builder.config.placeholder = text;
                return this;
            }
        });
    },

    DateRange: (formatOrConfig?: string | Partial<DateFilterConfig>) => {
        const config: DateFilterConfig = {
            type: FilterType.DateRange,
            format: typeof formatOrConfig === 'string' ? formatOrConfig : 'dd.mm.yy',
            ...(typeof formatOrConfig === 'object' ? formatOrConfig : {})
        };

        const builder = new BaseBuilder<DateFilterConfig>(config);

        return Object.assign(builder, {
            format(fmt: string) {
                builder.config.format = fmt;
                return this;
            },
            placeholder(text: string) {
                builder.config.placeholder = text;
                return this;
            }
        });
    }
};