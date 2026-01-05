<script setup lang="ts">
import {FilterMatchMode} from '@primevue/core/api';
import {useToast} from 'primevue/usetoast';
import {onMounted, ref} from 'vue';
import AlgaProcessService from "@/services/alga-process.service.js";
import OrganizationService from "@/services/dictionary/organization.service.js";
import EnumsService from "@/services/enums.service.js";
import {type AlgaProcessFilter} from "@/models/alga-process.model.ts";
import RegionService from "@/services/dictionary/region.service.js";
import AlgaFlowHistory from "@/components/AlgaFlowHistory.vue";

const toast = useToast();
const dt = ref();
const algaProcesses = ref();
const count = ref();
const statuses = ref();
const types = ref();
const organizations = ref();
const channels = ref();
const regions = ref();
const displayStartDate = ref(null);
const displayEndDate = ref(null);
const excelLoadingEdit = ref(false);
const algaProcessFilter = ref({
  page: 0,
  size: 20
} as AlgaProcessFilter);
const filters = ref({
  promoRegistrarReport: {value: null, matchMode: FilterMatchMode.CONTAINS},
  region: {value: null, matchMode: FilterMatchMode.CONTAINS},
  channelTypeName: {value: null, matchMode: FilterMatchMode.CONTAINS},
  processTypeName: {value: null, matchMode: FilterMatchMode.CONTAINS},
  msisdn: {value: null, matchMode: FilterMatchMode.CONTAINS},
  processStatusName: {value: null, matchMode: FilterMatchMode.CONTAINS},
  organizationName: {value: null, matchMode: FilterMatchMode.CONTAINS},
  createdAt: {value: null, matchMode: FilterMatchMode.CONTAINS},
  fullName: {value: null, matchMode: FilterMatchMode.CONTAINS},
});

const algaProcessService = new AlgaProcessService();
const enumsService = new EnumsService();
const organizationService = new OrganizationService();
const regionService = new RegionService();


onMounted(() => {
  findAll(algaProcessFilter.value);
  findAllProcessTypes();
  findAllAlgaProcessStatuses();
  findAllOrganizations();
  findAllRegistrarChannel();
  findAllRegions();

});

function findAll(algaProcessFilter: AlgaProcessFilter) {
  algaProcessService.findAll(algaProcessFilter).then((data) => {
    algaProcesses.value = data.algaProcessList;
    count.value = data.count;

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
  excelLoadingEdit.value = true;
  algaProcessService.getExcel(algaProcessFilter.value).then((data) => {
  }).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  }).finally(() => {
    excelLoadingEdit.value = false;
  });
}

function findAllProcessTypes() {
  enumsService.findAllProcessTypes().then((data) => (types.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка Типов',
      detail: error,
      life: 5000
    });
  });
}

function findAllAlgaProcessStatuses() {
  enumsService.findAllAlgaProcessStatuses().then((data) => (statuses.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка Статусов',
      detail: error,
      life: 5000
    });
  });
}

function findAllOrganizations() {
  organizationService.findAll().then((data) => (organizations.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка Статусов',
      detail: error,
      life: 5000
    });
  });
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

function getStatusLabel(status) {
  switch (status) {
    case 'Ошибка':
      return 'danger';

    case 'Успех':
      return 'success';

    default:
      return 'info';
  }
}

function filterCallback(page: any) {
  algaProcessFilter.value.page = page.page;
  algaProcessFilter.value.size = page.rows;
  findAll(algaProcessFilter.value);
}

function filterStatusCallback(status: any) {
  if (status === null)
    algaProcessFilter.value.status = null;
  else
    algaProcessFilter.value.status = status.value;
  findAll(algaProcessFilter.value);
}

function filterTypeCallback(type: any) {
  if (type === null)
    algaProcessFilter.value.type = null;
  else
    algaProcessFilter.value.type = type.value;
  findAll(algaProcessFilter.value);
}

function filterOrganizationCallback(organization: any) {
  if (organization.value === null)
    algaProcessFilter.value.organizationId = null;
  else
    algaProcessFilter.value.organizationId = organization.value.id;
  findAll(algaProcessFilter.value);
}

