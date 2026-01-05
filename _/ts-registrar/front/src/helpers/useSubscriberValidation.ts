import { ref } from 'vue';

export default function useSubscriberValidation() {
    const errors = ref({
        lastName: '',
        firstName: '',
        middleName: '',
        birthDate: '',
        address: '',
        inn: '',
        documentType: '',
        documentId: '',
        countryCode: '',
        authority: '',
        issueDate: '',
        uploads: ''
    });

    const validateRequired = (value: string, fieldName: string): boolean => {
        if (!value || value.trim() === '') {
            errors.value[fieldName] = `Поле обязательно для заполнения`;
            return false;
        }
        errors.value[fieldName] = '';
        return true;
    };

    const validateDate = (date: Date | string | null): boolean => {
        if (!date) {
            errors.value.birthDate = 'Поле обязательно для заполнения';
            return false;
        }

        let dateStr: string;
        if (date instanceof Date) {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            dateStr = `${day}.${month}.${year}`;
        } else if (typeof date === 'string') {
            dateStr = date.split(' ')[0];
        } else {
            errors.value.birthDate = 'Неверный формат даты';
            return false;
        }

        const datePattern = /^(0[1-9]|[12][0-9]|3[01])[.](0[1-9]|1[012])[.](19|20)[0-9]{2}$/;
        if (!dateStr.match(datePattern)) {
            errors.value.birthDate = 'Неверный формат даты (дд.мм.гггг)';
            return false;
        }

        const [day, month, year] = dateStr.split('.');
        const birthDateObj = new Date(+year, +month - 1, +day);

        const today = new Date();
        const sixteenYearsAgo = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());

        if (birthDateObj > sixteenYearsAgo) {
            errors.value.birthDate = 'Возраст должен быть не меньше 16 лет';
            return false;
        }

        errors.value.birthDate = '';
        return true;
    };

    const validateInn = (inn: string, documentType: string): boolean => {
        if (documentType === 'PASSPORT' || documentType === 'DIGITAL_PASSPORT') {
            if (!inn || inn.trim() === '') {
                errors.value['inn'] = `Поле обязательно для заполнения`;
                return false;
            }
            if (inn && inn.length !== 14) {
                errors.value.inn = 'Некорректно введен ИНН (должно быть 14 символов)';
                return false;
            }


        }
        errors.value.inn = '';
        return true;
    };

    const validateDocumentId = (documentId: string, documentType: string): boolean => {
        if (!documentId) {
            errors.value.documentId = 'Номер документа обязателен';
            return false;
        }

        if (documentType === 'PASSPORT' || documentType === 'DIGITAL_PASSPORT') {
            if (!/^(AN|ID)\d{7}$/.test(documentId)) {
                errors.value.documentId = 'Неверный формат номера (AN1234567 или ID1234567)';
                return false;
            }
        }

        errors.value.documentId = '';
        return true;
    };

    const validateIssueDate = (issueDate: string | Date | null, birthDate: string | Date | null): boolean => {
        errors.value.issueDate = '';

        if (!issueDate) {
            errors.value.issueDate = 'Дата выдачи обязательна';
            return false;
        }

        let issueDateObj: Date;
        let birthDateObj: Date | null = null;

        try {
            if (typeof issueDate === 'string') {
                const datePart = issueDate.split(' ')[0];
                if (/^\d{2}\.\d{2}\.\d{4}$/.test(datePart)) {
                    const [day, month, year] = datePart.split('.');
                    issueDateObj = new Date(`${year}-${month}-${day}`);
                } else if (/^\d{4}-\d{2}-\d{2}/.test(datePart)) {
                    issueDateObj = new Date(datePart);
                } else {
                    errors.value.issueDate = 'Неверный формат даты (дд.мм.гггг или гггг-мм-дд)';
                    return false;
                }
            } else {
                issueDateObj = new Date(issueDate);
                issueDateObj.setHours(0, 0, 0, 0);
            }

            if (birthDate) {
                if (typeof birthDate === 'string') {
                    if (birthDate.includes('.')) {
                        const [day, month, year] = birthDate.split('.');
                        birthDateObj = new Date(`${year}-${month}-${day}`);
                    } else {
                        birthDateObj = new Date(birthDate.split(' ')[0]);
                    }
                } else {
                    birthDateObj = new Date(birthDate);
                    birthDateObj.setHours(0, 0, 0, 0);
                }
            }
        } catch {
            errors.value.issueDate = 'Неверный формат даты';
            return false;
        }

        if (isNaN(issueDateObj.getTime())) {
            errors.value.issueDate = 'Неверная дата выдачи';
            return false;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (issueDateObj > today) {
            errors.value.issueDate = 'Дата выдачи не может быть в будущем';
            return false;
        }

        if (birthDateObj && !isNaN(birthDateObj.getTime()) && issueDateObj <= birthDateObj) {
            errors.value.issueDate = 'Дата выдачи не может быть раньше даты рождения';
            return false;
        }

        return true;
    };
    const validateUploads = (uploadCount: number): boolean => {
        const requiredUploadsCount = 0;

        if (uploadCount < requiredUploadsCount) {
            errors.value.uploads = `Необходимо загрузить ${requiredUploadsCount} файлов (загружено: ${uploadCount})`;
            return false;
        }

        errors.value.uploads = '';
        return true;
    };

    const validateSubscriber = (subscriber: any, uploadCount: number = 0): boolean => {
        let isValid = true;

        isValid = validateRequired(subscriber.lastName, 'lastName') && isValid;
        isValid = validateRequired(subscriber.firstName, 'firstName') && isValid;
        if (subscriber.middleName) {
            isValid = validateRequired(subscriber.middleName, 'middleName') && isValid;
        }
        isValid = validateDate(subscriber.birthDate) && isValid;
        isValid = validateRequired(subscriber.address, 'address') && isValid;

        isValid = validateInn(subscriber.inn, subscriber.documentType) && isValid;
        isValid = validateDocumentId(subscriber.documentId, subscriber.documentType) && isValid;
        isValid = validateRequired(subscriber.authority, 'authority') && isValid;
        isValid = validateIssueDate(subscriber.issueDate, subscriber.birthDate) && isValid;
        isValid = validateUploads(uploadCount) && isValid;

        return isValid;
    };

    return {
        errors,
        validateSubscriber
    };
}