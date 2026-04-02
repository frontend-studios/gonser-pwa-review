<template>
  <div class="product-card hover:shadow-lg flex flex-col rounded-b-[10px]" data-testid="product-card">
    <div class="relative overflow-hidden rounded-[10px] border border-gray">
      <UiBadges
        :use-tags="useTagsOnCategoryPage"
        :class="['absolute', isFromWishlist ? 'mx-2' : 'm-2']"
        :product="product"
        :use-availability="isFromWishlist"
      />

      <!-- SALE Badge oben rechts -->
      <div v-if="hasProperty39" class="absolute top-2 right-2 z-10">
        <span class="inline-block py-0.5 px-2.5 text-white text-sm bg-red rounded-[20px]">
          {{ t('theme.ProductPage.sale') }}
        </span>
      </div>

      <!-- EEK Label oben links -->
      <UiEnergyLabel :product="product" position="top-left" :size="52" />

      <SfLink
        :tag="NuxtLink"
        rel="preload"
        :to="productPath"
        :class="[{ 'size-48': isFromSlider }, 'relative group/image flex items-center justify-center']"
        as="image"
        data-testid="product-card-link"
      >
        <NuxtImg
          :src="imageUrl"
          :alt="imageAlt"
          :title="imageTitle ? imageTitle : null"
          :loading="lazy && !priority ? 'lazy' : 'eager'"
          :fetchpriority="priority ? 'high' : 'auto'"
          :preload="priority || false"
          :width="getWidth()"
          :height="getHeight()"
          :class="[
            'object-contain rounded-md aspect-square w-full transition-opacity duration-300',
            effectiveHoverImageUrl ? 'group-hover/image:opacity-0' : '',
          ]"
          data-testid="image-slot"
        />
        <NuxtImg
          v-if="effectiveHoverImageUrl"
          :src="effectiveHoverImageUrl"
          :alt="imageAlt"
          :title="imageTitle ? imageTitle : null"
          :loading="lazy && !priority ? 'lazy' : 'eager'"
          fetchpriority="auto"
          :preload="false"
          :width="getWidth()"
          :height="getHeight()"
          class="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/image:opacity-100 object-contain rounded-md w-full h-full"
          data-testid="hover-image-slot"
        />
      </SfLink>

      <div
        v-if="shouldShowSizeVariants"
        class="pseudo-variant-size absolute left-2 right-2 z-10"
        :class="shouldShowColorVariants ? 'bottom-16' : 'bottom-2'"
      >
        <div class="flex items-center justify-between">
          <button
            v-for="sizeVariant in displayedSizeVariants"
            :key="sizeVariant.itemId"
            type="button"
            class="relative border border-gray bg-white px-2 py-1 overflow-visible transition-all rounded-[5px] shadow-sm hover:scale-105 text-xs font-medium min-w-[52px] h-[32px] flex items-center justify-center"
            :class="{ 'opacity-70': sizeVariant.disabled }"
            :disabled="sizeVariant.disabled"
            @click.prevent="navigateToSizeVariant(sizeVariant)"
          >
            <span
              v-if="sizeVariant.hasProperty39"
              class="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-white font-semibold z-20 bg-red w-4 h-4 text-[10px]"
            >
              %
            </span>
            <div
              v-if="sizeVariant.outOfStock"
              class="absolute inset-0 bg-white/70 rounded-[5px] z-10 flex items-center justify-center"
            >
              <img
                src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/PDP/Mail.svg"
                alt="Out of Stock"
                class="w-3 h-3"
              />
            </div>
            <span :class="{ grayscale: sizeVariant.disabled }">{{ sizeVariant.sizeValue }}</span>
          </button>

          <button
            v-if="remainingSizeCount > 0"
            type="button"
            class="flex items-center justify-center min-w-[52px] h-[32px] rounded-[5px] bg-white border border-gray shadow-sm text-xs font-semibold text-neutral-700 hover:scale-105 transition-all cursor-pointer px-2"
            @click.prevent="navigateTo(productPath)"
          >
            +{{ remainingSizeCount }}
          </button>
        </div>
      </div>

      <div v-if="shouldShowColorVariants" class="pseudo-variant-color absolute bottom-2 left-2 right-2 z-10">
        <div class="flex items-center justify-between">
          <button
            v-for="colorVariant in displayedColorVariants"
            :key="colorVariant.itemId"
            type="button"
            class="relative border border-gray bg-white p-0.5 overflow-visible transition-all w-[52px] h-[51px] rounded-[5px] shadow-sm hover:scale-105"
            :class="{ 'opacity-70': colorVariant.disabled }"
            :disabled="colorVariant.disabled"
            @click.prevent="navigateToColorVariant(colorVariant)"
          >
            <span
              v-if="colorVariant.hasProperty39"
              class="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-white font-semibold z-20 bg-red w-4 h-4 text-[10px]"
            >
              %
            </span>
            <div
              v-if="colorVariant.outOfStock"
              class="absolute inset-0 bg-white/70 rounded-[5px] z-10 flex items-center justify-center"
            >
              <img
                src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/PDP/Mail.svg"
                alt="Out of Stock"
                class="w-3 h-3"
              />
            </div>
            <NuxtImg
              :src="colorVariant.thumbUrl"
              :alt="colorVariant.label"
              class="w-full h-full object-cover"
              :class="{ grayscale: colorVariant.disabled }"
            />
          </button>

          <button
            v-if="remainingColorCount > 0"
            type="button"
            class="flex items-center justify-center w-[52px] h-[51px] rounded-[5px] bg-white border border-gray shadow-sm text-xs font-semibold text-neutral-700 hover:scale-105 transition-all cursor-pointer"
            @click.prevent="navigateTo(productPath)"
          >
            +{{ remainingColorCount }}
          </button>
        </div>
      </div>
    </div>

    <div class="thumb-content p-2 typography-text-sm flex flex-col flex-auto items-start">
      <div class="w-full flex items-center justify-between pt-1 mb-2">
        <ClientOnly>
          <div v-if="ratingCount > 0" class="flex items-center gap-1">
            <SfRating size="xs" :half-increment="true" :value="rating ?? 0" :max="5" />
            <SfCounter size="xs">{{ ratingCount }}</SfCounter>
          </div>
          <div v-else></div>
        </ClientOnly>
        <UiBadges :product="product" :use-tags="false" :use-availability="true" />
      </div>

      <template v-for="key in configuration?.fieldsOrder" :key="key">
        <template v-if="key === 'title' && configuration?.fields?.title">
          <SfLink
            :tag="NuxtLink"
            :to="productPath"
            class="no-underline line-clamp-2 md:min-h-10 font-semibold"
            variant="secondary"
            data-testid="productcard-name"
          >
            {{ name }}
          </SfLink>
        </template>
        <template v-if="key === 'price' && configuration?.fields?.price">
          <LowestPrice :product="product" />
          <div v-if="showBasePrice" class="mb-2">
            <BasePriceInLine :base-price="basePrice" :unit-content="unitContent" :unit-name="unitName" />
          </div>
          <div class="flex flex-col items-start mt-auto w-full">
            <span class="block font-bold typography-text-sm" data-testid="product-card-vertical-price">
              <span v-if="showFromText" class="mr-1">{{ t('account.ordersAndReturns.orderDetails.priceFrom') }}</span>
              <template v-if="Number(price) > 0">
                <span class="text-red">CHF</span> <span class="h4 text-red">{{ Number(price).toFixed(2) }}</span>
              </template>
            </span>
            <div class="flex items-center justify-between w-full h-5 mb-2.5">
              <span class="text-gray-super-dark">
                <template v-if="crossedPrice && differentPrices(price, crossedPrice)">
                  {{ t('theme.ProductPage.insteadOfRRP') }} {{ Number(crossedPrice).toFixed(2) }}
                </template>
              </span>
              <SfTooltip v-if="isBoxArticle" :label="t('theme.GonserBox.boxIconTooltip')">
                <img
                  :src="t('theme.GonserBox.boxIconUrl')"
                  :alt="t('theme.GonserBox.boxIconTooltip')"
                  class="w-5 h-5"
                />
              </SfTooltip>
            </div>
          </div>
        </template>
        <template v-if="key === 'addToCart' && configuration?.fields?.addToCart">
          <UiButton
            v-if="canAddFromCategory"
            size="sm"
            class="min-w-[80px] w-fit !bg-[#20A33E] hover:!bg-[#1C8A35] !rounded-[40px]"
            data-testid="add-to-basket-short"
            :disabled="loading"
            :variant="configuration?.addToCartStyle || 'primary'"
            @click="addWithLoader(Number(productGetters.getId(product)))"
          >
            <SfLoaderCircular v-if="loading" class="flex justify-center items-center" size="sm" />
            <span v-else>{{ t('common.actions.add') }}</span>
          </UiButton>
          <UiButton
            v-else
            :variant="configuration?.addToCartStyle || 'primary'"
            type="button"
            :tag="NuxtLink"
            :to="productPath"
            size="sm"
            class="w-fit !bg-[#20A33E] hover:!bg-[#1C8A35] !rounded-[40px]"
          >
            <span>{{ t('common.actions.showOptions') }}</span>
          </UiButton>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { productGetters, productImageGetters } from '@plentymarkets/shop-api';
