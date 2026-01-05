export interface SubscriberFilter{
    page: number;
    size: number;
    startDate?: string;
    endDate?: string;
    msisdn?: string;
    ban?: string;
    lastName?: string;
    firstName?: string;
    middleName?: string;
    countryCode?: string;
    documentType?: string;
    inn?: string;
    persStatus?: string;
    createdDate?: string;
    dssRegistrarId?: number;
    registrarFio ?: string
    supervisorFio?: string;
    registrarMsisdn?: string;
    webRegistrar?: string;
    regionId?: number;
    channelType?: string
    processTime?: string
    isSimCardGift?: boolean
    isBlocked?: boolean
    isManual?: boolean
    issueDate?: string;
 }

export interface PersonificationUploadModel {
    id: number;
    fileType: UploadPhotoType;
    fileName: string;
    fileContent: string; // Base64
    contentType: string;
    status: string;
}


export enum UploadPhotoType {
    PHOTO_DOCUMENT_FACE_SIDE = "PHOTO_DOCUMENT_FACE_SIDE",
    PHOTO_DOCUMENT_BACK_SIDE = "PHOTO_DOCUMENT_BACK_SIDE",
    PHOTO_ABONENT_PHOTO = "PHOTO_ABONENT_PHOTO",
    PHOTO_SIM = "PHOTO_SIM",
    PHOTO_CONTRACT = "PHOTO_CONTRACT",
    PHOTO_ABONENT_WITH_DOCUMENT = "PHOTO_ABONENT_WITH_DOCUMENT",
    PHOTO_DOCUMENT_SPREAD = "PHOTO_DOCUMENT_SPREAD",
    PHOTO_ADDITIONAL = "PHOTO_ADDITIONAL",
    GRS_PHOTO = "GRS_PHOTO",
    DIGITAL_DOCUMENT = "DIGITAL_DOCUMENT",
    PHOTO_FACE_MYID_SDK = "PHOTO_FACE_MYID_SDK",
    PHOTO_ABONENT_WITH_GIFT = "PHOTO_ABONENT_WITH_GIFT"
}

export interface UpdatePersonificationModel {
    id: number;
    firstName: string;
    lastName: string;
    middleName: string;
    birthDate: string;
    address: string;
    inn: string;
    documentType: string;
    documentId: string;
    issueDate: string;
    countryName: string;
    authority: string;
    persStatus: string;
    templateCategoryId: number;
    comments: string;
}

export interface RegistrarFiosResponse {
    registrars: string[];
    supervisors: string[];
}