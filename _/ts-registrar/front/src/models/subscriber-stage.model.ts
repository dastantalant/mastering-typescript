export interface SubscriberStage{

    msisdn: string;
    state: string;
    stage: string;
    editedBy: string;
    firstName: string;
    lastName: string;
    editAbleFields: boolean;
}

export interface SubscriberStageFilter{
    page: number;
    size: number;
    startDate: string;
    endDate: string;
    msisdn: string;
    state: string;
    stage: string;
    editedBy: string;
    firstName: string;
    lastName: string;
}