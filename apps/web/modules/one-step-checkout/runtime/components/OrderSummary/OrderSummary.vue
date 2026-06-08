<template>
  <div class="bg-gray-light rounded-[10px] p-3 @md:p-5" data-testid="order-summary">
    <div class="flex justify-between items-end mb-2.5">
      <h4 class="text-black">{{ t('checkout.confirmationPage.orderConfirmation.summary') }}</h4>
    </div>

    <div class="mt-3 @md:mt-0">
      <div v-if="orderPropertiesWithVatAdditionalCosts.length > 0" class="mb-4">
        <div
          v-for="property in orderPropertiesWithVatAdditionalCosts"
          :key="cartGetters.getBasketItemOrderParamPropertyId(property)"
          class="flex justify-between typography-text-base w-full"
        >
          <p class="flex flex-col gap-2 grow pr-2">{{ cartGetters.getBasketItemOrderParamName(property) }}</p>
          <p class="flex flex-col gap-2 text-right">
            {{ formatCustom(cartGetters.getBasketItemOrderParamPrice(property)) }}
          </p>
        </div>

        <UiDivider class="mt-4 w-auto" />
      </div>

      <div class="typography-text-base mb-4">
        <div class="flex justify-between mb-2.5">
          <p data-testid="subtotal-label" class="font-semibold text-base">
            Warenwert <span v-if="showNetPrices">({{ t('common.labels.netPrice') }})</span>
          </p>
          <p v-if="showNetPrices" data-testid="subtotal" class="font-semibold text-base">
            {{ formatCustom(cartGetters.getItemSumNet(props.cart)) }}
          </p>
          <p v-else data-testid="subtotal" class="font-semibold text-base">{{ formatCustom(totals.subTotal) }}</p>
        </div>

        <div class="flex justify-between mb-2.5">
          <p data-testid="shipping-label" class="font-semibold text-base">
            {{ t('common.labels.delivery') }} <span v-if="showNetPrices">({{ t('common.labels.netPrice') }})</span>
          </p>
          <p v-if="showNetPrices" data-testid="shipping" class="font-semibold text-base">
            {{ getShippingAmount(cartGetters.getShippingAmountNet(props.cart)) }}
          </p>
          <p v-else data-testid="shipping" class="font-semibold text-base">
            {{ getShippingAmount(cartGetters.getShippingPrice(props.cart)) }}
          </p>
        </div>

        <div v-if="cartGetters.getCouponDiscount(props.cart)" class="flex justify-between mb-2">
          <p data-testid="coupon-label" class="font-semibold text-base">
            {{ t('coupon.name') }}
          </p>
          <p class="font-semibold text-base" data-testid="coupon-value">
            - {{ formatCustom(Math.abs(cartGetters.getCouponDiscount(props.cart))) }}
          </p>
        </div>

        <UiDivider class="w-screen @md:w-auto -mx-4 @md:mx-0 my-2" />

        <div v-for="(vat, index) in totals.vats" :key="index" class="flex justify-between mb-2">
          <p data-testid="vat-label" class="font-semibold text-base">MwSt. {{ cartGetters.getTotalVatValue(vat) }}%</p>
          <p data-testid="vat" class="font-semibold text-base">
            {{ formatCustom(cartGetters.getTotalVatAmount(vat)) }}
          </p>
        </div>

        <UiDivider class="w-screen @md:w-auto -mx-4 @md:mx-0 my-2" />
      </div>

      <div v-if="orderPropertiesWithoutVat.length > 0" class="mb-4">
        <UiDivider class="mb-4" />
        <div
          v-for="property in orderPropertiesWithoutVat"
          :key="cartGetters.getBasketItemOrderParamPropertyId(property)"
          class="flex justify-between typography-text-base w-full"
        >
          <p class="flex flex-col gap-2 grow pr-2">{{ cartGetters.getBasketItemOrderParamName(property) }}</p>
          <p class="flex flex-col gap-2 text-right">
            {{ formatCustom(cartGetters.getBasketItemOrderParamPrice(property)) }}
          </p>
        </div>
        <UiDivider class="mt-4 w-auto" />
      </div>

      <div v-if="showNetPrices" class="flex justify-between typography-text-base mb-1">
        <h4 data-testid="total-net-label">{{ t('common.labels.total') }} ({{ t('common.labels.netPrice') }})</h4>
        <h4 data-testid="total-net">{{ formatCustom(cartGetters.getBasketAmountNet(cart)) }}</h4>
      </div>
      <div class="flex justify-between typography-text-base font-bold pb-2.5 mb-2.5">
        <h4 data-testid="total-label">
          {{ t('checkout.confirmationPage.orderConfirmation.totalAmount') }}
          <span v-if="showNetPrices">({{ t('common.labels.grossPrice') }})</span>
        </h4>
        <h4 data-testid="total">
          <span class="text-base">{{ formattedTotal.currency }}</span>
          <span class="text-[22px] ml-1">{{ formattedTotal.amount }}</span>
        </h4>
      </div>

      <slot />

      <!-- AGB-Text unter dem Kaufen-Button -->
      <p v-if="props.showTerms" class="text-sm mt-4">
        <i18n-t keypath="theme.checkout.termsAcceptance" scope="global">
          <template #terms>
            <SfLink :href="localePath(paths.termsAndConditions)" target="_blank" class="text-red no-underline">
              {{ t('legal.termsAndConditions') }}
            </SfLink>
          </template>
        </i18n-t>
      </p>

      <!-- POWERPAY AGB-Text für Payment ID 6019 -->
      <p v-if="props.showTerms && props.cart.methodOfPaymentId === 6019" class="text-sm mt-4">
        <i18n-t keypath="theme.checkout.powerpayTermsAcceptance" scope="global">
          <template #powerpayLink>
            <a href="https://www.powerpay.ch/de/agb" target="_blank" class="text-red no-underline">
              powerpay.ch/de/agb
            </a>
          </template>
        </i18n-t>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { cartGetters } from '@plentymarkets/shop-api';
