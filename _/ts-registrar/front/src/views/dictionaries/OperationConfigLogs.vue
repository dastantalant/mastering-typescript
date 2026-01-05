<script setup>
import {FilterMatchMode} from '@primevue/core/api';
import {useToast} from 'primevue/usetoast';
import {onMounted, ref, computed} from 'vue';
import OperationConfig from '../../services/dictionary/operation-config.service.js';
import { defaultEntityChanges, defaultEntityChangesFilter } from '@/models/dictionary/entity-changes.model.js';

const toast = useToast();
const dt = ref();
const entityChanges = ref([]);
const allEntityChanges = ref([]);
const entityChangeDialog = ref(false);
const entityChange = ref({...defaultEntityChanges});
const filtersDialog = ref(false);
const loading = ref(false);
const exportLoading = ref(false);

const filters = ref({
  global: {value: null, matchMode: FilterMatchMode.CONTAINS}
});

const filterForm = ref({...defaultEntityChangesFilter});

const entityOptions = ref([]);
const actionOptions = ref([
  {label: 'Создание', value: 'CREATE'},
  {label: 'Изменение', value: 'UPDATE'},
  {label: 'Удаление', value: 'DELETE'}
]);

const userOptions = ref([]);

const operationConfig = new OperationConfig();

const totalRecords = computed(() => entityChanges.value?.length || 0);

const filteredRecordsCount = computed(() => {
  if (!entityChanges.value) return 0;
  return entityChanges.value.length;
});

const hasActiveFilters = computed(() => {
  return Object.values(filterForm.value).some(value => value !== null && value !== undefined && value !== '');
});

const fieldLabels = {
  name: 'Название операции',
  dayStartTime: 'Начало дня',
  dayEndTime: 'Конец дня',
  nightStartTime: 'Начало ночи',
  nightEndTime: 'Конец ночи',
  requestsLimitEnabled: 'Лимит запросов включен',
  requestsLimit: 'Максимальный лимит',
  blocked: 'Заблокирован',
  deleteDate: 'Дата удаления',
  createdAt: 'Дата создания',
  modifiedAt: 'Дата изменения',
  operation: 'Операция',
  configItems: 'Детали конфигурации',
  uploadedOperationData: 'Загруженные данные операции',
  'operation.name': 'Название операции',
  'operation.type': 'Тип операции',
  'operation.organization.name': 'Организация'
};

const operationTypeLabels = {
  MANUAL_DATA_UPLOAD: 'Ручная загрузка данных',
  CORRESPONDENCE: 'Корреспонденция',
  REGISTRAR: 'Система регистратор'
};

const hiddenFields = [
  'createdAt',
  'modifiedAt',
  'deleteDate',
  'createdBy',
  'updatedBy',
  'createdUser',
  'updatedUser'
];

onMounted(() => {
  findAll();
});

function findAll() {
  loading.value = true;
  operationConfig.getHistory()
      .then((data) => {
        const processedData = data.map(item => {
          const processed = {...item};

          if (item.newValue && item.action === 'UPDATE') {
            try {
              const parsed = JSON.parse(item.newValue);
              if (parsed.deleteDate) {
                processed.action = 'DELETE';
                processed.actionName = 'Удаление';
              }
            } catch (e) {
            }
          }

          return processed;
        });

        entityChanges.value = processedData;
        allEntityChanges.value = processedData;

        const uniqueEntities = [...new Set(processedData.map(item => item.entity))];
        entityOptions.value = uniqueEntities.map(entity => ({
          label: entity,
          value: entity
        }));

        const uniqueUsers = [...new Set(processedData.map(item => item.createdBy))];
        userOptions.value = uniqueUsers.map(user => ({
          label: user,
          value: user
        }));
      })
      .catch((error) => {
        toast.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: error.message || 'Ошибка при загрузке данных',
          life: 5000
        });
      })
      .finally(() => {
        loading.value = false;
      });
}

function viewEntityChange(entityChangeData) {
  entityChange.value = {...entityChangeData};
  entityChangeDialog.value = true;
}

function hideDialog() {
  entityChangeDialog.value = false;
}

function hideFiltersDialog() {
  filtersDialog.value = false;
}

function clearFilters() {
  filterForm.value = {...defaultEntityChangesFilter};
  entityChanges.value = [...allEntityChanges.value];
}

