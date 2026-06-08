<!--
  GonserBox - UI Komponente für versandkostenfreien Versand
  
  Zeigt Fortschritt bis CHF 35.00 für Gonser Box Artikel (Property ID 4, value '1').
  Verwendet useGonserBoxCart() für Cart-Berechnung.
-->
<template>
  <div
    v-if="shouldShow"
    class="gonser-box bg-gray-light rounded-[10px] mb-4"
    :class="[props.customClass, props.compact ? 'p-4' : 'p-5']"
  >
    <!-- Horizontal Layout (QuickCheckout) -->
    <template v-if="layout === 'horizontal'">
      <div class="flex items-center gap-4 md:gap-6">
        <!-- Left: Headline + Progress Bar (50%) -->
        <div
          class="flex-shrink-0"
          :class="props.hideInfoTextsMobile && props.hideImageMobile ? 'w-full md:w-[50%]' : 'w-full md:w-[50%]'"
        >
          <!-- Dynamic Headline -->
          <div class="mb-3">
            <h2 class="text-base font-semibold">
              <ClientOnly>
                <template v-if="remainingAmount > 0">
                  {{ t('theme.GonserBox.remainingPrefix') }}
                  <span class="text-[#20a33e]"
                    >{{ t('theme.GonserBox.currency') }} {{ remainingAmount.toFixed(2) }}</span
                  >
                  {{ t('theme.GonserBox.remainingSuffix') }}
                </template>
                <template v-else> {{ t('theme.GonserBox.freeShipping') }} </template>
                <template #fallback> {{ t('theme.GonserBox.shippingInfo') }} </template>
              </ClientOnly>
            </h2>
          </div>

          <!-- Progress Bar -->
          <ClientOnly>
            <div class="min-h-8">
              <div
                class="relative flex justify-between items-center w-full overflow-hidden rounded-[5px] h-8 px-3"
                :style="{ backgroundColor: 'var(--gray)' }"
              >
                <div
                  class="absolute h-full left-0 top-0 transition-[width] duration-500 ease-out"
                  :style="{ width: progressPercentage + '%', backgroundColor: '#20A33E' }"
                ></div>
                <span class="relative z-10 font-semibold text-base" :style="{ color: leftTextColor }">
                  <strong>{{ t('theme.GonserBox.currency') }} {{ gonserBoxTotal.toFixed(2) }}</strong>
                </span>
                <span
                  class="relative z-10 font-semibold flex items-center justify-end text-base"
                  :style="{ color: rightTextColor }"
                >
                  <strong v-if="remainingAmount > 0"
                    >{{ t('theme.GonserBox.currency') }} {{ remainingAmount.toFixed(2) }}</strong
                  >
                  <img
                    v-else
                    :src="t('theme.GonserBox.reachedIcon')"
                    :alt="t('theme.GonserBox.reached')"
                    class="w-5 h-5"
                  />
                </span>
              </div>
            </div>
          </ClientOnly>
        </div>

        <!-- Middle: Info Texts (35%) -->

        <div
          v-if="!props.hideInfoTexts"
          class="min-w-0"
          :class="props.hideInfoTextsMobile ? 'hidden md:flex md:flex-1' : 'flex-1'"
        >
          <div class="space-y-1">
            <p class="text-base font-semibold mb-4">Wann muss ich Versandkosten zahlen?</p>
            <p class="text-base font-normal">Nur bei GONSERBOX Artikeln fallen Versandkosten an.</p>
            <p class="text-base font-semibold">Ab CHF 35.00 versenden wir diese versandkostenfrei.</p>
          </div>
        </div>

        <!-- Right: Image (25%) -->
        <div
          v-if="!props.hideImage"
          :class="props.hideImageMobile ? 'hidden md:flex md:flex-shrink-0' : 'flex-shrink-0'"
        >
          <img
            :src="translatedImageUrl"
            :alt="translatedImageAlt"
            class="w-full max-w-[100px] max-h-[60px] h-auto object-contain rounded"
          />
        </div>
      </div>
    </template>

    <!-- Default Layout (Produktseite, Cart, CartDrawer) -->
    <template v-else>
      <!-- Dynamic Headline based on cart value -->
      <div :class="props.compact ? 'mb-3' : 'mb-4'">
        <h2 :class="props.compact ? 'text-sm font-semibold' : 'text-base font-semibold'">
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
        <div :class="props.compact ? 'mb-3 min-h-7' : 'mb-6 min-h-8'">
          <div
            class="relative flex justify-between items-center w-full px-3 overflow-hidden rounded-[5px]"
            :class="props.compact ? 'h-7 px-2.5' : 'h-8 px-3'"
            :style="{ backgroundColor: 'var(--gray)' }"
          >
            <div
              class="absolute h-full left-0 top-0 transition-[width] duration-500 ease-out"
              :style="{ width: progressPercentage + '%', backgroundColor: '#20A33E' }"
            ></div>
            <span
              class="relative z-10 font-semibold"
              :class="props.compact ? 'text-sm' : 'text-base'"
              :style="{ color: leftTextColor }"
            >
              <strong>{{ t('theme.GonserBox.currency') }} {{ gonserBoxTotal.toFixed(2) }}</strong>
            </span>
            <span
              class="relative z-10 font-semibold flex items-center justify-end"
              :class="props.compact ? 'text-sm' : 'text-base'"
              :style="{ color: rightTextColor }"
            >
              <strong v-if="remainingAmount > 0"
                >{{ t('theme.GonserBox.currency') }} {{ remainingAmount.toFixed(2) }}</strong
              >
              <img v-else :src="t('theme.GonserBox.reachedIcon')" :alt="t('theme.GonserBox.reached')" class="w-5 h-5" />
            </span>
          </div>
        </div>
      </ClientOnly>
    </template>

    <!-- Content: Text + Image (nur wenn nicht compact, nicht versteckt) -->
    <!-- hideContentWhenReached = true -> nur bei remainingAmount > 0 anzeigen (Cart/CartDrawer) -->
    <!-- hideContentWhenReached = false -> immer anzeigen (Produktseite) -->
    <div
      v-if="
        props.layout === 'default' &&
        !props.compact &&
        !props.hideInfoTexts &&
        (remainingAmount > 0 || !props.hideContentWhenReached)
      "
      class="flex items-start gap-1 md:gap-3 mb-6"
    >
      <!-- Text Column (75%) -->
      <div :class="props.hideImage ? 'basis-full' : 'basis-3/4 min-w-0'">
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
      <div v-if="!props.hideImage" class="basis-1/4 flex justify-end">
        <img
          :src="translatedImageUrl"
          :alt="translatedImageAlt"
          class="w-full max-w-[120px] max-h-[67px] h-auto object-contain rounded"
        />
      </div>
    </div>

    <!-- Compact Info Text -->
    <p v-if="props.compact && !props.hideInfoTexts && remainingAmount > 0" class="text-xs text-neutral-600">
      {{ translatedInfoText1 }}
    </p>

    <!-- Buttons -->
    <div
      v-if="
        !props.compact && !props.hideButtons && translatedButtons && translatedButtons.length > 0 && remainingAmount > 0
      "
      class="flex flex-col md:flex-row lg:flex-col xl:flex-row gap-4"
    >
      <a
        v-for="(button, index) in translatedButtons"
        :key="index"
        :href="button.url"
        :style="getButtonStyle(button)"
        :class="[
          'flex-1 transition-colors duration-200 inline-block text-center py-1.5 font-semibold rounded-[40px]',
          button.class,
        ]"
        @click="handleButtonClick(index, $event)"
      >
        {{ button.text }}
      </a>
    </div>

    <AvailabilityModal :model-value="isAvailabilityModalOpen" @close="closeAvailabilityModal" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { GonserBoxProps } from './types';
