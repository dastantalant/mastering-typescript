import type {Enum} from "./enum.model.ts";
import {SaimaState} from "../enums/saima-agent.enum.ts";

export interface SaimaAgentFilter {
    page: number;
    size: number;
    startDate: string;
    endDate: string;

    msisdn: string;
    accountNumber: string;
    channel: string;
    region: string;
    state: string | SaimaState;
    registrar: string;
    supervisor: string;
    saimaAgent: string;
    webRegistrar: string;
}

export interface ShortSaimaAgentDTO {
    id: number;
    msisdn: number;
    accountNumber: string;
    fullName: string;
    inn: string;
    registrarFullName: string;
    registrarMsisdn: string;
    region: number;
    district: string;
    city: string;
    address: string;
    channel: string;
    supervisorFullName: string;
    supervisorMsisdn: string;
    state: string | SaimaState;
    createdAt: Date | string;
    updatedAt: Date | string;
    timeTaken: string;
    isBlocked: boolean;
    webRegistrar: string;
    street: string;
    house: string;
    apartmentNumber: string;
}

export interface PersonalInfo {
    msisdn?: string;
    accountNumber?: string;
    contractNumber?: string;
    pricePlan?: string;
    surname?: string;
    firstName?: string;
    middleName?: string;
    documentData?: DocumentData;
}


export interface DocumentData {
    inn?: string;
    documentId?: string;
    authority?: string;
    issuedDate?: string;
    birthDate?: string;
    address?: string;
    documentType?: string;
}

export interface AddressInfo {
    region?: string;
    district?: string;
    city?: string;
    street?: string;
    house?: string;
    apartment?: string;
}

export interface TariffInfo {
    tariffId?: number;
    tariffName?: string;
    routerId?: number;
    routerName?: string;
    consoleId?: number;
    consoleName?: string;
}

export interface TimeInfo {
    registrationDate?: string;
    selectedStartTime?: string;
    lastSelectedStartTime?: string;
    selectedEndTime?: string;
    wishedDate?: string;
    startDate?: string;
    extraSelectedTimeInMinutes?: number;
    selectedTimeInSeconds?: number;
}

export interface StateInfo {
    state?: string;
    stateAction?: string;
    blocked?: boolean;
    reSent?: boolean;
    editable?: boolean;
    isFirstStep?: boolean;
    registrarUsername?: string;
    webRegistrarUsername?: string;
    comment?: string;
    registrarFirstName?: string;
    registrarLastName?: string;
    supervisorFirstName?: string;
    supervisorLastName?: string;
    errorMessage?: string;
    firstStep?: boolean;
}

export interface FullSaimaAgentDTO {
    id?: number;
    personalInfo?: PersonalInfo;
    addressInfo?: AddressInfo;
    tariffInfo?: TariffInfo;
    timeInfo?: TimeInfo;
    stateInfo?: StateInfo;
    uploadPhotoTypes?: string[];
    editDataTypes?: string[];
    errorMessage?: string;
    saimaAgentUploads?: SaimaAgentUploads[];
    saimaTemplateCategoryId?: number;
    saimaTemplateId?: number;
}

export interface DocumentImage {
    id?: number;
    type?: string;
    fileType?: string;
    encodedFile?: string;
}

export interface SaimaAgentUploads {
    signedUrl?: string;
    saimaPhotoType?: string;
}

export interface ConnectionDataDTO {
    id: number;
    name: string;
    type: string;
    typeName: string;
    activeStatus: boolean;
    description: string;
    price: number;
}

export interface ConnectionData {
    tariffs: ConnectionDataDTO[];
    consoles: ConnectionDataDTO[];
    routers: ConnectionDataDTO[];
    regions: Enum[];
}

export interface SaimaAgent {
    id?: number;

    // PersonalInfo
    msisdn?: string;
    accountNumber?: string;
    contractNumber?: string;
    surname?: string;
    firstName?: string;
    middleName?: string;
    // DocumentData
    inn?: string;
    documentId?: string;
    authority?: string;
    issuedDate?: string;
    birthDate?: string;
    address?: string;
    documentType?: string;

    // AddressInfo
    region?: string;
    district?: string;
    city?: string;
    street?: string;
    house?: string;
    apartment?: string;

    // TariffInfo
    tariffId?: number;
    tariffName?: string;
    routerId?: number;
    routerName?: string;
    consoleId?: number;
    consoleName?: string;

