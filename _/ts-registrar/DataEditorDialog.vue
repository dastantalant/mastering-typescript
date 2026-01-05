<!-- @/components/DataEditorDialog.vue -->
<script setup lang="ts" generic="T extends Record<string, any>">
import {computed, ref, watch} from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Tag from 'primevue/tag';
import Image from 'primevue/image';
import Textarea from 'primevue/textarea';
import Tabs from "primevue/tabs";
import Message from 'primevue/message';
import {DateTime} from 'luxon';
import MultiSelect from 'primevue/multiselect';
import Divider from 'primevue/divider';

export type MessageSeverity = 'success' | 'info' | 'warn' | 'error';

export interface TopMessage {
  text: string;
  severity: MessageSeverity;
}

export interface Photo {
  id: string;
  name: string;
  type: string;
  url?: string;
}

export interface SelectOption {
  label: string;
  value: any;

  [key: string]: any;
}

export interface Context<T extends Record<string, any>> {
  formData: T;
  editData: T;
  isEditing: boolean;
}

export interface DialogAction<T extends Record<string, any>> {
  label: string;
  icon?: string;
  class?: string;
  visible?: 'view' | 'edit' | 'always' | ((context: Context<T>) => boolean);
  action: (context: Context<T>) => void;
}

export type Divider = { type: 'divider'; label?: string; };

export type FormButton<T extends Record<string, any>> = {
  type: 'button';
  label: string;
  icon?: string;
  class?: string;
  action: (context: Context<T>) => void;
  displayCondition?: (context: Context<T>) => boolean;
  disabledCondition?: (context: Context<T>) => boolean;
  loadingCondition?: (context: Context<T>) => boolean;
};

export type FormField<T extends Record<string, any>> = {
  field: string;
  label: string;
  defaultValue?: any;
  required?: boolean | string;
  requiredCondition?: (context: Context<T>) => boolean;
  disabled?: boolean;
  editable?: boolean;
  displayCondition?: (context: Context<T>) => boolean;
  disabledCondition?: (context: Context<T>) => boolean;
  onChange?: (newValue: any, context: Context<T>) => void;
  validation?: {
    pattern?: RegExp; patternMessage?: string;
    min?: number; minMessage?: string;
    max?: number; maxMessage?: string;
    len?: number; lenMessage?: string;
    validator?: (newValue: any, context: Context<T>) => string | null | undefined;
  };
  warning?: (newValue: any, context: Context<T>) => string | null | undefined;
} & (
    { type: 'textarea', autoResize?: boolean, rows?: number, } |
    { type: 'text' | 'number' | 'tag' } |
    { type: 'date', dateFormat?: string, showTime?: boolean } |
    {
      type: 'select' | 'dropdown' | 'multiselect';
      options: (string | SelectOption)[];
      optionLabel?: string;
      optionValue?: string;
      filter?: boolean;
      showClear?: boolean;
    } |
    {
      type: 'dependent-select';
      masterField: string;
      options: Record<string, (string | SelectOption)[]>;
      optionLabel?: string;
      optionValue?: string;
      showClear?: boolean;
    }
    );

export interface DialogConfig<T extends Record<string, any>> {
  title: string | number;
  fields: (FormField<T> | Divider | FormButton<T>)[];
  photos?: Photo[];
  extraActions?: DialogAction<T>[];
  isRecordEditable?: boolean;
  onBeforeEdit?: (context: Context<T>) => Promise<T | void>;
}

interface Props<T extends Record<string, any>> {
  visible: boolean;
  loading?: boolean;
  topMessage?: TopMessage | null;
  config: DialogConfig<T>;
  initialData?: T;
}

const props = defineProps<Props<T>>();

const emit = defineEmits(['update:visible', 'save', 'cancel']);

const isEditing = ref(false);
const formData = ref<T>({} as T);
const editData = ref<T>({} as T);
const errors = ref<Record<string, string>>({});
const warnings = ref<Record<string, string>>({});
const isStartingEdit = ref(false);

const isRecordEditable = computed(() => props.config.isRecordEditable ?? true);

const formFieldsOnly = computed(() => {
  return props.config.fields.filter(
      f => f.type !== 'divider' && f.type !== 'button'
  ) as FormField<T>[];
});