import { useGonserBoxCart } from '../../../composables/useGonserBoxCart/useGonserBoxCart';
import { useGonserBoxProperty } from '../../../composables/useGonserBoxProperty/useGonserBoxProperty';
import AvailabilityModal from '../AvailabilityModal/AvailabilityModal.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Get current product to check if it has Gonser Box property
const { currentProduct } = useProducts();
const { hasGonserBoxProperty } = useGonserBoxProperty();

const props = withDefaults(defineProps<GonserBoxProps>(), {
  threshold: 35,
  backgroundColor: 'var(--gray-light)',
  borderRadius: '10px',
  customClass: '',
  compact: false,
  hideButtons: false,
  hideImage: false,
  hideInfoTexts: false,
  hideInfoTextsMobile: false,
  hideImageMobile: false,
  layout: 'default',
  hideContentWhenReached: false,
});

// Check if box should be shown
const shouldShow = computed(() => {
  // If forceShow is explicitly true, always show
  if (props.forceShow === true) {
    return true;
  }

  // Use provided product prop or fall back to currentProduct
  const productToCheck = props.product || currentProduct.value;

  // Check if product has Gonser Box Property
  if (!productToCheck) {
    return false;
  }

  return hasGonserBoxProperty(productToCheck);
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

const isAvailabilityModalOpen = ref(false);
const openAvailabilityModal = () => {
  isAvailabilityModalOpen.value = true;
};
const closeAvailabilityModal = () => {
  isAvailabilityModalOpen.value = false;
};

const handleButtonClick = (index: number, event: Event) => {
  if (index === 1) {
    event.preventDefault();
    openAvailabilityModal();
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
