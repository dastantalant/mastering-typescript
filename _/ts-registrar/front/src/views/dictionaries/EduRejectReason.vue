<script setup>
import {FilterMatchMode} from '@primevue/core/api';
import {useToast} from 'primevue/usetoast';
import {onMounted, ref} from 'vue';
import EduRejectReasonService from '../../services/dictionary/edu-reject-reason.service.ts';
import EntityChanges from '../../components/EntityChanges.vue';

const toast = useToast();
const dt = ref();
const eduRejectReasons = ref();
const requestTypes = ref();
const eduRejectReasonDialog = ref(false);
const deleteEduRejectReasonDialog = ref(false);
const eduRejectReason = ref({});
const filters = ref({
  global: {value: null, matchMode: FilterMatchMode.CONTAINS}
});
const submitted = ref(false);
const entityChangesDialog = ref(false);
const entityChanges = ref();
const loadingEntityChangesId = ref(null);
const eduRejectReasonService = new EduRejectReasonService();

onMounted(() => {
  findAll();

  eduRejectReasonService.findRequestTypes().then((data) => (requestTypes.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
});

function findAll() {
  eduRejectReasonService.findAll().then((data) => (eduRejectReasons.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

async function viewEntityChangesHistory(reason) {
  loadingEntityChangesId.value = reason.id;
  try {
    entityChanges.value = await eduRejectReasonService.findHistoryById(reason.id);
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


function openNew() {
  eduRejectReason.value = {};
  submitted.value = false;
  eduRejectReasonDialog.value = true;
}

function hideDialog() {
  eduRejectReasonDialog.value = false;
  submitted.value = false;
}

function saveEduRejectReason() {
  submitted.value = true;

  if (eduRejectReason?.value.ruText?.trim() && eduRejectReason?.value.requestType) {
    eduRejectReasonService
        .save(eduRejectReason.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Причина отказа сохранена',
            life: 3000
          });
          findAll();
          eduRejectReasonDialog.value = false;
          eduRejectReason.value = {};
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

function editEduRejectReason(reason) {
  eduRejectReason.value = {...reason};
  eduRejectReasonDialog.value = true;
}

function confirmDeleteEduRejectReason(reason) {
  eduRejectReason.value = reason;
  deleteEduRejectReasonDialog.value = true;
}

function deleteEduRejectReason() {
  eduRejectReasonService
      .delete(eduRejectReason.value.id)
      .then(() => {
        eduRejectReasons.value = eduRejectReasons.value.filter((val) => val.id !== eduRejectReason.value.id);
        deleteEduRejectReasonDialog.value = false;
        eduRejectReason.value = {};
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
function getRequestTypeDisplayName(requestType) {
  const type = requestTypes.value?.find(t => t.name === requestType);
  return type ? type.displayName : requestType;
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
          :value="eduRejectReasons"
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
            <h4 class="m-0">Список причин отказа для учителей/учеников</h4>
            <IconField>
              <InputIcon>
                <i class="pi pi-search"/>
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Поиск..."/>
            </IconField>
          </div>
        </template>

        <Column field="id" header="ID" sortable style="min-width: 8rem"></Column>
        <Column field="ruText" header="Текст (RU)" sortable style="min-width: 20rem"></Column>
        <Column field="kgText" header="Текст (KG)" sortable style="min-width: 20rem"></Column>
        <Column field="enText" header="Текст (EN)" sortable style="min-width: 20rem"></Column>
        <Column field="requestType" header="Тип" sortable style="min-width: 12rem">
          <template #body="slotProps">
            {{ getRequestTypeDisplayName(slotProps.data.requestType) }}
          </template>
        </Column>
        <Column :exportable="false" style="min-width: 12rem">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editEduRejectReason(slotProps.data)"
                    v-tooltip="'Редактировать'"/>
            <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2"
                    @click="confirmDeleteEduRejectReason(slotProps.data)"
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

    <Dialog v-model:visible="eduRejectReasonDialog" :style="{ width: '600px' }" header="Детали причины отказа" :modal="true">
      <div class="flex flex-col gap-6">
        <div>
          <label for="requestType" class="block font-bold mb-3">Тип запроса</label>
          <Select
              id="requestType"
              v-model="eduRejectReason.requestType"
              :options="requestTypes"
              optionLabel="displayName"
              optionValue="name"
              placeholder="Выберите тип запроса"
              :invalid="submitted && !eduRejectReason.requestType"
              fluid
          />
          <small v-if="submitted && !eduRejectReason.requestType" class="text-red-500">Тип запроса обязателен.</small>
        </div>

        <div>
          <label for="ruText" class="block font-bold mb-3">Текст на русском</label>
          <Textarea
              id="ruText"
              v-model.trim="eduRejectReason.ruText"
              required="true"
              rows="3"
              :invalid="submitted && !eduRejectReason.ruText"
              fluid
          />
          <small v-if="submitted && !eduRejectReason.ruText" class="text-red-500">Текст на русском обязателен.</small>
        </div>

        <div>
          <label for="kgText" class="block font-bold mb-3">Текст на кыргызском</label>
          <Textarea
              id="kgText"
              v-model.trim="eduRejectReason.kgText"
              required="true"
              :invalid="submitted && !eduRejectReason.kgText"
              rows="3"
              fluid
          />
          <small v-if="submitted && !eduRejectReason.kgText" class="text-red-500">Текст на кыргызском обязателен.</small>
        </div>

        <div>
          <label for="enText" class="block font-bold mb-3">Текст на английском</label>
          <Textarea
              id="enText"
              v-model.trim="eduRejectReason.enText"
              required="true"
              :invalid="submitted && !eduRejectReason.enText"
              rows="3"
              fluid
          />
          <small v-if="submitted && !eduRejectReason.enText" class="text-red-500">Текст на английском обязателен.</small>
        </div>
      </div>

      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideDialog"/>
        <Button label="Сохранить" icon="pi pi-check" @click="saveEduRejectReason"/>
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteEduRejectReasonDialog" :style="{ width: '450px' }" header="Подтверждение" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl"/>
        <span v-if="eduRejectReason"
        >Вы точно хотите удалить причину отказа <b>{{ eduRejectReason.ruText }}</b
        >?</span
        >
      </div>
      <template #footer>
        <Button label="Нет" icon="pi pi-times" text @click="deleteEduRejectReasonDialog = false"/>
        <Button label="Да" icon="pi pi-check" @click="deleteEduRejectReason"/>
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