<script lang="ts">
import {ref, defineComponent, onMounted} from "vue";
import type {AuditEventHistoryModel} from "@/models/audit-event-history.model.ts";
import AuditEventHistoryService from "@/services/audit-event-history.sevice.ts";
import {useToast} from "primevue/usetoast";

export default defineComponent({
  props: {
    tableName: String,
    rowId: Number,
  },
  setup(props, {emit}) {
    const toast = useToast();

    const events = ref<AuditEventHistoryModel[]>([]);

    const auditEventHistoryService = new AuditEventHistoryService();

    onMounted(() => {
      getHistory();
    });

    const getHistory = () => {
      auditEventHistoryService.getHistory(props.tableName, props.rowId).then((data) => (events.value = data)).catch((error) => {
        toast.add({
          severity: 'error',
          summary: 'Ошибка истории',
          detail: error,
          life: 5000
        });
      });
    };
    return {
      events,
    }
  }
})
</script>

<template>
  <DataTable :value="events" tableStyle="min-width: 50rem">
    <Column field="id" header="id"></Column>
    <Column field="initiator" header="Логин"></Column>
    <Column field="recordId" header="ID записи"></Column>
    <Column field="createdDate" header="Дата создания"></Column>
    <Column field="action" header="Действие"></Column>
    <Column field="status" header="Статус"></Column>
  </DataTable>
</template>

<style scoped>

</style>