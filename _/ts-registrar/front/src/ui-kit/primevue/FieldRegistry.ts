import { defineAsyncComponent } from 'vue';
import {FieldType} from "../../schema/ui-types.ts";

export const PrimeVueFieldRegistry = {
    [FieldType.Text]: defineAsyncComponent(() => import('primevue/inputtext')),
    [FieldType.Number]: defineAsyncComponent(() => import('primevue/inputnumber')),
    [FieldType.Date]: defineAsyncComponent(() => import('primevue/datepicker')),
    [FieldType.Textarea]: defineAsyncComponent(() => import('primevue/textarea')),
    [FieldType.Select]: defineAsyncComponent(() => import('primevue/select')),
    [FieldType.DependentSelect]: defineAsyncComponent(() => import('primevue/select')),
    [FieldType.MultiSelect]: defineAsyncComponent(() => import('primevue/multiselect')),
};