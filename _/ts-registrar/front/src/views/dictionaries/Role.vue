<script setup lang="ts">
import {FilterMatchMode} from '@primevue/core/api';
import {useToast} from 'primevue/usetoast';
import {onMounted, ref} from 'vue';
import RoleService from '../../services/dictionary/role.service.ts';
import OrganizationService from '../../services/dictionary/organization.service.ts';
import PermissionService from '../../services/dictionary/permission.service.ts';
import type {Role} from "@/models/dictionary/role.model.js";
import EntityChanges from '../../components/EntityChanges.vue';

const toast = useToast();
const dt = ref();
const roles = ref();
const organizations = ref();
const permissions = ref();
const selectedPermissions = ref(null);
const roleDialog = ref(false);
const deleteRoleDialog = ref(false);
const role = ref({} as Role);
const filters = ref({
  global: {value: null, matchMode: FilterMatchMode.CONTAINS}
});
const submitted = ref(false);

const roleService = new RoleService();
const organizationService = new OrganizationService();
const permissionService = new PermissionService();
const entityChangesDialog = ref(false);
const entityChanges = ref();
const loadingEntityChangesId = ref(null);

onMounted(() => {
  findAll();
  findAllOrganizations();
  findAllPermission();
});

function findAll() {
  roleService.findAll().then((data) => (roles.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function findAllOrganizations() {
  organizationService.findAll().then((data) => (organizations.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function findAllPermission() {
  permissionService.findAll().then((data) => (permissions.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function openNew() {
  role.value = {};
  selectedPermissions.value = null;
  submitted.value = false;
  roleDialog.value = true;
}

function hideDialog() {
  selectedPermissions.value = null;
  roleDialog.value = false;
  submitted.value = false;
}

function saveRole() {
  submitted.value = true;
  if (role?.value.name?.trim()) {
    roleService
        .save(role.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Роль ' + role.value.name + ' сохранена',
            life: 3000
          });
          findAll();
          roleDialog.value = false;
          role.value = {};
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

function editRole(org) {
  role.value = {...org};
  selectedPermissions.value = role.value.checkedPermission;
  roleDialog.value = true;
}

function confirmDeleteRole(org) {
  role.value = org;
  deleteRoleDialog.value = true;
}

function deleteRole() {
  roleService
      .delete(role.value.id)
      .then(() => {
        roles.value = roles.value.filter((val) => val.id !== role.value.id);
        deleteRoleDialog.value = false;
        role.value = {};
        toast.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Роль удалена',
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
    entityChanges.value = await roleService.findHistoryById(reason.id);
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
          :value="roles"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Показано с {first} по {last} из {totalRecords} ролей"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Управление Ролями</h4>
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
        <Column field="code" header="Организация" sortable style="min-width: 10rem"></Column>
        <Column :exportable="false" style="min-width: 16em">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editRole(slotProps.data)"
                    v-tooltip="'Редактировать'"/>
            <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2"
                    @click="confirmDeleteRole(slotProps.data)"
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

    <Dialog v-model:visible="roleDialog" :style="{ width: '450px' }" header="Детали Роли" :modal="true">
      <div class="flex flex-col gap-6">
        <div>
          <label for="name" class="block font-bold mb-3">Наименование</label>
          <InputText id="name" v-model.trim="role.name" required="true" autofocus :invalid="submitted && !role.name"
                     fluid/>
          <small v-if="submitted && !role.name" class="text-red-500">Наименование обязательное.</small>
        </div>
        <div>
          <label for="name" class="block font-bold mb-3">Организация</label>
          <Select v-model="role.organization" :options="organizations" option optionLabel="name"
                  placeholder="Организация" class="w-full"/>
        </div>
        <div>
          <TreeSelect v-model="role.checkedPermission" :options="permissions" selectionMode="checkbox"
                      placeholder="Права доступа" class=" w-full"/>
        </div>


      </div>

      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideDialog"/>
        <Button label="Сохранить" icon="pi pi-check" @click="saveRole"/>
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteRoleDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl"/>
        <span v-if="role"
        >Вы точно хотите удалить роль <b>{{ role.name }}</b
        >?</span
        >
      </div>
      <template #footer>
        <Button label="Нет" icon="pi pi-times" text @click="deleteRoleDialog = false"/>
        <Button label="Да" icon="pi pi-check" @click="deleteRole"/>
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
