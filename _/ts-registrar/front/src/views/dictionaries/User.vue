
<script setup lang="ts">
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import UserService from '../../services/dictionary/user.service.ts';
import type {User} from "@/models/dictionary/user.model.js";
import OrganizationService from '../../services/dictionary/organization.service.ts';
import RoleService from '../../services/dictionary/role.service.ts';
import RegionsService from '../../services/dictionary/region.service.ts';
import PositionService from '../../services/dictionary/position.service.ts';
import EntityChanges from '../../components/EntityChanges.vue';


const toast = useToast();
const dt = ref();
const users = ref();
const organizations = ref();
const roles = ref();
const regions = ref();
const positions = ref();
const rolesByOrganization = ref();
const userDialog = ref(false);
const deleteUserDialog = ref(false);
const user = ref({} as User);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

const userService = new UserService();
const organizationService = new OrganizationService();
const roleService = new RoleService();
const regionsService = new RegionsService();
const positionService = new PositionService();
const entityChangesDialog = ref(false);
const entityChanges = ref();
const loadingEntityChangesId = ref(null);
const statuses = ref(['ACTIVE', 'INACTIVE']);
onMounted(() => {
  findAll();
  findAllOrganizations();
  findAllRoles();
  findAllRegions();
  findAllPositions();

});

function findAll(){
  userService.findAll().then((data) => (users.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function findAllOrganizations(){
  organizationService.findAll().then((data) => (organizations.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function findAllRoles(){
  roleService.findAll().then((data) => (roles.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function findAllRegions(){
  regionsService.findAll().then((data) => (regions.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function findAllPositions(){
  positionService.findAll().then((data) => (positions.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function toggleRole() {
  rolesByOrganization.value = roles.value.filter(item =>
      user.value.organizations.some(secondItem => secondItem.id === item.organizationId)
  );
}

function openNew() {
    user.value = {};
    submitted.value = false;
    userDialog.value = true;
}

function hideDialog() {
    userDialog.value = false;
    submitted.value = false;
}

function saveUser() {
    submitted.value = true;
    if (user?.value.username?.trim()) {
      userService
            .save(user.value)
            .then(() => {
              toast.add({
                severity: 'success',
                summary: 'Успешно',
                detail: 'Пользователь ' + user.value.username + ' сохранен',
                life: 3000
              });
              findAll();
              userDialog.value = false;
              user.value = {};
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

function editUser(usr) {
    user.value = { ...usr };
    toggleRole();
    userDialog.value = true;
}

function confirmDeleteUser(usr) {
    user.value = usr;
    deleteUserDialog.value = true;
}

function deleteUser() {
  userService
        .delete(user.value.id)
        .then(() => {
          users.value = users.value.filter((val) => val.id !== user.value.id);
          deleteUserDialog.value = false;
          user.value = {};
          toast.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Пользователь удален',
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

function getStatusLabel(status) {
  switch (status) {
    case 'ACTIVE':
      return 'success';

    case 'INACTIVE':
      return 'danger';

    default:
      return null;
  }
}

async function viewEntityChangesHistory(reason) {
  loadingEntityChangesId.value = reason.id;
  try {
    entityChanges.value = await userService.findHistoryById(reason.id);
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
                    <Button label="Создать" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                :value="users"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Показано с {first} по {last} из {totalRecords} пользователей"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Управление Пользователями</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Поиск..." />
                        </IconField>
                    </div>
                </template>

                <Column field="id" header="ID" sortable style="min-width: 12rem"></Column>
                <Column field="username" header="Наименование" sortable style="min-width: 16rem"></Column>
                <Column field="fullName" header="ФИО" sortable style="min-width: 16rem"></Column>
                <Column field="role.name" header="Роль" sortable style="min-width: 16rem"></Column>
                <Column field="userStatus" header="Статус" sortable style="min-width: 12rem">
                  <template #body="slotProps">
                    <Tag :value="slotProps.data.userStatus" :severity="getStatusLabel(slotProps.data.userStatus)" />
                  </template>
                </Column>
                <Column :exportable="false" style="min-width: 16rem">
                  <template #body="slotProps">
                    <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editUser(slotProps.data)" v-tooltip="'Редактировать'"/>
                    <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2"
                            @click="confirmDeleteUser(slotProps.data)" v-tooltip="'Удалить'"/>
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

        <Dialog v-model:visible="userDialog" :style="{ width: '450px' }" header="Детали Пользователя" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="name" class="block font-bold mb-3">Имя пользователя</label>
                    <InputText id="name" v-model.trim="user.username" required="true" autofocus :invalid="submitted && !user.username" fluid />
                    <small v-if="submitted && !user.username" class="text-red-500">Имя пользователя обязательное.</small>
                </div>
                <div>
                    <label for="fullName" class="block font-bold mb-3">Пароль</label>
                    <Password id="fullName" v-model.trim="user.password" autofocus fluid />
                    <small class="text-black-500">Не заполнять для сотрудников НУР Телеком</small>
                </div>
                <div>
                  <label for="fullName" class="block font-bold mb-3">ФИО</label>
                  <InputText id="fullName" v-model.trim="user.fullName" required="true" autofocus :invalid="submitted && !user.fullName" fluid />
                  <small v-if="submitted && !user.fullName" class="text-red-500">ФИО пользователя обязательное.</small>
                </div>
                <div class="flex flex-col gap-1">
                  <label for="organization" class="block font-bold mb-3">Организации</label>
                  <MultiSelect v-model="user.organizations" :options="organizations" name="organization" optionLabel="name" filter placeholder="Организации"
                              class="w-full" @change="toggleRole()" />
                </div>
                <div>
                  <label for="role" class="block font-bold mb-3">Роль</label>
                  <Select v-model="user.role" :options="rolesByOrganization" option optionLabel="name" placeholder="Роль" emptyMessage="У выбранной организации нет ролей" class="w-full" />
                </div>
                <div>
                  <label for="region" class="block font-bold mb-3">Регион</label>
                  <Select v-model="user.region" :options="regions" option optionLabel="name" placeholder="Регион" class="w-full" />
                </div>
                <div>
                  <label for="factAddress" class="block font-bold mb-3">Фактический адрес</label>
                  <InputText id="factAddress" v-model.trim="user.factAddress" autofocus  fluid />
                </div>
                <div>
                  <label for="mobileNumber" class="block font-bold mb-3">Рабочий номер</label>
                  <InputNumber id="mobileNumber" v-model.trim="user.mobileNumber" required="true" autofocus :invalid="submitted && !user.mobileNumber" fluid />
                  <small v-if="submitted && !user.mobileNumber" class="text-red-500">Рабочий номер обязательное.</small>
                </div>
                <div>
                  <label for="position" class="block font-bold mb-3">Должность</label>
                  <Select v-model="user.position" :options="positions" option optionLabel="name" placeholder="Должность" class="w-full" />
                </div>
                <div>
                  <label for="userStatus" class="block font-bold mb-3">Статус</label>
                  <Select id="userStatus" v-model="user.userStatus" :options="statuses" placeholder="Статус" fluid></Select>
                </div>

            </div>

            <template #footer>
                <Button label="Отмена" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Сохранить" icon="pi pi-check" @click="saveUser" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteUserDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="user"
                    >Вы точно хотите удалить пользователя <b>{{ user.username }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="Нет" icon="pi pi-times" text @click="deleteUserDialog = false" />
                <Button label="Да" icon="pi pi-check" @click="deleteUser" />
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
