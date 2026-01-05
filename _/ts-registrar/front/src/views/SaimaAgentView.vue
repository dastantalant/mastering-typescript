<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {useToast} from 'primevue/usetoast';
import {DateTime} from 'luxon';

// Components
import DataTableComponent from '@/components/datatable/DataTableComponent.vue';
import AuditEventHistory from '@/components/AuditEventHistory.vue';
import EntityChanges from '@/components/EntityChanges.vue';

// Types

import {
  type ConnectionDataDTO,
  type SaimaAgent,
  type SaimaAgentFilter,
  SaimaAgentMapper,
  type SaimaAgentUploads,
  type ShortSaimaAgentDTO
} from '@/models/saima-agent.model';
import type {Enum} from '@/models/enum.model';
import type {Page} from '@/models/page.model';
import type {SaimaTemplateCategory} from '@/models/dictionary/saima-template-category.model';
import type {SaimaTemplate} from '@/models/dictionary/saima-template.model';
import type {EntityChangesModel} from '@/models/entity-changes.model';
import type {PassportResponse} from '@/models/dictionary/passport.model';
import {SaimaState} from '@/enums/saima-agent.enum';

// Services
import EnumsService from '@/__test__/services/enums.service.ts';
import SaimaAgentService from '@/__test__/services/saima-agent.service.ts';
import SaimaTemplateCategoryService from '@/__test__/services/dictionary/saima-template-category.service.ts';
import ConnectionDataService from '@/__test__/services/dictionary/connection-data.service.ts';
import PassportService from '@/__test__/services/dictionary/passport.service.ts';

// Utils
import {DatetimeUtil} from '@/util/datetime.util';
import DurationUtil from '@/utils/duration';
import type {DialogContext, DialogConfig, FormField, Photo} from "@/components/dialog/dataDialog.types.ts";
import DataEditorDialog from "@/components/dialog/DataEditorDialog.vue";
import {Render} from "@/components/datatable/render.helper.js";
import {Filter} from "@/components/datatable/filter.helper.ts";
import {
  ButtonVariant,
  ColumnPin,
  type FetchDataParams,
  Severity,
} from "@/components/types/common.types.ts";
import type {CommandHandler, DataTableConfig, DataTableContext} from "@/components/types/datatable.types.ts";
import {Toolbar} from "@/components/types/toolbar.helper.ts";


// ====================================
// CONSTANTS & SERVICES
// ====================================

const toast = useToast();
const durationUtil = new DurationUtil();

const MSISDN_REGEXP = /^\+?996\d{9}$/;
const NAME_VALIDATION_PATTERN = /^([a-zA-Zа-яА-Я-ҢңҮүӨө ]{2,30})$/;

const SAIMA_STATE_SEVERITY_MAP = new Map([
  [SaimaState.REJECTED, Severity.Danger],
  [SaimaState.FOR_CORRECTION, Severity.Danger],
  [SaimaState.TECHNICAL_SHEET_ISSUED, Severity.Success],
  [SaimaState.PERSONAL_ACCOUNT_ISSUED, Severity.Success],
  [SaimaState.SELECTED, Severity.Warning],
  [SaimaState.ADDING_AN_ADDRESS, Severity.Warning],
  [SaimaState.PENDING, Severity.Info]
]);

// ====================================
// DICTIONARY STATE
// ====================================

const dictionaries = ref({
  channels: [] as Enum[],
  regions: [] as Enum[],
  saimaStates: [] as Enum[],
  saimaPhotoTypes: [] as Enum[],
  documentTypes: [] as Enum[],
  saimaSubEditData: [] as Enum[],
  tariffs: [] as ConnectionDataDTO[],
  routers: [] as ConnectionDataDTO[],
  consoles: [] as ConnectionDataDTO[],
  saimaTemplateCategories: [] as SaimaTemplateCategory[],
});

const maps = ref({
  saimaStateMap: new Map<string, Enum>(),
  photoTypesMap: new Map<string, Photo>(),
  saimaTemplateMap: new Map<number, SaimaTemplate>(),
  saimaTemplatesByCategory: {} as Record<string, any[]>
});

const photoTypesList = ref<Photo[]>([]);

// ====================================
// TABLE STATE
// ====================================

type DataTableComponentInstance = InstanceType<typeof DataTableComponent>;
const tableDataTableRef = ref<DataTableComponentInstance | null>(null);
const tableIsDataReady = ref(false);

