// src/enums/saima-agent.constants.enum.ts


import { Severity } from '@/_/schema/ui-types.ts'

export enum FieldId {
    Id = 'id',
    Msisdn = 'msisdn',
    TariffId = 'tariffId',
    RouterId = 'routerId',
    ConsoleId = 'consoleId',
    AccountNumber = 'accountNumber',
    ContractNumber = 'contractNumber',
    WishedDate = 'wishedDate',
    Surname = 'surname',
    FirstName = 'firstName',
    MiddleName = 'middleName',
    Region = 'region',
    District = 'district',
    City = 'city',
    Street = 'street',
    House = 'house',
    Apartment = 'apartment',
    Supervisor = 'supervisor',
    Registrar = 'registrar',
    DocumentType = 'documentType',
    Inn = 'inn',
    DocumentId = 'documentId',
    BirthDate = 'birthDate',
    Address = 'address',
    IssuedDate = 'issuedDate',
    Authority = 'authority',
    SaimaTemplateCategoryId = 'saimaTemplateCategoryId',
    SaimaTemplateId = 'saimaTemplateId',
    Comment = 'comment',
    UploadPhotoTypes = 'uploadPhotoTypes',
    EditDataTypes = 'editDataTypes',
    State = 'state',
}

export const FieldLabel = {
    [FieldId.Id]: 'ID',
    [FieldId.Msisdn]: 'Номер телефона',
    [FieldId.TariffId]: 'Тариф',
    [FieldId.RouterId]: 'Роутер',
    [FieldId.ConsoleId]: 'Приставка',
    [FieldId.AccountNumber]: 'Номер лицевого счета',
    [FieldId.ContractNumber]: 'Номер документа',
    [FieldId.WishedDate]: 'Желаемая дата',
    [FieldId.Surname]: 'Фамилия',
    [FieldId.FirstName]: 'Имя',
    [FieldId.MiddleName]: 'Отчество',
    [FieldId.Region]: 'Область',
    [FieldId.District]: 'Район',
    [FieldId.City]: 'Город',
    [FieldId.Street]: 'Улица',
    [FieldId.House]: 'Дом',
    [FieldId.Apartment]: 'Квартира',
    [FieldId.Supervisor]: 'Супервайзер',
    [FieldId.Registrar]: 'Регистратор',
    [FieldId.DocumentType]: 'Тип документа',
    [FieldId.Inn]: 'Персональный номер',
    [FieldId.DocumentId]: 'Номер документа',
    [FieldId.BirthDate]: 'Дата рождения',
    [FieldId.Address]: 'Адрес регистрации',
    [FieldId.IssuedDate]: 'Дата выдачи',
    [FieldId.Authority]: 'Орган выдачи',
    [FieldId.SaimaTemplateCategoryId]: 'Классификация шаблона',
    [FieldId.SaimaTemplateId]: 'Шаблон ответа',
    [FieldId.Comment]: 'Комментарий',
    [FieldId.UploadPhotoTypes]: 'Фото на исправление',
    [FieldId.EditDataTypes]: 'Поля на исправление',
    [FieldId.State]: 'Статус',
};

export enum SaimaState {
    PENDING = "PENDING",
    SELECTED = "SELECTED",
    REJECTED = "REJECTED",
    TECHNICAL_SHEET_ISSUED = "TECHNICAL_SHEET_ISSUED",
    FOR_CORRECTION = "FOR_CORRECTION",
    PERSONAL_ACCOUNT_ISSUED = "PERSONAL_ACCOUNT_ISSUED",
    ADDING_AN_ADDRESS = "ADDING_AN_ADDRESS",
}

export const SAIMA_STATE_SEVERITY_MAP = new Map([
    [SaimaState.REJECTED, Severity.Danger],
    [SaimaState.FOR_CORRECTION, Severity.Danger],
    [SaimaState.TECHNICAL_SHEET_ISSUED, Severity.Success],
    [SaimaState.PERSONAL_ACCOUNT_ISSUED, Severity.Success],
    [SaimaState.SELECTED, Severity.Warning],
    [SaimaState.ADDING_AN_ADDRESS, Severity.Warning],
    [SaimaState.PENDING, Severity.Info]
]);

export enum DocumentTypeValue {
    Passport = 'PASSPORT',
}
