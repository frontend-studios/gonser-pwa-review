<template>
  <div
    class="product-card hover:shadow-lg flex flex-col h-full rounded-[20px] border border-gray"
    data-testid="product-card"
  >
    <div
      class="relative overflow-hidden after:content-[''] after:absolute after:bottom-0 after:left-[5%] after:w-[90%] after:h-px after:bg-gray pb-2"
    >
      <UiBadges
        :use-tags="useTagsOnCategoryPage"
        :class="['absolute', isFromWishlist ? 'mx-2' : 'm-2']"
        :product="product"
        :use-availability="isFromWishlist"
      />

      <!-- SALE Badge oben rechts -->
      <div v-if="hasProperty39" class="absolute top-2 left-2 z-10">
        <span class="inline-block py-0.5 px-2.5 text-white text-sm bg-red rounded-[20px]">
          {{ t('theme.ProductPage.sale') }}
        </span>
      </div>

      <div ref="imageContainerRef" :class="[{ 'size-48': isFromSlider }, 'relative']">
        <UiLink
          :tag="NuxtLink"
          rel="preload"
          :to="productPath"
          :aria-label="ariaLabelContent"
          class="relative group/image flex items-center justify-center"
          as="image"
          data-testid="product-card-link"
        >
          <div class="relative w-full aspect-square">
            <div v-if="!mainImageLoaded" class="absolute inset-0 bg-neutral-100 animate-pulse" aria-hidden="true" />

            <NuxtImg
              v-if="canLoadMainImage"
              ref="mainImageRef"
              :src="imageUrl"
              :alt="imageAlt"
              :title="imageTitle ? imageTitle : null"
              :loading="priority || lazy === false ? 'eager' : 'lazy'"
              :fetchpriority="priority ? 'high' : 'auto'"
              :preload="priority || false"
              :width="getWidth()"
              :height="getHeight()"
              :class="[
                'object-contain aspect-square w-full h-full transition-opacity duration-300 rounded-[20px]',
                mainImageLoaded ? 'opacity-100' : 'opacity-0',
                effectiveHoverImageUrl && hoverImageLoaded ? 'group-hover/image:opacity-0' : '',
              ]"
              data-testid="image-slot"
              @load="onMainImageLoad"
              @error="onMainImageError"
            />

            <NuxtImg
              v-if="canLoadHoverImage && effectiveHoverImageUrl"
              ref="hoverImageRef"
              :src="effectiveHoverImageUrl"
              :alt="imageAlt"
              :title="imageTitle ? imageTitle : null"
              :loading="lazy === false ? 'eager' : 'lazy'"
              fetchpriority="auto"
              :preload="false"
              :width="getWidth()"
              :height="getHeight()"
              :class="[
                'absolute inset-0 object-contain rounded-md w-full h-full opacity-0 transition-opacity duration-300',
                hoverImageLoaded ? 'group-hover/image:opacity-100' : '',
              ]"
              data-testid="hover-image-slot"
              @load="onHoverImageLoad"
              @error="onHoverImageError"
            />
          </div>
        </UiLink>
      </div>

      <!-- <div v-if="isBoxArticle" class="absolute bottom-2 right-2 z-10">
        <SfTooltip :label="t('theme.GonserBox.boxIconTooltip')">
          <img :src="t('theme.GonserBox.boxIconUrl')" :alt="t('theme.GonserBox.boxIconTooltip')" class="w-5 h-5" />
        </SfTooltip>
      </div> -->
      <UiEnergyLabel :product="product" position="bottom-right" :size="52" />
    </div>

    <div class="thumb-content p-3.5 typography-text-sm flex flex-col flex-auto items-start">
      <div class="w-full flex items-center justify-between pt-1 mb-2">
        <ClientOnly>
          <!-- <div v-if="ratingCount > 0" class="flex items-center gap-1">
            <SfRating size="xs" :half-increment="true" :value="rating ?? 0" :max="5" />
            <SfCounter size="xs">{{ ratingCount }}</SfCounter>
          </div>
          <div v-else></div> -->
          <div class="flex items-center gap-1">
            <SfRating size="xs" :half-increment="true" :value="rating ?? 0" :max="5" class="[&>*]:-mx-px" />
            <span class="inline-flex items-center before:content-['('] after:content-[')'] text-black text-xs">{{
              ratingCount
            }}</span>
          </div>
        </ClientOnly>
        <UiBadges :product="product" :use-tags="false" :use-availability="true" />
      </div>

      <UiLink
        :tag="NuxtLink"
        :to="productPath"
        class="no-underline line-clamp-2 md:min-h-12 font-semibold text-base sm:break-normal"
        variant="secondary"
        data-testid="productcard-name"
      >
        {{ name }}
      </UiLink>

      <div v-if="!hidePseudoVariants && shouldShowColorVariants" class="pseudo-variant-color mt-2.5">
        <div class="flex items-center justify-between gap-1">
          <SfTooltip
            v-for="colorVariant in displayedColorVariants"
            :key="colorVariant.itemId"
            :label="colorVariant.colorName"
            placement="top"
            class="z-[10]"
          >
            <button
              type="button"
              class="relative flex items-center justify-center overflow-visible transition-all w-[20px] h-[20px]"
              :class="{ 'opacity-50': colorVariant.disabled }"
              :disabled="colorVariant.disabled"
              @click.prevent="navigateToColorVariant(colorVariant)"
            >
              <!-- Color circle -->
              <div class="w-full h-full flex items-center justify-center">
                <!-- Bunt (Image) -->
                <img
                  v-if="colorVariant.colorType === 'image'"
                  :src="colorVariant.colorImageUrl"
                  :alt="colorVariant.label"
                  class="w-5 h-5 object-contain"
                  :class="{ grayscale: colorVariant.disabled }"
                />
                <!-- Transparent (nur Border) -->
                <div
                  v-else-if="colorVariant.colorType === 'transparent'"
                  class="w-5 h-5 rounded-full"
                  :style="{ border: `1px solid ${colorVariant.colorHex}` }"
                  :class="{ grayscale: colorVariant.disabled }"
                ></div>
                <!-- Solide Farben -->
                <div
                  v-else
                  class="w-5 h-5 rounded-full"
                  :style="{
                    backgroundColor: colorVariant.colorHex,
                    border: `1px solid ${colorVariant.colorHex === '#FFFFFF' ? '#151515' : colorVariant.colorHex}`,
                  }"
                  :class="{ grayscale: colorVariant.disabled }"
                ></div>
              </div>
            </button>
          </SfTooltip>
          <button
            v-if="remainingColorCount > 0"
            type="button"
            class="flex items-center justify-center text-sm text-black transition-all cursor-pointer"
            @click.prevent="navigateTo(productPath)"
          >
            +{{ remainingColorCount }}
          </button>
        </div>
      </div>

      <LowestPrice :product="product" />
      <div v-if="showBasePrice" class="mb-2">
        <BasePriceInLine :base-price="basePrice" :unit-content="unitContent" :unit-name="unitName" />
      </div>
      <div class="relative flex flex-col items-start mt-auto w-full">
        <span class="block font-bold typography-text-sm" data-testid="product-card-vertical-price">
          <span v-if="showFromText" class="mr-1">{{ t('account.ordersAndReturns.orderDetails.priceFrom') }}</span>
          <template v-if="Number(price) > 0">
            <span class="text-black pr-1 font-semibold">CHF</span>
            <span class="h4 text-red !text-[22px] font-semibold">{{ Number(price).toFixed(2) }}</span>
          </template>
        </span>
        <div
          class="flex items-center w-full"
          :class="{
            'justify-between': !addToCartCompact,
            'justify-start': addToCartCompact,
            'h-5': !showAddToCart,
          }"
        >
          <span class="text-gray-super-dark">
            <template v-if="!hideRecommendedRetailPrice && crossedPrice && differentPrices(price, crossedPrice)">
              {{ t('theme.ProductPage.insteadOfRRP') }} {{ Number(crossedPrice).toFixed(2) }}
            </template>
          </span>

          <!-- GonserBox Icon (in compact mode can be shown together with left-aligned CTA) -->
          <div v-if="isBoxArticle && (!showAddToCart || addToCartCompact)" class="absolute bottom-2 right-0">
            <img
              src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/Box-artikel.svg"
              alt="Box Artikel"
              class="w-5 h-5"
            />
          </div>

          <!-- Add to Cart Button (nur im QuickCheckout) -->
          <button
            v-if="showAddToCart && canAddFromCategory"
            type="button"
            class="rounded-[40px] flex items-center justify-center py-1.5 mt-2.5 min-h-9 text-white font-medium text-base transition-all"
            :class="[
              addToCartButtonClass,
              added ? 'bg-[#20A33E] hover:bg-[#1C8A35]' : 'bg-[#12120d] hover:bg-[#000000]',
            ]"
            data-testid="add-to-basket-short"
            :disabled="loading || added"
            @click.stop.prevent="addWithLoader(Number(productGetters.getId(product)))"
          >
            <SfLoaderCircular v-if="loading" class="flex justify-center items-center" size="sm" />
            <template v-else-if="added">
              <span>{{ t('theme.quickCheckout.added') }}<SfIconCheck size="sm" class="ml-1 mb-1" /></span>
            </template>
            <template v-else>
              <span>{{ t('theme.quickCheckout.addToCart') }}</span>
            </template>
          </button>
          <UiButton
            v-else-if="showAddToCart && !canAddFromCategory"
            variant="primary"
            type="button"
            :tag="NuxtLink"
            :to="productPath"
            size="sm"
            class="!w-[40px] !h-[40px] !min-w-0 !rounded-full flex items-center justify-center !p-0 absolute bottom-2 right-0"
            :class="[added ? '!bg-[#20A33E] hover:!bg-[#1C8A35]' : '!bg-[#12120d] hover:!bg-[#000000]']"
          >
            <img
              src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/ShortAddToBasket.svg"
              alt="Show options"
              class="w-4 h-4"
            />
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { productGetters, productImageGetters } from '@plentymarkets/shop-api';
import { SfLoaderCircular, SfRating, SfTooltip, SfIconCheck } from '@storefront-ui/vue';
import type { ProductCardProps } from './types';
import { defaults } from '~/composables';
import type { ItemGridContent } from '~/components/blocks/ItemGrid/types';
import type { BasketItemOrderParamsProperty, Product, DoAddItemParams } from '@plentymarkets/shop-api';
import { useGonserBoxProperty } from '../../../composables/useGonserBoxProperty/useGonserBoxProperty';

