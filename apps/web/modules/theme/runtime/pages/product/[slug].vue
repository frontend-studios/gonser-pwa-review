<template>
  <NuxtLayout name="default" :breadcrumbs="breadcrumbs">
    <div class="max-w-screen-2xl mx-auto product-page relative">
      <div class="product-layout p-5 xl:p-0">
        <div class="gallery-area">
          <div class="fs-gallery mb-6">
            <!-- <Gallery :images="galleryImages" :configuration="galleryConfiguration" /> -->
            <FancyboxGallery :images="galleryImages" :product="product" :item-id="productGetters.getItemId(product)" />
          </div>
        </div>

        <div class="right-area w-full relative">
          <div class="flex justify-between items-start mb-2.5">
            <!-- SALE Badges -->
            <div class="flex gap-2">
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
              class="wishlist-button absolute top-0 right-0"
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
              <span class="text-sm text-neutral-600">
                ({{ t('product.reviewsCount', { Anzahl: totalReviews }) }})
              </span>
            </div>
            <UiEnergyLabel :product="product" position="inline" :size="50" />
          </div>

          <div class="fs-price flex items-end gap-2 mb-6">
            <span class="text-red flex items-end gap-2">
              <span class="h4 !font-medium">{{ priceCurrency }}</span>
              <span class="h2">{{ priceAmount }}</span>
            </span>
            <span v-if="hasPriceStrikePrice" class="line-through text-gray-super-dark h4 !font-medium">
              {{ t('theme.ProductPage.insteadOfRRP') }} {{ strikePriceAmount }}
            </span>
          </div>

          <div class="product-attributes">
            <ProductAttributes :product="product" />
          </div>

          <div v-if="shouldShowColorSelector" class="fs-pseudovariants-color mb-4">
            <div class="mb-2">
              <span class="font-semibold">{{ t('theme.ProductPage.color') }}&nbsp;</span>
              <span v-if="displayedColorName"> {{ displayedColorName }}</span>
            </div>
            <div class="flex flex-wrap gap-2 items-center" @mouseleave="hoveredColorItemId = null">
              <button
                v-for="opt in colorOptions"
                :key="opt.itemId"
                type="button"
                class="relative border bg-white p-1 overflow-visible transition-colors w-[72px] h-[72px] rounded-[5px]"
                :class="[opt.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer']"
                :style="{
                  borderColor:
                    opt.itemId === currentItemId || hoveredColorItemId === opt.itemId ? '#151515' : '#E8E5EB',
                }"
                :disabled="opt.disabled || opt.itemId === currentItemId"
                @mouseenter="hoveredColorItemId = opt.itemId"
                @click="onColorClick(opt.itemId)"
              >
                <span
                  v-if="hasProperty39(opt.product)"
                  class="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-white font-semibold z-2 bg-red w-6 h-6"
                >
                  %
                </span>

                <!-- Out of Stock Overlay -->
                <div
                  v-if="hasNoStock(opt.product)"
                  class="absolute inset-0 bg-white/70 rounded-[5px] z-10 flex items-center justify-center"
                >
                  <img
                    src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/PDP/Mail.svg"
                    :alt="t('theme.ProductPage.outOfStock')"
                    class="w-[18px] h-[14px]"
                  />
                </div>

                <NuxtImg
                  :src="opt.thumbUrl"
                  :alt="opt.label"
                  class="w-full h-full object-cover rounded-[5px]"
                  :class="{ grayscale: opt.disabled }"
                />
              </button>
            </div>
          </div>

          <div v-if="shouldShowSizeSelector" class="fs-pseudovariants-size w-full mb-6">
            <div ref="dropdownRef" class="relative w-full">
              <button
                type="button"
                class="btn btn-secondary w-full flex justify-between items-center py-2 px-3.5 border border-gray bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-[5px]"
                :disabled="isSizeSelectDisabled"
                @click.stop="toggleDropdown"
              >
                <div>
                  <span>{{ t('theme.ProductPage.variant') }}&nbsp;</span>
                  <span
                    ><strong>{{ currentSizeLabel }}</strong></span
                  >
                </div>
                <div class="flex gap-1">
                  <svg v-if="!isDropdownOpen" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  <svg v-if="isDropdownOpen" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  </svg>
                </div>
              </button>

              <div
                v-if="isDropdownOpen && !isSizeSelectDisabled"
                class="absolute z-[101] w-full mt-1 bg-white border border-gray shadow-lg max-h-64 overflow-y-auto rounded-[5px]"
              >
                <div v-for="(opt, index) in sizeOptions" :key="opt.itemId">
                  <div
                    v-if="opt.itemId === currentItemId"
                    class="flex justify-between items-center px-3.5 py-2 bg-gray-light cursor-default"
                    :class="{ 'border-t border-neutral-200': index > 0 }"
                  >
                    <span
                      ><span class="font-semibold">{{ opt.label }}</span></span
                    >
                    <div class="flex items-center gap-2">
                      <span
                        v-if="hasProperty39(opt.product)"
                        class="flex items-center justify-center rounded-full text-white font-semibold bg-red w-5 h-5 text-xs"
                      >
                        %
                      </span>
                      <span
                        ><span class="font-semibold">{{ opt.price }}</span></span
                      >
                    </div>
                  </div>

                  <a
                    v-else
                    :href="buildProductPath(opt.product)"
                    class="flex justify-between items-center px-3.5 py-2 hover:bg-gray-light transition-colors block"
                    :class="[
                      { 'border-t border-neutral-200': index > 0 },
                      { 'opacity-50 cursor-not-allowed pointer-events-none': opt.disabled },
                    ]"
                    @click.prevent="onSizeOptionClick(opt)"
                  >
                    <span
                      ><span class="font-semibold">{{ opt.label }}</span></span
                    >
                    <div class="flex items-center gap-2">
                      <span
                        v-if="hasProperty39(opt.product)"
                        class="flex items-center justify-center rounded-full text-white font-semibold bg-red w-5 h-5 text-xs"
                      >
                        %
                      </span>
                      <span
                        ><span class="font-semibold">{{ opt.price }}</span></span
                      >
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div ref="addToCartButtonRef" class="fs-add-to-basket mb-4">
            <div class="flex flex-col lg:flex-row items-stretch gap-3">
              <UiQuantitySelector
                :min-value="productGetters.getMinimumOrderQuantity(product)"
                :value="quantitySelectorValue"
                class="w-full lg:w-auto lg:min-w-[145px] lg:flex-shrink-0"
                @change-quantity="changeQuantity"
              />

              <SfButton
                type="button"
                size="lg"
                class="w-full lg:flex-1 !bg-green-600 hover:!bg-green-700 !rounded-[40px]"
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
            class="availability flex items-center gap-2 mb-2 cursor-pointer hover:opacity-80 transition-opacity"
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
            <ul class="flex flex-col gap-4">
              <li
                v-for="(usp, index) in usps"
                :key="index"
                class="flex items-center gap-3 pl-2"
                :class="{ 'bg-gray rounded-[5px] p-2': index === usps.length - 1 }"
              >
                <img :src="usp.icon" :alt="usp.alt" class="object-contain flex-shrink-0 w-5 h-5" />
                <span class="flex-1 text-base mb-0" v-html="usp.text" />
              </li>
            </ul>
          </div>

          <!-- GonserBox Komponente - zeigt sich nur bei Property ID 4 mit value '1' -->
          <GonserBox class="mb-4" />
        </div>

        <div class="description-area">
          <div v-if="itemTextContent" class="fs-item-text">
            <h2>{{ t('theme.ProductPage.description') }}</h2>

            <div
              ref="itemTextRef"
              class="no-preflight relative overflow-hidden transition-[max-height] duration-500 ease-in-out-custom"
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
                class="mt-3 flex items-center gap-2 transition-colors"
              >
                <span>{{ isTextExpanded ? t('theme.ProductPage.showLess') : t('theme.ProductPage.showMore') }}</span>
                <SfIconExpandMore v-if="!isTextExpanded" class="w-5 h-5" />
                <SfIconExpandLess v-else class="w-5 h-5" />
              </button>
            </ClientOnly>
          </div>
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
              class="flex-shrink-0 snap-start w-[calc((100%-1.5rem)/2.5)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-4rem)/5)]"
            >
              <ProductCard :product="xsellingProduct" :index="index" :lazy="index >= 5" />
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

      <div class="reviews-section mt-8 p-5 xl:p-0">
        <ReviewsAccordion :product="product" />
      </div>

      <UiReviewModal />
      <ProductLegalDetailsDrawer v-if="open" :product="product" />

      <div v-if="similarDisplayProducts?.length > 0" class="fs-xselling-similar mt-6">
        <h3 class="mb-4 pl-5 xl:pl-0">{{ t('theme.ProductPage.similarProducts') }}</h3>

        <div class="relative pl-5 xl:pl-0">
          <div
            ref="similarSliderContainer"
            class="overflow-x-auto scroll-smooth flex gap-4 pb-4 snap-x snap-mandatory pr-5 xl:pr-0"
            @scroll="updateScrollButtonsSimilar"
          >
            <div
              v-for="(similarProduct, index) in similarDisplayProducts"
              :key="productGetters.getVariationId(similarProduct)"
              class="flex-shrink-0 snap-start w-[calc((100%-1.5rem)/2.5)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-4rem)/5)]"
            >
              <ProductCard :product="similarProduct" :index="index" :lazy="index >= 5" />
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
          <div class="mt-6 pl-5 xl:pl-0">
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
      <div v-if="showStickyAddToCart" class="block fixed bottom-4 left-0 right-0 z-50 mx-auto max-w-screen-2xl">
        <div class="lg:w-[50%] xl:w-[40%] lg:max-w-[600px] lg:ml-auto">
          <div
            class="relative bg-[#F7F6F9] border border-[#ECEAEF] rounded-[10px] p-5"
            style="box-shadow: 0px 0px 20px 0px #00000026"
          >
            <div class="flex gap-4 items-stretch">
              <!-- Product Image -->
              <div class="flex-shrink-0">
                <NuxtImg
                  :src="imageUrl"
                  :alt="imageAlt"
                  width="144"
                  height="144"
                  class="w-[121px] h-[121px] lg:w-[144px] lg:h-[144px] object-contain rounded-md border-[#ECEAEF]"
                  loading="lazy"
                />
              </div>

              <!-- Info + Badge Container (mobile: column, desktop: row) -->
              <div class="flex flex-col lg:flex-row flex-1 gap-2 lg:gap-4">
                <!-- Spare Badge (mobile: oben, desktop: rechts) -->
                <div class="lg:order-2 lg:self-start">
                  <div
                    v-if="discountPercentage > 0"
                    class="px-2 py-1 text-white text-xs font-semibold bg-[#d4001c] rounded-full w-fit"
                  >
                    {{ t('theme.ProductPage.saving', { percentage: discountPercentage }) }}
                  </div>
                </div>

                <!-- Product Info & Button (mobile: unten, desktop: links) -->
                <div class="flex flex-col gap-2 flex-1 lg:order-1 justify-between">
                  <!-- Title -->
                  <h3 class="text-sm font-semibold line-clamp-2">{{ itemName }}</h3>

                  <!-- Price -->
                  <div class="flex items-center gap-2">
                    <span class="text-xl font-bold text-[#D4001C]">
                      <span>{{ priceCurrency }}</span> <span>{{ priceAmount }}</span>
                    </span>
                    <span v-if="hasPriceStrikePrice" class="text-sm line-through text-gray-super-dark">
                      {{ t('theme.ProductPage.insteadOfRRP') }} {{ strikePriceAmount }}
                    </span>
                  </div>

                  <!-- Add to Cart Button -->
                  <SfButton
                    type="button"
                    size="sm"
                    class="w-auto !bg-green-600 hover:!bg-green-700 !rounded-[40px]"
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
    <div
      v-if="isAvailabilityModalOpen"
      class="fixed inset-0 z-[9999] flex items-center justify-center px-s pb-4"
      @click.self="closeAvailabilityModal"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-neutral-500/50" @click="closeAvailabilityModal"></div>

      <!-- Modal Content -->
      <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between pt-s px-s pb-4">
          <p class="h2">
            {{ t('theme.ProductPage.availabilityModal.headline') }}
          </p>
          <button
            @click="closeAvailabilityModal"
            class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-light hover:bg-gray transition-colors"
            type="button"
            aria-label="Close"
          >
            <svg class="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="px-s pb-s overflow-auto max-h-[calc(90vh-100px)]">
          <div class="space-y-4 text-neutral-700">
            <p class="mb-4 font-semibold">{{ t('theme.ProductPage.availabilityModal.intro') }}</p>
            <p class="mb-4">{{ t('theme.ProductPage.availabilityModal.exception') }}</p>
            <p class="mb-4">{{ t('theme.ProductPage.availabilityModal.orderInfo') }}</p>
            <p class="mb-4">{{ t('theme.ProductPage.availabilityModal.shippingPartners') }}</p>
            <p>{{ t('theme.ProductPage.availabilityModal.noAbroad') }}</p>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Product } from '@plentymarkets/shop-api';