// ====================================
// DIALOG STATE
// ====================================

const dataEditorDialogRef = ref<InstanceType<typeof DataEditorDialog>>(null);
const dialogVisible = ref(false);
const dialogLoading = ref(false);
const dialogTitle = ref('');
const dialogSaimaAgentModel = ref<SaimaAgent>({});
const dialogPhotoItems = ref<Photo[]>([]);
const dialogMessage = ref<Record<string, string>>({});
const dialogIsRecordEditable = ref(true);
const dialogFieldsConfig = ref<FormField[]>([]);

// ====================================
// HISTORY DIALOG STATE
// ====================================

const dialogEventHistoryFlag = ref(false);
const dialogEventHistorySaimaAgentId = ref<number>();
const dialogEntityChangesFlag = ref(false);
const entityChangesList = ref<EntityChangesModel[]>([]);

// ====================================
// PASSPORT DIALOG STATE
// ====================================

const isPassportConfirmDialogVisible = ref(false);
const isFetchingPassportData = ref(false);
const passportDataToConfirm = ref<PassportResponse>(null);

// ====================================
// DICTIONARY LOADING
// ====================================
async function fetchDictionary() {
  try {
    const enums = await EnumsService.findAllRegistrarChanel()
        .getAllRegion()
        .getAllSaimaState()
        .getAllSaimaPhotoType()
        .getAllDocumentType()
        .getAllSaimaSubEditData();

    const getAllConnectionDataTypes = await ConnectionDataService.getAllConnectionDataTypes();
    const findAllExtended = await SaimaTemplateCategoryService.findAllExtended();

    dictionaries.value = {
      channels: enums.findAllRegistrarChanel,
      regions: enums.getAllRegion,
      saimaStates: enums.getAllSaimaState,
      saimaPhotoTypes: enums.getAllSaimaPhotoType,
      documentTypes: enums.getAllDocumentType,
      saimaSubEditData: enums.getAllSaimaSubEditData,
      tariffs: getAllConnectionDataTypes.tariffs,
      routers: getAllConnectionDataTypes.routers,
      consoles: getAllConnectionDataTypes.consoles,
      saimaTemplateCategories: findAllExtended,
    };

    buildSaimaStateMap(enums.getAllSaimaState);
    buildPhotoTypesMap(enums.getAllSaimaPhotoType);
    buildTemplateMap(findAllExtended);

  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка загрузки справочников',
      detail: error.message,
      life: 5000
    });
  }
}

function buildSaimaStateMap(states: Enum[]) {
  for (const state of states) {
    maps.value.saimaStateMap.set(state.value, state);
  }
}

function buildPhotoTypesMap(photoTypes: Enum[]) {
  for (const element of photoTypes) {
    const photo: Photo = {
      id: element.code,
      name: element.name,
      type: element.value,
    };
    photoTypesList.value.push(photo);
    maps.value.photoTypesMap.set(element.value, photo);
  }
}

function buildTemplateMap(categories: SaimaTemplateCategory[]) {
  for (const category of categories) {
    maps.value.saimaTemplatesByCategory[category.id] = category.saimaTemplates || [];
    for (const template of category.saimaTemplates) {
      maps.value.saimaTemplateMap.set(template.id, template);
    }
  }
}

// ====================================
// TABLE CONFIGURATION
// ====================================