const props = withDefaults(defineProps<ProductCardProps>(), {
  configuration: () => ({
    cardBorders: true,
    contentAlignment: 'left',
    fields: {
      title: true,
      rating: true,
      previewText: false,
      price: true,
      addToCart: true,
      manufacturer: false,
    },
    fieldsOrder: ['title', 'manufacturer', 'rating', 'previewText', 'price', 'addToCart'],
    showWishlistButton: false,
    showSecondImageOnHover: false,
    addToCartStyle: 'primary',
    itemsPerRowDesktop: 4,
    itemsPerRowTablet: 3,
    itemsPerRowMobile: 1,
    showItemCount: true,
    itemCountPosition: 'center',
    fieldsDisabled: [],
    paginationPosition: 'bottom',
    layout: {
      fullWidth: false,
    },
  }),
});

const product = computed(() => props.product);

const configuration = computed(() => props.configuration || ({} as ItemGridContent));

const { addModernImageExtension } = useModernImage();
const localePath = useLocalePath();
const { format } = usePriceFormatter();
const { openQuickCheckout } = useQuickCheckout();
const { addToCart, data: cart, setCartItemQuantity } = useCart();
const { price, crossedPrice } = useProductPrice(product.value);
const { hasGonserBoxProperty } = useGonserBoxProperty();

