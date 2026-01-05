import type {Operation} from './operation.model.ts';
import type {OperationConfigItem} from './operation-config-item.model.ts';
export interface OperationConfig {
    id?: number;
    name: string;
    operation?: Operation;
    dayStartTime: string;
    dayEndTime: string;
    nightStartTime: string;
    nightEndTime: string;
    requestsLimitEnabled: boolean;
    requestsLimit?: number;
    blocked: boolean;
    configItems?: OperationConfigItem[];
    uploadedOperationData?: UploadedOperationData[];
}

export interface UploadedOperationData {
    id?: number;
    checkDate: string;
    uploadDate: string;
    status: OperationStatus;
    count: number;
    processingTime: number;
}


export interface Organization {
    id: number;
    name: string;
    code: string;
}

export enum OperationStatus {
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    CHECKED = 'CHECKED'
}

export enum OperationType {
    MANUAL_DATA_UPLOAD = 'MANUAL_DATA_UPLOAD',
    CORRESPONDENCE = 'CORRESPONDENCE',
    REGISTRAR = 'REGISTRAR'
}

export enum OperationStatisticsProcessor {
    SUBSCRIBER = 'SUBSCRIBER',
    SUBSCRIBER_STAGE = 'SUBSCRIBER_STAGE',
    SIM_RECOVERY = 'SIM_RECOVERY',
    EDU_PRICE_PLAN_REQUESTS = 'EDU_PRICE_PLAN_REQUESTS',
    SAIMA_AGENTS = 'SAIMA_AGENTS',
    E_SIM = 'E_SIM',
    SIMPLE_PERSONIFICATION = 'SIMPLE_PERSONIFICATION'
}