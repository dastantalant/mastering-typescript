export interface EduRejectReason {
    id: number;
    requestType: string;
    ruText: string;
    kgText: string;
    enText: string;
}

export interface EduRequestType {
    name: string;
    displayName: string;
}