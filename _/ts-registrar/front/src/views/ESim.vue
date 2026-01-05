<script setup lang="ts">
import {FilterMatchMode} from '@primevue/core/api';
import {useToast} from 'primevue/usetoast';
import {computed, onMounted, ref, watchEffect} from 'vue';
import ESimService from '@/services/e-sim.service.ts';
import EnumsService from '@/services/enums.service.js';
import type {ESimDetailModel, ESimFilter, ESimModel} from '@/models/esim.model.ts';
import ESimGalleria from "@/components/esim/ESimGalleria.vue";
import NSelectField from "@/components/fields/NSelectField.vue";
import {useField, useForm} from 'vee-validate';
import * as yup from 'yup';
import DatePickerFormatted from "@/components/DatePickerFormatted.vue";
import dayjs from "dayjs";
import AuditEventHistory from "@/components/AuditEventHistory.vue";

const toast = useToast();
const esimService = new ESimService();
const enumsService = new EnumsService();

const dt = ref();
const esims = ref<ESimModel[]>([]);
const statuses = ref();
const docTypes = ref();
const loading = ref(false);
const count = ref(0);
const esim = ref({} as ESimDetailModel);
const esimDialog = ref(false);
const isEditMode = ref(false);
const entityChanges = ref();
const entityChangesDialog = ref(false);
const entityChangesOldDialog = ref(false);
const submitted = ref(false);
const saving = ref(false);
const excelLoadingEdit = ref(false);
const loadingViewDialogId = ref<number | null>(null);
const loadingEditDialogId = ref<number | null>(null);
const loadingEntityChangesId = ref<number | null>(null);
const loadingEntityChangesOldId = ref<number | null>(null);

const esimSchema = yup.object({
  msisdn: yup.string().required('Номер обязателен'),
  firstName: yup.string().required('Имя обязательно'),
  lastName: yup.string().required('Фамилия обязательна'),
  personalNumber: yup.string().nullable().when('docType', {
    is: 'PASSPORT',
    then: (s) => s.required('ИНН обязателен'),
  }),
  passportNumber: yup.string().nullable().when('docType', {
    is: 'PASSPORT',
    then: (s) => s.required('Номер паспорта обязателен'),
  }),
  address: yup.string().nullable().when('docType', {
    is: 'PASSPORT',
    then: (s) => s.required('Адрес обязателен'),
  }),
  passportIssuedBy: yup.string().nullable(),
  passportIssuedDate: yup.string().nullable(),
  dateOfBirth: yup.string().nullable(),
  docType: yup.string().required('Тип документа обязателен'),
  state: yup.string().required('Статус обязателен'),
  rejectReasonId: yup.number().nullable().when('state', {
    is: 'REJECTED',
    then: (s) => s.required('Причина отказа обязательна'),
  }),
  comments: yup.string().nullable(),
});

const { handleSubmit, errors, setValues, meta, validate } = useForm({
  validationSchema: esimSchema,
  initialValues: {
    msisdn: '',
    firstName: '',
    lastName: '',
    middleName: '',
    personalNumber: null,
    passportNumber: null,
    address: null,
    passportIssuedBy: null,
    passportIssuedDate: null,
    dateOfBirth: null,
    docType: '',
    state: '',
    rejectReasonId: null,
    comments: null,
  }
});

const { value: msisdn } = useField<string>('msisdn');
const { value: firstName } = useField<string>('firstName');
const { value: lastName } = useField<string>('lastName');
const { value: middleName } = useField<string>('middleName');
const { value: personalNumber } = useField<string | null>('personalNumber');
const { value: passportNumber } = useField<string | null>('passportNumber');
const { value: address } = useField<string | null>('address');
const { value: docType } = useField<string>('docType');
const { value: passportIssuedBy } = useField<string | null>('passportIssuedBy');
const { value: passportIssuedDate } = useField<string | null>('passportIssuedDate');
const { value: dateOfBirth } = useField<string | null>('dateOfBirth');
const { value: state } = useField<string>('state');
const { value: rejectReasonId } = useField<number | null>('rejectReasonId');
const { value: comments } = useField<string | null>('comments');
const { value: icc } = useField<string | null>('webRegistrar');

