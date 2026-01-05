import { ref } from 'vue';
import type { ToastServiceMethods } from 'primevue/toastservice';

import SaimaAgentService from "@/services/__test__/saima-agent.service.ts";
import type { EntityChangesModel } from "@/models/entity-changes.model.ts";
type AgentWithId = { id: number };

export function useHistoryDialogs(toast: ToastServiceMethods) {
    const dialogEventHistoryFlag = ref<boolean>(false);
    const dialogEntityChangesFlag = ref<boolean>(false);

    const entityChangesList = ref<EntityChangesModel[]>([]);
    const dialogEventHistorySaimaAgentId = ref<number>();

    const openOldHistoryDialog = (saimaAgent: AgentWithId): void => {
        dialogEventHistorySaimaAgentId.value = saimaAgent.id;
        dialogEventHistoryFlag.value = true;
    };

    const openHistoryDialog = (saimaAgent: AgentWithId): void => {
        SaimaAgentService.getSaimaAgentHistoryById(saimaAgent.id)
            .then((data: EntityChangesModel[]) => {
                entityChangesList.value = data ?? [];
                dialogEntityChangesFlag.value = true;
            })
            .catch((error: any) => {
                console.error("Error loading new history:", error);
                toast.add({
                    severity: 'error',
                    summary: 'Ошибка загрузки Истории',
                    detail: error?.message || 'Не удалось получить данные об изменениях.',
                    life: 5000
                });
            });
    };

    const hideHistoryDialog = (): void => {
        dialogEventHistoryFlag.value = false;
        dialogEntityChangesFlag.value = false;
        entityChangesList.value = [];
        dialogEventHistorySaimaAgentId.value = undefined;
    };

    return {
        dialogEventHistoryFlag,
        dialogEntityChangesFlag,
        entityChangesList,
        dialogEventHistorySaimaAgentId,
        openOldHistoryDialog,
        openHistoryDialog,
        hideHistoryDialog,
    };
}