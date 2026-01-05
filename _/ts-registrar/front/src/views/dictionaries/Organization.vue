<script setup>
import {FilterMatchMode} from '@primevue/core/api';
import {useToast} from 'primevue/usetoast';
import {onMounted, ref} from 'vue';
import OrganizationService from '../../services/dictionary/organization.service.ts';
import EntityChanges from '../../components/EntityChanges.vue';

const toast = useToast();
const dt = ref();
const organizations = ref();
const providers = ref();
const organizationDialog = ref(false);
const deleteOrganizationDialog = ref(false);
const organization = ref({});
const filters = ref({
  global: {value: null, matchMode: FilterMatchMode.CONTAINS}
});
const submitted = ref(false);
const entityChangesDialog = ref(false);
const entityChanges = ref();
const loadingEntityChangesId = ref(null);
const organizationService = new OrganizationService();

onMounted(() => {
  findAll();

  organizationService.findProviders().then((data) => (providers.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
});

function findAll() {
  organizationService.findAll().then((data) => (organizations.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function openNew() {
  organization.value = {};
  submitted.value = false;
  organizationDialog.value = true;
}

function hideDialog() {
  organizationDialog.value = false;
  submitted.value = false;
}

function saveOrganization() {
  submitted.value = true;

  if (organization?.value.name?.trim()) {
    organizationService
        .save(organization.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Организация ' + name + ' сохранена',
            life: 3000
          });
          findAll();
          organizationDialog.value = false;
          organization.value = {};
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

function editOrganization(org) {
  organization.value = {...org};
  organizationDialog.value = true;
}

function confirmDeleteOrganization(org) {
  organization.value = org;
  deleteOrganizationDialog.value = true;
}

function deleteOrganization() {
  organizationService
      .delete(organization.value.id)
      .then(() => {
        organizations.value = organizations.value.filter((val) => val.id !== organization.value.id);
        deleteOrganizationDialog.value = false;
        organization.value = {};
        toast.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Организация удалена',
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
    entityChanges.value = await organizationService.findHistoryById(reason.id);
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
          :value="organizations"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Показано с {first} по {last} из {totalRecords} организаций"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Управление Организациями</h4>
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
        <Column field="code" header="Код" sortable style="min-width: 10rem"></Column>
        <Column :exportable="false" style="min-width: 16rem">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editOrganization(slotProps.data)"
                    v-tooltip="'Редактировать'"/>
            <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2"
                    @click="confirmDeleteOrganization(slotProps.data)"
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

    <Dialog v-model:visible="organizationDialog" :style="{ width: '450px' }" header="Детали Организации" :modal="true">
      <div class="flex flex-col gap-6">
        <div>
          <label for="name" class="block font-bold mb-3">Наименование</label>
          <InputText id="name" v-model.trim="organization.name" required="true" autofocus
                     :invalid="submitted && !organization.name" fluid/>
          <small v-if="submitted && !organization.name" class="text-red-500">Name is required.</small>
        </div>

        <div>
          <span class="block font-bold mb-4">Код</span>
          <div class="grid grid-cols-12 gap-4">
            <div class="flex items-center gap-2 col-span-6" v-for="provider of providers">
              <RadioButton v-model="organization.code" name="provider" :value="provider"/>
              <label>{{ provider }}</label>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideDialog"/>
        <Button label="Сохранить" icon="pi pi-check" @click="saveOrganization"/>
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteOrganizationDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl"/>
        <span v-if="organization"
        >Вы точно хотите удалить организацию <b>{{ organization.name }}</b
        >?</span
        >
      </div>
      <template #footer>
        <Button label="Нет" icon="pi pi-times" text @click="deleteOrganizationDialog = false"/>
        <Button label="Да" icon="pi pi-check" @click="deleteOrganization"/>
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
