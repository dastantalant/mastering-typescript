<script lang="ts">
import Galleria from "primevue/galleria";
import {computed, ref, defineComponent, onMounted, watch} from "vue";
import type { ESimFile } from "../../models/esim.model";
import ProgressSpinner from "primevue/progressspinner";
import {getPdfPreviewUrl} from "@/utils/pdfPreview.ts";

interface ImageDisplayConfig {
  galleryTypes: string[];
  comparisonTypes: string[];
  emptyComparisonMessage?: string;
  emptyGalleryMessage?: string;
}

export default defineComponent({
  components: {Galleria, ProgressSpinner},
  props: {
    images: {
      type: Array as () => ESimFile[],
      required: true
    },
    config: {
      type: Object as () => ImageDisplayConfig,
      default: () => ({
        comparisonTypes: ['PASSPORT_SELFIE', 'GRS_PHOTO'],
        emptyComparisonMessage: 'Фото для сравнения отсутствует',
        emptyGalleryMessage: 'Нет загруженных файлов'
      })
    }
  },
  setup(props) {

    const galleria = ref();
    const activeIndex = ref(0);
    const showThumbnails = ref(false);
    const fullScreen = ref(false);
    const isAutoPlay = ref(false);
    const rotation = ref(0);
    const allImagesLoaded = ref(false);

    const galleryImages = computed(() =>
        props.images.map(f => {
          if (!isPdf(f)) return f;
          const src = fileSrc(f);
          const preview = pdfPreviewMap.value[src];
          return preview
              ? { ...f, url: preview, type: 'image/png', encodedFile: undefined }
              : f;
        })
    );

    const comparisonImages = computed(() => {
      const images = props.config.comparisonTypes.map(type =>
          props.images.find(img => img.type === type)
      ).filter(Boolean);

      return images.length >= 2 ? images : null;
    });

    const hasComparisonImages = computed(() => {
      return comparisonImages.value && comparisonImages.value.length >= 2;
    });

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
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    };

    const closeFullScreen = () => {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    };

    const bindDocumentListeners = () => {
      document.addEventListener('fullscreenchange', onFullScreenChange);
      document.addEventListener('mozfullscreenchange', onFullScreenChange);
      document.addEventListener('webkitfullscreenchange', onFullScreenChange);
      document.addEventListener('msfullscreenchange', onFullScreenChange);
    };

    const rotateImage = () => {
      rotation.value += 90;
    };

    const fullScreenIcon = computed(() => {
      return `pi ${fullScreen.value ? 'pi-window-minimize' : 'pi-window-maximize'}`;
    });

    const slideButtonIcon = computed(() => {
      return `pi ${isAutoPlay.value ? 'pi-pause' : 'pi-play'}`;
    });

    const preloadImages = () => {
      if (!props.images.length) {
        allImagesLoaded.value = true;
        return;
      }
      let loaded = 0;
      props.images.forEach(img => {
        const image = new window.Image();
        image.onload = image.onerror = () => {
          loaded++;
          if (loaded === props.images.length) {
            allImagesLoaded.value = true;
          }
        };
        image.src = img.url || ('data:' + img.type + ';base64,' + img.encodedFile);
      });
    };

    const isPdf = (f: ESimFile) =>
        f.type === 'DIGITAL_DOCUMENT'
        || (f.url?.toLowerCase().endsWith('.pdf'))
        || (f.contentType?.toLowerCase().includes('pdf'));

    const fileSrc = (f: ESimFile) => f.url || `data:${f.type};base64,${f.encodedFile}`;
    const pdfPreviewMap = ref<Record<string, string>>({});


    onMounted(() => {
      bindDocumentListeners();
      preloadImages();
    });
    watch(() => props.images, (list) => {
      list.filter(isPdf).forEach(async f => {
        const src = fileSrc(f);
        if (pdfPreviewMap.value[src]) return;
        try {
          pdfPreviewMap.value[src] = await getPdfPreviewUrl(src, 1200);
        } catch {}
      });
    }, { immediate: true, deep: true });

    return {
      galleryImages,
      comparisonImages,
      hasComparisonImages,
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
      fullScreenIcon,
      allImagesLoaded,
      galleria
    };
  }
});
</script>

