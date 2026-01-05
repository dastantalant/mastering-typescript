<script setup lang="ts">
import {FilterMatchMode} from '@primevue/core/api';
import {useToast} from 'primevue/usetoast';
import {ref, onMounted} from "vue";
import SubscriberStageService from "@/services/subscriber-stage.service.ts";
import DurationUtil from "@/utils/duration.js";
import EnumsService from "@/services/enums.service.js";
import {type SubscriberStage, type SubscriberStageFilter} from "@/models/subscriber-stage.model.ts";
import AuditEventHistory from "@/components/AuditEventHistory.vue";

const displayStartDate = ref(null);
const displayEndDate = ref(null);
const toast = useToast();
const dt = ref();
const subscriberStages = ref();
const statuses = ref();
const stages = ref();
const loading = ref(false);
const count = ref();
const subsStage = ref({} as SubscriberStage);
const subsStageDialog = ref(false);
const subsStageEditDialog = ref(false);
const subsStageEventHistoryDialog = ref(false);
const subsStageEntityChangesDialog = ref(false);
const submitted = ref(false);
const images = ref();
const entityChanges = ref();
const saving = ref(false);
const visibleWebView = ref(false);
const baseUrl = `${import.meta.env.VITE_API_URL}`;
const syncData = ref(false);
const excelLoadingEdit = ref(false);


const subscriberStageFilter = ref({
  page: 0,
  size: 20
} as SubscriberStageFilter);
const filters = ref({
  stageNameStr: {value: null, matchMode: FilterMatchMode.CONTAINS},
  msisdn: {value: null, matchMode: FilterMatchMode.CONTAINS},
  createdAt: {value: null, matchMode: FilterMatchMode.CONTAINS},
  givenFirstName: {value: null, matchMode: FilterMatchMode.CONTAINS},
  givenLastName: {value: null, matchMode: FilterMatchMode.CONTAINS},
  stateName: {value: null, matchMode: FilterMatchMode.CONTAINS},
  editingBy: {value: null, matchMode: FilterMatchMode.CONTAINS},
});

const subscriberStageService = new SubscriberStageService();
const durationUtil = new DurationUtil();
const enumsService = new EnumsService();


onMounted(() => {
  findAll(subscriberStageFilter.value);
  getAllStageState();
  getAllStageName();
});

