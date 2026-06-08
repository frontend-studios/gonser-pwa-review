<!--
  EnergyLabel - Komponente für Energieeffizienzklassen-Label
  
  Zeigt das EEK Label basierend auf Property ID 47.
  Unterstützt Klick-Ereignis für Lightbox-Anzeige.
-->
<template>
  <div v-if="shouldShow" :class="containerClass">
    <button
      v-if="clickable"
      type="button"
      :class="buttonClass"
      :style="buttonStyle"
      :aria-label="`${t('theme.EnergyLabel.ariaLabel')} ${energyValue}`"
      @click="openLightbox"
    >
      <img :src="iconUrl" :alt="energyValue" class="w-full h-full object-contain" />
    </button>
    <div v-else :class="staticClass" :style="staticStyle">
      <img :src="iconUrl" :alt="energyValue" class="w-full h-full object-contain" />
    </div>

    <!-- Lightbox Modal -->
    <Teleport to="body">
      <div
        v-if="isLightboxOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        @click.self="closeLightbox"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-neutral-500/80" @click="closeLightbox"></div>

        <!-- Modal Content -->
        <div class="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between pt-4 px-4 pb-2">
            <p class="text-xl font-semibold">
              {{ t('theme.EnergyLabel.lightboxTitle') }}
            </p>
            <button
              @click="closeLightbox"
              class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-light hover:bg-gray transition-colors"
              type="button"
              :aria-label="t('common.actions.close')"
            >
              <svg class="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="px-4 pb-4 overflow-auto max-h-[calc(90vh-80px)]">
            <div class="flex justify-center">
              <img
                v-if="lightboxImageUrl"
                :src="lightboxImageUrl"
                :alt="`${t('theme.EnergyLabel.lightboxImageAlt')} ${energyValue}`"
                class="max-w-full h-auto"
              />
              <div v-else class="text-center py-8 text-gray-500">
                {{ t('theme.EnergyLabel.noLightboxImage') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue';
import type { EnergyLabelProps } from './types';
import { useEnergyLabel } from '../../../composables/useEnergyLabel/useEnergyLabel';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = withDefaults(defineProps<EnergyLabelProps>(), {
  position: 'bottom-right',
  size: 52,
  customClass: '',
  clickable: true,
});

const { hasEnergyLabel, getEnergyLabelValue, getEnergyIconUrl, getEnergyLabelLightboxImage } = useEnergyLabel();

const shouldShow = computed(() => hasEnergyLabel(props.product));
const energyValue = computed(() => getEnergyLabelValue(props.product) || '');
const iconUrl = computed(() => getEnergyIconUrl(energyValue.value) || undefined);

const isLightboxOpen = ref(false);

// Lightbox image URL - Bild mit Position 99 aus den Produktbildern
const lightboxImageUrl = computed(() => {
  return getEnergyLabelLightboxImage(props.product);
});

const containerClass = computed(() => {
  const classes = [props.customClass];

  if (props.position === 'bottom-right') {
    classes.push('absolute bottom-0 right-2 z-10');
  }

  return classes.filter(Boolean).join(' ');
});

const buttonClass = computed(() => {
  return 'transition-transform hover:scale-105 cursor-pointer';
});

const buttonStyle = computed(() => {
  return {
    width: `${props.size}px`,
    height: '32px',
  };
});

const staticClass = computed(() => {
  return '';
});

const staticStyle = computed(() => {
  return {
    width: `${props.size}px`,
    height: '32px',
  };
});

const openLightbox = () => {
  isLightboxOpen.value = true;
  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
  isLightboxOpen.value = false;
  // Restore body scroll
  document.body.style.overflow = '';
};

// Cleanup on unmount
onBeforeUnmount(() => {
  if (isLightboxOpen.value) {
    document.body.style.overflow = '';
  }
});
</script>