// Check if product is a Box article (Property ID 4 with value '1')
const isBoxArticle = computed(() => {
  if (!product.value) return false;
  return hasGonserBoxProperty(product.value);
});

// Custom Format Function: "CHF xx.xx"
const formatCustomPrice = (price: number): string => {
  const numPrice = Number(price) || 0;
  if (numPrice <= 0) return '';
  return `CHF ${numPrice.toFixed(2)}`;
};
const { send } = useNotification();
const loading = ref(false);
const added = ref(false);
const config = useRuntimeConfig();
const useTagsOnCategoryPage = config.public.useTagsOnCategoryPage;
const name = computed(
  () => productGetters.getName(product.value) + productGetters.getGroupedAttributesString(product.value),
);
const manufacturer = computed(() => productGetters.getManufacturer(product.value));
const ratingCount = computed(() => {
  const count = productGetters.getTotalReviews(product.value);
  return count;
});
const rating = computed(() => {
  const avg = productGetters.getAverageRating(product.value, 'half');
  return avg;
});
const shortDescription = computed(() => productGetters.getShortDescription(product.value) || '');
const autoOrderParams = computed(() => {
  return productGetters.hasOrderPropertiesRequiredAndPreselected(product.value)
    ? buildAutoBasketItemOrderParams(product.value)
    : undefined;
});
const canAddFromCategory = computed(
  () =>
    productGetters.canBeAddedToCartFromCategoryPage(product.value) ||
    productGetters.hasOrderPropertiesRequiredAndPreselected(product.value),
);
const showFromText = computed(() => productGetters.showFromText(product.value));

const cover = computed(() => productGetters.getCoverImage(product.value));
const secondCover = computed(() => productGetters.getSecondCoverImage(product.value));
const firstImage = computed(() => productImageGetters.getFirstImage(product.value));

const imageUrl = computed(() => addModernImageExtension(cover.value));
const effectiveHoverImageUrl = computed(() => {
  if (!configuration.value?.showSecondImageOnHover) return '';
  const src = addModernImageExtension(secondCover.value);
  return src || '';
});

const imageAlt = computed(() => productImageGetters.getImageAlternate(firstImage.value) || name.value || '');
const imageTitle = computed(() => productImageGetters.getImageName(firstImage.value) || '');

const imageWidth = computed(() => productGetters.getImageWidth(product.value) || 600);
const imageHeight = computed(() => productGetters.getImageHeight(product.value) || 600);

const basePrice = computed(() => productGetters.getDefaultBasePrice(product.value));
const unitContent = computed(() => productGetters.getUnitContent(product.value));
const unitName = computed(() => productGetters.getUnitName(product.value));
const showBasePrice = computed(() => productGetters.showPricePerUnit(product.value));

const variationId = computed(() => productGetters.getVariationId(product.value));
const isGlobalProductCategoryTemplate = computed(() => {
  const route = useRoute();
  const slugParam = route.params.slug;

  if (slugParam === undefined) {
    return false;
  }

  const slug = Array.isArray(slugParam) ? slugParam.join('/') : slugParam;
  return `/${slug}` === paths.globalItemCategory;
});

const productPath = computed(() => {
  if (isGlobalProductCategoryTemplate.value) {
    return paths.globalItemDetails;
  }
  if (useCallisto().isEnabled) {
    return localePath(`/${productGetters.getUrlPath(product.value)}/a-${productGetters.getItemId(product.value)}`);
  }
  const basePath = `/${productGetters.getUrlPath(product.value)}_${productGetters.getItemId(product.value)}`;
  const shouldAppendVariation = productGetters.shouldAppendVariationToLink(product.value);
  return localePath(shouldAppendVariation ? `${basePath}_${variationId.value}` : basePath);
});

