<template>
  <NuxtLayout
    name="checkout"
    :back-label-desktop="t('common.actions.back')"
    :back-label-mobile="t('common.actions.back')"
    :heading="t('common.labels.checkout')"
  >
    <div v-if="cart" class="@lg:grid @lg:grid-cols-12 @lg:gap-x-6">
      <div class="col-span-6 @xl:col-span-7 mb-10 @lg:mb-0">
        <ContactInformation id="contact-information" />
        <!-- Lieferadresse nur für eingeloggte User anzeigen, Gäste haben es im Accordion -->
        <template v-if="isAuthorized">
          <!-- <UiDivider id="top-shipping-divider" class="w-screen md:w-auto -mx-4 md:mx-0" /> -->
          <AddressContainer id="shipping-address" :key="0" :type="AddressType.Shipping" />
        </template>
        <!-- <UiDivider v-if="showBillingAddressSection" id="top-billing-divider" class="w-screen md:w-auto -mx-4 md:mx-0" /> -->

        <div v-if="showBillingAddressSection" class="pt-5">
          <AddressContainer id="billing-address" :key="1" :type="AddressType.Billing" />
        </div>

        <div class="relative">
          <!-- ShippingMethod nicht anzeigen -->
          <ShippingMethod
            class="hidden"
            :disabled="disableShippingPayment"
            :loading="!checkoutReady"
            @update:shipping-method="handleShippingMethodUpdate"
          />
          <SfLoaderCircular
            v-if="disableShippingPayment"
            class="absolute mt-5 right-0 left-0 m-auto z-[999]"
            size="2xl"
          />
          <!-- ENDE ShippingMethod nicht anzeigen -->
          <PreferredDeliveryPackstationFinder v-if="countryHasDelivery" />
          <PreferredDelivery v-if="countryHasDelivery" />

          <CheckoutPayment :disabled="disableShippingPayment" @update:active-payment="handlePaymentMethodUpdate" />
        </div>

        <CustomerReference />
        <CustomerWish />
        <CheckoutGeneralTerms />
      </div>
      <div class="col-span-6 @xl:col-span-5">
        <h3 class="flex items-center justify-between w-full py-4">{{ t('checkout.yourItems') }}</h3>
        <div v-for="(cartItem, index) in cart?.items" :key="cartItem.id">
          <UiCartProductCard :cart-item="cartItem" :class="{ '': index === 0 }" context="checkout" />
        </div>
        <div
          class="relative @md:sticky @md:top-20 h-fit pt-5"
          :class="{ 'pointer-events-none opacity-50': cartLoading }"
        >
          <SfLoaderCircular v-if="cartLoading" class="absolute top-[130px] right-0 left-0 m-auto z-[999]" size="2xl" />
          <Coupon context="checkout" />
          <OrderSummary v-if="cart" :cart="cart" :show-terms="true" class="mt-4">
            <CheckoutExportDeliveryHint v-if="cart.isExportDelivery" />
            <PaymentButtons />
            <ModuleComponentRendering area="checkout.afterBuyButton" />
          </OrderSummary>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { SfLoaderCircular } from '@storefront-ui/vue';
import type { ApiError } from '@plentymarkets/shop-api';
import { AddressType, cartGetters } from '@plentymarkets/shop-api';
import type { Locale } from '#i18n';

defineI18nRoute({
  locales: process.env.LANGUAGELIST?.split(',') as Locale[],
});

definePageMeta({
  layout: 'default',
  pageType: 'static',
  middleware: ['reject-empty-checkout'],
});

const { send } = useNotification();
const localePath = useLocalePath();
const { emit } = usePlentyEvent();
const { countryHasDelivery, hasCheckoutAddress } = useCheckoutAddress(AddressType.Shipping);
const { hasCheckoutAddress: hasBillingAddress } = useCheckoutAddress(AddressType.Billing);
const { isAuthorized, isGuest } = useCustomer();
const { shippingAsBilling } = useShippingAsBilling();
const checkoutReady = ref(false);
const {
  cart,
  cartIsEmpty,
  cartLoading,
  persistShippingAddress,
  persistBillingAddress,
  setBillingSkeleton,
  setShippingSkeleton,
  showBillingAddressSection,
} = useCheckout();
const { preferredDeliveryAvailable } = usePreferredDelivery();
const { fetchPaymentMethods } = usePaymentMethods();
const { getScript } = usePayPal();
const { paymentLoading, shippingLoading, handleShippingMethodUpdate, handlePaymentMethodUpdate, shippingMethods } =
  useCheckoutPagePaymentAndShipping();

// ShippingMethod nur anzeigen, wenn mehr als eine Methode verfügbar ist
const showShippingMethod = computed(() => shippingMethods.value && shippingMethods.value.length > 1);

emit('frontend:beginCheckout', cart.value);

const checkPayPalPaymentsEligible = async () => {
  if (import.meta.client) {
    const { data: cart } = useCart();
    const currency = computed(() => cartGetters.getCurrency(cart.value) || (useAppConfig().fallbackCurrency as string));

    await getScript(currency.value, true);
  }
};
await callOnce(async () => {
  await fetchPaymentMethods();
});

onNuxtReady(async () => {
  await useFetchAddressesData()
    .fetch()
    .then(() => persistShippingAddress())
    .then(() => persistBillingAddress())
    .catch((error: ApiError) => useHandleError(error))
    .finally(() => {
      setBillingSkeleton(false);
      setShippingSkeleton(false);
    });

  await Promise.all([
    checkPayPalPaymentsEligible(),
    ...(hasCheckoutAddress.value ? [useCartShippingMethods().getShippingMethods()] : []),
  ]);

  checkoutReady.value = true;
});

const disableShippingPayment = computed(() => shippingLoading.value || paymentLoading.value);
const { processingOrder } = useProcessingOrder();

// Ensure billing section visibility is synced with shippingAsBilling checkbox
watch(
  shippingAsBilling,
  () => {
    showBillingAddressSection.value = !shippingAsBilling.value || hasBillingAddress.value;
  },
  { immediate: true },
);

watch(cartIsEmpty, async () => {
  if (!processingOrder.value) {
    send({ type: 'neutral', message: t('cart.emptyNotification') });
    await navigateTo(localePath(paths.cart));
  }
});
</script>
