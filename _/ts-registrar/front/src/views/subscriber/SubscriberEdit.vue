<script lang="ts" setup>
import {onMounted, ref, computed, watch} from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRoute, useRouter } from 'vue-router';
import { useSubscriberStore } from '@/stores/subscribers.store';
import SubscriberService from '@/services/subscriber.service';
import { UploadPhotoType } from '@/models/subscriber.model';
import type { PersonificationUploadModel, UpdatePersonificationModel } from '@/models/subscriber.model';
import useSubscriberValidation from '@/helpers/useSubscriberValidation';
import EnumsService from "@/services/enums.service.ts";
import PersonificationTemplateCategoryService from '@/services/dictionary/personification-template-category.service'
import PersonificationTemplateService from '@/services/dictionary/personification-template.service'
import CountryService from "@/services/dictionary/country.service.ts";

const { errors, validateSubscriber } = useSubscriberValidation();
const templateCategoryService = new PersonificationTemplateCategoryService()
const templateService = new PersonificationTemplateService()

const store = useSubscriberStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const subscriber = ref(store.current || {});
const uploads = ref<PersonificationUploadModel[]>([]);
const loading = ref(false);
const isEditMode = computed(() => route.name === 'subscriber-edit');
const enumsService = new EnumsService();
const countryService = new CountryService();
const documentTypes = ref([]);
const countries = ref();
const subscriberService = new SubscriberService();
const isValidated = ref(false);
const showValidationDialog = ref(false);
const validationDialogMessage = ref('');
const initialPersStatusName = ref('');

const getUploadByType = (type: UploadPhotoType): PersonificationUploadModel | undefined => {
  return uploads.value.find((upload: PersonificationUploadModel) => upload.fileType === type);
};

const loadData = async () => {
  try {
    loading.value = true;
    const id = +route.params.id;
    const data = await subscriberService.findById(id);
    subscriber.value = data;
    initialPersStatusName.value = data.persStatusName;
    if (data.templateCategoryId) {
      selectedCategory.value = data.templateCategoryId;
      await loadTemplates();
    }
    if (data.templateId) {
      selectedTemplate.value = data.templateId;
    }
    if (typeof subscriber.value.birthDate === 'string') {
      const [day, month, yearAndTime] = subscriber.value.birthDate.split('.');
      const [year, time] = yearAndTime.split(' ');
      const [hours = '0', minutes = '0'] = (time || '').split(':');
      subscriber.value.birthDate = new Date(+year, +month - 1, +day, +hours, +minutes);
    }

    if (typeof subscriber.value.issueDate === 'string') {
      const [day, month, yearAndTime] = subscriber.value.issueDate.split('.');
      const [year, time] = yearAndTime.split(' ');
      const [hours = '0', minutes = '0'] = (time || '').split(':');
      subscriber.value.issueDate = new Date(+year, +month - 1, +day, +hours, +minutes);
    }
    if (subscriber.value.id) {
      uploads.value = await subscriberService.getUploadsWithContent(id);
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: error.message,
      life: 4000 });
  } finally {
    loading.value = false;
  }
};

const handleValidate = () => {
  const isValid = validateSubscriber(subscriber.value, uploads.value.length);
  isValidated.value = isValid;
  if (!isValid) {
    const errorList = Object.values(errors.value).filter(msg => typeof msg === 'string' && msg);

    validationDialogMessage.value = `Обнаружены ошибки:\n${errorList}`;
  } else {
    validationDialogMessage.value = 'Данные корректны, ошибок не найдено!';
  }
  showValidationDialog.value = true;
};

const handleSave = async () => {
  if (!isValidated.value) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Пожалуйста, сначала выполните валидацию!',
      life: 4000 });
    return;
  }
  if (isTemplateSelectionEnabled.value) {
    if (!selectedCategory.value) {
      templateCategoryError.value = "Не выбрана классификация шаблона!"
      return false
    }
    if (!selectedTemplate.value) {
      templateCategoryError.value = "Не выбран шаблон ответа!"
      return false
    }
  }
  loading.value = true;
  try {
    const model: UpdatePersonificationModel = {
      id: subscriber.value.id,
      firstName: subscriber.value.firstName,
      lastName: subscriber.value.lastName,
      middleName: subscriber.value.middleName,
      birthDate: formatDateForSend(subscriber.value.birthDate),
      address: subscriber.value.address,
      inn: subscriber.value.inn,
      documentType: subscriber.value.documentType,
      documentId: subscriber.value.documentId,
      issueDate: formatDateForSend(subscriber.value.issueDate),
      countryName: subscriber.value.countryCode,
      authority: subscriber.value.authority,
      persStatus: subscriber.value.persStatusName,
      templateCategoryId: selectedCategory.value,
      comments: subscriber.value.comment,
    };

    await subscriberService.updatePersonification(subscriber.value.id, model);
    toast.add({ severity: 'success', summary: 'Успех', detail: 'Данные обновлены!',
      life: 4000 });
    router.push({ name: 'subscriber' });
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: error.message,
      life: 4000 });
  } finally {
    loading.value = false;
  }

};

