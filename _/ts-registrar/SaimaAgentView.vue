<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {useToast} from 'primevue/usetoast';
import DataTableComponent, {
  type ActionColumnDefinition,
  type ColumnDefinition,
  type FetchDataParams,
  type RowClickAction
} from '@/components/DataTableComponent.vue';

import EnumsService from "@/services/enums.service.js";
import {
  type ConnectionDataDTO,
  type FullSaimaAgentDTO,
  type SaimaAgent,
  type SaimaAgentFilter,
  SaimaAgentMapper,
  type SaimaAgentUploads,
  type ShortSaimaAgentDTO
} from "@/models/saima-agent.model.ts";
import type {Enum} from "@/models/enum.model.ts";
import SaimaAgentService from "@/services/saima-agent.service.ts";
import type {Page} from "@/models/page.model.ts";
import DataEditorDialog, {
  type Context,
  type DialogAction,
  type DialogConfig,
  type FormField,
  type Photo,
  type SelectOption,
  type TopMessage
} from "@/components/DataEditorDialog.vue";
import SaimaTemplateCategoryService from "@/services/dictionary/saima-template-category.service.ts";
import type {SaimaTemplateCategory} from "@/models/dictionary/saima-template-category.model.ts";
import {DatetimeUtil} from "@/util/datetime.util.ts";
import ConnectionDataService from "@/services/dictionary/connection-data.service.ts";
import type {SaimaTemplate} from "@/models/dictionary/saima-template.model.ts";
import AuditEventHistory from "@/components/AuditEventHistory.vue";
import EntityChanges from "@/components/EntityChanges.vue";
import type {EntityChangesModel} from "@/models/entity-changes.model.ts";
import PassportService from "@/services/dictionary/passport.service.ts";
import type {PassportResponse} from "@/models/dictionary/passport.model.ts";
import {DateTime} from "luxon";
import {SaimaState} from "@/enums/saima-agent.enum.ts";
import DurationUtil from "@/utils/duration.ts";

const toast = useToast();

// ===============================================START DICTIONARY======================================================
const msisdnRegExp =  ref<RegExp>(new RegExp('^\\+?996\\d{9}$'));
const channels = ref<Enum[]>([]);
const regions = ref<Enum[]>([]);
const saimaState = ref<Enum[]>([]);
const saimaStateMap = ref<Map<string, Enum>>(new Map<string, Enum>());
const saimaPhotoTypes = ref<Enum[]>([]);
const documentType = ref<Enum[]>([]);
const saimaSubEditData = ref<Enum[]>([]);
const tariffs = ref<ConnectionDataDTO[]>([]);
const routers = ref<ConnectionDataDTO[]>([]);
const consoles = ref<ConnectionDataDTO[]>([]);
const saimaTemplateCategory = ref<SaimaTemplateCategory[]>([]);
const saimaTemplate = ref<Record<string, SelectOption[]>>({});
const saimaTemplateMap = ref<Map<number, SaimaTemplate>>(new Map<number, SaimaTemplate>());
const photoTypesList = ref<Array<Photo>>(new Array<Photo>());
const photoTypesMap = ref<Map<string, Photo>>(new Map<string, Photo>());
const dataEditorDialogRef = ref<InstanceType<typeof DataEditorDialog>>(null);

const saimaStateSeverityMap = new Map([
  [ SaimaState.REJECTED, 'danger'],
  [ SaimaState.FOR_CORRECTION, 'danger'],
  [ SaimaState.TECHNICAL_SHEET_ISSUED, 'success'],
  [ SaimaState.PERSONAL_ACCOUNT_ISSUED, 'success'],
  [ SaimaState.SELECTED, 'warning'],
  [ SaimaState.ADDING_AN_ADDRESS, 'warning'],
  [ SaimaState.PENDING, 'info']
]);

const enumsService = new EnumsService();
const connectionDataService = new ConnectionDataService();
const saimaTemplateCategoryService = new SaimaTemplateCategoryService();
const durationUtil = new DurationUtil();

