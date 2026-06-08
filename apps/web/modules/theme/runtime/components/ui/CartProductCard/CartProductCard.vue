<template>
  <div
    class="relative flex border-gray border-b last:mb-0"
    :class="context === 'cart' || context === 'checkout' ? 'py-4' : 'p-4'"
    data-testid="cart-product-card"
  >
    <div class="relative overflow-hidden rounded-md w-[100px] sm:w-[100px]">
      <UiLink :tag="NuxtLink" :to="path" class="flex items-center justify-center" data-testid="cart-product-card-link">
        <NuxtImg
          v-if="cartItem.variation?.images?.all?.length"
          ref="img"
          :src="addModernImageExtension(cartItemImage) || '/_nuxt-plenty/images/placeholder.png'"
          :alt="imageAlt"
          :title="
            productImageGetters.getImageName(productImageGetters.getFirstImage(cartItem.variation ?? ({} as Product)))
              ? productImageGetters.getImageName(
                  productImageGetters.getFirstImage(cartItem.variation ?? ({} as Product)),
                )
              : null
          "
          width="300"
          height="300"
          loading="lazy"
          class="w-full h-auto border rounded-[10px] border-gray"
        />
        <SfLoaderCircular v-if="!imageLoaded" class="absolute" size="sm" />
      </UiLink>

      <!-- SALE Badge oben links -->
      <div v-if="hasProperty39 && context !== 'drawer'" class="absolute top-2 left-2 z-10">
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
    <div class="flex flex-col pl-4 min-w-[180px] flex-1 justify-between">
      <UiLink
        :tag="NuxtLink"
        :to="path"
        variant="secondary"
        class="w-fit no-underline text-base font-semibold line-clamp-1"
        :class="{ 'max-w-[80%] md:max-w-[250px]': context === 'drawer' }"
      >
        {{ cartGetters.getItemName(cartItem) }}
      </UiLink>

      <div class="hidden" v-if="!cartItem.variation?.bundleComponents" data-testid="cart-item-price">
        {{ format(cartGetters.getCartItemPrice(cartItem)) }}
      </div>

      <UiBadges
        v-if="cartItem.variation"
        :product="cartItem.variation"
        :use-availability="true"
        :show-availability-text="true"
      />

      <div v-if="!cartItem.variation?.bundleComponents && showBundleComponents">
        <div v-if="cartItem.variation" class="">
          <BasePrice
            v-if="productGetters.showPricePerUnit(cartItem.variation)"
            :base-price="basePriceSingleValue"
            :unit-content="productGetters.getUnitContent(cartItem.variation)"
            :unit-name="productGetters.getUnitName(cartItem.variation)"
          />
        </div>
      </div>
      <div
        v-if="cartItem.variation?.bundleComponents && showBundleComponents"
        data-testid="cart-product-card-bundle-components-list"
      >
        <div v-for="(item, index) in cartItem.variation.bundleComponents" :key="index">
          <UiLink
            v-if="productBundleGetters.isItemBundleSalable(item)"
            :tag="NuxtLink"
            :to="localePath(productBundleGetters.getBundleItemUrl(item))"
            variant="secondary"
            class="no-underline typography-text-sm"
          >
            <p>
              {{ productBundleGetters.getBundleItemQuantity(item) }}x
              <span class="underline px-1 h-">{{ productBundleGetters.getBundleItemName(item) }}</span>
            </p>
          </UiLink>
          <p v-else class="text-sm">
            {{ productBundleGetters.getBundleItemQuantity(item) }}x
            <span class="px-1 h-">{{ productBundleGetters.getBundleItemName(item) }}</span>
          </p>
        </div>
      </div>

      <div class="flex flex-row items-end">
        <span v-if="currentFullPrice" data-testid="product-full-price" class="order-1 ml-auto">
          <span class="text-black text-base font-semibold">{{ formattedPrice.currency }}</span>
          <span class="text-red font-semibold ml-1 text-[22px]">{{ formattedPrice.amount }}</span>
        </span>

        <UiQuantitySelector
          ref="quantitySelectorReference"
          :disabled="disabled"
          :value="itemQuantitySelector"
          :min-value="productGetters.getMinimumOrderQuantity(cartItem.variation || ({} as Product))"
          :max-value="maximumOrderQuantity"
          class="mt-0 quantity-selector"
          @change-quantity="debounceQuantity"
        />
      </div>
    </div>

    <div v-if="deleteLoading" class="absolute top-1 right-1 p-2 text-black">
      <SfLoaderCircular aria-label="loading" />
    </div>

    <button
      v-else-if="!disabled"
      type="button"
      data-testid="remove-item-from-basket"
      :aria-label="t('common.actions.removeItemFromBasket')"
      class="absolute top-1 right-1 p-2 text-black"
      @click="deleteItem"
    >
      <SfIconClose size="sm" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { productGetters, productBundleGetters, cartGetters, productImageGetters } from '@plentymarkets/shop-api';
