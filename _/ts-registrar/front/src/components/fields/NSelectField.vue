<script setup lang="ts">
import Select from 'primevue/select'
import type {TDictionaryItem} from "@/models/dictionary.type.ts";

const props = defineProps<{
  options: TDictionaryItem[];
  error?: string;
  label?: string;
  loading?: boolean;
  optionLabel?: string;
  optionValue?: string;
  disabled?: boolean
}>()

const model = defineModel()

const randomId = Math.random().toString(36).substr(2, 9)
</script>

<template>
  <div class="n-select-field">
    <IftaLabel>
      <Select :loading="props.loading" v-model="model" :options="props.options" :optionLabel="optionLabel || value" :optionValue="optionValue || code"
              class="w-full" :invalid="!!props.error" :id="randomId" :disabled="props.disabled"
              variant="filled"/>
      <label :for="randomId">{{ props.label }}</label>
    </IftaLabel>
  </div>
</template>

<style scoped>

</style>