import { SfLink } from '@storefront-ui/vue';
import type { OrderSummaryPropsType } from './types';
import { paths } from '~/utils/paths';

const props = defineProps<OrderSummaryPropsType>();
const localePath = useLocalePath();
const { showNetPrices } = useCart();
const { format } = usePriceFormatter();

const totals = computed(() => {
  const totalsData = cartGetters.getTotals(props.cart);
  return {
    total: totalsData.total,
    subTotal: totalsData.subtotal,
    vats: totalsData.totalVats,
  };
});

const getShippingAmount = (amount: number) => {
  return formatCustom(amount);
};

const formatCustom = (amount: number) => {
  const formatted = format(amount); // z.B. "538,00 CHF"
  if (!formatted) return 'CHF 0.00';
  // Transformiere "538,00 CHF" → "CHF 538.00"
  return formatted.replace(/^(.+?)\s+CHF$/, 'CHF $1').replace(',', '.');
};

// Formatierter Total-Preis aufgeteilt in Währung und Betrag
const formattedTotal = computed(() => {
  const fullPrice = formatCustom(totals.value.total || 0);
  if (!fullPrice) {
    return { currency: 'CHF', amount: '0.00' };
  }
  // "CHF 36.60" → { currency: "CHF", amount: "36.60" }
  const parts = fullPrice.split(' ');
  const currency = parts[0] || 'CHF';
  const amount = parts[1] || '0.00';
  return { currency, amount };
});

const cartItemsCount = computed(() => props.cart?.items?.reduce((price, { quantity }) => price + quantity, 0) ?? 0);
const orderPropertiesWithoutVat = computed(() => cartGetters.getOrderPropertiesWithoutVat(props.cart));
const orderPropertiesWithVatAdditionalCosts = computed(() =>
  cartGetters.getOrderPropertiesAdditionalCostsWithVat(props.cart),
);
</script>
