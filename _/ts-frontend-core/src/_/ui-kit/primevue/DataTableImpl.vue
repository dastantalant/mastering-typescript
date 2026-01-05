<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Toolbar from 'primevue/toolbar';
import type { TableState } from "@/_/core/table/TableTypes.ts";
import type { TableConfig } from "@/_/schema/table.schema.ts";

const props = defineProps<{
  state: TableState<any>;
  config: TableConfig<any>;
}>();

const emit = defineEmits(['page', 'sort', 'filter', 'action']);

const onPage = (e: any) => emit('page', e.page);
const onSort = (e: any) => emit('sort', e.sortField, e.sortOrder);

const onToolbarClick = (actionKey: string) => emit('action', actionKey, null);
</script>

<template>
  <div class="card">
    <Toolbar v-if="config.toolbar" class="mb-4">
      <template #start>
        <div class="text-xl font-bold">{{ config.title }}</div>
      </template>
      <template #end>
        <div class="flex gap-2">
          <Button
              v-for="btn in config.toolbar"
              :key="btn.action"
              :label="btn.label"
              :icon="btn.icon"
              :severity="btn.variant as any || 'secondary'"
              @click="onToolbarClick(btn.action)"
          />
        </div>
      </template>
    </Toolbar>

    <DataTable
        :value="state.items"
        :loading="state.loading"
        :totalRecords="state.total"
        :rows="state.size"
        :first="state.page * state.size"
        lazy
        paginator
        :dataKey="config.dataKey"
        @page="onPage"
        @sort="onSort"
        tableStyle="min-width: 50rem"
    >
      <template #empty>Нет данных</template>

      <Column
          v-for="col in config.columns"
          :key="col.field"
          :field="col.field"
          :header="col.header"
          :sortable="col.sortable"
          :style="col.style"
          :frozen="col.pin === 'left' || col.pin === 'right'"
          :alignFrozen="col.pin"
      >
        <template #body="{ data }">
          <div v-if="col.renderer?.type === 'actions'" class="flex gap-1">
            <template v-for="act in col.renderer.actions" :key="act.action">
              <Button
                  v-if="!act.isVisible || (typeof act.isVisible === 'function' ? act.isVisible(data) : true)"
                  :icon="act.icon"
                  :severity="act.severity as any"
                  text rounded
                  @click="emit('action', act.action, data)"
              />
            </template>
          </div>
          <span v-else>
                        <slot :name="col.field" :data="data">
                            {{ data[col.field] }}
                        </slot>
                    </span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