const isFormValid = computed(() => meta.value.valid);
const hasErrors = computed(() => Object.keys(errors.value).length > 0);
const canSave = computed(() => !saving.value && isFormValid.value);

watchEffect(() => {
});

const filters = ref({
  state: { value: null, matchMode: FilterMatchMode.EQUALS },
  msisdn: { value: null, matchMode: FilterMatchMode.CONTAINS },
  firstName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  lastName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  webRegistrar: { value: null, matchMode: FilterMatchMode.CONTAINS },
  personalNumber: { value: null, matchMode: FilterMatchMode.CONTAINS },
  fromDate: { value: null, matchMode: FilterMatchMode.CONTAINS },
  toDate: { value: null, matchMode: FilterMatchMode.CONTAINS },
  docType: { value: null, matchMode: FilterMatchMode.EQUALS },
});

const esimFilter = ref<ESimFilter>({
  page: 0,
  size: 20
});

const rejectReasonOptions = computed(() =>
    esim.value.rejectReasons.map(r => ({
      ...r,
      key: parseInt(r.key),
    }))
);

async function findAll(filter: ESimFilter) {
  loading.value = true;
  try {
    const data = await esimService.findAll(filter);
    esims.value = data.content;
    count.value = data.totalElements;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: error, life: 5000 });
  } finally {
    loading.value = false;
  }
}

function getAllESimState() {
  enumsService.getAllESimState().then((data) => {
    statuses.value = data;
  });
}

function getAllESimDocumentTypes() {
  enumsService.getAllESimDocumentType().then((data) => {
    docTypes.value = data;
  });
}

onMounted(() => {
  findAll({ page: 0, size: 20 });
  getAllESimState();
  getAllESimDocumentTypes();
});

function filterCallback(page: any) {
  esimFilter.value.page = page.page;
  esimFilter.value.size = page.rows;
  findAll(esimFilter.value);
}

const searchMsisdn = ref(0);
function filterMsisdnCallback(msisdn: any) {
  searchMsisdn.value = msisdn;
  setTimeout(() => {
    if (searchMsisdn.value === msisdn) {
      esimFilter.value.msisdn = msisdn;
      findAll(esimFilter.value);
    }
  }, 1000);
}

const searchFirstName = ref(0);
function filterFirstNameCallback(firstName: any) {
  searchFirstName.value = firstName;
  setTimeout(() => {
    if (searchFirstName.value === firstName) {
      esimFilter.value.firstName = firstName;
      findAll(esimFilter.value);
    }
  }, 1000);
}

const searchLastName = ref(0);
function filterLastNameCallback(lastName: any) {
  searchLastName.value = lastName;
  setTimeout(() => {
    if (searchLastName.value === lastName) {
      esimFilter.value.lastName = lastName;
      findAll(esimFilter.value);
    }
  }, 1000);
}

const searchWebRegistrar = ref(0);
function filterWebRegistrarCallback(webRegistrar: any) {
  searchWebRegistrar.value = webRegistrar;
  setTimeout(() => {
    if (searchWebRegistrar.value === webRegistrar) {
      esimFilter.value.webRegistrar = webRegistrar;
      findAll(esimFilter.value);
    }
  }, 1000);
}

const searchPersonalNumber = ref(0);
function filterPersonalNumberCallback(personalNumber: any) {
  searchPersonalNumber.value = personalNumber;
  setTimeout(() => {
    if (searchPersonalNumber.value === personalNumber) {
      esimFilter.value.personalNumber = personalNumber;
      findAll(esimFilter.value);
    }
  }, 1000);
}

function filterStatusCallback(status: any) {
  if (status === null)
    esimFilter.value.state = null;
  else
    esimFilter.value.state = status.value;
  findAll(esimFilter.value);
}

function filterDocTypeCallback(docType: any) {
  if (docType === null)
    esimFilter.value.docType = null;
  else
    esimFilter.value.docType = docType.value;
  findAll(esimFilter.value);
}


function toIsoDateTime(date: any) {
  if (!date) return null;
  if (typeof date === 'string' && date.includes('T')) return date;
  const d = new Date(date);
  return d.toISOString().slice(0, 19);
}

