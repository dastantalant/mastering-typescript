<script setup>
import {FilterMatchMode} from '@primevue/core/api';
import {useToast} from 'primevue/usetoast';
import {onMounted, ref, computed} from 'vue';
import GiftSimCardService from '../../services/dictionary/gift-sim-card.service.js';
import EntityChanges from '../../components/EntityChanges.vue';
const toast = useToast();
const dt = ref();
const giftSimCards = ref();
const giftSimCardDialog = ref(false);
const deleteGiftSimCardDialog = ref(false);
const GiftSimCard = ref({});
const filters = ref({
  global: {value: null, matchMode: FilterMatchMode.CONTAINS}
});
const submitted = ref(false);
const entityChangesDialog = ref(false);
const entityChanges = ref();
const loadingEntityChangesId = ref(null);
const giftStatusOptions = ref([
  {
    value: 'ACTIVE',
    label: 'Активный',
    severity: 'success'
  },
  {
    value: 'INACTIVE',
    label: 'Неактивный',
    severity: 'danger'
  }
]);


function getGiftStatusConfig(status) {
  return giftStatusOptions.value.find(option => option.value === status);
}

function getGiftStatusLabel(status) {
  return getGiftStatusConfig(status)?.label || status;
}

function getGiftStatusSeverity(status) {
  return getGiftStatusConfig(status)?.severity || null;
}

const giftSimCardService = new GiftSimCardService();

onMounted(() => {
  findAll();
});

function findAll() {
  giftSimCardService.findAll().then((data) => (giftSimCards.value = data)).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

function openNew() {
  GiftSimCard.value = {};
  submitted.value = false;
  giftSimCardDialog.value = true;
}

function hideDialog() {
  giftSimCardDialog.value = false;
  submitted.value = false;
}

function saveGiftSimCard() {
  submitted.value = true;

  if (GiftSimCard?.value.giftName?.trim() &&
      GiftSimCard?.value.giftSimCardStatus) {
    giftSimCardService
        .save(GiftSimCard.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Подарок сохранен',
            life: 3000
          });
          findAll();
          giftSimCardDialog.value = false;
          GiftSimCard.value = {};
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
    entityChanges.value = await giftSimCardService.findHistoryById(reason.id);
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

function editGiftSimCard(giftSimCard) {
  GiftSimCard.value = {...giftSimCard};
  giftSimCardDialog.value = true;
}

function confirmDeleteGiftSimCard(giftSimCard) {
  GiftSimCard.value = giftSimCard;
  deleteGiftSimCardDialog.value = true;
}

function deleteGiftSimCard() {
  giftSimCardService
      .delete(GiftSimCard.value.id)
      .then(() => {
        giftSimCards.value = giftSimCards.value.filter((val) => val.id !== GiftSimCard.value.id);
        deleteGiftSimCardDialog.value = false;
        GiftSimCard.value = {};
        toast.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Подарок удален',
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
          :value="giftSimCards"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Показано с {first} по {last} из {totalRecords} подарков"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Список подарков</h4>
            <IconField>
              <InputIcon>
                <i class="pi pi-search"/>
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Поиск..."/>
            </IconField>
          </div>
        </template>

        <Column field="id" header="ID" sortable style="min-width: 8rem"></Column>
        <Column field="giftName" header="Название подарка" sortable style="min-width: 16rem"></Column>
        <Column field="giftSimCardStatus" header="Статус подарка" sortable style="min-width: 16rem">
          <template #body="slotProps">
            <Tag
                :value="getGiftStatusLabel(slotProps.data.giftSimCardStatus)"
                :severity="getGiftStatusSeverity(slotProps.data.giftSimCardStatus)"
            />
          </template>
        </Column>
        <Column field="createdAt" header="Дата создания подарка" sortable style="min-width: 16rem"></Column>
        <Column :exportable="false" style="min-width: 16rem">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editGiftSimCard(slotProps.data)"
                    v-tooltip="'Редактировать'"/>
            <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2"
                    @click="confirmDeleteGiftSimCard(slotProps.data)"
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

    <Dialog v-model:visible="giftSimCardDialog" :style="{ width: '600px' }" header="Детали подарка" :modal="true">
      <div class="flex flex-col gap-6">
        <div>
          <label for="giftName" class="block font-bold mb-3">Название подарка</label>
          <InputText id="giftName" v-model.trim="GiftSimCard.giftName" required="true"
                     :invalid="submitted && !GiftSimCard.giftName" fluid/>
          <small v-if="submitted && !GiftSimCard.giftName" class="text-red-500">Название подарка обязательно.</small>
        </div>

        <div>
          <label for="giftSimCardStatus" class="block font-bold mb-3">Статус подарка</label>
          <Select id="giftSimCardStatus" v-model="GiftSimCard.giftSimCardStatus"
                  :options="giftStatusOptions" optionLabel="label" optionValue="value"
                  placeholder="Выберите статус"
                  :invalid="submitted && !GiftSimCard.giftSimCardStatus" fluid>
            <template #option="slotProps">
              <Tag
                  :value="slotProps.option.label"
                  :severity="slotProps.option.severity"
              />
            </template>
          </Select>
          <small v-if="submitted && !GiftSimCard.giftSimCardStatus" class="text-red-500">Статус подарка обязателен.</small>
        </div>
      </div>

      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="hideDialog"/>
        <Button label="Сохранить" icon="pi pi-check" @click="saveGiftSimCard"/>
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteGiftSimCardDialog" :style="{ width: '450px' }" header="Подтверждение" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl"/>
        <span v-if="GiftSimCard"
        >Вы точно хотите удалить подарок <b>{{ GiftSimCard.giftName }}</b
        >?</span
        >
      </div>
      <template #footer>
        <Button label="Нет" icon="pi pi-times" text @click="deleteGiftSimCardDialog = false"/>
        <Button label="Да" icon="pi pi-check" @click="deleteGiftSimCard"/>
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