const tableConfig = computed((): DataTableConfig<ShortSaimaAgentDTO> => ({
  title: "Агенты Saima",
  dataKey: "id",
  toolbar: [
    Toolbar.ClearFilters(),
    Toolbar.Export({variant: ButtonVariant.Text, action: 'export'})
  ],
  columns: [
    {field: 'id', header: 'ID', pin: ColumnPin.Left},
    {
      field: 'state',
      header: 'Статус',
      pin: ColumnPin.Left,
      renderer: Render.Tag({
        value: (data: ShortSaimaAgentDTO) => maps.value.saimaStateMap.get(data.state)?.name || data.state,
        severity: (data: ShortSaimaAgentDTO) => SAIMA_STATE_SEVERITY_MAP.get(data.state)
      }),
      filter: Filter.Select(dictionaries.value.saimaStates),
    },
    {field: 'msisdn', header: 'Номер абонента', filter: Filter.Numeric()},
    {field: 'accountNumber', header: 'Номер лицевого счета', filter: Filter.Text({placeholder: 'Поиск по ФИО'})},
    {field: 'fullName', header: 'ФИО', filter: true},
    {field: 'inn', header: 'ИНН'},
    {field: 'registrarFullName', header: 'Регистратор', filter: true},
    {field: 'registrarMsisdn', header: 'Номер регистратора'},
    {
      field: 'region',
      header: 'Регион',
      filter: Filter.Select(dictionaries.value.regions),
    },
    {field: 'district', header: 'Район'},
    {field: 'city', header: 'Город'},
    {field: 'address', header: 'Адрес'},
    {
      field: 'channel',
      header: 'Канал',
      filter: Filter.Select(dictionaries.value.channels),
    },
    {field: 'supervisorFullName', header: 'Супервайзер', filter: true},
    {field: 'supervisorMsisdn', header: 'Номер супервайзера'},
    {
      field: 'createdAt',
      header: 'Создан',
      style: 'min-width: 100',
      filter: Filter.DateRange().format('dd.mm.yy'),
      renderer: Render.Text((data: ShortSaimaAgentDTO) => DatetimeUtil.formatStringDate(data.createdAt)),
    },
    {
      field: 'updatedAt',
      header: 'Изменен',
      renderer: Render.Date().format('dd.MM.yyyy HH:mm'),
    },
    {
      field: 'timeTaken',
      header: 'Время в обработке',
      renderer: Render.Text((data: ShortSaimaAgentDTO) => durationUtil.convertMillisToHHMMSS(data.timeTaken)),
    },
    {
      field: 'isBlocked',
      header: 'Блокирован',
      renderer: Render.Text((data: ShortSaimaAgentDTO) => data.isBlocked ? 'ДА' : 'НЕТ'),
    },
    {field: 'webRegistrar', header: 'WEB Регистратор', filter: true},
    {
      pin: ColumnPin.Right,
      style: 'min-width: 100px; text-align: center grid grid-cols-2 gap-1 w-fit mx-auto',
      renderer: Render.Actions([
        {
          action: 'edit',
          icon: 'pi pi-pencil',
          severity: Severity.Info,
          tooltip: 'Редактировать',
          isVisible: '!#{isBlocked}'
        },
        {
          action: 'view',
          icon: 'pi pi-eye',
          severity: Severity.Info,
          tooltip: 'Просмотр',
        },
        {
          action: 'history',
          icon: 'pi pi-history',
          severity: Severity.Info,
          tooltip: 'История'
        },
        {
          action: 'oldHistory',
          icon: 'pi pi-history',
          severity: Severity.Warning,
          tooltip: 'История (старая)'
        },
      ])
    },
  ],
}));

// ====================================
// TABLE DATA FUNCTIONS
// ====================================

async function fetchData(params: FetchDataParams) {
  const filter: SaimaAgentFilter = {
    page: params.page,
    size: params.rows,
    ...SaimaAgentService.createSaimaAgentFilter(params.filters)
  };

  try {
    const data: Page<ShortSaimaAgentDTO> = await SaimaAgentService.findAll(filter);
    return {items: data.content || [], totalRecords: data.totalElements || 0};
  } catch (error: any) {
    toast.add({severity: 'error', summary: 'Ошибка', detail: error.message, life: 5000});
    return {items: [], totalRecords: 0};
  }
}

const exportData = async (context: DataTableContext<ShortSaimaAgentDTO>) => {
  const filter: SaimaAgentFilter = SaimaAgentService.createSaimaAgentFilter(context.filters);

  try {
    await SaimaAgentService.getExcel(filter);
    toast.add({severity: 'success', summary: 'Экспорт начат', detail: 'Файл скоро будет загружен.', life: 3000});
  } catch (error: any) {
    toast.add({severity: 'error', summary: 'Ошибка экспорта', detail: error.message, life: 5000});
  }
}

// ====================================
// DIALOG FUNCTIONS
// ====================================

