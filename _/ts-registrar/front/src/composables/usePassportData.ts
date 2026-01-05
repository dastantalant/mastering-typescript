import {ref} from 'vue';
import type {Ref} from 'vue';
import {DateTime} from 'luxon';
import type {ToastServiceMethods} from 'primevue/toastservice';

import type DataEditorDialog from "@/components/DataEditorDialog.vue";
import type {Context} from "@/components/DataEditorDialog.vue";

import type {PassportResponse} from "@/models/dictionary/passport.model.ts";
import type {SaimaAgent} from "@/models/saima-agent.model.ts";
import PassportService from "@/services/dictionary/__tests__/passport.service.ts";

export function usePassportData(
    dataEditorDialogRef: Ref<InstanceType<typeof DataEditorDialog> | null>,
    toast: ToastServiceMethods
) {
    const isPassportConfirmDialogVisible = ref(false);
    const passportDataToConfirm = ref<PassportResponse | null>(null);
    const isFetchingPassportData = ref(false);

    const generatePassportMessage = (data: PassportResponse): string => {
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
            console.error("No passport data to confirm or dialog ref is not available.");
            return;
        }

        const response = passportDataToConfirm.value;

        const birthDateObject = response.dateOfBirth
            ? DateTime.fromFormat(response.dateOfBirth, 'dd.MM.yyyy').toJSDate()
            : null;
        const issuedDateObject = response.issuedDate
            ? DateTime.fromFormat(response.issuedDate, 'dd.MM.yyyy').toJSDate()
            : null;

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
            const data = await PassportService.getPassportData(inn, documentId);
            passportDataToConfirm.value = data;
            isPassportConfirmDialogVisible.value = true;
        } catch (error: any) {
            const detail = error?.response?.status === 404
                ? 'Данные по ПИН не найдены.'
                : 'Не удалось получить данные паспорта.';

            toast.add({
                severity: 'error',
                summary: 'Ошибка',
                detail,
                life: 5000
            });
        } finally {
            isFetchingPassportData.value = false;
        }
    };

    return {
        isPassportConfirmDialogVisible,
        passportDataToConfirm,
        isFetchingPassportData,
        generatePassportMessage,
        applyPassportData,
        fetchAndConfirmPassportData,
    };
}