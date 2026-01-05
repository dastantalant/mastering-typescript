// src/components/datatable/toolbar.helper.ts
// src/components/datatable/toolbar.helper.ts
import { Severity, ToolbarPosition, ButtonVariant } from "../types/common.types.ts";
import {SystemCommand, type ToolbarAction} from "../types/datatable.types.ts";

export const Toolbar = {
    Button: <TData = any>(config: ToolbarAction<TData>): ToolbarAction<TData> => config,

    ClearFilters: <TData = any>(overrides?: Partial<ToolbarAction<TData>>): ToolbarAction<TData> => ({
        label: 'Сброс',
        icon: 'pi pi-filter-slash',
        severity: Severity.Secondary,
        variant: ButtonVariant.Text,
        action: SystemCommand.ClearFilters,
        position: ToolbarPosition.End,
        ...overrides
    }),

    Export: <TData = any>(overrides?: Partial<ToolbarAction<TData>>): ToolbarAction<TData> => ({
        label: 'Экспорт',
        icon: 'pi pi-upload',
        severity: Severity.Secondary,
        variant: ButtonVariant.Outlined,
        action: 'export',
        position: ToolbarPosition.End,
        ...overrides
    })
};