<template>
  <fieldset class="px-0 pb-6" data-testid="checkout-payment">
    <div class="flex justify-between items-center mb-4">
      <h3 class="">{{ t('checkout.payment.heading') }}</h3>
      <span class="text-gray-super-dark text-sm">{{ t('checkout.payment.secureEncrypted') }}</span>
    </div>
    <div v-if="paymentMethods?.list && paymentMethods.list.length > 0" class="flex flex-col gap-4">
      <label
        v-for="paymentMethod in sortedPaymentMethods"
        :key="paymentMethod.id"
        class="relative border border-gray rounded-[10px]"
        :class="{
          'bg-gray-light border-0': isPaymentMethodChecked(paymentMethod),
          'cursor-pointer': !isPaymentMethodDisabled(paymentMethod),
          'cursor-not-allowed opacity-50': isPaymentMethodDisabled(paymentMethod),
        }"
      >
        <input
          type="radio"
          name="payment_method"
          class="peer sr-only"
          :value="paymentMethod.id"
          :data-testid="`payment-method-${paymentMethod.id}`"
          :checked="isPaymentMethodChecked(paymentMethod)"
          :disabled="isPaymentMethodDisabled(paymentMethod)"
          @click.prevent="handlePaymentMethodChange(paymentMethod)"
        />
        <div
          class="p-4"
          :class="{
            'flex flex-col': isPaymentMethodChecked(paymentMethod),
            'flex items-center justify-between': !isPaymentMethodChecked(paymentMethod),
          }"
        >
          <div
            class="flex items-center justify-between w-full"
            :class="{ 'border-b border-gray pb-4': isPaymentMethodChecked(paymentMethod) }"
          >
            <!-- Radio-Indikator links -->
            <span
              class="mr-4 w-5 h-5 rounded-full border-2 border-black flex items-center justify-center shrink-0"
              :class="{
                'border-black': isPaymentMethodChecked(paymentMethod),
              }"
            >
              <span v-if="isPaymentMethodChecked(paymentMethod)" class="w-3 h-3 rounded-full bg-black"></span>
            </span>

            <!-- Name in der Mitte -->
            <span class="flex-1 text-base text-black">
              {{ paymentMethod.name }}
            </span>

            <!-- Bilder rechts -->
            <div class="flex items-center gap-2">
              <span v-if="paymentMethod.id === -1" class="flex items-center">
                <SfIconCreditCard class="w-7 h-7" />
              </span>
              <!-- Mehrere Icons für Kreditkarte (ID 6012) -->
              <template v-else-if="String(paymentMethod.id) === '6012'">
                <NuxtImg
                  src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/Payment/CreditCard/visa.svg"
                  alt="Visa"
                  class="!h-[28px]"
                  loading="lazy"
                />
                <NuxtImg
                  src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/Payment/CreditCard/mastercard.svg"
                  alt="Mastercard"
                  class="!h-[28px]"
                  loading="lazy"
                />
                <NuxtImg
                  src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/Payment/CreditCard/ga-pay.svg"
                  alt="Google Pay"
                  class="!h-[28px]"
                  loading="lazy"
                />
                <NuxtImg
                  src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/Payment/CreditCard/creditcard.svg"
                  alt="Kreditkarte"
                  class="!h-[28px]"
                  loading="lazy"
                />
              </template>
              <NuxtImg v-else :src="paymentMethod.icon" :alt="paymentMethod.name" class="!h-[28px]" loading="lazy" />
            </div>
          </div>

          <!-- Text bei ausgewählter Zahlungsart -->
          <div v-if="isPaymentMethodChecked(paymentMethod)" class="pt-5 text-sm text-black">
            {{ getPaymentMethodDescription(paymentMethod) }}
          </div>
        </div>
      </label>
    </div>
    <div
      v-else
      class="flex items-start bg-warning-100 shadow-md pr-2 pl-4 ring-1 ring-warning-200 typography-text-sm @md:typography-text-base py-1 rounded-md"
      data-testid="no-payment-method-available"
    >
      <SfIconWarning class="mt-2 mr-2 text-warning-700 shrink-0" />
      <div class="py-2 mr-2">
        <p>{{ t('checkout.payment.noMethodsAvailable') }}</p>
      </div>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { paymentProviderGetters, type PaymentMethod } from '@plentymarkets/shop-api';
import { SfIconCreditCard, SfIconWarning } from '@storefront-ui/vue';
import type { CheckoutPaymentEmits, CheckoutPaymentProps } from '~/components/CheckoutPayment/types';

const { disabled = false } = defineProps<CheckoutPaymentProps>();
const emit = defineEmits<CheckoutPaymentEmits>();

const { send } = useNotification();
const { data: cart } = useCart();
const { selectedMethod: selectedShippingMethod } = useCartShippingMethods();
const { fetchPaymentMethods } = usePaymentMethods();
const { paymentMethods } = useCheckoutPagePaymentAndShipping();
const { on } = usePlentyEvent();

// Gewünschte Reihenfolge der Zahlungsarten-IDs - für Gonser
const paymentMethodOrder = ['6034', '6012', '6019', '6010', '6025'];

const sortedPaymentMethods = computed(() => {
  if (!paymentMethods.value?.list) return [];

  const methods = [...paymentMethods.value.list];

  return methods.sort((a, b) => {
    const aIndex = paymentMethodOrder.indexOf(String(a.id));
    const bIndex = paymentMethodOrder.indexOf(String(b.id));

    // Wenn beide in der Order-Liste sind, nach dieser sortieren
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    // Wenn nur a in der Liste ist, kommt a zuerst
    if (aIndex !== -1) return -1;

    // Wenn nur b in der Liste ist, kommt b zuerst
    if (bIndex !== -1) return 1;

    // Wenn beide nicht in der Liste sind, Original-Reihenfolge beibehalten
    return 0;
  });
});

const isPaymentMethodChecked = (paymentMethod: PaymentMethod): boolean =>
  !paymentProviderGetters.isPaymentMethodExcluded(selectedShippingMethod.value, paymentMethod.id) &&
  paymentMethod.id === cart.value.methodOfPaymentId;

const isPaymentMethodDisabled = (paymentMethod: PaymentMethod): boolean =>
  !paymentMethod.isSelectable ||
  disabled ||
  paymentProviderGetters.isPaymentMethodExcluded(selectedShippingMethod.value, paymentMethod.id);

const emitActivePaymentUpdate = (paymentMethod: PaymentMethod) => {
  if (!selectedShippingMethod.value || !paymentMethod.isSelectable || disabled) return;
  emit('update:activePayment', paymentMethod.id);
};

const handlePaymentMethodChange = (paymentMethod: PaymentMethod) => {
  paymentProviderGetters.isPaymentMethodExcluded(selectedShippingMethod.value, paymentMethod.id)
    ? send({ message: t('billing.methodChanged'), type: 'warning' })
    : emitActivePaymentUpdate(paymentMethod);
};

const getPaymentMethodDescription = (paymentMethod: PaymentMethod): string => {
  const methodId = String(paymentMethod.id);
  const translationKey = `checkout.payment.methods.${methodId}.description`;

  // Prüfe, ob eine spezifische Übersetzung existiert
  const { te } = useI18n();
  if (te(translationKey)) {
    return t(translationKey);
  }

  // Fallback zur Standard-Beschreibung
  return t('checkout.payment.defaultDescription', { name: paymentMethod.name });
};

on('frontend:paypalAPMsLoaded', async () => {
  await fetchPaymentMethods();
});
</script>