    // TimeInfo
    registrationDate?: string;
    selectedStartTime?: string;
    lastSelectedStartTime?: string;
    selectedEndTime?: string;
    wishedDate?: string;
    startDate?: string;
    extraSelectedTimeInMinutes?: number;
    selectedTimeInSeconds?: number;

    // StateInfo
    state?: string;
    stateAction?: string;
    blocked?: boolean;
    reSent?: boolean;
    editable?: boolean;
    isFirstStep?: boolean;
    registrarUsername?: string;
    webRegistrarUsername?: string;
    comment?: string;
    registrar?: string | null;
    supervisor?: string | null;
    errorMessage?: string;
    firstStep?: boolean;

    saimaTemplateCategory?: number;

    uploadPhotoTypes?: string[];
    editDataTypes?: string[];
    saimaAgentUploads?: SaimaAgentUploads[];

    saimaTemplateCategoryId?: number;
    saimaTemplateId?: number;
}

export interface SaimaAgentUpdateDTO {
    id?: number;

    // PersonalInfo
    msisdn?: string;
    accountNumber?: string;
    contractNumber?: string;
    surname?: string;
    firstName?: string;
    middleName?: string;
    // DocumentData
    inn?: string;
    documentId?: string;
    authority?: string;
    issuedDate?: string;
    birthDate?: string;
    address?: string;
    documentType?: string;

    // AddressInfo
    region?: string;
    district?: string;
    city?: string;
    street?: string;
    house?: string;
    apartment?: string;

    // TariffInfo
    tariffId?: number;
    routerId?: number;
    consoleId?: number;

    // TimeInfo
    wishedDate?: string;

    // StateInfo
    state?: string;
    comment?: string;

    uploadPhotoTypes?: string[];
    editDataTypes?: string[];

    saimaTemplateCategoryId?: number;

    saimaAgentUploads?: SaimaAgentUploads[];
}

export class SaimaAgentMapper {

    /**
     * Преобразует иерархический FullSaimaAgentDTO в "плоскую" модель SaimaAgent.
     * @param dto - Объект передачи данных с сервера.
     * @returns - "Плоская" модель SaimaAgent для использования в приложении.
     */
    static fromDTO(dto: FullSaimaAgentDTO): SaimaAgent {
        const personal = dto.personalInfo ?? {};
        const document = personal.documentData ?? {};
        const address = dto.addressInfo ?? {};
        const tariff = dto.tariffInfo ?? {};
        const time = dto.timeInfo ?? {};
        const state = dto.stateInfo ?? {};

        return {
            id: dto.id,

            // PersonalInfo
            msisdn: personal.msisdn,
            accountNumber: personal.accountNumber,
            contractNumber: personal.contractNumber,
            surname: personal.surname,
            firstName: personal.firstName,
            middleName: personal.middleName,

            // DocumentData (внутри PersonalInfo)
            inn: document.inn,
            documentId: document.documentId,
            authority: document.authority,
            issuedDate: document.issuedDate,
            birthDate: document.birthDate,
            address: document.address,
            documentType: document.documentType,

            // AddressInfo
            region: address.region,
            district: address.district,
            city: address.city,
            street: address.street,
            house: address.house,
            apartment: address.apartment,

            // TariffInfo
            tariffId: tariff.tariffId,
            tariffName: tariff.tariffName,
            routerId: tariff.routerId,
            routerName: tariff.routerName,
            consoleId: tariff.consoleId,
            consoleName: tariff.consoleName,

            // TimeInfo
            registrationDate: time.registrationDate,
            selectedStartTime: time.selectedStartTime,
            lastSelectedStartTime: time.lastSelectedStartTime,
            selectedEndTime: time.selectedEndTime,
            wishedDate: time.wishedDate,
            startDate: time.startDate,
            extraSelectedTimeInMinutes: time.extraSelectedTimeInMinutes,
            selectedTimeInSeconds: time.selectedTimeInSeconds,

            // StateInfo
            state: state.state,
            stateAction: state.stateAction,
            blocked: state.blocked,
            reSent: state.reSent,
            editable: state.editable,
            isFirstStep: state.isFirstStep,
            registrarUsername: state.registrarUsername,
            webRegistrarUsername: state.webRegistrarUsername,
            comment: state.comment,
            registrar: [state.registrarFirstName, state.registrarLastName].filter(Boolean).join(' ') || null,
            supervisor: [state.supervisorFirstName, state.supervisorLastName].filter(Boolean).join(' ') || null,
            errorMessage: state.errorMessage,
            firstStep: state.firstStep,

            // Данные верхнего уровня из DTO
            uploadPhotoTypes: dto.uploadPhotoTypes,
            editDataTypes: dto.editDataTypes,
            saimaAgentUploads: dto.saimaAgentUploads,
            saimaTemplateCategoryId: dto.saimaTemplateCategoryId,
            saimaTemplateId: dto.saimaTemplateId,
        };
    }

