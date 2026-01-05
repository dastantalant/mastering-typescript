<script setup lang="ts">
import {FilterMatchMode} from '@primevue/core/api';
import {useToast} from 'primevue/usetoast';
import {computed, onMounted, ref, watchEffect} from 'vue';
import EnumsService from '@/services/enums.service.ts';
import type {SubscriberStage} from "@/models/subscriber-stage.model.ts";
import SimRecoveryService from "@/services/sim-recovery.service.ts";
import SimRecovery from "@/views/SimRecovery.vue";
import type {SimRecoveryFilter} from "@/models/sim-recovery.model.ts";
import type {EducationDetailModel} from "@/models/education.model.ts";

const toast = useToast();
const simRecoveryService = new SimRecoveryService();
const enumsService = new EnumsService();

const dt = ref();
const simRecoveries = ref<SimRecovery[]>([]);
const loading = ref(false);
const count = ref(0);
const simRecovery = ref({} as SimRecovery);
const eventHistoryDialog = ref(false);
const entityChangesDialog = ref(false);
const submitted = ref(false);
const entityChanges = ref();
const visibleWebView = ref(false);
const simRecoveryDialog = ref(false);
const simRecoveryStates = ref();
const syncData = ref(false);
const displayStartDate = ref(null);
const displayEndDate = ref(null);

const simRecoveryFilter = ref({
  page: 0,
  size: 20
} as SimRecoveryFilter);
const filters = ref({
  msisdn: {value: null, matchMode: FilterMatchMode.CONTAINS},
  registrarMsisdn: {value: null, matchMode: FilterMatchMode.CONTAINS},
  webRegistrar: {value: null, matchMode: FilterMatchMode.CONTAINS},
  registrationDateStr: {value: null, matchMode: FilterMatchMode.CONTAINS},
  stateName: {value: null, matchMode: FilterMatchMode.CONTAINS},
});

async function findAll(filter: SimRecoveryFilter) {
  loading.value = true;
  try {
    const data = await simRecoveryService.findAll(filter);
    simRecoveries.value = data.requests;
    count.value = data.totalCount;
  } catch (error) {
    toast.add({severity: 'error', summary: 'Ошибка', detail: error, life: 5000});
  } finally {
    loading.value = false;
  }
}

function filterCallback(page: any) {
  simRecoveryFilter.value.page = page.page;
  simRecoveryFilter.value.size = page.rows;
  findAll(simRecoveryFilter.value);
}

onMounted(() => {
  findAll({page: 0, size: 20});
  getAllSimRecoveryStates();
});

function getStateLabel(state) {
  switch (state) {
    case 'Отклонено':
      return 'danger';
    case 'Отклонен Антифродом':
      return 'danger';
    case 'Восстановлен':
      return 'success';

    default:
      return 'info';
  }
}

const searchMsisdn = ref(0);

function filterMsisdnCallback(msisdn: any) {
  searchMsisdn.value = msisdn;
  setTimeout(() => {
    if (searchMsisdn.value === msisdn) {
      simRecoveryFilter.value.msisdn = msisdn
      findAll(simRecoveryFilter.value);
    }
  }, 1000);
}

const searchRegistrarMsisdn = ref(0);

function filterRegistrarMsisdnCallback(msisdn: any) {
  searchRegistrarMsisdn.value = msisdn;
  setTimeout(() => {
    if (searchRegistrarMsisdn.value === msisdn) {
      simRecoveryFilter.value.registrarMsisdn = msisdn
      findAll(simRecoveryFilter.value);
    }
  }, 1000);
}


function findHistoryByOriginalId(originalId: number) {
  simRecovery.findHistoryByOriginalId(originalId).then((data) => (entityChanges.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка загрузки новой Истории',
      detail: error,
      life: 5000
    });
  });
}

function viewEntityChangesHistory(ss = {} as SubscriberStage) {
  findHistoryByOriginalId(ss.id);
  entityChangesDialog.value = true;
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
    simRecoveryFilter.value.startDate = formatDate(date);
  }
  else {
    simRecoveryFilter.value.endDate = formatDate(date);
  }
  if (simRecoveryFilter.value.startDate && simRecoveryFilter.value.endDate) {
    findAll(simRecoveryFilter.value);
  } else if (!simRecoveryFilter.value.startDate && !simRecoveryFilter.value.endDate) {
    findAll(simRecoveryFilter.value);
  }
}

