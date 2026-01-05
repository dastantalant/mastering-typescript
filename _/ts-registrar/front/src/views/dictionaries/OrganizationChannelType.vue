<script setup lang="ts">
import {FilterMatchMode} from '@primevue/core/api';
import {useToast} from 'primevue/usetoast';
import {onMounted, ref} from 'vue';
import OrganizationService from '../../services/dictionary/organization.service.ts';
import OrganizationChannelTypeService from '../../services/dictionary/organizationChannelType.service.ts';
import EnumsService from '../../services/enums.service.ts';
import type {OrganizationChannelType} from "@/models/dictionary/organizationChannelType.model.js";
import EntityChanges from '../../components/EntityChanges.vue';

const toast = useToast();
const dt = ref();
const organizationChannelTypes = ref();
const organizations = ref();
const registrarChannels = ref();
const organizationChannelTypeDialog = ref(false);
const deleteOrganizationChannelTypeDialog = ref(false);
const organizationChannelType = ref({} as OrganizationChannelType);
const filters = ref({
  global: {value: null, matchMode: FilterMatchMode.CONTAINS}
});
const submitted = ref(false);

const organizationChannelTypeService = new OrganizationChannelTypeService();
const organizationService = new OrganizationService();
const registrarChannelService = new EnumsService();
const entityChangesDialog = ref(false);
const entityChanges = ref();
const loadingEntityChangesId = ref(null);

onMounted(() => {
  findAll();
  findAllOrganization();
  findAllRegistrarChannel();
});

function findAll() {
  organizationChannelTypeService.findAll().then((data) => (organizationChannelTypes.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function findAllOrganization() {
  organizationService.findAll().then((data) => (organizations.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function findAllRegistrarChannel() {
  registrarChannelService.findAllRegistrarChanel().then((data) => (registrarChannels.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function openNew() {
  organizationChannelType.value = {};
  submitted.value = false;
  organizationChannelTypeDialog.value = true;
}

function hideDialog() {
  organizationChannelTypeDialog.value = false;
  submitted.value = false;
}

function save() {
  submitted.value = true;
  organizationChannelType.value.registrarChannelType = organizationChannelType.value.registrarChannelType.value ?
      organizationChannelType.value.registrarChannelType.value : organizationChannelType.value.registrarChannelType;
  organizationChannelTypeService
      .save(organizationChannelType.value)
      .then(() => {
        toast.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Принадлежность организации к каналу сохранена',
          life: 3000
        });
        findAll();
        organizationChannelTypeDialog.value = false;
        organizationChannelType.value = {};
      }).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function edit(reg) {
  organizationChannelType.value = {...reg};
  organizationChannelTypeDialog.value = true;
}

function confirmDelete(reg) {
  organizationChannelType.value = reg;
  deleteOrganizationChannelTypeDialog.value = true;
}

function deleteRow() {
  organizationChannelTypeService
      .delete(organizationChannelType.value.id)
      .then(() => {
        organizationChannelTypes.value = organizationChannelTypes.value.filter((val) => val.id !== organizationChannelType.value.id);
        deleteOrganizationChannelTypeDialog.value = false;
        organizationChannelType.value = {};
        toast.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Принадлежность организации к каналу удалена',
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
    entityChanges.value = await organizationChannelTypeService.findHistoryById(reason.id);
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
          :value="organizationChannelTypes"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Показано с {first} по {last} из {totalRecords}"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Управление принадлежностью организации к каналу</h4>
            <IconField>
              <InputIcon>
                <i class="pi pi-search"/>
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Поиск..."/>
            </IconField>
          </div>
        </template>

        <Column field="id" header="ID" sortable style="min-width: 12rem"></Column>
        <Column field="organization.name" header="Организация" sortable style="min-width: 16rem"></Column>
        <Column field="registrarChannelTypeValue" header="Канал" sortable style="min-width: 16rem"></Column>
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

    <Dialog v-model:visible="organizationChannelTypeDialog" :style="{ width: '450px' }" header="Детали Региона"
            :modal="true">
      <div class="flex flex-col gap-6">
        <div>
          <label for="name" class="block font-bold mb-3">Организация</label>
          <Select v-model="organizationChannelType.organization" :options="organizations" option optionLabel="name"
                  placeholder="Организация" class="w-full"/>
        </div>
      </div>
      <div class="flex flex-col gap-6">
        <div>
          <label for="name" class="block font-bold mb-3">Каналы</label>
          <Select v-model="organizationChannelType.registrarChannelType" :options="registrarChannels" option
                  optionLabel="name" placeholder="Каналы" class="w-full"/>
        </div>
      </div>

      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideDialog"/>
        <Button label="Сохранить" icon="pi pi-check" @click="save"/>
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteOrganizationChannelTypeDialog" :style="{ width: '450px' }" header="Confirm"
            :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl"/>
        <span v-if="organizationChannelType">Вы точно хотите удалить <b>{{ organizationChannelType.name }}</b>?</span>
      </div>
      <template #footer>
        <Button label="Нет" icon="pi pi-times" text @click="deleteOrganizationChannelTypeDialog = false"/>
        <Button label="Да" icon="pi pi-check" @click="deleteRow"/>
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
