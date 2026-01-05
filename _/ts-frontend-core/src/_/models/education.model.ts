import {date} from "yup";

export interface EducationFilter{
    page: number;
    size: number;
    ban: string;
    msisdn: string;
    state: string;
    type: string;
    webRegistrar: string;
    startDate: string;
    endDate: string;
    byId: string;
}



export interface EducationDetailModel{
    id: number;
    ban: string;
    area: string;
    district: string;
    school: string;
    locality: string;
    birthCertificatesNumber: string;
    inn: string;
    passportNumber: string;
    lastname: string;
    firstname: string;
    patronymic: string;
    birthday: date;
    isCitizen: boolean;
    state: string;
    comment: string;
    blockedBy: string;
    canEdit: boolean;
    certificateType?: string;
}

export interface EducationFileModel{
    id: number;
    requestId: number;
    type: string;
    data: [];
}