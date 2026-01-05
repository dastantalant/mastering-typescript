<script setup>
import {FilterMatchMode} from '@primevue/core/api';
import {useToast} from 'primevue/usetoast';
import {onMounted, ref} from 'vue';
import VerificationRejectReasonService from '../../services/dictionary/verification-reject-reason.service.js';
import EntityChanges from '../../components/EntityChanges.vue';
const toast = useToast();
const dt = ref();
const verificationRejectReasons = ref();
const verificationRejectReasonDialog = ref(false);
const deleteVerificationRejectReasonDialog = ref(false);
const verificationRejectReason = ref({});
const filters = ref({
  global: {value: null, matchMode: FilterMatchMode.CONTAINS}
});
const submitted = ref(false);
const entityChangesDialog = ref(false);
const entityChanges = ref();
const loadingEntityChangesId = ref(null);
const verificationRejectReasonService = new VerificationRejectReasonService();

onMounted(() => {
  findAll();
});

function findAll() {
  verificationRejectReasonService.findAll().then((data) => (verificationRejectReasons.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function openNew() {
  verificationRejectReason.value = {};
  submitted.value = false;
  verificationRejectReasonDialog.value = true;
}

function hideDialog() {
  verificationRejectReasonDialog.value = false;
  submitted.value = false;
}

function saveVerificationRejectReason() {
  submitted.value = true;

  if (verificationRejectReason?.value.ruText?.trim() &&
      verificationRejectReason?.value.enText?.trim() &&
      verificationRejectReason?.value.kgText?.trim()) {
    verificationRejectReasonService
        .save(verificationRejectReason.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Причина отказа персонификации сохранена',
            life: 3000
          });
          findAll();
          verificationRejectReasonDialog.value = false;
          verificationRejectReason.value = {};
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

function editVerificationRejectReason(reason) {
  verificationRejectReason.value = {...reason};
  verificationRejectReasonDialog.value = true;
}

function confirmDeleteVerificationRejectReason(reason) {
  verificationRejectReason.value = reason;
  deleteVerificationRejectReasonDialog.value = true;
}

function deleteVerificationRejectReason() {
  verificationRejectReasonService
      .delete(verificationRejectReason.value.id)
      .then(() => {
        verificationRejectReasons.value = verificationRejectReasons.value.filter((val) => val.id !== verificationRejectReason.value.id);
        deleteVerificationRejectReasonDialog.value = false;
        verificationRejectReason.value = {};
        toast.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Причина отказа персонификации удалена',
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
    entityChanges.value = await verificationRejectReasonService.findHistoryById(reason.id);
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
          :value="verificationRejectReasons"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Показано с {first} по {last} из {totalRecords} причин отказа персонификации"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Список причин отказа персонификации</h4>
            <IconField>
              <InputIcon>
                <i class="pi pi-search"/>
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Поиск..."/>
            </IconField>
          </div>
        </template>
        <Column field="id" header="ID" sortable style="min-width: 8rem"></Column>
        <Column field="ruText" header="Причина (RU)" sortable style="min-width: 16rem"></Column>
        <Column field="enText" header="Причина (EN)" sortable style="min-width: 16rem"></Column>
        <Column field="kgText" header="Причина (KG)" sortable style="min-width: 16rem"></Column>
        <Column :exportable="false" style="min-width: 16rem">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editVerificationRejectReason(slotProps.data)"
                    v-tooltip="'Редактировать'"/>
            <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2"
                    @click="confirmDeleteVerificationRejectReason(slotProps.data)"
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
    <Dialog v-model:visible="verificationRejectReasonDialog" :style="{ width: '600px' }" header="Детали причины отказа персонификации" :modal="true">
      <div class="flex flex-col gap-6">
        <div>
          <label for="ruText" class="block font-bold mb-3">Причина (Русский)</label>
          <InputText id="ruText" v-model.trim="verificationRejectReason.ruText" required="true" autofocus
                     :invalid="submitted && !verificationRejectReason.ruText" fluid/>
          <small v-if="submitted && !verificationRejectReason.ruText" class="text-red-500">Причина на русском языке обязательна.</small>
        </div>
        <div>
          <label for="enText" class="block font-bold mb-3">Причина (English)</label>
          <InputText id="enText" v-model.trim="verificationRejectReason.enText" required="true"
                     :invalid="submitted && !verificationRejectReason.enText" fluid/>
          <small v-if="submitted && !verificationRejectReason.enText" class="text-red-500">Причина на английском языке обязательна.</small>
        </div>
        <div>
          <label for="kgText" class="block font-bold mb-3">Причина (Кыргызский)</label>
          <InputText id="kgText" v-model.trim="verificationRejectReason.kgText" required="true"
                     :invalid="submitted && !verificationRejectReason.kgText" fluid/>
          <small v-if="submitted && !verificationRejectReason.kgText" class="text-red-500">Причина на кыргызском языке обязательна.</small>
        </div>
      </div>
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideDialog"/>
        <Button label="Сохранить" icon="pi pi-check" @click="saveVerificationRejectReason"/>
      </template>
    </Dialog>
    <Dialog v-model:visible="deleteVerificationRejectReasonDialog" :style="{ width: '450px' }" header="Подтверждение" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl"/>
        <span v-if="verificationRejectReason"
        >Вы точно хотите удалить причину отказа персонификации <b>{{ verificationRejectReason.ruText }}</b
        >?</span
        >
      </div>
      <template #footer>
        <Button label="Нет" icon="pi pi-times" text @click="deleteVerificationRejectReasonDialog = false"/>
        <Button label="Да" icon="pi pi-check" @click="deleteVerificationRejectReason"/>
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