function findAll(subscriberStageFilter: SubscriberStageFilter) {
  loading.value = true;
  subscriberStageService.findAll(subscriberStageFilter).then((data) => {
    subscriberStages.value = data.subscriberStageModels;
    count.value = data.count;
    loading.value = false;
  }).catch((error) => {
    loading.value = false;
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function findById(ss = {} as SubscriberStage) {
  subscriberStageService.findById(ss.id).then((data) => {
    subsStage.value = data;
    images.value = data.files
    subsStageDialog.value = true;
    ss.loadingView = false;
  }).catch((error) => {
    ss.loadingView = false;
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function findByIdForEdit(ss = {} as SubscriberStage) {
  subscriberStageService.findByIdForEdit(ss.id).then((data) => {
    subsStage.value = data;
    images.value = data.files
    subsStageEditDialog.value = true;
    ss.loadingEdit = false;
    if (subsStage.value.state)
      for (const element of statuses.value) {
        if (element.value === subsStage.value.state) {
          subsStage.value.stateModel = element;
          break;
        }
      }
  }).catch((error) => {
    ss.loadingEdit = false;
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function syncPassportData() {
  syncData.value = true;
  subscriberStageService.syncPassportData(subsStage.value.id).then((data) => {
    subsStage.value = data;
    images.value = data.files
    subsStageEditDialog.value = true;
    syncData.value = false;
    if (subsStage.value.state)
      for (const element of statuses.value) {
        if (element.value === subsStage.value.state) {
          subsStage.value.stateModel = element;
          break;
        }
      }
  }).catch((error) => {
    syncData.value = false;
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function getAllStageState() {
  enumsService.getAllStageState().then((data) => (statuses.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка статусов',
      detail: error,
      life: 5000
    });
  });
}

function getAllStageName() {
  enumsService.getAllStageName().then((data) => (stages.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка этапов',
      detail: error,
      life: 5000
    });
  });
}

function findHistoryByOriginalId(originalId: number) {
  subscriberStageService.findHistoryByOriginalId(originalId).then((data) => (entityChanges.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка загрузки новой Истории',
      detail: error,
      life: 5000
    });
  });
}


function getStatusLabel(status) {
  switch (status) {
    case 'Отклонено':
      return 'danger';

    case 'Принято':
      return 'success';

    default:
      return 'info';
  }
}

function filterCallback(page: any) {
  subscriberStageFilter.value.page = page.page;
  subscriberStageFilter.value.size = page.rows;
  findAll(subscriberStageFilter.value);
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
    subscriberStageFilter.value.startDate = formatDate(date);
  }
  else {
    subscriberStageFilter.value.endDate = formatDate(date);
  }
  if (subscriberStageFilter.value.startDate && subscriberStageFilter.value.endDate) {
    findAll(subscriberStageFilter.value);
  } else if (!subscriberStageFilter.value.startDate && !subscriberStageFilter.value.endDate) {
    findAll(subscriberStageFilter.value);
  }
}

const searchMsisdn = ref(0);

function filterMsisdnCallback(msisdn: any) {
  searchMsisdn.value = msisdn;
  setTimeout(() => {
    if (searchMsisdn.value === msisdn) {
      subscriberStageFilter.value.msisdn = msisdn
      findAll(subscriberStageFilter.value);
    }
  }, 1000);
}

const searchFirstName = ref(0);

function filterFirstNameCallback(firstName: any) {
  searchFirstName.value = firstName;
  setTimeout(() => {
    if (searchFirstName.value === firstName) {
      subscriberStageFilter.value.firstName = firstName
      findAll(subscriberStageFilter.value);
    }
  }, 1000);
}

const searchLastName = ref(0);

function filterLastNameCallback(lastName: any) {
  searchLastName.value = lastName;
  setTimeout(() => {
    if (searchLastName.value === lastName) {
      subscriberStageFilter.value.lastName = lastName
      findAll(subscriberStageFilter.value);
    }
  }, 1000);
}

const searchEditedBy = ref(0);

function filterEditedByCallback(editedBy: any) {
  searchEditedBy.value = editedBy;
  setTimeout(() => {
    if (searchEditedBy.value === editedBy) {
      subscriberStageFilter.value.editedBy = editedBy
      findAll(subscriberStageFilter.value);
    }
  }, 1000);
}

function filterStatusCallback(status: any) {
  if (status === null)
    subscriberStageFilter.value.state = null;
  else
    subscriberStageFilter.value.state = status.value;
  findAll(subscriberStageFilter.value);
}

function filterStageCallback(stage: any) {
  if (stage === null)
    subscriberStageFilter.value.stage = null;
  else
    subscriberStageFilter.value.stage = stage.value;
  findAll(subscriberStageFilter.value);
}


function getExcel() {
  excelLoadingEdit.value = true;
  subscriberStageService.getExcel(subscriberStageFilter.value).then((data) => {
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


function hideDialog() {
  subsStage.value = false;
  submitted.value = false;
  subsStageDialog.value = false;
}

function hideEditDialog() {
  subsStage.value = false;
  submitted.value = false;
  subsStageEditDialog.value = false;
}

function hideDialogEventHistory() {
  subsStage.value = false;
  subsStageEventHistoryDialog.value = false;
}

function hideDialogEntityChanges() {
  entityChanges.value = {};
  subsStageEntityChangesDialog.value = false;
}

function view(ss = {} as SubscriberStage) {
  ss.loadingView = true
  findById(ss);
}

function edit(ss = {} as SubscriberStage) {
  ss.loadingEdit = true
  findByIdForEdit(ss);
}

function viewHistory(ss = {} as SubscriberStage) {
  subsStage.value = ss;
  subsStageEventHistoryDialog.value = true;
}

function viewEntityChangesHistory(ss = {} as SubscriberStage) {
  findHistoryByOriginalId(ss.id);
  subsStageEntityChangesDialog.value = true;
}

function save() {
  submitted.value = true;
  saving.value = true;
  if (subsStage.value.stateModel) {
    subsStage.value.state = subsStage.value.stateModel.value ?
        subsStage.value.stateModel.value : subsStage.value.stateModel;
    subscriberStageService
        .save(subsStage.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Заявка с номером ' + subsStage.value.msisdn + ' сохранена',
            life: 3000
          });
          findAll(subscriberStageFilter.value);
          subsStageEditDialog.value = false;
          subsStage.value = {};
        })
        .catch((error) => {
          toast.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: error,
            life: 5000
          });
        })
        .finally(() => {
          saving.value = false;
        });
  }
}

function onChangeNoExpiryDate() {
  let dateObject = new Date();
  if (subsStage.value.passIssueDate) {
    const [day, month, year] = subsStage.value.passIssueDate.split(".").map(Number);
    dateObject = new Date(year, month - 1, day); // Month is 0-based
  }

  if (subsStage.value.expiryDate) {
    dateObject.setFullYear(dateObject.getFullYear() + 100);
  } else {
    dateObject.setFullYear(dateObject.getFullYear() + 10);
  }

  const formattedDate = dateObject.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  subsStage.value.passEndDate = formattedDate
}

function onChangeRejectReasons() {
  subsStage.value.comment = subsStage.value.selectedRejectReason ? subsStage.value.selectedRejectReason : '';
}

function gethhmm(ms: number){
  return durationUtil.convertMillisToMMSS(ms)
}

</script>
<style>
.layout-main-full {
  width: 100%;
  margin-left: auto !important;
  margin-right: auto !important;
}
</style>
<template>
  <div class="layout-main-full">
    <div class="card">
      <Toolbar class="mb-6">
        <template #end>
          <Button label="Export" severity="secondary" @click="getExcel()"
                  :icon="!excelLoadingEdit ? 'pi pi-upload' : 'pi pi-spin pi-spinner'"/>
          <Button class="ml-1"
                  icon="pi pi-question"
                  @click="visibleWebView = !visibleWebView"
                  severity="info"
                  outlined
          />
        </template>
      </Toolbar>

      <DataTable v-model:filters="filters" filterDisplay="row"
                 :globalFilterFields="['stageNameStr', 'msisdn', 'createdAt', 'givenFirstName', 'givenLastName', 'stateName', 'editingBy']"
                 :value="subscriberStages" tableStyle="min-width: 50rem" :loading="loading"
                 selectionMode="single"
                 scrollable scrollHeight="1020px">
        <template #empty>Данные не найдены</template>
        <template #loading>Данные загружаются</template>
        <Column field="stateName" header="Статус" :filter="true" :showFilterMenu="false">
          <template #body="slotProps">
            <Tag :value="slotProps.data.stateName"
                 :severity="getStatusLabel(slotProps.data.stateName)"/>
          </template>
          <template #filter="{ filterModel }">
            <Select v-model="filterModel.value" @change="filterStatusCallback(filterModel.value)" optionLabel="name"
                    size="small"
                    :options="statuses" placeholder="Статус" style="max-width: 12rem" :showClear="true">
              <template #option="slotProps">
                <Tag :value="slotProps.option.name" :severity="getStatusLabel(slotProps.option.name)"/>
              </template>
            </Select>
          </template>
        </Column>
        <Column field="editingBy" header="Регистратор" :filter="true" :showFilterMenu="false">

          <template #filter="{ filterModel }">
            <InputText v-if="filterModel" v-model="filterModel.value" type="text" style="max-width: 8rem" size="small"
                       @update:modelValue="filterEditedByCallback(filterModel.value)"
                       placeholder="По регистратору"/>
          </template>
        </Column>
        <Column field="blocked" header="Блокирован">
          <template #body="{ data }">
            <i v-if="data" class="pi"
               :class="{ 'pi-check-circle text-green-500 ': data.blocked, 'pi-times-circle text-red-500': !data.blocked }"></i>
          </template>
        </Column>
        <Column field="editingTime" header="Время обработки">
          <template #body="{ data }">
            {{gethhmm(data.editingTime)}}
          </template>
        </Column>
        <Column field="msisdn" header="Номер" :filter="true" :showFilterMenu="false">
          <template #filter="{ filterModel }">
            <InputText v-if="filterModel" v-model="filterModel.value" type="number" style="max-width: 7rem" size="small"
                       @input="filterMsisdnCallback(filterModel.value)" placeholder="По номеру"/>
          </template>
        </Column>
        <Column field="givenFirstName" header="Имя" :filter="true" :showFilterMenu="false">
          <template #filter="{ filterModel }">
            <InputText v-if="filterModel" v-model="filterModel.value" type="text" style="max-width: 10rem" size="small"
                       @update:modelValue="filterFirstNameCallback(filterModel.value)" placeholder="Поиск по имени"/>
          </template>
        </Column>
        <Column field="givenLastName" header="Фамилия" :filter="true" :showFilterMenu="false">
          <template #filter="{ filterModel }">
            <InputText v-if="filterModel" v-model="filterModel.value" type="text" style="max-width: 10rem" size="small"
                       @update:modelValue="filterLastNameCallback(filterModel.value)" placeholder="Поиск по фамилии"/>
          </template>
        </Column>
        <Column field="stageNameStr" header="Этап" :filter="true" :showFilterMenu="false">
          <template #filter="{ filterModel }">
            <Select v-model="filterModel.value" @change="filterStageCallback(filterModel.value)" optionLabel="name"
                    :options="stages" placeholder="Выберите тип" style="max-width: 12rem" :showClear="true"
                    size="small">
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
                  :showClear="true"
              />
              <span style="margin: 0 0.1rem;"></span>
              <DatePicker
                  v-model="displayEndDate"
                  @update:modelValue="date => filterDateCallback(date, false)"
                  dateFormat="dd.mm.yy"
                  placeholder="Дата по"
                  :manualInput="true"
                  style="width: 7rem"
                  :showClear="true"
              />
            </div>
          </template>
        </Column>
        <Column field="lastModifiedDate" header="Дата обновления"></Column>
        <Column field="id" header="ID"></Column>

        <Column :exportable="false" style="min-width: 10rem" alignFrozen="right" frozen>
          <template #body="slotProps">
            <Button :icon="!slotProps.data.loadingView ? 'pi pi-search' : 'pi pi-spin pi-spinner'"
                    outlined rounded class="mr-2" @click="view(slotProps.data)" severity="info"
                    v-tooltip="'Просмотр'"/>
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
          :rowsPerPageOptions="[10, 20, 30]">
      </Paginator>
    </div>

    <Dialog v-model:visible="subsStageDialog" :style="{ width: '1350px' }" header="Просмотр деталей Заявки"
            :modal="true">
      <div class="flex flex-col md:flex-row gap-8">
        <div class="md:w-1/3">
          <SubStageFields :subs-stage="subsStage"/>
          <div>
            <label for="ban" class="block font-bold mt-3">Статус </label>
            <InputText id="ban" v-model.trim="subsStage.stateName" fluid readonly/>
          </div>
          <div class="mt-5">
            <IftaLabel>
              <Textarea id="description" v-model="subsStage.reason" disabled style="width: 100%"/>
              <label for="description">Причина не удачи </label>
            </IftaLabel>
          </div>
          <div class="mt-5">
            <IftaLabel>
              <Textarea id="description" v-model="subsStage.comment" disabled style="width: 100%"/>
              <label for="description">Комментарий </label>
            </IftaLabel>
          </div>
        </div>
        <div class="md:w-2/3">
          <ImageGalleria :images="images"/>

          <div class="card gap-4" style="padding-top: 0">
            <IftaLabel>
              <Textarea id="description" v-model="subsStage.readFields" disabled style="width: 100%"/>
              <label for="description">Результат считывания </label>
            </IftaLabel>
          </div>

        </div>
      </div>

      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideDialog"/>
      </template>
    </Dialog>

    <Dialog v-model:visible="subsStageEditDialog" :style="{ width: '1350px' }" header="Редактирование деталей Заявки"
            :modal="true">
      <div class="flex flex-col md:flex-row gap-8">
        <div class="md:w-1/3">
          <SubStageFields :subs-stage="subsStage"/>
          <div class="m:w-2/2">
            <Button label="Паспортные данные" text @click="syncPassportData"
                    :icon="!syncData ? 'pi pi-sync' : 'pi pi-spin pi-spinner'"/>
          </div>
          <div class="flex items-center gap-2 mt-3">
            <ToggleSwitch v-model="subsStage.expiryDate" name="expiryDate" @change="onChangeNoExpiryDate"/>
            <label for="expiryDate"> Без срока действия (Паспорт) </label>
          </div>
          <div>
            <label for="statusModel" class="block font-bold mt-3">Статус</label>
            <Select v-model="subsStage.stateModel" :options="statuses" option optionLabel="name"
                    placeholder="Статус" class="w-full" :invalid="submitted && !subsStage.state"/>
            <small v-if="submitted && !subsStage.state" class="text-red-500">Статус</small>
          </div>
          <div>
            <label for="statusModel" class="block font-bold mt-3">Шаблон причины отклонения на языке
              {{ subsStage.billingLang }}</label>
            <Select v-model="subsStage.selectedRejectReason" :options="subsStage.rejectReasons"
                    placeholder="Причина отклонения" class="w-full" @change="onChangeRejectReasons()"/>
          </div>
          <div class="mt-5">
            <IftaLabel>
              <Textarea id="description" v-model="subsStage.reason" disabled style="width: 100%"/>
              <label for="description">Причина не удачи </label>
            </IftaLabel>
          </div>
          <div class="mt-5">
            <IftaLabel>
              <Textarea id="description" v-model="subsStage.comment" style="width: 100%"/>
              <label for="description">Комментарий </label>
            </IftaLabel>
          </div>
        </div>
        <div class="md:w-2/3">
          <ImageGalleria :images="images"/>
          <div class="card gap-4" style="padding-top: 0">
            <IftaLabel>
              <Textarea id="description" v-model="subsStage.readFields" disabled style="width: 100%"/>
              <label for="description">Результат считывания </label>
            </IftaLabel>
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideEditDialog"/>
        <Button label="Сохранить" @click="save"
                :icon="!saving ? 'pi pi-check' : 'pi pi-spin pi-spinner'"/>
      </template>
    </Dialog>

    <Dialog v-model:visible="subsStageEventHistoryDialog" :style="{ width: '950px' }"
            header="История изменений (Старая!)"
            :modal="true">
      <AuditEventHistory :row-id="subsStage.id" table-name="subscriber_stage"/>
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideDialogEventHistory"/>
      </template>
    </Dialog>

    <Dialog v-model:visible="subsStageEntityChangesDialog" :style="{ width: '1450px' }" header="История изменений"
            :modal="true">
      <EntityChanges :events="entityChanges"/>
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideDialogEntityChanges"/>
      </template>
    </Dialog>

    <template>
      <Dialog v-model:visible="visibleWebView" modal header="FAQ"
              :style="{ width: '1450px' }">
        <iframe
            :src='"https://md-viewer.o.kg/?image="+baseUrl+"/docs?filePath=faq/01_identification.md"'
            style="width: 100%; height: 600pt; border: none;"
            sandbox="allow-scripts allow-same-origin"
        ></iframe>
      </Dialog>
    </template>

  </div>
</template>