function applyFilters() {
  loading.value = true;

  let filteredData = [...allEntityChanges.value];

  if (filterForm.value.entity) {
    filteredData = filteredData.filter(item => item.entity === filterForm.value.entity);
  }

  if (filterForm.value.action) {
    filteredData = filteredData.filter(item => item.action === filterForm.value.action);
  }

  if (filterForm.value.user) {
    filteredData = filteredData.filter(item =>
        item.createdBy.toLowerCase().includes(filterForm.value.user.toLowerCase())
    );
  }

  if (filterForm.value.originalId) {
    filteredData = filteredData.filter(item =>
        item.originalId.toString() === filterForm.value.originalId.toString()
    );
  }

  if (filterForm.value.startDate) {
    const startDate = new Date(filterForm.value.startDate);
    filteredData = filteredData.filter(item => {
      const itemDate = parseDate(item.cts);
      return itemDate >= startDate;
    });
  }

  if (filterForm.value.endDate) {
    const endDate = new Date(filterForm.value.endDate);
    endDate.setHours(23, 59, 59, 999);
    filteredData = filteredData.filter(item => {
      const itemDate = parseDate(item.cts);
      return itemDate <= endDate;
    });
  }

  entityChanges.value = filteredData;
  filtersDialog.value = false;
  loading.value = false;
}

function parseDate(dateString) {
  const [datePart, timePart] = dateString.split(' ');
  const [day, month, year] = datePart.split('.');
  const [hours, minutes, seconds] = timePart.split(':');

  return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
      parseInt(seconds)
  );
}

function exportCSV() {
  exportLoading.value = true;
  try {
    dt.value.exportCSV();
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Данные экспортированы в CSV',
      life: 3000
    });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Ошибка при экспорте данных',
      life: 5000
    });
  } finally {
    exportLoading.value = false;
  }
}

function getActionSeverity(action) {
  switch (action) {
    case 'CREATE':
      return 'success';
    case 'UPDATE':
      return 'info';
    case 'DELETE':
      return 'danger';
    default:
      return 'secondary';
  }
}


function formatValueForDisplay(value) {
  if (value === null || value === undefined) return '';

  if (typeof value === 'boolean') {
    return value ? 'Да' : 'Нет';
  }

  if (typeof value === 'string') {
    if (value.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return value.substring(0, 5);
    }

    if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      return new Date(value).toLocaleString('ru-RU');
    }

    if (operationTypeLabels[value]) {
      return operationTypeLabels[value];
    }
  }

  return value;
}


function getFilteredChanges(newValue) {
  if (!newValue) return {};

  try {
    const parsed = JSON.parse(newValue);
    const filtered = {};

    for (const [key, value] of Object.entries(parsed)) {
      if (!hiddenFields.includes(key)) {
        if (key === 'operation' && typeof value === 'object' && value !== null) {
          const operationData = {};
          if (value.name) operationData.name = value.name;
          if (value.type) operationData.type = value.type;
          if (value.organization && value.organization.name) {
            operationData.organizationName = value.organization.name;
          }
          if (Object.keys(operationData).length > 0) {
            filtered[key] = operationData;
          }
        } else {
          filtered[key] = value;
        }
      }
    }

    return filtered;
  } catch (e) {
    return {};
  }
}

function getShortValue(newValue) {
  if (!newValue) return '';

  const filtered = getFilteredChanges(newValue);
  const keys = Object.keys(filtered);

  if (keys.length === 0) return 'Системные изменения';

  if (keys.length === 1) {
    const key = keys[0];
    const value = filtered[key];

    if (key === 'operation' && typeof value === 'object' && value !== null) {
      const operationChanges = [];
      if (value.name) operationChanges.push(`Название: ${value.name}`);
      if (value.type) operationChanges.push(`Тип: ${operationTypeLabels[value.type] || value.type}`);
      if (value.organizationName) operationChanges.push(`Организация: ${value.organizationName}`);

      const displayText = operationChanges.join(', ');
      return displayText.length > 50 ? displayText.substring(0, 50) + '...' : displayText;
    } else {
      const fieldLabel = fieldLabels[key] || key;
      const formattedValue = formatValueForDisplay(value);

      if (typeof value === 'object' && value !== null) {
        return `${fieldLabel}: изменен`;
      }

      const displayValue = formattedValue.toString();
      if (displayValue.length > 50) {
        return `${fieldLabel}: ${displayValue.substring(0, 50)}...`;
      }
      return `${fieldLabel}: ${displayValue}`;
    }
  }

  return `${keys.length} изменений`;
}

function getChangesSummary(newValue) {
  if (!newValue) return '';

  const filtered = getFilteredChanges(newValue);
  const keys = Object.keys(filtered);

  if (keys.length === 0) return 'Системные поля';

  return keys.map(key => {
    if (key === 'operation') {
      return 'Операция';
    }
    return fieldLabels[key] || key;
  }).join(', ');
}

