import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import MultiSelect from 'primevue/multiselect';
import { FieldType } from "./dataEditor.enums.ts";
import type { Component } from 'vue';

export const COMPONENT_MAP: Record<string, Component> = {
    [FieldType.Text]: InputText,
    [FieldType.Number]: InputNumber,
    [FieldType.Select]: Select,
    [FieldType.Dropdown]: Select,
    [FieldType.DependentSelect]: Select,
    [FieldType.MultiSelect]: MultiSelect,
    [FieldType.Date]: DatePicker,
    [FieldType.Tag]: Tag,
    [FieldType.Textarea]: Textarea,
};

export function getComponentForType(type: FieldType): Component {
    return COMPONENT_MAP[type] || InputText;
}

export function replaceDateFormat(dateFormat: string | undefined): string | undefined {
    if (dateFormat) {
        return dateFormat.replace('yyyy', 'yy').replace('MM', 'mm');
    }
    return undefined;
}