<script lang="ts" setup>
import {FilterMatchMode} from '@primevue/core/api';
import {useToast} from 'primevue/usetoast';
import {onMounted, ref} from 'vue';
import SubscriberService from '@/services/subscriber.service.ts';
import type {RegistrarFiosResponse, SubscriberFilter} from '@/models/subscriber.model.ts';
import EnumsService from '@/services/enums.service.ts';
import RegionService from "@/services/dictionary/region.service.js";
import router from "@/router";
import { useSubscriberStore } from '@/stores/subscribers.store.ts';
import UserService from "@/services/dictionary/user.service.ts";
import CountryService from "@/services/dictionary/country.service.ts";
import AuditEventHistory from "@/components/AuditEventHistory.vue";
import RegistrarService from "@/services/dictionary/registrar.service.ts";


const userService = new UserService();
const enumsService = new EnumsService();
const regionService = new RegionService();
const countryService = new CountryService();
const documentTypes = ref([]);
const persStatusName = ref([]);
const registrarFios = ref<RegistrarFiosResponse>({
  registrars: []
});
const webRegistrars = ref([]);
const channels = ref();
const regions = ref();
const countries = ref();
const toast = useToast();
const dt = ref();
const subscribers = ref([]);
const totalCount = ref(0);
const subscriberService = new SubscriberService();
const subscriberFilter = ref({
  page: 0,
  size: 10
} as SubscriberFilter);
const fullNameFilter = ref('');
const historyDialog = ref(false);
const oldHistoryDialog = ref(false);
const entityChanges = ref();
const selectedSubscriber = ref();
const subsStageEntityChangesDialog = ref(false);
const registrarService = new RegistrarService();
const supervisors = ref([]);

const filters = ref({
  global: {value: null, matchMode: FilterMatchMode.CONTAINS},
  msisdn: {value: null, matchMode: FilterMatchMode.CONTAINS},
  ban: {value: null, matchMode: FilterMatchMode.CONTAINS},
  lastName: {value: null, matchMode: FilterMatchMode.CONTAINS},
  firstName: {value: null, matchMode: FilterMatchMode.CONTAINS},
  middleName: {value: null, matchMode: FilterMatchMode.CONTAINS},
  countryCode: {value: null, matchMode: FilterMatchMode.CONTAINS},
  documentType: {value: null, matchMode: FilterMatchMode.CONTAINS},
  inn: {value: null, matchMode: FilterMatchMode.CONTAINS},
  persStatusName: {value: null, matchMode: FilterMatchMode.CONTAINS},
  createdDate: {value: null, matchMode: FilterMatchMode.CONTAINS},
  dssRegistrarId: {value: null, matchMode: FilterMatchMode.CONTAINS},
  registrarFio: {value: null, matchMode: FilterMatchMode.CONTAINS},
  supervisorFio: {value: null, matchMode: FilterMatchMode.CONTAINS},
  registrarMsisdn: {value: null, matchMode: FilterMatchMode.CONTAINS},
  webRegistrar: {value: null, matchMode: FilterMatchMode.CONTAINS},
  region: {value: null, matchMode: FilterMatchMode.CONTAINS},
  channelTypeName: {value: null, matchMode: FilterMatchMode.CONTAINS},
  isManual: {value: null, matchMode: FilterMatchMode.CONTAINS},
  isSimCardGift: {value: null, matchMode: FilterMatchMode.EQUALS},
  isBlocked: {value: null, matchMode: FilterMatchMode.EQUALS},
});

const onFullNameInput = () => {
  const value = fullNameFilter.value?.trim() || null;
  subscriberFilter.value.lastName = value;
  subscriberFilter.value.firstName = value;
  subscriberFilter.value.middleName = value;
  findAll();
};

const dateRange = ref({
  from: new Date(new Date().setHours(0, 0, 0, 0)),
  to: new Date(new Date().setDate(new Date().getDate() + 1))
});

const documentType = ref(null);
const webRegistrar = ref(null);

