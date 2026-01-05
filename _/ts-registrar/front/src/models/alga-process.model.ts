
export interface AlgaProcessFilter{
    page: number;
    size: number;
    status: string;
    type: string;
    organizationId: number;
    startDate: string;
    endDate: string;
    prMsisdn: string;
    msisdn: string;
    chanelType: string;
    regionId: number;
    fullName: string;
}

export type AlgaStepStatus = 'SUCCESS' | 'ERROR' | 'IN_PROGRESS'

export interface AlgaStepLog {
    name: string
    start: string
    end?: string
    durationMillis?: number
    status: AlgaStepStatus
    errorMessage: string
    errorDetails: string
}