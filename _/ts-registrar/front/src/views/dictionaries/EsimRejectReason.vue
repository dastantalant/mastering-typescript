<script setup>
import {FilterMatchMode} from '@primevue/core/api';
import {useToast} from 'primevue/usetoast';
import {onMounted, ref} from 'vue';
import EsimRejectReasonService from '../../services/dictionary/esim-reject-reason.service.js';
import EntityChanges from '../../components/EntityChanges.vue';
const toast = useToast();
const dt = ref();
const esimRejectReasons = ref();
const esimRejectReasonDialog = ref(false);
const deleteEsimRejectReasonDialog = ref(false);
const esimRejectReason = ref({
  id: null,
  reasonRu: '',
  reasonEn: '',
  reasonKy: ''
});
const filters = ref({
  global: {value: null, matchMode: FilterMatchMode.CONTAINS}
});
const submitted = ref(false);
const esimRejectReasonService = new EsimRejectReasonService();
const entityChangesDialog = ref(false);
const entityChanges = ref();
const loadingEntityChangesId = ref(null);

onMounted(() => {
  findAll();
});

function findAll() {
  esimRejectReasonService.findAll().then((data) => (esimRejectReasons.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function openNew() {
  esimRejectReason.value = {};
  submitted.value = false;
  esimRejectReasonDialog.value = true;
}

function hideDialog() {
  esimRejectReasonDialog.value = false;
  submitted.value = false;
}

function saveEsimRejectReason() {
  submitted.value = true;

  if (esimRejectReason?.value.reasonRu?.trim() &&
      esimRejectReason?.value.reasonEn?.trim() &&
      esimRejectReason?.value.reasonKy?.trim()) {
    esimRejectReasonService
        .save(esimRejectReason.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Причина отказа сохранена',
            life: 3000
          });
          findAll();
          esimRejectReasonDialog.value = false;
          esimRejectReason.value = {};
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

function editEsimRejectReason(reason) {
  esimRejectReason.value = {...reason};
  esimRejectReasonDialog.value = true;
}

function confirmDeleteSimRecoveryRejectReason(reason) {
  esimRejectReason.value = reason;
  deleteEsimRejectReasonDialog.value = true;
}

async function viewEntityChangesHistory(reason) {
  loadingEntityChangesId.value = reason.id;
  try {
    entityChanges.value = await esimRejectReasonService.findHistoryById(reason.id);
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

function deleteEsimRejectReason() {
  esimRejectReasonService.delete(esimRejectReason.value.id)
      .then(() => {
        esimRejectReasons.value = esimRejectReasons.value.filter((val) => val.id !== esimRejectReason.value.id);
        deleteEsimRejectReasonDialog.value = false;
        esimRejectReason.value = {};
        toast.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Причина отказа удалена',
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
          :value="esimRejectReasons"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Показано с {first} по {last} из {totalRecords} причин отказа"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Список причин отказа для E-sim</h4>
            <IconField>
              <InputIcon>
                <i class="pi pi-search"/>
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Поиск..."/>
            </IconField>
          </div>
        </template>

        <Column field="id" header="ID" sortable style="min-width: 8rem"></Column>
        <Column field="reasonRu" header="Причина (RU)" sortable style="min-width: 16rem"></Column>
        <Column field="reasonEn" header="Причина (EN)" sortable style="min-width: 16rem"></Column>
        <Column field="reasonKy" header="Причина (KG)" sortable style="min-width: 16rem"></Column>
        <Column :exportable="false" style="min-width: 16rem">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editEsimRejectReason(slotProps.data)"
                    v-tooltip="'Редактировать'"/>
            <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2"
                    @click="confirmDeleteSimRecoveryRejectReason(slotProps.data)"
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

    <Dialog v-model:visible="esimRejectReasonDialog" :style="{ width: '600px' }" header="Детали причины отказа" :modal="true">
      <div class="flex flex-col gap-6">
        <div>
          <label for="reasonRu" class="block font-bold mb-3">Причина (Русский)</label>
          <InputText id="reasonRu" v-model.trim="esimRejectReason.reasonRu" required="true" autofocus
                     :invalid="submitted && !esimRejectReason.reasonRu" fluid/>
          <small v-if="submitted && !esimRejectReason.reasonRu" class="text-red-500">Причина на русском языке обязательна.</small>
        </div>

        <div>
          <label for="reasonEn" class="block font-bold mb-3">Причина (English)</label>
          <InputText id="reasonEn" v-model.trim="esimRejectReason.reasonEn" required="true"
                     :invalid="submitted && !esimRejectReason.reasonEn" fluid/>
          <small v-if="submitted && !esimRejectReason.reasonEn" class="text-red-500">Причина на английском языке обязательна.</small>
        </div>

        <div>
          <label for="reasonKy" class="block font-bold mb-3">Причина (Кыргызский)</label>
          <InputText id="reasonKy" v-model.trim="esimRejectReason.reasonKy" required="true"
                     :invalid="submitted && !esimRejectReason.reasonKy" fluid/>
          <small v-if="submitted && !esimRejectReason.reasonKy" class="text-red-500">Причина на кыргызском языке обязательна.</small>
        </div>
      </div>

      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideDialog"/>
        <Button label="Сохранить" icon="pi pi-check" @click="saveEsimRejectReason"/>
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteEsimRejectReasonDialog" :style="{ width: '450px' }" header="Подтверждение" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl"/>
        <span v-if="esimRejectReason"
        >Вы точно хотите удалить причину отказа <b>{{ esimRejectReason.reasonRu }}</b
        >?</span
        >
      </div>
      <template #footer>
        <Button label="Нет" icon="pi pi-times" text @click="deleteEsimRejectReasonDialog = false"/>
        <Button label="Да" icon="pi pi-check" @click="deleteEsimRejectReason"/>
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