function filterDateCallback(date: Date | null, isStart: Boolean) {
  if(isStart) {
    esimFilter.value.fromDate = toIsoDateTime(date);
  }
  else {
    esimFilter.value.toDate = toIsoDateTime(date);
  }
  if (esimFilter.value.fromDate && esimFilter.value.toDate) {
    findAll(esimFilter.value);
  } else if (!esimFilter.value.fromDate && !esimFilter.value.toDate) {
    findAll(esimFilter.value);
  }
}

function getExcel() {
  excelLoadingEdit.value = true;
  esimService.getExcel(esimFilter.value).then((data) => {
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
  esim.value = {} as ESimDetailModel;
  esimDialog.value = false;
  isEditMode.value = false;
  submitted.value = false;
}

function formatDuration(millis: number | null): string {
  if (!millis || millis < 0) return "";

  const totalSeconds = Math.floor(millis / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
      .map(v => String(v).padStart(2, "0"))
      .join(":");
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return "";
  const d = dayjs(dateString);
  return d.isValid() ? d.format("DD-MM-YYYY HH:mm:ss") : dateString;
}


async function viewEntityChanges(row: ESimModel) {
  loadingEntityChangesId.value = row.id;
  try {
    entityChanges.value = await esimService.findHistoryById(row.id);
    entityChangesDialog.value = true;
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: error, life: 5000 });
  } finally {
    loadingEntityChangesId.value = null;
  }
}

async function viewEntityChangesOld(row: ESimModel) {
  esim.value = row;
  entityChangesOldDialog.value = true;
}

const save = handleSubmit(async (formData) => {
  submitted.value = true;
  saving.value = true;
  try {
    const dataToSave = {
      ...formData,
      id: esim.value.id,
      rejectReasonId: formData.rejectReasonId ? +formData.rejectReasonId : null,
    };


    await esimService.save(dataToSave);
    toast.add({ severity: 'success', summary: 'Успешно', detail: 'Данные сохранены', life: 3000 });
    findAll(esimFilter.value);
    hideDialog();
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: error, life: 5000 });
  } finally {
    saving.value = false;
  }
});

async function openDialog(row: ESimModel, edit = false) {
  if (edit) {
    loadingEditDialogId.value = row.id;
  } else {
    loadingViewDialogId.value = row.id;
  }
  try {
    if (edit) {
      esim.value = await esimService.findByIdForEdit(row.id);
      await validate();
      submitted.value = true;
      isEditMode.value = true;
    } else {
      esim.value = await esimService.findById(row.id);
      isEditMode.value = false;
    }
    setValues({
      lastName: esim.value.lastName || '',
      firstName: esim.value.firstName || '',
      middleName: esim.value.middleName || '',
      dateOfBirth: esim.value.dateOfBirth || null,
      msisdn: esim.value.msisdn || '',
      icc: esim.value.icc || '',
      personalNumber: esim.value.personalNumber || '',
      passportNumber: esim.value.passportNumber || '',
      passportIssuedDate: esim.value.passportIssuedDate || null,
      passportIssuedBy: esim.value.passportIssuedBy || '',
      address: esim.value.address || '',
      state: esim.value.state || '',
      rejectReasonId: esim.value.rejectReasonId || null,
      comments: esim.value.comments || '',
      docType: esim.value.docType || '',
      isManual: esim.value.isManual || false,
    });
    esimDialog.value = true;
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: error, life: 5000 });
  } finally {
    if (edit) {
      loadingEditDialogId.value = null;
    } else {
      loadingViewDialogId.value = null;
    }
  }
}

const formatDate = (dateStr: string | null) =>
    dateStr ? dayjs(dateStr).format('DD.MM.YYYY') : null;

