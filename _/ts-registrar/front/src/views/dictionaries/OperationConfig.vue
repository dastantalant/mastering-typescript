<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, computed, watch } from 'vue';
import OperationConfigService from '../../services/dictionary/operation-config.service.js';
import OrganizationService from '../../services/dictionary/organization.service.js';
import OperationService from '../../services/dictionary/operation.service.js';
import { useRouter } from 'vue-router'
import EntityChanges from '../../components/EntityChanges.vue';
const toast = useToast();
const dt = ref();
const operationConfigs = ref();
const operationConfigDialog = ref(false);
const deleteOperationConfigDialog = ref(false);
const uploadDialog = ref(false);
const operationConfig = ref({});
const selectedFile = ref(null);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const entityChangesDialog = ref(false);
const entityChanges = ref();
const loadingEntityChangesId = ref(null);
const configItems = ref([]);
const editingConfigId = ref(null);
const loadingConfigItems = ref(false);
const router = useRouter()
const operationConfigService = new OperationConfigService();
const organizationService = new OrganizationService();
const operationService = new OperationService();

const operationTypeLabels = {
  MANUAL_DATA_UPLOAD: 'Ручная загрузка данных',
  CORRESPONDENCE: 'Корреспонденция',
  REGISTRAR: 'Система регистратор'
};

const operationStatuses = [
  { label: 'Принят', value: 'ACCEPTED' },
  { label: 'Отклонен', value: 'REJECTED' },
  { label: 'Проверен', value: 'CHECKED' }
];

const operationTypes = [
  { label: 'Ручная загрузка данных', value: 'MANUAL_DATA_UPLOAD' },
  { label: 'Корреспонденция', value: 'CORRESPONDENCE' },
  { label: 'Система регистратор', value: 'REGISTRAR' }
];

const organizations = ref([]);
const operations = ref([]);

onMounted(() => {
  findAll();
  loadOrganizations();
  loadOperations();
});

function loadOrganizations() {
  organizationService.findAll().then((data) => {
    organizations.value = data;
  }).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function loadOperations() {
  operationService.findAll().then((data) => {
    operations.value = data;
  }).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

async function viewEntityChangesHistory(reason) {
  loadingEntityChangesId.value = reason.id;
  try {
    entityChanges.value = await operationConfigService.findHistoryById(reason.id);
    entityChangesDialog.value = true;
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка загрузки истории',
      detail: error,
      life: 5000
    });
  } finally {
    loadingEntityChangesId.value = null;
  }
}

function hideDialogEntityChanges() {
  entityChanges.value = {};
  entityChangesDialog.value = false;
}

function findAll() {
  operationConfigService.findAll().then((data) => {
    operationConfigs.value = data;
  }).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

async function loadConfigItems(operationId) {
  if (!operationId) return;

  loadingConfigItems.value = true;
  try {
    const response = await operationService.getConfigItems(operationId);
    configItems.value = response || [];
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось загрузить детали конфигурации',
      life: 5000
    });
    configItems.value = [];
  } finally {
    loadingConfigItems.value = false;
  }
}

function addConfigItem() {
  const newItem = {
    status: 'ACCEPTED',
    dayRewardPrice: 0,
    nightRewardPrice: 0,
    requestProcessingTime: 0
  };
  configItems.value.push(newItem);
}

function removeConfigItem(index) {
  configItems.value.splice(index, 1);
}

function createEmptyConfigItem() {
  return {
    status: 'ACCEPTED',
    dayRewardPrice: 0,
    nightRewardPrice: 0,
    requestProcessingTime: 0
  };
}

function openNew() {
  operationConfig.value = {
    name: '',
    operation: {
      id: null,
      name: '',
      type: null,
      organization: {
        id: null,
        name: ''
      }
    },
    dayStartTime: '09:00',
    dayEndTime: '21:00',
    nightStartTime: '21:00',
    nightEndTime: '09:00',
    requestsLimitEnabled: false,
    requestsLimit: null,
    blocked: false
  };
  configItems.value = [];
  editingConfigId.value = null;
  submitted.value = false;
  operationConfigDialog.value = true;
}

