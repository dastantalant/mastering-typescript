<script setup lang="ts">
import {FilterMatchMode} from '@primevue/core/api';
import {useToast} from 'primevue/usetoast';
import {onMounted, ref} from 'vue';
import MobileVersionService from "@/services/dictionary/mobile-version.service.js";
import type {MobileVersion} from "@/models/dictionary/mobile-version.model.js";
import EnumsService from "@/services/enums.service.ts";
import EntityChanges from '../../components/EntityChanges.vue';

const toast = useToast();
const dt = ref();
const mobileVersions = ref();
const mobileVersionDialog = ref(false);
const deleteMobileVersionDialog = ref(false);
const mobileVersion = ref({} as MobileVersion);
const statuses = ref();
const deviceTypes = ref();
const filters = ref({
  global: {value: null, matchMode: FilterMatchMode.CONTAINS}
});
const submitted = ref(false);

const mobileVersionService = new MobileVersionService();
const enumService = new EnumsService();
const entityChangesDialog = ref(false);
const entityChanges = ref();
const loadingEntityChangesId = ref(null);

onMounted(() => {
  findAll();
  findAllVersionStatuses();
  findAllDeviceTypes();
});

function findAll() {
  mobileVersionService.findAll().then((data) => (mobileVersions.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function findAllVersionStatuses() {
  enumService.findAllVersionStatuses().then((data) => (statuses.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка статусов',
      detail: error,
      life: 5000
    });
  });
}

function findAllDeviceTypes() {
  enumService.findAllDeviceTypes().then((data) => (deviceTypes.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка типов устройств',
      detail: error,
      life: 5000
    });
  });
}

function openNew() {
  mobileVersion.value = {};
  submitted.value = false;
  mobileVersionDialog.value = true;
}

function hideDialog() {
  mobileVersionDialog.value = false;
  submitted.value = false;
}

function saveMobileVersion() {
  submitted.value = true;
  if (mobileVersion?.value.versionNumber?.trim()) {

    mobileVersion.value.status = mobileVersion.value.statusModel.value ?
        mobileVersion.value.statusModel.value : mobileVersion.value.statusModel;

    mobileVersion.value.deviceType = mobileVersion.value.deviceTypeModel.value ?
        mobileVersion.value.deviceTypeModel.value : mobileVersion.value.deviceTypeModel;

    mobileVersionService
        .save(mobileVersion.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Версия ' + mobileVersion.value.versionNumber + ' сохранен',
            life: 3000
          });
          findAll();
          mobileVersionDialog.value = false;
          mobileVersion.value = {};
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

function editMobileVersion(mv) {
  mobileVersion.value = {...mv};
  if (mobileVersion.value.status)
    for (const element of statuses.value) {
      if (element.value === mobileVersion.value.status) {
        mobileVersion.value.statusModel = element;
        break;
      }
    }


  mobileVersion.value.deviceTypeModel = {
    "name": mobileVersion.value.deviceType,
    "value": mobileVersion.value.deviceType
  };
  mobileVersionDialog.value = true;
}

function confirmDeleteMobileVersion(mv) {
  mobileVersion.value = mv;
  deleteMobileVersionDialog.value = true;
}

function deleteMobileVersion() {
  mobileVersionService
      .delete(mobileVersion.value.id)
      .then(() => {
        mobileVersions.value = mobileVersions.value.filter((val) => val.id !== mobileVersion.value.id);
        deleteMobileVersionDialog.value = false;
        mobileVersion.value = {};
        toast.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Версия удален',
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
    entityChanges.value = await mobileVersionService.findHistoryById(reason.id);
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
          :value="mobileVersions"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Показано с {first} по {last} из {totalRecords} версий"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Управление версиями мобильного приложения</h4>
            <IconField>
              <InputIcon>
                <i class="pi pi-search"/>
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Поиск..."/>
            </IconField>
          </div>
        </template>

        <Column field="id" header="ID" sortable style="min-width: 12rem"></Column>
        <Column field="versionNumber" header="Версия" sortable style="min-width: 16rem"></Column>
        <Column field="deviceType" header="Тип устройства" sortable style="min-width: 16rem"></Column>
        <Column field="status" header="Статус" sortable style="min-width: 16rem"></Column>
        <Column field="description" header="Описание" sortable style="min-width: 16rem"></Column>
        <Column :exportable="false" style="min-width: 16rem">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editMobileVersion(slotProps.data)"
                    v-tooltip="'Редактировать'"/>
            <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2"
                    @click="confirmDeleteMobileVersion(slotProps.data)"
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

    <Dialog v-model:visible="mobileVersionDialog" :style="{ width: '450px' }"
            header="Детали версии мобильного приложения" :modal="true">
      <div class="flex flex-col gap-6">
        <div>
          <label for="versionNumber" class="block font-bold mb-3">Версия</label>
          <InputText id="versionNumber" v-model.trim="mobileVersion.versionNumber" required="true" autofocus
                     :invalid="submitted && !mobileVersion.versionNumber" fluid/>
          <small v-if="submitted && !mobileVersion.versionNumber" class="text-red-500">Версия обязательна.</small>
        </div>
        <div>
          <label for="name" class="block font-bold mb-3">Статус</label>
          <Select v-model="mobileVersion.statusModel" :options="statuses" option optionLabel="name"
                  placeholder="Статус" class="w-full" :invalid="submitted && !mobileVersion.status"/>
          <small v-if="submitted && !mobileVersion.status" class="text-red-500">Статус обязателен.</small>
        </div>
        <div>
          <label for="name" class="block font-bold mb-3">Тип устройства</label>
          <Select v-model="mobileVersion.deviceTypeModel" :options="deviceTypes" option optionLabel="name"
                  placeholder="Тип устройства" class="w-full" :invalid="submitted && !mobileVersion.deviceType"/>
          <small v-if="submitted && !mobileVersion.deviceType" class="text-red-500">Тип устройства обязателен.</small>
        </div>
        <div>
          <label for="description" class="block font-bold mb-3">Описание</label>
          <InputText id="description" v-model.trim="mobileVersion.description" fluid/>
        </div>
      </div>

      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideDialog"/>
        <Button label="Сохранить" icon="pi pi-check" @click="saveMobileVersion"/>
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteMobileVersionDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl"/>
        <span v-if="mobileVersion"
        >Вы точно хотите удалить версию <b>{{ mobileVersion.name }}</b
        >?</span
        >
      </div>
      <template #footer>
        <Button label="Нет" icon="pi pi-times" text @click="deleteMobileVersionDialog = false"/>
        <Button label="Да" icon="pi pi-check" @click="deleteMobileVersion"/>
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
