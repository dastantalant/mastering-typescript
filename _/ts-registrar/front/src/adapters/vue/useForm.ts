// src/adapters/vue/useForm.ts

import { ref, onMounted, onUnmounted, type Ref, computed } from 'vue';
import type {FormController} from "../../core/form/FormController.ts";
import type {FormState} from "../../core/form/FormTypes.ts";

export function useForm<T extends Record<string, any>>(controller: FormController<T>) {
    const state = ref(controller.getState()) as Ref<FormState<T>>;

    let unsubscribe: () => void;

    onMounted(() => {
        unsubscribe = controller.store.subscribe((newState: any) => {
            state.value = newState;
        });
    });

    onUnmounted(() => {
        if (unsubscribe) unsubscribe();
    });

    return {
        state,
        values: computed(() => state.value.values),
        errors: computed(() => state.value.errors),
        isValid: computed(() => state.value.isValid),
        isSubmitting: computed(() => state.value.isSubmitting),

        setFieldValue: controller.setFieldValue.bind(controller),
        submit: controller.submit.bind(controller),
        reset: controller.reset.bind(controller)
    };
}