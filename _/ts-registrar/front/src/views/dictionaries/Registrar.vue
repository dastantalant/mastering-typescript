<script setup lang="ts">
import {FilterMatchMode} from '@primevue/core/api';
import {useToast} from 'primevue/usetoast';
import {onMounted, ref} from 'vue';
import RegistrarRoleService from '../../services/dictionary/registrar-role.service.ts';
import RegistrarService from '../../services/dictionary/registrar.service.ts';
import OrganizationService from '../../services/dictionary/organization.service.ts';
import RegionService from '../../services/dictionary/region.service.ts';
import EnumsService from "@/services/enums.service.ts";
import type {Registrar, RegistrarFilter} from "@/models/dictionary/registrar.model.js";
import EntityChanges from '../../components/EntityChanges.vue';

const toast = useToast();
const dt = ref();
const langs = ref();
const roles = ref();
const regions = ref();
const rolesByOrganization = ref();
const organizations = ref();
const count = ref();
const loading = ref(false);
const virtualRegistrars = ref<Registrar[]>([]);
const registrarDialog = ref(false);
const deleteRegistrarDialog = ref(false);
const registrar = ref({} as Registrar);
const registrarFilter = ref({ page: 0, size: 20 } as RegistrarFilter);
const filters = ref({
  msisdn: {value: null, matchMode: FilterMatchMode.CONTAINS},
  fio: {value: null, matchMode: FilterMatchMode.CONTAINS},
  svfio: {value: null, matchMode: FilterMatchMode.CONTAINS},
});
const submitted = ref(false);

const registrarService = new RegistrarService();
const registrarRoleService = new RegistrarRoleService();
const organizationService = new OrganizationService();
const regionService = new RegionService();
const enumService = new EnumsService();
const entityChangesDialog = ref(false);
const entityChanges = ref();
const loadingEntityChangesId = ref(null);

onMounted(() => {
  findAllOrganizations();
  findAllRoles();
  findAllRegions();
  findAllLangs();
  findRegistrarsLazy();
});


function findAllOrganizations() {
  organizationService.findAll().then((data) => (organizations.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка Организации',
      detail: error,
      life: 5000
    });
  });
}

function findAllRoles() {
  registrarRoleService.findAll().then((data) => (roles.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка Ролей',
      detail: error,
      life: 5000
    });
  });
}

function findAllRegions() {
  regionService.findAll().then((data) => (regions.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка Регионов',
      detail: error,
      life: 5000
    });
  });
}

function findAllLangs() {
  enumService.findAllLangs().then((data) => (langs.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка Языков',
      detail: error,
      life: 5000
    });
  });
}

function openNew() {
  registrar.value = {};
  submitted.value = false;
  registrarDialog.value = true;
}

function hideDialog() {
  registrarDialog.value = false;
  submitted.value = false;
}