function filterСhannelTypeCallback(chanelType: any) {
  if (chanelType.value === null)
    algaProcessFilter.value.chanelType = null;
  else
    algaProcessFilter.value.chanelType = chanelType.value.value;
  findAll(algaProcessFilter.value);
}

const searchPrMsisdn = ref(0);

function filterPrMsisdnCallback(prmsisdn: any) {
  searchPrMsisdn.value = prmsisdn;
  setTimeout(() => {
    if (searchPrMsisdn.value === prmsisdn) {
      algaProcessFilter.value.prMsisdn = prmsisdn
      findAll(algaProcessFilter.value);
    }
  }, 1000);
}

const searchMsisdn = ref(0);

function filterMsisdnCallback(msisdn: any) {
  searchMsisdn.value = msisdn;
  setTimeout(() => {
    if (searchMsisdn.value === msisdn) {
      algaProcessFilter.value.msisdn = msisdn
      findAll(algaProcessFilter.value);
    }
  }, 1000);
}

const searchFullName = ref(0);

function filterFullNameCallback(fullName: any) {
  searchFullName.value = fullName;
  setTimeout(() => {
    if (searchFullName.value === fullName) {
      algaProcessFilter.value.fullName = fullName
      findAll(algaProcessFilter.value);
    }
  }, 1000);
}

function filterRegionCallback(region: any) {
  if (region.value === null)
    algaProcessFilter.value.regionId = null;
  else
    algaProcessFilter.value.regionId = region.value.id;
  findAll(algaProcessFilter.value);

}

function formatDate(date: Date | null): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function filterDateCallback(date: Date | null, isStart: Boolean) {
  if(isStart) {
    algaProcessFilter.value.startDate = formatDate(date);
  }
  else {
    algaProcessFilter.value.endDate = formatDate(date);
  }
  if (algaProcessFilter.value.startDate && algaProcessFilter.value.endDate) {
    findAll(algaProcessFilter.value);
  } else if (!algaProcessFilter.value.startDate && !algaProcessFilter.value.endDate) {
    findAll(algaProcessFilter.value);
  }
}

const showLogs = ref(false)
const selectedProcessId = ref<number | null>(null)

function openLogs(processId: number) {
  selectedProcessId.value = processId
  showLogs.value = true
}

