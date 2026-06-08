<template>
  <div class="bg-gray-light rounded-[10px] mb-4">
    <SfAccordionItem v-model="openedCoupon" data-testid="couponZone">
      <template #summary>
        <div :class="['flex justify-between p-5', { 'bg-gray-light rounded-md': openedCoupon }]">
          <h4 class="text-black">{{ t('checkout.coupon.redeem') }}</h4>
          <SfIconChevronLeft :class="['text-black', { 'rotate-90': openedCoupon, '-rotate-90': !openedCoupon }]" />
        </div>
      </template>
      <div class="flex px-5 pb-5">
        <div class="flex-grow mr-2" data-testid="couponCode">
          <input
            v-model="couponCode"
            :placeholder="t('checkout.coupon.placeholder')"
            :aria-label="t('checkout.coupon.placeholder')"
            type="text"
            name="couponCode"
            required
            class="w-full min-h-11 bg-white border border-gray-dark rounded-[5px] py-2.5 px-2.5 pl-4 text-base"
          />
        </div>
        <!-- Grüner Button: Gutschein einlösen -->
        <button
          v-if="!cartGetters.getCouponDiscount(cart)"
          data-testid="couponAdd"
          class="flex-1 inline-flex items-center justify-center rounded-[40px] py-2.5 px-6 bg-[#20A33E] hover:bg-[#14832E] text-white text-base font-semibold transition-colors"
          type="reset"
          variant="primary"
          :disabled="loading"
          @click="addCoupon({ couponCode })"
        >
          <SfLoaderCircular v-if="loading" class="flex justify-center items-center" size="sm" />
          <span v-else>
            {{ t('coupon.apply') }}
          </span>
        </button>
        <!-- Roter Button: Gutschein entfernen -->
        <button
          v-else
          data-testid="couponRemove"
          class="flex-1 inline-flex items-center justify-center rounded-[40px] py-2.5 px-6 bg-primary-500 hover:bg-primary-600 text-white text-base font-semibold transition-colors"
          type="reset"
          :disabled="loading"
          @click="handleDeleteCoupon"
        >
          <SfLoaderCircular v-if="loading" class="flex justify-center items-center" size="sm" />
          <span v-else class="flex items-center gap-1">
            {{ t('coupon.remove') }}
            <SfIconClose class="w-5 h-5" />
          </span>
        </button>
      </div>
    </SfAccordionItem>
  </div>
</template>

<script setup lang="ts">
import { cartGetters } from '@plentymarkets/shop-api';
import { SfAccordionItem, SfIconChevronLeft, SfIconClose, SfLoaderCircular } from '@storefront-ui/vue';
import type { CouponProps } from './types';

const props = withDefaults(defineProps<CouponProps>(), {
  context: 'cart',
});

const openedCoupon = ref(false);
const couponCode = ref('');
const { addCoupon, deleteCoupon, loading } = useCoupon();
const { data: cart } = useCart();

const handleDeleteCoupon = async () => {
  await deleteCoupon({ couponCode: couponCode.value });
  couponCode.value = '';
};

onMounted(() => {
  couponCode.value = cartGetters.getCouponCode(cart.value);
  openedCoupon.value = cartGetters.getCouponDiscount(cart.value) !== 0;
});
</script>