const openDialog = async (context: DataTableContext<ShortSaimaAgentDTO>) => {
  try {
    const saimaAgent: ShortSaimaAgentDTO = context.data as ShortSaimaAgentDTO;
    dialogTitle.value = String(saimaAgent.id);
    const fullSaimaAgent = await SaimaAgentService.getFullSaimaAgent(saimaAgent.id);

    dialogSaimaAgentModel.value = SaimaAgentMapper.fromDTO(fullSaimaAgent);
    dialogPhotoItems.value = buildPhotoItems(fullSaimaAgent.saimaAgentUploads);
    dialogIsRecordEditable.value = isAgentEditable(dialogSaimaAgentModel.value);
    dialogMessage.value = {};
    dialogVisible.value = true;
  } catch (error) {
    console.error("Ошибка при загрузке агента:", error);
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось загрузить данные агента',
      life: 5000
    });
  }
}

function buildPhotoItems(uploads: SaimaAgentUploads[] = []): Photo[] {
  return uploads
      .filter(upload => upload.saimaPhotoType)
      .map(upload => {
        const photo = maps.value.photoTypesMap.get(upload.saimaPhotoType);
        return photo ? {...photo, url: upload.signedUrl} : null;
      })
      .filter(Boolean);
}

function isAgentEditable(agent: SaimaAgent): boolean {
  return agent.editable && !!agent.msisdn && MSISDN_REGEXP.test(agent.msisdn);
}

async function dialogHandleSave(context: DialogContext<SaimaAgent>) {
  dialogLoading.value = true;
  dialogMessage.value = {};

  try {
    await SaimaAgentService.put(
        context.editData,
        SaimaAgentMapper.toUpdateDTO(context.editData)
    );

    dialogVisible.value = false;
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Данные сохранены',
      life: 3000
    });

    tableDataTableRef.value?.refresh();
  } catch (error: any) {
    dialogMessage.value = {
      text: getErrorMessage(error),
      severity: 'error',
    } as Record<string, string>;
    console.error("Failed to save data:", error);
  } finally {
    dialogLoading.value = false;
  }
}

function getErrorMessage(error: any): string {
  const status = error?.response?.status;
  const responseData = error?.response?.data;

  const errorMessages = {
    400: responseData?.message || responseData?.error || 'Неверные данные. Проверьте заполненные поля.',
    401: 'Ошибка авторизации. Пожалуйста, войдите в систему заново.',
    403: 'У вас нет прав для выполнения этого действия.',
    404: 'Сайма Агент не найден.',
    409: responseData?.message || 'Конфликт данных. Возможно, такая запись уже существует.',
    500: 'Произошла внутренняя ошибка сервера. Попробуйте позже.',
  } as Record<number, string>;

  if (status && errorMessages[status]) {
    return errorMessages[status];
  }

  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'Ошибка сети. Проверьте ваше интернет-соединение.';
  }

  return error?.message || 'Произошла непредвиденная ошибка.';
}

async function dialogBeforeEditAction(context: DialogContext<SaimaAgent>) {
  const isPending = context.formData.state === SaimaState.PENDING;
  const isAddingAddress = context.formData.state === SaimaState.ADDING_AN_ADDRESS;

  if (isPending || isAddingAddress) {
    const fullSaimaAgent = await SaimaAgentService.setSelected(context.formData.id);
    tableDataTableRef.value?.refresh();
    return SaimaAgentMapper.fromDTO(fullSaimaAgent);
  }
}

// ====================================
// HISTORY DIALOG FUNCTIONS
// ====================================

const openOldHistoryDialog = async (context: DataTableContext<ShortSaimaAgentDTO>) => {
  const saimaAgent: ShortSaimaAgentDTO = context.data as ShortSaimaAgentDTO;
  dialogEventHistorySaimaAgentId.value = saimaAgent.id;
  dialogEventHistoryFlag.value = true;
}

const openHistoryDialog = async (context: DataTableContext<ShortSaimaAgentDTO>) => {
  try {
    const saimaAgent: ShortSaimaAgentDTO = context.data as ShortSaimaAgentDTO;
    const data = await SaimaAgentService.getSaimaAgentHistoryById(saimaAgent.id);
    entityChangesList.value = data.length > 0 ? data : [];
    dialogEntityChangesFlag.value = true;
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка загрузки истории',
      detail: error.message,
      life: 5000
    });
  }
}

function hideHistoryDialog() {
  dialogEventHistoryFlag.value = false;
  dialogEntityChangesFlag.value = false;
  entityChangesList.value = [];
}

// ====================================
// PASSPORT FUNCTIONS
// ====================================