const priority = computed(() => !props.isFromSlider && (props.index ?? 0) < 5);
const lazy = computed(() => props.lazy ?? false);
const isFromWishlist = computed(() => props.isFromWishlist || false);
const isFromSlider = computed(() => props.isFromSlider || false);
const addToCartCompact = computed(() => props.addToCartCompact || false);
const showCompactBoxIcon = computed(() => isBoxArticle.value && addToCartCompact.value && props.showAddToCart);
const addToCartButtonClass = computed(() => {
  if (!addToCartCompact.value) return 'w-full';

  // Reserve space for the right-side GonserBox icon when both elements are shown.
  if (showCompactBoxIcon.value) return 'w-full max-w-[146px] mr-7';

  return 'w-full max-w-[146px]';
});
const {
  imageContainerRef,
  mainImageRef,
  hoverImageRef,
  shouldLoadMainImage,
  shouldLoadHoverImage,
  mainImageLoaded,
  hoverImageLoaded,
  onMainImageLoad,
  onMainImageError,
  onHoverImageLoad,
  onHoverImageError,
} = useLazyProductImage({
  priority,
  hoverImageUrl: effectiveHoverImageUrl,
});

const externalImagePermission = computed(() => {
  if (!props.isFromSlider) return true;
  return props.shouldLoadImage ?? true;
});

const canLoadMainImage = computed(() => {
  if (!externalImagePermission.value) return false;
  if (props.isFromSlider) return true;
  return shouldLoadMainImage.value;
});

const canLoadHoverImage = computed(() => {
  if (!externalImagePermission.value || !effectiveHoverImageUrl.value) return false;
  if (props.isFromSlider) return true;
  return shouldLoadHoverImage.value;
});

const ariaLabelContent = computed(() => {
  return t('common.accessibility.viewDetails', { name: name.value ?? '' });
});

const getWidth = () => {
  if (imageWidth.value && imageWidth.value > 0 && imageUrl.value.includes(defaults.IMAGE_LINK_SUFIX)) {
    return imageWidth.value;
  }
  return '';
};

const getHeight = () => {
  if (imageHeight.value && imageHeight.value > 0 && imageUrl.value.includes(defaults.IMAGE_LINK_SUFIX)) {
    return imageHeight.value;
  }
  return '';
};

/**
 * Builds basket order parameters for products that have
 * required and preselected order properties.
 *
 * This helper extracts only order properties that are marked as required
 * and converts them into the structure expected by the basket API.
 *
 * It is intended to be used only when the product is already validated
 * by `hasOrderPropertiesRequiredAndPreselected`, meaning no user input
 * is needed before adding the product to the basket.
 *
 * @param product - The product from which order properties are extracted.
 * @returns An array of basket order parameter objects if required order
 *          properties exist, otherwise `undefined`.
 */
const buildAutoBasketItemOrderParams = (product: Product): BasketItemOrderParamsProperty[] | undefined =>
  product.properties
    ?.filter((p) => p?.property?.isOderProperty && p.property.isRequired)
    .map((p) => {
      const pr = p.property;

      return {
        property: {
          id: p.propertyId ?? pr.id,
          names: { name: pr.names?.name ?? '' },
          valueType: pr.valueType,
          value: '1',
        },
      };
    }) || undefined;

const addWithLoader = async (productId: number, quickCheckout = true) => {
  loading.value = true;
  try {
    const isRequiredAndPreselected = productGetters.hasOrderPropertiesRequiredAndPreselected(product.value);
    const params = isRequiredAndPreselected ? autoOrderParams.value : undefined;

    if (isRequiredAndPreselected && !params) {
      await navigateTo(productPath.value);
      return;
    }

    // Check if product already exists in cart
    const existingCartItem = cart.value?.items?.find((item) => {
      // Match by variationId
      if (item.variationId !== productId) return false;

      // If no params, item must also have no params (or empty params)
      if (!params || params.length === 0) {
        return !item.basketItemOrderParams || item.basketItemOrderParams.length === 0;
      }

      // If params exist, compare them
      if (!item.basketItemOrderParams || item.basketItemOrderParams.length !== params.length) {
        return false;
      }

      // Compare each param
      return params.every((param) => {
        return item.basketItemOrderParams?.some((itemParam) => {
          return (
            Number(itemParam.propertyId) === Number(param.property.id) &&
            String(itemParam.value) === String(param.property.value)
          );
        });
      });
    });

    if (existingCartItem) {
      // Product exists, increase quantity
      const newQuantity = existingCartItem.quantity + 1;
      await setCartItemQuantity({
        cartItemId: existingCartItem.id,
        productId: productId,
        quantity: newQuantity,
      });
    } else {
      // Product doesn't exist, add new
      const addToCartObject: DoAddItemParams = {
        productId,
        quantity: 1,
        ...(params ? { basketItemOrderParams: params } : {}),
      };

      await addToCart(addToCartObject);
    }

    // Show "Hinzugefügt" state for 2 seconds
    added.value = true;
    setTimeout(() => {
      added.value = false;
    }, 3000);

    if (quickCheckout) openQuickCheckout(product.value, 1);
    else send({ message: t('cart.itemAdded'), type: 'positive' });
  } finally {
    loading.value = false;
  }
};
const differentPrices = (price: number, crossedPrice: number) => {
  return crossedPrice ? Math.round(price * 100) / 100 !== Math.round(crossedPrice * 100) / 100 : false;
};

