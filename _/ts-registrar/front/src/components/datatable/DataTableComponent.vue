<!-- src/components/DataTableComponent.vue -->
<script setup lang="ts" generic="TData extends Record<string, any> = any, TCommand extends string = string">
import {computed, markRaw} from 'vue';
import PrimeDataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import DatePicker from 'primevue/datepicker';
import Select from 'primevue/select';

import {useDataTable} from "./useDataTable";
import DataTableCell from "./DataTableCell.vue";
import {Filter} from "./filter.helper.ts";
import {
  FilterType,
  UIComponent,
  type ColumnDefinition,
  type DataTableConfig,
  type DateFilterConfig,
  type FilterConfig,
  type IFilterBuilder,
  type NumericFilterConfig,
  type SelectFilterConfig,
  type ToolbarAction,
  ToolbarPosition,
  ButtonVariant,
  SystemCommand,
  type CommandHandler,
  type DataTableContext
} from "../types/datatable.types.ts";
import type {FetchDataParams, FetchDataResult} from "../types/common.types.ts";

const props = defineProps<{
  config: DataTableConfig<TData>;
  data?: TData[];
  fetchData?: (params: FetchDataParams) => Promise<FetchDataResult<TData>>;
  commands?: Partial<Record<TCommand, CommandHandler<TData>>>;
}>();

const emit = defineEmits<{(e: 'row-click', ctx: DataTableContext<TData>): void;}>();

const {
  loading, items, totalRecords, lazyParams, filters, filterErrors,
  onPage, onSort, onFilterInput, refresh, clearAllFilters, getFilterValues
} = useDataTable<TData>({
  columns: props.config.columns,
  fetchDataFunction: props.fetchData,
  initialData: props.data,
});

defineExpose({refresh});

const createExecutionContext = (source: 'row' | 'toolbar', rowData?: TData): DataTableContext<TData> => ({
  source,
  data: rowData,
  items: items.value,
  totalRecords: totalRecords.value,
  filters: getFilterValues(),
  refresh
});

const executeCommand = (
    action: string | ((ctx: DataTableContext<TData>) => void),
    source: 'row' | 'toolbar',
    rowData?: TData
) => {
  const context = createExecutionContext(source, rowData);

  if (typeof action === 'function') {
    action(context);
    return;
  }

  if (action === SystemCommand.ClearFilters) {
    clearAllFilters();
    return;
  }

  if (props.commands && props.commands[action as TCommand]) {
    props.commands[action as TCommand]!(context);
    return;
  }

  console.warn(`[DataTable] Команда "${action}" не найдена в props.commands.`, context);
};

const onToolbarActionClick = (item: ToolbarAction<TData>) => {
  executeCommand(item.action, 'toolbar');
};

const onRowAction = (commandId: string, rowData: TData) => {
  executeCommand(commandId, 'row', rowData);
};

const getCheckContext = () => createExecutionContext('toolbar');

const isActionDisabled = (btn: ToolbarAction<TData>) => {
  if (typeof btn.disabled === 'function') {
    return btn.disabled(getCheckContext());
  }
  return btn.disabled || false;
};

const isActionVisible = (btn: ToolbarAction<TData>) => {
  if (btn.show === undefined) return true;
  if (typeof btn.show === 'function') {
    return btn.show(getCheckContext());
  }
  return btn.show;
};

const toolbarItems = computed(() => props.config.toolbar || []);

const startActions = computed(() =>
    toolbarItems.value.filter(a =>
        (a.position === ToolbarPosition.Start) && isActionVisible(a)
    )
);

const endActions = computed(() =>
    toolbarItems.value.filter(a =>
        (!a.position || a.position === ToolbarPosition.End) && isActionVisible(a)
    )
);

const filterComponentMap = {
  [FilterType.Text]: markRaw(InputText),
  [FilterType.Numeric]: markRaw(InputNumber),
  [FilterType.Select]: markRaw(Select),
  [FilterType.Date]: markRaw(DatePicker),
  [FilterType.DateRange]: markRaw(DatePicker),
};

const resolveFilterConfig = (col: ColumnDefinition): FilterConfig | null => {
  if (!col.filter) return null;
  if (typeof (col.filter as any).build === 'function') {
    return (col.filter as IFilterBuilder).build();
  }
  if (typeof col.filter === 'object') {
    return col.filter as FilterConfig;
  }
  if (col.filter) {
    if (col.renderer?.type === UIComponent.Date) {
      const format = (col.renderer.props as any)?.format || 'dd.mm.yy';
      return Filter.Date(format).build();
    }
    return Filter.Text().build();
  }
  return null;
};