async function fetchAndConfirmPassportData(context: DialogContext<SaimaAgent>) {
  const {inn, documentId} = context.editData;

  if (!inn || !documentId) {
    toast.add({
      severity: 'warn',
      summary: 'Внимание',
      detail: 'Введите ИНН и номер документа',
      life: 3000
    });
    return;
  }

  isFetchingPassportData.value = true;

  try {
    passportDataToConfirm.value = await PassportService.getPassportData(inn, documentId);
    isPassportConfirmDialogVisible.value = true;
  } catch (error: any) {
    const detail = error?.response?.status === 404
        ? 'Данные по ПИН не найдены.'
        : 'Не удалось получить данные паспорта.';

    toast.add({severity: 'error', summary: 'Ошибка', detail, life: 5000});
  } finally {
    isFetchingPassportData.value = false;
  }
}

function applyPassportData() {
  if (!passportDataToConfirm.value || !dataEditorDialogRef.value) {
    return;
  }

  const response = passportDataToConfirm.value;
  const birthDate = parseDate(response.dateOfBirth);
  const issuedDate = parseDate(response.issuedDate);

  const updates = {
    surname: response.surname,
    firstName: response.name,
    middleName: response.patronymic,
    birthDate,
    issuedDate,
    authority: response.passportAuthority,
    address: response.address
  };

  dataEditorDialogRef.value.updateEditData(updates);

  setTimeout(() => {
    dataEditorDialogRef.value?.revalidateAllFields();
  }, 0);

  toast.add({
    severity: 'success',
    summary: 'Успешно',
    detail: 'Данные применены',
    life: 3000
  });

  isPassportConfirmDialogVisible.value = false;
}

function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  return DateTime.fromFormat(dateString, 'dd.MM.yyyy').toJSDate();
}

function generatePassportMessage(data: PassportResponse): string {
  return `
    <p><strong>ФИО:</strong> ${data.surname} ${data.name} ${data.patronymic}</p>
    <p><strong>Дата рождения:</strong> ${data.dateOfBirth}</p>
    <p><strong>Дата выдачи:</strong> ${data.issuedDate}</p>
    <p><strong>Орган:</strong> ${data.passportAuthority}</p>
    <p><strong>Адрес регистрации:</strong> ${data.address}</p>
  `;
}

// ====================================
// FIELD CONFIGURATION
// ====================================