const filteredOperations = computed(() => {
  if (!operations.value || !Array.isArray(operations.value)) return [];

  return operations.value.filter(op => {
    if (!operationConfig.value.operation?.organization?.id &&
        !operationConfig.value.operation?.type) {
      return true;
    }

    const matchesOrg = !operationConfig.value.operation?.organization?.id ||
        op.organization?.id === operationConfig.value.operation.organization.id;

    const matchesType = !operationConfig.value.operation?.type ||
        op.type === operationConfig.value.operation.type;

    return matchesOrg && matchesType;
  });
});

function hideDialog() {
  operationConfigDialog.value = false;
  submitted.value = false;
  configItems.value = [];
  editingConfigId.value = null;
}

function goToLogs() {
  router.push({ name: 'operationConfigLogs' })
      .catch(error => {
        console.error('Navigation error:', error)
      })
}

function saveOperationConfig() {
  submitted.value = true;

  if (operationConfig?.value.name?.trim() && operationConfig?.value.operation?.id) {
    const validConfigItems = configItems.value.filter(item =>
        item.status &&
        item.dayRewardPrice !== null &&
        item.nightRewardPrice !== null &&
        item.requestProcessingTime !== null
    );

    const configItemsWithOperationId = validConfigItems.map(item => ({
      ...item,
      operationId: operationConfig.value.operation.id
    }));

    const configToSave = {
      ...operationConfig.value,
      configItems: configItemsWithOperationId
    };

    operationConfigService
        .save(configToSave)
        .then((savedConfig) => {
          toast.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Конфигурация операции сохранена',
            life: 3000
          });
          findAll();
          hideDialog();
        }).catch((error) => {
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: error,
        life: 5000
      });
    });
  }
}


function editOperationConfig(config) {
  operationConfig.value = { ...config };
  editingConfigId.value = config.id;

  if (config.operation?.id) {
    loadConfigItems(config.operation.id);
  } else {
    configItems.value = [createEmptyConfigItem()];
  }

  operationConfigDialog.value = true;
}

function confirmDeleteOperationConfig(config) {
  operationConfig.value = config;
  deleteOperationConfigDialog.value = true;
}

function deleteOperationConfig() {
  operationConfigService
      .delete(operationConfig.value.id)
      .then(() => {
        operationConfigs.value = operationConfigs.value.filter((val) => val.id !== operationConfig.value.id);
        deleteOperationConfigDialog.value = false;
        operationConfig.value = {};
        toast.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Конфигурация операции удалена',
          life: 3000
        });
      }).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function openUploadDialog(config) {
  operationConfig.value = config;
  uploadDialog.value = true;
}

function uploadRewards() {
  if (!selectedFile.value) {
    toast.add({
      severity: 'warn',
      summary: 'Предупреждение',
      detail: 'Выберите файл для загрузки',
      life: 3000
    });
    return;
  }

  operationConfigService
      .uploadRewards(operationConfig.value.id, selectedFile.value)
      .then(() => {
        toast.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Файл загружен успешно',
          life: 3000
        });
        uploadDialog.value = false;
        selectedFile.value = null;
        findAll();
      }).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function onFileSelect(event) {
  selectedFile.value = event.files[0];
}

function exportCSV() {
  dt.value.exportCSV();
}

function formatTime(time) {
  if (!time) return '';
  return time.substring(0, 5);
}

watch(() => operationConfig.value.operation?.id, (newOperationId) => {
  if (newOperationId && editingConfigId.value) {
    loadConfigItems(newOperationId);
  }  else if (newOperationId && !editingConfigId.value) {
    configItems.value = [];
  } else {
    configItems.value = [];
  }
});
</script>

