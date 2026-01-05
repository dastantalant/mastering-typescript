<script setup>
import {FilterMatchMode} from '@primevue/core/api';
import {useToast} from 'primevue/usetoast';
import {onMounted, ref} from 'vue';
import PersonificationRejectReasonService from '../../services/dictionary/personification-reject-reason.service.js';
import EntityChanges from '../../components/EntityChanges.vue';
const toast = useToast();
const dt = ref();
const personificationRejectReasons = ref();
const personificationRejectReasonDialog = ref(false);
const deletePersonficationRejectReasonDialog = ref(false);
const personificationRejectReason = ref({});
const filters = ref({
  global: {value: null, matchMode: FilterMatchMode.CONTAINS}
});
const submitted = ref(false);
const entityChangesDialog = ref(false);
const entityChanges = ref();
const loadingEntityChangesId = ref(null);
const personificationRejectReasonService = new PersonificationRejectReasonService();

onMounted(() => {
  findAll();
});

function findAll() {
  personificationRejectReasonService.findAll().then((data) => (personificationRejectReasons.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function openNew() {
  personificationRejectReason.value = {};
  submitted.value = false;
  personificationRejectReasonDialog.value = true;
}

function hideDialog() {
  personificationRejectReasonDialog.value = false;
  submitted.value = false;
}

function saveSimRecoveryRejectReason() {
  submitted.value = true;

  if (personificationRejectReason?.value.reasonRu?.trim() &&
      personificationRejectReason?.value.reasonEn?.trim() &&
      personificationRejectReason?.value.reasonKy?.trim()) {
    personificationRejectReasonService
        .save(personificationRejectReason.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Причина отказа сохранена',
            life: 3000
          });
          findAll();
          personificationRejectReasonDialog.value = false;
          personificationRejectReason.value = {};
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

function editPersonficationRejectReason(reason) {
  personificationRejectReason.value = {...reason};
  personificationRejectReasonDialog.value = true;
}

function confirmPersonificationRejectReason(reason) {
  personificationRejectReason.value = reason;
  deletePersonficationRejectReasonDialog.value = true;
}

function deletePersonficationRejectReason() {
  personificationRejectReasonService
      .delete(personificationRejectReason.value.id)
      .then(() => {
        personificationRejectReasons.value = personificationRejectReasons.value.filter((val) => val.id !== personificationRejectReason.value.id);
        deletePersonficationRejectReasonDialog.value = false;
        personificationRejectReason.value = {};
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

async function viewEntityChangesHistory(reason) {
  loadingEntityChangesId.value = reason.id;
  try {
    entityChanges.value = await personificationRejectReasonService.findHistoryById(reason.id);
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
          :value="personificationRejectReasons"
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
            <h4 class="m-0">Список причин отказа для Мой О! персонификация</h4>
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
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editPersonficationRejectReason(slotProps.data)"
                    v-tooltip="'Редактировать'"/>
            <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2"
                    @click="confirmPersonificationRejectReason(slotProps.data)"
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

    <Dialog v-model:visible="personificationRejectReasonDialog" :style="{ width: '600px' }" header="Детали причины отказа" :modal="true">
      <div class="flex flex-col gap-6">
        <div>
          <label for="reasonRu" class="block font-bold mb-3">Причина (Русский)</label>
          <InputText id="reasonRu" v-model.trim="personificationRejectReason.reasonRu" required="true" autofocus
                     :invalid="submitted && !personificationRejectReason.reasonRu" fluid/>
          <small v-if="submitted && !personificationRejectReason.reasonRu" class="text-red-500">Причина на русском языке обязательна.</small>
        </div>

        <div>
          <label for="reasonEn" class="block font-bold mb-3">Причина (English)</label>
          <InputText id="reasonEn" v-model.trim="personificationRejectReason.reasonEn" required="true"
                     :invalid="submitted && !personificationRejectReason.reasonEn" fluid/>
          <small v-if="submitted && !personificationRejectReason.reasonEn" class="text-red-500">Причина на английском языке обязательна.</small>
        </div>

        <div>
          <label for="reasonKy" class="block font-bold mb-3">Причина (Кыргызский)</label>
          <InputText id="reasonKy" v-model.trim="personificationRejectReason.reasonKy" required="true"
                     :invalid="submitted && !personificationRejectReason.reasonKy" fluid/>
          <small v-if="submitted && !personificationRejectReason.reasonKy" class="text-red-500">Причина на кыргызском языке обязательна.</small>
        </div>
      </div>

      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideDialog"/>
        <Button label="Сохранить" icon="pi pi-check" @click="saveSimRecoveryRejectReason"/>
      </template>
    </Dialog>

    <Dialog v-model:visible="deletePersonficationRejectReasonDialog" :style="{ width: '450px' }" header="Подтверждение" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl"/>
        <span v-if="personificationRejectReason"
        >Вы точно хотите удалить причину отказа <b>{{ personificationRejectReason.reasonRu }}</b
        >?</span
        >
      </div>
      <template #footer>
        <Button label="Нет" icon="pi pi-times" text @click="deletePersonficationRejectReasonDialog = false"/>
        <Button label="Да" icon="pi pi-check" @click="deletePersonficationRejectReason"/>
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