</script>
<style>
.layout-main-full {
  width: 100%;
  margin-left: auto !important;
  margin-right: auto !important;
}
</style>
<template >
  <div class="layout-main-full">
    <div class="card">
      <Toolbar class="mb-6">
        <template #end>
          <Button label="Export" severity="secondary" @click="getExcel()"
                  :icon="!excelLoadingEdit ? 'pi pi-upload' : 'pi pi-spin pi-spinner'"/>
        </template>
      </Toolbar>

      <DataTable v-model:filters="filters" filterDisplay="row"
                 :globalFilterFields="['promoRegistrarReport', 'fullName','region', 'channelTypeName','organizationName', 'createdAt', 'processTypeName','msisdn', 'processStatusName']"
                 :value="algaProcesses" tableStyle="min-width: 50rem"
                 selectionMode="single"
                 scrollable scrollHeight="1020px">
        <Column field="promoRegistrarReport" header="Торговый (id / номер)" :filter="true" :showFilterMenu="false">
          <template #filter="{ filterModel }">
            <InputText v-if="filterModel" v-model="filterModel.value" type="text"
                       @input="filterPrMsisdnCallback(filterModel.value)" placeholder="Поиск по номеру"/>
          </template>
        </Column>
        <Column field="fullName" header="ФИО" style="min-width: 12rem" :filter="true" :showFilterMenu="false">
          <template #filter="{ filterModel }">
            <InputText v-if="filterModel" v-model="filterModel.value" type="text"
                       @input="filterFullNameCallback(filterModel.value)" placeholder="Поиск по ФИО"/>
          </template>
        </Column>
        <Column field="region" header="Регион" :filter="true" :showFilterMenu="false">
          <template #filter="{ filterModel }">
            <Select v-model="filterModel.value" @change="filterRegionCallback(filterModel)" optionLabel="name"
                    :options="regions" placeholder="Выберите Регион" style="min-width: 12rem"
                    :showClear="true">
            </Select>
          </template>
        </Column>
        <Column field="channelTypeName" header="Канал" :filter="true" :showFilterMenu="false">
          <template #filter="{ filterModel }">
            <Select v-model="filterModel.value" @change="filterСhannelTypeCallback(filterModel)" optionLabel="name"
                    :options="channels" placeholder="Выберите Канал" style="min-width: 12rem"
                    :showClear="true">
            </Select>
          </template>
        </Column>
        <Column field="organizationName" header="Организация" :filter="true" :showFilterMenu="false">
          <template #filter="{ filterModel }">
            <Select v-model="filterModel.value" @change="filterOrganizationCallback(filterModel)" optionLabel="name"
                    :options="organizations" placeholder="Выберите Организацию" style="min-width: 12rem"
                    :showClear="true">
            </Select>
          </template>
        </Column>
        <Column field="createdAt" header="Дата создания" :filter="true" :showFilterMenu="false"
                style="min-width: 14rem">
          <template #filter="{ filterModel }">
            <div style="display: flex; align-items: center;">
              <DatePicker
                  v-model="displayStartDate"
                  @update:modelValue="date => filterDateCallback(date, true)"
                  dateFormat="dd.mm.yy"
                  placeholder="Дата с"
                  :manualInput="true"
                  style="width: 7rem"
              />
              <span style="margin: 0 0.1rem;"></span>
              <DatePicker
                  v-model="displayEndDate"
                  @update:modelValue="date => filterDateCallback(date, false)"
                  dateFormat="dd.mm.yy"
                  placeholder="Дата по"
                  :manualInput="true"
                  style="width: 7rem"
              />
            </div>
          </template>
        </Column>

        <Column field="processTypeName" header="Тип процесса" :filter="true" :showFilterMenu="false">
          <template #filter="{ filterModel }">
            <Select v-model="filterModel.value" @change="filterTypeCallback(filterModel.value)" optionLabel="name"
                    :options="types" placeholder="Выберите тип" style="min-width: 12rem" :showClear="true">
            </Select>
          </template>
        </Column>
        <Column field="msisdn" header="Номер О!Деньги" :filter="true" :showFilterMenu="false">
          <template #filter="{ filterModel }">
            <InputText v-if="filterModel" v-model="filterModel.value" type="number"
                       @input="filterMsisdnCallback(filterModel.value)" placeholder="Поиск по номеру"/>
          </template>
        </Column>
        <Column field="processStatusName" header="Статус процесса" sortable style="min-width: 12rem" :filter="true"
                :showFilterMenu="false">
          <template #body="slotProps">
            <Tag :value="slotProps.data.processStatusName"
                 :severity="getStatusLabel(slotProps.data.processStatusName)"/>
          </template>
          <template #filter="{ filterModel }">
            <Select v-model="filterModel.value" @change="filterStatusCallback(filterModel.value)" optionLabel="name"
                    :options="statuses" placeholder="Выберите статус" style="min-width: 12rem" :showClear="true">
              <template #option="slotProps">
                <Tag :value="slotProps.option.name" :severity="getStatusLabel(slotProps.option.name)"/>
              </template>
            </Select>
          </template>
        </Column>
        <Column field="cardProductionId" header="Номер конверта"></Column>
        <Column field="cardNumber" header="Номер карты"></Column>
        <Column field="clientCode" header="Код клиента банка"></Column>
        <Column field="processErrorTypeName" header="Ошибка" style="min-width: 30rem"></Column>
        <Column header="Действия" alignFrozen="right" frozen>
          <template #body="slotProps">
            <Button icon="pi pi-search"
                    outlined rounded class="mr-2" @click="openLogs(slotProps.data.id)" severity="info"
                    v-tooltip="'Просмотр'"/>
          </template>
        </Column>
      </DataTable>

      <Paginator
          @page="filterCallback"
          :template="{
                '640px': 'PrevPageLink CurrentPageReport NextPageLink',
                '960px': 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink',
                '1300px': 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink',
                default: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown RowsPerPageDropdown'
            }"
          :rows="20"
          :totalRecords="count"
          :rowsPerPageOptions="[10, 20, 30]">
      </Paginator>

      <AlgaFlowHistory v-model:visible="showLogs" :processId="selectedProcessId" />
    </div>
  </div>
</template>
