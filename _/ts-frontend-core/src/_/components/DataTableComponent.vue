<!-- @/components/DataTableComponent.vue -->
<script setup lang="ts">
import {computed, onMounted, ref, watchEffect} from 'vue';
import {FilterMatchMode} from '@primevue/core/api';
import {useDebounceFn} from '@vueuse/core';
import type {DataTablePageEvent, DataTableSortEvent} from 'primevue/datatable';
import PrimeDataTable, {type DataTableRowSelectEvent} from 'primevue/datatable';
import Column from 'primevue/column';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';

// --- TYPE DEFINITIONS ---
interface TagRender {
  component: 'Tag';
  value: string;
  severity: 'info' | 'success' | 'warning' | 'danger' | 'secondary' | string;
}

interface TextRender {
  component: 'Text';
  value: string;
}

type CustomBodyRender = TagRender | TextRender;

export interface ColumnDefinition {
  field: string;
  header: string;
  sortable?: boolean;
  style?: string;
  filter?: Filter;
  customBody?: (data: any) => CustomBodyRender;
  frozen?: boolean | 'left' | 'right';
}

interface Filter {
  type: 'text' | 'numeric' | 'select' | 'dropdown' | 'dateRange' | 'date';
  options?: any[];
  optionLabel?: string;
  optionValue?: string;
  placeholder?: string;
  filterFields?: string[];
  validation?: FilterValidation;
}

interface FilterValidation {
  pattern?: RegExp;
  patternMessage?: string;
  required?: boolean;
  min?: number;
  max?: number;
  length?: number;
}

export interface ActionDefinition {
  icon: string | ((data: any) => string);
  severity: 'info' | 'success' | 'warning' | 'danger' | 'secondary';
  tooltip?: string;
  onClick: (data: any) => void;
  isVisible?: (data: any) => boolean;
  disabled?: (data: any) => boolean;
}

export interface ActionColumnDefinition {
  header?: string;
  actions?: ActionDefinition[];
  frozen?: boolean | 'left' | 'right';
}

export interface RowClickAction {
  onClick: (data: any) => void;
}

export interface FetchDataParams {
  page: number;
  rows: number;
  sortField?: string;
  sortOrder?: 1 | -1 | 0 | null;
  filters: Record<string, any>;
}

export interface FetchDataResult {
  items: any[];
  totalRecords: number;
}

// --- PROPS ---

const props = withDefaults(defineProps<{
  columns: ColumnDefinition[];
  actionColumn: ActionColumnDefinition;
  fetchDataFunction?: (params: FetchDataParams) => Promise<FetchDataResult>;
  data?: any[];
  exportFunction?: (params: Pick<FetchDataParams, 'filters'>) => Promise<void>;
  title?: string;
  dataKey?: string;
  rowClickAction?: RowClickAction;
}>(), {
  dataKey: 'id',
  actionColumn: () => ({actions: [], frozen: false} as ActionColumnDefinition)
});

// --- РЕЖИМ РАБОТЫ ---
const isClientSide = computed(() => !!props.data);

// --- STATE ---

const loading = ref(false);
const items = ref<any[]>([]);
const fullDataSet = ref<any[]>([]);
const totalRecords = ref(0);
const lazyParams = ref({
  first: 0,
  rows: 10,
  sortField: undefined as string | undefined,
  sortOrder: undefined as 1 | -1 | undefined,
});
const filterErrors = ref<Record<string, string>>({});

// --- HELPERS ---

const handleRowSelect = (event: DataTableRowSelectEvent) => {
  if (props.rowClickAction && props.rowClickAction.onClick) {
    props.rowClickAction.onClick(event.data);
  }
};

/**
 * Determines the PrimeVue FilterMatchMode based on the custom filter type.
 */
const getMatchModeForType = (type: Filter['type']): string => {
  switch (type) {
    case 'select':
    case 'dropdown':
      return FilterMatchMode.EQUALS;
    case 'dateRange':
    case 'date':
      return FilterMatchMode.BETWEEN;
    case 'text':
    case 'numeric':
    default:
      return FilterMatchMode.CONTAINS;
  }
};

