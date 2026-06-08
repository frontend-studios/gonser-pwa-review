<template>
  <div
    class="px-4 @md:px-0 flex items-center flex-col max-w-screen-2xl mx-auto relative overflow-hidden"
    data-testid="order-success-page"
  >
    <!-- Konfetti Animation (nur nach Checkout) -->
    <div
      v-if="contextReady && isCheckoutContext"
      v-for="(confetti, index) in confettiItems"
      :key="`confetti-${index}`"
      class="confetti"
      :style="confetti.style"
    ></div>
    <!-- Zwei-Spalten Layout -->
    <div class="flex flex-col @md:flex-row w-full flex-wrap gap-x-6">
      <!-- LINKE SPALTE -->
      <div class="flex-1">
        <!-- Vielen Dank Header -->
        <div class="my-4 flex flex-col">
          <h1 class="mb-5" data-testid="success-header">
            {{ !orderGetters.isReturn(order) ? t('order.successHeader') : t('order.successReturnHeader') }}
          </h1>
          <div v-if="contextReady && isCheckoutContext && !orderGetters.isReturn(order)" class="font-medium">
            {{ t('checkout.confirmationPage.order.successMessage') }}
          </div>
        </div>

        <!-- Speichern Sie diese Bestellung in Ihrem Konto -->
        <div
          v-if="contextReady && isCheckoutContext && !isAuthorized"
          class="rounded-[10px] bg-[#20A33E1A] p-5 mb-5 w-full text-base"
        >
          <div class="font-medium">
            <h3 class="">{{ t('checkout.confirmationPage.createAccount.title') }}</h3>

            <div class="mt-5 font-normal flex flex-col gap-2">
              <div class="flex items-start md:items-center gap-2">
                <div class="min-w-6 w-6 h-6 mt-1 md:mt-0 flex items-center justify-center">
                  <SfIconSchedule class="text-black" />
                </div>
                <p>
                  <b>{{ t('checkout.confirmationPage.createAccount.benefits.expressCheckout.title') }}</b>
                  {{ t('checkout.confirmationPage.createAccount.benefits.expressCheckout.description') }}
                </p>
              </div>
              <div class="flex items-start md:items-center gap-2">
                <div class="min-w-6 w-6 h-6 mt-1 md:mt-0 flex items-center justify-center">
                  <SfIconFavorite class="text-black" />
                </div>
                <p>
                  <b>{{ t('checkout.confirmationPage.createAccount.benefits.wishlist.title') }}</b>
                  {{ t('checkout.confirmationPage.createAccount.benefits.wishlist.description') }}
                </p>
              </div>
              <div class="flex items-start md:items-center gap-2">
                <div class="min-w-6 w-6 h-6 mt-1 md:mt-0 flex items-center justify-center">
                  <img
                    src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/Header/Order.svg"
                    :alt="t('checkout.confirmationPage.createAccount.benefits.orderOverview.description')"
                    class="w-6 h-6"
                  />
                </div>
                <p>
                  <b>{{ t('checkout.confirmationPage.createAccount.benefits.orderOverview.title') }}</b>
                  {{ t('checkout.confirmationPage.createAccount.benefits.orderOverview.description') }}
                </p>
              </div>
              <div class="flex items-start md:items-center gap-2 mb-2">
                <div class="min-w-6 w-6 h-6 mt-1 md:mt-0 flex items-center justify-center">
                  <img
                    src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/Header/Map.svg"
                    :alt="t('checkout.confirmationPage.createAccount.benefits.trackShipment.description')"
                    class="w-6 h-6"
                  />
                </div>
                <p>
                  <b>{{ t('checkout.confirmationPage.createAccount.benefits.trackShipment.title') }}</b>
                  {{ t('checkout.confirmationPage.createAccount.benefits.trackShipment.description') }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-center my-1">
            <form class="flex flex-col gap-2 rounded-md w-full" @submit.prevent="onSubmit">
              <label>
                <UiFormLabel>{{ t('form.passwordLabel') }} {{ t('form.required') }}</UiFormLabel>
                <div class="flex gap-2 items-start">
                  <div class="flex-1">
                    <UiFormPasswordInput
                      v-model="password"
                      :title="t('authentication.signup.passwordValidation.invalidPassword')"
                      name="password"
                      autocomplete="current-password"
                      v-bind="passwordAttributes"
                      :invalid="!!errors['register.password']"
                      @input="stripSpaces('password')"
                    />
                    <ErrorMessage as="span" name="register.password" class="flex text-negative-700 text-sm mt-2" />
                  </div>
                  <UiButton
                    type="submit"
                    class="!bg-green-600 hover:!bg-green-700 active:!bg-green-700 whitespace-nowrap !rounded-[40px]"
                    :disabled="registerLoading || migrateLoading"
                  >
                    <SfLoaderCircular
                      v-if="registerLoading || migrateLoading"
                      class="flex justify-center items-center"
                      size="base"
                    />
                    <span v-else>
                      {{ t('checkout.confirmationPage.passwordValidation.submitLabel') }}
                    </span>
                  </UiButton>
                </div>
              </label>

              <div class="text-xs flex flex-wrap items-center gap-2">
                <span class="font-semibold">{{ t('checkout.confirmationPage.passwordValidation.minLabel') }}</span>
                <div class="flex items-center gap-1" :class="{ 'text-green-600': passwordValidationLength }">
                  <SfIconCheck v-if="passwordValidationLength" size="sm" />
                  <SfIconClose v-else size="sm" />
                  <span>{{ t('checkout.confirmationPage.passwordValidation.characters') }}</span>
                </div>
                <div class="flex items-center gap-1" :class="{ 'text-green-600': passwordValidationOneDigit }">
                  <SfIconCheck v-if="passwordValidationOneDigit" size="sm" />
                  <SfIconClose v-else size="sm" />
                  <span>{{ t('checkout.confirmationPage.passwordValidation.number') }}</span>
                </div>
                <div class="flex items-center gap-1" :class="{ 'text-green-600': passwordValidationOneLetter }">
                  <SfIconCheck v-if="passwordValidationOneLetter" size="sm" />
                  <SfIconClose v-else size="sm" />
                  <span>{{ t('checkout.confirmationPage.passwordValidation.letter') }}</span>
                </div>
              </div>

              <NuxtTurnstile
                v-if="turnstileSiteKey.length > 0 && turnstileLoad"
                v-bind="turnstileAttributes"
                ref="turnstileElement"
                v-model="turnstile"
                :site-key="turnstileSiteKey"
                :options="{ theme: 'light' }"
                class="mt-4 flex justify-center"
              />
              <ErrorMessage as="div" name="register.turnstile" class="text-negative-700 text-center text-sm" />
            </form>
          </div>
        </div>

        <!-- Bestellübersicht -->
        <div class="rounded-[10px] bg-gray-light p-5 w-full my-5 text-base">
          <h3 class="mb-5">{{ t('checkout.confirmationPage.order.orderSummary') }}</h3>

          <!-- Order Details -->
          <div class="grid grid-cols-2 gap-4 mb-2">
            <p class="font-medium text-base">
              <span v-if="!orderGetters.isReturn(order)">{{
                t('checkout.confirmationPage.orderDetails.orderId')
              }}</span>
              <span v-else>
                {{ t('returns.returnNumber') }}
              </span>
            </p>
            <p>{{ orderGetters.getId(order) }}</p>
          </div>
          <div v-if="orderGetters.isReturn(order)" class="grid grid-cols-2 gap-4 mb-2">
            <p class="font-medium text-base">{{ t('account.ordersAndReturns.orderNumber') }}</p>
            <p>{{ orderGetters.getOrderReferenceOriginId(order) }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4 mb-2">
            <p class="font-medium text-base">
              <span v-if="!orderGetters.isReturn(order)">
                {{ t('account.ordersAndReturns.orderDate') }}
              </span>
              <span v-else>
                {{ t('account.ordersAndReturns.returnDate') }}
              </span>
            </p>
            <p>{{ orderDateOnly }}</p>
          </div>

          <div class="mt-4">
            <UiDivider class="mt-2 mb-2" />
            <!-- Shipping Summary -->
            <div class="grid grid-cols-2 gap-4 mb-2">
              <p class="font-medium text-base">{{ t('account.ordersAndReturns.shippingSummary.shipTo') }}</p>
              <div>
                <OrderAddressData v-if="shippingAddress" :address="shippingAddress" />
              </div>
            </div>

            <!-- Order Tracking -->
            <div v-if="trackingUrl" class="grid grid-cols-2 gap-4 mb-2 mt-4">
              <p class="font-medium text-base">{{ t('orderConfirmation.trackingOrder') }}</p>
              <div class="space-y-1">
                <div v-for="(number, index) in trackingNumbers" :key="index">
                  <UiLink :href="trackingUrl" target="_blank" class="hover:cursor-pointer">
                    {{ number }}
                  </UiLink>
                </div>
              </div>
            </div>

            <div v-if="preferredDeliveryServices" class="grid grid-cols-2 gap-4 mb-2 mt-4">
              <p class="font-medium text-base">
                {{ t('PreferredDelivery.general.assistantName') }}
              </p>
              <ul class="space-y-1">
                <li v-for="(serviceValue, serviceName, index) in preferredDeliveryServices" :key="index">
                  {{ `${serviceName}: ${serviceValue}` }}
                </li>
              </ul>
            </div>

            <div v-if="orderContactWish" class="grid grid-cols-2 gap-4 mb-2 mt-4">
              <p class="font-medium text-base">{{ t('checkout.fields.customerWish') }}</p>
              <p>{{ orderContactWish }}</p>
            </div>

            <div v-if="orderCustomerSign" class="grid grid-cols-2 gap-4 mb-2 mt-4">
              <p class="font-medium text-base">{{ t('checkout.fields.customerReference') }}</p>
              <p>{{ orderCustomerSign }}</p>
            </div>
            <UiDivider class="mt-2 mb-2" />

            <!-- Payment Summary -->
            <div class="grid grid-cols-2 gap-4 mb-2">
              <p class="font-medium text-base">{{ t('billing.heading') }}</p>
              <div>
                <p v-if="sameAsShippingAddress">{{ t('orderConfirmation.sameAsShippingAddress') }}</p>
                <OrderAddressData v-if="billingAddress && !sameAsShippingAddress" :address="billingAddress" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <p class="font-medium text-base">{{ t('checkout.payment.heading') }}</p>
              <p>{{ orderGetters.getPaymentMethodName(order) }}</p>
            </div>

            <div v-if="showPaymentButton" class="mt-4">
              <PayPalExpressButton
                v-if="paymentKey === 'PAYPAL'"
                type="OrderAlreadyExisting"
                :currency="currency"
                :plenty-order-id="Number(orderGetters.getId(order))"
                @on-payed="refetchOrder()"
              />
            </div>

            <OrderBankDetails v-if="bankDetails" :bank-details="bankDetails" />
            <PayPalInvoiceDetails :order="order" />
          </div>
        </div>
      </div>

      <!-- RECHTE SPALTE -->
      <div class="flex-1">
        <!-- Artikel -->
        <div v-if="order?.order" id="order-items" class="flex flex-col my-4">
          <h3 class="font-semibold mb-4">{{ t('checkout.confirmationPage.orderDetails.yourItems') }}</h3>
          <div v-for="(item, index) in orderGetters.getItems(order)" :key="item.id">
            <OrderSummaryProductCard
              v-if="!orderGetters.isBundleItem(item) && !orderGetters.isCouponItem(item)"
              :order="order"
              :order-item="item"
              :index="index"
              :class="{ 'border-t': index === 0 }"
            />
          </div>
        </div>

        <!-- Zwischensumme -->
        <div class="rounded-[10px] bg-gray-light p-5 w-full my-5 text-base">
          <h4>{{ t('checkout.confirmationPage.orderConfirmation.summary') }}</h4>
          <div v-for="(additionalCost, index) in additionalCostsWithoutTax" :key="index" class="grid grid-cols-2">
            <p class="text-base">{{ orderGetters.getOrderItemOrderPropertyName(additionalCost) }}:</p>
            <p class="text-right">
              <span>{{ currency }}</span>
              <span>{{
                showNetPrices
                  ? formatPrice(orderGetters.getOrderItemOrderPropertyNetSurcharge(additionalCost))
                  : formatPrice(orderGetters.getOrderItemOrderPropertySurcharge(additionalCost))
              }}</span>
            </p>
          </div>
          <UiDivider v-if="additionalCostsWithoutTax.length > 0" class="mt-2 mb-2" />
          <div class="grid grid-cols-2">
            <p class="font-medium text-base">{{ t('checkout.confirmationPage.orderConfirmation.itemValue') }}</p>
            <p v-if="showNetPrices" class="text-right">
              <span>{{ currency }}</span> <span>{{ formatPrice(order.totals.itemSumNet) }}</span>
            </p>
            <p v-else class="text-right">
              <span>{{ currency }}</span> <span>{{ formatPrice(orderGetters.getSubTotal(order.totals)) }}</span>
            </p>
          </div>
          <div class="grid grid-cols-2 mt-2">
            <p class="font-medium text-base">{{ t('orderConfirmation.shipping') }}:</p>
            <p v-if="showNetPrices" class="text-right">
              <template v-if="orderGetters.getOriginalShippingCostNet(order) === 0">
                {{ t('shipping.method.free') }}
              </template>
              <template v-else>
                <span>{{ currency }}</span>
                <span>{{ formatPrice(orderGetters.getOriginalShippingCostNet(order)) }}</span>
              </template>
            </p>
            <p v-else class="text-right">
              <template v-if="orderGetters.getOriginalShippingCost(order) === 0">
                {{ t('shipping.method.free') }}
              </template>
              <template v-else>
                <span>{{ currency }}</span> <span>{{ formatPrice(orderGetters.getOriginalShippingCost(order)) }}</span>
              </template>
            </p>
          </div>
          <div v-if="orderGetters.getCouponValue(order.totals) < 0" class="grid grid-cols-2 mt-2">
            <p class="font-medium text-base">{{ t('coupon.name') }}:</p>
            <p class="text-right">
              <span>{{ currency }}</span>
              <span>{{ formatPrice(orderGetters.getCouponValue(order.totals)) }}</span>
            </p>
          </div>
          <UiDivider class="mt-2 mb-2" />
          <div
            v-for="(vat, index) in orderGetters.getOriginalOrderVats(order)"
            :key="index"
            class="grid grid-cols-2 mt-2"
          >
            <p class="font-medium text-base">
              {{ t('orderConfirmation.vat') }} ({{ orderGetters.getOrderVatRate(vat) }}%):
            </p>
            <p class="text-right">
              <span>{{ currency }}</span> <span>{{ formatPrice(orderGetters.getOrderVatValue(vat)) }}</span>
            </p>
          </div>
          <UiDivider v-if="additionalCostsWithTax.length > 0" class="mt-2 mb-2" />
          <div v-for="(additionalCost, index) in additionalCostsWithTax" :key="index" class="grid grid-cols-2">
            <p class="text-base">{{ orderGetters.getOrderItemOrderPropertyName(additionalCost) }}:</p>
            <p class="text-right">
              <span>{{ currency }}</span>
              <span>{{
                showNetPrices
                  ? formatPrice(orderGetters.getOrderItemOrderPropertyNetSurcharge(additionalCost))
                  : formatPrice(orderGetters.getOrderItemOrderPropertySurcharge(additionalCost))
              }}</span>
            </p>
          </div>
          <UiDivider class="mt-2 mb-2" />
          <div class="grid grid-cols-2">
            <p class="h4 !font-normal" :class="{ 'font-bold text-xl': isOrderTypeOffer }">
              {{ t('checkout.confirmationPage.orderConfirmation.totalAmount') }}
            </p>
            <p class="text-right" :class="{ 'font-bold text-xl': isOrderTypeOffer }">
              <span class="mr-2">{{ currency }}</span>
              <span class="h4 !font-normal">{{
                showNetPrices
                  ? formatPrice(orderGetters.getTotalNet(originalTotals))
                  : formatPrice(orderGetters.getTotal(originalTotals))
              }}</span>
            </p>
          </div>

          <NuxtLink
            :to="localePath('/')"
            class="py-4 px-6 bg-black text-white hover:bg-[#928e9a] rounded-[40px] mt-6 w-full text-center block"
          >
            <span class="text-base font-semibold">{{ t('checkout.backToHome') }}</span>
          </NuxtLink>
        </div>

        <!-- Sovendus Container -->
        <div id="sovendus-container-1" class="w-full my-5"></div>

        <!-- Optional: OrderDocumentsList, OrderReturnItems, OrderAgainButton (falls gewünscht) -->
        <!-- Order Documents List (nur in MyAccount) -->
        <div
          v-if="contextReady && isAccountContext && documents && documents.length > 0"
          data-testid="documents-list"
          class="documents-list"
        >
          <button
            v-for="(document, key) in documents"
            :key="key"
            :disabled="loadingDocument"
            class="mt-4 w-full px-4 py-2 gap-2 text-red border border-[#e20013] hover:bg-red hover:text-white rounded-md text-center cursor-pointer"
            @click="downloadPDF(document, orderGetters.getAccessKey(order), key)"
          >
            <SfLoaderCircular v-if="downloadingDocument === key" class="mr-2" />
            <span class="text-base font-semibold">{{ getDocumentName(document) }}</span>
          </button>
        </div>

        <OrderReturnItems
          v-if="orderGetters.isReturnable(order) && orderGetters.hasReturnableItems(order)"
          :order="order"
        />

        <!-- Order Again Button (nur in MyAccount) -->
        <button
          v-if="contextReady && isAccountContext && isAuthorized"
          class="mt-4 w-full px-4 py-2 gap-2 text-red border border-[#e20013] hover:bg-red hover:text-white rounded-md text-center cursor-pointer"
          @click="openOrderAgainModal(order)"
        >
          <span class="text-base font-semibold">{{ t('account.ordersAndReturns.orderAgain.heading') }}</span>
        </button>
        <OrderAgain v-if="selectedOrder" :order="selectedOrder" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  orderGetters,
  orderDocumentGetters,
  userGetters,
  offerGetters,
  orderConfirmationGetters,
} from '@plentymarkets/shop-api';
import {
  SfLink,
  SfInput,
  SfLoaderCircular,
  SfCheckbox,
  SfIconPerson,
  SfIconLocalShipping,
  SfIconFavorite,
  SfIconSchedule,
  SfIconCheck,
  SfIconClose,
  SfIconViewList,
  SfIconLocationOn,
} from '@storefront-ui/vue';
import { useForm, ErrorMessage } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/yup';
import { object, string, boolean } from 'yup';
import type { ConfirmationPageContentProps } from './types';
import { paths } from '~/utils/paths';
import { useMigrateGuestOrder } from '~/composables/useMigrateGuestOrder';

const NuxtLink = resolveComponent('NuxtLink');
const { order, context } = defineProps<ConfirmationPageContentProps>();
const route = useRoute();
const router = useRouter();

// Context helpers - automatisch erkennen anhand der Route-History
const isCheckoutContext = ref(false);
const isAccountContext = computed(() => !isCheckoutContext.value);
const contextReady = ref(false);

// Kontext-Erkennung nach Router-Init
onMounted(() => {
  if (context) {
    isCheckoutContext.value = context === 'checkout';
    contextReady.value = true;
    return;
  }

  // Prüfe ob User von /checkout oder /my-account kam
  const from = router.options.history.state.back as string | null;

  if (from) {
    // Wenn von my-account kam = Account-Kontext
    if (from.includes('/my-account')) {
      isCheckoutContext.value = false;
    }
    // Wenn von checkout kam = Checkout-Kontext
    else if (from.includes('/checkout')) {
      isCheckoutContext.value = true;
    }
    // Default: Checkout-Kontext (frische Bestellung)
    else {
      isCheckoutContext.value = true;
    }
  } else {
    // Kein Referrer = frische Bestellung
    isCheckoutContext.value = true;
  }

  contextReady.value = true;
});
const { register, loading: registerLoading, isAuthorized } = useCustomer();
const { send } = useNotification();
const { migrateGuestOrder, loading: migrateLoading } = useMigrateGuestOrder();
const viewport = useViewport();
const { getActiveShippingCountries } = useActiveShippingCountries();
const localePath = useLocalePath();
const { getSetting } = useSiteSettings('cloudflareTurnstileApiSiteKey');
const runtimeConfig = useRuntimeConfig();
const { locale } = useI18n();
const { fetchOrderClient } = useCustomerOrder('soft-login');
const { openOrderAgainModal, order: selectedOrder } = useOrderAgain();

const bankDetails = orderGetters.getOrderPaymentBankDetails(order);
useProcessingOrder().processingOrder.value = false;

// Order details variables
const shippingAddress = orderGetters.getShippingAddress(order);
const billingAddress = orderGetters.getBillingAddress(order);
const shippingMethod = orderGetters.getShippingProvider(order);
const preferredDeliveryServices = orderGetters.getPreferredDeliveryServices(order);
const orderContactWish = orderGetters.getOrderContactWish(order);
const orderCustomerSign = orderGetters.getOrderCustomerSign(order);
const sameAsShippingAddress = shippingAddress && billingAddress && shippingAddress.id === billingAddress.id;

// Order Tracking
const trackingNumbers = computed(() => orderGetters.getOrderTrackingNumbers(order));
const trackingUrl = computed(() => orderGetters.getOrderTrackingUrl(order));

// Order Date (nur Datum, ohne Uhrzeit)
const orderDateOnly = computed(() => {
  const createdAt = order?.order?.createdAt;
  if (!createdAt) return '';

  const date = new Date(createdAt);
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
});
const isUnpaid = computed(() => !orderConfirmationGetters.isOrderPaid(order));
const validOrderPaymentStatus = computed(() => orderConfirmationGetters.orderStatusValidForPayment(order));
const showPaymentButton = computed(() => isUnpaid.value && validOrderPaymentStatus.value);
const paymentKey = order.paymentMethodKey;

const refetchOrder = async () => {
  const shippingAddress = orderGetters.getShippingAddress(order);
  await fetchOrderClient({
    orderId: orderGetters.getId(order),
    accessKey: orderGetters.getAccessKey(order),
    postcode: shippingAddress?.postalCode,
    name: shippingAddress?.name3 || shippingAddress?.name1 || undefined,
  });
};

// Order Documents List
const documents = computed(() => orderGetters.getDocuments(order));
const { data: documentData, getDocument, downloadFile, loading: loadingDocument } = useOrderDocument();
const downloadingDocument = ref<number | null>(null);

const documentTranslations = {
  correction_document: t('documents.correctionDocuments'),
  credit_note: t('documents.Credit Note'),
  delivery_note: t('documents.Delivery Note'),
  dunning_letter: t('documents.Dunning Letter'),
  invoice_external: t('documents.Invoice External'),
  invoice: t('documents.Invoice'),
  offer: t('documents.Offer'),
  order_confirmation: t('documents.Order Confirmation'),
  pickup_delivery: t('documents.Pickup Delivery'),
  pro_forma_invoice: t('documents.Pro Forma Invoice'),
  receipt: t('documents.Receipt'),
  return_note: t('documents.Return Note'),
  success_confirmation: t('documents.Success Confirmation'),
  reversal_document: t('documents.Reversal Document'),
};

const getTypeName = (type: string) => {
  return documentTranslations[type as keyof typeof documentTranslations];
};

const getDocumentName = (document: any) => {
  return getTypeName(orderDocumentGetters.getType(document)) || orderDocumentGetters.getNumberWithPrefix(document);
};

const downloadPDF = async (document: any, accessKey: string, key: number) => {
  downloadingDocument.value = key;
  try {
    await getDocument(document, accessKey);
    const name = document.path.split('/').join('_');

    downloadFile(documentData.value, name, 'application/pdf');
  } catch {
    send({
      type: 'negative',
      message: t('documents.downloadFailed'),
    });
  } finally {
    downloadingDocument.value = null;
  }
};

// Order totals variables
const { formatWithSymbol } = usePriceFormatter();
const originalTotals = orderGetters.getTotals(order);
const currency = orderGetters.getCurrency(order);
const showNetPrices = originalTotals.isNet;
const isOrderTypeOffer = offerGetters.isTypeOffer(order);
const additionalCostsWithoutTax = orderGetters.getAdditionalCostsWithTax(order);
const additionalCostsWithTax = orderGetters.getAdditionalCostsWithoutTax(order);

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('de-CH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const getShippingAmount = (amount: number) => {
  return amount === 0 ? t('shipping.method.free') : formatWithSymbol(Number(amount), currency);
};

// Register form variables
const turnstileSiteKey = getSetting() ?? '';
const passwordMinLength = runtimeConfig.public.passwordMinLength;
const passwordMaxLength = runtimeConfig.public.passwordMaxLength;

const turnstileElement = ref();
const turnstileLoad = ref(false);

const validationSchema = toTypedSchema(
  object({
    register: object({
      email: string().trim().default(''),
      password: string()
        .required(t('error.password.required'))
        .transform((value) => (value ? value.replace(/\s/g, '') : value))
        .min(passwordMinLength, t('error.password.minLength', { min: passwordMinLength }))
        .max(passwordMaxLength, t('error.password.maxLength', { max: passwordMaxLength }))
        .matches(/^(?=.*[A-Za-z])(?=.*\d)/, t('error.password.valid'))
        .default(''),
      turnstile:
        turnstileSiteKey.length > 0
          ? string().required(t('error.turnstileRequired')).default('')
          : string().optional().default(''),
    }),
  }),
);

const { errors, meta, defineField, handleSubmit } = useForm({ validationSchema: validationSchema });
const [email, emailAttributes] = defineField('register.email');
const [password, passwordAttributes] = defineField('register.password');
const [turnstile, turnstileAttributes] = defineField('register.turnstile');

// Set email from order
email.value = orderGetters.getOrderEmail(order);

const stripSpaces = (fieldName: 'password') => {
  const currentValue = password.value;

  if (currentValue && typeof currentValue === 'string') {
    password.value = currentValue.replace(/\s/g, '');
  }
};

const clearTurnstile = () => {
  turnstile.value = '';
  turnstileElement.value?.reset();
};

const registerUser = async () => {
  if (!meta.value.valid || (!turnstile.value && turnstileSiteKey.length > 0) || isAuthorized.value) {
    return;
  }

  const response = await register({
    'cf-turnstile-response': turnstile.value,
    contact: {
      password: password.value ?? '',
      typeId: 1,
      referrerId: 1,
      options: {
        typeId: {
          value: email.value ?? '',
          subTypeId: 4,
          priority: 0,
          typeId: 2,
        },
      },
    },
  });

  if (response?.data.code === 1) {
    send({ message: t('authentication.signup.emailAlreadyExists'), type: 'negative' });
    clearTurnstile();
    return;
  }

  if (response?.data.id) {
    send({ message: t('authentication.signup.success'), type: 'positive' });

    if (order) {
      await migrateGuestOrder({
        orderId: order?.order.id ?? -1,
        accessKey: order?.order.accessKey ?? '',
        postcode: order?.order.deliveryAddress.postalCode ?? undefined,
        name: order?.order.deliveryAddress.name3 ?? undefined,
      });
    }

    clearTurnstile();
  }
  clearTurnstile();
};

const onSubmit = handleSubmit(() => registerUser());

const passwordValidationLength = computed(() => {
  const val = password?.value || '';
  return val.length >= passwordMinLength && val.length <= passwordMaxLength;
});

const passwordValidationOneDigit = computed(() => /\d/.test(password?.value || ''));
const passwordValidationOneLetter = computed(() => /[A-Za-z]/.test(password?.value || ''));

if (turnstileSiteKey.length > 0) {
  const turnstileWatcher = watch([password], (data) => {
    if (data.some((field) => field && field.length > 0)) {
      turnstileLoad.value = true;
      turnstileWatcher();
    }
  });
}

// Konfetti Animation - Generiere zufällige Konfetti-Eigenschaften
const confettiColors = ['#d13447', '#ffbf00', '#263672'];
const confettiItems = computed(() => {
  return Array.from({ length: 150 }, (_, i) => {
    const w = Math.floor(Math.random() * 8) + 1;
    const startLeft = Math.floor(Math.random() * 100);
    const endLeft = startLeft + Math.floor(Math.random() * 15);
    const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    const duration = 4 + Math.random();
    const delay = Math.random();
    const opacity = Math.random() * 0.5 + 0.5;
    const rotation = Math.random() * 360;

    return {
      style: {
        position: 'absolute' as const,
        pointerEvents: 'none' as const,
        width: `${w}px`,
        height: `${w * 0.4}px`,
        backgroundColor: color,
        top: '-10%',
        left: `${startLeft}%`,
        opacity,
        transform: `rotate(${rotation}deg)`,
        animation: `confetti-drop ${duration}s ${delay}s 1 ease-in forwards`,
        '--end-left': `${endLeft}%`,
      } as any,
    };
  });
});

await getActiveShippingCountries();
</script>

<style>
.confetti {
  position: absolute;
  pointer-events: none;
  z-index: 1;
}

@keyframes confetti-drop {
  0% {
    top: -10%;
  }
  100% {
    top: 110%;
    left: var(--end-left);
  }
}
</style>
