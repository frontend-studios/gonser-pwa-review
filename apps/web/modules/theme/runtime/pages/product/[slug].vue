<template>
  <NuxtLayout name="default" :breadcrumbs="breadcrumbs">
    <div class="max-w-screen-2xl mx-auto product-page relative">
      <div class="product-layout pt-5 xl:pt-0">
        <div class="left-area">
          <div class="gallery-area px-5 xl:px-0 order-1 lg:order-none">
            <div class="fs-gallery">
              <!-- <Gallery :images="galleryImages" :configuration="galleryConfiguration" /> -->
              <FancyboxGallery
                :images="galleryImages"
                :product="product"
                :item-id="productGetters.getItemId(product)"
              />
            </div>
          </div>

          <div class="description-area px-5 xl:px-0 order-3 lg:order-none">
            <div v-if="itemTextContent" class="fs-item-text">
              <div
                ref="itemTextRef"
                class="relative overflow-hidden transition-[max-height] duration-500 ease-in-out-custom [&_h1]:!font-semibold [&_h2]:!font-semibold [&_h3]:!font-semibold [&_h3]:!mb-4 [&_h4]:!font-semibold [&_h5]:!font-semibold [&_h6]:!font-semibold"
                :class="{
                  'max-h-[150px] description-truncated': isCollapsed,
                  'max-h-[5000px]': !isCollapsed,
                }"
                v-html="itemTextContent"
              />

              <ClientOnly>
                <button
                  v-if="shouldTruncateItemText"
                  @click="toggleItemTextExpanded"
                  class="mt-3 flex items-center gap-2 transition-colors font-semibold"
                >
                  <span>{{ isTextExpanded ? t('theme.ProductPage.showLess') : t('theme.ProductPage.showMore') }}</span>
                  <SfIconExpandMore v-if="!isTextExpanded" class="w-5 h-5" />
                  <SfIconExpandLess v-else class="w-5 h-5" />
                </button>
              </ClientOnly>
            </div>
          </div>
        </div>

        <div class="right-area w-full relative px-5 xl:px-0 order-2 lg:order-none mt-1 lg:mt-0">
          <div class="flex justify-between items-center mb-2.5 min-h-[32px]">
            <!-- SALE Badges -->
            <div class="flex items-center gap-2">
              <div v-if="hasProperty39Current" class="sale-badge">
                <span class="inline-block px-3 py-1 text-white text-sm bg-red rounded-[20px]"> SALE </span>
              </div>
              <div v-if="discountPercentage > 0" class="discount-badge">
                <span class="inline-block px-3 py-1 text-white text-sm bg-red rounded-[20px]">
                  {{ t('theme.ProductPage.saving', { percentage: discountPercentage }) }}
                </span>
              </div>
            </div>

            <button
              type="button"
              class="wishlist-button shrink-0"
              :disabled="wishlistLoading"
              :aria-label="
                isWishlistItem(productVariationId)
                  ? t('common.actions.removeFromWishlist')
                  : t('common.actions.addToWishlist')
              "
              @click="toggleWishlist"
            >
              <SfIconFavorite
                :class="isWishlistItem(productVariationId) ? 'fill-red' : 'text-red'"
                class="w-6 h-6 transition-colors"
              />
            </button>
          </div>

          <h1 v-if="itemName" class="mb-4">
            {{ itemName }}
          </h1>

          <div class="flex justify-between items-center mb-4">
            <div
              v-if="totalReviews > 0"
              class="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
              @click="scrollToReviews"
            >
              <SfRating class="inline-block" size="sm" :max="5" :value="reviewAverageStars" :half-increment="true" />
              <span class="text-sm text-dark ml-1"> ({{ totalReviews }}) </span>
            </div>
            <UiEnergyLabel :product="product" position="inline" :size="50" />
          </div>

          <div class="fs-price flex items-end gap-2 mb-6">
            <span class="text-red flex items-end gap-2">
              <span class="h4 !font-medium text-black">{{ priceCurrency }}</span>
              <span class="h2">{{ priceAmount }}</span>
            </span>
            <span v-if="hasPriceStrikePrice" class="line-through text-gray-super-dark h4 !font-medium">
              {{ t('theme.ProductPage.insteadOfRRP') }} {{ strikePriceAmount }}
            </span>
          </div>

          <div class="product-attributes">
            <ProductAttributes :product="product" />
          </div>

          <ProductPseudoVariants :product="product" />

          <div ref="addToCartButtonRef" class="fs-add-to-basket mb-4">
            <div class="flex flex-row items-stretch gap-3">
              <UiQuantitySelector
                :min-value="productGetters.getMinimumOrderQuantity(product)"
                :value="quantitySelectorValue"
                class="w-auto min-w-[145px] flex-shrink-0"
                @change-quantity="changeQuantity"
              />

              <div
                v-if="showNotifyMe && !productGetters.isActiveVariationSalable(product)"
                class="flex-1 whitespace-nowrap notify-me-wrapper rounded-[40px] overflow-hidden"
              >
                <NotifyMe :variation-id="Number(productGetters.getVariationId(product))" />
              </div>
              <SfButton
                v-else
                type="button"
                size="lg"
                class="flex-1 !bg-green-600 hover:!bg-green-700 !rounded-[40px]"
                :disabled="loading || !productGetters.isSalable(product)"
                @click="handleAddToCart"
              >
                <template #prefix>
                  <div v-if="!loading" class="flex row items-center gap-2">
                    <span>{{ t('common.actions.addToCart') }}</span>
                  </div>
                  <div v-else>
                    <SfLoaderCircular size="sm" />
                  </div>
                </template>
              </SfButton>
            </div>
          </div>

          <div
            v-if="availabilityName"
            class="availability flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            :class="hasGreenAvailability ? 'mb-2' : 'mb-4'"
            @click="openAvailabilityModal"
          >
            <img :src="availabilityIcon" :alt="availabilityName" class="w-[18px] h-[18px]" />
            <span class="font-semibold">
              {{ availabilityName }}
            </span>
          </div>
          <div v-if="hasGreenAvailability" class="flex items-center gap-2 mb-6">
            <img
              :src="t('theme.ProductPage.specialUsp.usp.icon')"
              :alt="t('theme.ProductPage.specialUsp.usp.text')"
              class="w-5 h-5"
            /><span class="flex-1 text-base mb-0">{{ t('theme.ProductPage.specialUsp.usp.text') }}</span>
          </div>

          <div class="fs-usps bg-gray-light rounded-[10px] p-2.5 mb-4">
            <ul class="flex flex-col gap-1">
              <li
                v-for="(usp, index) in usps"
                :key="index"
                class="flex items-center gap-3 p-2"
                :class="{ 'bg-gray rounded-[5px] p-2': index === usps.length - 1 }"
              >
                <img :src="usp.icon" :alt="usp.alt" class="object-contain flex-shrink-0 w-5 h-5" />
                <span v-if="usp.key === 'usp5'" class="flex-1 text-base mb-0">
                  <span class="font-semibold">{{ t('theme.ProductPage.usps.usp5.textBold') }}</span>
                  {{ ' ' + t('theme.ProductPage.usps.usp5.textRest') }}
                </span>
                <span v-else class="flex-1 text-base mb-0">{{ usp.text }}</span>
              </li>
            </ul>
          </div>

          <!-- GonserBox Komponente - Desktop position (right column) -->
          <UiGonserBox :product="product" class="hidden lg:block mb-4" />
        </div>

        <!-- GonserBox Komponente - Mobile position (below description) -->
        <div class="block lg:hidden px-5 xl:px-0 mt-4 order-4 lg:order-none">
          <UiGonserBox :product="product" />
        </div>
      </div>

      <div v-if="xsellingDisplayProducts?.length > 0" class="fs-xselling mt-6 pl-5 xl:pl-0">
        <h3 class="mb-4">{{ t('theme.ProductPage.relatedProducts') }}</h3>

        <div class="relative">
          <div
            ref="xsellingSliderContainer"
            class="overflow-x-auto scroll-smooth flex gap-4 pb-4 snap-x snap-mandatory"
            @scroll="updateScrollButtonsXselling"
          >
            <div
              v-for="(xsellingProduct, index) in xsellingDisplayProducts"
              :key="productGetters.getVariationId(xsellingProduct)"
              class="flex-shrink-0 snap-start min-w-[155px] w-[calc((100%-1.5rem)/2.5)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-4rem)/5)]"
            >
              <ProductCard
                :product="xsellingProduct"
                :index="index"
                :lazy="index >= 5"
                :hide-recommended-retail-price="true"
                :hide-pseudo-variants="true"
                :show-add-to-cart="true"
                :add-to-cart-compact="true"
              />
            </div>
          </div>

          <ClientOnly>
            <button
              v-if="needsScrollButtonsXselling"
              :disabled="!canScrollLeftXselling"
              class="hidden md:block absolute left-0 -translate-x-1/2 top-1/4 -translate-y-1/2 rounded-full p-2 shadow-lg z-10 transition-all border"
              :class="{
                'cursor-not-allowed bg-white border-gray text-gray': !canScrollLeftXselling,
                'bg-gray-light border-gray-light text-black hover:bg-gray hover:border-gray': canScrollLeftXselling,
              }"
              @click="scrollLeftXselling"
            >
              <SfIconChevronLeft class="w-5 h-5" />
            </button>
            <button
              v-if="needsScrollButtonsXselling"
              :disabled="!canScrollRightXselling"
              class="hidden md:block absolute right-0 translate-x-1/2 top-1/4 -translate-y-1/2 rounded-full p-2 shadow-lg z-10 transition-all border"
              :class="{
                'cursor-not-allowed bg-white border-gray text-gray': !canScrollRightXselling,
                'bg-gray-light border-gray-light text-black hover:bg-gray hover:border-gray': canScrollRightXselling,
              }"
              @click="scrollRightXselling"
            >
              <SfIconChevronRight class="w-5 h-5" />
            </button>
          </ClientOnly>
        </div>
      </div>

      <div class="reviews-section mt-8 pl-5 xl:pl-0">
        <ReviewsAccordion :product="product" />
      </div>

      <UiReviewModal />
      <ProductLegalDetailsDrawer v-if="open" :product="product" />

      <div v-if="similarDisplayProducts?.length > 0" class="fs-xselling mt-6 pl-5 xl:pl-0">
        <h3 class="mb-4">{{ t('theme.ProductPage.similarProducts') }}</h3>

        <div class="relative">
          <div
            ref="similarSliderContainer"
            class="overflow-x-auto scroll-smooth flex gap-4 pb-4 snap-x snap-mandatory pr-5 xl:pr-0"
            @scroll="updateScrollButtonsSimilar"
          >
            <div
              v-for="(similarProduct, index) in similarDisplayProducts"
              :key="productGetters.getVariationId(similarProduct)"
              class="flex-shrink-0 snap-start min-w-[155px] w-[calc((100%-1.5rem)/2.5)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-4rem)/5)]"
            >
              <ProductCard
                :product="similarProduct"
                :index="index"
                :lazy="index >= 5"
                :hide-recommended-retail-price="true"
                :hide-pseudo-variants="true"
              />
            </div>
          </div>

          <ClientOnly>
            <button
              v-if="needsScrollButtonsSimilar"
              :disabled="!canScrollLeftSimilar"
              class="hidden md:block absolute left-0 -translate-x-1/2 top-1/4 -translate-y-1/2 rounded-full p-2 shadow-lg z-10 transition-all border"
              :class="{
                'cursor-not-allowed bg-white border-gray text-gray': !canScrollLeftSimilar,
                'bg-gray-light border-gray-light text-black hover:bg-gray hover:border-gray': canScrollLeftSimilar,
              }"
              @click="scrollLeftSimilar"
            >
              <SfIconChevronLeft class="w-5 h-5" />
            </button>
            <button
              v-if="needsScrollButtonsSimilar"
              :disabled="!canScrollRightSimilar"
              class="hidden md:block absolute right-0 translate-x-1/2 top-1/4 -translate-y-1/2 rounded-full p-2 shadow-lg z-10 transition-all border"
              :class="{
                'cursor-not-allowed bg-white border-gray text-gray': !canScrollRightSimilar,
                'bg-gray-light border-gray-light text-black hover:bg-gray hover:border-gray': canScrollRightSimilar,
              }"
              @click="scrollRightSimilar"
            >
              <SfIconChevronRight class="w-5 h-5" />
            </button>
          </ClientOnly>
        </div>
      </div>

      <!-- Recently Viewed Products -->
      <ClientOnly>
        <NuxtLazyHydrate when-visible>
          <div class="fs-xselling mt-6 pl-5 xl:pl-0">
            <!-- <UiRecentlyViewedProducts :max-items="10" :auto-fetch="true" layout="vertical" :show-empty="false" /> -->
            <UiRecentlyViewedProducts :max-items="10" :auto-fetch="true" layout="horizontal" :show-empty="false" />
          </div>
        </NuxtLazyHydrate>
      </ClientOnly>
    </div>

    <!-- Sticky Add to Cart -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="showStickyAddToCart && productGetters.isSalable(product)"
        class="block fixed bottom-4 left-0 right-0 z-50 mx-auto max-w-screen-2xl"
      >
        <div class="lg:w-[50%] xl:w-[40%] lg:max-w-[600px] lg:ml-auto">
          <div
            class="relative bg-[#F7F6F9] border border-[#ECEAEF] rounded-[10px] p-5"
            style="box-shadow: 0px 0px 20px 0px #00000026"
          >
            <div class="flex gap-2 sm:gap-4 items-stretch">
              <!-- Product Image -->
              <div
                class="self-stretch flex basis-[144px] max-w-[144px] min-w-0 shrink lg:min-w-[144px] lg:shrink-0 overflow-hidden"
              >
                <NuxtImg
                  :src="imageUrl"
                  :alt="imageAlt"
                  width="144"
                  height="144"
                  class="h-full w-full max-h-[144px] max-w-[144px] object-contain rounded-md border-[#ECEAEF]"
                  loading="lazy"
                />
              </div>

              <!-- Info + Badge Container (mobile: column, desktop: row) -->
              <div class="flex flex-col lg:flex-row flex-1 min-w-0 gap-1.5 lg:gap-4">
                <!-- Spare Badge (mobile: oben, desktop: rechts) -->
                <div class="lg:order-2 lg:self-start">
                  <div
                    v-if="discountPercentage > 0"
                    class="px-2 py-1 text-white text-xs bg-red rounded-full w-fit"
                  >
                    {{ t('theme.ProductPage.saving', { percentage: discountPercentage }) }}
                  </div>
                </div>

                <!-- Product Info & Button (mobile: unten, desktop: links) -->
                <div
                  class="flex h-[144px] flex-col justify-between gap-1.5 lg:h-auto lg:gap-2 flex-1 min-w-0 lg:order-1 lg:justify-between"
                >
                  <!-- Title -->
                  <h3 class="text-sm font-semibold line-clamp-2">{{ itemName }}</h3>

                  <!-- Price -->
                  <div class="flex flex-nowrap items-baseline gap-1 lg:gap-2 whitespace-nowrap">
                    <span class="inline-flex items-baseline text-[#D4001C] shrink-0 whitespace-nowrap">
                      <span class="text-sm font-normal leading-none">{{ priceCurrency }}</span>
                      <h4 class="text-lg sm:text-xl font-semibold ml-1 leading-none">{{ priceAmount }}</h4>
                    </span>
                    <span
                      v-if="hasPriceStrikePrice"
                      class="inline-flex items-baseline text-sm font-normal text-gray-super-dark shrink-0 whitespace-nowrap leading-none"
                    >
                      {{ t('theme.ProductPage.insteadOfRRP') }} {{ strikePriceAmount }}
                    </span>
                  </div>

                  <!-- Add to Cart Button -->
                  <SfButton
                    type="button"
                    size="sm"
                    class="self-start !w-auto !bg-green-600 hover:!bg-green-700 !rounded-[40px] px-[30px] py-[5px]"
                    :disabled="loading || !productGetters.isSalable(product)"
                    @click="handleAddToCart"
                  >
                    <template #prefix>
                      <div v-if="!loading" class="flex row items-center gap-2">
                        <span class="text-sm">{{ t('common.actions.addToCart') }}</span>
                      </div>
                      <div v-else>
                        <SfLoaderCircular size="sm" />
                      </div>
                    </template>
                  </SfButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Availability Modal -->
    <AvailabilityModal :model-value="isAvailabilityModalOpen" @close="closeAvailabilityModal" />
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Product, ApiError } from '@plentymarkets/shop-api';
import type { WatchStopHandle } from 'vue';