/**
 * Initializes the filters ref based on column definitions.
 */
const initialFilters = computed(() => {
  const f: Record<string, { value: any, matchMode: string }> = {};
  props.columns.forEach(col => {
    if (col.filter) {
      f[col.field] = {
        value: null,
        matchMode: getMatchModeForType(col.filter.type)
      };
    }
  });
  return f;
});

const filters = ref(initialFilters.value);

/**
 * Extracts raw filter values for the API call.
 */
const getFilterValues = (): Record<string, any> => {
  return Object.entries(filters.value).reduce((acc, [key, filter]) => {
    acc[key] = filter.value;
    return acc;
  }, {} as Record<string, any>);
};

// --- DATA FETCHING & HANDLING ---

const processClientData = () => {
  loading.value = true;
  let processedData = [...fullDataSet.value];

  const activeFilters = getFilterValues();
  if (Object.values(activeFilters).some(val => val !== null && val !== undefined && val !== '')) {
    processedData = processedData.filter(item => {
      return props.columns.every(col => {
        if (!col.filter) return true;
        const filterValue = activeFilters[col.field];
        if (filterValue === null || filterValue === undefined || filterValue === '') return true;

        const itemValue = item[col.field];
        if (itemValue === null || itemValue === undefined) return false;

        switch (col.filter.type) {
          case 'text':
            return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
          case 'numeric':
            return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
          case 'select':
          case 'dropdown':
            return itemValue == filterValue;
          case 'date': {
            const itemDate = new Date(itemValue);
            const filterDate = new Date(filterValue);
            itemDate.setHours(0, 0, 0, 0);
            filterDate.setHours(0, 0, 0, 0);
            return itemDate.getTime() === filterDate.getTime();
          }
          case 'dateRange': {
            const itemDate = new Date(itemValue);
            const [startDate, endDate] = filterValue as Date[];
            if (!startDate) return true;
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (!endDate) return itemDate >= start;
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            return itemDate >= start && itemDate <= end;
          }
          default:
            return true;
        }
      });
    });
  }

  const { sortField, sortOrder } = lazyParams.value;
  if (sortField && sortOrder) {
    processedData.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      let result = 0;
      if (valA < valB) result = -1;
      else if (valA > valB) result = 1;
      return result * sortOrder;
    });
  }

  totalRecords.value = processedData.length;
  items.value = processedData.slice(lazyParams.value.first, lazyParams.value.first + lazyParams.value.rows);

  loading.value = false;
};

const loadData = async () => {
  if (isClientSide.value) {
    processClientData();
    return;
  }

  if (!props.fetchDataFunction) return;
  if (!validateAllFilters()) return;

  loading.value = true;
  try {
    const params: FetchDataParams = {
      page: lazyParams.value.first / lazyParams.value.rows,
      rows: lazyParams.value.rows,
      sortField: lazyParams.value.sortField,
      sortOrder: lazyParams.value.sortOrder,
      filters: getFilterValues(),
    };
    const result = await props.fetchDataFunction(params);
    items.value = result.items;
    totalRecords.value = result.totalRecords;
  } catch (error) {
    console.error("Failed to load data:", error);
    // Optionally, add user-facing error handling (e.g., a toast notification)
  } finally {
    loading.value = false;
  }
};

const debouncedLoadData = useDebounceFn(() => {
  lazyParams.value.first = 0;
  loadData();
}, 300);

// --- EVENT HANDLERS ---

const onPage = (event: DataTablePageEvent) => {
  lazyParams.value.first = event.first;
  lazyParams.value.rows = event.rows;
  loadData();
};

const onSort = (event: DataTableSortEvent) => {
  lazyParams.value.sortField = event.sortField as string;
  lazyParams.value.sortOrder = event.sortOrder as 1 | -1 | undefined;
  loadData();
};

const onFilterInput = (field: string, value: any) => {
  const column = props.columns.find(c => c.field === field);
  if (validateFilter(field, value, column?.filter?.validation)) {
    debouncedLoadData();
  }
};

