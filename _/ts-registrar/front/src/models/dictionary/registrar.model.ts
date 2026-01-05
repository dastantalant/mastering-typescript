export interface Registrar {
    id: number;
    organizationName: string;
    organizationId: number;
}


export interface RegistrarFilter{
    page: number;
    size: number;
    msisdn: number;
    fio: string;
    svfio: string;
}