import { cartGetters, productGetters, productImageGetters, productPropertyGetters } from '@plentymarkets/shop-api';
import {
  SfIconShoppingCart,
  SfLoaderCircular,
  SfButton,
  SfIconExpandMore,
  SfIconExpandLess,
  SfIconFavorite,
  SfRating,
  SfIconChevronLeft,
  SfIconChevronRight,
} from '@storefront-ui/vue';
import { useGonserBoxProperty } from '../../composables/useGonserBoxProperty/useGonserBoxProperty';
import { useGonserBoxCart } from '../../composables/useGonserBoxCart/useGonserBoxCart';
import FancyboxGallery from '../../components/ui/FancyboxGallery/FancyboxGallery.vue';
import ProductPseudoVariants from '../../components/ui/ProductPseudoVariants/ProductPseudoVariants.vue';
import { useRecentlyViewed } from '../../composables/useRecentlyViewed/useRecentlyViewed';
import GonserBox from '../../components/ui/GonserBox/GonserBox.vue';
import AvailabilityModal from '../../components/ui/AvailabilityModal/AvailabilityModal.vue';
// Theme Product Import
import ProductCard from '../../components/ui/ProductCard/ProductCard.vue';

definePageMeta({
  layout: false,
  path: '/:slug*:sep(/a-|_):itemId',
  validate: async (route) => {
    return validateProductParams(route.params);
  },
  type: 'product',
  isBlockified: false,
  identifier: 0,
});