import { SfLoaderCircular, SfIconClose } from '@storefront-ui/vue';
import type { CartProductCardProps } from './types';
import type { Product } from '@plentymarkets/shop-api';
import { debounce } from '~/utils/debounce';
import { useGonserBoxProperty } from '../../../composables/useGonserBoxProperty/useGonserBoxProperty';

const { cartItem, disabled = false, context = 'cart' } = defineProps<CartProductCardProps>();
const emit = defineEmits(['load']);

const { addModernImageExtension, getImageForViewport } = useModernImage();
const { data: cartData, setCartItemQuantity, deleteCartItem } = useCart();
const { send } = useNotification();
const { format } = usePriceFormatter();
const localePath = useLocalePath();
const { hasGonserBoxProperty } = useGonserBoxProperty();

// Check if cart item is a Box article (Property ID 4 with value '1')
const isBoxArticle = computed(() => {
  if (!cartItem.variation) return false;
  return hasGonserBoxProperty(cartItem.variation);
});

// Check if cart item has Property 39 (SALE)
type VariationPropertyValue = {
  value?: string | null;
};

type VariationProperty = {
  id?: number | string;
  values?: VariationPropertyValue;
};

type VariationPropertyGroup = {
  properties?: VariationProperty[];
};

type ProductWithVariationProperties = Product & {
  variationProperties?: VariationPropertyGroup[];
};

function hasProperty39Variant(product: Product): boolean {
  const groups = (product as ProductWithVariationProperties).variationProperties;
  if (!Array.isArray(groups)) return false;

  for (const group of groups) {
    const properties = group?.properties;
    if (!Array.isArray(properties)) continue;
    for (const property of properties) {
      if (Number(property?.id ?? 0) === 39) {
        return true;
      }
    }
  }
  return false;
}

const hasProperty39 = computed(() => {
  if (!cartItem.variation) return false;
  return hasProperty39Variant(cartItem.variation);
});