async function fetchPassportData() {
  if (!personalNumber.value || !passportNumber.value) {
    toast.add({ severity: 'warn', summary: 'Внимание', detail: 'Заполните ИНН и номер паспорта', life: 4000 });
    return;
  }
  try {
    const data = await esimService.getPassportData(personalNumber.value, passportNumber.value);
    setValues({
      firstName: data.name || '',
      lastName: data.surname || '',
      middleName: data.patronymic || '',
      dateOfBirth: formatDate(data.dateOfBirth),
      address: data.message || '',
      passportIssuedDate: formatDate(data.issuedDate),
      passportIssuedBy: data.passportAuthority || '',
    });
    toast.add({ severity: 'success', summary: 'Данные получены', detail: 'Поля обновлены', life: 3000 });
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: error?.response?.data?.message || error.message || 'Не удалось получить данные', life: 5000 });
  }
}

function getErrorClass(fieldName: string) {
  return errors.value[fieldName] && submitted.value ? 'p-invalid' : '';
}

function getErrorMessage(fieldName: string) {
  return isEditMode && errors.value[fieldName] && submitted.value ? errors.value[fieldName] : '';
}

function getStatusLabel(status: string) {
  if (!status) return 'info';
  if (status === 'REJECTED') return 'danger';
  if (status === 'APPROVED') return 'success';
  return 'info';
}

</script>

