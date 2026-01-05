<script setup lang="ts">
import {FilterMatchMode} from '@primevue/core/api';
import {useToast} from 'primevue/usetoast';
import {onMounted, ref} from 'vue';
import ConnectionDataService from '../../services/dictionary/connection-data.service.ts';
import type {ConnectionData} from "@/models/dictionary/connection-data.model.js";
import EnumsService from "@/services/enums.service.ts";

import EntityChanges from '../../components/EntityChanges.vue';
const toast = useToast();
const dt = ref();
const connectionDatas = ref();
const types = ref();
const connectionDataDialog = ref(false);
const deleteConnectionDataDialog = ref(false);
const connectionData = ref({} as ConnectionData);
const filters = ref({
  global: {value: null, matchMode: FilterMatchMode.CONTAINS}
});
const submitted = ref(false);
const entityChangesDialog = ref(false);
const entityChanges = ref();
const loadingEntityChangesId = ref(null);

const connectionDataService = new ConnectionDataService();
const enumsService = new EnumsService();

onMounted(() => {
  findAll();
  findAllConnectionDataTypes();
});

function findAll() {
  connectionDataService.findAll().then((data) => (connectionDatas.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function findAllConnectionDataTypes() {
  enumsService.findAllConnectionDataTypes().then((data) => (types.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка видов',
      detail: error,
      life: 5000
    });
  });
}

function openNew() {
  connectionData.value = {};
  submitted.value = false;
  connectionDataDialog.value = true;
}

function hideDialog() {
  connectionDataDialog.value = false;
  submitted.value = false;
}

function save() {
  submitted.value = true;
  if (connectionData?.value.name?.trim()) {
    connectionData.value.type = connectionData.value.typeModel.value ?
        connectionData.value.typeModel.value : connectionData.value.typeModel;

    connectionDataService
        .save(connectionData.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Данные ' + connectionData.value.name + ' сохранены',
            life: 3000
          });
          findAll();
          connectionDataDialog.value = false;
          connectionData.value = {};
        }).catch((error) => {
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: error,
        life: 5000
      });
    });
  }
}

function edit(cd) {
  connectionData.value = {...cd};
  if (connectionData.value.type)
    for (const element of types.value) {
      if (element.value === connectionData.value.type) {
        connectionData.value.typeModel = element;
        break;
      }
    }
  connectionDataDialog.value = true;
}

function confirmDelete(cd) {
  connectionData.value = cd;
  deleteConnectionDataDialog.value = true;
}

function deleteConnectionData() {
  connectionDataService
      .delete(connectionData.value.id)
      .then(() => {
        connectionDatas.value = connectionDatas.value.filter((val) => val.id !== connectionData.value.id);
        deleteConnectionDataDialog.value = false;
        connectionData.value = {};
        toast.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Данные удалены',
          life: 3000
        });
      }).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });

}

function exportCSV() {
  dt.value.exportCSV();
}

async function viewEntityChangesHistory(reason) {
  loadingEntityChangesId.value = reason.id;
  try {
    entityChanges.value = await connectionDataService.findHistoryById(reason.id);
    entityChangesDialog.value = true;
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка загрузки истории',
      detail: error,
      life: 5000
    });
  } finally {
    loadingEntityChangesId.value = null;
  }
}

function hideDialogEntityChanges() {
  entityChanges.value = {};
  entityChangesDialog.value = false;
}
</script>

