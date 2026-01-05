
<script setup lang="ts">
import { computed } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { FormController } from "@/_/core/form/FormController.ts";
import { useForm } from "@/_/adapters/vue/useForm.ts";
import UniversalField from "@/_/ui-kit/primevue/UniversalField.vue";
import { FieldType } from "@/_/schema/ui-types.ts";

const props = defineProps<{ visible: boolean, initialData: any }>();
const emit = defineEmits(['update:visible', 'save']);

const fieldsConfig = computed(() => [
  {
    field: 'fullName',
    label: 'ФИО',
    type: FieldType.Text,
    required: true
  },
  {
    field: 'region',
    label: 'Регион',
    type: FieldType.Select,
    required: true,
    options: dictionaries.value.regions
  },
  {
    field: 'district',
    label: 'Район',
    type: FieldType.DependentSelect,
    masterField: 'region',
    options: dictionaries.value.districtsMap,
    displayCondition: (ctx) => !!ctx.values.region
  }
]);

const controller = new FormController(fieldsConfig.value, props.initialData || {});

const { state, setFieldValue, submit } = useForm(controller);

const visibleFields = computed(() =>
    fieldsConfig.value.filter(f => state.value.visibleFields.includes(f.field))
);

const onSave = () => {
  submit(async (data) => {
    emit('save', data);
  });
};
</script>

<template>
  <Dialog :visible="visible" modal header="Редактирование" class="w-full max-w-2xl">
    <div class="form-grid grid grid-cols-2 gap-4">
      <template v-for="field in visibleFields" :key="field.field">
        <UniversalField
            :config="field"
            :model-value="state.values[field.field]"
            :error="state.errors[field.field]"
            @update:model-value="(val) => setFieldValue(field.field, val)"
        />
      </template>
    </div>

    <template #footer>
      <Button label="Отмена" text @click="$emit('update:visible', false)" />
      <Button label="Сохранить" @click="onSave" :loading="state.isSubmitting" />
    </template>
  </Dialog>
</template>