import type { Locale } from '#i18n';

defineI18nRoute({
  locales: process.env.LANGUAGELIST?.split(',') as Locale[],
});

const route = useRoute();
const { setCurrentProduct, currentProduct } = useProducts();
const { setBlocksListContext } = useBlocksList();
const { setProductMetaData, setProductRobotsMetaData, setProductCanonicalMetaData } = useStructuredData();
const { buildProductLanguagePath } = useLocalization();
const { productParams, productId } = createProductParams(route.params);
const { productForEditor, fetchProduct, setProductMeta, setBreadcrumbs, breadcrumbs } = useProduct(productId);
const product = productForEditor;
const { disableActions } = useEditor();
const productReviewsComposable = useProductReviews(Number(productId));
const { fetchProductReviews, fetchProductAuthenticatedReviews } = productReviewsComposable;
const productReviews = productReviewsComposable.data;
const { open } = useProductLegalDetailsDrawer();
const { setPageMeta } = usePageMeta();
const { data: similarProducts, fetchProductRecommended: fetchSimilarProducts } =
  useProductRecommended('similar-products');
const similarReviewsLoaded = ref(false);
const similarReviewMap = ref<Record<number, { feedbackCount: string; feedbackDecimal: string }>>({});
const { resetNotification } = useEditModeNotification(disableActions);
const { isAuthorized } = useCustomer();
const { addProduct: addToRecentlyViewed } = useRecentlyViewed();

const config = useRuntimeConfig().public;
const { variationId } = useProductAttributes();
let variationWatchHandler: WatchStopHandle | undefined;