import type { WatchStopHandle } from 'vue';
import {
  productGetters,
  categoryTreeGetters,
  productImageGetters,
  productPropertyGetters,
} from '@plentymarkets/shop-api';
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
import { useRecentlyViewed } from '../../composables/useRecentlyViewed/useRecentlyViewed';
import GonserBox from '../../components/ui/GonserBox/GonserBox.vue';
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
const { data: categoryTree } = useCategoryTree();
const { open } = useProductLegalDetailsDrawer();
const { setPageMeta } = usePageMeta();
const { data: similarProducts, fetchProductRecommended: fetchSimilarProducts } =
  useProductRecommended('similar-products');
const similarReviewsLoaded = ref(false);
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

          if (reviewResponse.data?.counts && product.item) {
            product.item.feedbackCount = String(reviewResponse.data.counts.ratingsCountTotal || 0);
            product.item.feedbackDecimal = String(Number(reviewResponse.data.counts.averageValue) || 0);
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
  () => categoryTree.value,
  (categoriesTree) => {
    setProductCanonicalMetaData(product.value);
    const productCategoryId = productGetters.getParentCategoryId(product.value);
    if (categoriesTree.length > 0 && productCategoryId) {
      const categoryTree = categoriesTree.find(
        (categoryTree) => categoryTreeGetters.getId(categoryTree) === productCategoryId,
      );
      if (categoryTree) {
        setProductMetaData(product.value, categoryTree);
        setProductRobotsMetaData(product.value);
      }
    }
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
    const observer = new window.IntersectionObserver(
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
  if (import.meta.client && useCallisto().isEnabled) {
    variationWatchHandler = watch(variationId, async () => {
      if (Number(productParams.variationId) !== variationId.value && variationId.value > 0) {
        productParams.variationId = variationId.value;
        await fetchProduct(productParams);
        setCurrentProduct(productForEditor.value || ({} as Product));
      }
    });
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
const priceCurrency = 'CHF';
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

type SizeOption = {
  itemId: string;
  label: string;
  disabled: boolean;
  product: Product;
  price: string;
};

type ColorOption = {
  itemId: string;
  label: string;
  disabled: boolean;
  thumbUrl: string;
  product: Product;
};

// Extract color IDs from product properties (Property ID 61 = colors)
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
      return value
        .split(',')
        .map((v: string) => v.trim())
        .filter(Boolean);
    }
  }
  return [];
});

