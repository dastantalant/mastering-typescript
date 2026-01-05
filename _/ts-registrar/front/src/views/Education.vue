<script setup lang="ts">
import {FilterMatchMode} from '@primevue/core/api';
import {useToast} from 'primevue/usetoast';
import {onMounted, ref} from 'vue';
import EduRejectReasonService from '@/services/dictionary/edu-reject-reason.service.ts';
import EducationService from '@/services/education.service.ts';
import EnumsService from '@/services/enums.service.ts';
import type {EducationDetailModel, EducationFileModel, EducationFilter} from "@/models/education.model.ts";
import AuditEventHistory from "@/components/AuditEventHistory.vue";
import type {SubscriberStage} from "@/models/subscriber-stage.model.ts";
import type {Enum} from "@/models/enum.model.ts";
import DurationUtil from "@/utils/duration.ts";

const toast = useToast();
const eduRejectReasonService = new EduRejectReasonService();
const educationService = new EducationService();
const enumsService = new EnumsService();

const dt = ref();
const educations = ref<EducationDetailModel[]>([]);
const eduRejectReasons = ref<[]>([]);
const loading = ref(false);
const count = ref(0);
const education = ref({} as EducationDetailModel);
const images = ref<EducationFileModel[]>([]);
const educationDialog = ref(false);
const eventHistoryDialog = ref(false);
const entityChangesDialog = ref(false);
const ppRequestCertificateType = ref<Enum[]>();
const ppRequestStates = ref();
const ppRequestTypes = ref();
const submitted = ref(false);
const saving = ref(false);
const entityChanges = ref();
const syncData = ref(false);
const visibleWebView = ref(false);
const baseUrl = `${import.meta.env.VITE_API_URL}`;
const durationUtil = new DurationUtil();
const displayStartDate = ref(null);
const displayEndDate = ref(null);
const excelLoadingEdit = ref(false);

const educationFilter = ref({
  page: 0,
  size: 20
} as EducationFilter);
const filters = ref({
  ban: {value: null, matchMode: FilterMatchMode.CONTAINS},
  msisdn: {value: null, matchMode: FilterMatchMode.CONTAINS},
  ctsStr: {value: null, matchMode: FilterMatchMode.CONTAINS},
  blockedBy: {value: null, matchMode: FilterMatchMode.CONTAINS},
  stateName: {value: null, matchMode: FilterMatchMode.CONTAINS},
  requestTypeName: {value: null, matchMode: FilterMatchMode.CONTAINS},
});

async function findAll(filter: EducationFilter) {
  loading.value = true;
  try {
    const data = await educationService.findAll(filter);
    educations.value = data.requests;
    count.value = data.totalCount;
  } catch (error) {
    toast.add({severity: 'error', summary: 'Ошибка', detail: error, life: 5000});
  } finally {
    loading.value = false;
  }
}