const handleCancel = () => {
  router.go(-1);
};


const handleClose = () => {
  router.go(-1);
};

const selectedCategory = ref<number | null>(null)
const selectedTemplate = ref<string | null>(null)
const templateCategories = ref<any[]>([])
const templates = ref<any[]>([])
const templateCategoryError = ref('')
const loadingTemplates = ref(false)
const isTemplateSelectionEnabled = computed(() => {
  return ['REJECTED', 'FOR_CORRECTION'].includes(subscriber.value.persStatusName)
})
const persStatusName = ref([]);

function findAllDocumentTypes() {
  enumsService.findAllDocumentTypes().then((data) => {
    documentTypes.value = data;
  }).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка загрузки типов документов',
      detail: error,
      life: 5000
    });
  });
}

async function findAllCountries() {
  try {
    const data = await countryService.findAll();
    countries.value = [...data];

  } catch (error) {
    console.error('Failed to load countries:', error);
    toast.add({
      severity: 'error',
      summary: 'Ошибка загрузки стран',
      detail: error.message || 'Неизвестная ошибка',
      life: 5000
    });
  }
}

function filterDocumentTypeCallback(value: any) {
  subscriber.value.documentType = value?.value || null;
}
function changeCountryCallback(value: any) {
  subscriber.value.countryCode = value?.value || null;
}
function filterPersStatusCallback(value: any) {
  subscriber.value.persStatusName = value?.value || null;

}

onMounted(async () => {
  await loadTemplateCategories()
  findAllDocumentTypes();
  findAllPersonificationStatus();
  findAllCountries();
  loadData();
});

const loadTemplateCategories = async () => {
  try {
    templateCategories.value = await templateCategoryService.findAll()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка загрузки категорий',
      detail: error.message,
      life: 5000
    })
  }
}

const loadTemplates = async () => {
  if (!selectedCategory.value || !subscriber.value.registrarMsisdn) {
    templates.value = []
    return
  }

  loadingTemplates.value = true
  try {
    const response = await templateService.findAllByCategoryId({
      categoryId: selectedCategory.value,
      msisdn: subscriber.value.registrarMsisdn
    });

    templates.value = Object.entries(response).map(([name, text]) => ({
      name,
      text
    }));

    templateCategoryError.value = ''
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка загрузки шаблонов',
      detail: error.message,
      life: 5000
    });
    templateCategoryError.value = 'Не удалось загрузить шаблоны'
  } finally {
    loadingTemplates.value = false
  }
}

const updateComment = () => {
  if (!selectedTemplate.value) {
    subscriber.value.comment = ''
    return
  }

  let comment = selectedTemplate.value
  if (subscriber.value.nextRegistrationDate) {
    comment = comment.replace("${availableAt}", subscriber.value.nextRegistrationDate)
  }
  subscriber.value.comment = comment
}

watch(() => subscriber.value.persStatusName, (newState) => {
  if (!['REJECTED', 'FOR_CORRECTION'].includes(newState)) {
    resetTemplateSelection()
  }
})

const resetTemplateSelection = () => {
  selectedCategory.value = null
  selectedTemplate.value = null
  templates.value = []
  templateCategoryError.value = ''
  subscriber.value.comment = ''
}

function findAllPersonificationStatus() {
  enumsService.findAllPersonificationStatus().then((data) => {
    persStatusName.value = data;
  }).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка загрузки статусов',
      detail: error,
      life: 5000
    });
  });
}
function formatDateForSend(date: Date | string | null): string | null {
  if (!date) return null;
  if (date instanceof Date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }
  return date;
}
</script>