// Extract size IDs from product properties (Property ID 62 = sizes)
const sizeIds = computed(() => {
  if (!product.value) return [];
  const groups = (product.value as ProductWithVariationProperties).variationProperties;
  if (!Array.isArray(groups)) return [];

  for (const group of groups) {
    const properties = group?.properties;
    if (!Array.isArray(properties)) continue;
    for (const property of properties) {
      if (Number(property?.id ?? 0) !== 62) continue;
      const value = property?.values?.value;
      if (typeof value !== 'string') return [];
      return value
        .split(',')
        .map((v: string) => v.trim())
        .filter(Boolean);
    }
  }
  return [];
});

// Extract Property 44 value (Größe/Size) from product
const extractProperty44Value = (product: Product): string => {
  const groups = (product as ProductWithVariationProperties).variationProperties;
  if (!Array.isArray(groups)) return '';

  for (const group of groups) {
    const properties = group?.properties;
    if (!Array.isArray(properties)) continue;
    for (const property of properties) {
      if (Number(property?.id ?? 0) !== 44) continue;
      const value = property?.values?.value;
      if (typeof value === 'string') return value.trim();
    }
  }
  return '';
};

const currentItemId = computed(() => {
  if (!product.value) return '';
  const id = productGetters.getItemId(product.value);
  return id ? String(id) : '';
});