<template>
  <div class="layout-main">
    <div class="card">
      <Toolbar class="mb-6">
        <template #start>
          <Button label="Создать" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew"/>
        </template>

        <template #end>
          <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)"/>
        </template>
      </Toolbar>

      <DataTable
          ref="dt"
          :value="connectionDatas"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Показано с {first} по {last} из {totalRecords} данных"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Управление Данными подключения Saima</h4>
            <IconField>
              <InputIcon>
                <i class="pi pi-search"/>
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Поиск..."/>
            </IconField>
          </div>
        </template>

        <Column field="id" header="ID" sortable style="min-width: 12rem"></Column>
        <Column field="name" header="Наименование" sortable style="min-width: 16rem"></Column>
        <Column field="typeName" header="Вид" sortable style="min-width: 16rem"></Column>
        <Column field="description" header="Описание" sortable style="min-width: 16rem"></Column>
        <Column field="price" header="Цена" sortable style="min-width: 16rem"></Column>
        <Column field="activeStatus" header="Статус" sortable style="min-width: 12rem">
          <template #body="slotProps">
            <i v-if="slotProps.data" class="pi"
               :class="{ 'pi-check-circle text-green-500 ': slotProps.data.activeStatus, 'pi-times-circle text-red-500': !slotProps.data.activeStatus }"></i>
          </template>

        </Column>
        <Column :exportable="false" style="min-width: 16rem">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="edit(slotProps.data)"
                    v-tooltip="'Редактировать'"/>
            <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2"
                    @click="confirmDelete(slotProps.data)"
                    v-tooltip="'Удалить'"/>
            <Button :icon="loadingEntityChangesId === slotProps.data.id ? 'pi pi-spin pi-spinner' : 'pi pi-history'"
                    outlined rounded
                    @click="viewEntityChangesHistory(slotProps.data)"
                    severity="help"
                    v-tooltip="'История изменений'"
                    :loading="loadingEntityChangesId === slotProps.data.id"/>
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="connectionDataDialog" :style="{ width: '450px' }" header="Детали данных подключения"
            :modal="true">
      <div class="flex flex-col gap-6">
        <div>
          <label for="name" class="block font-bold mb-3">Наименование</label>
          <InputText id="name" v-model.trim="connectionData.name" required="true" autofocus
                     :invalid="submitted && !connectionData.name" fluid/>
          <small v-if="submitted && !connectionData.name" class="text-red-500">Наименование обязательное.</small>
        </div>
        <div>
          <label for="type" class="block font-bold mb-3">Вид</label>
          <Select v-model="connectionData.typeModel" :options="types" option optionLabel="name"
                  placeholder="Вид" class="w-full" :invalid="submitted && !connectionData.type"/>
          <small v-if="submitted && !connectionData.type" class="text-red-500">Вид обязателен.</small>
        </div>
        <div>
          <label for="description" class="block font-bold mb-3">Описание</label>
          <InputText id="description" v-model.trim="connectionData.description" required="true" autofocus
                     :invalid="submitted && !connectionData.description" fluid/>
          <small v-if="submitted && !connectionData.description" class="text-red-500">Описание обязательное.</small>
        </div>
        <div>
          <label for="price" class="block font-bold mb-3">Цена</label>
          <InputText id="price" v-model.trim="connectionData.price" required="true" autofocus
                     :invalid="submitted && !connectionData.price" fluid/>
          <small v-if="submitted && !connectionData.price" class="text-red-500">Цена обязательна.</small>
        </div>
        <div class="flex items-center gap-2">
          <ToggleSwitch v-model="connectionData.activeStatus" name="blocked"/>
          <label for="blocked"> Статус </label>
        </div>
      </div>

      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideDialog"/>
        <Button label="Сохранить" icon="pi pi-check" @click="save"/>
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteConnectionDataDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl"/>
        <span v-if="connectionData"
        >Вы точно хотите удалить данные <b>{{ connectionData.name }}</b
        >?</span
        >
      </div>
      <template #footer>
        <Button label="Нет" icon="pi pi-times" text @click="deleteConnectionDataDialog = false"/>
        <Button label="Да" icon="pi pi-check" @click="deleteConnectionData"/>
      </template>
    </Dialog>

    <Dialog v-model:visible="entityChangesDialog" :style="{ width: '1450px' }" header="История изменений"
            :modal="true">
      <EntityChanges :events="entityChanges"/>
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideDialogEntityChanges"/>
      </template>
    </Dialog>

  </div>
</template>
