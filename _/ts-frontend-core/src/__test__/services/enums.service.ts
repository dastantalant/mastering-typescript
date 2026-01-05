import type {Enum} from "@/_/models/enum.model.ts";
import {Fluent, type FluentClass, type FluentService} from "@/_/utils/Fluent.ts";

const mockFetchWrapper = {
    get: async (url: string): Promise<any> => {

        if (url.endsWith("/registrar-channel")) {
            const data: Enum[] = [
                { name: 'Дилер', value: 'DEALER' },
                { name: 'Офис продаж', value: 'OFFICE' },
                { name: 'Веб-сайт', value: 'WEB' }
            ];
            return Promise.resolve(data);
        }

        if (url.endsWith("/region")) {
            const data: Enum[] = [
                { name: 'Чуйская область', value: 'CHUI', code: 1 },
                { name: 'Иссык-Кульская область', value: 'ISSYK_KUL', code: 2 },
                { name: 'Таласская область', value: 'TALAS', code: 3 },
                { name: 'Нарынская область', value: 'NARYN', code: 4 },
                { name: 'Джалал-Абадская область', value: 'JALAL_ABAD', code: 5 },
                { name: 'Ошская область', value: 'OSH', code: 6 },
                { name: 'Баткенская область', value: 'BATKEN', code: 7 },
            ];
            return Promise.resolve(data);
        }

        if (url.endsWith("/saima-state")) {
            const data: Enum[] = [
                { name: 'Новый', value: 'NEW' },
                { name: 'Выбран', value: 'SELECTED' },
                { name: 'В обработке', value: 'PENDING' },
                { name: 'Отклонен', value: 'REJECTED' },
                { name: 'На доработку', value: 'FOR_CORRECTION' },
                { name: 'Выпущен тех. лист', value: 'TECHNICAL_SHEET_ISSUED' },
                { name: 'Выпущен лиц. счет', value: 'PERSONAL_ACCOUNT_ISSUED' },
                { name: 'Добавление адреса', value: 'ADDING_AN_ADDRESS' },
            ];
            return Promise.resolve(data);
        }

        if (url.endsWith("/saima-photo-type")) {
            const data: Enum[] = [
                { name: 'Паспорт (лицо)', value: 'PASSPORT_FRONT', code: 1 },
                { name: 'Паспорт (оборот)', value: 'PASSPORT_BACK', code: 2 },
                { name: 'Договор', value: 'LOAN_AGREEMENT', code: 3 },
                { name: 'Приложение (1 стр)', value: 'APPLICATION_FIRST_PAGE', code: 4 },
            ];
            return Promise.resolve(data);
        }

        if (url.endsWith("/document-type")) {
            const data: Enum[] = [
                { name: 'ID-карта (паспорт КР)', value: 'PASSPORT' },
                { name: 'Иностранный паспорт', value: 'FOREIGN_PASSPORT' },
                { name: 'Военный билет', value: 'MILITARY_ID' },
            ];
            return Promise.resolve(data);
        }

        if (url.endsWith("/saima-sub-edit-data")) {
            const data: Enum[] = [
                { name: 'ФИО', value: 'FIO' },
                { name: 'Паспортные данные', value: 'PASSPORT_DATA' },
                { name: 'Адрес', value: 'ADDRESS' },
                { name: 'Контактные данные', value: 'CONTACTS' },
            ];
            return Promise.resolve(data);
        }
        return Promise.resolve([]);
    }
};

// --- КОНЕЦ МОК-РЕАЛИЗАЦИИ ---

@Fluent({ caching: true , ttl: 10 * 60 * 1000})
class EnumsService {
    findAllRegistrarChanel(): Promise<Enum[]> {
        return mockFetchWrapper.get("/enums/registrar-channel");
    }

    getAllRegion(): Promise<Enum[]> {
        return mockFetchWrapper.get("/enums/region");
    }

    getAllSaimaState(): Promise<Enum[]> {
        return mockFetchWrapper.get("/enums/saima-state");
    }

    getAllSaimaPhotoType(): Promise<Enum[]> {
        return mockFetchWrapper.get("/enums/saima-photo-type");
    }

    getAllDocumentType(): Promise<Enum[]> {
        return mockFetchWrapper.get("/enums/document-type");
    }

    getAllSaimaSubEditData(): Promise<Enum[]> {
        return mockFetchWrapper.get("/enums/saima-sub-edit-data");
    }
}
export default EnumsService as unknown as FluentService<EnumsService, typeof EnumsService>;