function resetFiltersAndRefresh() {
  clearFilters();
  findAll();
}

function formatHumanReadableDetails(newValue) {
  if (!newValue) return '';

  const filtered = getFilteredChanges(newValue);
  const details = [];

  for (const [key, value] of Object.entries(filtered)) {
    const fieldLabel = fieldLabels[key] || key;

    if (key === 'operation' && typeof value === 'object' && value !== null) {
      if (value.name) {
        details.push(`${fieldLabels['operation.name'] || 'Название операции'}: ${value.name}`);
      }
      if (value.type) {
        const typeLabel = operationTypeLabels[value.type] || value.type;
        details.push(`${fieldLabels['operation.type'] || 'Тип операции'}: ${typeLabel}`);
      }
      if (value.organizationName) {
        details.push(`${fieldLabels['operation.organization.name'] || 'Организация'}: ${value.organizationName}`);
      }
    } else {
      const formattedValue = formatValueForDisplay(value);

      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          details.push(`${fieldLabel}: [${value.length} элементов]`);
        } else {
          details.push(`${fieldLabel}: ${JSON.stringify(value, null, 2)}`);
        }
      } else {
        details.push(`${fieldLabel}: ${formattedValue}`);
      }
    }
  }

  return details.length > 0 ? details.join('\n') : 'Системные изменения';
}

</script>

