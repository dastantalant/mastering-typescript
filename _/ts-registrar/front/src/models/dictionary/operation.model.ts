import {OperationStatisticsProcessor, OperationType, type Organization} from "./operation-config.model.ts";

export interface Operation {
    id: number;
    name: string;
    type: OperationType;
    statisticsProcessor: OperationStatisticsProcessor;
    organization: Organization;
}