const getContext = (): Context<T> => ({
  editData: editData.value,
  formData: formData.value,
  isEditing: isEditing.value,
});

const applyDefaults = (data: T): T => {
  const result: Record<string, any> = {...data};
  formFieldsOnly.value.forEach(field => {
    if (field.defaultValue !== undefined && (result[field.field] === undefined || result[field.field] === null)) {
      result[field.field] = typeof field.defaultValue === 'function' ? field.defaultValue() : JSON.parse(JSON.stringify(field.defaultValue));
    }
  });
  return result as T;
};

watch(() => props.initialData, (newData) => {
  const baseData = newData ? JSON.parse(JSON.stringify(newData)) : {} as T;
  formData.value = applyDefaults(baseData);
}, {immediate: true, deep: true});

const revalidateConditionalFields = () => {
  formFieldsOnly.value.forEach(field => {
    if (field.requiredCondition || field.validation?.validator || field.warning) {
      validateField(field);
      checkFieldWarning(field);
    }
  });
};

const handleFieldBlur = (fieldDef: FormField<T>) => {
  validateField(fieldDef);
  checkFieldWarning(fieldDef);
  revalidateConditionalFields();
};

const onFieldValueUpdate = (fieldDef: FormField<T>, newValue: any) => {
  validateField(fieldDef);
  checkFieldWarning(fieldDef);
  formFieldsOnly.value.forEach(dependentField => {
    if (dependentField.type === 'dependent-select' && dependentField.masterField === fieldDef.field) {
      (editData.value as any)[dependentField.field] = null;
      validateField(dependentField);
    }
  });
  revalidateConditionalFields();
  if (fieldDef.onChange) {
    fieldDef.onChange(newValue, getContext());
  }
};

const startEditing = async () => {
  if (isStartingEdit.value) return;
  isStartingEdit.value = true;
  try {
    let dataForEditing = formData.value;
    if (props.config.onBeforeEdit) {
      const updatedData = await props.config.onBeforeEdit(getContext());
      if (updatedData) {
        formData.value = JSON.parse(JSON.stringify(updatedData));
        dataForEditing = updatedData;
      }
    }
    editData.value = JSON.parse(JSON.stringify(dataForEditing));
    isEditing.value = true;
    formFieldsOnly.value.forEach(field => checkFieldWarning(field));
    validateForm();
  } catch (error) {
    console.error('Ошибка при подготовке к редактированию:', error);
  } finally {
    isStartingEdit.value = false;
  }
};

const cancelEditing = () => {
  isEditing.value = false;
  errors.value = {};
  warnings.value = {};
  editData.value = {} as T;
};

const validateField = (fieldDef: FormField<T>): boolean => {
  const {field, label, validation} = fieldDef;
  const value = (editData.value as any)[field];
  let error = '';
  const isRequired = fieldDef.required && (!fieldDef.requiredCondition || fieldDef.requiredCondition(getContext()));
  if (isRequired && (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0))) {
    error = typeof fieldDef.required === 'string' ? fieldDef.required : `Поле "${label}" обязательно для заполнения`;
  } else if (value !== null && value !== undefined && value !== '') {
    if (validation) {
      if (validation.validator) {
        const customError = validation.validator(value, getContext());
        if (customError) {
          error = customError;
        }
      }

      if (!error) {
        if (validation.pattern && !validation.pattern.test(String(value))) {
          error = validation.patternMessage || 'Неверный формат';
        } else if (validation.len !== undefined && String(value).length !== validation.len) {
          error = validation.lenMessage || `Длина поля "${label}" должна быть ровно ${validation.len} символов`;
        } else if (typeof value === 'number') {
          if (validation.min !== undefined && value < validation.min) {
            error = validation.minMessage || `Минимальное значение: ${validation.min}`;
          } else if (validation.max !== undefined && value > validation.max) {
            error = validation.maxMessage || `Максимальное значение: ${validation.max}`;
          }
        }
      }
    }
  }

  if (error) {
    errors.value[field] = error;
    return false;
  } else {
    delete errors.value[field];
    return true;
  }
};