const fetchDictionary = async () => {
  const [channelsData, regionsData, saimaStateData, saimaPhotoData, documentData, connectionData, saimaTemplateCategoryData, saimaSubEdits] = await Promise.all<Awaited<any[]>>([
    enumsService.findAllRegistrarChanel(),
    enumsService.getAllRegion(),
    enumsService.getAllSaimaState(),
    enumsService.getAllSaimaPhotoType(),
    enumsService.getAllDocumentType(),
    connectionDataService.getAllConnectionDataTypes(),
    saimaTemplateCategoryService.findAllExtended(),
    enumsService.getAllSaimaSubEditData(),
  ]);

  channels.value = channelsData;
  regions.value = regionsData;
  saimaState.value = saimaStateData;
  saimaStateData.forEach((state: Enum) => {
    saimaStateMap.value.set(state.value, state);
  })

  saimaPhotoTypes.value = saimaPhotoData;
  saimaPhotoTypes.value.forEach((element: Enum) => {
    const photoType: Photo = {
      id: element.code,
      name: element.name,
      type: element.value,
    }
    photoTypesList.value.push(photoType);
    photoTypesMap.value.set(element.value, photoType)
  });
  documentType.value = documentData;
  tariffs.value = connectionData.tariffs;
  routers.value = connectionData.routers;
  consoles.value = connectionData.consoles;
  saimaTemplateCategory.value = saimaTemplateCategoryData;
  saimaTemplateCategory.value.forEach((c: SaimaTemplateCategory) => {
    saimaTemplate.value[c.id] = c.saimaTemplates;
    c.saimaTemplates?.forEach((s: SaimaTemplate) => saimaTemplateMap.value.set(s.id, s))
  });
  saimaSubEditData.value = saimaSubEdits;
}
onMounted(async () => fetchDictionary())
// ================================================END DICTIONARY=======================================================

const entityChangesList = ref<EntityChangesModel[]>([]);
const dialogEntityChangesFlag = ref<boolean>(false);
const dialogEventHistorySaimaAgentId = ref<number>();
const dialogEventHistoryFlag = ref<boolean>(false);

const dialogIsRecordEditable = ref<boolean>(true);
const dialogFullSaimaAgentDTO = ref<FullSaimaAgentDTO>(null);
const dialogVisible = ref<boolean>(false);
const dialogLoading = ref<boolean>(false);
const dialogFieldsConfig = ref<FormField[]>([]);
const dialogSaimaAgentModel = ref<SaimaAgent>({});
const dialogTitle = ref<string>('');
const dialogPhotoItem = ref<Array<Photo>>(new Array<Photo>());
const dialogMessage = ref<TopMessage>(null);
const dialogIsFetchingPassportData = ref(false);
const isFetchingPassportData = ref(false);
const isPassportConfirmDialogVisible = ref(false);

const passportDataToConfirm = ref<PassportResponse>(null);

type DataTableComponentInstance = InstanceType<typeof DataTableComponent>;
const tableDataTableRef = ref<DataTableComponentInstance>(null);
const tableIsDataReady = ref(false);
const tablePropsColumnConfig = ref<ColumnDefinition[]>([]);
const tablePropsRowClickAction: RowClickAction = {onClick: (saimaAgent: ShortSaimaAgentDTO) => openDialog(saimaAgent)};

const openOldHistoryDialog = (saimaAgent: ShortSaimaAgentDTO | SaimaAgent): void => {
  dialogEventHistorySaimaAgentId.value = saimaAgent.id;
  dialogEventHistoryFlag.value = true;
}

const openHistoryDialog = (saimaAgent: ShortSaimaAgentDTO | SaimaAgent): void => {
  SaimaAgentService.getSaimaAgentHistoryById(saimaAgent.id)
      .then((data: EntityChangesModel[]) => (entityChangesList.value = data.length > 0 ? data : []))
      .catch((error: any) => {
        toast.add({
          severity: 'error',
          summary: 'Ошибка загрузки новой Истории',
          detail: error,
          life: 5000
        });
      });
  dialogEntityChangesFlag.value = true;
}

