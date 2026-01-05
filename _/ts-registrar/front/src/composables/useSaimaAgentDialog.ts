import {ref, computed} from 'vue';
import type {Ref} from 'vue';
import {DateTime} from 'luxon';
import type {ToastServiceMethods} from 'primevue/toastservice';

import type {DataTableComponentInstance} from '@/components/datatable/types';
import type {
    Context,
    DialogAction,
    DialogConfig,
    FormField,
    Photo,
    TopMessage
} from "@/components/DataEditorDialog.vue";
import {
    SaimaAgentMapper,
    type FullSaimaAgentDTO,
    type SaimaAgent,
    type SaimaAgentUploads,
    type ShortSaimaAgentDTO
} from "@/models/saima-agent.model.ts";
import {SaimaState} from "@/enums/saima-agent.enum.ts";

import SaimaAgentService from "@/services/__test__/saima-agent.service.ts";

interface UseSaimaAgentDialogOptions {
    dictionaries: {
        saimaState: Ref<any[]>;
        saimaPhotoTypes: Ref<any[]>;
        documentType: Ref<any[]>;
        saimaSubEditData: Ref<any[]>;
        tariffs: Ref<any[]>;
        routers: Ref<any[]>;
        consoles: Ref<any[]>;
        saimaTemplateCategory: Ref<any[]>;
        saimaTemplate: Ref<Record<string, any[]>>;
        saimaTemplateMap: Ref<Map<number, any>>;
        regions: Ref<any[]>;
    };
    services: {
        toast: ToastServiceMethods;
        fetchAndConfirmPassportData: (context: Context<SaimaAgent>) => Promise<void>;
    };
    refs: {
        isFetchingPassportData: Ref<boolean>;
        tableDataTableRef: Ref<DataTableComponentInstance | null>;
        photoTypesMap: Ref<Map<string, Photo>>;
    };
    callbacks: {
        openHistoryDialog: (data: SaimaAgent | ShortSaimaAgentDTO) => void;
        openOldHistoryDialog: (data: SaimaAgent | ShortSaimaAgentDTO) => void;
    };
}