<template>
  <div class="layout-main">
    <div class="card">
      <Toolbar class="mb-6">
        <template #start>
          <div class="flex items-center gap-3">
            <i class="pi pi-history text-2xl"></i>
            <h4 class="m-0">История изменений конфигурации вознаграждения</h4>
          </div>
        </template>

        <template #end>
          <div class="flex gap-2">
            <Button
                :label="hasActiveFilters ? 'Фильтры *' : 'Фильтры'"
                icon="pi pi-filter"
                :severity="hasActiveFilters ? 'warn' : 'secondary'"
                @click="filtersDialog = true"
            />
            <Button
                label="Сброс"
                icon="pi pi-refresh"
                severity="secondary"
                @click="resetFiltersAndRefresh"
                :disabled="loading"
            />
            <Button
                label="Экспорт"
                icon="pi pi-upload"
                severity="secondary"
                @click="exportCSV"
                :loading="exportLoading"
            />
          </div>
        </template>
      </Toolbar>

      <DataTable
          ref="dt"
          :value="entityChanges"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          :loading="loading"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Показано с {first} по {last} из {totalRecords} изменений"
          :sortOrder="-1"
          sortField="cts"
          responsiveLayout="scroll"
          :emptyMessage="loading ? 'Загрузка...' : 'Нет данных'"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <div class="flex items-center gap-4">
              <h4 class="m-0">Управление Историей Изменений</h4>
              <div class="flex items-center gap-2">
                <span v-if="hasActiveFilters" class="text-sm">
                  (отфильтровано: {{ filteredRecordsCount }})
                </span>
              </div>
            </div>
            <IconField>
              <InputIcon>
                <i class="pi pi-search"/>
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Поиск..."/>
            </IconField>
          </div>
        </template>

        <Column field="cts" header="Дата/Время" sortable style="min-width: 12rem">
          <template #body="slotProps">
            <div class="flex flex-col">
              <span class="font-semibold">{{ slotProps.data.cts.split(' ')[0] }}</span>
              <span class="text-sm text-surface-600">{{ slotProps.data.cts.split(' ')[1] }}</span>
            </div>
          </template>
        </Column>

        <Column field="actionName" header="Действие" sortable style="min-width: 10rem">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <Tag
                  :value="slotProps.data.actionName"
                  :severity="getActionSeverity(slotProps.data.action)"
              />
            </div>
          </template>
        </Column>

        <Column field="originalId" header="ID записи" sortable style="min-width: 12rem">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <span class="font-mono px-3 py-2 rounded text-base">
                {{ slotProps.data.originalId }}
              </span>
            </div>
          </template>
        </Column>

        <Column field="createdBy" header="Пользователь" sortable style="min-width: 10rem">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <i class="pi pi-user"></i>
              <span>{{ slotProps.data.createdBy }}</span>
            </div>
          </template>
        </Column>

        <Column field="newValue" header="Изменения" style="min-width: 25rem">
          <template #body="slotProps">
            <div class="max-w-lg">
              <div class="text-sm mb-1">
                {{ getShortValue(slotProps.data.newValue) }}
              </div>
              <div class="text-xs text-surface-500" v-if="getChangesSummary(slotProps.data.newValue)">
                Поля: {{ getChangesSummary(slotProps.data.newValue) }}
              </div>
            </div>
          </template>
        </Column>

        <Column :exportable="false" style="min-width: 8rem">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button
                  icon="pi pi-eye"
                  outlined
                  rounded
                  @click="viewEntityChange(slotProps.data)"
                  v-tooltip.top="'Посмотреть детали'"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="filtersDialog" :style="{ width: '700px' }" header="Фильтры" :modal="true">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="entityFilter" class="block font-bold mb-2">Сущность:</label>
          <Select
              id="entityFilter"
              v-model="filterForm.entity"
              :options="entityOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Выберите сущность"
              class="w-full"
              showClear
          />
        </div>

        <div>
          <label for="actionFilter" class="block font-bold mb-2">Действие:</label>
          <Select
              id="actionFilter"
              v-model="filterForm.action"
              :options="actionOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Выберите действие"
              class="w-full"
              showClear
          />
        </div>

        <div>
          <label for="userFilter" class="block font-bold mb-2">Пользователь:</label>
          <Select
              id="userFilter"
              v-model="filterForm.user"
              :options="userOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Выберите пользователя"
              class="w-full"
              showClear
              editable
          />
        </div>

        <div>
          <label for="originalIdFilter" class="block font-bold mb-2">ID записи:</label>
          <InputNumber
              id="originalIdFilter"
              v-model="filterForm.originalId"
              placeholder="Введите ID"
              class="w-full"
          />
        </div>

        <div>
          <label for="startDate" class="block font-bold mb-2">Дата с:</label>
          <Calendar
              id="startDate"
              v-model="filterForm.startDate"
              placeholder="Выберите дату"
              class="w-full"
              showIcon
              dateFormat="dd.mm.yy"
          />
        </div>

        <div>
          <label for="endDate" class="block font-bold mb-2">Дата по:</label>
          <Calendar
              id="endDate"
              v-model="filterForm.endDate"
              placeholder="Выберите дату"
              class="w-full"
              showIcon
              dateFormat="dd.mm.yy"
          />
        </div>
      </div>

      <div class="mt-4 p-3 rounded-lg">
        <div class="flex items-center gap-2">
          <i class="pi pi-info-circle"></i>
          <span class="text-sm">
            Активные фильтры: {{ Object.values(filterForm).filter(v => v !== null && v !== undefined && v !== '').length }}
          </span>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <Button
              label="Сброс"
              icon="pi pi-refresh"
              severity="secondary"
              @click="clearFilters"
          />
          <div class="flex gap-2">
            <Button
                label="Применить"
                icon="pi pi-check"
                @click="applyFilters"
            />
            <Button
                label="Закрыть"
                icon="pi pi-times"
                severity="secondary"
                @click="hideFiltersDialog"
            />
          </div>
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="entityChangeDialog" :style="{ width: '900px' }" header="Детали изменения" :modal="true">
      <div class="flex flex-col gap-6">
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block font-bold mb-2">Дата/Время:</label>
            <div class="flex items-center gap-2">
              <span class="text-lg">{{ entityChange.cts }}</span>
            </div>
          </div>

          <div>
            <label class="block font-bold mb-2">Действие:</label>
            <div class="flex items-center gap-2">
              <Tag
                  :value="entityChange.actionName"
                  :severity="getActionSeverity(entityChange.action)"
                  class="text-lg"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold mb-2">Сущность:</label>
            <div class="flex items-center gap-2">
              <i class="pi pi-database"></i>
              <span class="text-lg font-semibold">{{ entityChange.entity }}</span>
            </div>
          </div>

          <div>
            <label class="block font-bold mb-2">ID записи:</label>
            <div class="flex items-center gap-2">
              <span class="text-lg font-mono px-2 py-1 rounded">
                {{ entityChange.originalId }}
              </span>
            </div>
          </div>

          <div>
            <label class="block font-bold mb-2">Пользователь:</label>
            <div class="flex items-center gap-2">
              <i class="pi pi-user"></i>
              <span class="text-lg">{{ entityChange.createdBy }}</span>
            </div>
          </div>

          <div>
            <label class="block font-bold mb-2">ID изменения:</label>
            <div class="flex items-center gap-2">
              <span class="text-sm font-mono text-surface-600">
                {{ entityChange.id }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="entityChange.newValue">
          <div class="flex items-center justify-between mb-3">
            <label class="block font-bold">Изменения</label>
          </div>
          <div class="border rounded-lg p-4 ">
            <pre class="text-sm overflow-auto max-h-96 whitespace-pre-wrap">{{ formatHumanReadableDetails(entityChange.newValue) }}</pre>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Закрыть" icon="pi pi-times" @click="hideDialog"/>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
</style>