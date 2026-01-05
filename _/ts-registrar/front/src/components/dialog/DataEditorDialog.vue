<!-- src/components/dataEditor/DataEditorDialog.vue -->

<script setup lang="ts" generic="T extends Record<string, any>">
import { defineProps, defineEmits, defineExpose, computed } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import Message from 'primevue/message';

import type { DataEditorDialogProps, FormField } from './dataDialog.types.ts';
import { useDataEditorDialog } from './useDataEditorDialog.ts';
import { ButtonLabels, Icon, ActionVisibility, FieldType } from "./dataEditor.enums.ts";

import SmartFormField from './SmartFormField.vue';
import DataDialogPhotos from './DataDialogPhotos.vue';

const props = defineProps<DataEditorDialogProps<T>>();
const emit = defineEmits(['update:visible', 'save', 'cancel']);

const {
  isEditing,
  editData,
  errors,
  warnings,
  isStartingEdit,
  isRecordEditable,
  isSaveDisabled,
  displayData,
  dependentOptions,
  getContext,
  startEditing,
  cancelEditing,
  handleSave,
  handleClose,
  handleFieldBlur,
  onFieldValueUpdate,
  revalidateAllFields,
  updateEditData
} = useDataEditorDialog(props, emit);

defineExpose({ updateEditData, revalidateAllFields });

const visibleFields = computed(() => {
  return props.config.fields.filter(field => {
    if ('displayCondition' in field && field.displayCondition) {
      return field.displayCondition(getContext());
    }
    return true;
  });
});

const isActionVisible = (btn: any) => {
  if (!btn.visible) return true;
  if (typeof btn.visible === 'function') return btn.visible(getContext());
  if (btn.visible === ActionVisibility.Always) return true;
  if (btn.visible === ActionVisibility.View) return !isEditing.value;
  if (btn.visible === ActionVisibility.Edit) return isEditing.value;
  return false;
};
</script>

<template>
  <Dialog
      :visible="visible"
      @update:visible="handleClose"
      :header="String(config.title)"
      :modal="true"
      :style="{ width: '85vw', maxWidth: '1400px' }"
      :breakpoints="{ '960px': '95vw' }"
      class="data-editor-dialog"
  >
    <Message v-if="topMessage" :severity="topMessage.severity" :closable="false" class="mb-4">
      {{ topMessage.text }}
    </Message>

    <div class="dialog-layout">
      <div class="form-container">
        <div class="form-grid">
          <template v-for="(item, index) in visibleFields" :key="index">

            <div v-if="item.type === FieldType.Divider" class="grid-col-full my-2">
              <Divider align="left">
                <span class="font-bold text-lg">{{ item.label }}</span>
              </Divider>
            </div>

            <div v-else-if="item.type === FieldType.Button" class="grid-col-full flex justify-end">
              <Button
                  :label="item.label"
                  :icon="item.icon"
                  :class="item.class"
                  :loading="item.loadingCondition?.(getContext())"
                  @click="item.action(getContext())"
                  :disabled="item.disabledCondition?.(getContext())"
              />
            </div>

            <SmartFormField
                v-else
                :field="(item as FormField<T>)"
                v-model="editData[(item as any).field]"
                :error="errors[(item as any).field]"
                :warning="warnings[(item as any).field]"
                :is-editing="isEditing"
                :context="getContext()"
                :display-value="displayData[(item as any).field]"
                :dependent-options="item.type === FieldType.DependentSelect ? dependentOptions[(item as any).field] : undefined"
                :class="{ 'grid-col-full': [FieldType.Textarea].includes(item.type) }"
                @blur="handleFieldBlur(item as any)"
                @update:model-value="onFieldValueUpdate(item as any, $event)"
            />

          </template>
        </div>
      </div>

      <div class="photos-container" v-if="config.photos?.length">
        <DataDialogPhotos :photos="config.photos" />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between items-center w-full">
        <div class="flex gap-2">
          <template v-for="(btn, index) in config.extraActions" :key="index">
            <Button
                v-if="isActionVisible(btn)"
                :label="btn.label"
                :icon="btn.icon"
                :class="btn.class"
                text
                @click="btn.action(getContext())"
            />
          </template>
        </div>

        <!-- Main Actions (Right) -->
        <div class="flex gap-2">
          <template v-if="isEditing">
            <Button :label="ButtonLabels.Cancel" :icon="Icon.Times" text @click="cancelEditing"/>
            <Button :label="ButtonLabels.Save" :icon="Icon.Check" @click="handleSave" :loading="loading" :disabled="isSaveDisabled"/>
          </template>
          <template v-else>
            <Button :label="ButtonLabels.Close" :icon="Icon.Times" text @click="handleClose"/>
            <Button v-if="isRecordEditable" :label="ButtonLabels.Edit" :icon="Icon.Pencil" @click="startEditing" :loading="isStartingEdit"/>
          </template>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.dialog-layout {
  display: flex;
  gap: 2rem;
  min-height: 50vh;
}

.form-container {
  flex: 1;
  min-width: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem 2rem;
  align-items: start;
}

.grid-col-full {
  grid-column: 1 / -1;
}

.photos-container {
  width: 450px;
  flex-shrink: 0;
  border-left: 1px solid #e5e7eb;
  padding-left: 1.5rem;
}

@media (max-width: 1200px) {
  .dialog-layout {
    flex-direction: column;
  }
  .photos-container {
    width: 100%;
    height: 400px;
    border-left: none;
    border-top: 1px solid #e5e7eb;
    padding-top: 1.5rem;
    padding-left: 0;
  }
}
</style>