<template>
  <div class="layout-main-full">
    <div class="card">
      <Toolbar class="mb-6">
        <template #end>
          <Button label="Export" severity="secondary" @click="getExcel"
                  :icon="!excelLoadingEdit ? 'pi pi-upload' : 'pi pi-spin pi-spinner'"/>
        </template>
      </Toolbar>
      <div class="flex flex-wrap gap-2 mb-4">
        <InputText v-model="filters.msisdn.value" @input="filterMsisdnCallback(filters.msisdn.value)" placeholder="Номер" style="width: 10rem" />
        <InputText v-model="filters.firstName.value" @input="filterFirstNameCallback(filters.firstName.value)" placeholder="Имя" style="width: 10rem" />
        <InputText v-model="filters.lastName.value" @input="filterLastNameCallback(filters.lastName.value)" placeholder="Фамилия" style="width: 10rem" />
        <InputText v-model="filters.webRegistrar.value" @input="filterWebRegistrarCallback(filters.webRegistrar.value)" placeholder="Регистратор" style="width: 10rem" />
        <InputText v-model="filters.personalNumber.value" @input="filterPersonalNumberCallback(filters.personalNumber.value)" placeholder="ИНН" style="width: 10rem" />
        <Select v-model="filters.state.value" @change="filterStatusCallback(filters.state.value)" :options="statuses" optionLabel="name" placeholder="Статус" style="width: 10rem" :showClear="true" />
        <DatePicker
            v-model="filters.fromDate.value"
            @update:modelValue="date => filterDateCallback(date, true)"
            dateFormat="dd.mm.yy"
            placeholder="Дата с"
            :manualInput="true"
            style="width: 7rem"
        />
        <DatePicker
            v-model="filters.toDate.value"
            @update:modelValue="date => filterDateCallback(date, false)"
            dateFormat="dd.mm.yy"
            placeholder="Дата по"
            :manualInput="true"
            style="width: 7rem"
        />
        <Select v-model="filters.docType.value" @change="filterDocTypeCallback(filters.docType.value)" :options="docTypes" optionLabel="name" placeholder="Тип документа" style="width: 14rem" :showClear="true" />

      </div>
      <DataTable
          :value="esims"
          tableStyle="min-width: 100rem"
          :loading="loading"
          scrollable scrollHeight="1020px"
          selectionMode="single"
      >
        <template #empty>Данные не найдены</template>
        <template #loading>Данные загружаются</template>
        <Column field="id" header="ID"></Column>
        <Column field="state" header="Статус">
          <template #body="slotProps">
            <Tag :value="slotProps.data.state" :severity="getStatusLabel(slotProps.data.state)" />
          </template>
        </Column>
        <Column field="createdAt" header="Дата создания" style="min-width: 14rem">
          <template #body="{ data }">
            {{ formatDateTime((data as ESimModel).createdAt) }}
          </template>
        </Column>
        <Column field="registrationDate" header="Дата резолюции" style="min-width: 14rem">
          <template #body="{ data }">
            {{ formatDateTime((data as ESimModel).registrationDate) }}
          </template>
        </Column>
        <Column
            field="intermediateTimeMillis"
            header="Промежуточное время" style="min-width: 14rem">
          <template #body="{ data }">
            {{ formatDuration((data as ESimModel).intermediateTimeMillis) }}
          </template>
        </Column>
        <Column field="processStartDate" header="Дата начала процесса" style="min-width: 14rem">
          <template #body="{ data }">
            {{ formatDateTime((data as ESimModel).processStartDate) }}
          </template>
        </Column>
        <Column field="msisdnReservedDate" header="Дата бронирования номера" style="min-width: 14rem">
          <template #body="{ data }">
            {{ formatDateTime((data as ESimModel).msisdnReservedDate) }}
          </template>
        </Column>
        <Column field="paymentStatus" header="Статус платежа" style="min-width: 14rem"></Column>
        <Column field="docTypeDescription" header="Тип документа" style="min-width: 14rem"></Column>

        <Column field="firstName" header="Имя"></Column>
        <Column field="lastName" header="Фамилия"></Column>
        <Column field="middleName" header="Отчество"></Column>
        <Column field="dateOfBirth" header="Дата рождения" style="min-width: 14rem"></Column>
        <Column field="msisdn" header="Номер"></Column>
        <Column field="icc" header="ICC"></Column>
        <Column field="personalNumber" header="ИНН"></Column>
        <Column field="passportNumber" header="Номер паспорта"></Column>
        <Column field="passportIssuedDate" header="Дата выдачи" style="min-width: 14rem"></Column>
        <Column field="passportIssuedBy" header="Орган выдачи" style="min-width: 14rem"></Column>
        <Column field="blocked" header="Блокирован">
          <template #body="{ data }">
            <i v-if="data" class="pi"
               :class="{ 'pi-check-circle text-green-500 ': data.blocked, 'pi-times-circle text-red-500': !data.blocked }"></i>
          </template>
        </Column>
        <Column field="webRegistrar" header="Регистратор"></Column>

        <Column :exportable="false" style="min-width: 10rem" alignFrozen="right" frozen>
          <template #body="slotProps">
            <Button :icon="loadingViewDialogId === slotProps.data.id ? 'pi pi-spin pi-spinner' : 'pi pi-search'"
                    outlined rounded class="mr-2"
                    @click="openDialog(slotProps.data, false)"
                    severity="info"
                    v-tooltip="'Просмотр'"
                    :loading="loadingViewDialogId === slotProps.data.id" />
            <Button :icon="loadingEditDialogId === slotProps.data.id ? 'pi pi-spin pi-spinner' : 'pi pi-pencil'"
                    outlined rounded class="mr-2"
                    @click="openDialog(slotProps.data, true)"
                    v-tooltip="'Редактировать'"
                    :loading="loadingEditDialogId === slotProps.data.id" />
            <Button :icon="loadingEntityChangesId === slotProps.data.id ? 'pi pi-spin pi-spinner' : 'pi pi-history'"
                    outlined rounded class="mr-2"
                    @click="viewEntityChanges(slotProps.data)"
                    severity="help"
                    v-tooltip="'История изменений'"
                    :loading="loadingEntityChangesId === slotProps.data.id" />
            <Button :icon="loadingEntityChangesOldId=== slotProps.data.id ? 'pi pi-spin pi-spinner' : 'pi pi-history'"
                    outlined rounded class="mr-2"
                    @click="viewEntityChangesOld(slotProps.data)"
                    severity="warn"
                    v-tooltip="'История изменений (Старая!)'"
                    :loading="loadingEntityChangesOldId === slotProps.data.id" />
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

    <Dialog v-model:visible="esimDialog" :style="{ width: '1350px' }" :header="isEditMode ? 'Редактирование заявки' : 'Просмотр заявки'" :modal="true">
      <form @submit.prevent="save">
        <div class="esim-form-grid">
          <div class="form-section">
            <div class="form-row">
              <label for="lastName">Фамилия <span class="required">*</span></label>
              <InputText id="lastName" v-model="lastName" :class="getErrorClass('lastName')" :readonly="!isEditMode" />
              <small v-if="getErrorMessage('lastName')" class="p-error">{{ getErrorMessage('lastName') }}</small>
            </div>
            <div class="form-row">
              <label for="firstName">Имя <span class="required">*</span></label>
              <InputText id="firstName" v-model="firstName" :class="getErrorClass('firstName')" :readonly="!isEditMode" />
              <small v-if="getErrorMessage('firstName')" class="p-error">{{ getErrorMessage('firstName') }}</small>
            </div>
            <div class="form-row">
              <label for="middleName">Отчество</label>
              <InputText id="middleName" v-model="middleName" :class="getErrorClass('middleName')" :readonly="!isEditMode" />
              <small v-if="getErrorMessage('middleName')" class="p-error">{{ getErrorMessage('middleName') }}</small>
            </div>
            <div class="form-row">
              <label for="dateOfBirth">Дата рождения</label>
              <DatePickerFormatted id="dateOfBirth" v-model:inDate="dateOfBirth" :class="getErrorClass('dateOfBirth')" :edit-able-field="isEditMode" />
              <small v-if="getErrorMessage('dateOfBirth')" class="p-error">{{ getErrorMessage('dateOfBirth') }}</small>
            </div>
            <div class="form-row">
              <label for="msisdn">MSISDN <span class="required">*</span></label>
              <InputText id="msisdn" v-model="msisdn" :class="getErrorClass('msisdn')" :readonly="!isEditMode" />
              <small v-if="getErrorMessage('msisdn')" class="p-error">{{ getErrorMessage('msisdn') }}</small>
            </div>
            <div class="form-row">
              <label for="icc">ICC</label>
              <InputText id="icc" v-model="icc" :class="getErrorClass('icc')" :readonly="!isEditMode" />
              <small v-if="getErrorMessage('icc')" class="p-error">{{ getErrorMessage('icc') }}</small>
            </div>
            <div class="form-row">
              <label for="personalNumber">ИНН</label>
              <InputText id="personalNumber" v-model="personalNumber" :class="getErrorClass('personalNumber')" :readonly="!isEditMode" />
              <small v-if="getErrorMessage('personalNumber')" class="p-error">{{ getErrorMessage('personalNumber') }}</small>
            </div>
            <div class="form-row">
              <label for="passportNumber">Номер паспорта</label>
              <InputText id="passportNumber" v-model="passportNumber" :class="getErrorClass('passportNumber')" :readonly="!isEditMode" />
              <small v-if="getErrorMessage('passportNumber')" class="p-error">{{ getErrorMessage('passportNumber') }}</small>
            </div>
            <div class="form-row fluid">
              <label for="passportIssuedDate">Дата выдачи</label>
              <DatePickerFormatted id="passportIssuedDate" v-model:inDate="passportIssuedDate" :class="getErrorClass('passportIssuedDate')" :edit-able-field="isEditMode" />
              <small v-if="getErrorMessage('passportIssuedDate')" class="p-error">{{ getErrorMessage('passportIssuedDate') }}</small>
            </div>
            <div class="form-row">
              <label for="passportIssuedBy">Орган выдачи</label>
              <InputText id="passportIssuedBy" v-model="passportIssuedBy" :class="getErrorClass('passportIssuedBy')" :readonly="!isEditMode" />
              <small v-if="getErrorMessage('passportIssuedBy')" class="p-error">{{ getErrorMessage('passportIssuedBy') }}</small>
            </div>
            <div class="form-row">
              <label for="address">Адрес регистрации</label>
              <InputText id="address" v-model="address" :class="getErrorClass('address')" :readonly="!isEditMode" />
              <small v-if="getErrorMessage('address')" class="p-error">{{ getErrorMessage('address') }}</small>
            </div>
            <div class="form-row">
              <label for="docType">Тип документа</label>
              <Select id="docType" v-model="docType" :options="docTypes" option-value="value" optionLabel="name" :class="getErrorClass('docType')" :disabled="!isEditMode || docType !== 'FOREIGN_PASSPORT'" />
              <small v-if="getErrorMessage('docType')" class="p-error">{{ getErrorMessage('docType') }}</small>
            </div>
            <div class="form-row">
              <label for="state">Статус заявки</label>
              <Select id="state" v-model="state" :options="statuses" option-value="value" optionLabel="name" :class="getErrorClass('state')" :disabled="!isEditMode" />
              <small v-if="getErrorMessage('state')" class="p-error">{{ getErrorMessage('state') }}</small>
            </div>
            <div class="form-row" v-if="state === 'REJECTED'">
              <label for="rejectReasonId">Причина отклонения</label>
              <n-select-field id="rejectReasonId" v-model="rejectReasonId" :options="rejectReasonOptions" option-label="description"
                              option-value="key"
                              :class="getErrorClass('rejectReasonId')" :disabled="!isEditMode" />
              <small v-if="getErrorMessage('rejectReasonId')" class="p-error">{{ getErrorMessage('rejectReasonId') }}</small>
            </div>
            <div class="form-row">
              <label for="comments">Комментарий</label>
              <Textarea id="comments" v-model="comments" :class="getErrorClass('comments')" :readonly="!isEditMode" rows="3" />
              <small v-if="getErrorMessage('comments')" class="p-error">{{ getErrorMessage('comments') }}</small>
            </div>
            <div class="form-row">
              <label for="isManual">Данные заполнены вручную</label>
              <InputText id="isManual" :value="esim.manual ? 'Да' : 'Нет'" readonly />
            </div>
            <div class="form-row">
              <Button label="Данные паспорта" :disabled="docType != 'PASSPORT' || !isEditMode || !personalNumber || !passportNumber"
                      @click="fetchPassportData" />
            </div>
          </div>
          <div class="md:w-2/3">
            <e-sim-galleria :images="esim.files"/>
          </div>
        </div>
      </form>
      <template #footer>
        <div class="flex justify-between items-center w-full">
          <div v-if="hasErrors && submitted && isEditMode" class="text-red-500 text-sm">
            <i class="pi pi-exclamation-triangle mr-2"></i>
            Пожалуйста, исправьте ошибки в форме
          </div>
          <div class="flex gap-2 ml-auto">
            <Button label="Отмена" icon="pi pi-times" text @click="hideDialog" :disabled="saving" />
            <Button v-if="isEditMode" label="Сохранить" @click="save" :icon="saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'" :disabled="!canSave" :loading="saving" />
          </div>
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="entityChangesDialog" :style="{ width: '1450px' }" header="История изменений" :modal="true">
      <EntityChanges :events="entityChanges" />
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="() => { entityChangesDialog = false }" />
      </template>
    </Dialog>
    <Dialog v-model:visible="entityChangesOldDialog" :style="{ width: '950px' }"
            header="История изменений (Старая!)"
            :modal="true">
      <AuditEventHistory :row-id="esim.id" table-name="E_SIM"/>
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="() => { entityChangesOldDialog = false }"/>
      </template>
    </Dialog>  </div>
