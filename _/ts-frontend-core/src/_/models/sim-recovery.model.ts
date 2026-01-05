
export interface SimRecovery{

    id: number;
    icc: string;
    msisdn: string;
    oldIcc: string;
    ban: string;
    surName: string;
    firstName: string;
    middleName: string;
    registrationDate: string;
    registrar: any;
}

export interface SimRecoveryFilter {
    page: number;
    size: number;
    startDate: string;
    endDate: string;
    msisdn: string;
    registrarMsisdn: string;
    ban: string;
    webRegistrar: string;
}