const handleExport = async () => {
  if (!props.exportFunction || !validateAllFilters()) return;
  loading.value = true;
  try {
    await props.exportFunction({filters: getFilterValues()});
  } catch (error) {
    console.error("Failed to export data:", error);
  } finally {
    loading.value = false;
  }
};

// --- VALIDATION ---

const validateFilter = (field: string, value: any, validation?: FilterValidation): boolean => {
  if (!validation) {
    filterErrors.value[field] = '';
    return true;
  }

  let errorMessage = '';
  if (validation.required && (value === null || value === undefined || value === '')) {
    errorMessage = 'Поле обязательно для заполнения';
  } else if (validation.pattern && value && !validation.pattern.test(String(value))) {
    errorMessage = validation.patternMessage || 'Неверный формат';
  } else if (typeof value === 'number') {
    if (validation.min !== undefined && value < validation.min) {
      errorMessage = `Минимальное значение: ${validation.min}`;
    } else if (validation.max !== undefined && value > validation.max) {
      errorMessage = `Максимальное значение: ${validation.max}`;
    }
  }

  filterErrors.value[field] = errorMessage;
  return !errorMessage;
};

const validateAllFilters = () => {
  return props.columns.every(col => {
    if (!col.filter) return true;
    return validateFilter(col.field, filters.value[col.field]?.value, col.filter.validation);
  });
};

const getFrozen = (frozen?: boolean | 'left' | 'right'): boolean => {
  return frozen === 'right' || frozen === 'left' || frozen === true;
}

const getFrozenSide = (frozen?: boolean | 'left' | 'right'): 'left' | 'right' | undefined => {
  if (frozen === 'right') return 'right';
  if (frozen === 'left' || frozen === true) return 'left';
  return undefined;
}
// --- LIFECYCLE ---
const refresh = () => {
  loadData();
};

defineExpose({
  refresh
});

watchEffect(() => {
  if (isClientSide.value && props.data) {
    fullDataSet.value = props.data;
    loadData();
  }
});


onMounted(() => {
  if (!isClientSide.value) {
    loadData();
  }
});
</script>