onMounted(async() => {
  findAll();
  findAllRegistrarChannel();
  findAllRegions();
  await findAllCountries();
  await loadRegistrarsByChannel();
  await loadSupervisorsByChannel();
  findAllWebRegistrars();
  findAllDocumentTypes();
  findAllPersonificationStatus();
});

function findAll() {
  if (dateRange.value.from && dateRange.value.to) {
    subscriberFilter.value.startDate = formatDateForBackend(dateRange.value.from);
    subscriberFilter.value.endDate = formatDateForBackend(dateRange.value.to);
  }
  subscriberService.findAll(subscriberFilter.value).then((result) => {
    subscribers.value = result.data;

    totalCount.value = result.totalRecords;
  }).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}


function getExcel() {
  subscriberService.exportPersonification('EXCEL', subscriberFilter.value)
      .catch(error => console.error('Export failed:', error));
}
function getPdf() {
  subscriberService.exportPersonification('PDF', subscriberFilter.value)
      .catch(error => console.error('Export failed:', error));
}

function pageCallback(event: any) {
  subscriberFilter.value.page = event.page;
  subscriberFilter.value.size = event.rows;
  findAll();
}

function onEdit(row: any) {
  const store = useSubscriberStore();
  store.setCurrent(row);
  router.push({ name: 'subscriber-edit', params: { id: row.id } });
}

function onView(row: any) {
  const store = useSubscriberStore();
  store.setCurrent(row);
  router.push({ name: 'subscriber-view', params: { id: row.id } });
}


function findAllDocumentTypes() {
  enumsService.findAllDocumentTypes().then((data) => {
    documentTypes.value = data;
  }).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка загрузки типов документов',
      detail: error,
      life: 5000
    });
  });
}

function findAllPersonificationStatus() {
  enumsService.findAllPersonificationStatus().then((data) => {
    persStatusName.value = data;
  }).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка загрузки статусов',
      detail: error,
      life: 5000
    });
  });
}


function findAllRegions() {
  regionService.findAll().then((data) => (regions.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка Регионов',
      detail: error,
      life: 5000
    });
  });
}

async function findAllCountries() {
  try {
    const data = await countryService.findAll();
    countries.value = [...data];

  } catch (error) {
    console.error('Failed to load countries:', error);
    toast.add({
      severity: 'error',
      summary: 'Ошибка загрузки стран',
      detail: error.message || 'Неизвестная ошибка',
      life: 5000
    });
  }
}

function findAllRegistrarChannel() {
  enumsService.findAllRegistrarChanel().then((data) => (channels.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка Каналов',
      detail: error,
      life: 5000
    });
  });
}

function findAllWebRegistrars(){
  userService.findAll().then((data) => (webRegistrars.value = data.map(user => user.username))).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

async function loadRegistrarsByChannel() {
  try {
    const data = await registrarService.getByChannel("PROMOTER");
    registrarFios.value = data.map((r: any) => ({
      label: r.fio,
      value: r.fio
    }));  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка загрузки регистраторов',
      detail: error.message || error,
      life: 5000
    });
  }
}

async function loadSupervisorsByChannel() {
  try {
    const data = await registrarService.getByChannel("SUPERVISOR");
    supervisors.value = data.map((r: any) => ({
      label: r.fio,
      value: r.fio
    }));  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка загрузки регистраторов',
      detail: error.message || error,
      life: 5000
    });
  }
}


function filterDocumentTypeCallback(value: any) {
  subscriberFilter.value.documentType = value?.name || null;
  findAll();
}

function filterStateTypeCallback(value: any) {
  subscriberFilter.value.persStatus = value?.value || null;
  findAll();
}


function filterWebRegistrarFIOCallback(webRegistrar: any) {
  subscriberFilter.value.webRegistrar = webRegistrar;
  findAll();
}


function filterRegionCallback(region: any) {
  if (region.value === null)
    subscriberFilter.value.regionId = null;
  else
    subscriberFilter.value.regionId = region.value.id;
  findAll();

}

function filterCountryCallback(country: any) {
  if (country.value === null)
    subscriberFilter.value.countryCode = null;
  else
    subscriberFilter.value.countryCode = country.value.name;
  findAll();

}

