<script setup>
import {FilterMatchMode} from '@primevue/core/api';
import {useToast} from 'primevue/usetoast';
import {onMounted, ref} from 'vue';
import SaimaTemplateCategoryService from '../../services/dictionary/saima-template-category.service.ts';
import EntityChanges from '../../components/EntityChanges.vue';
const toast = useToast();
const dt = ref();
const saimaTemplateCategories = ref();
const saimaTemplateCategoryDialog = ref(false);
const deleteSaimaTemplateCategoryDialog = ref(false);
const saimaTemplateCategory = ref({});
const filters = ref({
  global: {value: null, matchMode: FilterMatchMode.CONTAINS}
});
const submitted = ref(false);
const entityChangesDialog = ref(false);
const entityChanges = ref();
const loadingEntityChangesId = ref(null);
const photoTypes = ref([
  {code: 1, value: 'PHOTO_DOCUMENT_FACE_SIDE', label: 'Паспорт лицевая сторона'},
  {code: 2, value: 'PHOTO_DOCUMENT_BACK_SIDE', label: 'Паспорт оборотная сторона'},
  {code: 3, value: 'LOAN_AGREEMENT', label: 'Фото договора'},
  {code: 4, value: 'APPLICATION_FIRST_PAGE', label: 'Приложение 1 стр'},
  {code: 5, value: 'APPLICATION_SECOND_PAGE', label: 'Приложение 2 стр'},
  {code: 6, value: 'APPLICATION_THIRD_PAGE', label: 'Приложение 3 стр'},
  {code: 7, value: 'CHEQUE', label: 'Чек об оплате'}
]);

const saimaTemplateCategoryService = new SaimaTemplateCategoryService();

onMounted(() => {
  findAll();
});

function findAll() {
  saimaTemplateCategoryService.findAll().then((data) => {
    saimaTemplateCategories.value = data;
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
  saimaTemplateCategory.value = {
    uploadPhotoTypes: [],
    reSent: false,
    active: true,
    name: ''
  };
  submitted.value = false;
  saimaTemplateCategoryDialog.value = true;
}

function hideDialog() {
  saimaTemplateCategoryDialog.value = false;
  submitted.value = false;
}

function saveSaimaTemplateCategory() {
  submitted.value = true;

  if (saimaTemplateCategory?.value.name?.trim()) {
    saimaTemplateCategoryService
        .save(saimaTemplateCategory.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Категория шаблона сохранена',
            life: 3000
          });
          findAll();
          saimaTemplateCategoryDialog.value = false;
          saimaTemplateCategory.value = {};
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

function editSaimaTemplateCategory(category) {

  saimaTemplateCategory.value = {
    ...category,
    uploadPhotoTypes: Array.isArray(category.uploadPhotoTypes) ? [...category.uploadPhotoTypes] : []
  };

  saimaTemplateCategoryDialog.value = true;
}

function confirmDeleteSaimaTemplateCategory(category) {
  saimaTemplateCategory.value = category;
  deleteSaimaTemplateCategoryDialog.value = true;
}

function deleteSaimaTemplateCategory() {
  saimaTemplateCategoryService
      .delete(saimaTemplateCategory.value.id)
      .then(() => {
        saimaTemplateCategories.value = saimaTemplateCategories.value.filter((val) => val.id !== saimaTemplateCategory.value.id);
        deleteSaimaTemplateCategoryDialog.value = false;
        saimaTemplateCategory.value = {};
        toast.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Категория шаблона удалена',
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


function formatDateTime(dateTime) {
  if (!dateTime) return '';
  return new Date(dateTime).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function viewEntityChangesHistory(reason) {
  loadingEntityChangesId.value = reason.id;
  try {
    entityChanges.value = await saimaTemplateCategoryService.findHistoryById(reason.id);
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
          :value="saimaTemplateCategories"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Показано с {first} по {last} из {totalRecords} категорий"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Список классификаций шаблонов</h4>
            <IconField>
              <InputIcon>
                <i class="pi pi-search"/>
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Поиск..."/>
            </IconField>
          </div>
        </template>

        <Column field="id" header="ID" sortable style="min-width: 8rem"></Column>
        <Column field="name" header="Название" sortable style="min-width: 16rem"></Column>
        <Column field="active" header="Активный" sortable style="min-width: 10rem">
          <template #body="slotProps">
            <Tag :value="slotProps.data.active ? 'Да' : 'Нет'" :severity="slotProps.data.active ? 'success' : 'danger'"/>
          </template>
        </Column>
        <Column field="reSent" header="Повторно отправляемый" sortable style="min-width: 12rem">
          <template #body="slotProps">
            <Tag :value="slotProps.data.reSent ? 'Да' : 'Нет'" :severity="slotProps.data.reSent ? 'success' : 'secondary'"/>
          </template>
        </Column>
        <Column field="createdAt" header="Создано" sortable style="min-width: 14rem">
          <template #body="slotProps">
            {{ formatDateTime(slotProps.data.createdAt) }}
          </template>
        </Column>
        <Column :exportable="false" style="min-width: 16rem">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editSaimaTemplateCategory(slotProps.data)"
                    v-tooltip="'Редактировать'"/>
            <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2"
                    @click="confirmDeleteSaimaTemplateCategory(slotProps.data)"
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

    <Dialog v-model:visible="saimaTemplateCategoryDialog" :style="{ width: '700px' }" header="Детали классификации шаблона" :modal="true">
      <div class="flex flex-col gap-6">
        <div>
          <label for="name" class="block font-bold mb-3">Название</label>
          <InputText id="name" v-model.trim="saimaTemplateCategory.name" required="true" autofocus
                     :invalid="submitted && !saimaTemplateCategory.name" fluid/>
          <small v-if="submitted && !saimaTemplateCategory.name" class="text-red-500">Название обязательно.</small>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center gap-2">
            <Checkbox v-model="saimaTemplateCategory.active" binary/>
            <label>Активна</label>
          </div>
          <div class="flex items-center gap-2">
            <Checkbox v-model="saimaTemplateCategory.reSent" binary/>
            <label>Переотправка</label>
          </div>
        </div>

        <div>
          <label class="block font-bold mb-3">Типы загружаемых фото</label>
          <div class="grid grid-cols-1 gap-2">
            <div class="flex items-center gap-2" v-for="photoType in photoTypes" :key="photoType.value">
              <Checkbox
                  v-model="saimaTemplateCategory.uploadPhotoTypes"
                  :value="photoType.value"
                  :checked="saimaTemplateCategory.uploadPhotoTypes?.includes(photoType.value)"
              />
              <label>{{ photoType.label }}</label>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideDialog"/>
        <Button label="Сохранить" icon="pi pi-check" @click="saveSaimaTemplateCategory"/>
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteSaimaTemplateCategoryDialog" :style="{ width: '450px' }" header="Подтверждение" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl"/>
        <span v-if="saimaTemplateCategory"
        >Вы точно хотите удалить категорию <b>{{ saimaTemplateCategory.name }}</b>?</span>
      </div>
      <template #footer>
        <Button label="Нет" icon="pi pi-times" text @click="deleteSaimaTemplateCategoryDialog = false"/>
        <Button label="Да" icon="pi pi-check" @click="deleteSaimaTemplateCategory"/>
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