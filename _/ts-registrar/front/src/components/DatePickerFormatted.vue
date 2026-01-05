<script lang="ts">
import {ref, defineComponent, onMounted, computed, watch} from "vue";


export default defineComponent({
  props: {
    inDate: {},
    editAbleField: {} as boolean,
  },

  setup(props, {emit}) {
    const correctDate = ref<Date | null>(null);
    const localDate = ref(props.inDate); // Create a local copy
    const updateDate = () => {
      const formattedDate = localDate.value.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      emit('update:inDate', formattedDate); // Notify parent
    };

    const inDate = computed({
      get: () => props.inDate,
      set: val => {
        props.inDate = val
      }
    })

    watch(() => props.inDate, (newValue, oldValue) => {
      localDate.value = newValue; // Update localDate when inDate changes
      formatInDate();
    });

    function formatInDate() {
      if (localDate.value) {
        const [day, month, year] = localDate.value.split(".").map(Number);
        localDate.value = new Date(year, month - 1, day);
      }
    }

    onMounted(() => {
      formatInDate();
    });

    return {
      correctDate,
      localDate: localDate,
      updateDate,
      inDate
    }

  },
  computed: {}

})
</script>

<template>
  <DatePicker id="inDate" v-model="localDate" showIcon fluid @update:modelValue="updateDate()"
              iconDisplay="input" :disabled="!editAbleField" dateFormat="dd.mm.yy"/>
</template>

<style scoped>

</style>
<script setup lang="ts">
</script>