const showRecommended = ref(false);
const recommendedSection = ref<HTMLElement | null>(null);
const productName = computed(() => productGetters.getName(product.value));
const itemName = computed(() => productGetters.getName(product.value));

// Sticky Add to Cart Logic
const addToCartButtonRef = ref<HTMLElement | null>(null);
const showStickyAddToCart = ref(false);
const hasSeenAddToCartButton = ref(false);
let addToCartObserver: IntersectionObserver | null = null;

// Availability data
const availabilityId = computed(() => {
  if (!product.value?.variation?.availability?.id) return 0;
  return Number(product.value.variation.availability.id) || 0;
});

const availabilityName = computed(() => {
  if (!product.value) return '';
  const name = productGetters.getAvailabilityName(product.value);
  return name || '';
});

const getAvailabilityIconUrl = (availabilityId: number): string => {
  const id = Number(availabilityId) || 0;
  if (id === 1 || id === 3) return t('theme.availability.iconGreen');
  if (id === 10) return t('theme.availability.iconRed');
  if (id > 0 && id < 7) return t('theme.availability.iconOrange');
  return t('theme.availability.iconOrange');
};

const availabilityIcon = computed(() => getAvailabilityIconUrl(availabilityId.value));
const hasGreenAvailability = computed(() => {
  const id = availabilityId.value;
  return id === 1 || id === 3;
});

// Availability Modal
const isAvailabilityModalOpen = ref(false);
const openAvailabilityModal = () => {
  isAvailabilityModalOpen.value = true;
};
const closeAvailabilityModal = () => {
  isAvailabilityModalOpen.value = false;
};

const icon = 'sell';
setPageMeta(productName.value, icon);

await fetchProduct(productParams).then(() => {
  usePlentyEvent().emit('frontend:productLoaded', {
    product: product.value,
  });
});

if (Object.keys(product.value).length === 0) {
  if (import.meta.client) showError({ statusCode: 404, statusMessage: 'Product not found' });

  throw createError({
    statusCode: 404,
    statusMessage: 'Product not found',
  });
}

setCurrentProduct(productForEditor.value || ({} as Product));
setProductMeta();
setBlocksListContext('product');
setBreadcrumbs();

// Track product view for "Recently Viewed"
if (product.value && Object.keys(product.value).length > 0) {
  addToRecentlyViewed(product.value);
}

async function fetchReviews() {
  if (!product.value) return;
  try {
    const itemId = productGetters.getItemId(product.value);
    if (!itemId) return;

    const productVariationId = productGetters.getVariationId(product.value) || 0;
    await fetchProductReviews(Number(itemId), productVariationId);
    if (isAuthorized.value) {
      await fetchProductAuthenticatedReviews(Number(itemId), productVariationId);
    }
  } catch (error) {
    // Reviews are not critical - fail silently
  }
}
await fetchReviews();

// Load Similar Cross-Selling products - watch for product to be loaded
watch(
  () => product.value,
  async (productData) => {
    if (productData && Object.keys(productData).length > 0) {
      const itemId = productGetters.getItemId(productData);
      if (itemId) {
        try {
          await fetchSimilarProducts({
            type: 'cross_selling',
            itemId: String(itemId),
            categoryId: '',
            crossSellingRelation: 'Similar',
            itemsPerPage: 20,
          });
        } catch (error) {
          // Silent fail
        }
      }
    }
  },
  { immediate: true },
);

// Lade Review-Daten für Similar Products CLIENT-ONLY
watch(
  similarProducts,
  async (products) => {
    // Nur im Browser ausführen
    if (!import.meta.client) {
      return;
    }
    if (!products || products.length === 0) {
      similarReviewsLoaded.value = true; // Keine Produkte = sofort ready
      return;
    }

    similarReviewsLoaded.value = false; // Loading start

    await Promise.all(
      products.map(async (product) => {
        if (!product.item?.id) return;

        const itemId = product.item.id;
        try {
          const reviewResponse = await useSdk().plentysystems.getReview({
            itemId: Number(itemId),
            feedbacksPerPage: 1,
            page: 1,
          });

          if (reviewResponse.data?.counts) {
            similarReviewMap.value[itemId] = {
              feedbackCount: String(reviewResponse.data.counts.ratingsCountTotal || 0),
              feedbackDecimal: String(Number(reviewResponse.data.counts.averageValue) || 0),
            };
          }
        } catch (error) {
          // Review errors nicht kritisch - silent fail
        }
      }),
    );

    similarReviewsLoaded.value = true; // Loading complete
  },
  { immediate: true },
);

watch(
  disableActions,
  () => {
    setCurrentProduct(productForEditor.value || ({} as Product));
  },
  { immediate: true },
);

/* TODO: This should only be temporary.
 *  It changes the url of the product page while on the page and switching the locale.
 *  Should be removed when the item search is refactored.
 */
watch(
  () => product.value.texts.urlPath,
  (value, oldValue) => {
    if (value !== oldValue) {
      navigateTo({
        path: buildProductLanguagePath(
          `/${productGetters.getUrlPath(product.value)}_${productGetters.getItemId(product.value)}`,
        ),
        query: route.query,
        replace: true,
      });
    }
  },
);

watch(
  () => product.value,
  () => {
    setProductCanonicalMetaData(product.value);
    setProductMetaData(product.value);
    setProductRobotsMetaData(product.value);
  },
  { immediate: true },
);

watch(
  () => route.params,
  () => {
    const productName = computed(() => productGetters.getName(product.value));
    const icon = 'sell';
    setPageMeta(productName.value, icon);
  },
  { immediate: true },
);

const observeRecommendedSection = () => {
  if (import.meta.client && recommendedSection.value) {
    const observer = new globalThis.IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          showRecommended.value = true;
          observer.disconnect();
        }
      },
      {
        threshold: 0,
        rootMargin: '0px 0px 250px 0px',
      },
    );
    observer.observe(recommendedSection.value);
  }
};

async function handleVariationChange() {
  if (Number(productParams.variationId) !== variationId.value && variationId.value > 0) {
    try {
      productParams.variationId = variationId.value;
      await fetchProduct(productParams);
      setCurrentProduct(productForEditor.value || ({} as Product));
      await fetchReviews();
      setProductMetaData(product.value);
    } catch (error) {
      useHandleError(error as ApiError);
    }
  }
}

