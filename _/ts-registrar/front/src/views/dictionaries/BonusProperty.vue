<script setup>
import {FilterMatchMode} from '@primevue/core/api';
import {useToast} from 'primevue/usetoast';
import {onMounted, ref} from 'vue';
import BonusPropertyService from '../../services/dictionary/bonus-property.service.js';
import EntityChanges from '../../components/EntityChanges.vue';
const toast = useToast();
const dt = ref();
const bonusProperties = ref();
const bonusPropertyDialog = ref(false);
const bonusProperty = ref({});
const filters = ref({
  global: {value: null, matchMode: FilterMatchMode.CONTAINS}
});
const submitted = ref(false);
const entityChangesDialog = ref(false);
const entityChanges = ref();
const loadingEntityChangesId = ref(null);
const bonusPropertyService = new BonusPropertyService();

onMounted(() => {
  findAll();
});

function findAll() {
  bonusPropertyService.findAll().then((data) => (bonusProperties.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function openNew() {
  bonusProperty.value = {};
  submitted.value = false;
  bonusPropertyDialog.value = true;
}

function hideDialog() {
  bonusPropertyDialog.value = false;
  submitted.value = false;
}

function saveBonusProperty() {
  submitted.value = true;

  if (bonusProperty?.value.key?.trim() &&
      bonusProperty?.value.intValue != null &&
      bonusProperty?.value.description?.trim() &&
      bonusProperty?.value.transactionId?.trim()) {
    bonusPropertyService
        .save(bonusProperty.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Константа бонусов успешно сохранена',
            life: 3000
          });
          findAll();
          bonusPropertyDialog.value = false;
          bonusProperty.value = {};
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


async function viewEntityChangesHistory(reason) {
  loadingEntityChangesId.value = reason.id;
  try {
    entityChanges.value = await bonusPropertyService.findHistoryById(reason.id);
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

function editBonusProperty(tariffPlanData) {
  bonusProperty.value = {...tariffPlanData};
  bonusPropertyDialog.value = true;
}

function refreshCache(){
  bonusPropertyService.refreshCache().then(() => {
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Кэш успешно обновлен',
      life: 3000
    });
    findAll();
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
</script>

<template>
  <div class="layout-main">
    <div class="card">
      <Toolbar class="mb-6">
        <template #start>
          <Button label="Создать" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew"/>
          <Button label="Обновить кэш" icon="pi pi-refresh" severity="secondary" class="mr-2" @click="refreshCache"/>
        </template>

        <template #end>
          <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)"/>
        </template>
      </Toolbar>

      <DataTable
          ref="dt"
          :value="bonusProperties"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Показано с {first} по {last} из {totalRecords} констант бонусов"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Список констант бонусов</h4>
            <IconField>
              <InputIcon>
                <i class="pi pi-search"/>
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Поиск..."/>
            </IconField>
          </div>
        </template>

        <Column field="id" header="ID" sortable style="min-width: 8rem"></Column>
        <Column field="key" header="Ключ" sortable style="min-width: 16rem"></Column>
        <Column field="intValue" header="Числовое значение" sortable style="min-width: 16rem"></Column>
        <Column field="description" header="Описание" sortable style="min-width: 16rem"></Column>
        <Column field="transactionId" header="ID транзакции" sortable style="min-width: 16rem"></Column>
        <Column :exportable="false" style="min-width: 12rem">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editBonusProperty(slotProps.data)"
                    v-tooltip="'Редактировать'"/>
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

    <Dialog v-model:visible="bonusPropertyDialog" :style="{ width: '600px' }" header="Детали константы бонуса" :modal="true">
      <div class="flex flex-col gap-6">
        <div>
          <label for="key" class="block font-bold mb-3">Ключ</label>
          <InputText id="key" v-model.trim="bonusProperty.key" required="true"
                     :invalid="submitted && !bonusProperty.key" fluid/>
          <small v-if="submitted && !bonusProperty.key" class="text-red-500">Ключ константы бонусов обязательна.</small>
        </div>

        <div>
          <label for="intValue" class="block font-bold mb-3">Числовое значение</label>
          <InputText id="intValue" type="number" v-model.trim="bonusProperty.intValue" required="true" autofocus
                     :invalid="submitted && !bonusProperty.intValue" fluid/>
          <small v-if="submitted && !bonusProperty.intValue" class="text-red-500">Числовое значение константы бонусов обязательна.</small>
        </div>

        <div>
          <label for="description" class="block font-bold mb-3">Описание</label>
          <InputText id="description" v-model.trim="bonusProperty.description" required="true" autofocus
                     :invalid="submitted && !bonusProperty.description" fluid/>
          <small v-if="submitted && !bonusProperty.description" class="text-red-500">Описание константы бонусов обязательна.</small>
        </div>

        <div>
          <label for="transactionId" class="block font-bold mb-3">ID транзакции</label>
          <InputText id="transactionId" type="number" v-model.trim="bonusProperty.transactionId" required="true" autofocus
                     :invalid="submitted && !bonusProperty.transactionId" fluid/>
          <small v-if="submitted && !bonusProperty.transactionId" class="text-red-500">ID транзакции константы бонусов обязательна.</small>
        </div>
      </div>

      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideDialog"/>
        <Button label="Сохранить" icon="pi pi-check" @click="saveBonusProperty"/>
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