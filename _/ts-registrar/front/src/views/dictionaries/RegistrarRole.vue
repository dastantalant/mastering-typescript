<script setup lang="ts">
import {FilterMatchMode} from '@primevue/core/api';
import {useToast} from 'primevue/usetoast';
import {onMounted, ref} from 'vue';
import RegistrarRoleService from '../../services/dictionary/registrar-role.service.ts';
import OrganizationService from '../../services/dictionary/organization.service.ts';
import EnumsService from '../../services/enums.service.js';
import type {RegistrarRole} from "@/models/dictionary/registrar-role.model.js";
import OrganizationChannelTypeService from '../../services/dictionary/organizationChannelType.service.ts';
import EntityChanges from '../../components/EntityChanges.vue';

const toast = useToast();
const dt = ref();
const roles = ref();
const organizations = ref();
const mobileTabs = ref();
const channels = ref();
const roleDialog = ref(false);
const deleteRoleDialog = ref(false);
const role = ref({} as RegistrarRole);
const filters = ref({
  global: {value: null, matchMode: FilterMatchMode.CONTAINS}
});
const submitted = ref(false);
const entityChangesDialog = ref(false);
const entityChanges = ref();
const loadingEntityChangesId = ref(null);

const registrarRoleService = new RegistrarRoleService();
const organizationService = new OrganizationService();
const organizationChannelTypeService = new OrganizationChannelTypeService();
const enumsService = new EnumsService();

onMounted(() => {
  findAll();
  findAllOrganizations();
});

function findAll() {
  registrarRoleService.findAll().then((data) => {
    roles.value = data;
    findAllMobileTab();
  }).catch((error) => {
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

function findAllMobileTab() {
  enumsService.findAllMobileTab().then((data) => {
    mobileTabs.value = data


  }).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function findByOrganizationId(organizationId: number) {
  organizationChannelTypeService.findByOrganizationId(organizationId).then((data) => {
    channels.value = data
    if (role.value.channelType)
      for (const element of channels.value) {
        if (element.value === role.value.channelType) {
          role.value.channelTypeModel = element;
          break;
        }
      }
  }).catch((error) => {
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
  submitted.value = false;
  roleDialog.value = true;
}

function hideDialog() {
  roleDialog.value = false;
  submitted.value = false;
}

function saveRole() {
  submitted.value = true;
  if (role?.value.name?.trim()) {
    role.value.channelType = role.value.channelTypeModel.value ?
        role.value.channelTypeModel.value : role.value.channelTypeModel;

    role.value.mobileTabs = [];
    for (const element of role.value.mobileTabsModel)
      role.value.mobileTabs.push(element.value)


    registrarRoleService
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
  findByOrganizationId(org.organization.id);
  role.value = {...org};

  if (role.value.mobileTabs) {
    role.value.mobileTabsModel = [];
    for (let i = 0; i < role.value.mobileTabs.length; i++)
      for (const element of mobileTabs.value)
        if (element.value === role.value.mobileTabs[i]) {
          role.value.mobileTabsModel.push(element);
          break;
        }
  }

  roleDialog.value = true;
}

function confirmDeleteRole(org) {
  role.value = org;
  deleteRoleDialog.value = true;
}

function deleteRole() {
  registrarRoleService
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

function toggleChanel() {
  findByOrganizationId(role.value.organization.id);
}

function exportCSV() {
  dt.value.exportCSV();
}

async function viewEntityChangesHistory(reason) {
  loadingEntityChangesId.value = reason.id;
  try {
    entityChanges.value = await registrarRoleService.findHistoryById(reason.id);
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
            <h4 class="m-0">Управление Ролями Регистраторов</h4>
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
        <Column field="organization.name" header="Организация" sortable style="min-width: 10rem"></Column>
        <Column :exportable="false" style="min-width: 16rem">
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
                  placeholder="Организация" class="w-full" :invalid="submitted && !role.organization"
                  @change="toggleChanel()"/>
          <small v-if="submitted && !role.organization" class="text-red-500">Организация обязательна.</small>

        </div>
        <div>
          <label for="chanel" class="block font-bold mb-3">Канал</label>
          <Select v-model="role.channelTypeModel" :options="channels" option optionLabel="name"
                  placeholder="Канал" class="w-full" :invalid="submitted && !role.channelTypeModel"/>
          <small v-if="submitted && !role.channelTypeModel" class="text-red-500">Канал обязателен.</small>

        </div>
        <div class="flex flex-col gap-1">
          <label for="organization" class="block font-bold mb-3">Вкладки мобильного приложения</label>
          <MultiSelect v-model="role.mobileTabsModel" :options="mobileTabs" name="organization" optionLabel="name"
                       filter
                       placeholder="Вкладки мобильного приложения"
                       class="w-full"/>
        </div>
        <div class="flex items-center gap-2">
          <ToggleSwitch v-model="role.deflt" name="deflt"/>
          <label for="deflt"> Роль по умолчанию </label>
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
