import { DateTime } from "luxon";
import type {PassportResponse} from "../../../models/dictionary/passport.model.ts";

const mockSuccessData: PassportResponse = {
    surname: "Маккамбаев",
    name: "Дастан",
    patronymic: "Талантбекович",
    dateOfBirth: DateTime.local(2090, 5, 15).toFormat('dd.MM.yyyy'),
    issuedDate: DateTime.local(2020, 10, 20).toFormat('dd.MM.yyyy'),
    passportAuthority: "МКК 50-25",
    address: "г. Бишкек, пр. Чүй, үй. 205, кв. 25"
};

const mockError404 = {
    response: {
        status: 404,
        data: { message: "Данные не найдены" }
    }
};

const mockError500 = {
    response: {
        status: 500,
        data: { message: "Сервис временно недоступен." }
    }
};

export default class PassportService {
    static getPassportData(pin: string, passportNumber: string): Promise<PassportResponse> {
        return new Promise<PassportResponse>((resolve: any, reject: any) => {
            setTimeout(() => {
                if (pin === '22222222222222') {
                    reject(mockError404);
                } else if (pin === '33333333333333') {
                    reject(mockError500);
                } else {
                    resolve(mockSuccessData);
                }
            }, 1000);
        });
    }
}