<template>
  <div class="card">
    <Toolbar v-if="title || exportFunction" class="mb-4">
      <template #start>
        <div v-if="title" class="text-xl font-bold">{{ title }}</div>
      </template>
      <template #end>
        <Button v-if="exportFunction" label="Export" icon="pi pi-upload" severity="secondary" @click="handleExport"
                :loading="loading"/>
      </template>
    </Toolbar>

    <PrimeDataTable
        :value="items"
        :loading="loading"
        v-model:filters="filters"
        selectionMode="single"
        @row-select="handleRowSelect"
        :data-key="dataKey"
        filter-display="row"
        lazy
        paginator
        :rows="lazyParams.rows"
        :first="lazyParams.first"
        :total-records="totalRecords"
        @page="onPage"
        @sort="onSort"
        :rows-per-page-options="[10, 20, 50]"
        scrollable
        scroll-height="70vh"
        table-style="width: 100%"
    >
      <Column
          v-for="col in columns"
          :key="col.field"
          :field="col.field"
          :header="col.header"
          :sortable="col.sortable"
          :style="col.style"
          :show-filter-menu="false"
          :frozen="getFrozen(col.frozen)"
          :alignFrozen="getFrozenSide(col.frozen)"
      >
        <!-- Body Template -->
        <template #body="{ data }">
          <template v-if="col.customBody">
            <span v-if="col.customBody(data).component === 'Tag'">
              <Tag :value="col.customBody(data).value"
                   :severity="(col.customBody(data) as TagRender).severity"/>
            </span>
            <span v-else>
              {{ col.customBody(data).value }}
            </span>
          </template>
          <template v-else>
            {{ data[col.field] }}
          </template>
        </template>

        <!-- Filter Template -->
        <template #filter="{ filterModel }" v-if="col.filter">
          <div class="flex flex-col">
            <!-- Text Filter -->
            <InputText
                v-if="col.filter.type === 'text'"
                v-model="filters[col.field].value"
                @update:model-value="onFilterInput(col.field, $event)"
                @blur="validateFilter(col.field, filterModel.value, col.filter.validation)"
                :placeholder="col.filter.placeholder || 'Поиск'"
                :title="filterErrors[col.field] || col.filter.validation?.patternMessage"
                :class="{ 'p-invalid': filterErrors[col.field] }"
                class="p-column-filter"
                type="text"
                showClear
            />
            <!-- Numeric Filter -->
            <InputNumber
                v-if="col.filter.type === 'numeric'"
                v-model="filters[col.field].value"
                @update:model-value="onFilterInput(col.field, $event)"
                @blur="validateFilter(col.field, filterModel.value, col.filter.validation)"
                :placeholder="col.filter.placeholder || 'Поиск'"
                :title="filterErrors[col.field]"
                :class="{ 'p-invalid': filterErrors[col.field] }"
                class="p-column-filter"
                :format="false"
                showClear
            />
            <!-- Select Filter -->
            <Select
                v-if="col.filter.type === 'select'"
                v-model="filters[col.field].value"
                @update:model-value="onFilterInput(col.field, $event)"
                :options="col.filter.options"
                :option-label="col.filter.optionLabel || 'name'"
                :option-value="col.filter.optionValue || 'value'"
                :placeholder="col.filter.placeholder || 'Выбрать'"
                class="p-column-filter"
                showClear
            />
            <!-- Dropdown Filter -->
            <Dropdown
                v-if="col.filter.type === 'dropdown'"
                v-model="filters[col.field].value"
                @update:model-value="onFilterInput(col.field, $event)"
                :options="col.filter.options"
                :optionLabel="col.filter.optionLabel || 'name'"
                :optionValue="col.filter.optionValue"
                :placeholder="col.filter.placeholder || 'Выбрать'"
                class="p-column-filter"
                showClear
                filter
                :filterFields="col.filter.filterFields || [col.filter.optionLabel || 'name']"
                :virtualScrollerOptions="{ itemSize: 38 }"
                filterPlaceholder="Поиск..."
            />
            <!-- Date Range Filter -->
            <DatePicker
                v-if="col.filter.type === 'dateRange'"
                v-model="filters[col.field].value"
                @update:model-value="onFilterInput(col.field, $event)"
                selection-mode="range"
                :manual-input="true"
                date-format="dd.mm.yy"
                class="p-column-filter"
                :placeholder="col.filter.placeholder || 'Диапазон дат'"
                style="min-width: 210px"
                show-clear
            />
            <!-- Single Date Filter -->
            <DatePicker
                v-if="col.filter.type === 'date'"
                v-model="filters[col.field].value"
                @update:model-value="onFilterInput(col.field, $event)"
                selection-mode="single"
                :manual-input="true"
                date-format="dd.mm.yy"
                class="p-column-filter"
                :placeholder="col.filter.placeholder || 'Дата'"
                style="min-width: 100px"
                show-clear
            />
            <!-- Validation Error Message -->
            <small v-if="filterErrors[col.field]" class="p-error mt-1">
              {{ filterErrors[col.field] }}
            </small>
          </div>
        </template>
      </Column>

      <slot name="columns-append"></slot>

      <!-- Actions Column -->
      <Column
          v-if="props.actionColumn.actions?.length"
          :header="props.actionColumn?.header || ''"
          style="min-width: 8rem; text-align: center;"
          :frozen="getFrozen(props.actionColumn.frozen)"
          :alignFrozen="getFrozenSide(props.actionColumn.frozen)"
      >
        <template #body="{ data }">
          <template v-for="(action, index) in props.actionColumn.actions" :key="index">
            <Button
                v-if="!action.isVisible || action.isVisible(data)"
                :icon="typeof action.icon === 'function' ? action.icon(data) : action.icon"
                :severity="action.severity"
                :aria-label="action.tooltip"
                v-tooltip.top="action.tooltip"
                :disabled="action.disabled ? action.disabled(data) : false"
                @click="action.onClick(data)"
                class="mr-2"
                outlined
                rounded
            />
          </template>
        </template>
      </Column>

      <template #empty>
        Нет данных.
      </template>
    </PrimeDataTable>
  </div>
</template>