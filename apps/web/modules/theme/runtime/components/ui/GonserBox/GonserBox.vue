<!--
  GonserBox - UI Komponente für versandkostenfreien Versand
  
  Zeigt Fortschritt bis CHF 35.00 für Gonser Box Artikel (Property ID 4, value '1').
  Verwendet useGonserBoxCart() für Cart-Berechnung.
-->
<template>
  <div v-if="shouldShow" class="gonser-box bg-gray-light rounded-[10px] p-5 mb-4" :class="customClass">
    <!-- Dynamic Headline based on cart value -->
    <div class="mb-4">
      <h2 class="text-base font-semibold">
        <ClientOnly>
          <template v-if="remainingAmount > 0">
            {{ t('theme.GonserBox.remainingPrefix') }}
            <span class="text-[#20a33e]">{{ t('theme.GonserBox.currency') }} {{ remainingAmount.toFixed(2) }}</span>
            {{ t('theme.GonserBox.remainingSuffix') }}
          </template>
          <template v-else> {{ t('theme.GonserBox.freeShipping') }} </template>
          <template #fallback> {{ t('theme.GonserBox.shippingInfo') }} </template>
        </ClientOnly>
      </h2>
    </div>

    <!-- Shipping Progress Bar -->
    <ClientOnly>
      <div class="mb-6 min-h-8">
        <div
          class="relative flex justify-between items-center w-full h-8 px-3 overflow-hidden rounded-[5px]"
          :style="{ backgroundColor: 'var(--gray)' }"
        >
          <div
            class="absolute h-full left-0 top-0 transition-[width] duration-500 ease-out"
            :style="{ width: progressPercentage + '%', backgroundColor: '#20A33E' }"
          ></div>
          <span class="relative z-10 font-semibold text-base" :style="{ color: leftTextColor }">
            <strong>{{ t('theme.GonserBox.currency') }} {{ gonserBoxTotal.toFixed(2) }}</strong>
          </span>
          <span class="relative z-10 font-semibold text-base" :style="{ color: rightTextColor }">
            <strong v-if="remainingAmount > 0"
              >{{ t('theme.GonserBox.currency') }} {{ remainingAmount.toFixed(2) }}</strong
            >
            <strong v-else>{{ t('theme.GonserBox.reached') }}</strong>
          </span>
        </div>
      </div>
    </ClientOnly>

    <!-- Content: Text (75%) + Image (25%) -->
    <div class="flex flex-col md:flex-row gap-3 mb-6">
      <!-- Text Column (75%) -->
      <div class="flex-[3]">
        <div class="space-y-2">
          <p class="text-base font-normal" style="font-weight: 400">
            {{ translatedInfoText1 }}
          </p>
          <p class="text-base font-semibold" style="font-weight: 600">
            {{ translatedInfoText2 }}
          </p>
        </div>
      </div>

      <!-- Image Column (25%) -->
      <div class="flex-[1] flex justify-end">
        <img
          :src="translatedImageUrl"
          :alt="translatedImageAlt"
          class="max-w-[120px] max-h-[67px] w-auto h-auto object-contain rounded"
        />
      </div>
    </div>

    <!-- Buttons -->
    <div
      v-if="translatedButtons && translatedButtons.length > 0"
      class="flex flex-col md:flex-row lg:flex-col xl:flex-row gap-4"
    >
      <a
        v-for="(button, index) in translatedButtons"
        :key="index"
        :href="button.url"
        :style="getButtonStyle(button)"
        :class="[
          'flex-1 rounded transition-colors duration-200 inline-block text-center py-1.5 font-semibold rounded-[40px]',
          button.class,
        ]"
        @click="handleButtonClick(index, $event)"
      >
        {{ button.text }}
      </a>
    </div>

    <!-- Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-s pb-4"
      @click.self="closeModal"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-neutral-500/50" @click="closeModal"></div>

      <!-- Modal Content -->
      <div class="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between pt-s px-s pb-4">
          <p class="h2">
            {{ t('theme.GonserBox.modal.headline') }}
          </p>
          <button
            @click="closeModal"
            class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-light hover:bg-gray transition-colors"
            type="button"
            aria-label="Close"
          >
            <svg class="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="px-s pb-s overflow-auto max-h-[calc(90vh-100px)]">
          <p class="mb-4">
            {{ t('theme.GonserBox.modal.intro', { freeShippingText: t('theme.GonserBox.modal.freeShippingText') }) }}
          </p>
          <img
            :src="t('theme.GonserBox.modal.imageUrl')"
            :alt="t('theme.GonserBox.modal.imageAlt')"
            class="float-right w-[150px] h-[114px] ml-4 mb-4"
          />
          <p class="mb-4">
            {{ t('theme.GonserBox.modal.exceptionPart1') }}
            <strong>{{ t('theme.GonserBox.brandName') }}</strong>
            {{ t('theme.GonserBox.modal.exceptionPart2') }}
            <strong>{{ t('theme.GonserBox.brandName') }}</strong>
            {{ t('theme.GonserBox.modal.exceptionPart3', { currency: t('theme.GonserBox.currency') }) }}
            <strong>{{ t('theme.GonserBox.brandName') }}</strong>
            {{ t('theme.GonserBox.modal.exceptionPart4', { currency: t('theme.GonserBox.currency') }) }}
          </p>
          <p class="mb-4">{{ t('theme.GonserBox.modal.orderInfo') }}</p>
          <p class="mb-4">{{ t('theme.GonserBox.modal.shippingPartners') }}</p>
          <p>{{ t('theme.GonserBox.modal.noAbroad') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { GonserBoxProps } from './types';
import { useGonserBoxCart } from '../../../composables/useGonserBoxCart/useGonserBoxCart';
import { useGonserBoxProperty } from '../../../composables/useGonserBoxProperty/useGonserBoxProperty';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Get current product to check if it has Gonser Box property
const { currentProduct } = useProducts();
const { hasGonserBoxProperty } = useGonserBoxProperty();

// Check if current product has Gonser Box Property (ID 4 with value '1')
const shouldShow = computed(() => {
  if (!currentProduct.value) return false;
  return hasGonserBoxProperty(currentProduct.value);
});

const props = withDefaults(defineProps<GonserBoxProps>(), {
  threshold: 35,
  backgroundColor: 'var(--gray-light)',
  borderRadius: '10px',
  customClass: '',
});

const { gonserBoxTotal: calculatedGonserBoxTotal } = useGonserBoxCart();

// i18n Übersetzungen mit Fallbacks
const translatedInfoText1 = computed(() => props.infoText1 || t('theme.GonserBox.infoText1'));
const translatedInfoText2 = computed(() => props.infoText2 || t('theme.GonserBox.infoText2'));
const translatedImageUrl = computed(() => props.imageUrl || t('theme.GonserBox.imageUrl'));
const translatedImageAlt = computed(() => props.imageAlt || t('theme.GonserBox.imageAlt'));

// Buttons mit i18n Fallbacks
const translatedButtons = computed(() => {
  if (props.buttons && props.buttons.length > 0) {
    return props.buttons;
  }
  return [
    {
      text: t('theme.GonserBox.button1.text'),
      url: t('theme.GonserBox.button1.url'),
      class: 'bg-black text-white hover:bg-gray-super-dark',
    },
    {
      text: t('theme.GonserBox.button2.text'),
      url: t('theme.GonserBox.button2.url'),
      class: 'bg-gray text-black hover:bg-gray-dark',
    },
  ];
});

const isModalOpen = ref(false);
const openModal = () => {
  isModalOpen.value = true;
};
const closeModal = () => {
  isModalOpen.value = false;
};

const handleButtonClick = (index: number, event: Event) => {
  if (index === 1) {
    event.preventDefault();
    openModal();
  }
};

// Container Styles
// const containerStyle = computed(() => ({
//   backgroundColor: props.backgroundColor,
//   borderRadius: props.borderRadius,
// }));

const gonserBoxTotal = calculatedGonserBoxTotal;

// Berechnungen für Fortschrittsanzeige
const remainingAmount = computed(() => {
  const remaining = props.threshold - gonserBoxTotal.value;
  return remaining > 0 ? remaining : 0;
});

const progressPercentage = computed(() => {
  const percentage = (gonserBoxTotal.value / props.threshold) * 100;
  return Math.min(percentage, 100);
});

const leftTextColor = computed(() => (progressPercentage.value > 15 ? 'white' : 'var(--black)'));
const rightTextColor = computed(() => (progressPercentage.value > 85 ? 'white' : 'var(--black)'));

// Button Styling
const getButtonClasses = (button: any) => {
  if (button.style === 'custom') return '';

  const styleMap: Record<string, string> = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-secondary-700 hover:bg-secondary-800 text-white',
    green: 'bg-green-600 hover:bg-green-700 text-white',
  };

  return styleMap[button.style || 'primary'] || styleMap.primary;
};

const getButtonStyle = (button: any) => {
  const style: Record<string, string> = {};

  if (button.style === 'custom') {
    if (button.customColor) style.backgroundColor = button.customColor;
    if (button.customTextColor) style.color = button.customTextColor;
  }

  if (button.borderRadius) style.borderRadius = button.borderRadius;
  if (button.fontSize) style.fontSize = button.fontSize;
  if (button.padding) style.padding = button.padding;

  return style;
};
</script>
