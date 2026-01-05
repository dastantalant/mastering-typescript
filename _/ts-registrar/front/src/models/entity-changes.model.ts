export interface EntityChangesModel {
    id: string;
    action: string;
    originalId: number;
    entity: string;
    newValue: string;
    createdBy: string;
    cts: Date;
}