    /**
     * Преобразует "плоскую" модель SaimaAgent в иерархический FullSaimaAgentDTO для отправки на сервер.
     * @param model - "Плоская" модель SaimaAgent.
     * @returns - Иерархический DTO, готовый к отправке.
     */
    static toDTO(model: SaimaAgent): FullSaimaAgentDTO {
        return {
            id: model.id,

            personalInfo: {
                msisdn: model.msisdn,
                accountNumber: model.accountNumber,
                contractNumber: model.contractNumber,
                surname: model.surname,
                firstName: model.firstName,
                middleName: model.middleName,
                documentData: {
                    inn: model.inn,
                    documentId: model.documentId,
                    authority: model.authority,
                    issuedDate: model.issuedDate,
                    birthDate: model.birthDate,
                    address: model.address,
                    documentType: model.documentType,
                },
            },

            addressInfo: {
                region: model.region,
                district: model.district,
                city: model.city,
                street: model.street,
                house: model.house,
                apartment: model.apartment,
            },

            tariffInfo: {
                tariffId: model.tariffId,
                tariffName: model.tariffName,
                routerId: model.routerId,
                routerName: model.routerName,
                consoleId: model.consoleId,
                consoleName: model.consoleName,
            },

            timeInfo: {
                registrationDate: model.registrationDate,
                selectedStartTime: model.selectedStartTime,
                lastSelectedStartTime: model.lastSelectedStartTime,
                selectedEndTime: model.selectedEndTime,
                wishedDate: model.wishedDate,
                startDate: model.startDate,
                extraSelectedTimeInMinutes: model.extraSelectedTimeInMinutes,
                selectedTimeInSeconds: model.selectedTimeInSeconds,
            },

            stateInfo: {
                state: model.state,
                stateAction: model.stateAction,
                blocked: model.blocked,
                reSent: model.reSent,
                editable: model.editable,
                isFirstStep: model.isFirstStep,
                registrarUsername: model.registrarUsername,
                webRegistrarUsername: model.webRegistrarUsername,
                comment: model.comment,
                errorMessage: model.errorMessage,
                firstStep: model.firstStep,
            },

            uploadPhotoTypes: model.uploadPhotoTypes,
            editDataTypes: model.editDataTypes,
            saimaTemplateCategoryId: model.saimaTemplateCategoryId,
            saimaTemplateId: model.saimaTemplateId,
        };
    }

    /**
     * Преобразует модель SaimaAgent в SaimaAgentUpdateDTO для обновления на сервер.
     * @param model - Модель SaimaAgent.
     * @returns - SaimaAgentUpdateDTO, готовый к отправке.
     */
    static toUpdateDTO(model: SaimaAgent): SaimaAgentUpdateDTO {
        return {
            id: model.id,

            // PersonInfo
            msisdn: model.msisdn,
            accountNumber: model.accountNumber,
            contractNumber: model.contractNumber,
            surname: model.surname,
            firstName: model.firstName,
            middleName: model.middleName,
            // DocumentData
            inn: model.inn,
            documentId: model.documentId,
            authority: model.authority,
            issuedDate: model.issuedDate,
            birthDate: model.birthDate,
            address: model.address,
            documentType: model.documentType,

            // AddressInfo
            region: model.region,
            district: model.district,
            city: model.city,
            street: model.street,
            house: model.house,
            apartment: model.apartment,

            // TariffInfo
            tariffId: model.tariffId,
            routerId: model.routerId,
            consoleId: model.consoleId,

            // TimeInfo
            wishedDate: model.wishedDate,

            // StateInfo
            state: model.state,
            comment: model.comment,

            uploadPhotoTypes: model.uploadPhotoTypes,
            editDataTypes: model.editDataTypes,
            saimaTemplateCategoryId: model.saimaTemplateCategoryId,

            saimaAgentUploads: model.saimaAgentUploads,
        };
    }
}