const NuxtLink = resolveComponent('NuxtLink');

// ==============================
// Color Variants Logic - Start
// ==============================

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

type ColorVariant = {
  itemId: string;
  label: string;
  disabled: boolean;
  colorHex: string;
  colorType: 'solid' | 'image' | 'transparent';
  colorImageUrl?: string;
  colorName: string;
  product: Product;
  hasProperty39: boolean;
  outOfStock: boolean;
};

// Color ID to Hex mapping (Property 24)
const colorMapping: Record<
  number,
  { hex: string; type: 'solid' | 'image' | 'transparent'; name: string; imageUrl?: string }
> = {
  3: { hex: '#000000', type: 'solid', name: 'schwarz' },
  8: { hex: '#808080', type: 'solid', name: 'grau' },
  9: { hex: '#293133', type: 'solid', name: 'anthrazit' },
  10: { hex: '#F5F5DC', type: 'solid', name: 'beige' },
  11: { hex: '#AF9F96', type: 'solid', name: 'taupe' },
  12: { hex: '#40E0D0', type: 'solid', name: 'türkis' },
  15: { hex: '#FFC0CB', type: 'solid', name: 'rosa' },
  16: { hex: '#0000FF', type: 'solid', name: 'blau' },
  17: { hex: '#FF0000', type: 'solid', name: 'rot' },
  18: { hex: '#FFFF00', type: 'solid', name: 'gelb' },
  20: { hex: '#008000', type: 'solid', name: 'grün' },
  21: { hex: '#FF8C00', type: 'solid', name: 'orange' },
  22: { hex: '#FF00FF', type: 'solid', name: 'pink' },
  23: { hex: '#FDE8CC', type: 'solid', name: 'creme' },
  24: { hex: '#FFFFFF', type: 'solid', name: 'weiss' },
  26: { hex: '#8C23BD', type: 'solid', name: 'violett' },
  27: { hex: '#5B3A29', type: 'solid', name: 'braun' },
  29: { hex: '#2D6C7A', type: 'solid', name: 'petrol' },
  32: {
    hex: '',
    type: 'image',
    name: 'bunt',
    imageUrl: 'https://cdn10.plentymarkets.com/mrt54q44tptl/frontend/Gonser/icons/bunt.png',
  },
  33: { hex: '#C0C0C0', type: 'solid', name: 'silber' },
  34: { hex: '#FFD700', type: 'solid', name: 'gold' },
  35: { hex: '#151515', type: 'transparent', name: 'transparent' },
};

// Extract color IDs from product properties (Property ID 24 = color selection IDs)
const colorSelectionIds = computed(() => {
  if (!product.value) return [];
  const groups = (product.value as ProductWithVariationProperties).variationProperties;
  if (!Array.isArray(groups)) return [];

  for (const group of groups) {
    const properties = group?.properties;
    if (!Array.isArray(properties)) continue;
    for (const property of properties) {
      if (Number(property?.id ?? 0) !== 24) continue; // Property 24 = Farbe
      const value = property?.values?.value;
      if (typeof value !== 'string') return [];
      const ids = value
        .split(',')
        .map((v: string) => v.trim())
        .filter(Boolean)
        .map(Number)
        .filter((id) => !isNaN(id) && id > 0);
      return ids;
    }
  }
  return [];
});

// Extract variant item IDs from product properties (Property ID 61 = weitere Farben)
const colorIds = computed(() => {
  if (!product.value) return [];
  const groups = (product.value as ProductWithVariationProperties).variationProperties;
  if (!Array.isArray(groups)) return [];

  for (const group of groups) {
    const properties = group?.properties;
    if (!Array.isArray(properties)) continue;
    for (const property of properties) {
      if (Number(property?.id ?? 0) !== 61) continue;
      const value = property?.values?.value;
      if (typeof value !== 'string') return [];
      const ids = value
        .split(',')
        .map((v: string) => v.trim())
        .filter(Boolean)
        .filter((id) => !isNaN(Number(id)) && Number(id) > 0);
      return ids;
    }
  }
  return [];
});

const currentItemId = computed(() => {
  if (!product.value) return '';
  const id = productGetters.getItemId(product.value);
  return id ? String(id) : '';
});

type VariantRequestState = {
  inFlight: number;
  queue: Array<() => void>;
  invalidIds: Set<string>;
  resolvedCache: Map<string, Product | null>;
  pendingRequests: Map<string, Promise<Product | null>>;
};

const INVALID_VARIANT_IDS_STORAGE_KEY = 'plenty_productcard_invalid_variant_ids';

const readInvalidVariantIdsFromSession = (): Set<string> => {
  if (!import.meta.client) {
    return new Set<string>();
  }

  try {
    const rawValue = window.sessionStorage.getItem(INVALID_VARIANT_IDS_STORAGE_KEY);
    if (!rawValue) {
      return new Set<string>();
    }

    const parsed = JSON.parse(rawValue) as unknown;
    if (!Array.isArray(parsed)) {
      return new Set<string>();
    }

    return new Set(parsed.map((entry) => String(entry).trim()).filter(Boolean));
  } catch {
    return new Set<string>();
  }
};

