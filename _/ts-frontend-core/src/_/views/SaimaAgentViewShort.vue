<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {useToast} from 'primevue/usetoast';

import DataTableComponent from '@/_/components/datatable/DataTableComponent.vue';
import DataEditorDialog from "@/_/components/DataEditorDialog.vue";
import AuditEventHistory from "@/_/components/AuditEventHistory.vue";
import EntityChanges from "@/_/components/EntityChanges.vue";

import type {DataTableComponentInstance} from '@/_/components/datatable.types.ts';
import type {ShortSaimaAgentDTO} from "@/_/models/saima-agent.model.ts";
import DurationUtil from "@/_/utils/duration.ts";

import {useDictionary} from '@/composables/useDictionary';
import {useHistoryDialogs} from '@/composables/useHistoryDialogs';
import {usePassportData} from '@/composables/usePassportData';
import {useSaimaAgentDialog} from "@/composables/useSaimaAgentDialog";
import {useSaimaAgentDataTable} from "@/composables/useSaimaAgentDataTable";

const toast = useToast();
const durationUtil = new DurationUtil();
const dataEditorDialogRef = ref<InstanceType<typeof DataEditorDialog> | null>(null);
const tableDataTableRef = ref<DataTableComponentInstance | null>(null);

const {
  tableIsDataReady,
  saimaState,
  saimaStateMap,
  saimaPhotoTypes,
  documentType,
  saimaSubEditData,
  tariffs,
  routers,
  consoles,
  saimaTemplateCategory,
  saimaTemplate,
  saimaTemplateMap,
  photoTypesMap,
  channels,
  regions,
  fetchDictionary
} = useDictionary();

const {
  dialogEventHistoryFlag,
  dialogEntityChangesFlag,
  entityChangesList,
  dialogEventHistorySaimaAgentId,
  openOldHistoryDialog,
  openHistoryDialog,
  hideHistoryDialog
} = useHistoryDialogs(toast);

const {
  isPassportConfirmDialogVisible,
  passportDataToConfirm,
  generatePassportMessage,
  applyPassportData,
  fetchAndConfirmPassportData,
  isFetchingPassportData
} = usePassportData(dataEditorDialogRef, toast);

const {
  dialogVisible,
  dialogLoading,
  dialogMessage,
  dialogSaimaAgentModel,
  dialogConfig,
  openDialog,
  dialogHandleSave
} = useSaimaAgentDialog({
  dictionaries: {
    saimaState,
    saimaPhotoTypes,
    documentType,
    saimaSubEditData,
    tariffs,
    routers,
    consoles,
    saimaTemplateCategory,
    saimaTemplate,
    saimaTemplateMap,
    regions
  },
  services: {
    toast,
    fetchAndConfirmPassportData
  },
  refs: {
    isFetchingPassportData,
    tableDataTableRef,
    photoTypesMap
  },
  callbacks: {
    openHistoryDialog,
    openOldHistoryDialog
  }
});

const {
  tableConfig,
  fetchData,
  exportData,
} = useSaimaAgentDataTable({
  dictionaries: {
    saimaState, saimaStateMap, channels, regions
  },
  services: {toast, durationUtil},
  callbacks: {
    openDialog, openHistoryDialog, openOldHistoryDialog
  }
});

onMounted(async () => {
  await fetchDictionary();
});

const handleRowClick = (agentData: ShortSaimaAgentDTO) => {
  openDialog(agentData);
};

const handleActionClick = (payload: { actionId: string; data: ShortSaimaAgentDTO }) => {
  const {actionId, data} = payload;
  switch (actionId) {
    case 'view':
      openDialog(data);
      break;
    case 'history':
      openHistoryDialog(data);
      break;
    case 'old-history':
      openOldHistoryDialog(data);
      break;
  }
};
</script>

<template>
  <div class="layout-main-full">
    <!-- Passport Confirmation Dialog -->
    <Dialog v-model:visible="isPassportConfirmDialogVisible"
            header="Получены данные паспорта"
            :modal="true"
            :style="{ width: '50vw', maxWidth: '600px' }">
      <div v-if="passportDataToConfirm">
        <div class="passport-confirm-data" v-html="generatePassportMessage(passportDataToConfirm)"></div>
        <br>
        <p>Применить эти данные к форме?</p>
      </div>
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" @click="isPassportConfirmDialogVisible = false" class="p-button-text"/>
        <Button label="Применить" icon="pi pi-check" @click="applyPassportData" autofocus/>
      </template>
    </Dialog>

    <!-- Main Data Table -->
    <DataTableComponent
        v-if="tableIsDataReady"
        ref="tableDataTableRef"
        :config="tableConfig"
        :fetch-data="fetchData"
        :export-data="exportData"
        @row-click="handleRowClick"
        @action-click="handleActionClick"
    />
    <div v-else>
      <Skeleton width="100%" height="40rem"></Skeleton>
    </div>

    <!-- Saima Agent Editor Dialog -->
    <DataEditorDialog
        ref="dataEditorDialogRef"
        :visible="dialogVisible"
        :loading="dialogLoading"
        :topMessage="dialogMessage"
        :initialData="dialogSaimaAgentModel"
        :config="dialogConfig"
        @update:visible="dialogVisible = $event"
        @save="dialogHandleSave"
        @cancel="dialogVisible = false"
    />

    <!-- Old History Dialog -->
    <Dialog v-model:visible="dialogEventHistoryFlag" :style="{ width: '950px' }"
            header="История изменений (Старая!)"
            :modal="true">
      <AuditEventHistory :row-id="dialogEventHistorySaimaAgentId" table-name="saima_agent"/>
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideHistoryDialog"/>
      </template>
    </Dialog>

    <!-- New History Dialog -->
    <Dialog v-model:visible="dialogEntityChangesFlag"
            :style="{ width: '1450px' }"
            header="История изменений"
            :modal="true">
      <EntityChanges :events="entityChangesList"/>
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideHistoryDialog"/>
      </template>
    </Dialog>
  </div>
</template>

<style>
.layout-main-full {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-main-full .card {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.p-datatable-scrollable-body {
  flex-grow: 1;
}
</style>