const checkFieldWarning = (fieldDef: FormField<T>): void => {
  const {field, warning} = fieldDef;
  if (!warning) {
    delete warnings.value[field];
    return;
  }
  const value = (editData.value as any)[field];
  const warningMessage = warning(value, getContext());

  if (warningMessage) {
    warnings.value[field] = warningMessage;
  } else {
    delete warnings.value[field];
  }
};


const isSaveDisabled = computed(() => {
  if (!isEditing.value) return false;
  if (Object.keys(errors.value).length > 0) return true;
  return formFieldsOnly.value.some(field => {
    const isRequired = field.required && (!field.requiredCondition || field.requiredCondition(getContext()));
    if (isRequired) {
      const value = (editData.value as any)[field.field];
      return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
    }
    return false;
  });
});

const getFieldProps = (field: FormField<T>) => {
  const isFullWidth = !['date', 'tag'].includes(field.type);
  const commonProps = {
    id: field.field,
    disabled: isFieldDisabled(field),
    class: {
      'p-invalid': errors.value[field.field],
      'p-warn': warnings.value[field.field] && !errors.value[field.field],
      'full-width-field': isFullWidth,
    }
  }
  switch (field.type) {
    case 'select':
    case 'dropdown':
    case 'multiselect':
      return {
        ...commonProps,
        options: field.options,
        optionLabel: field.optionLabel,
        optionValue: field.optionValue,
        filter: field.filter || false,
        showClear: field.showClear ?? true
      };
    case 'dependent-select':
      return {
        ...commonProps,
        options: dependentOptions.value[field.field],
        optionLabel: field.optionLabel,
        optionValue: field.optionValue,
        showClear: field.showClear ?? true
      };
    case 'textarea':
      return {...commonProps, autoResize: field.autoResize ?? true, rows: field.rows ?? 5,};
    case 'date':
      return {...commonProps, dateFormat: replaceFormat(field.dateFormat), showTime: field.showTime};
    default:
      return commonProps;
  }
};
const dependentOptions = computed(() => {
  if (!formData.value || Object.keys(formData.value).length === 0) return {};
  const result: Record<string, any> = {};
  formFieldsOnly.value.forEach(field => {
    if (field.type === 'dependent-select') {
      const masterValue = (editData.value as any)[field.masterField];
      result[field.field] = masterValue ? field.options[masterValue] || [] : [];
    }
  });
  return result;
});
const validateForm = () => {
  let isValid = true;
  formFieldsOnly.value.forEach(field => {
    if (isEditing.value && field.editable !== false) {
      const isDisplayed = !field.displayCondition || field.displayCondition(getContext());
      if (isDisplayed && !validateField(field)) {
        isValid = false;
      }
    }
  });
  return isValid;
};
const displayData = computed(() => {
  if (!formData.value) return {};
  const result: Record<string, any> = {...formData.value};
  formFieldsOnly.value.forEach(field => {
    const value = (formData.value as any)[field.field];

    if (value === undefined || value === null || value === '' || value === 'null') {
      result[field.field] = '—';
      return;
    }
    if (field.type === 'select' || field.type === 'dropdown') {
      const options = field.options || [];
      const optionValueKey = field.optionValue || 'value';
      const optionLabelKey = field.optionLabel || 'label';
      const foundOption = options.find((opt: any) => (typeof opt === 'object' && opt) ? opt[optionValueKey] === value : opt === value);
      if (foundOption) {
        result[field.field] = (typeof foundOption === 'object' && foundOption) ? foundOption[optionLabelKey] : foundOption;
      }
    } else if (field.type === 'multiselect') {
      const options = field.options || [];
      const optionValueKey = field.optionValue || 'value';
      const optionLabelKey = field.optionLabel || 'label';
      if (Array.isArray(value) && value.length > 0) {
        const labels = value.map(val => {
          const foundOption = options.find((opt: any) => (typeof opt === 'object' && opt) ? opt[optionValueKey] === val : opt === val);
          if (foundOption) {
            return (typeof foundOption === 'object' && foundOption) ? foundOption[optionLabelKey] : foundOption;
          }
          return val;
        });
        result[field.field] = labels.join(', ');
      } else {
        result[field.field] = '—';
      }
    } else if (field.type === 'dependent-select') {
      const masterValue = (formData.value as any)[field.masterField];
      if (masterValue) {
        const options = field.options[masterValue] || [];
        const optionValueKey = field.optionValue || 'value';
        const optionLabelKey = field.optionLabel || 'label';
        const foundOption = options.find((opt: any) => (typeof opt === 'object' && opt !== null) ? opt[optionValueKey] === value : opt === value);
        if (foundOption) {
          result[field.field] = (typeof foundOption === 'object' && foundOption) ? foundOption[optionLabelKey] : foundOption;
        }
      }
    } else if (field.type === 'date' && value) {
      try {
        if (field.dateFormat) {
          result[field.field] = DateTime.fromISO(value).toFormat(field.dateFormat);
        } else {
          if (field.showTime) {
            result[field.field] = DateTime.fromISO(value).toFormat('dd.MM.yyyy HH:mm');
          } else {
            result[field.field] = DateTime.fromISO(value).toFormat('dd.MM.yyyy');
          }
        }
      } catch (e) {
        result[field.field] = value;
      }
    }
  });
  return result;
});
const getViewModeClasses = (field: FormField<T>) => {
  const isAutoWidth = ['date', 'tag'].includes(field.type);
  return {'view-mode-field': true, 'auto-width-field': isAutoWidth, 'view-mode-textarea': field.type === 'textarea',}
}