const getFilterProps = (col: ColumnDefinition) => {
  const config = resolveFilterConfig(col);
  if (!config) return {};

  const baseProps = {
    placeholder: config.placeholder || 'Поиск...',
    class: 'w-full',
    invalid: col.field ? !!filterErrors.value[col.field] : false,
    ...(config.props || {})
  };

  switch (config.type) {
    case FilterType.Select: {
      const selectConfig = config as SelectFilterConfig;
      return {
        ...baseProps,
        options: selectConfig.options,
        optionLabel: selectConfig.label || 'name',
        optionValue: selectConfig.value || 'value',
        showClear: true,
        filter: selectConfig.showSearch ?? false,
      };
    }
    case FilterType.DateRange: {
      const rangeConfig = config as DateFilterConfig;
      return {
        ...baseProps,
        selectionMode: 'range',
        dateFormat: rangeConfig.format || 'dd.mm.yy',
        manualInput: true,
        style: 'min-width: 210px'
      };
    }
    case FilterType.Date: {
      const dateConfig = config as DateFilterConfig;
      return {
        ...baseProps,
        dateFormat: dateConfig.format || 'dd.mm.yy',
        manualInput: true
      };
    }
    case FilterType.Numeric:
      return {
        ...baseProps,
        grouping: (config as NumericFilterConfig).grouping ?? false
      };
    case FilterType.Text:
    default:
      return baseProps;
  }
};

const getColumnProps = (col: ColumnDefinition) => {
  return {
    ...col,
    header: col.header || '',
    style: [props.config.defaultStyle, col.style],
    class: [props.config.defaultClass, col.class],
    frozen: col.pin === 'left' || col.pin === 'right',
    alignFrozen: col.pin,
    showFilterMenu: false
  };
};

const onRowSelect = (event: { data: TData }) => {
  const ctx = createExecutionContext('row', event.data);

  emit('row-click', ctx);
};
</script>

<template>
  <div class="card flex flex-col h-full">
    <Toolbar v-if="config.title || toolbarItems.length > 0" class="mb-4">
      <template #start>
        <div v-if="config.title" class="text-xl font-bold mr-4">{{ config.title }}</div>
        <div class="flex gap-2">
          <Button
              v-for="(btn, idx) in startActions" :key="idx"
              :label="btn.label"
              :icon="btn.icon"
              :severity="btn.severity as any"
              :text="btn.variant === ButtonVariant.Text"
              :outlined="btn.variant === ButtonVariant.Outlined"
              :disabled="isActionDisabled(btn)"
              @click="onToolbarActionClick(btn)"
          />
        </div>
      </template>

      <template #end>
        <div class="flex gap-2">
          <Button
              v-for="(btn, idx) in endActions" :key="idx"
              :label="btn.label"
              :icon="btn.icon"
              :severity="btn.severity as any"
              :text="btn.variant === ButtonVariant.Text"
              :outlined="btn.variant === ButtonVariant.Outlined"
              :disabled="isActionDisabled(btn)"
              @click="onToolbarActionClick(btn)"
          />
        </div>
      </template>
    </Toolbar>
    <PrimeDataTable
        :value="items"
        :loading="loading"
        :data-key="config.dataKey || 'id'"
        :rows="lazyParams.rows"
        :first="lazyParams.first"
        :total-records="totalRecords"
        v-model:filters="filters"
        @page="onPage"
        @sort="onSort"
        @row-select="onRowSelect"
        scroll-height="flex"
        filter-display="row"
        selectionMode="single"
        class="flex-1"
        lazy
        paginator
        scrollable
    >
      <template #empty>Нет данных.</template>

      <Column
          v-for="(col, index) in config.columns"
          :key="col.field || index"
          v-bind="getColumnProps(col)"
      >
        <template #body="{ data }">
          <DataTableCell
              :data="data"
              :field="col.field"
              :schema="col.renderer"
              @action="(id, d) => onRowAction(id, d)"
          />
        </template>

        <template #filter v-if="col.filter">
          <div class="flex flex-col gap-1 w-full" v-if="col.field && resolveFilterConfig(col)">
            <component
                :is="filterComponentMap[resolveFilterConfig(col)!.type]"
                v-model="filters[col.field].value"
                v-bind="getFilterProps(col)"
                @update:modelValue="(val: any) => onFilterInput(col.field!, val)"
                class="w-full min-w-[100px]"
            />
            <small v-if="filterErrors[col.field]" class="text-red-500 text-xs">
              {{ filterErrors[col.field] }}
            </small>
          </div>
        </template>
      </Column>
    </PrimeDataTable>
  </div>
</template>