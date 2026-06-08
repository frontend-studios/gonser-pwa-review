<template>
  <div class="inline-flex flex-col items-center" data-testid="quantity-selector">
    <div class="flex items-center border border-gray rounded-[40px] h-full w-full">
      <SfTooltip
        v-if="count <= minValue"
        :label="t('product.minimumQuantity', { count: minValue })"
        placement="top"
        :show-arrow="true"
        class="flex z-[10]"
      >
        <button
          type="button"
          :disabled="disabled || count <= minValue"
          class="inline-flex h-12 w-12 items-center justify-center rounded-r-none rounded-l-[40px] bg-white text-dark transition-colors hover:bg-gray-light disabled:text-disabled-500 disabled:cursor-not-allowed"
          :aria-controls="inputId"
          :aria-label="t('product.decreaseQuantity')"
          data-testid="quantity-selector-decrease-button"
          @click="dec()"
        >
          <SfIconRemove />
        </button>
      </SfTooltip>
      <button
        v-else
        type="button"
        :disabled="disabled || count <= minValue"
        class="inline-flex h-12 w-12 items-center justify-center rounded-r-none rounded-l-[40px] bg-white text-dark transition-colors hover:bg-gray-light disabled:text-disabled-500 disabled:cursor-not-allowed"
        :aria-controls="inputId"
        :aria-label="t('product.decreaseQuantity')"
        data-testid="quantity-selector-decrease-button"
        @click="dec()"
      >
        <SfIconRemove />
      </button>
      <input
        :id="inputId"
        v-model="count"
        type="number"
        role="spinbutton"
        :class="inputClasses"
        :min="minValue"
        :max="maxValue"
        data-testid="quantity-selector-input"
        class="h-12"
        :aria-label="t('common.labels.quantitySelector')"
        :disabled="disabled"
        @input="handleOnChange"
      />
      <button
        type="button"
        :disabled="disabled || count >= maxValue"
        class="inline-flex h-12 w-12 items-center justify-center rounded-l-none rounded-r-[40px] bg-white text-dark transition-colors hover:bg-gray-light disabled:text-disabled-500 disabled:cursor-not-allowed"
        :aria-controls="inputId"
        :aria-label="t('product.increaseQuantity')"
        data-testid="quantity-selector-increase-button"
        @click="inc()"
      >
        <SfIconAdd />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { clamp } from '@storefront-ui/shared';
import { SfIconAdd, SfIconRemove, SfTooltip, useId } from '@storefront-ui/vue';
import { useCounter } from '@vueuse/core';
import type { QuantitySelectorProps } from '~/components/ui/QuantitySelector/types';

const emit = defineEmits(['changeQuantity']);

const {
  value = 1,
  minValue = 1,
  maxValue = Number.POSITIVE_INFINITY,
  disabled = false,
} = defineProps<QuantitySelectorProps>();

const inputId = ref('0');
const { count, inc, dec, set } = useCounter(value);

const inputClasses = computed(
  () =>
    'appearance-none flex-1 mx-2 w-8 text-center bg-transparent font-medium [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:display-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:display-none [&::-webkit-outer-spin-button]:m-0 [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none disabled:placeholder-disabled-900 focus-visible:outline focus-visible:outline-offset focus-visible:rounded-sm',
);

onMounted(() => (inputId.value = useId()));

watch(count, (quantity) => {
  if (quantity < minValue) {
    set(minValue);
  } else if (quantity > maxValue) {
    set(maxValue);
  }

  emit('changeQuantity', quantity);
});

const handleOnChange = (event: Event) => {
  const currentValue = (event.target as HTMLInputElement)?.value;
  const nextValue = Number.parseFloat(currentValue);
  set(clamp(nextValue, minValue, maxValue));
};

defineExpose({ handleOnChange });
</script>
