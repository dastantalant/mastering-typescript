<script setup lang="ts">
import {useToast} from 'primevue/usetoast';
import {ref, onMounted} from "vue";
import ProcessedOperationStatisticService from "@/services/statistics/processed-operation-service.ts";



const toast = useToast();
const yearMonth = ref(new Date());
const username = ref('');
const loading = ref(false);
const processedOperations = ref();
const processedOperationStatisticService = new ProcessedOperationStatisticService();
const visibleWebView = ref(false);


onMounted(() => {
  findAuto();
});

function findAuto() {
  loading.value = true;
  processedOperationStatisticService.findAuto(yearMonth.value, username.value).then((data) => {
    processedOperations.value = data;
    loading.value = false;
  }).catch((error) => {
    loading.value = false;
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

const searchUsername = ref('');

function filterUsernameCallback() {
  searchUsername.value = username.value;
  setTimeout(() => {
    if (searchUsername.value === username.value) {
      findAuto();
    }
  }, 1000);
}

function getExcel() {
  processedOperationStatisticService.getExcel(yearMonth.value, username.value).then((data) => {
  }).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

</script>

<template>
  <div class="card">
    <Toolbar class="mb-6">
      <template #end>
        <Button label="Export" icon="pi pi-upload" severity="secondary" @click="getExcel()"/>
        <Button class="ml-1"
                icon="pi pi-question"
                @click="visibleWebView = !visibleWebView"
                severity="info"
                outlined
        />
      </template>
    </Toolbar>

    <DatePicker v-model="yearMonth" view="month" dateFormat="mm-yy"
                @update:modelValue="findAuto()"/>
    <InputText v-model="username" type="text" placeholder="Поиск по имени пользователя"
               @input="filterUsernameCallback()" class="ml-2 mb-2"/>

    <TreeTable :value="processedOperations" sortMode="multiple" selectionMode="single" tableStyle="min-width: 50rem"
               scrollable scrollHeight="1020px">
      <Column field="fullName" header="ФИО" sortable expander style="width: 14%"></Column>
      <Column field="username" header="Имя пользователя" sortable style="width: 13%"></Column>
      <Column field="organizationName" header="Организация" style="width: 23%"></Column>
      <Column field="operationName" header="Операция" style="width: 23%"></Column>
      <Column field="status" header="Статус" style="width: 13%"></Column>
      <Column field="totalOperationTime" header="Время" sortable style="width: 13%"></Column>
      <Column field="operationCount" header="Количество" sortable style="width: 13%"></Column>
      <Column field="operationReward" header="Вознаграждение" sortable style="width: 13%"></Column>
    </TreeTable>
  </div>

</template>

<style scoped>

</style>