// Fetch size variant products
const { data: fetchedSizeProducts } = useAsyncData<Product[]>(
  `fs-pseudovariants-size-${currentItemId.value}-${sizeIds.value.join(',')}`,
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
  },
);

// Fetch color variant products
const { data: fetchedColorProducts } = useAsyncData<Product[]>(
  `fs-pseudovariants-color-${currentItemId.value}-${colorIds.value.join(',')}`,
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
  },
);

// Build size options
const sizeOptions = computed<SizeOption[]>(() => {
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
      const label = extractProperty44Value(p) || productGetters.getName(p) || id;
      const priceValue = Number(productGetters.getPrice(p)) || 0;
      const price = priceValue > 0 ? format(priceValue) : '';
      return {
        itemId: id,
        label,
        disabled: isNotAvailable(p),
        product: p,
        price: price || '',
      };
    });
  } catch {
    return [];
  }
});

// Build color options
const colorOptions = computed<ColorOption[]>(() => {
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
      const availabilityId = p.variation?.availabilityId ?? 0;
      const noStock = hasNoStock(p);
      return {
        itemId: id,
        label: productGetters.getName(p) || id,
        disabled: isNotAvailable(p),
        thumbUrl: getThumbUrl(p, 2),
        product: p,
      };
    });
  } catch {
    return [];
  }
});