function replaceFormat(dateFormat: string | undefined): string | undefined {
  if (dateFormat && dateFormat.search('yyyy') > -1) {
    dateFormat = dateFormat.replace('yyyy', 'yy');
  }
  if (dateFormat && dateFormat.search('MM') > -1) {
    dateFormat = dateFormat.replace('MM', 'mm');
  }
  return dateFormat;
}

const getFieldComponent = (field: FormField<T>) => {
  switch (field.type) {
    case 'text':
      return InputText;
    case 'number':
      return InputNumber;
    case 'select':
    case 'dropdown':
    case 'dependent-select':
      return Select;
    case 'multiselect':
      return MultiSelect;
    case 'date':
      return DatePicker;
    case 'tag':
      return Tag;
    case 'textarea':
      return Textarea;
    default:
      return InputText;
  }
};
const isFieldDisabled = (field: FormField<T>): boolean => {
  if (!isEditing.value) return true;
  if (field.editable === false) return true;
  if (field.disabled) return true;
  if (field.type === 'dependent-select' && !(editData.value as any)[field.masterField]) return true;
  return !!(field.disabledCondition && field.disabledCondition(getContext()));
};
const activePhotoId = ref<string>('');
watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    if (props.config.photos?.length) {
      activePhotoId.value = props.config.photos[0].id;
    }
  } else {
    isEditing.value = false;
    activePhotoId.value = '';
  }
});

const handleSave = () => {
  if (validateForm()) emit('save', getContext())
};
const handleClose = () => {
  emit('cancel');
  onHide()
};
const onHide = () => {
  emit('update:visible', false)
};
const isFieldRequired = (fieldDef: FormField<T>): boolean => {
  if (!isEditing.value || !fieldDef.required) {
    return false;
  }
  return !fieldDef.requiredCondition || fieldDef.requiredCondition(getContext());
};
const getViewModeStyle = (field: FormField<T>) => {
  if (field.type === 'textarea') {
    const rows = (field as any).rows || 3;
    const minHeightValue = rows * 1.6;
    return {minHeight: `${minHeightValue}rem`};
  }
  return {};
};
const isActionVisible = (btn: DialogAction<T>): boolean => {
  if (!btn.visible) {
    return true;
  }
  if (typeof btn.visible === 'function') {
    return btn.visible(getContext());
  }
  if (btn.visible === 'always') {
    return true;
  }
  if (btn.visible === 'view') {
    return !isEditing.value;
  }
  if (btn.visible === 'edit') {
    return isEditing.value;
  }
  return false;
};
const revalidateAllFields = () => {
  formFieldsOnly.value.forEach(field => {
    validateField(field);
    checkFieldWarning(field);
  });
};
const updateEditData = (updates: Partial<T>) => {
  if (isEditing.value) {
    editData.value = {...editData.value, ...updates};
  }
};