import { SfLink, SfIconShoppingCart, SfLoaderCircular, SfRating, SfCounter, SfTooltip } from '@storefront-ui/vue';
import type { ProductCardProps } from '~/components/ui/ProductCard/types';
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
const { addToCart } = useCart();
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
const { isGlobalProductCategoryTemplate } = useProducts();
const productPath = computed(() => {
  if (isGlobalProductCategoryTemplate?.value) {
    return paths.globalItemDetails;
  }
  if (useCallisto().isEnabled) {
    return localePath(`/${productGetters.getUrlPath(product.value)}/a-${productGetters.getItemId(product.value)}`);
  }
  const basePath = `/${productGetters.getUrlPath(product.value)}_${productGetters.getItemId(product.value)}`;
  const shouldAppendVariation = productGetters.shouldAppendVariationToLink(product.value);
  return localePath(shouldAppendVariation ? `${basePath}_${variationId.value}` : basePath);
});

const priority = ref((props.index || 0) < 5);
const lazy = ref(props.lazy || false);
const isFromWishlist = ref(props.isFromWishlist || false);
const isFromSlider = ref(props.isFromSlider || false);

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

    const addToCartObject: DoAddItemParams = {
      productId,
      quantity: 1,
      ...(params ? { basketItemOrderParams: params } : {}),
    };

    await addToCart(addToCartObject);

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
  thumbUrl: string;
  product: Product;
  hasProperty39: boolean;
  outOfStock: boolean;
};