const shouldShowColorSelector = computed(() => {
  return (colorIds.value?.length || 0) > 0 && (colorOptions.value?.length || 0) > 0;
});

const shouldShowSizeSelector = computed(() => {
  return (sizeIds.value?.length || 0) > 0 && (sizeOptions.value?.length || 0) > 0;
});

const hoveredColorItemId = ref<string | null>(null);
const hoveredColorOption = computed(() => {
  if (!hoveredColorItemId.value) return undefined;
  return colorOptions.value.find((o) => o.itemId === hoveredColorItemId.value);
});

// Dropdown state
const isDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const currentSizeLabel = computed(() => {
  const current = sizeOptions.value.find((o) => o.itemId === currentItemId.value);
  return current?.label || '';
});

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const onSizeOptionClick = (opt: SizeOption) => {
  if (opt.disabled || opt.itemId === currentItemId.value) return;
  isDropdownOpen.value = false;
  navigateTo({ path: buildProductPath(opt.product), query: route.query });
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);

  // Initial update für Scroll-Buttons
  setTimeout(() => {
    updateScrollButtonsXselling();
    updateScrollButtonsSimilar();
  }, 100);

  // Resize listener für responsive Anpassung
  window.addEventListener('resize', () => {
    updateScrollButtonsXselling();
    updateScrollButtonsSimilar();
  });
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);

  // Cleanup resize listener
  window.removeEventListener('resize', () => {
    updateScrollButtonsXselling();
    updateScrollButtonsSimilar();
  });

  // Cleanup scroll event listeners
  if (xsellingSliderContainer.value) {
    xsellingSliderContainer.value.removeEventListener('scroll', updateScrollButtonsXselling);
  }
  if (similarSliderContainer.value) {
    similarSliderContainer.value.removeEventListener('scroll', updateScrollButtonsSimilar);
  }
});

const isSizeSelectDisabled = computed(() => {
  if (!shouldShowSizeSelector.value) return true;
  const options = sizeOptions.value;
  if (options.length <= 1) return true;
  const hasSelectableAlternative = options.some((o) => !o.disabled && o.itemId !== currentItemId.value);
  return !hasSelectableAlternative;
});

function isNotAvailable(product: Product) {
  return (product.variation?.availabilityId ?? 0) > 7;
}