function configureDialogFields() {
  const isAllFieldsRequired = (ctx: DialogContext<SaimaAgent>) =>
      [SaimaState.SELECTED, SaimaState.TECHNICAL_SHEET_ISSUED, SaimaState.PERSONAL_ACCOUNT_ISSUED]
          .includes(ctx.editData.value.state);

  const isTemplateDisabled = isAllFieldsRequired;

  const isRejectedOrForCorrection = (ctx: DialogContext<SaimaAgent>) =>
      [SaimaState.REJECTED, SaimaState.FOR_CORRECTION].includes(ctx.editData.value.state);

  dialogFieldsConfig.value = [
    // Basic Information
    {field: 'id', label: 'ID', type: 'number', editable: false},
    {
      field: 'msisdn',
      label: 'Номер телефона',
      type: 'number',
      required: "Номер не заполнено",
      requiredCondition: isAllFieldsRequired,
      validation: {
        pattern: MSISDN_REGEXP,
        patternMessage: 'Номер не соответствует 996XXXXXXXXX'
      }
    },
    {
      field: 'tariffId',
      label: 'Тариф',
      type: 'select',
      options: dictionaries.value.tariffs,
      optionLabel: 'name',
      optionValue: 'id',
      required: "Тариф не выбран",
      requiredCondition: isAllFieldsRequired,
    },
    {
      field: 'routerId',
      label: 'Роутер',
      type: 'select',
      options: dictionaries.value.routers,
      optionLabel: 'name',
      optionValue: 'id',
      required: "Роутер не выбран",
      requiredCondition: isAllFieldsRequired,
    },
    {
      field: 'consoleId',
      label: 'Приставка',
      type: 'select',
      options: dictionaries.value.consoles,
      optionLabel: 'name',
      optionValue: 'id',
      required: "Приставка не выбрана",
      requiredCondition: isAllFieldsRequired,
    },
    {
      field: 'accountNumber',
      label: 'Номер лицевого счета',
      required: "Номер лицевого счета не заполнено",
      requiredCondition: isAllFieldsRequired,
    },
    {
      field: 'contractNumber',
      label: 'Номер документа',
      required: "Номер документа не заполнен",
    },
    {
      field: 'wishedDate',
      label: 'Желаемая дата',
      type: 'date',
      dateFormat: 'dd.MM.yyyy',
      required: "Желаемая дата не заполнена",
      requiredCondition: isAllFieldsRequired,
    },

    // Personal Information
    {
      field: 'surname',
      label: 'Фамилия',
      required: "Фамилия не заполнена",
      requiredCondition: isAllFieldsRequired,
      validation: {
        pattern: NAME_VALIDATION_PATTERN,
        patternMessage: "Только буквы, без цифр или других знаков"
      }
    },
    {
      field: 'firstName',
      label: 'Имя',
      required: "Имя не заполнено",
      requiredCondition: isAllFieldsRequired,
      validation: {
        pattern: NAME_VALIDATION_PATTERN,
        patternMessage: "Только буквы, без цифр или других знаков"
      }
    },
    {
      field: 'middleName',
      label: 'Отчество',
      required: false,
      validation: {
        pattern: NAME_VALIDATION_PATTERN,
        patternMessage: "Только буквы, без цифр или других знаков"
      }
    },

    // Address Information
    {
      field: 'region',
      label: 'Область',
      type: 'select',
      options: dictionaries.value.regions,
      optionLabel: 'name',
      optionValue: 'value',
      required: "Область не выбрана",
      requiredCondition: isAllFieldsRequired,
    },
    {field: 'district', label: 'Район', required: "Район не заполнен", requiredCondition: isAllFieldsRequired},
    {field: 'city', label: 'Город', required: "Город не заполнен", requiredCondition: isAllFieldsRequired},
    {
      field: 'street',
      label: 'Улица',
      required: "Название улицы не заполнено",
      requiredCondition: isAllFieldsRequired,
    },
    {field: 'house', label: 'Дом', required: "Номер дома не заполнен", requiredCondition: isAllFieldsRequired},
    {field: 'apartment', label: 'Квартира'},
    {field: 'supervisor', label: 'Супервайзер', editable: false},
    {field: 'registrar', label: 'Регистратор', editable: false},

    // Passport Data Section
    {type: 'divider', label: 'Паспортные данные'},
    {
      field: 'documentType',
      label: 'Тип документа',
      type: 'select',
      options: dictionaries.value.documentTypes,
      optionLabel: 'name',
      optionValue: 'value',
      defaultValue: 'PASSPORT',
      required: true,
      requiredCondition: isAllFieldsRequired,
    },
    {
      field: 'inn',
      label: 'Персональный номер',
      required: "Персональный номер не заполнен",
      requiredCondition: isAllFieldsRequired,
      validation: {
        pattern: /^\d{14}$/,
        patternMessage: "Некорректно введен ПИН"
      }
    },
    {
      field: 'documentId',
      label: 'Номер документа',
      required: "Номер документа не заполнен",
      requiredCondition: isAllFieldsRequired,
      validation: {
        pattern: /(^ID|^AN)([0-9]+$)/,
        patternMessage: "Неверно введен номер документа"
      }
    },
    {
      type: 'button',
      label: 'Данные по паспорту',
      icon: 'pi pi-id-card',
      displayCondition: (ctx: DialogContext<SaimaAgent>) =>
          ctx.isEditing &&
          (ctx.editData.value.state === 'ACCEPTED' || ctx.editData.value.state === SaimaState.SELECTED) &&
          ctx.editData.value.documentType === 'PASSPORT',
      loadingCondition: () => isFetchingPassportData.value,
      action: fetchAndConfirmPassportData
    },
    {
      field: 'birthDate',
      label: 'Дата рождения',
      type: 'date',
      dateFormat: 'dd.MM.yyyy',
      required: "Дата рождение пустое",
      requiredCondition: isAllFieldsRequired,
      validation: {
        validator: (newValue: Date, _ctx: DialogContext<SaimaAgent>) => {
          if (!newValue) return "Дата рождение пустое";
          const age = DateTime.local().diff(DateTime.fromJSDate(newValue), 'years').years;
          if (age < 18) return 'Возраст должен быть не менее 18 лет.';
        }
      },
    },
    {
      field: 'address',
      label: 'Адрес регистрации',
      type: 'textarea',
      rows: 2,
      required: "Адрес регистрации не заполнен",
      requiredCondition: isAllFieldsRequired,
    },
    {
      field: 'issuedDate',
      label: 'Дата выдачи',
      type: 'date',
      dateFormat: 'dd.MM.yyyy',
      required: "Дата выдачи пустое",
      requiredCondition: isAllFieldsRequired,
      validation: {
        validator: (newValue: Date, ctx: DialogContext<SaimaAgent>) => {
          if (!newValue) return;
          const issueDate = DateTime.fromJSDate(newValue);
          const birthDate = ctx.editData.value.birthDate
              ? DateTime.fromJSDate(ctx.editData.value.birthDate as Date)
              : null;

          if (!birthDate) {
            return 'Сначала необходимо указать дату рождения.';
          }
          if (issueDate < birthDate) {
            return 'Дата выдачи не может быть раньше даты рождения.';
          }
          const ageAtIssuance = issueDate.diff(birthDate, 'years').years;
          if (ageAtIssuance < 16) {
            return 'Паспорт не может быть выдан лицу младше 16 лет.';
          }
        }
      },
      warning: (_newValue: Date, ctx: DialogContext<SaimaAgent>) => {
        const issueDateValue = ctx.editData.value.issuedDate as Date | null;
        const birthDateValue = ctx.editData.value.birthDate as Date | null;

        if (!issueDateValue || !birthDateValue) return;

        const issueDate = DateTime.fromJSDate(issueDateValue);
        const birthDate = DateTime.fromJSDate(birthDateValue);
        const ageAtIssuance = issueDate.diff(birthDate, 'years').years;

        let expiryDate: DateTime | null = null;
        if (ageAtIssuance >= 45) {
          expiryDate = issueDate.plus({years: 10});
        } else if (ageAtIssuance >= 25) {
          expiryDate = birthDate.plus({years: 45});
        } else if (ageAtIssuance >= 16) {
          expiryDate = birthDate.plus({years: 25});
        }

        if (expiryDate && DateTime.local() > expiryDate) {
          return 'Срок действия паспорта истёк. Проверьте данные или уточните у клиента.';
        }
      }
    },
    {
      field: 'authority',
      label: 'Орган выдачи',
      required: "Орган выдачи не заполнен",
      requiredCondition: isAllFieldsRequired,
    },

    // Template Section
    {type: 'divider', label: 'Шаблон ответа'},
    {
      field: 'saimaTemplateCategoryId',
      label: 'Классификация шаблона',
      disabledCondition: isTemplateDisabled,
      type: 'select',
      options: dictionaries.value.saimaTemplateCategories,
      optionLabel: 'name',
      optionValue: 'id',
      onChange: (_newValue: number, ctx: DialogContext<SaimaAgent>) => {
        ctx.editData.comment = null;
      },
      required: true,
      requiredCondition: isRejectedOrForCorrection
    },
    {
      field: 'saimaTemplateId',
      label: 'Шаблон ответа',
      disabledCondition: isTemplateDisabled,
      type: 'dependent-select',
      masterField: 'saimaTemplateCategoryId',
      options: maps.value.saimaTemplatesByCategory,
      optionLabel: 'name',
      optionValue: 'id',
      onChange: (newValue: number, ctx: DialogContext<SaimaAgent>) => {
        ctx.editData.value.comment = maps.value.saimaTemplateMap.get(newValue)?.ruText || null;
      },
      required: true,
      requiredCondition: isRejectedOrForCorrection
    },
    {
      field: 'comment',
      label: 'Комментарий',
      type: 'textarea',
      rows: 5,
      required: true,
      requiredCondition: isRejectedOrForCorrection
    },
    {
      field: 'uploadPhotoTypes',
      label: 'Фото на исправление',
      displayCondition: (ctx: DialogContext<SaimaAgent>) =>
          ctx.editData.value.state === SaimaState.FOR_CORRECTION,
      type: 'multiselect',
      options: dictionaries.value.saimaPhotoTypes,
      optionLabel: 'name',
      optionValue: 'value',
    },
    {
      field: 'editDataTypes',
      label: 'Поля на исправление',
      displayCondition: (ctx: DialogContext<SaimaAgent>) =>
          ctx.editData.state === SaimaState.FOR_CORRECTION,
      type: 'multiselect',
      options: dictionaries.value.saimaSubEditData,
      optionLabel: 'name',
      optionValue: 'value',
    },
    {
      field: 'state',
      label: 'Статус',
      type: 'select',
      options: dictionaries.value.saimaStates,
      optionLabel: 'name',
      optionValue: 'value',
      showClear: false
    },
  ];
}

