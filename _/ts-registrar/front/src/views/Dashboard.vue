<script setup lang="ts">
import {useToast} from 'primevue/usetoast';
import {onMounted, ref} from 'vue';
import CurrentUserService from "@/services/current-user.service.js";

const currentUserService = new CurrentUserService();
const toast = useToast();

const current = ref({});

onMounted(() => {
  getCurrent();

});

function getCurrent() {
  currentUserService.getCurrent().then((data) => {
    current.value = data;
  }).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error,
      life: 5000
    });
  });
}

</script>

<template>
  <div class="layout-main">

    <div class="card">
      <div class="font-semibold text-xl mb-4">{{ current.username }}</div>
      <div class="font-semibold mb-4">{{ current.role ? current.role.name : "" }}</div>
      <div class="flex items-center flex-col sm:flex-row">

        <Chip v-for="org of current.organizations" :label="org.name" class="mr-2 mb-2"></Chip>
      </div>

    </div>
  </div>
</template>
