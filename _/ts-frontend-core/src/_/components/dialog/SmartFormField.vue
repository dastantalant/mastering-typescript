<!-- src/components/dialog/SmartFormField.vue -->
<script setup lang="ts" generic="T extends Record<string, any>">
import { computed } from 'vue';
import { FieldType, DefaultMessages, Icon } from "./dataEditor.enums.ts";
import { getComponentForType, replaceDateFormat } from "./field.utils.ts";
import type { FormField, DialogContext } from "./dataDialog.types.ts";

const props = defineProps<{
  field: FormField<T>;
  modelValue: any;
  error?: string;
  warning?: string;
  isEditing: boolean;
  displayValue?: any;
  context: DialogContext<T>;
  dependentOptions?: any[];
}>();

const emit = defineEmits(['update:modelValue', 'blur', 'change']);

const componentIs = computed(() => getComponentForType(props.field.type));

const componentProps = computed(() => {
  const { field, context, dependentOptions } = props;

  const base = {
    id: field.field,
    disabled: props.field.disabled,
    class: { 'p-invalid': !!props.error, 'p-warn': !!props.warning && !props.error }
  };

  let specific = {};
  switch (field.type) {
    case FieldType.Select:
    case FieldType.Dropdown:
    case FieldType.MultiSelect:
      specific = {
        options: (field as any).options,
        optionLabel: (field as any).optionLabel,
        optionValue: (field as any).optionValue,
        filter: (field as any).filter,
        showClear: (field as any).showClear ?? true
      };
      break;
    case FieldType.DependentSelect:
      specific = {
        options: dependentOptions || [],
        optionLabel: (field as any).optionLabel,
        optionValue: (field as any).optionValue,
        showClear: (field as any).showClear ?? true
      };
      break;
    case FieldType.Date:
      specific = {
        dateFormat: replaceDateFormat((field as any).dateFormat),
        showTime: (field as any).showTime
      };
      break;
    case FieldType.Textarea:
      specific = {
        autoResize: (field as any).autoResize ?? true,
        rows: (field as any).rows ?? 5
      };
      break;
  }

  const userProps = typeof field.props === 'function'
      ? field.props(context)
      : (field.props || {});

  return { ...base, ...specific, ...userProps };
});

const isFullWidth = computed(() => ![FieldType.Date, FieldType.Tag].includes(props.field.type));

const viewModeStyle = computed(() => {
  if (props.field.type === FieldType.Textarea) {
    const rows = (props.field as any).rows || 3;
    return { minHeight: `${rows * 1.6}rem` };
  }
  return {};
});
</script>

<template>
  <div class="form-field">
    <label :for="field.field" :class="{ 'label-error': isEditing && error }">
      {{ field.label }}
      <span v-if="field.required" class="required-marker">*</span>
    </label>

    <div class="field-input">
      <template v-if="isEditing">
        <component
            :is="componentIs"
            :model-value="modelValue"
            @update:model-value="$emit('update:modelValue', $event)"
            v-bind="componentProps"
            @blur="$emit('blur')"
            class="w-full"
        />

        <div v-if="error" class="message-container p-error">
          <i :class="Icon.ExclamationTriangle"></i>
          <span>{{ error }}</span>
        </div>
        <div v-else-if="warning" class="message-container p-warn-text">
          <i :class="Icon.ExclamationTriangle"></i>
          <span>{{ warning }}</span>
        </div>
      </template>

      <template v-else>
        <div
            class="view-mode-field"
            :class="{ 'view-mode-textarea': field.type === FieldType.Textarea, 'w-full': isFullWidth, 'w-auto': !isFullWidth }"
            :style="viewModeStyle"
        >
          {{ displayValue ?? DefaultMessages.Empty }}
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-weight: 500;
}

.required-marker {
  color: #ef4444;
  margin-left: 0.25rem;
}

.label-error {
  color: #ef4444;
}

.message-container {
  display: flex;
  align-items: center;
  margin-top: 0.25rem;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.p-error { color: #ef4444; }
.p-warn-text { color: #a16207; }

.view-mode-field {
  display: block;
  padding: 0.5rem 0.75rem;
  min-height: 2.5rem;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  word-wrap: break-word;
  color: #495057;
}

.view-mode-textarea {
  height: auto;
  white-space: pre-wrap;
}

:deep(.p-inputtext.p-warn),
:deep(.p-select.p-warn),
:deep(.p-datepicker.p-warn),
:deep(.p-inputnumber.p-warn) {
  border-color: #ffc107;
  box-shadow: 0 0 0 0.1rem rgba(255, 213, 79, 0.25);
}
</style>