</template>

<style>
.esim-form-grid {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  flex-wrap: nowrap;
}
.form-section {
  flex: 1 1 0;
  min-width: 350px;
  max-width: 400px;
  width: 100%;
  margin-bottom: 0;
  overflow-y: auto;
}
.galleria-section {
  flex: 0 0 400px;
  min-width: 350px;
  max-width: 500px;
  display: flex;
  align-items: flex-start;
}
.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
.form-row {
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
}
.form-row label {
  font-weight: 600;
  margin-bottom: 0.4rem;
  font-size: 1rem;
}
.form-row input[readonly],
.form-row textarea[readonly],
.form-row .p-inputtext[readonly],
.form-row .p-inputtext[disabled],
.form-row .p-dropdown[disabled],
.form-row .p-inputtextarea[readonly],
.form-row .p-inputtextarea[disabled],
.form-row .p-datepicker[readonly],
.form-row .p-datepicker[disabled],
.form-row .p-select[disabled],
.form-row .p-select[readonly] {
  background-color: #f3f4f6 !important;
  color: #6b7280 !important;
  cursor: not-allowed !important;
  border-color: #e5e7eb !important;
}
.form-row .p-inputtext,
.form-row .p-dropdown,
.form-row .p-inputtextarea,
.form-row .p-datepicker,
.form-row .p-select {
  border-radius: 6px;
  font-size: 1rem;
}
.required {
  color: #ef4444;
}
.p-error {
  color: #ef4444;
}
</style>