const observeAddToCartButton = () => {
  if (import.meta.client && addToCartButtonRef.value) {
    // Cleanup existing observer if any
    if (addToCartObserver) {
      addToCartObserver.disconnect();
    }

    addToCartObserver = new window.IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          // Track if the button has been seen at least once
          if (entry.isIntersecting) {
            hasSeenAddToCartButton.value = true;
          }

          // Only show sticky button if:
          // 1. The original button has been seen before (user scrolled to it)
          // 2. AND it's currently not visible (user scrolled away)
          // 3. AND the button is BELOW the viewport (not above)
          const isButtonBelowViewport = entry.boundingClientRect.top > 0;
          showStickyAddToCart.value = hasSeenAddToCartButton.value && !entry.isIntersecting && !isButtonBelowViewport;
        }
      },
      {
        threshold: 0,
        rootMargin: '0px',
      },
    );
    addToCartObserver.observe(addToCartButtonRef.value);
  }
};

const scrollToReviews = () => {
  if (import.meta.client) {
    const reviewsSection = document.querySelector('.reviews-section');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};

onBeforeRouteLeave(() => {
  resetNotification();
  if (variationWatchHandler) {
    variationWatchHandler();
  }
  // Cleanup IntersectionObserver
  if (addToCartObserver) {
    addToCartObserver.disconnect();
    addToCartObserver = null;
  }
});

onUnmounted(() => {
  // Cleanup IntersectionObserver on unmount
  if (addToCartObserver) {
    addToCartObserver.disconnect();
    addToCartObserver = null;
  }
});

onNuxtReady(() => {
  observeRecommendedSection();
  observeAddToCartButton();
  if (useCallisto().isEnabled) {
    variationWatchHandler = watch(variationId, handleVariationChange);
  }
});

/* Custom FS Scripts */

// ==============================
// Gallery Logic - Start
// ==============================
const galleryImages = computed(() => {
  if (!product.value) return [];
  const allImages = product.value.images?.all || [];
  return allImages;
});

// const galleryConfiguration = computed(() => ({
//   thumbnails: {
//     showThumbnails: true,
//     thumbnailType: 'left-vertical' as const,
//     enableHoverZoom: true,
//   },
//   layout: {
//     fullWidth: false,
//   },
// }));

// Image URL and Alt for Sticky Button
const imageUrl = computed(() => {
  if (!product.value) return '';
  const coverImage = productGetters.getCoverImage(product.value);
  return coverImage || '';
});

const imageAlt = computed(() => {
  if (!product.value) return '';
  return productGetters.getName(product.value) || '';
});

// Article Number
const articleNumber = computed(() => {
  if (!currentProduct.value?.item?.id) return '';
  return String(currentProduct.value.item.id);
});

// ==============================
// Gallery Logic - Ende
// ==============================

// ==============================
// Wishlist Logic - Start
// ==============================

const { isWishlistItem, interactWithWishlist, loading: wishlistLoading } = useWishlist();

const productVariationId = computed(() => productGetters.getVariationId(product.value));

const toggleWishlist = async () => {
  await interactWithWishlist(productVariationId.value, quantitySelectorValue.value);
};

// ==============================
// Wishlist Logic - Ende
// ==============================

// ==============================
// FSPrice Logic - Start
// ==============================

const { format } = usePriceFormatter();

// Custom Format Function: "CHF xx.xx" (mit Punkt als Dezimaltrennzeichen)
const formatCustomPrice = (price: number): string => {
  const numPrice = Number(price) || 0;
  if (numPrice <= 0) return '';
  return `CHF ${numPrice.toFixed(2)}`;
};

// Workaround für Backend-Preise mit 3 Dezimalstellen
const price = computed(() => {
  if (!product.value) return 0;
  try {
    const { price: rawPrice } = useProductPrice(product.value);
    const priceValue = Number(rawPrice.value) || 0;
    return Math.floor(priceValue * 100) / 100;
  } catch {
    return 0;
  }
});

const crossedPrice = computed(() => {
  if (!product.value) return null;
  try {
    const { crossedPrice: rawCrossedPrice } = useProductPrice(product.value);
    const crossedValue = Number(rawCrossedPrice.value) || 0;
    return crossedValue > 0 ? Math.floor(crossedValue * 100) / 100 : null;
  } catch {
    return null;
  }
});

const formattedPrice = computed(() => {
  const priceValue = Number(price.value) || 0;
  if (priceValue <= 0) return '';
  return format(priceValue);
});

const formattedStrikePrice = computed(() => {
  const strikeValue = Number(crossedPrice.value) || 0;
  if (strikeValue <= 0) return '';
  return format(strikeValue);
});

// Custom formatted versions (CHF xx.xx)
const formattedPriceCustom = computed(() => {
  const priceValue = Number(price.value) || 0;
  if (priceValue <= 0) return '';
  return formatCustomPrice(priceValue);
});

const formattedStrikePriceCustom = computed(() => {
  const strikeValue = Number(crossedPrice.value) || 0;
  if (strikeValue <= 0) return '';
  return strikeValue.toFixed(2);
});

// Separate currency and amount for flexible display
const priceCurrency = computed(() => cartGetters.getCurrency(cart.value) || 'CHF');
const priceAmount = computed(() => {
  const priceValue = Number(price.value) || 0;
  if (priceValue <= 0) return '';
  return priceValue.toFixed(2);
});

const strikePriceAmount = computed(() => {
  const strikeValue = Number(crossedPrice.value) || 0;
  if (strikeValue <= 0) return '';
  return strikeValue.toFixed(2);
});

const hasPriceStrikePrice = computed(() => {
  return !!crossedPrice.value && crossedPrice.value > 0;
});

// Discount percentage calculation (ganze Zahlen, abgerundet)
const discountPercentage = computed(() => {
  if (!hasPriceStrikePrice.value) return 0;
  const crossed = Number(crossedPrice.value) || 0;
  const current = Number(price.value) || 0;
  if (crossed <= 0 || current <= 0 || crossed <= current) return 0;
  const discount = ((crossed - current) / crossed) * 100;
  return Math.floor(discount);
});

// ==============================
// FSPrice Logic - Ende
// ==============================

// ==============================
// SALE BADGE - START
// ==============================

const hasProperty39Current = computed(() => {
  if (!product.value) return false;
  const groups = (product.value as any).variationProperties;
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
});

// ==============================
// SALE BADGE - ENDE
// ==============================

// ==============================
// FSPseudoVariants Logic - Start
// ==============================

const handleResize = () => {
  updateScrollButtonsXselling();
  updateScrollButtonsSimilar();
};

onMounted(() => {
  setTimeout(() => {
    updateScrollButtonsXselling();
    updateScrollButtonsSimilar();
  }, 100);

  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);

  if (xsellingSliderContainer.value) {
    xsellingSliderContainer.value.removeEventListener('scroll', updateScrollButtonsXselling);
  }
  if (similarSliderContainer.value) {
    similarSliderContainer.value.removeEventListener('scroll', updateScrollButtonsSimilar);
  }
});