const hideHistoryDialog = (): void => {
  dialogEventHistoryFlag.value = false;
  entityChangesList.value = {};
  dialogEntityChangesFlag.value = false;
}

const openDialog = async (saimaAgent: ShortSaimaAgentDTO | SaimaAgent) => {
  try {
    dialogTitle.value = saimaAgent.id;
    const fullSaimaAgent: FullSaimaAgentDTO = await SaimaAgentService.getFullSaimaAgent(saimaAgent.id);
    dialogFullSaimaAgentDTO.value = fullSaimaAgent;
    dialogSaimaAgentModel.value = SaimaAgentMapper.fromDTO(fullSaimaAgent);

    dialogPhotoItem.value = [];
    fullSaimaAgent.saimaAgentUploads?.forEach((element: SaimaAgentUploads) => {
      if (element.saimaPhotoType) {
        const photo: Photo = photoTypesMap.value.get(element.saimaPhotoType);
        photo.url = element.signedUrl;
        dialogPhotoItem.value.push(photo);
      }
    });
    dialogVisible.value = true;
    dialogMessage.value = null;
    dialogIsRecordEditable.value = dialogSaimaAgentModel.value.editable && dialogSaimaAgentModel.value.msisdn &&
        msisdnRegExp.value.test(dialogSaimaAgentModel.value.msisdn);
  } catch (error) {
    console.error("Ошибка при загрузке агента:", error);
  }
};

// =============================================START MAIN DATATABLE====================================================
onMounted(() => {
  try {
    tablePropsColumnConfig.value = [
      {field: 'id', header: 'ID', frozen: 'left'},
      {
        field: 'state', header: 'Статус', frozen: 'left',
        customBody: (data: ShortSaimaAgentDTO) => ({
          component: 'Tag',
          value: saimaStateMap.value.get(data.state)?.name || data.state,
          severity: saimaStateSeverityMap.get(data.state) || 'secondary'
        }),
        filter: {type: 'select', options: saimaState, optionLabel: 'name', optionValue: 'value'}
      },
      {
        field: 'msisdn',
        header: 'Номер абонента',
        filter: {
          type: 'numeric',
        }
      },
      {field: 'accountNumber', header: 'Номер лицевого счета', filter: {type: 'text'}},
      {field: 'fullName', header: 'ФИО', filter: {type: 'text'}},
      {field: 'inn', header: 'ИНН'},
      {field: 'registrarFullName', header: 'Регистратор', filter: {type: 'text'}},
      {field: 'registrarMsisdn', header: 'Номер регистратора'},
      {
        field: 'region',
        header: 'Регион',
        filter: {type: 'select', options: regions, optionLabel: 'name', optionValue: 'value'}
      },
      {field: 'district', header: 'Район'},
      {field: 'city', header: 'Город'},
      {field: 'address', header: 'Адрес'},
      {
        field: 'channel',
        header: 'Канал',
        filter: {type: 'select', options: channels, optionLabel: 'name', optionValue: 'value'}
      },
      {field: 'supervisorFullName', header: 'Супервайзер', filter: {type: 'text'}},
      {field: 'supervisorMsisdn', header: 'Номер супервайзера'},
      {
        field: 'createdAt',
        header: 'Создан',
        style: 'min-width: 18rem',
        filter: {type: 'dateRange'},
        customBody: (data: ShortSaimaAgentDTO) => ({value: DatetimeUtil.formatStringDate(data.createdAt)})
      },
      // TODO в БД нет updatedAt
      {
        field: 'updatedAt',
        header: 'Изменен',
        style: 'min-width: 14rem',
        customBody: (data: ShortSaimaAgentDTO) => ({value: DatetimeUtil.formatStringDate(data.updatedAt)})
      },
      {
        field: 'timeTaken',
        header: 'Время в обработке',
        customBody: (data: ShortSaimaAgentDTO) => ({value: getHHMMSS(data.timeTaken)})
      },
      {
        field: 'isBlocked', header: 'Блокирован',
        customBody: (data: ShortSaimaAgentDTO) => ({value: data.isBlocked ? 'ДА' : 'НЕТ'})
      },
      {field: 'webRegistrar', header: 'WEB Регистратор', filter: {type: 'text'}},
    ];
    tableIsDataReady.value = true;
  } catch (error) {
    toast.add({severity: 'error', summary: 'Ошибка загрузки справочников', detail: error, life: 5000});
  }
});

