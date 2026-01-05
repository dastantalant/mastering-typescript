import {OperationStatus} from "./operation-config.model.ts";

export interface OperationConfigItem {
    id?: number;
    status: OperationStatus;
    dayRewardPrice: number;
    nightRewardPrice: number;
    requestProcessingTime: number;
}