// ==============================
// FSPseudoVariants Logic - Ende
// ==============================

// ==============================
// FSAddToBasket Logic - Start
// ==============================

const { t } = useI18n();
const { getCombination } = useProductAttributes();
const { getPropertiesForCart } = useProductOrderProperties();
const { validateAllFields, invalidFields, resetInvalidFields } = useValidatorAggregator('properties');
const {
  validateAllFields: validateAllFieldsAttributes,
  invalidFields: invalidAttributeFields,
  resetInvalidFields: resetAttributeFields,
} = useValidatorAggregator('attributes');
const { send } = useNotification();
const { addToCart, loading, data: cart, setCartItemQuantity } = useCart();
const { openQuickCheckout } = useQuickCheckout();
const { getGonserBoxPropertyParam } = useGonserBoxProperty();
const { getSetting: getNotifyMeSetting } = useSiteSettings('showNotifyMe');
const showNotifyMe = computed(() => getNotifyMeSetting().toString() === 'true');

const quantitySelectorValue = ref(productGetters.getMinimumOrderQuantity(product.value) || 1);

const handleValidationErrors = (): boolean => {
  send({
    message: [
      t('error.missingOrWrongProperties'),
      '',
      ...invalidAttributeFields.value.map((field) => field.name),
      ...invalidFields.value.map((field) => field.name),
      '',
      t('error.pleaseFillOutAllFields'),
    ],
    type: 'negative',
  });
  return false;
};

const handleAddToCart = async () => {
  await validateAllFieldsAttributes();
  await validateAllFields();

  if (invalidFields.value.length > 0 || invalidAttributeFields.value.length > 0) {
    return handleValidationErrors();
  }

  if (!getCombination()) {
    send({ message: t('product.attributes.notValidVariation'), type: 'negative' });
    return false;
  }

  let basketParams = getPropertiesForCart() || [];

  const gonserBoxParam = getGonserBoxPropertyParam(product.value);
  if (gonserBoxParam) {
    basketParams = [...basketParams, gonserBoxParam];
  }

  const productId = Number(productGetters.getId(product.value));
  const quantityToAdd = Number(quantitySelectorValue.value);

  // Check if product with same properties already exists in cart
  const existingCartItem = cart.value?.items?.find((item) => {
    // Match by variationId
    if (item.variationId !== productId) return false;

    // If no params, item must also have no params (or empty params)
    if (!basketParams || basketParams.length === 0) {
      return !item.basketItemOrderParams || item.basketItemOrderParams.length === 0;
    }

    // If params exist, compare them
    if (!item.basketItemOrderParams || item.basketItemOrderParams.length !== basketParams.length) {
      return false;
    }

    // Compare each param
    return basketParams.every((param) => {
      return item.basketItemOrderParams?.some((itemParam) => {
        return (
          Number(itemParam.propertyId) === Number(param.property.id) &&
          String(itemParam.value) === String(param.property.value)
        );
      });
    });
  });

  let addedToCart = false;

  if (existingCartItem) {
    // Product with same properties exists, increase quantity
    const newQuantity = existingCartItem.quantity + quantityToAdd;
    await setCartItemQuantity({
      cartItemId: existingCartItem.id,
      productId: productId,
      quantity: newQuantity,
    });
    addedToCart = true;
  } else {
    // Product doesn't exist or has different properties, add new
    addedToCart = await addToCart({
      productId: productId,
      quantity: quantityToAdd,
      basketItemOrderParams: basketParams.length > 0 ? basketParams : undefined,
    });
  }

  if (addedToCart) {
    openQuickCheckout(product.value, quantitySelectorValue.value);
  }

  return addedToCart;
};

const changeQuantity = (quantity: string) => {
  quantitySelectorValue.value = Number(quantity);
};
// ==============================
// FSAddToBasket Logic - Ende
// ==============================

// ==============================
// Truncated Description - Start
// ==============================

// Description Content
const itemTextContent = computed(() => {
  if (!product.value) return '';
  const description = productGetters.getDescription(product.value) || '';
  const articleNum = articleNumber.value;

  if (!articleNum) return description;

  // Füge Artikelnummer am Ende der Beschreibung hinzu
  const articleHtml = `<div style="font-weight: 600;"><span>${t('theme.ProductPage.articleNumber')}:</span> ${articleNum}</div>`;

  return description + articleHtml;
});

// Truncation State
const itemTextRef = ref<HTMLElement | null>(null);
const isTextExpanded = ref(false);
const shouldTruncateItemText = ref(true); // Standard: truncated (FOUC-Prevention + SEO)
const maxDescriptionHeight = 150; // px

// Computed: Ist aktuell collapsed?
const isCollapsed = computed(() => shouldTruncateItemText.value && !isTextExpanded.value);

// Toggle expanded/collapsed
const toggleItemTextExpanded = () => {
  isTextExpanded.value = !isTextExpanded.value;
};

// Prüfe ob Truncation notwendig ist (nur Client-seitig)
const checkIfTruncationNeeded = () => {
  if (!itemTextRef.value) return;

  try {
    const element = itemTextRef.value;

    // Temporär constraints entfernen für genaue Messung
    const originalMaxHeight = element.style.maxHeight;
    const originalClasses = element.className;

    element.style.maxHeight = 'none';
    element.className = element.className.replace(/max-h-\[\d+px\]/g, '');

    // Volle Höhe messen
    const fullHeight = element.scrollHeight;

    // Wiederherstellen
    element.style.maxHeight = originalMaxHeight;
    element.className = originalClasses;

    // Entscheidung: Truncation nötig?
    shouldTruncateItemText.value = fullHeight > maxDescriptionHeight;
  } catch (error) {
    // Fallback: truncated lassen (sicherer für SSR)
    shouldTruncateItemText.value = true;
  }
};

// Setup: Prüfung nach Mount & Watch für Content-Änderungen
onMounted(() => {
  // Description Truncation Check nach Rendering
  nextTick(() => {
    checkIfTruncationNeeded();
  });

  // Watch für Content-Änderungen (z.B. Sprachwechsel)
  watch(
    () => itemTextContent.value,
    () => {
      nextTick(() => {
        checkIfTruncationNeeded();
      });
    },
  );
});

// ==============================
// Truncated Description - Ende
// ==============================

// ==============================
// FSUsps Logic - Start
// ==============================

const { hasGonserBoxProperty } = useGonserBoxProperty();
const { gonserBoxTotal } = useGonserBoxCart();

const isGonserBoxProduct = computed(() => {
  if (!product.value) return false;
  return hasGonserBoxProperty(product.value);
});