<template>
  <div class="card flex flex-col gap-4" style="padding-bottom: 0">
    <template v-if="allImagesLoaded">
      <template v-if="galleryImages.length > 0">
        <Galleria
            ref="galleria"
            v-model:activeIndex="activeIndex"
            :value="galleryImages"
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
            <img
                :src="slotProps.item.url || ('data:' + slotProps.item.type + ';base64,' + slotProps.item.encodedFile)"
                :alt="slotProps.item.typeName || ''"
                :style="[{
                width: !fullScreen ? '50%' : '',
                display: !fullScreen ? 'block' : '',
                transform: `rotate(${rotation}deg)`
              }]"
            />
          </template>
          <template #thumbnail="slotProps">
            <div class="grid gap-4 justify-center">
              <img
                  :src="slotProps.item.url || ('data:' + slotProps.item.type + ';base64,' + slotProps.item.encodedFile)"
                  :alt="slotProps.item.typeName || ''"
                  style="display: block"
              />
            </div>
          </template>
          <template #footer>
            <div class="flex items-stretch bg-surface-950 text-white h-10">
              <button type="button" @click="onThumbnailButtonClick"
                      class="bg-transparent border-none rounded-none hover:bg-white/10 text-white inline-flex justify-center items-center cursor-pointer px-3">
                <i class="pi pi-th-large"></i>
              </button>
              <button type="button" @click="toggleAutoSlide"
                      class="bg-transparent border-none rounded-none hover:bg-white/10 text-white inline-flex justify-center items-center cursor-pointer px-3">
                <i :class="slideButtonIcon"></i>
              </button>
              <span v-if="galleryImages" class="flex items-center gap-4 ml-3">
                <span class="text-sm">{{ activeIndex + 1 }}/{{ galleryImages.length }}</span>
                <span class="text-sm">{{ galleryImages[activeIndex].typeName }}</span>
              </span>
              <button type="button" @click="rotateImage"
                      class="border-none rounded-none hover:bg-white/10 text-white inline-flex items-center cursor-pointer px-3 ml-auto">
                <i class="pi pi-refresh"></i>
              </button>
              <button type="button" @click="toggleFullScreen"
                      class="bg-transparent border-none rounded-none hover:bg-white/10 text-white inline-flex justify-center items-center cursor-pointer px-3">
                <i :class="fullScreenIcon"></i>
              </button>
            </div>
          </template>
        </Galleria>
        <div class="card flex justify-center" style="max-height: 600px">
          <ImageCompare v-if="hasComparisonImages" class="shadow-lg rounded-2xl">
            <template #left>
              <img
                  v-if="comparisonImages && comparisonImages[0]"
                  :src="comparisonImages[0].url || ('data:' + comparisonImages[0].type + ';base64,' + comparisonImages[0].encodedFile)"
                  :alt="comparisonImages[0].typeName || ''"
                  class="max-h-[600px] max-w-full object-contain"
              />
            </template>
            <template #right>
              <img
                  v-if="comparisonImages && comparisonImages[1]"
                  :src="comparisonImages[1].url || ('data:' + comparisonImages[1].type + ';base64,' + comparisonImages[1].encodedFile)"
                  :alt="comparisonImages[1].typeName || ''"
                  class="max-h-[600px] max-w-full object-contain"
              />
            </template>
          </ImageCompare>
          <div v-else>{{ config.emptyComparisonMessage }}</div>
        </div>
      </template>
      <template v-else>
        <div class="flex justify-center items-center min-h-[300px]">
          {{ config.emptyGalleryMessage }}
        </div>
      </template>
    </template>
    <template v-else>
      <div class="flex justify-center items-center min-h-[300px]">
        <ProgressSpinner style="width:50px;height:50px" strokeWidth="4"/>
      </div>
    </template>
  </div>
</template>

<style>
</style>