const searchWebRegistrar = ref(0);

function filterBlockedByCallback(webRegistrar: any) {
  searchWebRegistrar.value = webRegistrar;
  setTimeout(() => {
    if (searchWebRegistrar.value === webRegistrar) {
      simRecoveryFilter.value.webRegistrar = webRegistrar
      findAll(simRecoveryFilter.value);
    }
  }, 1000);
}

function edit(sr = {} as SimRecovery) {
  sr.loadingEdit = true
  findByIdForEdit(sr);
}

function findByIdForEdit(sr = {} as SimRecovery) {
  simRecoveryService.findByIdForEdit(sr.id).then((data) => {
    simRecovery.value = data;
    sr.loadingEdit = false;
    simRecoveryDialog.value = true;
    setState();
  }).catch((error) => {
    sr.loadingEdit = false;
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function hideEditDialog() {
  simRecovery.value = {};
  submitted.value = false;
  simRecoveryDialog.value = false;
}

function getAllSimRecoveryStates() {
  enumsService.getAllSimRecoveryStates().then((data) => (simRecoveryStates.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка этапов',
      detail: error,
      life: 5000
    });
  });
}

function setState() {
  if (simRecovery.value.state)
    for (const element of simRecoveryStates.value) {
      if (element.value === simRecovery.value.state) {
        simRecovery.value.stateModel = element;
        break;
      }
    }
}

function syncPassportData(sr = {} as SimRecovery) {
  syncData.value = true;
  simRecoveryService.syncPassportData(sr.value.id).then((data) => {
    simRecovery.value = data;
    setState();
    syncData.value = false;
  }).catch((error) => {
    sr.loadingEdit = false;
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}


</script>

<template>
  <div class="layout-main-full">
    <div class="card">
      <Toolbar class="mb-6">
        <template #end>
          <Button label="Export" icon="pi pi-upload" severity="secondary" @click="getExcel"/>
          <Button class="ml-1"
                  icon="pi pi-question"
                  @click="visibleWebView = !visibleWebView"
                  severity="info"
                  outlined
          />
        </template>
      </Toolbar>
      <DataTable v-model:filters="filters"
                 filterDisplay="row"
                 :globalFilterFields="['id', 'ban','blockedBy', 'ctsStr']"
                 :value="simRecoveries"
                 tableStyle="min-width: 100rem"
                 :loading="loading"
                 scrollable scrollHeight="1020px"
                 selectionMode="single"
      >
        <template #empty>Данные не найдены</template>
        <template #loading>Данные загружаются</template>
        <Column field="id" header="ID"></Column>
        <Column field="msisdn" header="Номер абонента" :filter="true" :showFilterMenu="false">
          <template #filter="{ filterModel }">
            <InputText v-if="filterModel" v-model="filterModel.value" type="text" size="small"
                       @input="filterMsisdnCallback(filterModel.value)" placeholder="Поиск по msisdn"/>
          </template>
        </Column>

        <Column field="icc" header="icc"></Column>
        <Column field="middleName" header="Фамилия"></Column>
        <Column field="firstName" header="Имя"></Column>
        <Column field="stateName" header="Статус" :filter="true" :showFilterMenu="false">
          <template #body="slotProps">
            <Tag :value="slotProps.data.stateName"
                 :severity="getStateLabel(slotProps.data.stateName)"/>
          </template>
        </Column>
        <Column field="registrationDateStr" header="Дата создания" :filter="true" :showFilterMenu="false">
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
        <Column field="acceptedDateStr" header="Дата принятия"></Column>
        <Column field="registrarMsisdn" header="Номер регистратора" :filter="true" :showFilterMenu="false">
          <template #filter="{ filterModel }">
            <InputText v-if="filterModel" v-model="filterModel.value" type="text" size="small"
                       @input="filterRegistrarMsisdnCallback(filterModel.value)" placeholder="Поиск по msisdn"/>
          </template>
          <template #body="slotProps">
            {{ slotProps.data.registrar.msisdn }}
          </template>
        </Column>
        <Column field="registrar.region.name" header="Регион регистратора"></Column>
        <Column field="registrar.registrarRole.channelTypeName" header="Канал регистратора"></Column>
        <Column field="" header="Из Мой О!">
          <template #body="slotProps">
            {{ slotProps.data.registrar == null ? 'Да' : 'Нет' }}
          </template>
        </Column>
        <Column field="webRegistrar" header="Web регистратор" :filter="true" :showFilterMenu="false">
          <template #filter="{ filterModel }">
            <InputText v-if="filterModel" v-model="filterModel.value" type="text"
                       @input="filterBlockedByCallback(filterModel.value)" placeholder="Поиск по регистратору"/>
          </template>
        </Column>
        <Column header="ФИО Промоутера">
          <template #body="slotProps">
            {{ slotProps.data.registrar.firstName + " " + slotProps.data.registrar.lastName }}
          </template>
        </Column>
        <Column header="ФИО Супервайзера">
          <template #body="slotProps">
            {{ slotProps.data.registrar.svFirstName + " " + slotProps.data.registrar.svLastName }}
          </template>
        </Column>
        <Column field="deliveryReport" header="Статус смс оповещения"></Column>
        <Column :exportable="false" style="min-width: 10rem" alignFrozen="right" frozen>
          <template #body="slotProps">
            <Button :icon="!slotProps.data.loadingEdit ? 'pi pi-pencil' : 'pi pi-spin pi-spinner'"
                    outlined rounded class="mr-2" @click="edit(slotProps.data)"
                    v-tooltip="'Редактировать'"/>
            <Button icon="pi pi-history"
                    outlined rounded class="mr-2" @click="viewEntityChangesHistory(slotProps.data)" severity="info"
                    v-tooltip="'Новая история изменений'"/>
            <Button icon="pi pi-history" outlined rounded class="mr-2" @click="viewHistory(slotProps.data)"
                    severity="warn" v-tooltip="'Старая история изменений'"/>
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
          :rowsPerPageOptions="[10, 20, 30]"
      />
    </div>
  </div>

  <Dialog v-model:visible="simRecoveryDialog" :style="{ width: '1350px' }"
          header="Редактирование заявки на восстановление SIM"
          :modal="true">
    <div class="flex flex-col md:flex-row gap-8">

      <div class="md:w-1/3">
        <div class="flex flex-col md:flex-row gap-8 mt-3">
          <div class="md:w-1/2">
            <label for="msisdn" class="block font-bold mt-3">MSISDN</label>
            <InputText id="msisdn" v-model.trim="simRecovery.msisdn" fluid disabled/>
          </div>
          <div class="md:w-1/2">
            <label for="ban" class="block font-bold mt-3">BAN</label>
            <InputText id="ban" v-model.trim="simRecovery.ban" fluid disabled/>
          </div>
        </div>
        <div>
          <label for="surName" class="block font-bold mt-3">Фамилия</label>
          <InputText id="surName" v-model.trim="simRecovery.surName" fluid disabled/>
        </div>
        <div>
          <label for="firstName" class="block font-bold mt-3">Имя</label>
          <InputText id="firstName" v-model.trim="simRecovery.firstName" fluid disabled/>
        </div>
        <div>
          <label for="middleName" class="block font-bold mt-3">Отчество</label>
          <InputText id="middleName" v-model.trim="simRecovery.middleName" fluid disabled/>
        </div>
        <div>
          <label for="pricePlanName" class="block font-bold mt-3">Тарифный план</label>
          <InputText id="pricePlanName" v-model.trim="simRecovery.pricePlanName" fluid disabled/>
        </div>
        <div class="flex flex-col md:flex-row gap-8 mt-3">
          <div class="md:w-1/2">
            <label for="icc" class="block font-bold mt-3">ICC новой сим-карты</label>
            <InputText id="icc" v-model.trim="simRecovery.icc" fluid disabled/>
          </div>
          <div class="md:w-2/1">
            <label for="oldIcc" class="block font-bold mt-3">ICC старой сим-карты</label>
            <InputText id="oldIcc" v-model.trim="simRecovery.oldIcc" fluid disabled/>
          </div>
        </div>
        <div>
          <label for="contactPhone" class="block font-bold mt-3">Контактный телефон</label>
          <InputText id="contactPhone" v-model.trim="simRecovery.contactPhone" fluid disabled/>
        </div>
        <div class="flex flex-col md:flex-row gap-8 mt-3">
          <div class="md:w-1/2">
            <label for="registrar.msisdn" class="block font-bold mt-3">Номер регистратора</label>
            <InputText id="registrar.msisdn" v-model.trim="simRecovery.registrar.msisdn" fluid disabled/>
          </div>
          <div class="md:w-1/2">
            <label for="registrar.chanel" class="block font-bold mt-3">Канал регистратора</label>
            <InputText id="registrar.chanel" v-model.trim="simRecovery.registrar.registrarRole.channelTypeName" fluid
                       disabled/>
          </div>
        </div>
        <div class="flex flex-col md:flex-row gap-8 mt-3">
          <div class="md:w-1/2">
            <label for="statusModel" class="block font-bold mt-3">Тип документа</label>
            <Select v-model="simRecovery.stateModel" :options="simRecoveryStates" option optionLabel="name"
                    placeholder="Тип документа" class="w-full" :invalid="submitted && !simRecovery.state">
            </Select>
          </div>
          <div class="md:w-1/2">
            <label for="statusModel" class="block font-bold mt-3">&nbsp;</label>
            <Button label="Паспортные данные" text @click="syncPassportData"
                    :icon="!syncData ? 'pi pi-sync' : 'pi pi-spin pi-spinner'"/>
          </div>
        </div>

        <div class="flex flex-col md:flex-row gap-8 mt-3">
          <div class="md:w-1/2">
            <label for="inn" class="block font-bold mt-3">Персональный номер</label>
            <InputText id="inn" v-model.trim="simRecovery.inn" fluid disabled/>
          </div>
          <div class="md:w-1/2">
            <label for="documentId" class="block font-bold mt-3">Номер документа</label>
            <InputText id="documentId" v-model.trim="simRecovery.documentId" fluid disabled/>
          </div>
        </div>
        <div class="flex flex-col md:flex-row gap-8 mt-3">
          <div class="md:w-1/2">
            <label for="birthDate" class="block font-bold mt-3">Дата рождения</label>
            <InputText id="birthDate" v-model.trim="simRecovery.birthDate" fluid disabled/>
          </div>
          <div class="md:w-1/2">
            <label for="issueDate" class="block font-bold mt-3">Дата выдачи</label>
            <InputText id="issueDate" v-model.trim="simRecovery.issueDate" fluid disabled/>
          </div>
        </div>
        <div>
          <label for="authority" class="block font-bold mt-3">Орган выдачи</label>
          <InputText id="authority" v-model.trim="simRecovery.authority" fluid disabled/>
        </div>

        <div>
          <label for="address" class="block font-bold mt-3">Адрес</label>
          <Textarea id="address" v-model.trim="simRecovery.address" fluid disabled/>
        </div>
        <div>
          <label for="comment" class="block font-bold mt-3">Комментарий</label>
          <Textarea id="comment" v-model.trim="simRecovery.comment" fluid disabled/>
        </div>
        <div>
          <label for="statusModel" class="block font-bold mt-3">Статус</label>
          <Select v-model="simRecovery.stateModel" :options="simRecoveryStates" option optionLabel="name"
                  placeholder="Статус" class="w-full" :invalid="submitted && !simRecovery.state">
            <template #option="slotProps">
              <Tag :value="slotProps.option.name" :severity="getStateLabel(slotProps.option.name)"/>
            </template>
          </Select>
          <small v-if="submitted && !simRecovery.state" class="text-red-500">Статус</small>
        </div>

      </div>
      <div class="md:w-2/3">
        <ImageGalleria :images="simRecovery.uploads"/>
      </div>

    </div>
    <template #footer>
      <div class="md:w-1/3" style="margin-left: auto; text-align: right">
        <div class="mb-2" v-if="simRecovery.webRegistrar">
          <Message severity="error" variant="outlined"> Заявка имеет финальный статус! Пользователь:
            {{ simRecovery.webRegistrar }}
          </Message>
        </div>
        <Button label="Отмена" icon="pi pi-times" text @click="hideEditDialog"/>
        <Button label="Сохранить" @click="save"
                :icon="!saving ? 'pi pi-check' : 'pi pi-spin pi-spinner'"/>
      </div>
    </template>
  </Dialog>
</template>
