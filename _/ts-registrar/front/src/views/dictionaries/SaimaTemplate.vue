<script setup>
import {FilterMatchMode} from '@primevue/core/api';
import {useToast} from 'primevue/usetoast';
import {onMounted, ref} from 'vue';
import SaimaTemplateService from '../../services/dictionary/saima-template.service.ts';
import SaimaTemplateCategoryService from '../../services/dictionary/saima-template-category.service.ts';
import EntityChanges from '../../components/EntityChanges.vue';
const toast = useToast();
const dt = ref();
const saimaTemplates = ref();
const saimaTemplateCategories = ref();
const saimaTemplateDialog = ref(false);
const deleteSaimaTemplateDialog = ref(false);
const saimaTemplate = ref({});
const filters = ref({
  global: {value: null, matchMode: FilterMatchMode.CONTAINS}
});
const submitted = ref(false);
const entityChangesDialog = ref(false);
const entityChanges = ref();
const loadingEntityChangesId = ref(null);
const saimaTemplateService = new SaimaTemplateService();
const saimaTemplateCategoryService = new SaimaTemplateCategoryService();

onMounted(() => {
  findAll();
  loadCategories();
});

function findAll() {
  saimaTemplateService.findAll().then((data) => (saimaTemplates.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function loadCategories() {
  saimaTemplateCategoryService.findAll().then((data) => (saimaTemplateCategories.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function openNew() {
  saimaTemplate.value = {
    category: null
  };
  submitted.value = false;
  saimaTemplateDialog.value = true;
}

function hideDialog() {
  saimaTemplateDialog.value = false;
  submitted.value = false;
}

function saveSaimaTemplate() {
  submitted.value = true;

  if (saimaTemplate?.value.name?.trim() &&
      saimaTemplate?.value.ruText?.trim() &&
      saimaTemplate?.value.kgText?.trim() &&
      saimaTemplate?.value.enText?.trim() &&
      saimaTemplate?.value.category) {
    saimaTemplateService
        .save(saimaTemplate.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Шаблон Сайма сохранен',
            life: 3000
          });
          findAll();
          saimaTemplateDialog.value = false;
          saimaTemplate.value = {};
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

function editSaimaTemplate(template) {
  saimaTemplate.value = {...template};
  saimaTemplateDialog.value = true;
}

function confirmDeleteSaimaTemplate(template) {
  saimaTemplate.value = template;
  deleteSaimaTemplateDialog.value = true;
}

function deleteSaimaTemplate() {
  saimaTemplateService
      .delete(saimaTemplate.value.id)
      .then(() => {
        saimaTemplates.value = saimaTemplates.value.filter((val) => val.id !== saimaTemplate.value.id);
        deleteSaimaTemplateDialog.value = false;
        saimaTemplate.value = {};
        toast.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Шаблон Сайма удален',
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

function truncateText(text, maxLength = 50) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

async function viewEntityChangesHistory(reason) {
  loadingEntityChangesId.value = reason.id;
  try {
    entityChanges.value = await saimaTemplateService.findHistoryById(reason.id);
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
          :value="saimaTemplates"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Показано с {first} по {last} из {totalRecords} шаблонов"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Список шаблонов саймы</h4>
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
        <Column field="category.name" header="Классификация" sortable style="min-width: 14rem"></Column>
        <Column header="Классификация активна" sortable style="min-width: 14rem">
          <template #body="slotProps">
            <Tag :value="slotProps.data.category.active ? 'Да' : 'Нет'" :severity="slotProps.data.category.active ? 'success' : 'danger'"/>
          </template>
        </Column>
        <Column field="ruText" header="Текст (RU)" style="min-width: 18rem">
          <template #body="slotProps">
            <span class="text-sm">{{ truncateText(slotProps.data.ruText) }}</span>
          </template>
        </Column>
        <Column field="enText" header="Текст (EN)" style="min-width: 18rem">
          <template #body="slotProps">
            <span class="text-sm">{{ truncateText(slotProps.data.enText) }}</span>
          </template>
        </Column>
        <Column field="kgText" header="Текст (KG)" style="min-width: 18rem">
          <template #body="slotProps">
            <span class="text-sm">{{ truncateText(slotProps.data.kgText) }}</span>
          </template>
        </Column>
        <Column field="createdAt" header="Дата создания" sortable style="min-width: 14rem">
          <template #body="slotProps">
            {{ formatDateTime(slotProps.data.createdAt) }}
          </template>
        </Column>
        <Column :exportable="false" style="min-width: 16rem">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editSaimaTemplate(slotProps.data)"
                    v-tooltip="'Редактировать'"/>
            <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2"
                    @click="confirmDeleteSaimaTemplate(slotProps.data)"
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

    <Dialog v-model:visible="saimaTemplateDialog" :style="{ width: '800px' }" header="Детали шаблона Саймы" :modal="true">
      <div class="flex flex-col gap-6">
        <div>
          <label for="name" class="block font-bold mb-3">Название</label>
          <InputText id="name" v-model.trim="saimaTemplate.name" required="true" autofocus
                     :invalid="submitted && !saimaTemplate.name" fluid/>
          <small v-if="submitted && !saimaTemplate.name" class="text-red-500">Название обязательно.</small>
        </div>

        <div>
          <label for="category" class="block font-bold mb-3">Категория</label>
          <Dropdown id="category" v-model="saimaTemplate.category" :options="saimaTemplateCategories"
                    optionLabel="name" placeholder="Выберите категорию"
                    :invalid="submitted && !saimaTemplate.category" fluid/>
          <small v-if="submitted && !saimaTemplate.category" class="text-red-500">Категория обязательна.</small>
        </div>

        <div>
          <label for="ruText" class="block font-bold mb-3">Текст (Русский)</label>
          <Textarea id="ruText" v-model.trim="saimaTemplate.ruText" required="true"
                    :invalid="submitted && !saimaTemplate.ruText" rows="4" fluid/>
          <small v-if="submitted && !saimaTemplate.ruText" class="text-red-500">Текст на русском языке обязателен.</small>
        </div>

        <div>
          <label for="enText" class="block font-bold mb-3">Текст (English)</label>
          <Textarea id="enText" v-model.trim="saimaTemplate.enText" required="true"
                    :invalid="submitted && !saimaTemplate.enText" rows="4" fluid/>
          <small v-if="submitted && !saimaTemplate.enText" class="text-red-500">Текст на английском языке обязателен.</small>
        </div>

        <div>
          <label for="kgText" class="block font-bold mb-3">Текст (Кыргызский)</label>
          <Textarea id="kgText" v-model.trim="saimaTemplate.kgText" required="true"
                    :invalid="submitted && !saimaTemplate.kgText" rows="4" fluid/>
          <small v-if="submitted && !saimaTemplate.kgText" class="text-red-500">Текст на кыргызском языке обязателен.</small>
        </div>
      </div>

      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideDialog"/>
        <Button label="Сохранить" icon="pi pi-check" @click="saveSaimaTemplate"/>
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteSaimaTemplateDialog" :style="{ width: '450px' }" header="Подтверждение" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl"/>
        <span v-if="saimaTemplate"
        >Вы точно хотите удалить шаблон <b>{{ saimaTemplate.name }}</b>?</span>
      </div>
      <template #footer>
        <Button label="Нет" icon="pi pi-times" text @click="deleteSaimaTemplateDialog = false"/>
        <Button label="Да" icon="pi pi-check" @click="deleteSaimaTemplate"/>
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