// src/enums/validation-message.constants.ts

export const ValidationMessage = {
    RequiredField: (label: string) => `Поле "${label}" не заполнено`,
    RequiredSelect: (label: string) => `Поле "${label}" не выбрано`,
    RequiredDate: (label: string) => `Поле "${label}" не заполнено`,
    MsisdnInvalid: 'Номер не соответствует формату 996XXXXXXXXX',
    NameInvalid: 'Поле может содержать только буквы, пробел и дефис',
    InnInvalid: 'ПИН должен состоять из 14 цифр',
    DocumentIdInvalid: 'Неверный формат номера документа (ID/AN)',
    AgeTooYoung: 'Возраст должен быть не менее 18 лет.',
    BirthDateRequired: 'Сначала необходимо указать дату рождения.',
    IssueDateBeforeBirth: 'Дата выдачи не может быть раньше даты рождения.',
    PassportTooYoung: 'Паспорт не может быть выдан лицу младше 16 лет.',
    PassportExpired: 'Срок действия паспорта истёк. Проверьте данные или уточните у клиента.',
};