function loadRegistrarsLazy(registrarFilter: RegistrarFilter) {
  loading.value = true;
  virtualRegistrars.value = [];
  registrarService.findAll(registrarFilter).then((data) => {
    virtualRegistrars.value = data.registrars;
    count.value = data.totalCount;
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

function saveRegistrar() {
  submitted.value = true;
  if (registrar?.value.msisdn) {

    registrar.value.lang = registrar.value.langModel.value ?
        registrar.value.langModel.value : registrar.value.langModel;

    registrarService
        .save(registrar.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Регистратор ' + registrar.value.msisdn + ' сохранен',
            life: 3000
          });
          findRegistrarsLazy();
          registrarDialog.value = false;
          registrar.value = {};
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

const searchMsisdn = ref(0);

function filterMsisdnCallback(msisdn: number) {
  searchMsisdn.value = msisdn;
  setTimeout(() => {
    if (searchMsisdn.value === msisdn) {
      registrarFilter.value.msisdn = msisdn;
      findRegistrarsLazy();
    }
  }, 1000);
}

const searchFio = ref("");

function filterFIOCallback(fio: string) {
  searchFio.value = fio;
  setTimeout(() => {
    if (searchFio.value === fio) {
      registrarFilter.value.fio = fio
      findRegistrarsLazy();
    }
  }, 1000);
}

const searchSvFio = ref("");

function filterSvFIOCallback(svfio: string) {
  searchSvFio.value = svfio;
  setTimeout(() => {


    if (searchSvFio.value === svfio) {
      registrarFilter.value.svfio = svfio
      findRegistrarsLazy();
    }
  }, 1000);
}

function onPageChange(page: any) {
  registrarFilter.value.page = page.page;
  registrarFilter.value.size = page.rows;
  findRegistrarsLazy();
}

function findRegistrarsLazy() {
  loadRegistrarsLazy(registrarFilter.value);
}

function onChangeOrganization() {
  registrar.value.registrarRole = {};
  toggleRole();
}

function toggleRole() {
  if (registrar.value.organization)
    rolesByOrganization.value = roles.value.filter(item => registrar.value.organization.id === item.organization.id);
}

function editRegistrar(reg: Registrar) {
  registrar.value = {...reg};
  toggleRole();
  if (registrar.value.lang)
    for (const element of langs.value) {
      if (element.value === registrar.value.lang) {
        registrar.value.langModel = element;
        break;
      }
    }
  registrarDialog.value = true;
}

function deleteRegistrar() {
  registrarService
      .delete(registrar.value.id)
      .then(() => {
        virtualRegistrars.value = virtualRegistrars.value.filter((val) => val.id !== registrar.value.id);
        deleteRegistrarDialog.value = false;
        registrar.value = {};
        toast.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Регистратор удален',
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

function confirmDeleteRegistrar(reg: Registrar) {
  registrar.value = reg;
  deleteRegistrarDialog.value = true;
}

function exportCSV() {
  dt.value.exportCSV();
}

async function viewEntityChangesHistory(reason) {
  if (!reason || !reason.id) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Некорректные данные записи',
      life: 5000
    });
    return;
  }

  loadingEntityChangesId.value = reason.id;
  try {
    entityChanges.value = await registrarService.findHistoryById(reason.id);
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

      <DataTable v-model:filters="filters" filterDisplay="row" ref="dt"
                 :globalFilterFields="['msisdn', 'fio', 'svfio']"
                 :value="virtualRegistrars" tableStyle="min-width: 50rem" :loading="loading"
                 selectionMode="single"
                 scrollable scrollHeight="1020px">
        <template #empty>Данные не найдены</template>
        <template #loading>Данные загружаются</template>
        <Column field="id" header="Id" style="width: 5%; height: 44px">
        </Column>
        <Column field="msisdn" header="Номер" filterField="msisdn" :filter="true" :showFilterMenu="false"
                style="width: 10%; height: 44px">
          <template #filter="{ filterModel }">
            <InputText v-if="filterModel" v-model="filterModel.value" type="number"
                       @input="filterMsisdnCallback(filterModel.value)" placeholder="Поиск по номеру"/>
          </template>
        </Column>
        <Column field="fio" header="ФИО" style="width: 20%; height: 44px" :filter="true" :showFilterMenu="false">
          <template #filter="{ filterModel }">
            <InputText v-if="filterModel" v-model="filterModel.value" type="text" style="width: 100%;"
                       @input="filterFIOCallback(filterModel.value)" placeholder="Поиск по ФИО"/>
          </template>
        </Column>
        <Column field="svfio" header="ФИО супервайзера" style="width: 20%; height: 44px" :filter="true"
                :showFilterMenu="false">
          <template #filter="{ filterModel }">
            <InputText v-if="filterModel" v-model="filterModel.value" type="text" style="width: 100%;"
                       @input="filterSvFIOCallback(filterModel.value)" placeholder="Поиск по ФИО Супервайзера"/>
          </template>
        </Column>
        <Column field="region.name" header="Регион" style="width: 20%; height: 44px">
        </Column>
        <Column field="registrarRole.channelType" header="Канал" style="width: 20%; height: 44px">
        </Column>
        <Column field="blocked" header="Активный" dataType="boolean" bodyClass="text-center" style="min-width: 8rem">
          <template #body="{ data }">
            <i v-if="data" class="pi"
               :class="{ 'pi-check-circle text-green-500 ': !data.blocked, 'pi-times-circle text-red-500': data.blocked }"></i>
          </template>
        </Column>
        <Column :exportable="false" style="min-width: 16rem">
          <template #body="slotProps">
            <div v-if="slotProps.data && slotProps.data.id">
              <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editRegistrar(slotProps.data)"
                      v-tooltip="'Редактировать'"/>
              <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2"
                      @click="confirmDeleteRegistrar(slotProps.data)"
                      v-tooltip="'Удалить'"/>
              <Button :icon="loadingEntityChangesId === slotProps.data.id ? 'pi pi-spin pi-spinner' : 'pi pi-history'"
                      outlined rounded
                      @click="viewEntityChangesHistory(slotProps.data)"
                      severity="help"
                      v-tooltip="'История изменений'"
                      :loading="loadingEntityChangesId === slotProps.data.id"/>
            </div>
            <div v-else class="flex items-center" :style="{ height: '17px', 'flex-grow': '1', overflow: 'hidden' }">
              <Skeleton width="100%" height="1rem"/>
            </div>
          </template>
        </Column>
      </DataTable>

      <Paginator
          @page="onPageChange"
          :template="{
                '640px': 'PrevPageLink CurrentPageReport NextPageLink',
                '960px': 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink',
                '1300px': 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink',
                default: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown RowsPerPageDropdown'
            }"
          :rows="20"
          :totalRecords="count"
          :rowsPerPageOptions="[10, 20, 30]">
      </Paginator>
    </div>

    <Dialog v-model:visible="registrarDialog" :style="{ width: '450px' }" header="Данные Регистратора" :modal="true">
      <div class="flex flex-col gap-6">
        <div>
          <label for="name" class="block font-bold mb-3">Организация</label>
          <Select v-model="registrar.organization" :options="organizations" option optionLabel="name"
                  placeholder="Организация" class="w-full" :invalid="submitted && !registrar.organization"
                  @change="onChangeOrganization()"/>
          <small v-if="submitted && !registrar.organization" class="text-red-500">Организация обязательна.</small>
        </div>

        <div>
          <label for="registrarRole" class="block font-bold mb-3">Роль</label>
          <Select v-model="registrar.registrarRole" :options="rolesByOrganization" option optionLabel="name"
                  placeholder="Роль" class="w-full" :invalid="submitted && !registrar.registrarRole"/>
          <small v-if="submitted && !registrar.registrarRole" class="text-red-500">Роль обязательна.</small>
        </div>
        <div>
          <label for="channelType" class="block font-bold mb-3">Канал</label>
          <InputText v-if="registrar.registrarRole" v-model="registrar.registrarRole.channelType" readonly="true"
                     style="width: 100%"/>
          <InputText v-if="!registrar.registrarRole" readonly="true" style="width: 100%"/>
        </div>
        <Fieldset legend="Регистратор">
          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-6">
              <label for="msisdn" class="block font-bold mb-3">Номер</label>
              <InputNumber id="msisdn" v-model.trim="registrar.msisdn" required="true" autofocus
                           :invalid="submitted && !registrar.msisdn" fluid/>
              <small v-if="submitted && !registrar.msisdn" class="text-red-500">Номер обязателен.</small>
            </div>
            <div class="col-span-6">
              <label for="name" class="block font-bold mb-3">Имя</label>
              <InputText id="name" v-model.trim="registrar.firstName" required="true" autofocus
                         :invalid="submitted && !registrar.firstName" fluid/>
              <small v-if="submitted && !registrar.firstName" class="text-red-500">Имя обязательное.</small>
            </div>
          </div>
          <div class="grid grid-cols-12 gap-4 mt-3">
            <div class="col-span-6">
              <label for="name" class="block font-bold mb-3">Фамилия</label>
              <InputText id="name" v-model.trim="registrar.lastName" required="true" autofocus fluid/>
            </div>
            <div class="col-span-6">
              <label for="name" class="block font-bold mb-3">Отчество</label>
              <InputText id="name" v-model.trim="registrar.middleName" required="true" autofocus fluid/>
            </div>
          </div>
        </Fieldset>
        <Fieldset legend="Супервайзер / ТП">
          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-6">
              <label for="svMsisdn" class="block font-bold mb-3">Номер</label>
              <InputText id="svMsisdn" v-model.trim="registrar.svMsisdn" required="true" autofocus fluid/>
            </div>
            <div class="col-span-6">
              <label for="svFirstName" class="block font-bold mb-3">Имя</label>
              <InputText id="svFirstName" v-model.trim="registrar.svFirstName" required="true" autofocus fluid/>
            </div>
          </div>
          <div class="grid grid-cols-12 gap-4 mt-3">
            <div class="col-span-6">
              <label for="svLastName" class="block font-bold mb-3">Фамилия</label>
              <InputText id="svLastName" v-model.trim="registrar.svLastName" required="true" autofocus fluid/>
            </div>
            <div class="col-span-6">
              <label for="svMiddleName" class="block font-bold mb-3">Отчество</label>
              <InputText id="svMiddleName" v-model.trim="registrar.svMiddleName" required="true" autofocus fluid/>
            </div>
          </div>
        </Fieldset>

        <div>
          <label for="name" class="block font-bold mb-3">Регион</label>
          <Select v-model="registrar.region" :options="regions" option optionLabel="name"
                  placeholder="Регион" class="w-full" :invalid="submitted && !registrar.region"/>
          <small v-if="submitted && !registrar.region" class="text-red-500">Регион обязателен.</small>
        </div>

        <div>
          <label for="name" class="block font-bold mb-3">Язык</label>
          <Select v-model="registrar.langModel" :options="langs" option optionLabel="name"
                  placeholder="Язык" class="w-full" :invalid="submitted && !registrar.lang"/>
          <small v-if="submitted && !registrar.lang" class="text-red-500">Язык обязателен.</small>
        </div>

        <div class="flex items-center gap-2">
          <ToggleSwitch v-model="registrar.blocked" name="blocked"/>
          <label for="blocked"> Заблокирован </label>
        </div>

        <div class="flex items-center gap-2">
          <ToggleSwitch v-model="registrar.manual" name="blocked"/>
          <label for="blocked"> Создан вручную </label>
        </div>

      </div>

      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideDialog"/>
        <Button label="Сохранить" icon="pi pi-check" @click="saveRegistrar"/>
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteRegistrarDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl"/>
        <span v-if="registrar">Вы точно хотите удалить регистратора <b>{{ registrar.name }}</b>?</span>
      </div>
      <template #footer>
        <Button label="Нет" icon="pi pi-times" text @click="deleteRegistrarDialog = false"/>
        <Button label="Да" icon="pi pi-check" @click="deleteRegistrar"/>
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
