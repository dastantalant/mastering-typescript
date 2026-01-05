// // src/components/datatable/datatable.types.ts
// export enum UIComponent {
//     Text = 'Text',
//     Date = 'Date',
//     Tag = 'Tag',
//     Button = 'Button',
//     Icon = 'Icon',
//     Avatar = 'Avatar',
// }
//
// export enum Severity {
//     Info = 'info',
//     Success = 'success',
//     Warning = 'warning',
//     Danger = 'danger',
//     Secondary = 'secondary',
//     Contrast = 'contrast',
//     Help = 'help',
// }
//
// export enum ColumnPin {
//     Left = 'left',
//     Right = 'right',
// }
//
// export enum ButtonType {
//     Button = 'button',
//     Submit = 'submit',
//     Reset = 'reset',
// }
//
// export enum FilterType {
//     Text = 'text',
//     Numeric = 'numeric',
//     Select = 'select',
//     Date = 'date',
//     DateRange = 'dateRange',
// }
//
// export type Source<TData, TValue> =
//     | TValue
//     | string
//     | ((data: TData) => TValue | any);
//
// type PropMapper<TData, TProps> = {
//     [K in keyof TProps]?: Source<TData, TProps[K]>;
// };
//
// interface BaseSchema {
//     actions?: Record<string, string>;
// }
//
// export interface TagProps {
//     value?: string | number;
//     severity?: Severity | string;
//     rounded?: boolean;
//     icon?: string;
// }
// export interface TagSchema<TData> extends BaseSchema {
//     type: UIComponent.Tag;
//     props?: TagProps;
//     mapProps?: PropMapper<TData, TagProps>;
// }
//
// export interface TextProps {
//     textContent?: string | number;
//     class?: string;
//     style?: string;
// }
// export interface TextSchema<TData> extends BaseSchema {
//     type: UIComponent.Text;
//     props?: TextProps;
//     mapProps?: PropMapper<TData, TextProps>;
// }
//
// export interface ButtonProps {
//     label?: string;
//     icon?: string;
//     severity?: Severity | string;
//     disabled?: boolean;
//     outlined?: boolean;
//     text?: boolean;
//     rounded?: boolean;
//     type?: ButtonType;
// }
// export interface ButtonSchema<TData> extends BaseSchema {
//     type: UIComponent.Button;
//     props?: ButtonProps;
//     mapProps?: PropMapper<TData, ButtonProps>;
// }
//
// export interface DateProps {
//     format?: string;
//     class?: string;
// }
// export interface DateSchema<TData> extends BaseSchema {
//     type: UIComponent.Date;
//     props?: DateProps;
//     mapProps?: PropMapper<TData, DateProps>;
// }
//
// export interface IconProps {
//     class?: string;
//     style?: string;
// }
// export interface IconSchema<TData> extends BaseSchema {
//     type: UIComponent.Icon;
//     props?: IconProps;
//     mapProps?: PropMapper<TData, IconProps>;
// }
//
// export type CellRendererSchema<TData = any> =
//     | TagSchema<TData>
//     | TextSchema<TData>
//     | ButtonSchema<TData>
//     | DateSchema<TData>
//     | IconSchema<TData>;
//
// export interface FilterValidation {
//     required?: boolean;
//     pattern?: string | RegExp;
//     min?: number;
//     max?: number;
// }
//
// export interface ColumnDefinition<TData = any> {
//     field: string;
//     header: string;
//     sortable?: boolean;
//     style?: string;
//     pin?: ColumnPin;
//     filter?: FilterConfig | boolean;
//     renderer?: CellRendererSchema<TData>;
// }
//
// export interface DataTableConfig<TData = any> {
//     title?: string;
//     dataKey?: string;
//     columns: ColumnDefinition<TData>[];
//     rowActions?: RowAction<TData>[];
//     showExportButton?: boolean;
//     showClearFiltersButton?: boolean;
// }
//
// export interface FetchDataParams {
//     page: number;
//     rows: number;
//     sortField?: string;
//     sortOrder?: 1 | -1 | 0 | null;
//     filters: Record<string, any>;
// }
//
// export interface FetchDataResult<TData = any> {
//     items: TData[];
//     totalRecords: number;
// }
//
// export function defineTableConfig<TData>(config: DataTableConfig<TData>): DataTableConfig<TData> {
//     return config;
// }
//
// export type ActionHandler<TData> = string | ((data: TData) => void);
//
// export interface RowAction<TData = any> {
//     action: ActionHandler<TData>;
//     icon: string;
//     severity?: Severity | string;
//     tooltip?: string;
//
//     isVisible?: Source<TData, boolean>;
//     disabled?: Source<TData, boolean>;
// }
//
// export interface ActionColumn {
//     header?: string;
//     pin?: ColumnPin;
//     style?: string;
//     actions: RowAction[];
// }
//
// export interface DataTableConfig<TData = any> {
//     title?: string;
//     dataKey?: string;
//     columns: ColumnDefinition<TData>[];
//     actionColumn?: ActionColumn;
//     showExportButton?: boolean;
//     showClearFiltersButton?: boolean;
// }
//
//
//
// interface BaseFilterConfig {
//     placeholder?: string;
//     validation?: FilterValidation;
//     props?: Record<string, any>;
// }
//
// export interface TextFilterConfig extends BaseFilterConfig {
//     type: FilterType.Text;
// }
//
// export interface NumericFilterConfig extends BaseFilterConfig {
//     type: FilterType.Numeric;
//     grouping?: boolean;
// }
//
// export interface SelectFilterConfig extends BaseFilterConfig {
//     type: FilterType.Select;
//     options: any[];
//     label?: string;
//     value?: string;
// }
//
// export interface DateFilterConfig extends BaseFilterConfig {
//     type: FilterType.Date | FilterType.DateRange;
//     format?: string;
// }
//
// export type FilterConfig =
//     | TextFilterConfig
//     | NumericFilterConfig
//     | SelectFilterConfig
//     | DateFilterConfig;