const isGonserBoxThresholdReached = computed(() => {
  return gonserBoxTotal.value >= 35;
});

const dynamicUsp3Text = computed(() => {
  if (isGonserBoxProduct.value && !isGonserBoxThresholdReached.value) {
    return t('theme.ProductPage.usps.usp3.text');
  }
  return t('theme.ProductPage.usps.usp3.shortText');
});

const usps = computed(() => {
  try {
    const uspKeys = ['usp1', 'usp2', 'usp3', 'usp4', 'usp5'];
    return uspKeys
      .map((key) => {
        let text = t(`theme.ProductPage.usps.${key}.text`);
        const icon = t(`theme.ProductPage.usps.${key}.icon`);

        // USP3 dynamisch anpassen
        if (key === 'usp3') {
          text = dynamicUsp3Text.value;
        }

        if (key === 'usp5') {
          text = `${t('theme.ProductPage.usps.usp5.textBold')} ${t('theme.ProductPage.usps.usp5.textRest')}`;
        }

        return {
          key,
          text: String(text || ''),
          icon: String(icon || ''),
          alt: String(text || ''),
        };
      })
      .filter(
        (usp) =>
          usp.text &&
          usp.text.trim() !== '' &&
          !usp.text.includes('theme.ProductPage.usps') &&
          usp.icon &&
          usp.icon.trim() !== '' &&
          !usp.icon.includes('theme.ProductPage.usps'),
      );
  } catch {
    return [];
  }
});

// ==============================
// FSUsps Logic - Ende
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

const currentItemId = computed(() => {
  if (!product.value) return '';
  const id = productGetters.getItemId(product.value);
  return id ? String(id) : '';
});

// ==============================
// FSXselling Logic - Start (Zubehör (id,id,id...) aus Property 63)
// ==============================

const xsellingPropertyId = 63;
const XS_PRODUCT_BATCH_ENDPOINT = '/api/product-card-swatches';

const xsellingPropertyItemIds = computed<string[]>(() => {
  const product = currentProduct.value as ProductWithVariationProperties | null;
  const groups = product?.variationProperties;

  if (!Array.isArray(groups)) return [];

  for (const group of groups) {
    const properties = group?.properties;
    if (!Array.isArray(properties)) continue;

    const hit = properties.find((p) => Number(p?.id ?? 0) === xsellingPropertyId);
    const raw = hit?.values?.value;

    if (typeof raw !== 'string') continue;

    const ids = raw
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    return ids;
  }

  return [];
});

const { data: xsellingProducts } = useAsyncData<Product[]>(
  () => `fs-xselling-property-${currentItemId.value}-${xsellingPropertyId}-${xsellingPropertyItemIds.value.join(',')}`,
  async () => {
    if (!xsellingPropertyItemIds.value.length || !currentItemId.value) return [];

    try {
      const normalizedSourceIds = xsellingPropertyItemIds.value
        .map((id) => String(id || '').trim())
        .filter((id) => id !== '');

      const validIds = Array.from(
        new Set(normalizedSourceIds.filter((id) => id && /^\d+$/.test(id) && id !== currentItemId.value)),
      );

      const skippedIdsCount = Math.max(0, normalizedSourceIds.length - validIds.length);

      if (!validIds.length) return [];

      let variantsById: Record<string, Product | null> = {};
      try {
        const response = await fetch(XS_PRODUCT_BATCH_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'same-origin',
          body: JSON.stringify({ itemIds: validIds }),
        });

        if (!response.ok) {
          throw new Error(`X-selling batch request failed with status ${response.status}`);
        }

        const body = (await response.json()) as {
          variants?: Record<string, Product | null>;
        };

        variantsById = body.variants || {};
      } catch (error) {
        return [];
      }

      const missingItemIds: string[] = [];
      const products: Product[] = [];

      for (const itemId of validIds) {
        const resolvedProduct = variantsById[itemId] || null;
        if (!resolvedProduct) {
          missingItemIds.push(itemId);
          continue;
        }

        // Initiale Default-Werte werden über xsellingReviewMap bereitgestellt (kein Cache-Mutation)
        products.push(resolvedProduct);
      }

      // Intentionally keep local counters for potential future diagnostics.
      void skippedIdsCount;
      void missingItemIds;

      // Filtere null-Werte (fehlgeschlagene Requests) und behalte die Reihenfolge bei
      return products;
    } catch (error) {
      return [];
    }
  },
  {
    watch: [xsellingPropertyItemIds, currentItemId],
    default: () => [],
  },
);

// Track ob Reviews geladen wurden
const xsellingReviewsLoaded = ref(false);
const xsellingReviewMap = ref<Record<number, { feedbackCount: string; feedbackDecimal: string }>>({});

// Lade Review-Daten CLIENT-ONLY (Review API ist nicht SSR-kompatibel)
watch(
  xsellingProducts,
  async (products) => {
    // Nur im Browser ausführen
    if (!import.meta.client) {
      return;
    }
    if (!products || products.length === 0) {
      xsellingReviewsLoaded.value = true; // Keine Produkte = sofort ready
      return;
    }

    xsellingReviewsLoaded.value = false; // Loading start

    await Promise.all(
      products.map(async (product) => {
        if (!product.item?.id) return;

        const itemId = product.item.id;
        try {
          const reviewResponse = await useSdk().plentysystems.getReview({
            itemId: Number(itemId),
            feedbacksPerPage: 1,
            page: 1,
          });

          if (reviewResponse.data?.counts) {
            xsellingReviewMap.value[itemId] = {
              feedbackCount: String(reviewResponse.data.counts.ratingsCountTotal || 0),
              feedbackDecimal: String(Number(reviewResponse.data.counts.averageValue) || 0),
            };
          }
        } catch (error) {
          // Review errors nicht kritisch - silent fail
        }
      }),
    );

    xsellingReviewsLoaded.value = true; // Loading complete
  },
  { immediate: true },
);

const xsellingDisplayProducts = computed(() => {
  try {
    const reviewMap = xsellingReviewMap.value;
    const products = (xsellingProducts.value || []).map((p) => {
      if (!p.item?.id) return p;
      const review = reviewMap[p.item.id];
      if (!review) return p;
      return {
        ...p,
        item: { ...p.item, feedbackCount: review.feedbackCount, feedbackDecimal: review.feedbackDecimal },
      };
    });
    // Filtere nur sofort verfügbare Produkte (availabilityId 1 oder 3 = grün)
    const filtered = products.filter((product) => {
      const availId = product.variation?.availabilityId ?? 0;
      return availId === 1 || availId === 3;
    });
    // Sortiere nach Verfügbarkeit: ID 1 (sofort) vor ID 3 (verfügbar)
    const sorted = filtered.sort((a, b) => {
      const availA = a.variation?.availabilityId ?? 0;
      const availB = b.variation?.availabilityId ?? 0;
      return availA - availB; // 1 kommt vor 3
    });
    return sorted;
  } catch (error) {
    return [];
  }
});