<template>
  <div class="p-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Левая колонка: Информация -->
      <Card class="h-full">
        <template #title>
          <h2 class="text-2xl font-bold">Абонентский номер</h2>
        </template>
        <template #content>
          <div class="grid grid-nogutter">
            <label class="control-label col-lg-4 btn btn-primary mb-5 pl-2" v-if="subscriber?.isSimCardGift">
              Симкарта с подарком
              <i class="pi pi-gift"></i>

            </label>
            <div class="grid grid-cols-2 gap-4 mb-3 p-2">
              <div>
                <label class="block font-bold" for="lastName">Фамилия:</label>
                <InputText id="lastName" v-model="subscriber.lastName" class="w-full"
                           :class="{'bg-white': isEditMode, 'bg-gray-100': !isEditMode}"
                           :readonly="!isEditMode"/>
                <small class="p-error">{{ errors.lastName }}</small>
              </div>
              <div>
                <label class="block" for="firstName">Имя:</label>
                <InputText id="firstName" v-model="subscriber.firstName" class="w-full"
                           :class="{'bg-white': isEditMode, 'bg-gray-100': !isEditMode}"
                           :readonly="!isEditMode"/>
                <small class="p-error">{{ errors.firstName }}</small>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-3 p-2">
              <div>
                <label class="block" for="middleName">Отчество:</label>
                <InputText id="middleName" v-model="subscriber.middleName" class="w-full"
                           :class="{'bg-white': isEditMode, 'bg-gray-100': !isEditMode}"
                           :readonly="!isEditMode"/>
                <small class="p-error">{{ errors.middleName }}</small>
              </div>
              <div>
                <label class="block" for="birthDate">Дата рождения:</label>
                <Calendar id="birthDate" v-model="subscriber.birthDate" class="w-full" dateFormat="dd.mm.yy"
                          :disabled="!isEditMode"/>
                <small class="p-error">{{ errors.birthDate }}</small>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-3 p-2 items-end">
              <div>
                <label class="block font-bold" for="address">Адрес:</label>
                <InputText id="address" v-model="subscriber.address" class="w-full"
                           :class="{'bg-white': isEditMode, 'bg-gray-100': !isEditMode}"
                           :readonly="!isEditMode"/>
                <small class="p-error">{{ errors.address }}</small>
              </div>


            </div>

            <Divider/>

            <div class="grid grid-cols-2 gap-4 mb-3 p-2">
              <div>
                <label class="block" for="msisdn">Номер:</label>
                <InputText id="msisdn" v-model="subscriber.msisdn" class="w-full inactive-field"
                           readonly/>
              </div>
              <div>
                <label class="block" for="ban">BAN номер:</label>
                <InputText id="ban" v-model="subscriber.ban" class="w-full inactive-field"
                           readonly/>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-3 p-2">
              <div>
                <label class="block" for="simcartIcc">ICC симкарты:</label>
                <InputText id="simcartIcc" v-model="subscriber.simcartIcc" class="w-full inactive-field"
                           readonly/>
              </div>
              <div>
                <label class="block" for="pricePlanName">Тарифный план:</label>
                <InputText id="tariffName" v-model="subscriber.pricePlanName" class="w-full inactive-field"
                           readonly/>
              </div>
            </div>

            <Divider/>

            <div class="grid grid-cols-2 gap-4 mb-3 p-2">
              <div>
                <label class="block" for="inn">ИНН:</label>
                <InputText id="inn" v-model="subscriber.inn" class="w-full"
                           :class="{'bg-white': isEditMode, 'bg-gray-100': !isEditMode}"
                           :readonly="!isEditMode"/>
                <small class="p-error">{{ errors.inn }}</small>

              </div>
              <div>
                <label class="block" for="documentType">Тип документа:</label>
                <Dropdown
                    id="documentType"
                    v-model="subscriber.documentType"
                    :options="documentTypes"
                    optionLabel="name"
                    optionValue="name"
                    placeholder="Выберите тип документа"
                    class="w-full"
                    :disabled="!isEditMode"
                    @change="filterDocumentTypeCallback"
                />
                <small class="p-error">{{ errors.documentType }}</small>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-3 p-2">
              <div>
                <label class="block" for="documentId">Номер документа:</label>
                <InputText id="documentId" v-model="subscriber.documentId" class="w-full"
                           :class="{'bg-white': isEditMode, 'bg-gray-100': !isEditMode}"
                           :readonly="!isEditMode"/>
                <small class="p-error">{{ errors.documentId }}</small>

              </div>

              <div>
                <label class="block" for="countryCode">Страна:</label>
                <Dropdown
                    id="countryCode"
                    v-model="subscriber.countryCode"
                    :options="countries"
                    optionLabel="name"
                    optionValue="name"
                    placeholder="Выберите страну"
                    class="w-full"
                    :disabled="!isEditMode"
                    @change="changeCountryCallback"
                />
              </div>
            </div>


            <div class="grid grid-cols-2 gap-4 mb-3 p-2">
              <div>
                <label class="block" for="authority">Орган выдачи:</label>
                <InputText id="authority" v-model="subscriber.authority" class="w-full"
                           :class="{'bg-white': isEditMode, 'bg-gray-100': !isEditMode}"
                           :readonly="!isEditMode"/>
                <small class="p-error">{{ errors.authority }}</small>

              </div>
              <div>
                <label class="block" for="issueDate">Дата выдачи:</label>
                <Calendar id="issueDate"
                          v-model="subscriber.issueDate"
                          class="w-full"
                          dateFormat="dd.mm.yy"
                          :disabled="!isEditMode"
                          :class="{'p-invalid': errors.issueDate}"/>
                <small class="p-error">{{ errors.issueDate }}</small>
              </div>
            </div>

            <Divider/>

            <div class="grid grid-cols-1 gap-4 mb-4 p-2">
              <div v-if="isEditMode">
                <label class="block font-medium" for="templateCategory">Классификация шаблона:</label>
                <Dropdown
                    id="templateCategory"
                    v-model="selectedCategory"
                    :options="templateCategories"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="--Выберите классификацию шаблонов--"
                    class="w-full"
                    :disabled="!isTemplateSelectionEnabled"
                    @change="loadTemplates"
                />
                <small v-if="templateCategoryError" class="p-error">{{ templateCategoryError }}</small>
              </div>

              <div v-if="isEditMode">
                <label class="block font-medium" for="template">Шаблон ответа:</label>
                <Dropdown
                    id="template"
                    v-model="selectedTemplate"
                    :options="templates"
                    optionLabel="name"
                    optionValue="text"
                    placeholder="--Выберите шаблон--"
                    class="w-full"
                    :disabled="!isTemplateSelectionEnabled || loadingTemplates"
                    :loading="loadingTemplates"
                    @change="updateComment"
                />
              </div>

              <div>
                <label class="block font-medium" for="comment">Комментарий:</label>
                <Textarea
                    id="comment"
                    v-model="subscriber.comment"
                    class="w-full"
                    :class="{'bg-white': isEditMode, 'bg-gray-100': !isEditMode}"
                    :readonly="!isEditMode"
                    rows="4"
                />
              </div>

              <div>
                <label class="block" for="persStatusName">Статус:</label>
                <Dropdown
                    id="persStatusName"
                    v-model="subscriber.persStatusName"
                    :options="persStatusName"
                    optionLabel="name"
                    optionValue="value"
                    placeholder="Выберите cтатус"
                    class="w-full"
                    :disabled="!isEditMode"
                    @change="filterPersStatusCallback"
                />
              </div>
            </div>

            <div v-if="subscriber.persState === 'ACCEPTED' && isEditMode" class="mb-4">
              <Message :closable="false" severity="error">
                Регистрация невозможна, данный абонент уже принят!
              </Message>
            </div>

            <div class="mb-4">
              <Message>
                Мобильный Регистратор: {{ subscriber.registrarMsisdn }}, WEB Регистратор: {{ subscriber.webRegistrar }}
              </Message>
            </div>

            <div v-if=" (!subscriber.canEdit || !(initialPersStatusName === 'SELECTED' || initialPersStatusName === 'PENDING')) && isEditMode" class="mb-4">
              <Message :closable="false" severity="error">
                Внимание! Редактирование данного абонента невозможно!
                <br>
                Данный абонент заблокирован WEB Регистратором: {{ subscriber.webRegistrar }}
              </Message>
            </div>
          </div>
        </template>
      </Card>

      <Card class="h-full">
        <template #title>
          <h2 class="text-2xl font-bold">Документы абонента</h2>
          <small class="p-error">{{ errors.uploads }}</small>

        </template>
        <template #content>
          <TabView>
            <TabPanel>
              <template #header>
                <span class="text-lg font-semibold">Документы</span>
              </template>

              <div class="image-background shadow rounded-lg p-4 mb-6">
                <p class="text-center font-semibold mb-3">Фото документа (лицевая сторона)</p>
                <div class="flex justify-center p-4 rounded">
                  <Image
                      v-if="getUploadByType(UploadPhotoType.PHOTO_DOCUMENT_FACE_SIDE)"
                      :src="`data:${getUploadByType(UploadPhotoType.PHOTO_DOCUMENT_FACE_SIDE)?.contentType};base64,${getUploadByType(UploadPhotoType.PHOTO_DOCUMENT_FACE_SIDE)?.fileContent}`"
                      alt="Фото документа (лицевая сторона)"
                      class="border rounded object-contain cursor-pointer"
                      imageClass="max-w-full max-h-[300px]"
                      preview
                  />
                  <div v-else class="text-gray-500 p-4">Фото не загружено</div>
                </div>
              </div>
              <Divider/>

              <div class="image-background shadow rounded-lg p-4 mb-6">
                <p class="text-center font-semibold mb-3">Фото документа (оборотная сторона)</p>

                <div class="flex justify-center p-4 rounded">
                  <Image
                      v-if="getUploadByType(UploadPhotoType.PHOTO_DOCUMENT_BACK_SIDE)"
                      :src="`data:${getUploadByType(UploadPhotoType.PHOTO_DOCUMENT_BACK_SIDE)?.contentType};base64,${getUploadByType(UploadPhotoType.PHOTO_DOCUMENT_BACK_SIDE)?.fileContent}`"
                      alt="Фото документа (лицевая сторона)"
                      class="border rounded object-contain cursor-pointer"
                      imageClass="max-w-full max-h-[300px]"
                      preview
                  />
                  <div v-else class="text-gray-500 p-4">Фото не загружено</div>
                </div>
              </div>
              <Divider/>

              <div class="image-background shadow rounded-lg p-4 mb-6">
                <p class="text-center font-semibold mb-3">Цифровой документ</p>

                <div class="flex justify-center p-4 rounded">
                  <Image
                      v-if="getUploadByType(UploadPhotoType.DIGITAL_DOCUMENT)"
                      :src="`data:${getUploadByType(UploadPhotoType.DIGITAL_DOCUMENT)?.contentType};base64,${getUploadByType(UploadPhotoType.DIGITAL_DOCUMENT)?.fileContent}`"
                      alt="Фото документа (лицевая сторона)"
                      class="border rounded object-contain cursor-pointer"
                      imageClass="max-w-full max-h-[300px]"
                      preview
                  />
                  <div v-else class="text-gray-500 p-4">Фото не загружено</div>
                </div>
              </div>
              <Divider/>

              <div class="image-background shadow rounded-lg p-4 mb-6">
                <p class="text-center font-semibold mb-3">Разворот паспорта (для иностранцев)</p>

                <div class="flex justify-center p-4 rounded">
                  <Image
                      v-if="getUploadByType(UploadPhotoType.PHOTO_DOCUMENT_SPREAD)"
                      :src="`data:${getUploadByType(UploadPhotoType.PHOTO_DOCUMENT_SPREAD)?.contentType};base64,${getUploadByType(UploadPhotoType.PHOTO_DOCUMENT_SPREAD)?.fileContent}`"
                      alt="Фото документа (лицевая сторона)"
                      class="border rounded object-contain cursor-pointer"
                      imageClass="max-w-full max-h-[300px]"
                      preview
                  />
                  <div v-else class="text-gray-500 p-4">Фото не загружено</div>
                </div>
              </div>
              <Divider />

              <div class="image-background shadow rounded-lg p-4 mb-6">
                <p class="text-center font-semibold mb-3">Дополнительные фотографии (для иностранцев)</p>

                <div class="flex justify-center p-4 rounded">
                  <Image
                      v-if="getUploadByType(UploadPhotoType.PHOTO_ADDITIONAL)"
                      :src="`data:${getUploadByType(UploadPhotoType.PHOTO_ADDITIONAL)?.contentType};base64,${getUploadByType(UploadPhotoType.PHOTO_ADDITIONAL)?.fileContent}`"
                      alt="Фото документа (лицевая сторона)"
                      class="border rounded object-contain cursor-pointer"
                      imageClass="max-w-full max-h-[300px]"
                      preview
                  />
                  <div v-else class="text-gray-500 p-4">Фото не загружено</div>
                </div>
              </div>
            </TabPanel>

            <TabPanel>
              <template #header>
                <span class="text-lg font-semibold">Фото абонента</span>
              </template>

              <div class="image-background shadow rounded-lg p-4 mb-6">
                <p class="text-center font-semibold mb-3">Фото абонента с паспортом</p>

                <div class="flex justify-center p-4 rounded">
                  <Image
                      v-if="getUploadByType(UploadPhotoType.PHOTO_ABONENT_WITH_DOCUMENT)"
                      :src="`data:${getUploadByType(UploadPhotoType.PHOTO_ABONENT_WITH_DOCUMENT)?.contentType};base64,${getUploadByType(UploadPhotoType.PHOTO_ABONENT_WITH_DOCUMENT)?.fileContent}`"
                      alt="Фото документа (лицевая сторона)"
                      class="border rounded object-contain cursor-pointer"
                      imageClass="max-w-full max-h-[300px]"
                      preview
                  />
                  <div v-else class="text-gray-500 p-4">Фото не загружено</div>
                </div>
              </div>
              <Divider/>
              <div class="image-background shadow rounded-lg p-4 mb-6">
                <p class="text-center font-semibold mb-3">Фото GRS</p>

                <div class="flex justify-center p-4 rounded">
                  <Image
                      v-if="getUploadByType(UploadPhotoType.GRS_PHOTO)"
                      :src="`data:${getUploadByType(UploadPhotoType.GRS_PHOTO)?.contentType};base64,${getUploadByType(UploadPhotoType.GRS_PHOTO)?.fileContent}`"
                      alt="Фото документа (лицевая сторона)"
                      class="border rounded object-contain cursor-pointer"
                      imageClass="max-w-full max-h-[300px]"
                      preview
                  />
                  <div v-else class="text-gray-500 p-4">Фото не загружено</div>
                </div>
              </div>
            </TabPanel>
          </TabView>
        </template>
      </Card>
    </div>

    <div class="flex justify-end gap-3 mt-4">
      <Button
          v-if="isEditMode"
          class="p-button-secondary"
          icon="pi pi-times"
          label="Отменить"
          @click="handleCancel"
      />
      <Button
          v-if="isEditMode"
          class="p-button-info"
          icon="pi pi-check"
          label="Валидация"
          @click="handleValidate"
      />
      <Button
          v-if="isEditMode"
          :disabled="!subscriber.canEdit || (subscriber.persStatusName  === 'SELECTED' || subscriber.persStatusName  === 'PENDING') || !(initialPersStatusName === 'SELECTED' || initialPersStatusName === 'PENDING')"
          class="p-button-primary"
          icon="pi pi-check"
          label="Сохранить"
          @click="handleSave"
      />
      <Button
          v-if="!isEditMode"
          class="p-button-secondary"
          icon="pi pi-times"
          label="Закрыть"
          @click="handleClose"
      />
    </div>
    <Dialog v-model:visible="showValidationDialog" header="Результат валидации" modal>
      <pre>{{ validationDialogMessage }}</pre>
      <template #footer>
        <Button label="OK" @click="showValidationDialog = false" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.field {
  margin-bottom: 1rem;
}