// Extract color IDs from product properties (Property ID 52 = colors)
const colorIds = computed(() => {
  if (!product.value) return [];
  const groups = (product.value as ProductWithVariationProperties).variationProperties;
  if (!Array.isArray(groups)) return [];

  for (const group of groups) {
    const properties = group?.properties;
    if (!Array.isArray(properties)) continue;
    for (const property of properties) {
      if (Number(property?.id ?? 0) !== 52) continue;
      const value = property?.values?.value;
      if (typeof value !== 'string') return [];
      const ids = value
        .split(',')
        .map((v: string) => v.trim())
        .filter(Boolean)
        .filter((id) => !isNaN(Number(id)) && Number(id) > 0); // Only valid numeric IDs
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

// Fetch color variant products (client-only to avoid SSR hydration mismatch)
const { data: fetchedColorProducts } = useAsyncData<Product[]>(
  `productcard-color-variants-${currentItemId.value}`,
  async () => {
    if (!colorIds.value?.length || !currentItemId.value) return [];
    try {
      const validIds = colorIds.value.filter((id) => id && String(id).trim());
      if (!validIds.length) return [];

      const results = await Promise.all(
        validIds.map((id) =>
          useSdk()
            .plentysystems.getProduct({ id })
            .then((res: { data: Product }) => res.data)
            .catch(() => null),
        ),
      );
      return results.filter((p): p is Product => Boolean(p));
    } catch {
      return [];
    }
  },
  {
    watch: [colorIds, currentItemId],
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

function getThumbUrlVariant(product: Product, position: number): string {
  const allImages = (product.images?.all || []) as any[];
  const index = Math.max(0, Number(position) - 1);
  const selectedImage = allImages[index] ?? productImageGetters.getFirstImage(product);
  return productImageGetters.getImageUrl(selectedImage) || '';
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
      return {
        itemId: id,
        label: productGetters.getName(p) || id,
        disabled: isNotAvailableVariant(p),
        thumbUrl: getThumbUrlVariant(p, 2),
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
  return (colorIds.value?.length || 0) > 0 && (colorVariants.value?.length || 0) > 1;
});

// Show only first 3 color variants
const displayedColorVariants = computed(() => {
  return colorVariants.value.slice(0, 3);
});

// Calculate remaining count
const remainingColorCount = computed(() => {
  const total = colorVariants.value.length;
  return total > 3 ? total - 3 : 0;
});

const navigateToColorVariant = (variant: ColorVariant) => {
  if (variant.disabled) return;
  const path = buildProductPathVariant(variant.product);
  navigateTo(path);
};

// ==============================
// Color Variants Logic - End
// ==============================

// ==============================
// Size Variants Logic - Start
// ==============================

type SizeVariant = {
  itemId: string;
  label: string;
  disabled: boolean;
  product: Product;
  hasProperty39: boolean;
  outOfStock: boolean;
  sizeValue: string;
};

// Extract size IDs from product properties (Property ID 62 = size variant IDs)
const sizeIds = computed(() => {
  if (!product.value) return [];
  const groups = (product.value as ProductWithVariationProperties).variationProperties;
  if (!Array.isArray(groups)) return [];

  for (const group of groups) {
    const properties = group?.properties;
    if (!Array.isArray(properties)) continue;
    for (const property of properties) {
      if (Number(property?.id ?? 0) !== 62) continue; // Property 62 contains size variant IDs
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

// Fetch size variant products (client-only to avoid SSR hydration mismatch)
const { data: fetchedSizeProducts } = useAsyncData<Product[]>(
  `productcard-size-variants-${currentItemId.value}`,
  async () => {
    if (!sizeIds.value?.length || !currentItemId.value) return [];
    try {
      const validIds = sizeIds.value.filter((id) => id && String(id).trim());
      if (!validIds.length) return [];

      const results = await Promise.all(
        validIds.map((id) =>
          useSdk()
            .plentysystems.getProduct({ id })
            .then((res: { data: Product }) => res.data)
            .catch(() => null),
        ),
      );
      return results.filter((p): p is Product => Boolean(p));
    } catch {
      return [];
    }
  },
  {
    watch: [sizeIds, currentItemId],
    default: () => [],
    server: false,
  },
);

// Extract size value (Property ID 44 = size text like S/M/L/XL) from product
function getSizeValue(product: Product): string {
  if (!product) return '';
  const groups = (product as ProductWithVariationProperties).variationProperties;
  if (!Array.isArray(groups)) return '';

  for (const group of groups) {
    const properties = group?.properties;
    if (!Array.isArray(properties)) continue;
    for (const property of properties) {
      // Property ID 44 contains the size TEXT (not IDs)
      if (Number(property?.id ?? 0) === 44) {
        const value = property?.values?.value;
        if (typeof value === 'string') return value;
      }
    }
  }
  return '';
}

// Build size variants
const sizeVariants = computed<SizeVariant[]>(() => {
  if (!product.value) return [];
  try {
    const fetchedSize = fetchedSizeProducts.value || [];
    const others = fetchedSize.filter((p) => String(productGetters.getItemId(p) || '') !== currentItemId.value);
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
      return {
        itemId: id,
        label: productGetters.getName(p) || id,
        disabled: isNotAvailableVariant(p),
        product: p,
        hasProperty39: hasProperty39Variant(p),
        outOfStock: hasNoStockVariant(p),
        sizeValue: getSizeValue(p) || '?',
      };
    });
  } catch {
    return [];
  }
});

const shouldShowSizeVariants = computed(() => {
  const hasIds = (sizeIds.value?.length || 0) > 0;
  const hasVariants = (sizeVariants.value?.length || 0) > 1;
  return hasIds && hasVariants;
});

// Show only first 3 size variants
const displayedSizeVariants = computed(() => {
  return sizeVariants.value.slice(0, 3);
});

// Calculate remaining count
const remainingSizeCount = computed(() => {
  const total = sizeVariants.value.length;
  return total > 3 ? total - 3 : 0;
});

const navigateToSizeVariant = (variant: SizeVariant) => {
  if (variant.disabled) return;
  const path = buildProductPathVariant(variant.product);
  navigateTo(path);
};

// ==============================
// Size Variants Logic - End
// ==============================
</script>