const imageLoaded = ref(false);
const img = ref();
const deleteLoading = ref(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const quantitySelectorReference = ref(null as any);
const itemQuantitySelector = ref(cartGetters.getItemQty(cartItem));
const itemQuantity = computed(() => cartGetters.getItemQty(cartItem));
const maximumOrderQuantity = ref();
const { getSetting } = useSiteSettings('dontSplitItemBundle');
const showBundleComponents = computed(() => {
  return getSetting() !== '1';
});

onMounted(() => {
  const imgElement = (img.value?.$el as HTMLImageElement) || null;

  if (imgElement) {
    if (!imageLoaded.value) {
      if (imgElement.complete) imageLoaded.value = true;
      imgElement.addEventListener('load', () => (imageLoaded.value = true));
    }

    nextTick(() => {
      if (!imgElement.complete) emit('load');
    });
  } else {
    imageLoaded.value = true;
  }
});

const handleMaximumQuantityCheck = async (quantityCast: number) => {
  if (!cartData.value?.itemQuantity || quantityCast <= cartData.value.itemQuantity) {
    maximumOrderQuantity.value = undefined;
    return;
  }

  maximumOrderQuantity.value = cartData.value.itemQuantity;

  if (quantitySelectorReference.value) {
    const event = new Event('input');
    Object.defineProperty(event, 'target', {
      value: { value: maximumOrderQuantity.value },
      writable: true,
    });
    quantitySelectorReference.value.handleOnChange(event);
  }

  await setCartItemQuantity({
    quantity: maximumOrderQuantity.value,
    cartItemId: cartItem.id,
    productId: cartItem.variationId,
  });
};

const changeQuantity = async (quantity: string) => {
  const quantityCast = Number(quantity);
  if (Number.isNaN(quantityCast) || quantityCast === cartData.value.itemQuantity) return;

  await setCartItemQuantity({
    quantity: quantityCast,
    cartItemId: cartItem.id,
    productId: cartItem.variationId,
  }).then(async () => await handleMaximumQuantityCheck(quantityCast));
};

const deleteItem = async () => {
  deleteLoading.value = true;
  await deleteCartItem(cartItem);
  send({ message: t('cart.itemRemoved'), type: 'positive' });
  deleteLoading.value = false;
};

const currentFullPrice = computed(() => {
  return cartGetters.getCartItemPrice(cartItem) * cartGetters.getItemQty(cartItem);
});

// Formatierter Preis aufgeteilt in Währung und Betrag
const formattedPrice = computed(() => {
  const fullPrice = format(currentFullPrice.value || 0);
  if (!fullPrice) {
    return { currency: 'CHF', amount: '0.00' };
  }
  // "16,90 CHF" oder "CHF 16,90" → { currency: "CHF", amount: "16.90" }
  const parts = fullPrice.split(' ');

  // Prüfen, ob erste oder letzte Position die Währung ist
  const currencyIndex = parts.findIndex((p) => p === 'CHF' || p === 'EUR' || p === 'USD');
  const currency = currencyIndex !== -1 ? parts[currencyIndex] : 'CHF';
  const amount = (parts.filter((_, i) => i !== currencyIndex).join(' ') || '0.00').replace(',', '.');

  return { currency, amount };
});

const cartItemImage = computed(() => {
  if (cartItem && cartItem.variation) {
    return getImageForViewport(cartItem.variation, 'CartProductCard');
  }
  return '';
});

const debounceQuantity = debounce(changeQuantity, 500);

const NuxtLink = resolveComponent('NuxtLink');

const basePriceSingleValue = computed(
  () =>
    productGetters.getGraduatedPriceByQuantity(cartItem.variation ?? ({} as Product), cartItem.quantity)?.basePrice ??
    productGetters.getDefaultBasePrice(cartItem.variation ?? ({} as Product)),
);

const path = computed(() => {
  return localePath('/' + cartGetters.getProductPath(cartItem, useCallisto().isEnabled));
});

const imageAlt = computed(() => {
  const image = cartItem?.variation?.images?.all[0];
  return image ? productImageGetters.getImageAlternate(image) : '';
});

watch(itemQuantity, async (newValue) => {
  if (quantitySelectorReference.value) {
    const event = new Event('input');
    Object.defineProperty(event, 'target', {
      value: { value: newValue },
      writable: true,
    });
    quantitySelectorReference.value.handleOnChange(event);
  }
});
</script>
<style>
.quantity-selector input {
  height: 36px;
  margin: 0;
  width: 24px;
}
.quantity-selector button {
  /* padding: 0.25rem 0.25rem; */
  font-size: 14px;
  color: #12120d;
}
.quantity-selector button svg {
  color: #12120d;
  width: 16px;
  height: 16px;
}
</style>
