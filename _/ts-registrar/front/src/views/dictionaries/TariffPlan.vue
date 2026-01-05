<script setup>
import {FilterMatchMode} from '@primevue/core/api';
import {useToast} from 'primevue/usetoast';
import {onMounted, ref} from 'vue';
import TariffPlanService from '../../services/dictionary/tariff-plan.service.js';
import EntityChanges from '../../components/EntityChanges.vue';
const toast = useToast();
const dt = ref();
const tariffPlans = ref();
const tariffPlanDialog = ref(false);
const deleteTariffPlanDialog = ref(false);
const tariffPlan = ref({});
const filters = ref({
  global: {value: null, matchMode: FilterMatchMode.CONTAINS}
});
const submitted = ref(false);

const tariffPlanService = new TariffPlanService();
const entityChangesDialog = ref(false);
const entityChanges = ref();
const loadingEntityChangesId = ref(null);
onMounted(() => {
  findAll();
});

function findAll() {
  tariffPlanService.findAll().then((data) => (tariffPlans.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function openNew() {
  tariffPlan.value = {};
  submitted.value = false;
  tariffPlanDialog.value = true;
}

function hideDialog() {
  tariffPlanDialog.value = false;
  submitted.value = false;
}

function saveTariffPlan() {
  submitted.value = true;

  if (tariffPlan?.value.tariffPlanName?.trim() &&
      tariffPlan?.value.tariffPlanCode?.trim()) {
    tariffPlanService
        .save(tariffPlan.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Тарифный план успешно сохранен',
            life: 3000
          });
          findAll();
          tariffPlanDialog.value = false;
          tariffPlan.value = {};
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
    entityChanges.value = await tariffPlanService.findHistoryById(reason.id);
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

function editTariffPlan(tariffPlanData) {
  tariffPlan.value = {...tariffPlanData};
  tariffPlanDialog.value = true;
}

function confirmDeleteTariffPlan(tariffPlanData) {
  tariffPlan.value = tariffPlanData;
  deleteTariffPlanDialog.value = true;
}

function deleteTariffPlan() {
  tariffPlanService
      .delete(tariffPlan.value.id)
      .then(() => {
        tariffPlans.value = tariffPlans.value.filter((val) => val.id !== tariffPlan.value.id);
        deleteTariffPlanDialog.value = false;
        tariffPlan.value = {};
        toast.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Тарифный план успешно удален',
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
          :value="tariffPlans"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Показано с {first} по {last} из {totalRecords} тарифных планов"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Список тарифных планов</h4>
            <IconField>
              <InputIcon>
                <i class="pi pi-search"/>
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Поиск..."/>
            </IconField>
          </div>
        </template>

        <Column field="id" header="ID" sortable style="min-width: 8rem"></Column>
        <Column field="tariffPlanName" header="Название тарифного плана" sortable style="min-width: 16rem"></Column>
        <Column field="tariffPlanCode" header="Код тарифного плана" sortable style="min-width: 16rem"></Column>
        <Column field="createdAt" header="Дата создания тарифного плана" sortable style="min-width: 16rem"></Column>
        <Column :exportable="false" style="min-width: 16rem">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editTariffPlan(slotProps.data)"
                    v-tooltip="'Редактировать'"/>
            <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2"
                    @click="confirmDeleteTariffPlan(slotProps.data)"
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

    <Dialog v-model:visible="tariffPlanDialog" :style="{ width: '600px' }" header="Детали тарифного плана" :modal="true">
      <div class="flex flex-col gap-6">
        <div>
          <label for="tariffPlanName" class="block font-bold mb-3">Название тарифного плана</label>
          <InputText id="tariffPlanName" v-model.trim="tariffPlan.tariffPlanName" required="true"
                     :invalid="submitted && !tariffPlan.tariffPlanName" fluid/>
          <small v-if="submitted && !tariffPlan.tariffPlanName" class="text-red-500">Название тарифного плана обязательно.</small>
        </div>

        <div>
          <label for="tariffPlanCode"  class="block font-bold mb-3">Код тарифного плана</label>
          <InputText id="tariffPlanCode" type="number" v-model.trim="tariffPlan.tariffPlanCode" required="true" autofocus
                     :invalid="submitted && !tariffPlan.tariffPlanCode" fluid/>
          <small v-if="submitted && !tariffPlan.tariffPlanCode" class="text-red-500">Код тарифного плана обязателен.</small>
        </div>
      </div>

      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideDialog"/>
        <Button label="Сохранить" icon="pi pi-check" @click="saveTariffPlan"/>
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteTariffPlanDialog" :style="{ width: '450px' }" header="Подтверждение" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl"/>
        <span v-if="tariffPlan"
        >Вы точно хотите удалить тарифный план <b>{{ tariffPlan.tariffPlanName }}</b
        >?</span
        >
      </div>
      <template #footer>
        <Button label="Нет" icon="pi pi-times" text @click="deleteTariffPlanDialog = false"/>
        <Button label="Да" icon="pi pi-check" @click="deleteTariffPlan"/>
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