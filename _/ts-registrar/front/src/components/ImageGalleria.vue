<script lang="ts">
import Galleria from "primevue/galleria";
import {computed, ref, defineComponent, onMounted} from "vue";
import type {ImageModel} from "@/models/image.model.ts";

export default defineComponent({
  components: {Galleria},
  props: {
    images: [{} as ImageModel]
  },
  setup(props, {emit}) {

    const images = props.images ;
    const galleria =  ref();
    const activeIndex = ref(0);
    const showThumbnails = ref(false);
    const fullScreen = ref(false);
    const isAutoPlay = ref(false);
    const rotation = ref(0);


    const toggleAutoSlide = () => {
      isAutoPlay.value = !isAutoPlay.value;
    };
    const onThumbnailButtonClick = () => {
      showThumbnails.value = !showThumbnails.value;
    };

    const responsiveOptions = ref([
      {
        breakpoint: '1300px',
        numVisible: 4
      },
      {
        breakpoint: '575px',
        numVisible: 1
      }
    ]);

    const toggleFullScreen = () => {
      if (fullScreen.value) {
        closeFullScreen();
      } else {
        openFullScreen();
      }
    };
    const onFullScreenChange = () => {
      fullScreen.value = !fullScreen.value;
    };
    const openFullScreen = () => {
      let elem = galleria.value.$el;

      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        /* Firefox */
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        /* Chrome, Safari & Opera */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        /* IE/Edge */
        elem.msRequestFullscreen();
      }
    };
    const closeFullScreen = () => {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    };
    const bindDocumentListeners = () => {
      document.addEventListener('fullscreenchange', onFullScreenChange);
      document.addEventListener('mozfullscreenchange', onFullScreenChange);
      document.addEventListener('webkitfullscreenchange', onFullScreenChange);
      document.addEventListener('msfullscreenchange', onFullScreenChange);
    };
    const unbindDocumentListeners = () => {
      document.removeEventListener('fullscreenchange', onFullScreenChange);
      document.removeEventListener('mozfullscreenchange', onFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullScreenChange);
      document.removeEventListener('msfullscreenchange', onFullScreenChange);
    };
    const rotateImage = () => {
      rotation.value += 90;
    }

    const fullScreenIcon = computed(() => {
      return `pi ${fullScreen.value ? 'pi-window-minimize' : 'pi-window-maximize'}`;
    });
    const slideButtonIcon = computed(() => {
      return `pi ${isAutoPlay.value ? 'pi-pause' : 'pi-play'}`;
    });

    onMounted(() => {
      bindDocumentListeners();
    });

    return {
      images,
      galleria,
      activeIndex,
      showThumbnails,
      fullScreen,
      isAutoPlay,
      rotation,
      responsiveOptions,
      toggleAutoSlide,
      onThumbnailButtonClick,
      slideButtonIcon,
      rotateImage,
      toggleFullScreen,
      fullScreenIcon
    };
  }
});


</script>

<template>
  <div class="card flex flex-col gap-4" style="padding-bottom: 0">
    <Galleria
        ref="galleria"
        v-model:activeIndex="activeIndex"
        :value="images"
        :numVisible="5"
        containerStyle="max-width: 740px;"
        :showThumbnails="showThumbnails"
        :showItemNavigators="true"
        :showItemNavigatorsOnHover="true"
        :circular="true"
        :autoPlay="isAutoPlay"
        :transitionInterval="3000"
        :responsiveOptions="responsiveOptions"
        :pt="{
                root: {
                    class: [{ 'flex flex-col': fullScreen }]
                },
                content: {
                    class: ['relative', { 'flex-1 justify-center': fullScreen }]
                },
                thumbnails: 'absolute w-full left-0 bottom-0'
            }"
    >
      <template #item="slotProps">
        <img :src="'data:' + slotProps.item.fileType + ';base64,' + slotProps.item.encodedFile" :alt="slotProps.item.alt"
             :style="[{ width: !fullScreen ? '50%' : '', display: !fullScreen ? 'block' : '' , transform: `rotate(${rotation}deg)` }]"/>
      </template>
      <template #thumbnail="slotProps">
        <div class="grid gap-4 justify-center">
          <img :src="'data:' + slotProps.item.fileType + ';base64,' + slotProps.item.encodedFile" :alt="slotProps.item.alt" style="display: block"/>
        </div>
      </template>
      <template #footer>
        <div class="flex items-stretch bg-surface-950 text-white h-10" >
          <button type="button" @click="onThumbnailButtonClick"
                  class="bg-transparent border-none rounded-none hover:bg-white/10 text-white inline-flex justify-center items-center cursor-pointer px-3">
            <i class="pi pi-th-large"></i>
          </button>
          <button type="button" @click="toggleAutoSlide"
                  class="bg-transparent border-none rounded-none hover:bg-white/10 text-white inline-flex justify-center items-center cursor-pointer px-3">
            <i :class="slideButtonIcon"></i></button>
          <span v-if="images" class="flex items-center gap-4 ml-3">
                        <span class="text-sm">{{ activeIndex + 1 }}/{{ images.length }}</span>
                        <span class="font-bold text-sm">{{ images[activeIndex].id }}</span>
                        <span class="text-sm">{{ images[activeIndex].type }}</span>
                    </span>
          <button type="button" @click="rotateImage"
                  class=" border-none rounded-none hover:bg-white/10 text-white inline-flex  items-center cursor-pointer px-3 ml-auto">
            <i class="pi pi-refresh"></i>
          </button>
          <button type="button" @click="toggleFullScreen"
                  class="bg-transparent border-none rounded-none hover:bg-white/10 text-white inline-flex justify-center items-center cursor-pointer px-3">
            <i :class="fullScreenIcon"></i>
          </button>


        </div>
      </template>
    </Galleria>


    <div class="card flex justify-center" style="max-height: 600px" v-if="images && images.length > 2">
      <ImageCompare class="shadow-lg rounded-2xl" v-if="images[3]">
        <template #left>
          <img :src="'data:' + images[2].fileType + ';base64,' + images[2].encodedFile" />
        </template>
        <template #right>
          <img   :src="'data:' + images[3].fileType + ';base64,' + images[3].encodedFile"  />
        </template>
      </ImageCompare>
      <div v-if="!images[3]">Фото из ГРС отсутствует</div>
    </div>
  </div>
</template>

<style>
.layout-main-full {
  width: 100%;
  margin-left: auto !important;
  margin-right: auto !important;
}

.p-imagecompare  {
  position: relative !important;
  overflow: hidden !important;
  width: 50% !important;
  aspect-ratio: 5 / 7 !important;
}
.p-galleria-nav-button{
   background: black !important;
 }
</style>