// ====================================
// DIALOG CONFIGURATION
// ====================================

const dialogButtons = ref([
  {
    label: 'История',
    icon: 'pi pi-history',
    class: 'p-button-secondary',
    visible: 'always',
    action: (ctx: DialogContext<SaimaAgent>) => openHistoryDialog(ctx.formData)
  },
  {
    label: 'История (старая)',
    icon: 'pi pi-history',
    class: 'p-button-secondary',
    visible: 'view',
    action: (ctx: DialogContext<SaimaAgent>) => openOldHistoryDialog(ctx.formData)
  },
]);

const dialogConfig = computed((): DialogConfig<SaimaAgent> => ({
  title: dialogTitle.value,
  fields: dialogFieldsConfig.value,
  photos: dialogPhotoItems.value,
  isRecordEditable: dialogIsRecordEditable.value,
  extraActions: dialogButtons.value,
  onBeforeEdit: dialogBeforeEditAction
}));

// ====================================
// LIFECYCLE
// ====================================
const commands: Record<string, CommandHandler<ShortSaimaAgentDTO>> = {
  export: exportData,
  edit: openDialog,
  view: openDialog,
  history: openHistoryDialog,
  oldHistory: openOldHistoryDialog,
}

onMounted(async () => {
  await fetchDictionary();
  configureDialogFields();
  tableIsDataReady.value = true;
});
</script>