const tableActionColumnDefinition: ActionColumnDefinition =
    {
      frozen: 'right',
      actions: [
        {
          icon: 'pi pi-eye',
          severity: 'info',
          tooltip: 'Просмотр',
          onClick: openDialog
        },
        {
          icon: 'pi pi-history',
          severity: 'info',
          tooltip: 'История',
          onClick: openHistoryDialog
        },
        {
          icon: 'pi pi-history',
          severity: 'warning',
          tooltip: 'История (старая)',
          onClick: openOldHistoryDialog
        },
      ]
    };

async function tablePropsFetchData(params: FetchDataParams) {
  const filter = {
    page: params.page,
    size: params.rows,
    ...SaimaAgentService.createSaimaAgentFilter(params.filters)
  };
  try {
    const data: Page<ShortSaimaAgentDTO> = await SaimaAgentService.findAll(filter);
    return {items: data.content || [], totalRecords: data.totalElements || 0};
  } catch (error) {
    toast.add({severity: 'error', summary: 'Ошибка', detail: error, life: 5000});
    return {items: [], totalRecords: 0};
  }
}

async function tablePropsExportData(params: { filters: Record<string, any> }) {
  const algaProcessFilter: SaimaAgentFilter = SaimaAgentService.createSaimaAgentFilter(params.filters);
  try {
    await SaimaAgentService.getExcel(algaProcessFilter);
    toast.add({severity: 'success', summary: 'Экспорт начат', detail: 'Файл скоро будет загружен.', life: 3000});
  } catch (error) {
    toast.add({severity: 'error', summary: 'Ошибка экспорта', detail: error, life: 5000});
  }
}

// =============================================END MAIN DATATABLE======================================================

// =================================================START DIALOG========================================================
const generatePassportMessage = (data: PassportResponse) => {
  return `
    <p><strong>ФИО:</strong> ${data.surname} ${data.name} ${data.patronymic}</p>
    <p><strong>Дата рождения:</strong> ${data.dateOfBirth}</p>
    <p><strong>Дата выдачи:</strong> ${data.issuedDate}</p>
    <p><strong>Орган:</strong> ${data.passportAuthority}</p>
    <p><strong>Адрес регистрации:</strong> ${data.address}</p>
  `;
};

const applyPassportData = () => {
  if (!passportDataToConfirm.value || !dataEditorDialogRef.value) {
    return;
  }
  const response = passportDataToConfirm.value;
  const birthDateObject = response.dateOfBirth ? DateTime.fromFormat(response.dateOfBirth, 'dd.MM.yyyy').toJSDate() : null;
  const issuedDateObject = response.issuedDate ? DateTime.fromFormat(response.issuedDate, 'dd.MM.yyyy').toJSDate() : null;
  const updates = {
    surname: response.surname,
    firstName: response.name,
    middleName: response.patronymic,
    birthDate: birthDateObject,
    issuedDate: issuedDateObject,
    authority: response.passportAuthority,
    address: response.address
  };
  dataEditorDialogRef.value.updateEditData(updates);
  setTimeout(() => {
    if (dataEditorDialogRef.value) {
      dataEditorDialogRef.value.revalidateAllFields();
    }
  }, 0);
  toast.add({severity: 'success', summary: 'Успешно', detail: 'Данные применены', life: 3000});
  isPassportConfirmDialogVisible.value = false;
};

const fetchAndConfirmPassportData = async (context: Context<SaimaAgent>) => {
  const {inn, documentId} = context.editData;
  if (!inn || !documentId) {
    toast.add({severity: 'warn', summary: 'Внимание', detail: 'Введите ИНН и номер документа', life: 3000});
    return;
  }
  isFetchingPassportData.value = true;
  try {
    passportDataToConfirm.value = await PassportService.getPassportData(inn, documentId);
    isPassportConfirmDialogVisible.value = true;
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: error?.response?.status === 404 ? 'Данные по ПИН не найдены.':'Не удалось получить данные паспорта.', life: 5000 });
  } finally {
    isFetchingPassportData.value = false;
  }
};