export function useSaimaAgentDialog(options: UseSaimaAgentDialogOptions) {
    const {dictionaries, services, refs, callbacks} = options;

    const dialogVisible = ref<boolean>(false);
    const dialogLoading = ref<boolean>(false);
    const dialogMessage = ref<TopMessage | null>(null);
    const dialogSaimaAgentModel = ref<SaimaAgent>({});
    const dialogTitle = ref<string>('');
    const dialogPhotoItem = ref<Photo[]>([]);
    const dialogIsRecordEditable = ref<boolean>(true);
    const msisdnRegExp = /^\+?996\d{9}$/;

    const openDialog = async (saimaAgent: ShortSaimaAgentDTO | SaimaAgent) => {
        try {
            dialogTitle.value = `Агент ID: ${saimaAgent.id}`;
            const fullSaimaAgent: FullSaimaAgentDTO = await SaimaAgentService.getFullSaimaAgent(saimaAgent.id);

            dialogSaimaAgentModel.value = SaimaAgentMapper.fromDTO(fullSaimaAgent);

            dialogPhotoItem.value = [];
            fullSaimaAgent.saimaAgentUploads?.forEach((element: SaimaAgentUploads) => {
                if (element.saimaPhotoType) {
                    const photoTemplate = refs.photoTypesMap.value.get(element.saimaPhotoType);
                    if (photoTemplate) {
                        const photo: Photo = {...photoTemplate, url: element.signedUrl};
                        dialogPhotoItem.value.push(photo);
                    }
                }
            });

            dialogMessage.value = null;
            dialogIsRecordEditable.value = dialogSaimaAgentModel.value.editable &&
                !!dialogSaimaAgentModel.value.msisdn &&
                msisdnRegExp.test(dialogSaimaAgentModel.value.msisdn);

            dialogVisible.value = true;
        } catch (error) {
            console.error("Ошибка при загрузке данных агента:", error);
            services.toast.add({
                severity: 'error',
                summary: 'Ошибка',
                detail: 'Не удалось загрузить данные агента.',
                life: 5000
            });
        }
    };

    const dialogHandleSave = async (context: Context<SaimaAgent>) => {
        dialogLoading.value = true;
        dialogMessage.value = null;

        try {
            await SaimaAgentService.put(context.editData, SaimaAgentMapper.toUpdateDTO(context.editData));
            dialogVisible.value = false;
            services.toast.add({severity: 'success', summary: 'Успешно', detail: 'Данные сохранены', life: 3000});
            refs.tableDataTableRef.value?.refresh();
        } catch (error: any) {
            let errorMessage = 'Произошла непредвиденная ошибка.';
            if (error?.response?.status) {
                const {status, data} = error.response;
                switch (status) {
                    case 400:
                        errorMessage = data?.message || data?.error || 'Неверные данные. Проверьте заполненные поля.';
                        break;
                    case 401:
                        errorMessage = 'Ошибка авторизации. Пожалуйста, войдите в систему заново.';
                        break;
                    case 403:
                        errorMessage = 'У вас нет прав для выполнения этого действия.';
                        break;
                    case 404:
                        errorMessage = 'Сайма Агент не найден.';
                        break;
                    case 409:
                        errorMessage = data?.message || 'Конфликт данных. Возможно, такая запись уже существует.';
                        break;
                    default:
                        errorMessage = 'Произошла внутренняя ошибка сервера. Попробуйте позже.';
                        break;
                }
            } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
                errorMessage = 'Ошибка сети. Проверьте ваше интернет-соединение.';
            } else if (error?.message) {
                errorMessage = error.message;
            }

            dialogMessage.value = {text: errorMessage, severity: 'error'};
            console.error("Failed to save data:", error);
        } finally {
            dialogLoading.value = false;
        }
    };

    const dialogBeforeEditAction = async (context: Context<SaimaAgent>) => {
        if (context.formData.state === SaimaState.PENDING || context.formData.state === SaimaState.ADDING_AN_ADDRESS) {
            const fullSaimaAgent = await SaimaAgentService.setSelected(context.formData.id);
            refs.tableDataTableRef.value?.refresh();
            return SaimaAgentMapper.fromDTO(fullSaimaAgent);
        }
    };

    const dialogButtons = computed((): DialogAction<SaimaAgent>[] => [
        {
            label: 'История',
            icon: 'pi pi-history',
            class: 'p-button-secondary',
            visible: 'always',
            action: (context: Context<SaimaAgent>) => callbacks.openHistoryDialog(context.formData),
        },
        {
            label: 'История (старая)',
            icon: 'pi pi-history',
            class: 'p-button-secondary',
            visible: 'view',
            action: (context: Context<SaimaAgent>) => callbacks.openOldHistoryDialog(context.formData),
        },
    ]);

    const dialogFieldsConfig = computed((): FormField[] => {
        const allFieldRequiredCondition = (context: Context<SaimaAgent>) =>
            [SaimaState.SELECTED, SaimaState.TECHNICAL_SHEET_ISSUED, SaimaState.PERSONAL_ACCOUNT_ISSUED].includes(context.editData.state as SaimaState);
        const templateDisableCondition = (context: Context<SaimaAgent>) =>
            [SaimaState.SELECTED, SaimaState.TECHNICAL_SHEET_ISSUED, SaimaState.PERSONAL_ACCOUNT_ISSUED].includes(context.editData.state as SaimaState);
        const correctionRequiredCondition = (context: Context<SaimaAgent>) =>
            [SaimaState.REJECTED, SaimaState.FOR_CORRECTION].includes(context.editData.state as SaimaState);

        const nameValidation = {
            pattern: /^([a-zA-Zа-яА-Я-ҢңҮүӨө ]{2,30})$/,
            patternMessage: "Только буквы, без цифр или других знаков"
        };

        return [
            {field: 'id', label: 'ID', type: 'number', editable: false},
            {
                field: 'msisdn',
                label: 'Номер телефона',
                type: 'number',
                required: "Номер не заполнено",
                requiredCondition: allFieldRequiredCondition,
                validation: {pattern: /^\+?996\d{9}$/, patternMessage: 'Номер не соответствует 996XXXXXXXXX'}
            },
            {
                field: 'tariffId',
                label: 'Тариф',
                type: 'select',
                options: dictionaries.tariffs.value,
                optionLabel: 'name',
                optionValue: 'id',
                required: "Тариф не выбран",
                requiredCondition: allFieldRequiredCondition
            },
            {
                field: 'routerId',
                label: 'Роутер',
                type: 'select',
                options: dictionaries.routers.value,
                optionLabel: 'name',
                optionValue: 'id',
                required: "Роутер не выбран",
                requiredCondition: allFieldRequiredCondition
            },
            {
                field: 'consoleId',
                label: 'Приставка',
                type: 'select',
                options: dictionaries.consoles.value,
                optionLabel: 'name',
                optionValue: 'id',
                required: "Приставка не выбрана",
                requiredCondition: allFieldRequiredCondition
            },
            {
                field: 'accountNumber',
                label: 'Номер лицевого счета',
                required: "Номер лицевого счета не заполнено",
                requiredCondition: allFieldRequiredCondition
            },
            {field: 'contractNumber', label: 'Номер документа', required: "Номер документа не заполнен"},
            {
                field: 'wishedDate',
                label: 'Желаемая дата',
                type: 'date',
                dateFormat: 'dd.MM.yyyy',
                required: "Желаемая дата не заполнена",
                requiredCondition: allFieldRequiredCondition
            },
            {
                field: 'surname',
                label: 'Фамилия',
                required: "Фамилия не заполнена",
                requiredCondition: allFieldRequiredCondition,
                validation: nameValidation
            },
            {
                field: 'firstName',
                label: 'Имя',
                required: "Имя не заполнено",
                requiredCondition: allFieldRequiredCondition,
                validation: nameValidation
            },
            {field: 'middleName', label: 'Отчество', required: false, validation: nameValidation},
            {
                field: 'region',
                label: 'Область',
                type: 'select',
                options: dictionaries.regions.value,
                optionLabel: 'name',
                optionValue: 'value',
                required: "Область не выбрана",
                requiredCondition: allFieldRequiredCondition
            },
            {
                field: 'district',
                label: 'Район',
                required: "Район не заполнен",
                requiredCondition: allFieldRequiredCondition
            },
            {
                field: 'city',
                label: 'Город',
                required: "Город не заполнен",
                requiredCondition: allFieldRequiredCondition
            },
            {
                field: 'street',
                label: 'Улица',
                required: "Название улицы не заполнено",
                requiredCondition: allFieldRequiredCondition
            },
            {
                field: 'house',
                label: 'Дом',
                required: "Номер дома не заполнен",
                requiredCondition: allFieldRequiredCondition
            },
            {field: 'apartment', label: 'Квартира'},
            {field: 'supervisor', label: 'Супервайзер', editable: false},
            {field: 'registrar', label: 'Регистратор', editable: false},
            {type: 'divider', label: 'Паспортные данные'},
            {
                field: 'documentType',
                label: 'Тип документа',
                type: 'select',
                options: dictionaries.documentType.value,
                optionLabel: 'name',
                optionValue: 'value',
                defaultValue: 'PASSPORT',
                required: true
            },
            {
                field: 'inn',
                label: 'Персональный номер',
                required: "Персональный номер не заполнен",
                requiredCondition: allFieldRequiredCondition,
                validation: {pattern: /^\d{14}$/, patternMessage: "Некорректно введен ПИН"}
            },
            {
                field: 'documentId',
                label: 'Номер документа',
                required: "Номер документа не заполнен",
                requiredCondition: allFieldRequiredCondition,
                validation: {pattern: /(^ID|^AN)([0-9]+$)/, patternMessage: "Неверно введен номер документа"}
            },
            {
                type: 'button',
                label: 'Данные по паспорту',
                icon: 'pi pi-id-card',
                displayCondition: (context: Context<SaimaAgent>) => context.isEditing && (context.editData.state === 'ACCEPTED' || context.editData.state === SaimaState.SELECTED) && context.editData.documentType === 'PASSPORT',
                loadingCondition: () => refs.isFetchingPassportData.value,
                action: (context: Context<SaimaAgent>) => services.fetchAndConfirmPassportData(context)
            },
            {
                field: 'birthDate',
                label: 'Дата рождения',
                type: 'date',
                dateFormat: 'dd.MM.yyyy',
                required: "Дата рождение пустое",
                requiredCondition: allFieldRequiredCondition,
                validation: {
                    validator: (newValue: Date) => {
                        if (!newValue) return "Дата рождение пустое";
                        const age = DateTime.local().diff(DateTime.fromJSDate(newValue), 'years').years;
                        if (age < 18) return 'Возраст должен быть не менее 18 лет.';
                    }
                }
            },
            {
                field: 'address',
                label: 'Адрес регистрации',
                type: 'textarea',
                rows: 2,
                required: "Адрес регистрации не заполнен",
                requiredCondition: allFieldRequiredCondition
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
                        if (!birthDate) return 'Сначала необходимо указать дату рождения.';
                        if (issueDate < birthDate) return 'Дата выдачи не может быть раньше даты рождения.';
                        const ageAtIssuance = issueDate.diff(birthDate, 'years').years;
                        if (ageAtIssuance < 16) return 'Паспорт не может быть выдан лицу младше 16 лет.';
                    }
                },
                warning: (_newValue: Date, context: Context<SaimaAgent>) => {
                    const issueDateValue = context.editData.issuedDate as Date | null;
                    const birthDateValue = context.editData.birthDate as Date | null;
                    if (!issueDateValue || !birthDateValue) return;
                    const issueDate = DateTime.fromJSDate(issueDateValue);
                    const birthDate = DateTime.fromJSDate(birthDateValue);
                    const ageAtIssuance = issueDate.diff(birthDate, 'years').years;
                    let expiryDate: DateTime | null = null;
                    if (ageAtIssuance >= 45) expiryDate = issueDate.plus({years: 10}); else if (ageAtIssuance >= 25 && ageAtIssuance < 45) expiryDate = birthDate.plus({years: 45}); else if (ageAtIssuance >= 16 && ageAtIssuance < 25) expiryDate = birthDate.plus({years: 25});
                    if (expiryDate && DateTime.local() > expiryDate) return 'Срок действия паспорта истёк. Проверьте данные или уточните у клиента.';
                }
            },
            {
                field: 'authority',
                label: 'Орган выдачи',
                required: "Орган выдачи не заполнен",
                requiredCondition: allFieldRequiredCondition
            },
            {type: 'divider', label: 'Шаблон ответа'},
            {
                field: 'saimaTemplateCategoryId',
                label: 'Классификация шаблона',
                disabledCondition: templateDisableCondition,
                type: 'select',
                options: dictionaries.saimaTemplateCategory.value,
                optionLabel: 'name',
                optionValue: 'id',
                onChange: (_newValue: number, context: Context<SaimaAgent>) => {
                    context.editData.comment = null;
                },
                required: true,
                requiredCondition: correctionRequiredCondition
            },
            {
                field: 'saimaTemplateId',
                label: 'Шаблон ответа',
                disabledCondition: templateDisableCondition,
                type: 'dependent-select',
                masterField: 'saimaTemplateCategoryId',
                options: dictionaries.saimaTemplate.value,
                optionLabel: 'name',
                optionValue: 'id',
                onChange: (newValue: number, context: Context<SaimaAgent>) => {
                    context.editData.comment = dictionaries.saimaTemplateMap.value.get(newValue)?.ruText || null;
                },
                required: true,
                requiredCondition: correctionRequiredCondition
            },
            {
                field: 'comment',
                label: 'Комментарий',
                type: 'textarea',
                rows: 5,
                required: true,
                requiredCondition: correctionRequiredCondition
            },
            {
                field: 'uploadPhotoTypes',
                label: 'Фото на исправление',
                displayCondition: (context: Context<SaimaAgent>) => context.editData.state === SaimaState.FOR_CORRECTION,
                type: 'multiselect',
                options: dictionaries.saimaPhotoTypes.value,
                optionLabel: 'name',
                optionValue: 'value'
            },
            {
                field: 'editDataTypes',
                label: 'Поля на исправление',
                displayCondition: (context: Context<SaimaAgent>) => context.editData.state === SaimaState.FOR_CORRECTION,
                type: 'multiselect',
                options: dictionaries.saimaSubEditData.value,
                optionLabel: 'name',
                optionValue: 'value'
            },
            {
                field: 'state',
                label: 'Статус',
                type: 'select',
                options: dictionaries.saimaState.value,
                optionLabel: 'name',
                optionValue: 'value',
                showClear: false
            },
        ];
    });

    const dialogConfig = computed((): DialogConfig<SaimaAgent> => ({
        title: dialogTitle.value,
        fields: dialogFieldsConfig.value,
        photos: dialogPhotoItem.value,
        isRecordEditable: dialogIsRecordEditable.value,
        extraActions: dialogButtons.value,
        onBeforeEdit: dialogBeforeEditAction,
    }));

    return {
        dialogVisible,
        dialogLoading,
        dialogMessage,
        dialogSaimaAgentModel,
        dialogConfig,
        openDialog,
        dialogHandleSave,
    };
}