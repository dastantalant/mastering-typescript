// src/components/types/renderer.types.ts

import {type PropMapper, Severity, UIComponent, ButtonType, type Source} from './common.types.ts';

export interface BaseSchema {
    actions?: Record<string, string>;
}

export interface TagProps {
    value?: string | number;
    severity?: Severity | string;
    rounded?: boolean;
    icon?: string;
}
export interface TagSchema<TData> extends BaseSchema {
    type: UIComponent.Tag;
    props?: TagProps;
    mapProps?: PropMapper<TData, TagProps>;
}

export interface TextProps {
    textContent?: string | number;
    class?: string;
    style?: string;
}
export interface TextSchema<TData> extends BaseSchema {
    type: UIComponent.Text;
    props?: TextProps;
    mapProps?: PropMapper<TData, TextProps>;
}

export interface ButtonProps {
    label?: string;
    icon?: string;
    severity?: Severity | string;
    disabled?: boolean;
    outlined?: boolean;
    text?: boolean;
    rounded?: boolean;
    type?: ButtonType;
}
export interface ButtonSchema<TData> extends BaseSchema {
    type: UIComponent.Button;
    props?: ButtonProps;
    mapProps?: PropMapper<TData, ButtonProps>;
}

export interface DateProps {
    format?: string;
    class?: string;
}
export interface DateSchema<TData> extends BaseSchema {
    type: UIComponent.Date;
    props?: DateProps;
    mapProps?: PropMapper<TData, DateProps>;
}

export interface IconProps {
    class?: string;
    style?: string;
}
export interface IconSchema<TData> extends BaseSchema {
    type: UIComponent.Icon;
    props?: IconProps;
    mapProps?: PropMapper<TData, IconProps>;
}

export type ActionHandler<TData> = string | ((data: TData) => void);

export interface RowAction<TData = never> {
    action: ActionHandler<TData>;
    icon: string;
    severity?: Severity | string;
    tooltip?: string;
    isVisible?: Source<TData, boolean>;
    disabled?: Source<TData, boolean>;
}

export interface ActionsSchema<TData> {
    type: UIComponent.Actions;
    actions: RowAction<TData>[];
    class?: string;
}

export type CellRendererSchema<TData = never> =
    | TagSchema<TData>
    | TextSchema<TData>
    | ButtonSchema<TData>
    | DateSchema<TData>
    | IconSchema<TData>
    | ActionsSchema<TData>;