<template>
  <div class="layout-main-full">
    <!-- Passport Confirmation Dialog -->
    <Dialog
        v-model:visible="isPassportConfirmDialogVisible"
        header="Получены данные паспорта"
        :modal="true"
        :style="{ width: '50vw', maxWidth: '600px' }"
    >
      <div v-if="passportDataToConfirm">
        <div
            class="passport-confirm-data"
            v-html="generatePassportMessage(passportDataToConfirm)"
        />
        <br>
        <p>Применить эти данные к форме?</p>
      </div>
      <template #footer>
        <Button
            label="Отмена"
            icon="pi pi-times"
            @click="isPassportConfirmDialogVisible = false"
            class="p-button-text"
        />
        <Button
            label="Применить"
            icon="pi pi-check"
            @click="applyPassportData"
            autofocus
        />
      </template>
    </Dialog>

    <!-- Main Data Table -->
    <DataTableComponent
        v-if="tableIsDataReady"
        ref="tableDataTableRef"
        :config="tableConfig"
        :fetch-data="fetchData"
        @row-click="openDialog"
        :commands="commands"
    />
    <div v-else>
      <Skeleton width="100%" height="40rem"/>
    </div>

    <!-- Data Editor Dialog -->
    <DataEditorDialog
        ref="dataEditorDialogRef"
        :visible="dialogVisible"
        :loading="dialogLoading"
        :topMessage="dialogMessage"
        :initialData="dialogSaimaAgentModel"
        :config="dialogConfig"
        @update:visible="dialogVisible = $event"
        @save="dialogHandleSave"
        @cancel="dialogVisible = false"
    />

    <!-- Old History Dialog -->
    <Dialog
        v-model:visible="dialogEventHistoryFlag"
        :style="{ width: '950px' }"
        header="История изменений (Старая!)"
        :modal="true"
    >
      <AuditEventHistory
          :row-id="dialogEventHistorySaimaAgentId"
          table-name="saima_agent"
      />
      <template #footer>
        <Button
            label="Отмена"
            icon="pi pi-times"
            text
            @click="hideHistoryDialog"
        />
      </template>
    </Dialog>

    <!-- New History Dialog -->
    <Dialog
        v-model:visible="dialogEntityChangesFlag"
        :style="{ width: '1450px' }"
        header="История изменений"
        :modal="true"
    >
      <EntityChanges :events="entityChangesList"/>
      <template #footer>
        <Button
            label="Отмена"
            icon="pi pi-times"
            text
            @click="hideHistoryDialog"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.layout-main-full {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-main-full .card {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.p-datatable-scrollable-body {
  flex-grow: 1;
}

.passport-confirm-data {
  line-height: 1.6;
}

.passport-confirm-data p {
  margin: 0.5rem 0;
}
</style>