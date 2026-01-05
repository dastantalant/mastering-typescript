// src/components/datatable/render.helper.ts

import type {
    ActionsSchema,
    ButtonSchema,
    DateSchema,
    IconSchema, RowAction,
    TagSchema,
    TextSchema
} from "../types/renderer.types.ts";
import {UIComponent} from "../types/common.types.ts";

type TextProps = NonNullable<TextSchema<any>['props']>;
type TagProps = NonNullable<TagSchema<any>['props']>;
type ButtonProps = NonNullable<ButtonSchema<any>['props']>;
type DateProps = NonNullable<DateSchema<any>['props']>;
type IconProps = NonNullable<IconSchema<any>['props']>;

type SmartConfig<TData, TProps> = {[K in keyof TProps]?: TProps[K] | string | ((data: TData) => TProps[K] | undefined);} & {
    actions?: Record<string, string>;
};

function createRenderer<TSchema>(type: UIComponent, config?: any): TSchema {
    if (config === undefined || config === null) {
        return { type } as unknown as TSchema;
    }

    const props: Record<string, any> = {};
    const mapProps: Record<string, any> = {};
    let actions: Record<string, string> | undefined;

    const { actions: configActions, ...rest } = config;
    if (configActions) actions = configActions;

    for (const key in rest) {
        const value = rest[key];
        if (
            typeof value === 'function' ||
            (typeof value === 'string' && (value.startsWith('@') || value.startsWith('map:')))
        ) {
            mapProps[key] = value;
        } else {
            props[key] = value;
        }
    }

    const result: any = { type };
    if (Object.keys(props).length) result.props = props;
    if (Object.keys(mapProps).length) result.mapProps = mapProps;
    if (actions) result.actions = actions;

    return result;
}

export const Render = {
    Text: <TData>(arg?: SmartConfig<TData, TextProps> | ((data: TData) => string | number) | string | number) => {
        let schema: TextSchema<TData>;

        if (typeof arg === 'function' || (typeof arg === 'string' && (arg.startsWith('@') || arg.startsWith('map:')))) {
            schema = createRenderer(UIComponent.Text, { textContent: arg });
        } else if (typeof arg === 'string' || typeof arg === 'number') {
            schema = createRenderer(UIComponent.Text, { textContent: arg });
        } else {
            schema = createRenderer(UIComponent.Text, arg);
        }
        const chainable = schema as TextSchema<TData> & {
            class: (cls: string) => typeof chainable
        };

        chainable.class = function (cls: string) {
            this.props ??= {};
            this.props.class = cls;
            return this;
        };

        return chainable;
    },

    Date: <TData>(config?: SmartConfig<TData, DateProps>) => {
        const schema = createRenderer<DateSchema<TData>>(UIComponent.Date, config);
        const chainable = schema as DateSchema<TData> & {
            format: (fmt: string) => typeof chainable;
        };
        chainable.format = function (fmt: string) {
            this.props ??= {};
            this.props.format = fmt;
            return this;
        };
        return chainable;
    },

    Tag: <TData>(arg?: SmartConfig<TData, TagProps> | ((data: TData) => string | number)) => {
        let schema: TagSchema<TData>;
        if (typeof arg === 'function') {
            schema = createRenderer(UIComponent.Tag, { value: arg });
        } else {
            schema = createRenderer(UIComponent.Tag, arg);
        }

        const chainable = schema as TagSchema<TData> & {
            rounded: () => typeof chainable;
        };
        chainable.rounded = function () {
            this.props ??= {};
            this.props.rounded = true;
            return this;
        };

        return chainable;
    },

    Button: <TData>(config?: SmartConfig<TData, ButtonProps>): ButtonSchema<TData> =>
        createRenderer(UIComponent.Button, config),

    Icon: <TData>(config?: SmartConfig<TData, IconProps>): IconSchema<TData> =>
        createRenderer(UIComponent.Icon, config),

    Actions: <TData>(actions: RowAction<TData>[]) => {
        const schema: ActionsSchema<TData> = {
            type: UIComponent.Actions,
            actions: actions
        };
        type ActionsBuilder = Omit<ActionsSchema<TData>, 'class'> & {
            class: (cls: string) => ActionsBuilder
        };
        const chainable = schema as unknown as ActionsBuilder;
        chainable.class = function (cls: string) {
            (this as any).class = cls;
            return this;
        };
        return chainable as unknown as ActionsSchema<TData> & { class: (cls: string) => any };
    }
};

