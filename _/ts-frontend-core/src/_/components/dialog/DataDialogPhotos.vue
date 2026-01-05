<!-- src/components/dialog/DataDialogPhotos.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue';
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import Image from 'primevue/image';
import { DefaultMessages, Icon } from "./dataEditor.enums.ts";
import type { Photo } from "./dataDialog.types.ts";

const props = defineProps<{
  photos: Photo[];
}>();

const activePhotoId = ref<string>('');

watch(() => props.photos, (newPhotos) => {
  if (newPhotos && newPhotos.length > 0) {
    activePhotoId.value = newPhotos[0].id;
  }
}, { immediate: true });
</script>

<template>
  <div class="photos-container">
    <Tabs v-model:value="activePhotoId" :scrollable="true" class="photo-tabs">
      <TabList>
        <Tab v-for="photo in photos" :key="photo.id" :value="photo.id">{{ photo.name }}</Tab>
      </TabList>
      <TabPanels>
        <TabPanel v-for="photo in photos" :key="photo.id" :value="photo.id">
          <div class="photo-content">
            <div v-if="photo.url" class="photo-item">
              <Image :src="photo.url" :alt="photo.name" preview width="100%" imageClass="photo-image"/>
            </div>
            <div v-else class="no-photo">
              <i :class="Icon.Image" style="font-size: 2rem; color: #adb5bd;"></i>
              <p>{{ DefaultMessages.NoUrl }}</p>
            </div>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<style scoped>
.photos-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.photo-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}
:deep(.p-tabpanels) {
  flex-grow: 1;
  padding: 0;
}
.photo-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}
.photo-item {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: auto;
}
.no-photo {
  text-align: center;
  color: #6c757d;
}
</style>