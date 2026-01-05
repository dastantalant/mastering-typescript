<script setup lang="ts">
import { computed } from 'vue';
import { PrimeVueFieldRegistry } from './FieldRegistry';
import type {FormFieldConfig} from "@/core/form/FormTypes.ts";

const props = defineProps<{
  config: FormFieldConfig<any>;
  modelValue: any;
  error?: string;
}>();

const emit = defineEmits(['update:modelValue']);

const componentIs = computed(() =>
    PrimeVueFieldRegistry[props.config.type as any] || PrimeVueFieldRegistry['text']
);

const boundProps = computed(() => {
  const base = { ...props.config.props };

  if (['select', 'multiselect', 'dependent-select'].includes(props.config.type)) {
    base.options = props.config.options;
    base.optionLabel = 'label';
    base.optionValue = 'value';
    base.showClear = true;
  }

  if (props.config.type === 'date') {
    base.dateFormat = 'dd.mm.yy';
    base.showIcon = true;
  }

  if (props.error) {
    base.class = [base.class, 'p-invalid'];
  }

  return base;
});
</script>

<template>
  <div class="field mb-4">
    <label :for="String(config.field)" class="block font-medium mb-2">
      {{ config.label }}
      <span v-if="config.required" class="text-red-500">*</span>
    </label>

    <component
        :is="componentIs"
        :id="String(config.field)"
        :model-value="modelValue"
        @update:model-value="emit('update:modelValue', $event)"
        v-bind="boundProps"
        :disabled="config.disabled"
        class="w-full"
    />

    <small v-if="error" class="p-error block mt-1 text-red-500">
      {{ error }}
    </small>
  </div>
</template>