defineExpose({
  updateEditData,
  revalidateAllFields
});
</script>

<template>
  <Dialog :visible="visible" @update:visible="onHide" :header="config.title as string" :modal="true"
          :style="{ width: '80vw', maxWidth: '1200px' }" :breakpoints="{ '960px': '90vw', '641px': '95vw' }">
    <Message v-if="topMessage" :severity="topMessage.severity" :closable="false" class="top-message">
      {{ topMessage.text }}
    </Message>
    <div class="dialog-content-container">
      <div class="form-section">
        <template v-for="(field, index) in config.fields"
                  :key="field.type === 'divider' ? `divider-${index}` : field.type === 'button' ? `button-${field.label}-${index}` : field.field">
          <div v-if="field.type === 'divider'" class="form-divider-container">
            <Divider align="left" type="solid">
              <b v-if="field.label">{{ field.label }}</b>
            </Divider>
          </div>

          <div
              v-else-if="field.type === 'button' && (!field.displayCondition || field.displayCondition(getContext()))"
              class="form-button-container">
            <Button
                :label="field.label"
                :icon="field.icon"
                :class="field.class"
                :loading="field.loadingCondition?.(getContext())"
                @click="field.action(getContext())"
                :disabled="field.disabledCondition?.(getContext())"/>
          </div>

          <div
              v-else-if="field.type !== 'button' && (!field.displayCondition || field.displayCondition(getContext()))">
            <div class="form-field">
              <label :for="field.field" :class="{ 'label-error': isEditing && errors[field.field] }">
                {{ field.label }}
                <span v-if="isFieldRequired(field)" class="required-marker">*</span>
              </label>
              <div class="field-input">
                <template v-if="isEditing">
                  <component :is="getFieldComponent(field)" v-model="editData[field.field]"
                             v-bind="getFieldProps(field)"
                             @update:modelValue="onFieldValueUpdate(field, $event)"
                             @blur="handleFieldBlur(field)"/>
                </template>
                <template v-else>
                  <InputText :value="displayData[field.field] ?? '—'" readonly
                             :class="getViewModeClasses(field)"
                             :style="getViewModeStyle(field)"/>
                </template>
                <div v-if="isEditing && errors[field.field]" class="error-message-container p-error">
                  <i class="pi pi-exclamation-triangle error-icon"></i>
                  <span>{{ errors[field.field] }}</span>
                </div>
                <div v-if="isEditing && warnings[field.field] && !errors[field.field]"
                     class="warning-message-container">
                  <i class="pi pi-exclamation-triangle warning-icon"></i>
                  <span>{{ warnings[field.field] }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
      <div class="photos-section" v-if="config.photos?.length">
        <div class="photos-container">
          <Tabs v-model:value="activePhotoId" :scrollable="true" class="photo-tabs">
            <TabList>
              <Tab v-for="photo in config.photos" :key="photo.id" :value="photo.id">{{ photo.name }}</Tab>
            </TabList>
            <TabPanels>
              <TabPanel v-for="photo in config.photos" :key="photo.id" :value="photo.id">
                <div class="photo-content">
                  <div v-if="photo.url" class="photo-item">
                    <Image :src="photo.url" :alt="photo.name" preview width="100%" imageClass="photo-image"/>
                  </div>
                  <div v-else class="no-photo">
                    <i class="pi pi-image" style="font-size: 2rem"></i>
                    <p>URL отсутствует</p>
                  </div>
                </div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="custom-actions">
        <template v-for="(btn, index) in config.extraActions" :key="index">
          <Button v-if="isActionVisible(btn)" :label="btn.label" :icon="btn.icon" :class="btn.class" class="m-1"
                  @click="btn.action(getContext())"/>
        </template>
      </div>
      <div v-if="isEditing">
        <Button label="Отмена" icon="pi pi-times" @click="cancelEditing" class="p-button-text"/>
        <Button label="Сохранить" icon="pi pi-check" @click="handleSave" :loading="loading" :disabled="isSaveDisabled"
                class="save-button"/>
      </div>
      <div v-else>
        <Button label="Закрыть" icon="pi pi-times" @click="handleClose" class="p-button-text"/>
        <Button v-if="isRecordEditable" label="Редактировать" icon="pi pi-pencil" @click="startEditing"
                :loading="isStartingEdit"/>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.top-message {
  margin-bottom: 1.5rem;
  border-radius: 6px;
  border-width: 1px;
  border-left-width: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.top-message .p-message-icon) {
  font-size: 1.25rem;
}

:deep(.top-message .p-message-text) {
  font-weight: 500;
  font-size: 0.95rem;
}

:deep(.p-message.p-message-error.top-message) {
  background-color: #fff5f5;
  border-color: #ef4444;
  color: #b91c1c;
}

:deep(.p-message.p-message-warn.top-message) {
  background-color: #fffbeb;
  border-color: #f59e0b;
  color: #92400e;
}

:deep(.p-message.p-message-success.top-message) {
  background-color: #f0fdf4;
  border-color: #22c55e;
  color: #15803d;
}

:deep(.p-message.p-message-info.top-message) {
  background-color: #eff6ff;
  border-color: #3b82f6;
  color: #1e40af;
}

.view-mode-field {
  display: block;
  padding: .5rem .75rem;
  min-height: 2.5rem;
  width: 100%;
  border-radius: 6px;
  word-wrap: break-word;
}

.auto-width-field {
  width: auto;
  display: inline-block;
}

.full-width-field {
  width: 100%;
}

.view-mode-textarea {
  height: auto;
  white-space: pre-wrap;
}

.dialog-content-container {
  display: flex;
  gap: 2rem;
  height: 65vh
}

.form-section {
  flex: 1;
  min-width: 400px;
  padding-right: 1rem;
  overflow-y: auto
}

.photos-section {
  flex: 1;
  min-width: 400px;
  border-left: 1px solid #dee2e6;
  padding-left: 1rem;
  display: flex;
  flex-direction: column
}

.photos-container {
  height: 100%;
  display: flex;
  flex-direction: column
}

.photo-tabs {
  height: 100%;
  display: flex;
  flex-direction: column
}

.photo-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center
}

