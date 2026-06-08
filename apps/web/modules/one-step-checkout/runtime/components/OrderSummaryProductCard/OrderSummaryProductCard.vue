<template>
  <div class="relative flex border-gray border-b last:mb-0 py-4" data-testid="order-summary-product-card">
    <!-- Produktbild -->
    <div class="relative overflow-hidden rounded-md w-[100px] @sm:w-[100px]">
      <UiLink :tag="NuxtLink" :to="path" class="flex items-center justify-center">
        <NuxtImg
          :src="addModernImageExtension(orderItemImage) || '/_nuxt-plenty/images/placeholder.png'"
          :alt="imageAlt"
          :title="
            productImageGetters.getImageName(orderGetters.getOrderVariationFirstImage(order, orderItem))
              ? productImageGetters.getImageName(orderGetters.getOrderVariationFirstImage(order, orderItem))
              : null
          "
          width="300"
          height="300"
          loading="lazy"
          class="w-full h-auto border rounded-[10px] border-gray"
        />
      </UiLink>

      <!-- SALE Badge oben links -->
      <div v-if="hasProperty39" class="absolute top-2 left-2 z-10">
        <span class="inline-block py-0.5 px-2.5 text-white text-sm bg-red rounded-[20px]">
          {{ t('theme.ProductPage.sale') }}
        </span>
      </div>

      <!-- GonserBox Icon -->
      <div v-if="isBoxArticle" class="absolute bottom-1 right-1 z-10">
        <img
          src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/Box-artikel.svg"
          alt="Box Artikel"
          class="w-5 h-5"
        />
      </div>
    </div>

    <!-- Produktinfo -->
    <div class="flex flex-col pl-4 min-w-[180px] flex-1 justify-between">
      <UiLink
        :tag="NuxtLink"
        :to="path"
        variant="secondary"
        class="w-fit no-underline text-base font-semibold line-clamp-1"
      >
        {{ orderGetters.getItemName(orderItem) }}
      </UiLink>

      <!-- Preis -->
      <div class="flex flex-row items-end">
        <span class="order-1 font-bold ml-auto mr-5">
          <span class="text-black text-base">{{ formattedPrice.currency }}</span>
          <span class="text-red ml-1 text-[22px]">{{ formattedPrice.amount }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { productImageGetters, orderGetters } from '@plentymarkets/shop-api';
import type { OrderSummaryProductCardProps } from './types';
import type { Product } from '@plentymarkets/shop-api';

const props = defineProps<OrderSummaryProductCardProps>();
const NuxtLink = resolveComponent('NuxtLink');
const localePath = useLocalePath();
const { formatWithSymbol } = usePriceFormatter();
const { addModernImageExtension } = useModernImage();
const { t } = useI18n();

// Extrahiere order und orderItem
const { order, orderItem } = toRefs(props);

// Currency für Formatierung
const currency = orderGetters.getCurrency(order.value);
const format = (value: number) => formatWithSymbol(value, currency);

// Path zum Produkt
const path = computed(() => localePath(orderGetters.getOrderVariationPath(order.value, orderItem.value) ?? '/#'));

// Produktbild
const orderItemImage = computed(() => orderGetters.getOrderVariationImage(order.value, orderItem.value));

const imageAlt = computed(
  () =>
    productImageGetters.getImageName(orderGetters.getOrderVariationFirstImage(order.value, orderItem.value)) ||
    orderGetters.getItemName(orderItem.value),
);

// Preis formatiert
const currentFullPrice = computed(() => orderGetters.getItemPrice(orderItem.value));

const formattedPrice = computed(() => {
  const priceString = format(currentFullPrice.value);
  if (!priceString) {
    return {
      currency: '',
      amount: '',
    };
  }

  // Versuche verschiedene Formate zu parsen:
  // "CHF 49.80" oder "CHF49.80" oder "49.80 CHF"
  const match1 = priceString.match(/^([A-Z]{3})\s*(.+)$/); // CHF 49.80 oder CHF49.80
  const match2 = priceString.match(/^(.+)\s+([A-Z]{3})$/); // 49.80 CHF

  if (match1 && match1[1] && match1[2]) {
    return {
      currency: match1[1],
      amount: match1[2].trim().replace(',', '.'),
    };
  }
  if (match2 && match2[1] && match2[2]) {
    return {
      currency: match2[2],
      amount: match2[1].trim().replace(',', '.'),
    };
  }

  // Fallback: kein Match
  return {
    currency: '',
    amount: priceString.replace(',', '.'),
  };
});

// SALE Badge (Property 39) - prüfe über orderItem.orderItemReferences
const hasProperty39 = computed(() => {
  // Bei Order Items gibt es keine direkte variation - würde Daten aus order.orderItems.orderItemReferences brauchen
  // Für jetzt: false (kann später erweitert werden wenn benötigt)
  return false;
});

// GonserBox Check - prüfe variationProperties für Property ID 4
const isBoxArticle = computed(() => {
  try {
    const item = orderItem.value as any;

    // Prüfe variationProperties - Property Groups wie im Produkt
    if (item.variationProperties && Array.isArray(item.variationProperties)) {
      // Flatten: Property Groups mit properties array oder direkte Properties
      const allProperties = item.variationProperties.flatMap((group: any) => {
        if (group.properties && Array.isArray(group.properties)) {
          return group.properties;
        }
        return [group];
      });

      // Prüfe auf Property ID 4 mit value '1' (GonserBox)
      return allProperties.some((prop: any) => {
        const propId = Number(prop?.id || 0);
        const value = String(prop?.values?.value || '');
        return propId === 4 && value === '1';
      });
    }

    return false;
  } catch (error) {
    console.error('Error checking GonserBox property:', error);
    return false;
  }
});
</script>