function filterChannelTypeCallback(value: any) {
  if (value === null || value === undefined) {
    subscriberFilter.value.channelType = null;
  } else if (typeof value === 'object' && value !== null) {
    subscriberFilter.value.channelType = value.value || value.id || value.name || null;
  } else if (typeof value === 'string' || typeof value === 'number') {
    subscriberFilter.value.channelType = value;
  } else {
    subscriberFilter.value.channelType = null;
  }
  findAll();
}

function filterFillingTypeCallback(value: any) {
  subscriberFilter.value.isManual = value?.value || null;
  findAll();
}

const formatDateForBackend = (date: Date): string => {
  const pad = (num: number): string => num.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
};

function filterCreatedDateCallback(value: any) {
  subscriberFilter.value.createdDate = formatDateForBackend(value);

  findAll();
}

const searchMsisdn = ref(0);

function filterMsisdnCallback(prmsisdn: any) {
  searchMsisdn.value = prmsisdn;
  setTimeout(() => {
    if (searchMsisdn.value === prmsisdn) {
      subscriberFilter.value.msisdn = prmsisdn
      findAll();
    }
  }, 1000);
}

const searchBan = ref(0);

function filterBanCallback(ban: any) {
  searchBan.value = ban;
  setTimeout(() => {
    if (searchBan.value === ban) {
      subscriberFilter.value.ban = ban
      findAll();
    }
  }, 1000);
}

const searchInn = ref(0);

function filterInnCallback(inn: any) {
  searchInn.value = inn;
  setTimeout(() => {
    if (searchInn.value === inn) {
      subscriberFilter.value.inn = inn
      findAll();
    }
  }, 1000);
}

const searchDssRegistrarId = ref(0);

function filterDssRegistrarIdCallback(id: any) {
  searchDssRegistrarId.value = id;
  setTimeout(() => {
    if (searchDssRegistrarId.value === id) {
      subscriberFilter.value.dssRegistrarId = id
      findAll();
    }
  }, 1000);
}
const searchRegistrarFio = ref(0);

function filterRegistrarFioCallback(fio: any) {
  searchRegistrarFio.value = fio;
  setTimeout(() => {
    if (searchRegistrarFio.value === fio) {
      subscriberFilter.value.registrarFio = fio;
      findAll();
    }
  }, 1000);
}

const searchRegistrarMsisdn = ref(0);

function filterRegistrarMsisdnCallback(msisdn: any) {
  searchRegistrarMsisdn.value = msisdn;
  setTimeout(() => {
    if (searchRegistrarMsisdn.value === msisdn) {
      subscriberFilter.value.registrarMsisdn = msisdn
      findAll();
    }
  }, 1000);
}

const searchSupervisorFio = ref(0);

function filterSupervisorFioCallback(fio: any) {
  searchSupervisorFio.value = fio;
  setTimeout(() => {
    if (searchSupervisorFio.value === fio) {
      subscriberFilter.value.supervisorFio = fio;
      findAll();
    }
  }, 1000);
}

function filterBlockedCallback(value: any) {
  subscriberFilter.value.isBlocked = value?.value;
  findAll();
}

function updateDocumentTypeFilter() {
  subscriberFilter.value.documentType = documentType.value?.name || null;
}

function updateWebRegistrarFilter() {
  subscriberFilter.value.webRegistrar = webRegistrar.value || null;
}


async function loadNewHistory(subscriberId: number) {
  try {
    const historyData = await subscriberService.findHistoryById(subscriberId);
    entityChanges.value = historyData;
    historyDialog.value = true;
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка загрузки истории',
      detail: error.message || 'Не удалось загрузить историю изменений',
      life: 5000
    });
  }
}

function openOldHistory(subscriberId: number) {
  selectedSubscriber.value = subscriberId;
  oldHistoryDialog.value = true;
}
function hideDialogEntityChanges() {
  entityChanges.value = {};
  subsStageEntityChangesDialog.value = false;
}