function hasProperty39(product: Product): boolean {
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

function hasNoStock(product: Product): boolean {
  return (product.variation?.availabilityId ?? 0) > 7;
}

function extractColorLabel(product: Product): string {
  const name = (productGetters.getName(product) || '').trim();
  if (!name) return '';
  const parts = name.split(/\s+/).filter(Boolean);
  const last = parts.at(-1) ?? '';
  if (!last) return '';
  return last.charAt(0).toUpperCase() + last.slice(1);
}

const activeColorName = computed(() => (product.value ? extractColorLabel(product.value) : ''));
const displayedColorName = computed(() => {
  if (hoveredColorOption.value?.product) return extractColorLabel(hoveredColorOption.value.product);
  return activeColorName.value;
});

function getThumbUrl(product: Product, position: number): string {
  const allImages = (product.images?.all || []) as any[];
  const index = Math.max(0, Number(position) - 1);
  const selectedImage = allImages[index] ?? productImageGetters.getFirstImage(product);
  return productImageGetters.getImageUrl(selectedImage) || '';
}

function buildProductPath(product: Product): string {
  const urlPath = productGetters.getUrlPath(product) || '';
  const itemId = String(productGetters.getItemId(product) ?? '');
  const variationId = String(productGetters.getVariationId(product) ?? '');
  const suffix = variationId ? `${itemId}_${variationId}` : itemId;
  return buildProductLanguagePath(`/${urlPath}_${suffix}`);
}

function onColorClick(nextId: string) {
  if (!nextId) return;
  if (nextId === currentItemId.value) return;
  const next = colorOptions.value.find((o) => o.itemId === nextId);
  if (!next || next.disabled) return;
  navigateTo({ path: buildProductPath(next.product), query: route.query });
}

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
const { addToCart, loading } = useCart();
const { openQuickCheckout } = useQuickCheckout();
const { getGonserBoxPropertyParam } = useGonserBoxProperty();

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

  const addedToCart = await addToCart({
    productId: Number(productGetters.getId(product.value)),
    quantity: Number(quantitySelectorValue.value),
    basketItemOrderParams: basketParams.length > 0 ? basketParams : undefined,
  });

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

        return {
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

// ==============================
// FSXselling Logic - Start (Zubehör (id,id,id...) aus Property 63)
// ==============================

const xsellingPropertyId = 63;

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
      const validIds = xsellingPropertyItemIds.value.filter((id) => id && String(id).trim());
      if (!validIds.length) return [];

      // Lade jedes Produkt einzeln
      const productPromises = validIds.map(async (itemId) => {
        try {
          const productResponse = await useSdk().plentysystems.getProduct({
            id: itemId,
          });

          const product = productResponse.data;
          if (!product) return null;

          // Setze initiale Default-Werte für SSR
          if (product.item) {
            product.item.feedbackCount = '0';
            product.item.feedbackDecimal = '0';
          }

          return product;
        } catch (error: any) {
          // 404 ist normal wenn Produkt gelöscht wurde - silent skip
          if (error?.cause?.statusCode === 404 || error?.code === 404) {
            return null;
          }
          return null;
        }
      });

      const products = await Promise.all(productPromises);

      // Filtere null-Werte (fehlgeschlagene Requests) und behalte die Reihenfolge bei
      return products.filter((p): p is Product => p !== null);
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

          if (reviewResponse.data?.counts && product.item) {
            product.item.feedbackCount = String(reviewResponse.data.counts.ratingsCountTotal || 0);
            product.item.feedbackDecimal = String(Number(reviewResponse.data.counts.averageValue) || 0);
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
    const products = xsellingProducts.value || [];
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
    const products = similarProducts.value || [];
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

/* Desktop: CSS Grid Layout */
@media (min-width: 1024px) {
  .product-layout {
    display: grid;
    grid-template-columns: 11fr 9fr;
    grid-template-rows: auto auto;
    gap: 3rem;
  }

  .gallery-area {
    grid-column: 1;
    grid-row: 1;
  }

  .description-area {
    grid-column: 1;
    grid-row: 2;
  }

  .right-area {
    grid-column: 2;
    grid-row: 1 / 3; /* Spans both rows */
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
