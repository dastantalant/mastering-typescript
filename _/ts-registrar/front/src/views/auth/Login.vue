<script setup lang="ts">
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import {ref} from 'vue';
import {useRoute} from 'vue-router';
import {zodResolver} from '@primevue/forms/resolvers/zod';
import {z} from 'zod';
import router from '@/router/index.ts';
import {useAuthStore} from '@/stores';
import {useToast} from "primevue/usetoast";

interface Message {
  severity: string;
  content: string;
}

interface FormSubmitEvent {
  valid: boolean;
}

const username = ref('');
const password = ref('');
const checked = ref(false);
const authStore = useAuthStore();
const route = useRoute();
const messages = ref<Message[]>([]);
const toast = useToast();


if (authStore.user) {
  router.push('/');
}

const onFormSubmit = ({valid}: FormSubmitEvent) => {
  if (valid)
    authStore
        .login(username.value, password.value)
        .then(() => {
          router.push(route.query.returnUrl === '/login' ? '/' : route.query.returnUrl + '');
        })
        .catch((error: any) => {
          toast.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: error,
            life: 5000
          });
          const message: Message = {
            severity: "error",
            content: 'Не правильное Имя пользователя или Пароль',
          };
          messages.value = [message];
        });
};

const initialValues = ref({
  username: '',
  password: '',
});

const resolver = ref(zodResolver(
    z.object({
      username: z.string().min(1, {message: 'Имя пользователя обязательное.'}),
      password: z.string().min(1, {message: 'Пароль обязательный.'}),
    })
));
</script>

<template>
  <FloatingConfigurator/>

  <div
      class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
    <div class="flex flex-col items-center justify-center">
      <div
          style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
        <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
          <Form v-slot="$form" :resolver="resolver" :initialValues="initialValues" @submit="onFormSubmit"
                class="flex justify-center flex-col gap-4">

            <div class="text-center mb-8">
              <img src="/favicon.svg" class="logo mb-8 w-16 shrink-0 mx-auto" alt="Hur logo"/>
              <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Регистратор</div>
              <span class="text-muted-color font-medium">Войдите что-бы продолжить</span>
            </div>

            <div>
              <label for="username" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Имя
                пользователя</label>
              <InputText name="username" type="text" placeholder="Имя пользователя" v-model="username"
                         class="w-full md:w-[30rem] mb-1"/>
              <Message v-if="$form.username?.invalid" severity="error" size="small" variant="simple" class="mb-4">
                {{ $form.username.error?.message }}
              </Message>

              <label for="password"
                     class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Пароль</label>
              <Password id="password" name="password" v-model="password" placeholder="Пароль" :toggleMask="true"
                        class="w-full md:w-[30rem] mb-1" fluid :feedback="false"></Password>
              <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple" class="mb-4">
                {{ $form.password.error?.message }}
              </Message>

              <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                <div class="flex items-center">
                  <Checkbox v-model="checked" id="rememberme1" binary class="mr-2"></Checkbox>
                  <label for="rememberme1">Remember me</label>
                </div>
                <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Забыли пароль?</span>
              </div>
              <Button type="submit" label="Войти" class="w-full p-3 text-xl"></Button>
            </div>
            <transition-group name="p-messages" tag="div">
              <Message v-for="msg of messages" :severity="msg.severity" :key="msg.content">{{ msg.content }}</Message>
            </transition-group>
          </Form>
        </div>
      </div>
    </div>
  </div>
  <Toast />

</template>

<style scoped>
.pi-eye {
  transform: scale(1.6);
  margin-right: 1rem;
}

.pi-eye-slash {
  transform: scale(1.6);
  margin-right: 1rem;
}
</style>