const FALLBACK_VARIANT_REQUEST_STATE: VariantRequestState = {
  inFlight: 0,
  queue: [],
  invalidIds: new Set<string>(),
  resolvedCache: new Map<string, Product | null>(),
  pendingRequests: new Map<string, Promise<Product | null>>(),
};

const variantRequestState: VariantRequestState = (() => {
  if (typeof globalThis === 'undefined') {
    return FALLBACK_VARIANT_REQUEST_STATE;
  }

  const stateKey = '__plentyProductCardVariantRequestState';
  const globalState = (globalThis as any)[stateKey] as VariantRequestState | undefined;
  if (globalState) {
    return globalState;
  }

  const createdState: VariantRequestState = {
    inFlight: 0,
    queue: [],
    invalidIds: readInvalidVariantIdsFromSession(),
    resolvedCache: new Map<string, Product | null>(),
    pendingRequests: new Map<string, Promise<Product | null>>(),
  };
  (globalThis as any)[stateKey] = createdState;
  return createdState;
})();

const invalidVariantIds = variantRequestState.invalidIds;
const MAX_COLOR_VARIANT_REQUESTS = 4;
const MAX_DISPLAYED_COLOR_VARIANTS = 4;
const MAX_FETCHED_COLOR_VARIANTS = MAX_DISPLAYED_COLOR_VARIANTS - 1;
const SWATCH_BATCH_ENDPOINT = '/api/product-card-swatches';
const SWATCH_BATCH_SIZE = 40;
const sdk = useSdk();

const persistInvalidVariantIdsToSession = (): void => {
  if (!import.meta.client) {
    return;
  }

  try {
    const serialized = JSON.stringify(Array.from(invalidVariantIds).slice(-500));
    window.sessionStorage.setItem(INVALID_VARIANT_IDS_STORAGE_KEY, serialized);
  } catch {
    // Ignore storage write errors (private mode/quota restrictions).
  }
};

const getErrorStatusCode = (error: unknown): number | null => {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const toStatusCode = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && /^\d+$/.test(value)) {
      return Number(value);
    }

    return null;
  };

  const statusCode = toStatusCode((error as { statusCode?: unknown }).statusCode);
  if (statusCode !== null) {
    return statusCode;
  }

  const code = toStatusCode((error as { code?: unknown }).code);
  if (code !== null) {
    return code;
  }

  const cause = (error as { cause?: { statusCode?: unknown; code?: unknown } }).cause;
  const causeStatusCode = toStatusCode(cause?.statusCode);
  if (causeStatusCode !== null) {
    return causeStatusCode;
  }

  const causeCode = toStatusCode(cause?.code);
  if (causeCode !== null) {
    return causeCode;
  }

  return null;
};

const shouldRetryVariantRequest = (error: unknown): boolean => {
  const statusCode = getErrorStatusCode(error);
  if (statusCode === null) {
    return true;
  }

  if (statusCode === 404) {
    return false;
  }

  if (statusCode === 429) {
    return true;
  }

  return statusCode >= 500;
};

const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const runWithVariantConcurrencyLimit = async <T,>(task: () => Promise<T>): Promise<T> => {
  await new Promise<void>((resolve) => {
    const acquire = () => {
      if (variantRequestState.inFlight < MAX_COLOR_VARIANT_REQUESTS) {
        variantRequestState.inFlight += 1;
        resolve();
        return;
      }

      variantRequestState.queue.push(acquire);
    };

    acquire();
  });

  try {
    return await task();
  } finally {
    variantRequestState.inFlight = Math.max(0, variantRequestState.inFlight - 1);
    const next = variantRequestState.queue.shift();
    if (next) {
      next();
    }
  }
};

const fetchColorVariantProduct = async (variantItemId: string, sourceItemId: string): Promise<Product | null> => {
  const normalizedId = String(variantItemId).trim();
  if (!normalizedId || invalidVariantIds.has(normalizedId)) {
    return null;
  }

  if (variantRequestState.resolvedCache.has(normalizedId)) {
    return variantRequestState.resolvedCache.get(normalizedId) ?? null;
  }

  const pendingRequest = variantRequestState.pendingRequests.get(normalizedId);
  if (pendingRequest) {
    return pendingRequest;
  }

  const requestPromise = runWithVariantConcurrencyLimit(async () => {
    const retryDelays = [120, 320, 700];
    let lastError: unknown = null;
    let notFoundAttempts = 0;

    try {
      for (let attempt = 0; attempt <= retryDelays.length; attempt += 1) {
        try {
          const response = await sdk.plentysystems.getProduct({ id: normalizedId });
          const resolvedProduct = response.data || null;
          variantRequestState.resolvedCache.set(normalizedId, resolvedProduct);
          return resolvedProduct;
        } catch (error) {
          lastError = error;
          if (getErrorStatusCode(error) === 404) {
            notFoundAttempts += 1;
          }

          const canRetry = attempt < retryDelays.length && shouldRetryVariantRequest(error);
          if (!canRetry) {
            break;
          }

          await wait(retryDelays[attempt] ?? 0);
        }
      }

      const isPersistentNotFound = notFoundAttempts > 0;
      if (isPersistentNotFound) {
        invalidVariantIds.add(normalizedId);
        persistInvalidVariantIdsToSession();
        variantRequestState.resolvedCache.set(normalizedId, null);
        if (import.meta.dev) {
          console.info(
            `[ProductCard] Variante ${normalizedId} nicht gefunden (Artikel ${sourceItemId}). ` +
              `Artikel/Variante in Plenty nicht verfuegbar.`,
          );
        }
      } else if (import.meta.dev) {
        console.info(
          `[ProductCard] Variante ${normalizedId} konnte temporaer nicht geladen werden (Artikel ${sourceItemId}).`,
          lastError,
        );
      }

      return null;
    } finally {
      variantRequestState.pendingRequests.delete(normalizedId);
    }
  });

  variantRequestState.pendingRequests.set(normalizedId, requestPromise);
  return requestPromise;
};