function viewEntityChangesHistory(subscriberId: number) {
  loadNewHistory(subscriberId);
  subsStageEntityChangesDialog.value = true;
}

function getPersStatusSeverity(statusName: string) {
  if (!statusName) return 'info';

  const translatedSeverityMap: Record<string, string> = {
    'В ожидании': 'warning',
    'В работе': 'info',
    'Принято': 'success',
    'Отклонено': 'danger',
    'В доработку': 'warning',
    'На исправление': 'warning',
    'Ожидает подтверждения': 'info',
    'Принято с подарком': 'success',
    'Отклонено с подарком': 'danger'
  };

  const enumSeverityMap: Record<string, string> = {
    'PENDING': 'warning',
    'SELECTED': 'info',
    'ACCEPTED': 'success',
    'REJECTED': 'danger',
    'REVISION': 'warning',
    'FOR_CORRECTION': 'warning',
    'WAITING_CONFIRMATION': 'info',
    'GIFT_ACCEPTED': 'success',
    'GIFT_REJECTED': 'danger'
  };

  return translatedSeverityMap[statusName] || enumSeverityMap[statusName] || 'info';
}
</script>

<template>
  <div class="layout-main-full">
    <div class="card">
      <div class="search-section mb-6 pl-0 p-4 border-round surface-card">
        <h2 class="mb-3">Поиск абонентских номеров</h2>

        <div class="flex align-items-center gap-2">
          <!-- Дата "От" -->
          <div class="flex-1">
            <Button label="С" class="font-semibold inline-block mr-1 " />
            <Calendar
                v-model="dateRange.from"
                :showButtonBar="true"
                dateFormat="dd/mm/yy"
                inputClass="w-full"
                placeholder="От"
                showIcon
            />
          </div>

          <!-- Дата "До" -->
          <div class="flex-1">
            <Button label="По" class="font-semibold inline-block mr-1" />
            <Calendar
                v-model="dateRange.to"
                :showButtonBar="true"
                dateFormat="dd/mm/yy"
                inputClass="w-full"
                placeholder="До"
                showIcon
            />
          </div>

          <!-- Тип документа -->
          <div class="flex-1">
            <Dropdown
                v-model="documentType"
                :options="documentTypes"
                optionLabel="name"
                class="w-full"
                placeholder="Тип документа"
                showClear
                @change="updateDocumentTypeFilter"
            />
          </div>


          <!-- WEB регистратор -->
          <div class="flex-1">
            <Dropdown
                v-model="webRegistrar"
                :options="webRegistrars"
                class="w-full"
                placeholder="WEB регистратор"
                showClear
                filter
                filterPlaceholder="Поиск..."
                @change="updateWebRegistrarFilter"
            />
          </div>

          <!-- Кнопка поиска -->
          <div>
            <Button
                class="h-full"
                icon="pi pi-search"
                label="Поиск"
                @click="findAll"
            />
          </div>
        </div>
      </div>

      <div class="table-actions mb-4">
        <div>
          <h2 class="mb-3">Список абонентских номеров</h2>
          <div class="flex justify-content-between align-items-center">
            <div class="export-buttons">
              <Button class="mr-2" icon="pi pi-file-excel" label="EXCEL" @click="getExcel"/>
              <Button class="mr-2" icon="pi pi-file-pdf" label="PDF" @click="getPdf"/>
              <Button icon="pi pi-file" label="CSV"/>
            </div>
            <div class="table-search">
              <IconField>
                <InputIcon>
                  <i class="pi pi-search"/>
                </InputIcon>
                <InputText v-model="filters['global'].value" placeholder="Поиск..."/>
              </IconField>
            </div>
          </div>
        </div>
      </div>

      <DataTable
          class="p-datatable-striped"
          :filters="filters"
          :paginator="false"
          :rows="subscriberFilter.size"
          :totalRecords="totalCount"
          :value="subscribers"
          filterDisplay="row"
          scrollHeight="800px"
          scrollable
      >
        <Column :filter="true" :showFilterMenu="false" field="msisdn" header="MSISDN" sortable style="width: 120px;">
          <template #filter="{ filterModel }">
            <InputText v-if="filterModel" v-model="filterModel.value" type="text" class="border-green-500"
                       @input="filterMsisdnCallback(filterModel.value)" placeholder="Поиск по номеру" style="width: 120px;"/>
          </template>
        </Column>
        <Column :filter="true" :showFilterMenu="false" field="ban" header="BAN" sortable style="width: 120px;">
          <template #filter="{ filterModel }">
            <InputText v-if="filterModel" v-model="filterModel.value" type="text"
                       @input="filterBanCallback(filterModel.value)" placeholder="BAN" style="width: 120px;"/>
          </template>
        </Column>

        <Column header="ФИО" :filter="true" :showFilterMenu="false" style="width: 250px">
          <template #body="{ data }">
            {{ data.lastName }} {{ data.firstName }} {{ data.middleName }}
          </template>

          <template #filter>
            <InputText
                v-model="fullNameFilter"
                placeholder="ФИО"
                style="width: 150px"
                @input="onFullNameInput"
            />
          </template>
        </Column>

        <Column :filter="true" :showFilterMenu="false" field="countryCode" header="Страна" sortable
                style="width: 120px;">
          <template #filter="{ filterModel }">
            <Dropdown
                v-model="filterModel.value"
                :options="countries"
                optionLabel="name"
                placeholder="Выберите страну"
                style="min-width: 12rem"
                showClear
                @change="filterCountryCallback(filterModel)"
            />
          </template>
        </Column>
        <Column :filter="true" :showFilterMenu="false" field="documentType" header="Тип документа" sortable
                style="width: 120px;">
          <template #filter="{ filterModel }">
            <Dropdown
                v-model="filterModel.value"
                :options="documentTypes"
                optionLabel="name"
                placeholder="Выберите тип документа"
                style="width: 120px"
                showClear
                @change="filterDocumentTypeCallback(filterModel.value)"
            />
          </template>
        </Column>
        <Column :filter="true" :showFilterMenu="false" field="inn" header="ИНН" sortable style="width: 120px;">
          <template #filter="{ filterModel }">
            <InputText v-if="filterModel" v-model="filterModel.value" type="text"
                       @input="filterInnCallback(filterModel.value)" placeholder="ИНН" style="width: 120px;"/>
          </template>
        </Column>
        <Column field="persStatusName" header="Статус" :filter="true" :showFilterMenu="false" sortable style="width: 180px;">
          <template #body="slotProps">
            <Tag :value="slotProps.data.persStatusName"
                 :severity="getPersStatusSeverity(slotProps.data.persStatusName)"
                 class="text-sm" />
          </template>
          <template #filter="{ filterModel }">
            <Dropdown
                v-model="filterModel.value"
                :options="persStatusName"
                optionLabel="name"
                placeholder="Выберите статус"
                style="width: 100%"
                showClear
                @change="filterStateTypeCallback(filterModel.value)"
            >
              <template #option="slotProps">
                <Tag :value="slotProps.option.name"
                     :severity="getPersStatusSeverity(slotProps.option.name)"
                     class="text-sm" />
              </template>
            </Dropdown>
          </template>
        </Column>
        <Column :filter="true" :showFilterMenu="false" field="createdDate" header="Дата создания" sortable
                style="width: 120px;">
          <template #filter="{ filterModel }">
            <Calendar
                v-model="filterModel.value"
                :manualInput="false"
                dateFormat="dd.mm.yy"
                placeholder="Дата создания"
                style="width: 120px;"
                @update:modelValue="filterCreatedDateCallback(filterModel.value)"
            />
          </template>
        </Column>
        <Column :filter="true" :showFilterMenu="false" field="dssRegistrarId" header="ID регистратора"
                sortable style="width: 120px;">
          <template #filter="{ filterModel }">
            <InputText v-if="filterModel" v-model="filterModel.value" type="text"
                       @input="filterDssRegistrarIdCallback(filterModel.value)" placeholder="ID регистратора" style="width: 120px;"/>
          </template>
        </Column>

        <Column :filter="true" :showFilterMenu="false" field="registrarFio" header="ФИО регистратора"
                sortable style="width: 120px;">
          <template #filter="{ filterModel }">
            <Dropdown
                v-model="filterModel.value"
                :options="registrarFios"
                optionLabel="label"
                optionValue="value"
                placeholder="Выберите регистратора"
                style="width: 150px"
                showClear
                filter
                filterPlaceholder="Поиск..."
                @change="filterRegistrarFioCallback(filterModel.value)"
            />
          </template>
        </Column>
        <Column :filter="true" :showFilterMenu="false" field="registrarMsisdn" header="Номер регистратора"
                sortable style="width: 120px;">
          <template #filter="{ filterModel }">
            <InputText v-if="filterModel" v-model="filterModel.value" type="text"
                       @input="filterRegistrarMsisdnCallback(filterModel.value)" placeholder="Номер регистратора" style="width: 120px;"/>
          </template>
        </Column>
        <Column :filter="true" :showFilterMenu="false" field="webRegistrar" header="Веб-регистратор"
                sortable style="width: 120px;">
          <template #filter="{ filterModel }">
            <Dropdown
                v-model="filterModel.value"
                :options="webRegistrars"
                placeholder="Выберите web регистатора"
                style="width: 150px"
                showClear
                filter
                filterPlaceholder="Поиск..."
                @change="filterWebRegistrarFIOCallback(filterModel.value)"
            />
          </template>
        </Column>

        <Column :filter="true" :showFilterMenu="false" field="supervisorFio" header="Фио супервайзера/ТП"
                sortable style="width: 120px;">
          <template #filter="{ filterModel }">
            <Dropdown
                v-model="filterModel.value"
                :options="supervisors"
                optionLabel="label"
                optionValue="value"
                placeholder="Фио супервайзера"
                style="width: 150px"
                filter
                filterPlaceholder="Поиск..."
                showClear
                @change="filterSupervisorFioCallback(filterModel.value)"
            />
          </template>
        </Column>
        <Column :filter="true" :showFilterMenu="false" field="region" header="Регион" sortable style="width: 120px;">
          <template #body="{ data }">
            {{ regions.find(r => r.id === Number(data.region))?.name || data.region }}
          </template>

          <template #filter="{ filterModel }">
            <Dropdown
                v-model="filterModel.value"
                :options="regions"
                optionLabel="name"
                placeholder="Выберите регион"
                style="min-width: 12rem"
                showClear
                @change="filterRegionCallback(filterModel)"
            />
          </template>
        </Column>


        <Column :filter="true" :showFilterMenu="false" field="channelTypeName" header="Канал" sortable
                style="width: 120px;">
          <template #filter="{ filterModel }">
            <Dropdown
                v-model="filterModel.value"
                :options="channels"
                optionLabel="value"
                optionValue = "value"
                placeholder="Выберите канал"
                style="min-width: 12rem"
                showClear
                @change="filterChannelTypeCallback(filterModel.value)"
            />
          </template>
        </Column>
        <Column :filter="true" :showFilterMenu="false" field="isSimCardGift" header="Симка с подарком" bodyStyle="text-align:center"
                sortable style="width: 80px;">
          <template #body="{ data }">
            <i class="pi"
               :class="{'pi-check-circle text-green-500': data.isSimCardGift,'pi-times-circle text-red-500': !data.isSimCardGift}"
               :title="data.isSimCardGift ? 'С подарком' : 'Без подарка'"></i>
          </template>
          <template #filter="{ filterModel }">
            <Dropdown
                v-model="filterModel.value"
                :options="[ { label: 'Да', value: true }, { label: 'Нет', value: false } ]"
                style="width: 80px"
                optionLabel="label"
                placeholder="Выберите"
                showClear
                @change="findAll"
            />
          </template>
        </Column>

        <Column :filter="true" :showFilterMenu="false" field="isBlocked" header="Блокирован" sortable bodyStyle="text-align:center"
                style="width: 80px;">
          <template #body="{ data }">
            <i class="pi"
               :class="{'pi-check-circle text-green-500': data.isBlocked,'pi-times-circle text-red-500': !data.isBlocked}"
               :title="data.isBlocked ? 'Заблокирован' : 'Активен'"></i>
          </template>
          <template #filter="{ filterModel }">
            <Dropdown
                v-model="filterModel.value"
                :options="[ { label: 'Да', value: true }, { label: 'Нет', value: false } ]"
                style="width: 80px"
                optionLabel="label"
                placeholder="Выберите"
                showClear
                @change="filterBlockedCallback(filterModel.value)"
            />
          </template>
        </Column>

        <Column :filter="true" :showFilterMenu="false" field="isManual" header="Ручное заполнение" sortable bodyStyle="text-align:center"
                style="width: 80px;">
          <template #body="{ data }">
            <i class="pi"
               :class="{'pi-check-circle text-green-500': data.isManual,'pi-times-circle text-red-500': !data.isManual}"
               :title="data.isManual ? 'Ручное' : 'Авто'"></i>
          </template>
          <template #filter="{ filterModel }">
            <Dropdown
                v-model="filterModel.value"
                :options="[ { label: 'Да', value: true }, { label: 'Нет', value: false } ]"
                optionLabel="label"
                placeholder="Выберите тип заполнения"
                style="width: 80px"
                showClear
                @change="filterFillingTypeCallback(filterModel.value)"
            />
          </template>
        </Column>

        <Column header="Действия" :exportable="false" style="min-width: 8rem" alignFrozen="right" frozen>
          <template #body="slotProps">
            <Button
                :icon="'pi pi-pencil'"
                outlined
                rounded
                class="mr-2"
                @click="onEdit(slotProps.data)"
                severity="info"
                v-tooltip="'Редактировать'"
            />
            <Button
                :icon="'pi pi-eye'"
                outlined
                rounded
                class="mr-2"
                @click="onView(slotProps.data)"
                severity="success"
                v-tooltip="'Просмотр'"
            />
            <Button
                icon="pi pi-history"
                outlined
                rounded
                class="mr-2"
                @click="viewEntityChangesHistory(slotProps.data.id)"
                severity="info"
                v-tooltip="'Новая история изменений'"
            />
            <Button
                icon="pi pi-clock"
                outlined
                rounded
                class="mr-2"
                @click="openOldHistory(slotProps.data.id)"
                severity="warn"
                v-tooltip="'Старая история изменений'"
            />
          </template>
        </Column>

      </DataTable>

      <Paginator
          :first="subscriberFilter.page * subscriberFilter.size"
          :rows="subscriberFilter.size"
          :totalRecords="totalCount"
          :rowsPerPageOptions="[10, 20, 30]"
          @page="pageCallback"
          :template="{
        '640px': 'PrevPageLink CurrentPageReport NextPageLink',
        '960px': 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink',
        '1300px': 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown RowsPerPageDropdown',
        default: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown RowsPerPageDropdown'
    }"
      />
    </div>

    <Dialog v-model:visible="subsStageEntityChangesDialog" :style="{ width: '1450px' }" header="История изменений"
            :modal="true">
      <EntityChanges :events="entityChanges"/>
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideDialogEntityChanges"/>
      </template>
    </Dialog>

    <!-- old history -->
    <Dialog v-model:visible="oldHistoryDialog" :style="{ width: '950px' }" header="История изменений (Старая)" :modal="true">
      <AuditEventHistory
          v-if="selectedSubscriber"
          :row-id="selectedSubscriber"
          table-name="PERSONIFICATION_REQUEST"
      />
      <template #footer>
        <Button label="Закрыть" icon="pi pi-times" @click="oldHistoryDialog = false" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.layout-main-full {
  width: 100%;
  margin-left: auto !important;
  margin-right: auto !important;
}

.flex.gap-1 {
  display: flex;
  gap: 0.3rem;
}

.p-button-sm {
  width: 1.8rem;
  height: 1.8rem;
}

.justify-content-between {
  justify-content: space-between;
}
</style>