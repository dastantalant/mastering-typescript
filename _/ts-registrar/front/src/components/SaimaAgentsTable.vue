<script setup lang="ts">
import { TableController } from "@/core/table/TableController";
import { useTable } from "@/adapters/vue/useTable";
import DataTableImpl from "@/ui-kit/primevue/DataTableImpl.vue";
import SaimaAgentService from "@/services/saima-agent.service";
import { FieldType } from "@/schema/ui-types";

const tableConfig = {
  title: "Агенты Saima",
  dataKey: "id",
  toolbar: [
    { label: 'Экспорт', action: 'export', icon: 'pi pi-download', variant: 'success' },
    { label: 'Создать', action: 'create', icon: 'pi pi-plus' }
  ],
  columns: [
    { field: 'id', header: 'ID', sortable: true, style: 'width: 80px' },
    { field: 'fullName', header: 'ФИО', sortable: true },
    { field: 'msisdn', header: 'Телефон' },
    { field: 'state', header: 'Статус' },
    {
      header: 'Действия',
      pin: 'right',
      renderer: {
        type: FieldType.Actions,
        actions: [
          { action: 'edit', icon: 'pi pi-pencil', severity: 'info' },
          { action: 'delete', icon: 'pi pi-trash', severity: 'danger' }
        ]
      }
    }
  ]
};

const controller = new TableController(async (params: any) => {
  const apiFilter = SaimaAgentService.createSaimaAgentFilter(params.filters, params.page, params.size);
  const res = await SaimaAgentService.findAll(apiFilter);
  return { items: res.content, total: res.totalElements };
});

const { state, setPage, setSort, refresh } = useTable(controller);

const handleAction = (cmd: string, data: any) => {
  console.log("Action:", cmd, data);
  if (cmd === 'edit') { /* open dialog */ }
  if (cmd === 'export') { /* exportData(state.value.filters) */ }
};
</script>

<template>
  <DataTableImpl
      :state="state"
      :config="tableConfig"
      @page="setPage"
      @sort="setSort"
      @action="handleAction"
  >
    <template #state="{ data }">
      <Tag :value="data.state" />
    </template>
  </DataTableImpl>
</template>