const allFieldRequiredCondition = (context: Context<SaimaAgent>) => context.editData.state ===  SaimaState.SELECTED || context.editData.state ===  SaimaState.TECHNICAL_SHEET_ISSUED || context.editData.state ===  SaimaState.PERSONAL_ACCOUNT_ISSUED;
const templateDisableCondition = (context: Context<SaimaAgent>) => context.editData.state ===  SaimaState.SELECTED || context.editData.state ===  SaimaState.TECHNICAL_SHEET_ISSUED || context.editData.state ===  SaimaState.PERSONAL_ACCOUNT_ISSUED;
onMounted(() => {
  dialogFieldsConfig.value = [
    {field: 'id', label: 'ID', type: 'number', editable: false},
    {
      field: 'msisdn',
      label: 'Номер телефона',
      type: 'number',
      required: "Номер не заполнено",
      requiredCondition: allFieldRequiredCondition,
      validation: {
        pattern: new RegExp('^\\+?996\\d{9}$'),
        patternMessage: 'Номер не соответствует 996XXXXXXXXX'
      }
    },
    {
      field: 'tariffId',
      label: 'Тариф',
      type: 'select',
      options: tariffs,
      optionLabel: 'name',
      optionValue: 'id',
      required: "Тариф не выбран",
      requiredCondition: allFieldRequiredCondition,
    },
    {
      field: 'routerId',
      label: 'Роутер',
      type: 'select',
      options: routers,
      optionLabel: 'name',
      optionValue: 'id',
      required: "Роутер не выбран",
      requiredCondition: allFieldRequiredCondition,
    },
    {
      field: 'consoleId',
      label: 'Приставка',
      type: 'select',
      options: consoles,
      optionLabel: 'name',
      optionValue: 'id',
      required: "Приставка не выбрана",
      requiredCondition: allFieldRequiredCondition,
    },
    {
      field: 'accountNumber',
      label: 'Номер лицевого счета',
      required: "Номер лицевого счета не заполнено",
      requiredCondition: allFieldRequiredCondition,
    },
    {field: 'contractNumber', label: 'Номер документа', required: "Номер документа не заполнен",},
    {
      field: 'wishedDate',
      label: 'Желаемая дата',
      type: 'date',
      dateFormat: 'dd.MM.yyyy',
      required: "Желаемая дата не заполнена",
      requiredCondition: allFieldRequiredCondition,
    },
    {
      field: 'surname',
      label: 'Фамилия',
      required: "Фамилия не заполнена",
      requiredCondition: allFieldRequiredCondition,
      validation: {
        pattern: new RegExp('^([a-zA-Zа-яА-Я-ҢңҮүӨө ]{2,30})$'),
        patternMessage: "Только буквы, без цифр или других знаков"
      }
    },
    {
      field: 'firstName',
      label: 'Имя',
      required: "Имя не заполнено",
      requiredCondition: allFieldRequiredCondition,
      validation: {
        pattern: new RegExp('^([a-zA-Zа-яА-Я-ҢңҮүӨө ]{2,30})$'),
        patternMessage: "Только буквы, без цифр или других знаков"
      }
    },
    {
      field: 'middleName',
      label: 'Отчество',
      required: false,
      validation: {
        pattern: new RegExp('^([a-zA-Zа-яА-Я-ҢңҮүӨө ]{2,30})$'),
        patternMessage: "Только буквы, без цифр или других знаков"
      }
    },
    {
      field: 'region',
      label: 'Область',
      type: 'select',
      options: regions,
      optionLabel: 'name',
      optionValue: 'value',
      required: "Область не выбрана",
      requiredCondition: allFieldRequiredCondition,
    },
    {field: 'district', label: 'Район', required: "Район не заполнен", requiredCondition: allFieldRequiredCondition,},
    {field: 'city', label: 'Город', required: "Город не заполнен", requiredCondition: allFieldRequiredCondition,},
    {
      field: 'street',
      label: 'Улица',
      required: "Название улицы не заполнено",
      requiredCondition: allFieldRequiredCondition,
    },
    {field: 'house', label: 'Дом', required: "Номер дома не заполнен", requiredCondition: allFieldRequiredCondition,},
    {field: 'apartment', label: 'Квартира'},
    {field: 'supervisor', label: 'Супервайзер', editable: false},
    {field: 'registrar', label: 'Регистратор', editable: false},

    {type: 'divider', label: 'Паспортные данные'},
    {
      field: 'documentType',
      label: 'Тип документа',
      type: 'select',
      options: documentType,
      optionLabel: 'name',
      optionValue: 'value',
      defaultValue: 'PASSPORT',
      required: true,
      requiredCondition: allFieldRequiredCondition,
    },
    {
      field: 'inn',
      label: 'Персональный номер',
      required: "Персональный номер не заполнен",
      requiredCondition: allFieldRequiredCondition,
      validation: {
        pattern: new RegExp('^\\d{14}$'),
        patternMessage: "Некорректно введен ПИН"
      }
    },
    {
      field: 'documentId',
      label: 'Номер документа',
      required: "Номер документа не заполнен",
      requiredCondition: allFieldRequiredCondition,
      validation: {pattern: new RegExp('(^ID|^AN)([0-9]+$)'), patternMessage: "Неверно введен номер документа"}
    },
    {
      type: 'button',
      label: 'Данные по паспорту',
      icon: 'pi pi-id-card',
      displayCondition: (context: Context<SaimaAgent>) => context.isEditing && (context.editData.state === 'ACCEPTED' || context.editData.state ===  SaimaState.SELECTED) && context.editData.documentType === 'PASSPORT',
      loadingCondition: () => dialogIsFetchingPassportData.value,
      action: (context: Context<SaimaAgent>) => fetchAndConfirmPassportData(context)
    },
    {
      field: 'birthDate',
      label: 'Дата рождения',
      type: 'date',
      dateFormat: 'dd.MM.yyyy',
      required: "Дата рождение пустое",
      requiredCondition: allFieldRequiredCondition,
      validation: {
        validator: (newValue: Date, _context: Context<SaimaAgent>) => {
          if (!newValue) {
            return "Дата рождение пустое";
          }
          const age = DateTime.local().diff(DateTime.fromJSDate(newValue), 'years').years;
          if (age < 18) {
            return 'Возраст должен быть не менее 18 лет.';
          }
        }
      },
    },
    {
      field: 'address',
      label: 'Адрес регистрации',
      type: 'textarea',
      rows: 2,
      required: "Адрес регистрации не заполнен",
      requiredCondition: allFieldRequiredCondition,
    },
    {
      field: 'issuedDate',
      label: 'Дата выдачи',
      type: 'date',
      dateFormat: 'dd.MM.yyyy',
      required: "Дата выдачи пустое",
      requiredCondition: allFieldRequiredCondition,
      validation: {
        validator: (newValue: Date, context: Context<SaimaAgent>) => {
          if (!newValue) return;
          const issueDate = DateTime.fromJSDate(newValue);
          const birthDate = context.editData.birthDate ? DateTime.fromJSDate(context.editData.birthDate as Date) : null;
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
      warning: (_newValue: Date, context: Context<SaimaAgent>) => {
        const issueDateValue = context.editData.issuedDate as Date | null;
        const birthDateValue = context.editData.birthDate as Date | null;
        if (!issueDateValue || !birthDateValue) {
          return;
        }
        const issueDate = DateTime.fromJSDate(issueDateValue);
        const birthDate = DateTime.fromJSDate(birthDateValue);
        const ageAtIssuance = issueDate.diff(birthDate, 'years').years;
        let expiryDate: DateTime | null = null;
        if (ageAtIssuance >= 45) {
          expiryDate = issueDate.plus({years: 10});
        } else if (ageAtIssuance >= 25 && ageAtIssuance < 45) {
          expiryDate = birthDate.plus({years: 45});
        } else if (ageAtIssuance >= 16 && ageAtIssuance < 25) {
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
      requiredCondition: allFieldRequiredCondition,
    },
    {type: 'divider', label: 'Шаблон ответа'},
    {
      field: 'saimaTemplateCategoryId',
      label: 'Классификация шаблона',
      disabledCondition: templateDisableCondition,
      type: 'select',
      options: saimaTemplateCategory,
      optionLabel: 'name',
      optionValue: 'id',
      onChange: (_newValue: number, context: Context<SaimaAgent>) => {
        context.editData.comment = null;
      },
      required: true,
      requiredCondition: (context: Context<SaimaAgent>) => context.editData.state ===  SaimaState.REJECTED || context.editData.state ===  SaimaState.FOR_CORRECTION
    },
    {
      field: 'saimaTemplateId',
      label: 'Шаблон ответа',
      disabledCondition: templateDisableCondition,
      type: 'dependent-select',
      masterField: 'saimaTemplateCategoryId',
      options: saimaTemplate,
      optionLabel: 'name',
      optionValue: 'id',
      onChange: (newValue: number, context: Context<SaimaAgent>) => {
        context.editData.comment = saimaTemplateMap.value.get(newValue)?.ruText || null;
      },
      required: true,
      requiredCondition: (context: Context<SaimaAgent>) => context.editData.state ===  SaimaState.REJECTED || context.editData.state ===  SaimaState.FOR_CORRECTION
    },
    {
      field: 'comment',
      label: 'Комментарий',
      type: 'textarea',
      rows: 5,
      required: true,
      requiredCondition: (context: Context<SaimaAgent>) => context.editData.state ===  SaimaState.REJECTED || context.editData.state ===  SaimaState.FOR_CORRECTION
    },
    {
      field: 'uploadPhotoTypes',
      label: 'Фото на исправление',
      displayCondition: (context: Context<SaimaAgent>) => context.editData.state ===  SaimaState.FOR_CORRECTION,
      type: 'multiselect',
      options: saimaPhotoTypes,
      optionLabel: 'name',
      optionValue: 'value',
    },
    {
      field: 'editDataTypes',
      label: 'Поля на исправление',
      displayCondition: (context: Context<SaimaAgent>) => {
        return context.editData.state ===  SaimaState.FOR_CORRECTION
      },
      type: 'multiselect',
      options: saimaSubEditData,
      optionLabel: 'name',
      optionValue: 'value',
    },
    {
      field: 'state',
      label: 'Статус',
      type: 'select',
      options: saimaState,
      optionLabel: 'name',
      optionValue: 'value',
      showClear: false
    },
  ];
})

function getHHMMSS(ms: number){
  return durationUtil.convertMillisToHHMMSS(ms)
}
const dialogButtons = ref<DialogAction<SaimaAgent>[]>([
  {
    label: 'История',
    icon: 'pi pi-history',
    class: 'p-button-secondary',
    visible: 'always',
    action: (context: Context<SaimaAgent>) => {
      openHistoryDialog(context.formData);
    }
  },
  {
    label: 'История (старая)',
    icon: 'pi pi-history',
    class: 'p-button-secondary',
    visible: 'view',
    action: (context: Context<SaimaAgent>) => {
      openOldHistoryDialog(context.formData);
    }
  },
]);

const dialogHandleSave = async (context: Context<SaimaAgent>) => {
  dialogLoading.value = true;
  dialogMessage.value = null;

  try {
    await SaimaAgentService.put(context.editData, SaimaAgentMapper.toUpdateDTO(context.editData));
    dialogVisible.value = false;
    toast.add({severity: 'success', summary: 'Успешно', detail: 'Данные сохранены', life: 3000});
    if (tableDataTableRef.value) {
      tableDataTableRef.value.refresh();
    }
  } catch (error: any) {
    let errorMessage = 'Произошла непредвиденная ошибка.';
    if (error && error.response && typeof error.response.status === 'number') {
      const status = error.response.status;
      const responseData = error.response.data;
      switch (status) {
        case 400: // Bad Request
          errorMessage = responseData?.message || responseData?.error || 'Неверные данные. Проверьте заполненные поля.';
          break;
        case 401: // Unauthorized
          errorMessage = 'Ошибка авторизации. Пожалуйста, войдите в систему заново.';
          break;
        case 403: // Forbidden
          errorMessage = 'У вас нет прав для выполнения этого действия.';
          break;
        case 404: // Not Found
          errorMessage = 'Сайма Агент не найден.';
          break;
        case 409: // Conflict
          errorMessage = responseData?.message || 'Конфликт данных. Возможно, такая запись уже существует.';
          break;
        case 500: // Internal Server Error
        default:
          errorMessage = 'Произошла внутренняя ошибка сервера. Попробуйте позже.';
          break;
      }
    } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
      errorMessage = 'Ошибка сети. Проверьте ваше интернет-соединение.';
    } else if (error && error.message) {
      errorMessage = error.message;
    }
    dialogMessage.value = {
      text: errorMessage,
      severity: 'error',
    };
    console.error("Failed to save data:", error);
  } finally {
    dialogLoading.value = false;
  }
};

const dialogBeforeEditAction = async (context: Context<SaimaAgent>) => {
  if (context.formData.state ===  SaimaState.PENDING || context.formData.state ===  SaimaState.ADDING_AN_ADDRESS) {
    const fullSaimaAgent: FullSaimaAgentDTO = await SaimaAgentService.setSelected(context.formData.id).then((d: FullSaimaAgentDTO) => d);
    if (tableDataTableRef.value) {
      tableDataTableRef.value.refresh();
    }
    return SaimaAgentMapper.fromDTO(fullSaimaAgent);
  }
}

const dialogConfig = computed((): DialogConfig<SaimaAgent> => {
  return {
    title: dialogTitle.value,
    fields: dialogFieldsConfig.value,
    photos: dialogPhotoItem.value,
    isRecordEditable: dialogIsRecordEditable.value,
    extraActions: dialogButtons.value,
    onBeforeEdit: dialogBeforeEditAction
  };
});

// =================================================END DIALOG==========================================================
</script>

<template>
  <div class="layout-main-full">
    <Dialog v-model:visible="isPassportConfirmDialogVisible"
            header="Получены данные паспорта"
            :modal="true"
            :style="{ width: '50vw', maxWidth: '600px' }">
      <div v-if="passportDataToConfirm">
        <div class="passport-confirm-data" v-html="generatePassportMessage(passportDataToConfirm)"></div>
        <br>
        <p>Применить эти данные к форме?</p>
      </div>
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" @click="isPassportConfirmDialogVisible = false"
                class="p-button-text"/>
        <Button label="Применить" icon="pi pi-check" @click="applyPassportData" autofocus/>
      </template>
    </Dialog>
    <DataTableComponent
        v-if="tableIsDataReady"
        ref="tableDataTableRef"
        :columns="tablePropsColumnConfig"
        :row-click-action="tablePropsRowClickAction"
        :action-column="tableActionColumnDefinition"
        :fetch-data-function="tablePropsFetchData"
        :export-function="tablePropsExportData"
        title="Агенты Saima"
    />
    <div v-else>
      <Skeleton width="100%" height="40rem"></Skeleton>
    </div>
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
    <Dialog v-model:visible="dialogEventHistoryFlag" :style="{ width: '950px' }"
            header="История изменений (Старая!)"
            :modal="true">
      <AuditEventHistory :row-id="dialogEventHistorySaimaAgentId" table-name="saima_agent"/>
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideHistoryDialog"/>
      </template>
    </Dialog>

    <Dialog v-model:visible="dialogEntityChangesFlag"
            :style="{ width: '1450px' }"
            header="История изменений"
            :modal="true">
      <EntityChanges :events="entityChangesList"/>
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideHistoryDialog"/>
      </template>
    </Dialog>
  </div>
</template>

<style>
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

</style>