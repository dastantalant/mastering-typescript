<script lang="ts">
import {ref, defineComponent, onMounted} from "vue";
import type {SubscriberStage} from "@/_/models/subscriber-stage.model.ts";


export default defineComponent({
  props: {
    subsStage: {} as SubscriberStage,
  }

})
</script>

<template>
  <div>
    <div>
      <label for="msisdn" class="block font-bold mt-3">Номер</label>
      <InputText id="msisdn" v-model.trim="subsStage.msisdn" fluid disabled/>
    </div>
    <div>
      <label for="ban" class="block font-bold mt-3">БАН</label>
      <InputText id="ban" v-model.trim="subsStage.ban" fluid disabled/>
    </div>
    <div>
      <label for="givenFirstName" class="block font-bold mt-3">Введенное имя</label>
      <InputText id="givenFirstName" v-model.trim="subsStage.givenFirstName" fluid disabled/>
    </div>
    <div>
      <label for="givenLastName" class="block font-bold mt-3">Введенная фамилия</label>
      <InputText id="givenLastName" v-model.trim="subsStage.givenLastName" fluid disabled/>
    </div>
    <div>
      <label for="givenPassNumber" class="block font-bold mt-3">Введенный номер паспорта</label>
      <InputText id="givenPassNumber" v-model.trim="subsStage.givenPassNumber" fluid disabled/>
    </div>
    <div>
      <label for="givenTaxIdNumber" class="block font-bold mt-3">Введенный ИНН</label>
      <InputText id="givenTaxIdNumber" v-model.trim="subsStage.givenTaxIdNumber" fluid disabled/>
    </div>
    <div>
      <label for="firstName" class="block font-bold mt-3">Имя</label>
      <InputText id="firstName" v-model.trim="subsStage.firstName" fluid :disabled="!subsStage.editAbleFields"/>
    </div>
    <div>
      <label for="lastName" class="block font-bold mt-3">Фамилия</label>
      <InputText id="lastName" v-model.trim="subsStage.lastName" fluid :disabled="!subsStage.editAbleFields"/>
    </div>
    <div>
      <label for="middleName" class="block font-bold mt-3">Отчество</label>
      <InputText id="middleName" v-model.trim="subsStage.middleName" fluid :disabled="!subsStage.editAbleFields"/>
    </div>
    <div>
      <label for="series" class="block font-bold mt-3">Серия паспорта</label>
      <InputText id="series" v-model.trim="subsStage.series" fluid :disabled="!subsStage.editAbleFields"/>
    </div>
    <div>
      <label for="passNumber" class="block font-bold mt-3">Номер паспорта</label>
      <InputText id="passNumber" v-model.trim="subsStage.passNumber" fluid :disabled="!subsStage.editAbleFields"/>
    </div>
    <div>
      <label for="taxIdNumber" class="block font-bold mt-3">ИНН</label>
      <InputText id="taxIdNumber" v-model.trim="subsStage.taxIdNumber" fluid :disabled="!subsStage.editAbleFields"/>
    </div>
    <div>
      <label for="passportAuthority" class="block font-bold mt-3">Выдан кем</label>
      <InputText id="passportAuthority" v-model.trim="subsStage.passportAuthority" fluid :disabled="!subsStage.editAbleFields"/>
    </div>
    <div>
      <label for="passIssueDate" class="block font-bold mt-3">Дата выдачи</label>
      <DatePickerFormatted v-model:inDate="subsStage.passIssueDate" :editAbleField="subsStage.editAbleFields"/>
    </div>
    <div>
      <label for="passEndDate" class="block font-bold mt-3">Дата окончания</label>
      <DatePickerFormatted v-model:inDate="subsStage.passEndDate" :editAbleField="subsStage.editAbleFields"/>
    </div>
  </div>
</template>

<style scoped>

</style>
