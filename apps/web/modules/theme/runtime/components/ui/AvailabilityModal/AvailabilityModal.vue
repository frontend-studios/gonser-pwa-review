<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-[9999] flex items-center justify-center px-s pb-4"
    @click.self="emitClose"
  >
    <div class="absolute inset-0 bg-neutral-500/50" @click="emitClose"></div>

    <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
      <div class="flex items-center justify-between pt-s px-s pb-4">
        <p class="h2">
          {{ t('theme.ProductPage.availabilityModal.headline') }}
        </p>
        <button
          type="button"
          aria-label="Close"
          class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-light hover:bg-gray transition-colors"
          @click="emitClose"
        >
          <svg class="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="px-s pb-s overflow-auto max-h-[calc(90vh-100px)]">
        <div class="space-y-4 text-neutral-700">
          <p class="mb-4 font-semibold">{{ t('theme.ProductPage.availabilityModal.intro') }}</p>
          <p class="mb-4">{{ t('theme.ProductPage.availabilityModal.exception') }}</p>
          <p class="mb-4">{{ t('theme.ProductPage.availabilityModal.orderInfo') }}</p>
          <p class="mb-4">{{ t('theme.ProductPage.availabilityModal.shippingPartners') }}</p>
          <p>{{ t('theme.ProductPage.availabilityModal.noAbroad') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

defineProps<{ modelValue: boolean }>();

const emit = defineEmits<{
  close: [];
}>();

const emitClose = () => {
  emit('close');
};
</script>