function findAllRejectReasons(lang: string) {
  eduRejectReasonService.findAllPersonalised(lang).then((data) => (eduRejectReasons.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function getAllEduPPRequestStates() {
  enumsService.getAllEduPPRequestStates().then((data) => {
    ppRequestStates.value = data;
  });
}

function getAllEduPPRequestTypes() {
  enumsService.getAllEduPPRequestTypes().then((data) => {
    ppRequestTypes.value = data;
  });
}

function getAllEduPPRequestCertificateType() {
  enumsService.getAllEduPPRequestCertificateType().then((data) => {
    ppRequestCertificateType.value = data;
  });
}

function filterCallback(page: any) {
  educationFilter.value.page = page.page;
  educationFilter.value.size = page.rows;
  findAll(educationFilter.value);
}

onMounted(() => {
  findAll({page: 0, size: 20});
  getAllEduPPRequestStates();
  getAllEduPPRequestTypes();
  getAllEduPPRequestCertificateType();
});

function getStateLabel(state) {
  switch (state) {
    case 'Отклонен':
      return 'danger';

    case 'Одобрен':
      return 'success';

    default:
      return 'info';
  }
}

const searchBan = ref(0);

function filterBanCallback(ban: any) {
  searchBan.value = ban;
  setTimeout(() => {
    if (searchBan.value === ban) {
      educationFilter.value.ban = ban
      findAll(educationFilter.value);
    }
  }, 1000);
}

const searchMsisdn = ref(0);

function filterMsisdnCallback(msisdn: any) {
  searchMsisdn.value = msisdn;
  setTimeout(() => {
    if (searchMsisdn.value === msisdn) {
      educationFilter.value.msisdn = msisdn
      findAll(educationFilter.value);
    }
  }, 1000);
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
  if (isStart) {
    educationFilter.value.startDate = formatDate(date);
  } else {
    educationFilter.value.endDate = formatDate(date);
  }
  if (educationFilter.value.startDate && educationFilter.value.endDate) {
    findAll(educationFilter.value);
  } else if (!educationFilter.value.startDate && !educationFilter.value.endDate) {
    findAll(educationFilter.value);
  }
}

const searchBlockedBy = ref(0);

function filterBlockedByCallback(blockedBy: any) {
  searchBlockedBy.value = blockedBy;
  setTimeout(() => {
    if (searchBlockedBy.value === blockedBy) {
      educationFilter.value.webRegistrar = blockedBy
      findAll(educationFilter.value);
    }
  }, 1000);
}

function filterPPRequestStatesCallback(state: any) {
  if (state.value === null)
    educationFilter.value.state = null;
  else
    educationFilter.value.state = state.value.value;
  findAll(educationFilter.value);
}

function filterPPRequestTypesCallback(type: any) {
  if (type.value === null)
    educationFilter.value.type = null;
  else
    educationFilter.value.type = type.value.value;
  findAll(educationFilter.value);
}

function edit(edu = {} as EducationDetailModel) {
  edu.loadingEdit = true
  findByIdForEdit(edu);
}

function findByIdForEdit(edu = {} as EducationDetailModel) {
  educationService.findByIdForEdit(edu.id).then((data) => {
    education.value = data;
    setState();
    findAllRejectReasons(education.value.lang);
    findAllFilesById(edu);

  }).catch((error) => {
    edu.loadingEdit = false;
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function setState() {
  if (education.value.state)
    for (const element of ppRequestStates.value) {
      if (element.value === education.value.state) {
        education.value.stateModel = element;
        break;
      }
    }
}

function findAllFilesById(edu = {} as EducationDetailModel) {
  educationService.findAllFilesById(education.value.id).then((data) => {
    images.value = data;
    edu.loadingEdit = false;
    educationDialog.value = true;
  }).catch((error) => {
    edu.loadingEdit = false;
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function hideEditDialog() {
  education.value = {};
  images.value = [];
  submitted.value = false;
  educationDialog.value = false;
}

function save() {
  submitted.value = true;
  saving.value = true;
  if (education.value.stateModel) {
    education.value.state = education.value.stateModel.value ?
        education.value.stateModel.value : education.value.stateModel;
    educationService.save(education.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Заявка с номером ' + education.value.id + ' сохранена',
            life: 3000
          });
          findAll(educationFilter.value);
          educationDialog.value = false;
          education.value = {};
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

function onChangeRejectReasons() {
  education.value.comment = education.value.selectedRejectReason ? education.value.selectedRejectReason : '';
}

function hideDialogEventHistory() {
  education.value = false;
  eventHistoryDialog.value = false;
}

function viewHistory(ss = {} as EducationDetailModel) {
  education.value = ss;
  eventHistoryDialog.value = true;
}

function findHistoryByOriginalId(originalId: number) {
  educationService.findHistoryByOriginalId(originalId).then((data) => (entityChanges.value = data)).catch((error) => {
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

function hideDialogEntityChanges() {
  entityChanges.value = {};
  entityChangesDialog.value = false;
}

function getTitle() {
  return 'Заявки на получение ТП: ' + education.value.requestTypeName;
}

function syncPassportData(edu = {} as EducationDetailModel) {
  syncData.value = true;
  educationService.syncPassportData(education.value.id).then((data) => {
    education.value = data;
    setState();
    syncData.value = false;
  }).catch((error) => {
    edu.loadingEdit = false;
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

const displayCertificateType = (type: string): string => ppRequestCertificateType.value?.find(item => item.value === type)?.name;

function getExcel() {
  excelLoadingEdit.value = true;
  educationService.getExcel(educationFilter.value).then((data) => {
  }).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  })
      .finally(() => {
        excelLoadingEdit.value = false;
      });
}

function gethhmm(ms: number) {
  return durationUtil.convertMillisToMMSS(ms)
}

</script>

<template>
  <div class="layout-main-full">
    <div class="card">
      <Toolbar class="mb-6">
        <template #end>
          <Button label="Export" severity="secondary" @click="getExcel"
                  :icon="!excelLoadingEdit ? 'pi pi-upload' : 'pi pi-spin pi-spinner'"
          />
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
                 :globalFilterFields="['id', 'ban', 'msisdn','blockedBy', 'ctsStr', 'stateName', 'requestTypeName']"
                 :value="educations"
                 tableStyle="min-width: 100rem"
                 :loading="loading"
                 scrollable scrollHeight="1020px"
                 selectionMode="single"
      >
        <template #empty>Данные не найдены</template>
        <template #loading>Данные загружаются</template>
        <Column field="id" header="ID"></Column>
        <Column field="ban" header="BAN" :filter="true" :showFilterMenu="false">
          <template #filter="{ filterModel }">
            <InputText v-if="filterModel" v-model="filterModel.value" type="text" size="small"
                       @input="filterBanCallback(filterModel.value)" placeholder="Поиск по BAN"/>
          </template>
        </Column>
        <Column field="msisdn" header="msisdn" :filter="true" :showFilterMenu="false">
          <template #filter="{ filterModel }">
            <InputText v-if="filterModel" v-model="filterModel.value" type="text" size="small"
                       @input="filterMsisdnCallback(filterModel.value)" placeholder="Поиск по msisdn"/>
          </template>
        </Column>
        <Column field="district" header="Область"></Column>
        <Column field="area" header="Регион"></Column>
        <Column field="locality" header="Город /Населенный пункт"></Column>
        <Column field="stateName" header="Статус" :filter="true" :showFilterMenu="false">
          <template #body="slotProps">
            <Tag :value="slotProps.data.stateName"
                 :severity="getStateLabel(slotProps.data.stateName)"/>
          </template>
          <template #filter="{ filterModel }">
            <Select v-model="filterModel.value" @change="filterPPRequestStatesCallback(filterModel)" optionLabel="name"
                    :options="ppRequestStates" placeholder="Выберите статус" style="min-width: 12rem"
                    :showClear="true">
              <template #option="slotProps">
                <Tag :value="slotProps.option.name" :severity="getStateLabel(slotProps.option.name)"/>
              </template>
            </Select>
          </template>
        </Column>
        <Column field="editingTime" header="Время обработки">
          <template #body="{ data }">
            {{ gethhmm(data.editingTime) }}
          </template>
        </Column>
        <Column field="requestTypeName" header="Тип" :filter="true" :showFilterMenu="false">
          <template #body="slotProps">
            {{ slotProps.data.requestTypeName }}
          </template>
          <template #filter="{ filterModel }">
            <Select v-model="filterModel.value" @change="filterPPRequestTypesCallback(filterModel)" optionLabel="name"
                    :options="ppRequestTypes" placeholder="Выберите Тип" style="min-width: 12rem"
                    :showClear="true"/>
          </template>
        </Column>
        <Column field="fullName" header="ФИО"></Column>
        <Column field="certificateType" header="Тип справки">
          <template #body="slotProps">
            {{ displayCertificateType(slotProps.data.certificateType) }}
          </template>
        </Column>
        <Column field="birthdayStr" header="Дата рождения"></Column>
        <Column field="ctsStr" header="Дата создания" :filter="true" :showFilterMenu="false">
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
        <Column field="utsStr" header="Дата обновления"></Column>
        <Column field="blockedBy" header="Web регистратор" :filter="true" :showFilterMenu="false">
          <template #filter="{ filterModel }">
            <InputText v-if="filterModel" v-model="filterModel.value" type="text"
                       @input="filterBlockedByCallback(filterModel.value)" placeholder="Поиск по регистратору"/>
          </template>
        </Column>
        <Column :exportable="false" style="min-width: 10rem" alignFrozen="right" frozen>
          <template #body="slotProps">
            <Button :icon="!slotProps.data.loadingEdit ? 'pi pi-pencil' : 'pi pi-spin pi-spinner'"
                    outlined rounded class="mr-2" @click="edit(slotProps.data)"
                    v-tooltip="'Редактировать'"/>
            <Button icon="pi pi-history"
                    outlined rounded class="mr-2" @click="viewEntityChangesHistory(slotProps.data)" severity="info"
                    v-tooltip="'Новая история изменений'"/>
            <Button icon="pi pi-history" outlined rounded class="mr-2 mt-2" @click="viewHistory(slotProps.data)"
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

    <Dialog v-model:visible="educationDialog" :style="{ width: '1350px' }"
            :header="getTitle()"
            :modal="true">
      <div class="flex flex-col md:flex-row gap-8">

        <div class="md:w-1/3">
          <div class="mt-5">
            <Message severity="info">Msisdn: {{ education.msisdn }}</Message>
          </div>
          <div>
            <label for="ban" class="block font-bold mt-3">BAN</label>
            <InputText id="ban" v-model.trim="education.ban" fluid disabled/>
          </div>
          <div>
            <label for="lastname" class="block font-bold mt-3">Фамилия</label>
            <InputText id="lastname" v-model.trim="education.lastname" fluid disabled/>
          </div>
          <div>
            <label for="firstname" class="block font-bold mt-3">Имя</label>
            <InputText id="firstname" v-model.trim="education.firstname" fluid disabled/>
          </div>
          <div>
            <label for="patronymic" class="block font-bold mt-3">Отчество</label>
            <InputText id="patronymic" v-model.trim="education.patronymic" fluid disabled/>
          </div>
          <div>
            <label for="district" class="block font-bold mt-3">Область</label>
            <InputText id="district" v-model.trim="education.district" fluid disabled/>
          </div>
          <div>
            <label for="area" class="block font-bold mt-3">Район</label>
            <InputText id="area" v-model.trim="education.area" fluid disabled/>
          </div>
          <div>
            <label for="locality" class="block font-bold mt-3">Город/населенный пункт</label>
            <InputText id="locality" v-model.trim="education.locality" fluid disabled/>
          </div>
          <div>
            <label for="school" class="block font-bold mt-3"
                   v-if="education.requestType === 'STUDENT' || education.requestType === 'TEACHER'">Номер/название
              школы</label>
            <label for="school" class="block font-bold mt-3" v-if="education.requestType === 'GOVERNMENT_EMPLOYEE'">Наименование
              гос. компании</label>
            <label for="school" class="block font-bold mt-3" v-if="education.requestType === 'UNIVERSITY_STUDENT'">Наименование
              университета</label>
            <InputText id="school" v-model.trim="education.school" fluid disabled/>
          </div>
          <div v-if="education.requestType === 'STUDENT'">
            <label for="birthdayStr" class="block font-bold mt-3">Год рождения</label>
            <InputText id="birthdayStr" v-model.trim="education.birthdayStr" fluid disabled/>
          </div>
          <div v-if="education.requestType === 'STUDENT'">
            <label for="birthCertificatesNumber" class="block font-bold mt-3">Номер свидетельства о рождении
              ребёнка</label>
            <InputText id="birthCertificatesNumber" v-model.trim="education.birthCertificatesNumber" fluid disabled/>
          </div>
          <div v-if="education.requestType === 'UNIVERSITY_STUDENT'">
            <label for="birthCertificatesNumber" class="block font-bold mt-3">Номер студенческого билета</label>
            <InputText id="birthCertificatesNumber" v-model.trim="education.birthCertificatesNumber" fluid disabled/>
          </div>
          <div
              v-if="education.requestType === 'TEACHER' || education.requestType === 'GOVERNMENT_EMPLOYEE' || education.requestType === 'UNIVERSITY_STUDENT'">
            <label for="passportNumber" class="block font-bold mt-3">Номер паспорта</label>
            <InputText id="passportNumber" v-model.trim="education.passportNumber" fluid disabled/>
          </div>
          <div class="flex flex-col md:flex-row gap-8 mt-3"
               v-if="education.requestType === 'TEACHER' || education.requestType === 'GOVERNMENT_EMPLOYEE' || education.requestType === 'UNIVERSITY_STUDENT'">
            <div class="md:w-1/2">
              <Message severity="success" variant="outlined" v-if="education.isCitizen">Гражданин: Да</Message>
              <Message severity="warn" variant="outlined" v-if="!education.isCitizen">Гражданин: Нет</Message>
            </div>
            <div class="md:w-2/2" v-if="education.isCitizen">
              <Button label="Паспортные данные" text @click="syncPassportData"
                      :icon="!syncData ? 'pi pi-sync' : 'pi pi-spin pi-spinner'"/>
            </div>
          </div>
          <div
              v-if="education.requestType === 'TEACHER' || education.requestType === 'GOVERNMENT_EMPLOYEE' || education.requestType === 'UNIVERSITY_STUDENT'">
            <label for="inn" class="block font-bold mt-3">ИНН</label>
            <InputText id="inn" v-model.trim="education.inn" fluid disabled/>
          </div>
          <div class="mt-5">
            <Message severity="info">Язык обслуживания: {{ education.lang }}</Message>
          </div>

          <div>
            <label for="statusModel" class="block font-bold mt-3">Тип справки</label>
            <Select v-model="education.certificateType"
                    :options="ppRequestCertificateType"
                    option
                    optionLabel="name"
                    optionValue="value"
                    placeholder="Тип справки"
                    showClear
                    class="w-full">
            </Select>
          </div>
          <div>
            <label for="ruText" class="block font-bold mt-3">Причина отклонения</label>

            <Select :options="eduRejectReasons" @change="onChangeRejectReasons()"
                    v-model="education.selectedRejectReason" filter optionLabel="name"
                    placeholder="Причина отклонения" class="w-full">
              <template #value="slotProps">
                <div v-if="slotProps.value" class="flex items-center">
                  <div>{{ slotProps.value }}</div>
                </div>
                <span v-else>{{ slotProps.placeholder }}</span>
              </template>
              <template #option="slotProps">
                <div class="flex items-center">
                  <div>{{ slotProps.option }}</div>
                </div>
              </template>
            </Select>
          </div>
          <div class="mt-5">
            <label for="inn" class="block font-bold mt-3">Комментарий</label>
            <Textarea id="description" v-model="education.comment" style="width: 100%"/>
          </div>
          <div>
            <label for="statusModel" class="block font-bold mt-3">Статус</label>
            <Select v-model="education.stateModel" :options="ppRequestStates" option optionLabel="name"
                    placeholder="Статус" class="w-full" :invalid="submitted && !education.state">
              <template #option="slotProps">
                <Tag :value="slotProps.option.name" :severity="getStateLabel(slotProps.option.name)"/>
              </template>
            </Select>
            <small v-if="submitted && !education.state" class="text-red-500">Статус</small>
          </div>
        </div>
        <div class="md:w-2/3">
          <ImageGalleria :images="images"/>
        </div>

      </div>
      <template #footer>
        <div class="md:w-1/3" style="margin-left: auto; text-align: right">
          <div class="mb-2" v-if="education.blockedBy">
            <Message severity="error" variant="outlined"> Заявка имеет финальный статус! Пользователь:
              {{ education.blockedBy }}
            </Message>
          </div>
          <Button label="Отмена" icon="pi pi-times" text @click="hideEditDialog"/>
          <Button label="Сохранить" @click="save"
                  :icon="!saving ? 'pi pi-check' : 'pi pi-spin pi-spinner'"/>
        </div>
      </template>
    </Dialog>
    <Dialog v-model:visible="eventHistoryDialog" :style="{ width: '950px' }"
            header="История изменений (Старая!)"
            :modal="true">
      <AuditEventHistory :row-id="education.id" table-name="EDU_PRICEPLAN_REQUEST"/>
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideDialogEventHistory"/>
      </template>
    </Dialog>

    <Dialog v-model:visible="entityChangesDialog" :style="{ width: '1450px' }" header="История изменений"
            :modal="true">
      <EntityChanges :events="entityChanges"/>
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideDialogEntityChanges"/>
      </template>
    </Dialog>
    <Dialog v-model:visible="visibleWebView" modal header="FAQ"
            :style="{ width: '1450px' }">
      <iframe
          :src='"https://md-viewer.o.kg/?image="+baseUrl+"/docs?filePath=faq/02_education.md"'
          style="width: 100%; height: 600pt; border: none;"
          sandbox="allow-scripts allow-same-origin"
      ></iframe>
    </Dialog>
  </div>
</template>