.form-field {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column
}

.form-field label {
  margin-bottom: .5rem;
  font-weight: 500
}

.field-input {
  width: 100%
}

.p-error {
  margin-top: .25rem;
  display: block;
}

.photo-item {
  width: 95%;
  height: 95%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 1rem;
}

.required-marker {
  color: #ef4444;
  font-weight: 600;
  margin-left: 0.25rem;
}

.label-error {
  color: #ef4444;
}

.error-message-container {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  gap: 0.5rem;
}

.error-message-container.p-error {
  display: flex;
}

.error-icon {
  font-size: 0.875rem;
}

.form-divider-container {
  margin: 2rem 0 1.5rem 0;
}

.form-divider-container b {
  font-size: 0.9rem;
  color: inherit;
  font-weight: 600;
}

.save-button:disabled {
  background: #e9ecef;
  border-color: #e9ecef;
  color: #adb5bd;
  cursor: not-allowed;
  opacity: 0.8;
}

.save-button:disabled:hover {
  box-shadow: none;
}

.form-button-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

:deep(.p-inputtext.p-warn),
:deep(.p-select.p-warn),
:deep(.p-datepicker.p-warn),
:deep(.p-inputnumber.p-warn) {
  border-color: #ffc107;
  box-shadow: 0 0 0 0.1rem #ffd54f40;
}

.warning-message-container {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  gap: 0.5rem;
  color: #a16207;
  font-size: 0.875rem;
}

.warning-icon {
  font-size: 0.875rem;
}

@media (max-width: 960px) {
  .dialog-content-container {
    flex-direction: column;
    height: auto;
    max-height: 80vh;
    overflow-y: auto
  }

  .form-section, .photos-section {
    min-width: 100%;
    padding: 0;
    overflow-y: visible
  }

  .photos-section {
    border-left: none;
    border-top: 1px solid #dee2e6;
    padding-top: 1rem;
    margin-top: 1rem
  }
}

.error-message-container.p-error {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  gap: 0.5rem;
  color: #ef4444;
  font-size: 0.875rem;
}

.error-message-container.p-error .error-icon {
  font-size: 0.875rem;
}

.label-error {
  color: #ef4444;
}

.custom-actions {
  margin-right: auto;
}
</style>