<template>
  <div class="layout-main">
    <div class="card">
      <Toolbar class="mb-6">
        <template #start>
          <Button label="Создать" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew"/>
        </template>

        <template #end>
          <Button label="Логи" icon="pi pi-filter" severity="secondary" class="mr-2" @click="goToLogs"/>
          <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)"/>
        </template>
      </Toolbar>

      <DataTable
          ref="dt"
          :value="operationConfigs"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Показано с {first} по {last} из {totalRecords} конфигураций"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Управление Конфигурациями Операций</h4>
            <IconField>
              <InputIcon>
                <i class="pi pi-search"/>
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Поиск..."/>
            </IconField>
          </div>
        </template>

        <Column header="Тип операции" style="min-width: 12rem">
          <template #body="slotProps">
            {{ slotProps.data.operation ? (operationTypeLabels[slotProps.data.operation.type] || slotProps.data.operation.type) : 'Не указано' }}
          </template>
        </Column>
        <Column field="name" header="Наименование" sortable style="min-width: 16rem"></Column>
        <Column field="operation.name" header="Операция" sortable style="min-width: 14rem"></Column>
        <Column field="operation.organization.name" header="Организация" sortable style="min-width: 12rem"></Column>
        <Column header="Время работы" style="min-width: 12rem">
          <template #body="slotProps">
            <div class="text-sm">
              <div>День: {{ formatTime(slotProps.data.dayStartTime) }} - {{ formatTime(slotProps.data.dayEndTime) }}</div>
              <div>Ночь: {{ formatTime(slotProps.data.nightStartTime) }} - {{ formatTime(slotProps.data.nightEndTime) }}</div>
            </div>
          </template>
        </Column>
        <Column header="Статус" style="min-width: 10rem">
          <template #body="slotProps">
            <Tag :value="slotProps.data.blocked ? 'Заблокирован' : 'Активен'"
                 :severity="slotProps.data.blocked ? 'danger' : 'success'"/>
          </template>
        </Column>
        <Column :exportable="false" style="min-width: 16rem">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editOperationConfig(slotProps.data)"
                    v-tooltip="'Редактировать'"/>
            <Button icon="pi pi-upload" outlined rounded severity="info" class="mr-2"
                    @click="openUploadDialog(slotProps.data)"/>
            <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2"
                    @click="confirmDeleteOperationConfig(slotProps.data)"
                    v-tooltip="'Удалить'"/>
            <Button :icon="loadingEntityChangesId === slotProps.data.id ? 'pi pi-spin pi-spinner' : 'pi pi-history'"
                    outlined rounded
                    @click="viewEntityChangesHistory(slotProps.data)"
                    severity="help"
                    v-tooltip="'История изменений'"
                    :loading="loadingEntityChangesId === slotProps.data.id"/>
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="operationConfigDialog" :style="{ width: '1200px' }" header="Детали Конфигурации вознаграждения" :modal="true">
      <div class="flex flex-col gap-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-bold mb-3">Название организации</label>
            <Select v-model="operationConfig.operation.organization.id"
                    :options="organizations"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Выберите название организации"
                    class="w-full" />
          </div>

          <div>
            <label class="block font-bold mb-3">Тип операции</label>
            <Select v-model="operationConfig.operation.type"
                    :options="operationTypes"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Выберите тип операции"
                    class="w-full" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-bold mb-3">Каталог операций</label>
            <Select v-model="operationConfig.operation.id"
                    :options="filteredOperations"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Выберите операцию"
                    class="w-full" />
          </div>

          <div>
            <label for="name" class="block font-bold mb-3">Название конфигурации</label>
            <InputText id="name" v-model.trim="operationConfig.name" required="true" autofocus
                       :invalid="submitted && !operationConfig.name" fluid/>
            <small v-if="submitted && !operationConfig.name" class="text-red-500">Название конфигурации обязательно.</small>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-4">
          <div>
            <label class="block font-bold mb-3">Начало дня</label>
            <InputMask v-model="operationConfig.dayStartTime" mask="99:99" placeholder="09:00"/>
          </div>
          <div>
            <label class="block font-bold mb-3">Конец дня</label>
            <InputMask v-model="operationConfig.dayEndTime" mask="99:99" placeholder="21:00"/>
          </div>
          <div>
            <label class="block font-bold mb-3">Начало ночи</label>
            <InputMask v-model="operationConfig.nightStartTime" mask="99:99" placeholder="21:00"/>
          </div>
          <div>
            <label class="block font-bold mb-3">Конец ночи</label>
            <InputMask v-model="operationConfig.nightEndTime" mask="99:99" placeholder="09:00"/>
          </div>
        </div>

        <div class="border rounded-lg p-4 surface-card">
          <div class="flex justify-between items-center mb-4">
            <h5 class="m-0">Детали конфигурации</h5>
            <Button
                label="Добавить конфигурацию"
                icon="pi pi-plus"
                size="small"
                class="p-button-outlined"
                @click="addConfigItem"
            />
          </div>

          <div v-if="loadingConfigItems" class="text-center p-4">
            <ProgressSpinner style="width: 50px; height: 50px" />
            <p>Загрузка конфигураций...</p>
          </div>

          <div v-else-if="configItems.length === 0" class="text-center p-4 text-color-secondary">
            <p>Нет конфигураций. Добавьте первую конфигурацию.</p>
          </div>

          <div v-else class="space-y-4">
            <div
                v-for="(item, index) in configItems"
                :key="index"
                class="border rounded-lg p-4 surface-ground"
            >
              <div class="flex justify-between items-center mb-3">
                <h6 class="font-semibold">Конфигурация {{ index + 1 }}</h6>
                <Button
                    icon="pi pi-trash"
                    size="small"
                    severity="danger"
                    outlined
                    @click="removeConfigItem(index)"
                    v-if="configItems.length > 1"
                />
              </div>

              <div class="grid grid-cols-4 gap-4">
                <div>
                  <label class="block font-bold mb-2">Статус</label>
                  <Select v-model="item.status"
                          :options="operationStatuses"
                          optionLabel="label"
                          optionValue="value"
                          class="w-full"
                          disabled />
                </div>
                <div>
                  <label class="block font-bold mb-2">Стоимость День</label>
                  <InputNumber v-model="item.dayRewardPrice"
                               :min="0"
                               mode="decimal"
                               :minFractionDigits="2"
                               :maxFractionDigits="2"
                               class="w-full" />
                </div>
                <div>
                  <label class="block font-bold mb-2">Стоимость Ночь</label>
                  <InputNumber v-model="item.nightRewardPrice"
                               :min="0"
                               mode="decimal"
                               :minFractionDigits="2"
                               :maxFractionDigits="2"
                               class="w-full" />
                </div>
                <div>
                  <label class="block font-bold mb-2">Время на операцию (сек)</label>
                  <InputNumber v-model="item.requestProcessingTime"
                               :min="0"
                               class="w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-bold mb-3">Максимальный лимит</label>
            <div class="flex items-center gap-2">
              <Checkbox v-model="operationConfig.requestsLimitEnabled" binary/>
              <label>Включить лимит</label>
            </div>
            <InputNumber v-if="operationConfig.requestsLimitEnabled"
                         v-model="operationConfig.requestsLimit"
                         class="mt-2 w-full" placeholder="Количество запросов"/>
          </div>

          <div class="flex items-center gap-2 mt-8">
            <Checkbox v-model="operationConfig.blocked" binary/>
            <label class="font-bold">Блокирован</label>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Отменить" icon="pi pi-times" text @click="hideDialog"/>
        <Button label="Сохранить" icon="pi pi-check" @click="saveOperationConfig"/>
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteOperationConfigDialog" :style="{ width: '450px' }" header="Подтверждение" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl"/>
        <span v-if="operationConfig">
          Вы точно хотите удалить конфигурацию <b>{{ operationConfig.name }}</b>?
        </span>
      </div>
      <template #footer>
        <Button label="Нет" icon="pi pi-times" text @click="deleteOperationConfigDialog = false"/>
        <Button label="Да" icon="pi pi-check" @click="deleteOperationConfig"/>
      </template>
    </Dialog>

    <Dialog v-model:visible="uploadDialog" :style="{ width: '450px' }" header="Загрузка файла вознаграждений" :modal="true">
      <div class="flex flex-col gap-4">
        <p>Загрузите файл с данными вознаграждений для конфигурации: <b>{{ operationConfig.name }}</b></p>
        <FileUpload mode="basic" accept=".xlsx,.xls" :maxFileSize="1000000"
                    @select="onFileSelect" :auto="false" chooseLabel="Выберите файл"/>
      </div>
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="uploadDialog = false"/>
        <Button label="Загрузить" icon="pi pi-upload" @click="uploadRewards"/>
      </template>
    </Dialog>
    <Dialog v-model:visible="entityChangesDialog" :style="{ width: '1450px' }" header="История изменений"
            :modal="true">
      <EntityChanges :events="entityChanges"/>
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideDialogEntityChanges"/>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>

</style>