const xsellingSliderContainer = ref<HTMLElement | null>(null);
const canScrollLeftXselling = ref(false);
const canScrollRightXselling = ref(false);
const needsScrollButtonsXselling = ref(false);

const updateScrollButtonsXselling = () => {
  if (!xsellingSliderContainer.value) {
    return;
  }
  const container = xsellingSliderContainer.value;
  const hasScroll = container.scrollWidth > container.clientWidth + 5;
  needsScrollButtonsXselling.value = hasScroll;
  canScrollLeftXselling.value = container.scrollLeft > 5;
  canScrollRightXselling.value = container.scrollLeft < container.scrollWidth - container.clientWidth - 5;
};

const scrollLeftXselling = () => {
  if (!xsellingSliderContainer.value) return;
  xsellingSliderContainer.value.scrollBy({ left: -300, behavior: 'smooth' });
  setTimeout(updateScrollButtonsXselling, 300);
};

const scrollRightXselling = () => {
  if (!xsellingSliderContainer.value) return;
  xsellingSliderContainer.value.scrollBy({ left: 300, behavior: 'smooth' });
  setTimeout(updateScrollButtonsXselling, 300);
};

watch(
  () => xsellingDisplayProducts.value?.length,
  async (hasProducts) => {
    if (hasProducts) {
      await nextTick();
      updateScrollButtonsXselling();
      if (xsellingSliderContainer.value) {
        xsellingSliderContainer.value.addEventListener('scroll', updateScrollButtonsXselling, { passive: true });
      }
    }
  },
);

// ==============================
// FSXselling Logic - Ende
// ==============================

// ==============================
// Similar Cross-Selling Slider Logic
// ==============================

// Filtere nur sofort verfügbare Produkte
const similarDisplayProducts = computed(() => {
  try {
    const reviewMap = similarReviewMap.value;
    const products = (similarProducts.value || []).map((p) => {
      if (!p.item?.id) return p;
      const review = reviewMap[p.item.id];
      if (!review) return p;
      return {
        ...p,
        item: { ...p.item, feedbackCount: review.feedbackCount, feedbackDecimal: review.feedbackDecimal },
      };
    });
    // Filtere nur sofort verfügbare Produkte (availabilityId 1 oder 3 = grün)
    const filtered = products.filter((product) => {
      const availId = product.variation?.availabilityId ?? 0;
      return availId === 1 || availId === 3;
    });
    // Sortiere nach Verfügbarkeit: ID 1 (sofort) vor ID 3 (verfügbar)
    const sorted = filtered.sort((a, b) => {
      const availA = a.variation?.availabilityId ?? 0;
      const availB = b.variation?.availabilityId ?? 0;
      return availA - availB; // 1 kommt vor 3
    });
    return sorted;
  } catch (error) {
    return [];
  }
});

const similarSliderContainer = ref<HTMLElement | null>(null);
const canScrollLeftSimilar = ref(false);
const canScrollRightSimilar = ref(false);
const needsScrollButtonsSimilar = ref(false);

const updateScrollButtonsSimilar = () => {
  if (!similarSliderContainer.value) {
    return;
  }
  const container = similarSliderContainer.value;
  const hasScroll = container.scrollWidth > container.clientWidth + 5;
  needsScrollButtonsSimilar.value = hasScroll;
  canScrollLeftSimilar.value = container.scrollLeft > 5;
  canScrollRightSimilar.value = container.scrollLeft < container.scrollWidth - container.clientWidth - 5;
};

const scrollLeftSimilar = () => {
  if (!similarSliderContainer.value) return;
  similarSliderContainer.value.scrollBy({ left: -300, behavior: 'smooth' });
  setTimeout(updateScrollButtonsSimilar, 300);
};

const scrollRightSimilar = () => {
  if (!similarSliderContainer.value) return;
  similarSliderContainer.value.scrollBy({ left: 300, behavior: 'smooth' });
  setTimeout(updateScrollButtonsSimilar, 300);
};

watch(
  () => similarDisplayProducts.value?.length,
  async (hasProducts) => {
    if (hasProducts) {
      await nextTick();
      updateScrollButtonsSimilar();
      if (similarSliderContainer.value) {
        similarSliderContainer.value.addEventListener('scroll', updateScrollButtonsSimilar, { passive: true });
      }
    }
  },
);

// ==============================
// Similar Cross-Selling Logic - Ende
// ==============================

// ==============================
// Reviews Logic - Start
// ==============================

const totalReviews = computed(() => {
  try {
    const count = productReviews.value?.counts?.ratingsCountTotal;
    return Number(count) || 0;
  } catch {
    return 0;
  }
});

const reviewAverageStars = computed(() => {
  try {
    const avg = productReviews.value?.counts?.averageValue;
    return Number(avg) || 0;
  } catch {
    return 0;
  }
});

const reviewAverageText = computed(() => {
  try {
    const avg = Number(reviewAverageStars.value) || 0;
    return avg > 0 ? avg.toFixed(1) : '0.0';
  } catch {
    return '0.0';
  }
});

// ==============================
// Reviews Logic - Ende
// ==============================
</script>

<style>
/* Mobile: Flex Column Layout - DOM-Reihenfolge: Gallery → Right Area → Description */
.product-layout {
  display: flex;
  flex-direction: column;
}

.left-area {
  display: contents;
}

/* Desktop: CSS Grid Layout */
@media (min-width: 1024px) {
  .product-layout {
    display: grid;
    grid-template-columns: 11fr 9fr;
    column-gap: 3rem;
    align-items: start;
  }

  .left-area {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 0;
    grid-column: 1;
    grid-row: 1;
  }

  .right-area {
    grid-column: 2;
    grid-row: 1;
  }
}

/* Custom easing for description transition */
.ease-in-out-custom {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Description fade-out gradient when truncated */
.description-truncated::before {
  content: '';
  position: absolute;
  height: calc(2em * 1.5);
  width: 100%;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  user-select: none;
  background: linear-gradient(to bottom, transparent, #fff);
  z-index: 2;
  opacity: 0;
  transition: opacity 400ms cubic-bezier(0.4, 0, 0.2, 1) 250ms;
}

/* Gradient erscheint verzögert beim Zuklappen (nur bei max-h-[150px]) */
.max-h-\[150px\].description-truncated::before {
  opacity: 1;
}
</style>
