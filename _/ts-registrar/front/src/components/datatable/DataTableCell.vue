<!-- src/components/datatable/DataTableCell.vue -->
<script setup lang="ts" generic="TData extends Record<string, any>">
import {computed, type Component} from 'vue';
import {DateTime} from 'luxon';
import {ExpressionResolver} from '../utils/expression-resolver.ts';

import Tag from 'primevue/tag';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import {UIComponent} from "../types/common.types.ts";
import type {CellRendererSchema, RowAction} from "../types/renderer.types.ts";

const props = defineProps<{ data: TData; field?: string; schema?: CellRendererSchema<TData>; }>();

const emit = defineEmits<(e: 'action', actionId: string, data: TData) => void>();
const componentMap: Record<string, Component | string | null> = {
  [UIComponent.Text]: 'span',
  [UIComponent.Date]: 'span',
  [UIComponent.Icon]: 'i',
  [UIComponent.Tag]: Tag,
  [UIComponent.Button]: Button,
  [UIComponent.Avatar]: Avatar,
};

const resolvedProps = computed((): Record<string, any> => {
  if (!props.schema || props.schema.type === UIComponent.Actions) return {};

  const finalProps: Record<string, any> = {...(props.schema.props as any)};

  if ('mapProps' in props.schema && props.schema.mapProps) {
    for (const [targetProp, source] of Object.entries(props.schema.mapProps)) {
      finalProps[targetProp] = ExpressionResolver.resolveValue(source, props.data);
    }
  }
  if (props.schema.mapProps) {
    for (const [targetProp, source] of Object.entries(props.schema.mapProps)) {
      finalProps[targetProp] = ExpressionResolver.resolveValue(source, props.data);
    }
  }
  if (props.schema.type === UIComponent.Icon && finalProps.class) {
    if (!finalProps.class.includes('pi ')) {
      finalProps.class = `pi ${finalProps.class}`;
    }
  }
  const rawValue = props.field ? props.data[props.field] : undefined;
  if (props.schema.type === UIComponent.Tag && finalProps.value === undefined) {
    finalProps.value = rawValue;
  }
  if (props.schema.type === UIComponent.Text && finalProps.textContent === undefined) {
    finalProps.textContent = rawValue;
  }
  if (props.schema.type === UIComponent.Button && finalProps.label === undefined) {
    if (['string', 'number'].includes(typeof rawValue)) {
      finalProps.label = rawValue;
    }
  }
  return finalProps;
});

const handlers = computed(() => {
  if (!props.schema || props.schema.type === UIComponent.Actions) {
    return {};
  }
  const schemaActions = (props.schema as any).actions;
  if (!schemaActions || typeof schemaActions !== 'object' || Array.isArray(schemaActions)) {
    return {};
  }
  const events: Record<string, (e: Event) => void> = {};
  for (const [eventName, commandId] of Object.entries(schemaActions)) {
    const handlerName = `on${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`;
    events[handlerName] = (event: Event) => {
      event.stopPropagation();
      emit('action', commandId as string, props.data);
    };
  }
  return events;
});

const displayValue = computed(() => {
  const rawValue = props.field ? props.data[props.field] : undefined;

  if (resolvedProps.value.textContent) return resolvedProps.value.textContent;

  if (props.schema?.type === UIComponent.Date && rawValue) {
    const fmt = resolvedProps.value.format || 'dd.MM.yyyy HH:mm';
    return DateTime.fromISO(String(rawValue)).toFormat(fmt);
  }

  return rawValue;
});
const slotContent = computed(() => {
  if (props.schema?.type === UIComponent.Icon) return null;
  if (props.schema?.type === UIComponent.Actions) return null;

  if (resolvedProps.value.value !== undefined) return null;
  if (resolvedProps.value.label !== undefined) return null;

  return displayValue.value;
});

const resolveCondition = (source: any, def: boolean) =>
    ExpressionResolver.resolveBoolean(source, props.data, def);

const onActionClick = (actionDef: RowAction<TData>) => {
  if (typeof actionDef.action === 'function') {
    actionDef.action(props.data);
    return;
  }
  emit('action', actionDef.action, props.data);
};

</script>

<template>
  <span v-if="!schema && field">{{ data[field] }}</span>
  <div
      v-else-if="schema?.type === UIComponent.Actions"
      class="flex gap-1 items-center justify-center flex-wrap"
  >
    <template v-for="(item, index) in schema.actions" :key="index">
      <Button
          v-if="resolveCondition(item.isVisible, true)"
          :disabled="resolveCondition(item.disabled, false)"

          :icon="item.icon"
          :severity="item.severity as any || 'info'"
          :tooltip="item.tooltip"
          v-tooltip.top="item.tooltip"

          text rounded size="small"
          @click.stop="onActionClick(item)"
      />
    </template>
  </div>
  <component
      v-else-if="schema"
      :is="componentMap[schema.type]"
      v-bind="resolvedProps"
      v-on="handlers"
  >
    <template v-if="slotContent">
      {{ slotContent }}
    </template>
  </component>
</template>