const chunkItemIds = (itemIds: string[], size: number) => {
  const chunks: string[][] = [];

  for (let i = 0; i < itemIds.length; i += size) {
    chunks.push(itemIds.slice(i, i + size));
  }

  return chunks;
};

const fetchColorVariantsBatchFromServer = async (itemIds: string[]) => {
  const aggregated: Record<string, Product | null> = {};
  const chunks = chunkItemIds(itemIds, SWATCH_BATCH_SIZE);

  for (const chunk of chunks) {
    const response = await fetch(SWATCH_BATCH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({ itemIds: chunk }),
    });

    if (!response.ok) {
      throw new Error(`Batch swatch request failed with status ${response.status}`);
    }

    const body = (await response.json()) as {
      variants?: Record<string, Product | null>;
    };

    const variants = body.variants || {};
    for (const itemId of chunk) {
      const variant = variants[itemId] || null;
      aggregated[itemId] = variant;

      if (variant) {
        variantRequestState.resolvedCache.set(itemId, variant);
      }
    }
  }

  return aggregated;
};

const getPrimaryColorKeyFromProduct = (variantProduct: Product): string => {
  const selectionIds = getColorSelectionIds(variantProduct);
  const primaryColorId = selectionIds[0];
  const colorInfo = primaryColorId ? colorMapping[primaryColorId] : null;

  if (!colorInfo) {
    return 'unknown';
  }

  if (colorInfo.type === 'image') {
    return `image:${colorInfo.imageUrl || colorInfo.name || primaryColorId}`;
  }

  if (colorInfo.type === 'transparent') {
    return `transparent:${colorInfo.hex || colorInfo.name || primaryColorId}`;
  }

  return `solid:${colorInfo.hex || colorInfo.name || primaryColorId}`;
};

// Fetch color variant products (client-only to avoid SSR hydration mismatch)
const { data: fetchedColorProducts } = useAsyncData<Product[]>(
  `productcard-color-variants-${currentItemId.value}`,
  async () => {
    if (!priority.value && !shouldLoadMainImage.value) return [];
    if (!colorIds.value?.length || !currentItemId.value) return [];
    try {
      // Filter out known invalid IDs before making API calls
      const validIds = colorIds.value.filter((id) => {
        const idStr = String(id).trim();
        return idStr && !invalidVariantIds.has(idStr);
      });

      if (!validIds.length) return [];

      let batchVariants: Record<string, Product | null> = {};
      try {
        batchVariants = await fetchColorVariantsBatchFromServer(validIds);
      } catch {
        batchVariants = {};
      }

      const currentPrimaryColorKey = getPrimaryColorKeyFromProduct(product.value);
      const seenPrimaryColorKeys = new Set<string>([currentPrimaryColorKey]);
      const selectedProducts: Product[] = [];
      const fallbackProducts: Product[] = [];

      for (const id of validIds) {
        let resolvedProduct = batchVariants[String(id)];
        if (resolvedProduct === undefined) {
          resolvedProduct = await fetchColorVariantProduct(String(id), currentItemId.value);
        }

        if (!resolvedProduct) {
          continue;
        }

        const resolvedItemId = String(productGetters.getItemId(resolvedProduct) || '').trim();
        if (!resolvedItemId || resolvedItemId === currentItemId.value) {
          continue;
        }

        if (selectedProducts.some((entry) => String(productGetters.getItemId(entry) || '') === resolvedItemId)) {
          continue;
        }

        const primaryColorKey = getPrimaryColorKeyFromProduct(resolvedProduct);
        if (!seenPrimaryColorKeys.has(primaryColorKey)) {
          seenPrimaryColorKeys.add(primaryColorKey);
          selectedProducts.push(resolvedProduct);
        } else {
          fallbackProducts.push(resolvedProduct);
        }

        if (selectedProducts.length >= MAX_FETCHED_COLOR_VARIANTS) {
          break;
        }
      }

      if (selectedProducts.length < MAX_FETCHED_COLOR_VARIANTS) {
        for (const fallbackProduct of fallbackProducts) {
          if (selectedProducts.length >= MAX_FETCHED_COLOR_VARIANTS) {
            break;
          }

          const fallbackItemId = String(productGetters.getItemId(fallbackProduct) || '').trim();
          if (!fallbackItemId) {
            continue;
          }

          if (selectedProducts.some((entry) => String(productGetters.getItemId(entry) || '') === fallbackItemId)) {
            continue;
          }

          selectedProducts.push(fallbackProduct);
        }
      }

      return selectedProducts;
    } catch {
      return [];
    }
  },
  {
    watch: [colorIds, currentItemId, shouldLoadMainImage, priority],
    default: () => [],
    server: false,
  },
);

