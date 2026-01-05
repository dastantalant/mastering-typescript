export interface AuditEventHistoryModel {
    id: number;
    initiator: string;
    createdDate: Date;
    processTime: string;
    content: string;
    action: string;
    tableName: string;
    recordId: number;
    status: string;
}