label {
  font-weight: bold;
  margin-bottom: 0.25rem;
  display: block;
}

:deep(.p-inputtext[readonly].p-inputtextarea) {
  background-color: #f3f4f6 !important;
  color: #6b7280 !important;
}

:deep(.p-dropdown[disabled]) {
  background-color: #f3f4f6 !important;
  color: #6b7280 !important;
}

:deep(.p-calendar[disabled]) {
  background-color: #f3f4f6 !important;
  color: #6b7280 !important;
}

:deep(.p-calendar[disabled] .p-inputtext) {
  background-color: #f3f4f6 !important;
  color: #6b7280 !important;
}

.p-textarea[readonly] {
  background-color: #f3f4f6 !important;
  color: #6b7280 !important;
  border-color: #e5e7eb !important;
}

:deep(.p-inputtextarea:not([readonly])) {
  background-color: white !important;
}

.p-error {
  color: #f44336;
  font-size: 12px;
}

:deep(.p-inputtext[readonly]) {
  background-color: #f3f4f6 !important;
  color: var(--text-color) !important;
  border-color: var(--surface-border) !important;
}

:deep(.p-inputtext[readonly]:not(.p-invalid)) {
  background-color: var(--surface-100) !important;
}

.image-background {
  @apply bg-gray-100 dark:bg-black;
}

.inactive-field {
  @apply bg-gray-100 dark:bg-gray-800;
  color: inherit;
  cursor: not-allowed;
  opacity: 0.8;
}

.dark .inactive-field {
  @apply bg-gray-800;
  color: #e5e7eb;
}
</style>