function isNotAvailableVariant(product: Product) {
  return (product.variation?.availabilityId ?? 0) > 7;
}

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

// Check if current product has Property 39
const hasProperty39 = computed(() => {
  if (!product.value) return false;
  return hasProperty39Variant(product.value);
});

function hasNoStockVariant(product: Product): boolean {
  return (product.variation?.availabilityId ?? 0) > 7;
}

// Extract color selection IDs (Property 24) for a specific product
function getColorSelectionIds(product: Product): number[] {
  const groups = (product as ProductWithVariationProperties).variationProperties;

  if (!Array.isArray(groups)) {
    return [];
  }

  for (const group of groups) {
    const properties = group?.properties;
    if (!Array.isArray(properties)) continue;
    for (const property of properties) {
      if (Number(property?.id ?? 0) !== 24) continue;

      // Property 24 has values as an array with selectionId
      const values = property?.values;

      if (!Array.isArray(values)) {
        return [];
      }

      const ids = values.map((v: any) => Number(v?.selectionId ?? 0)).filter((id) => !isNaN(id) && id > 0);
      return ids;
    }
  }
  return [];
}

function buildProductPathVariant(product: Product): string {
  const { buildProductLanguagePath } = useLocalization();
  const urlPath = productGetters.getUrlPath(product) || '';
  const itemId = String(productGetters.getItemId(product) ?? '');
  const variationId = String(productGetters.getVariationId(product) ?? '');
  const suffix = variationId ? `${itemId}_${variationId}` : itemId;
  return buildProductLanguagePath(`/${urlPath}_${suffix}`);
}

// Build color variants
const colorVariants = computed<ColorVariant[]>(() => {
  if (!product.value) return [];
  try {
    const fetchedColor = fetchedColorProducts.value || [];
    const others = fetchedColor.filter((p) => String(productGetters.getItemId(p) || '') !== currentItemId.value);
    const all = [product.value, ...others];

    const seen = new Set<string>();
    const unique = all.filter((p) => {
      if (!p) return false;
      const id = String(productGetters.getItemId(p) || '');
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    return unique.map((p) => {
      const id = String(productGetters.getItemId(p) || '');
      const colorIds = getColorSelectionIds(p);
      // Use first color ID as primary color
      const primaryColorId = colorIds[0];
      const colorInfo = primaryColorId ? colorMapping[primaryColorId] : null;

      return {
        itemId: id,
        label: productGetters.getName(p) || id,
        disabled: isNotAvailableVariant(p),
        colorHex: colorInfo?.hex || '#CCCCCC',
        colorType: colorInfo?.type || 'solid',
        colorImageUrl: colorInfo?.imageUrl,
        colorName: colorInfo?.name || '',
        product: p,
        hasProperty39: hasProperty39Variant(p),
        outOfStock: hasNoStockVariant(p),
      };
    });
  } catch {
    return [];
  }
});

const shouldShowColorVariants = computed(() => {
  // Show if we have multiple color variants
  return (colorVariants.value?.length || 0) > 1;
});

const getPrimaryColorKey = (variant: ColorVariant): string => {
  if (variant.colorType === 'image') {
    return `image:${variant.colorImageUrl || variant.colorName || variant.itemId}`;
  }

  if (variant.colorType === 'transparent') {
    return `transparent:${variant.colorHex || variant.colorName || variant.itemId}`;
  }

  return `solid:${variant.colorHex || variant.colorName || variant.itemId}`;
};

// Prefer unique primary colors across displayed swatches.
const displayedColorVariants = computed(() => {
  const variants = colorVariants.value;
  if (!variants.length) {
    return [];
  }

  const uniqueColorVariants: ColorVariant[] = [];
  const seenColorKeys = new Set<string>();

  for (const variant of variants) {
    const colorKey = getPrimaryColorKey(variant);
    if (seenColorKeys.has(colorKey)) {
      continue;
    }

    seenColorKeys.add(colorKey);
    uniqueColorVariants.push(variant);

    if (uniqueColorVariants.length >= MAX_DISPLAYED_COLOR_VARIANTS) {
      break;
    }
  }

  if (uniqueColorVariants.length >= MAX_DISPLAYED_COLOR_VARIANTS) {
    return uniqueColorVariants;
  }

  for (const variant of variants) {
    if (uniqueColorVariants.some((entry) => entry.itemId === variant.itemId)) {
      continue;
    }

    uniqueColorVariants.push(variant);
    if (uniqueColorVariants.length >= MAX_DISPLAYED_COLOR_VARIANTS) {
      break;
    }
  }

  return uniqueColorVariants;
});

// Calculate remaining count
const remainingColorCount = computed(() => {
  const normalizedIds = colorIds.value.map((id) => String(id).trim()).filter((id) => id && id !== currentItemId.value);
  const totalPotentialVariants = 1 + new Set(normalizedIds).size;

  return Math.max(0, totalPotentialVariants - displayedColorVariants.value.length);
});

const navigateToColorVariant = (variant: ColorVariant) => {
  if (variant.disabled) return;
  const path = buildProductPathVariant(variant.product);
  navigateTo(path);
};

// ==============================
// Color Variants Logic - End
// ==============================
</script>
