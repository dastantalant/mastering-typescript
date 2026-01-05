<script lang="ts">
import {ref, defineComponent} from "vue";
import type {EntityChangesModel} from "@/_/models/entity-changes.model.ts";

export default defineComponent({
  props: {
    events: ref({} as EntityChangesModel)
  }
})
</script>

<template>
  <DataTable :value="events" tableStyle="min-width: 50rem">
    <Column field="entity" header="Таблица"></Column>
    <Column field="originalId" header="ID записи"></Column>
    <Column field="createdBy" header="Логин"></Column>
    <Column field="cts" header="Дата действия"></Column>
    <Column field="actionName" header="Действие"></Column>
    <Column field="newValue" header="Новое значение"></Column>
  </DataTable>
</template>

<style scoped>

</style>
