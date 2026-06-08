<template>
  <!-- Mobile Overlay (nur < lg) -->
  <div
    v-if="isOpen && viewport.isLessThan('lg')"
    class="fixed left-0 right-0 bg-neutral-500 bg-opacity-50"
    :style="mobileDrawerOffsetStyle"
    @click="close"
  />

  <UiModal
    v-if="isOpen"
    v-model="isOpen"
    tag="section"
    :disableClickAway="false"
    :style="viewport.isLessThan('lg') ? mobileDrawerOffsetStyle : {}"
    class="quick-checkout-modal overflow-hidden m-0 !p-0 flex flex-col h-auto w-[100vw] max-w-[100vw] lg:!w-[1366px] md:h-[90vh] md:max-h-[90vh] md:rounded-[20px]"
    aria-label="quick-checkout-modal"
  >
    <header class="bg-gray-light flex justify-between items-start p-3 md:p-5 relative shrink-0">
      <div class="flex w-full max-w-[95%] items-center">
        <NuxtImg
          :src="addModernImageExtension(productGetters.getMiddleImage(props.product))"
          :alt="imageAlt"
          :title="
            productImageGetters.getImageName(productImageGetters.getFirstImage(props.product))
              ? productImageGetters.getImageName(productImageGetters.getFirstImage(props.product))
              : null
          "
          width="80"
          height="80"
          loading="lazy"
          class="border border-gray rounded-[10px] object-cover"
        />
        <div class="ml-4 flex items-start flex-col justify-center">
          <h3 class="">{{ t('theme.quickCheckout.heading') }}</h3>
          <span class="flex items-center gap-1 text-base text-black mt-2.5 font-semibold">
            {{ t('theme.quickCheckout.subheading') }}
            <SfIconCheck class="w-[18px] h-[18px] text-black" />
          </span>
        </div>

        <div class="ml-auto hidden md:flex items-start justify-center flex-col">
          <div class="flex">
            <span class="text-black text-base font-medium">CHF</span>
            <span class="text-red ml-1 text-[22px] font-semibold leading-5">{{ (currentPrice || 0).toFixed(2) }}</span>
          </div>
          <span v-if="showCrossedPrice" class="text-gray-super-dark text-sm line-through">
            CHF {{ (crossedPrice || 0).toFixed(2) }}
          </span>
        </div>
      </div>
      <div class="absolute right-2 top-2 flex items-center">
        <button
          :aria-label="t('common.navigation.closeDialog')"
          data-testid="quick-checkout-close"
          class="rounded-full p-2 z-10 transition-all border border-gray-light text-black bg-gray hover:bg-gray-dark"
          @click="close"
        >
          <SfIconClose />
        </button>
      </div>
    </header>

    <!-- Scrollable Content Area -->
    <div class="pb-4 lg:pb-6 flex-1 overflow-y-auto">
      <UiGonserBox
        :force-show="true"
        layout="horizontal"
        :hide-buttons="true"
        :hide-info-texts-mobile="true"
        :hide-image-mobile="true"
        custom-class="!bg-white mx-4 md:mx-8 !mt-5 p-3 md:p-5 !border !border-gray rounded-[10px]"
      />

      <!-- Gonser Recommended Products (Category 376) -->
      <div v-if="availableRecommendedProducts.length > 0" class="mt-6 px-4 md:px-8">
        <h3 class="mb-1">{{ t('theme.cart.recommendedProducts') }}</h3>
        <NuxtLink
          :to="localePath(t('theme.quickCheckout.gonserShowAllUrl'))"
          class="underline text-black text-base mb-4 inline-flex items-center gap-1"
        >
          {{ t('theme.quickCheckout.gonserShowAll') }}
          <SfIconArrowForward size="xs" />
        </NuxtLink>
        <div class="relative">
          <div
            ref="recommendedSliderContainer"
            class="overflow-x-auto scroll-smooth flex gap-4 pb-4 snap-x snap-mandatory scrollbar-hide"
            @scroll="updateScrollButtonsRecommended"
          >
            <div
              v-for="(product, index) in availableRecommendedProducts"
              :key="productGetters.getId(product)"
              class="flex-shrink-0 snap-start w-[calc((100%-2rem)/2.5)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-4rem)/5)]"
            >
              <ProductCard
                :product="product"
                :index="index"
                :lazy="index >= 5"
                :hide-recommended-retail-price="true"
                :hide-pseudo-variants="true"
                :show-add-to-cart="true"
              />
            </div>
          </div>

          <button
            v-if="needsScrollButtonsRecommended"
            :disabled="!canScrollLeftRecommended"
            type="button"
            class="hidden md:block absolute left-0 -translate-x-1/2 top-1/4 -translate-y-1/2 rounded-full p-2 shadow-lg z-10 transition-all border"
            :class="{
              'cursor-not-allowed bg-white border-gray text-gray': !canScrollLeftRecommended,
              'bg-gray-light border-gray-light text-black hover:bg-gray hover:border-gray': canScrollLeftRecommended,
            }"
            @click="scrollLeftRecommended"
          >
            <SfIconChevronLeft class="w-5 h-5" />
          </button>
          <button
            v-if="needsScrollButtonsRecommended"
            :disabled="!canScrollRightRecommended"
            type="button"
            class="hidden md:block absolute right-0 translate-x-1/2 top-1/4 -translate-y-1/2 rounded-full p-2 shadow-lg z-10 transition-all border"
            :class="{
              'cursor-not-allowed bg-white border-gray text-gray': !canScrollRightRecommended,
              'bg-gray-light border-gray-light text-black hover:bg-gray hover:border-gray': canScrollRightRecommended,
            }"
            @click="scrollRightRecommended"
          >
            <SfIconChevronRight class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div v-if="similarDisplayProducts?.length > 0" class="fs-xselling-similar mt-6 px-4 md:px-8">
        <h3 class="mb-4">{{ t('theme.ProductPage.similarProducts') }}</h3>

        <div class="relative">
          <div
            ref="similarSliderContainer"
            class="overflow-x-auto scroll-smooth flex gap-4 pb-4 snap-x snap-mandatory"
            @scroll="updateScrollButtonsSimilar"
          >
            <div
              v-for="(similarProduct, index) in similarDisplayProducts"
              :key="productGetters.getVariationId(similarProduct)"
              class="flex-shrink-0 snap-start w-[calc((100%-2rem)/2.5)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-4rem)/5)]"
            >
              <ProductCard
                :product="similarProduct"
                :index="index"
                :lazy="index >= 5"
                :hide-recommended-retail-price="true"
                :hide-pseudo-variants="true"
                :show-add-to-cart="true"
              />
            </div>
          </div>

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
        </div>
      </div>

      <div v-if="replacementDisplayProducts?.length > 0" class="fs-xselling-replacement mt-6 px-4 md:px-8">
        <h3 class="mb-4">{{ t('theme.ProductPage.replacementParts') }}</h3>

        <div class="relative">
          <div
            ref="replacementSliderContainer"
            class="overflow-x-auto scroll-smooth flex gap-4 pb-4 snap-x snap-mandatory"
            @scroll="updateScrollButtonsReplacement"
          >
            <div
              v-for="(replacementProduct, index) in replacementDisplayProducts"
              :key="productGetters.getVariationId(replacementProduct)"
              class="flex-shrink-0 snap-start w-[calc((100%-2rem)/2.5)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-4rem)/5)]"
            >
              <ProductCard
                :product="replacementProduct"
                :index="index"
                :lazy="index >= 5"
                :hide-recommended-retail-price="true"
                :hide-pseudo-variants="true"
                :show-add-to-cart="true"
              />
            </div>
          </div>

          <button
            v-if="needsScrollButtonsReplacement"
            :disabled="!canScrollLeftReplacement"
            class="hidden md:block absolute left-0 -translate-x-1/2 top-1/4 -translate-y-1/2 rounded-full p-2 shadow-lg z-10 transition-all border"
            :class="{
              'cursor-not-allowed bg-white border-gray text-gray': !canScrollLeftReplacement,
              'bg-gray-light border-gray-light text-black hover:bg-gray hover:border-gray': canScrollLeftReplacement,
            }"
            @click="scrollLeftReplacement"
          >
            <SfIconChevronLeft class="w-5 h-5" />
          </button>
          <button
            v-if="needsScrollButtonsReplacement"
            :disabled="!canScrollRightReplacement"
            class="hidden md:block absolute right-0 translate-x-1/2 top-1/4 -translate-y-1/2 rounded-full p-2 shadow-lg z-10 transition-all border"
            :class="{
              'cursor-not-allowed bg-white border-gray text-gray': !canScrollRightReplacement,
              'bg-gray-light border-gray-light text-black hover:bg-gray hover:border-gray': canScrollRightReplacement,
            }"
            @click="scrollRightReplacement"
          >
            <SfIconChevronRight class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div v-if="basketOverlayCategorySliders.length > 0" class="fs-basket-overlay-categories mt-6">
        <div
          v-for="(slider, sliderIndex) in basketOverlayCategorySliders"
          :key="slider.categoryId"
          class="mb-6 px-4 md:px-8"
        >
          <h3 class="mb-4">{{ slider.categoryName || `Kategorie ${slider.categoryId}` }}</h3>

          <div class="relative">
            <div
              :ref="(el) => setCategorySliderRef(el, sliderIndex)"
              class="overflow-x-auto scroll-smooth flex gap-4 pb-4 snap-x snap-mandatory"
              @scroll="updateCategoryScrollButtons(sliderIndex)"
            >
              <div
                v-for="(categoryProduct, index) in slider.products"
                :key="productGetters.getVariationId(categoryProduct)"
                class="flex-shrink-0 snap-start w-[calc((100%-2rem)/2.5)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-4rem)/5)]"
              >
                <ProductCard
                  :product="categoryProduct"
                  :index="index"
                  :lazy="index >= 5"
                  :hide-recommended-retail-price="true"
                  :hide-pseudo-variants="true"
                  :show-add-to-cart="true"
                />
              </div>
            </div>

            <button
              v-if="slider.needsScrollButtons"
              :disabled="!slider.canScrollLeft"
              class="hidden md:block absolute left-0 -translate-x-1/2 top-1/4 -translate-y-1/2 rounded-full p-2 shadow-lg z-10 transition-all border"
              :class="{
                'cursor-not-allowed bg-white border-gray text-gray': !slider.canScrollLeft,
                'bg-gray-light border-gray-light text-black hover:bg-gray hover:border-gray': slider.canScrollLeft,
              }"
              @click="scrollCategoryLeft(sliderIndex)"
            >
              <SfIconChevronLeft class="w-5 h-5" />
            </button>
            <button
              v-if="slider.needsScrollButtons"
              :disabled="!slider.canScrollRight"
              class="hidden md:block absolute right-0 translate-x-1/2 top-1/4 -translate-y-1/2 rounded-full p-2 shadow-lg z-10 transition-all border"
              :class="{
                'cursor-not-allowed bg-white border-gray text-gray': !slider.canScrollRight,
                'bg-gray-light border-gray-light text-black hover:bg-gray hover:border-gray': slider.canScrollRight,
              }"
              @click="scrollCategoryRight(sliderIndex)"
            >
              <SfIconChevronRight class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- End Scrollable Content Area -->

    <div class="footer border-t border-gray p-3 md:p-5 shrink-0">
      <!-- Action Buttons -->
      <div class="flex flex-row gap-3 justify-center">
        <NuxtLink
          :to="localePath(paths.cart)"
          class="w-full sm:max-w-[210px] inline-flex items-center justify-center rounded-[40px] py-2.5 px-3 sm:py-2.5 sm:px-6 bg-white border border-gray hover:bg-gray-light text-black text-base font-semibold transition-colors"
          @click="close"
        >
          {{ t('theme.cartDrawer.goShopping') }}
        </NuxtLink>
        <NuxtLink
          :to="localePath(paths.cart)"
          class="w-full sm:max-w-[210px] hidden sm:inline-flex items-center justify-center rounded-[40px] py-2.5 px-3 sm:py-2.5 sm:px-6 bg-gray hover:bg-gray-dark text-black text-base font-semibold transition-colors"
          @click="goToPage(paths.cart)"
        >
          {{ t('theme.quickCheckout.basket') }}
        </NuxtLink>

        <NuxtLink
          :to="localePath(paths.checkout)"
          class="w-full sm:max-w-[210px] inline-flex items-center justify-center rounded-[40px] py-2.5 px-3 sm:py-2.5 sm:px-6 bg-[#20A33E] hover:bg-[#14832E] text-white text-base font-semibold transition-colors"
          @click="goToCheckout()"
        >
          {{ t('theme.quickCheckout.goToCheckout') }}
        </NuxtLink>
      </div>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import {
  SfIconClose,
  SfIconChevronLeft,
  SfIconChevronRight,
  SfIconCheck,
  SfIconArrowForward,
} from '@storefront-ui/vue';
import type { QuickCheckoutProps } from '~/components/QuickCheckout/types';
import type { Product } from '@plentymarkets/shop-api';
import { cartGetters, productGetters, productImageGetters, categoryTreeGetters } from '@plentymarkets/shop-api';
// Theme Product Import
import ProductCard from '../../components/ui/ProductCard/ProductCard.vue';
import { paths } from '~/utils/paths';
import { useGonserBoxCart } from '../../composables/useGonserBoxCart/useGonserBoxCart';

// Type for variation properties
type ProductWithVariationProperties = Product & {
  variationProperties?: Array<{
    properties?: Array<{
      id?: number;
      values?: {
        value?: string;
      };
    }>;
  }>;
};

const props = defineProps<QuickCheckoutProps>();

const { format } = usePriceFormatter();
const { price: currentPrice, crossedPrice } = useProductPrice(props.product);

// Show crossed price only if it differs from current price
const showCrossedPrice = computed(() => {
  if (!crossedPrice.value) return false;
  return Math.round((currentPrice.value || 0) * 100) / 100 !== Math.round((crossedPrice.value || 0) * 100) / 100;
});
const { showNetPrices } = useCart();
const localePath = useLocalePath();
const { data: cart, lastUpdatedCartItem } = useCart();
const { isAvailable: isPaypalAvailable, loadConfig } = usePayPal();
const { addModernImageExtension } = useModernImage();
const { isOpen, closeQuickCheckout, quantity } = useQuickCheckout();
const cartItemsCount = computed(() => cart.value?.items?.reduce((price, { quantity }) => price + quantity, 0) ?? 0);
const { isAuthorized } = useCustomer();
const { data: categoryTree } = useCategoryTree();
const viewport = useViewport();

// Mobile Header Height Tracking (wie im MegaMenu)
const mobileHeaderHeight = ref(0);
const mobileDrawerOffsetStyle = computed(() => ({
  top: `${mobileHeaderHeight.value}px`,
  height: `calc(100dvh - ${mobileHeaderHeight.value}px)`,
}));

const updateMobileHeaderHeight = () => {
  if (typeof document === 'undefined') return;

  const headerElement = document.querySelector('header');
  if (!headerElement) {
    mobileHeaderHeight.value = 0;
    return;
  }

  const headerBottom = headerElement.getBoundingClientRect().bottom;
  mobileHeaderHeight.value = Math.max(headerBottom, 0);
};

// Similar Cross-Selling Products
const { data: similarProducts, fetchProductRecommended: fetchSimilarProducts } =
  useProductRecommended('similar-products');

// Replacement Parts Cross-Selling Products
const { data: replacementProducts, fetchProductRecommended: fetchReplacementProducts } =
  useProductRecommended('replacement-products');

// Lade Review-Daten für Similar Products CLIENT-ONLY (Review API ist nicht SSR-kompatibel)
watch(
  similarProducts,
  async (products) => {
    // Nur im Browser ausführen
    if (!import.meta.client) return;
    if (!products || products.length === 0) return;

    await Promise.all(
      products.map(async (product) => {
        if (!product.item?.id) return;

        // Skip, wenn Reviews bereits geladen wurden (verhindert doppeltes Laden)
        if (product.item.feedbackCount && product.item.feedbackCount !== '0') {
          return;
        }

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
          // Silent error
        }
      }),
    );
  },
  { immediate: true, flush: 'post' },
);

// Lade Review-Daten für Replacement Products CLIENT-ONLY
watch(
  replacementProducts,
  async (products) => {
    // Nur im Browser ausführen
    if (!import.meta.client) return;
    if (!products || products.length === 0) return;

    await Promise.all(
      products.map(async (product) => {
        if (!product.item?.id) return;

        // Skip, wenn Reviews bereits geladen wurden (verhindert doppeltes Laden)
        if (product.item.feedbackCount && product.item.feedbackCount !== '0') {
          return;
        }

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
          // Silent error
        }
      }),
    );
  },
  { immediate: true, flush: 'post' },
);

// Filter für verfügbare Similar Products (nur grün = ID 1 oder 3)
const similarDisplayProducts = computed(() => {
  try {
    const products = similarProducts.value || [];
    // Filtere nur sofort verfügbare Produkte (availabilityId 1 oder 3 = grün)
    const filtered = products.filter((product) => {
      const availId = product.variation?.availabilityId ?? 0;
      return availId === 1 || availId === 3;
    });
    // Sortiere nach Verfügbarkeit: ID 1 (sofort) vor ID 3 (verfügbar)
    return filtered.sort((a, b) => {
      const availA = a.variation?.availabilityId ?? 0;
      const availB = b.variation?.availabilityId ?? 0;
      return availA - availB; // 1 kommt vor 3
    });
  } catch {
    return [];
  }
});

// Filter für verfügbare Replacement Products (nur grün = ID 1 oder 3)
const replacementDisplayProducts = computed(() => {
  try {
    const products = replacementProducts.value || [];
    // Filtere nur sofort verfügbare Produkte (availabilityId 1 oder 3 = grün)
    const filtered = products.filter((product) => {
      const availId = product.variation?.availabilityId ?? 0;
      return availId === 1 || availId === 3;
    });
    // Sortiere nach Verfügbarkeit: ID 1 (sofort) vor ID 3 (verfügbar)
    return filtered.sort((a, b) => {
      const availA = a.variation?.availabilityId ?? 0;
      const availB = b.variation?.availabilityId ?? 0;
      return availA - availB; // 1 kommt vor 3
    });
  } catch {
    return [];
  }
});

// Basket Overlay Categories - Property ID 13
const basketOverlayCategoryIds = computed<string[]>(() => {
  const product = props.product as ProductWithVariationProperties | null;
  const groups = product?.variationProperties;

  if (!Array.isArray(groups)) return [];

  for (const group of groups) {
    const properties = group?.properties;
    if (!Array.isArray(properties)) continue;

    const hit = properties.find((p) => Number(p?.id ?? 0) === 13);
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

// Category sliders state
interface CategorySlider {
  categoryId: string;
  categoryName: string;
  products: Product[];
  canScrollLeft: boolean;
  canScrollRight: boolean;
  needsScrollButtons: boolean;
  containerRef: HTMLElement | null;
  scrollHandler: (() => void) | null;
}

const basketOverlayCategorySliders = ref<CategorySlider[]>([]);

// Helper function to find category in nested tree
const findCategoryInTree = (tree: any[], categoryId: string): any | null => {
  if (!tree || !Array.isArray(tree)) return null;

  for (const item of tree) {
    // Check ID as both string and number
    if (String(item.id) === categoryId || String(categoryTreeGetters.getId(item)) === categoryId) {
      return item;
    }

    // Recursively search children
    if (item.children && Array.isArray(item.children)) {
      const found = findCategoryInTree(item.children, categoryId);
      if (found) return found;
    }
  }

  return null;
};

// Sort products by reviews: highest stars first, then most reviews
const sortProductsByReviews = (products: Product[]): Product[] => {
  return [...products].sort((a, b) => {
    // Get review data using productGetters
    const aRating = productGetters.getAverageRating(a) || 0;
    const aCount = productGetters.getTotalReviews(a) || 0;
    const bRating = productGetters.getAverageRating(b) || 0;
    const bCount = productGetters.getTotalReviews(b) || 0;

    // First sort by rating (highest first)
    if (bRating !== aRating) {
      return bRating - aRating;
    }

    // If ratings are equal, sort by count (most first)
    return bCount - aCount;
  });
};

// Fetch products for each category when modal opens and category IDs change
watch(
  [isOpen, basketOverlayCategoryIds, categoryTree],
  async ([modalIsOpen, categoryIds, tree]) => {
    if (!modalIsOpen || !categoryIds.length) {
      basketOverlayCategorySliders.value = [];
      return;
    }

    // Initialize sliders
    const sliders: CategorySlider[] = categoryIds.map((categoryId) => {
      const category = findCategoryInTree(tree, categoryId);
      const categoryName = category ? categoryTreeGetters.getName(category) : `Kategorie ${categoryId}`;

      return {
        categoryId,
        categoryName,
        products: [],
        canScrollLeft: false,
        canScrollRight: false,
        needsScrollButtons: false,
        containerRef: null,
        scrollHandler: null,
      };
    });

    basketOverlayCategorySliders.value = sliders;

    // Fetch products for each category
    await Promise.all(
      sliders.map(async (slider, index) => {
        try {
          const { data: categoryProducts, fetchProductRecommended } = useProductRecommended(
            `basket-category-${slider.categoryId}`,
          );

          await fetchProductRecommended({
            type: 'category',
            categoryId: slider.categoryId,
            itemId: '',
            crossSellingRelation: 'Similar',
            itemsPerPage: 8,
            sort: 'default.recommended_sorting',
          });

          if (basketOverlayCategorySliders.value[index]) {
            // Filtere nur verfügbare Produkte (availabilityId 1 oder 3 = grün)
            const availableProducts = (categoryProducts.value || []).filter((product) => {
              const availId = product.variation?.availabilityId ?? 0;
              return availId === 1 || availId === 3;
            });

            // Sortiere nach Verfügbarkeit: ID 1 (sofort) vor ID 3 (verfügbar)
            const sortedByAvailability = availableProducts.sort((a, b) => {
              const availA = a.variation?.availabilityId ?? 0;
              const availB = b.variation?.availabilityId ?? 0;
              return availA - availB;
            });

            // Sortiere zusätzlich nach Reviews
            const sortedProducts = sortProductsByReviews(sortedByAvailability);
            basketOverlayCategorySliders.value[index].products = sortedProducts;
          }

          // Update scroll buttons after products are loaded
          await nextTick();
          updateCategoryScrollButtons(index);
        } catch (error) {
          // Silent fail
        }
      }),
    );
  },
  { immediate: true },
);

onMounted(() => {
  loadConfig();

  // Load Cross-Selling products
  const itemId = productGetters.getItemId(props.product);
  if (itemId) {
    // Load Similar Products
    fetchSimilarProducts({
      type: 'cross_selling',
      itemId: String(itemId),
      categoryId: '',
      crossSellingRelation: 'Similar',
      itemsPerPage: 20,
    });

    // Load Replacement Parts
    fetchReplacementProducts({
      type: 'cross_selling',
      itemId: String(itemId),
      categoryId: '',
      crossSellingRelation: 'ReplacementPart',
      itemsPerPage: 20,
    });
  }

  // Mobile Header Height Tracking
  updateMobileHeaderHeight();
  window.addEventListener('resize', updateMobileHeaderHeight);
});

const { gonserBoxTotal } = useGonserBoxCart();
const lastUpdatedProduct = computed(() => cartGetters.getVariation(lastUpdatedCartItem.value) || ({} as Product));

const totals = computed(() => {
  const totalsData = cartGetters.getTotals(cart.value);
  return {
    total: totalsData.total,
    subTotal: totalsData.subtotal,
    vats: totalsData.totalVats,
  };
});

const imageAlt = computed(() => {
  const image = props.product?.images?.all[0];
  return image ? productImageGetters.getImageAlternate(image) : '';
});

// One-Step-Checkout: Immer direkt zu /checkout, egal ob eingeloggt oder nicht
const goToCheckout = () => goToPage(paths.checkout);

const goToPage = (path: string) => {
  closeQuickCheckout();
  navigateTo(localePath(path));
};

const close = () => {
  closeQuickCheckout();
};

// Similar Cross-Selling Slider Logic
const similarSliderContainer = ref<HTMLElement | null>(null);
const canScrollLeftSimilar = ref(false);
const canScrollRightSimilar = ref(false);
const needsScrollButtonsSimilar = ref(false);

const updateScrollButtonsSimilar = () => {
  if (!similarSliderContainer.value) return;
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

// Replacement Parts Cross-Selling Slider Logic
const replacementSliderContainer = ref<HTMLElement | null>(null);
const canScrollLeftReplacement = ref(false);
const canScrollRightReplacement = ref(false);
const needsScrollButtonsReplacement = ref(false);

const updateScrollButtonsReplacement = () => {
  if (!replacementSliderContainer.value) return;
  const container = replacementSliderContainer.value;
  const hasScroll = container.scrollWidth > container.clientWidth + 5;
  needsScrollButtonsReplacement.value = hasScroll;
  canScrollLeftReplacement.value = container.scrollLeft > 5;
  canScrollRightReplacement.value = container.scrollLeft < container.scrollWidth - container.clientWidth - 5;
};

const scrollLeftReplacement = () => {
  if (!replacementSliderContainer.value) return;
  replacementSliderContainer.value.scrollBy({ left: -300, behavior: 'smooth' });
  setTimeout(updateScrollButtonsReplacement, 300);
};

const scrollRightReplacement = () => {
  if (!replacementSliderContainer.value) return;
  replacementSliderContainer.value.scrollBy({ left: 300, behavior: 'smooth' });
  setTimeout(updateScrollButtonsReplacement, 300);
};

watch(
  () => replacementDisplayProducts.value?.length,
  async (hasProducts) => {
    if (hasProducts) {
      await nextTick();
      updateScrollButtonsReplacement();
      if (replacementSliderContainer.value) {
        replacementSliderContainer.value.addEventListener('scroll', updateScrollButtonsReplacement, { passive: true });
      }
    }
  },
);

// Basket Overlay Categories Slider Logic
const setCategorySliderRef = (el: unknown, index: number) => {
  if (el && basketOverlayCategorySliders.value[index]) {
    basketOverlayCategorySliders.value[index].containerRef = el as HTMLElement;
  }
};

const updateCategoryScrollButtons = (index: number) => {
  const slider = basketOverlayCategorySliders.value[index];
  if (!slider || !slider.containerRef) return;

  const container = slider.containerRef;
  const hasScroll = container.scrollWidth > container.clientWidth + 5;
  slider.needsScrollButtons = hasScroll;
  slider.canScrollLeft = container.scrollLeft > 5;
  slider.canScrollRight = container.scrollLeft < container.scrollWidth - container.clientWidth - 5;
};

const scrollCategoryLeft = (index: number) => {
  const slider = basketOverlayCategorySliders.value[index];
  if (!slider || !slider.containerRef) return;

  slider.containerRef.scrollBy({ left: -300, behavior: 'smooth' });
  setTimeout(() => updateCategoryScrollButtons(index), 300);
};

const scrollCategoryRight = (index: number) => {
  const slider = basketOverlayCategorySliders.value[index];
  if (!slider || !slider.containerRef) return;

  slider.containerRef.scrollBy({ left: 300, behavior: 'smooth' });
  setTimeout(() => updateCategoryScrollButtons(index), 300);
};

// Add scroll event listeners to category sliders
watch(
  () => basketOverlayCategorySliders.value.map((s) => s.products.length),
  async () => {
    await nextTick();
    basketOverlayCategorySliders.value.forEach((slider, index) => {
      if (slider.products.length > 0 && slider.containerRef) {
        // Remove previous handler before re-adding to avoid accumulation
        if (slider.scrollHandler) {
          slider.containerRef.removeEventListener('scroll', slider.scrollHandler);
        }
        const handler = () => updateCategoryScrollButtons(index);
        slider.scrollHandler = handler;
        updateCategoryScrollButtons(index);
        slider.containerRef.addEventListener('scroll', handler, { passive: true });
      }
    });
  },
  { deep: true },
);

// Recommended products from category 376 (like in cart.vue)
const recommendedProducts = ref<Product[]>([]);
const recommendedSliderContainer = ref<HTMLElement | null>(null);
const canScrollLeftRecommended = ref(false);
const canScrollRightRecommended = ref(false);
const needsScrollButtonsRecommended = ref(false);

// Filter nur Artikel mit availability ID >= 1 und <= 3
const availableRecommendedProducts = computed(() => {
  return recommendedProducts.value.filter((product) => {
    const availId = product.variation?.availabilityId ?? 0;
    return availId >= 1 && availId <= 3;
  });
});

// Load products from category 376 when modal opens
watch(
  isOpen,
  async (modalIsOpen) => {
    if (!modalIsOpen) return;

    try {
      const result = await useSdk().plentysystems.getFacet({
        categoryId: '376',
        page: 1,
        itemsPerPage: 12,
        sort: 'variation.position_asc',
      });

      if (result?.data?.products) {
        recommendedProducts.value = result.data.products;
        await nextTick();
        updateScrollButtonsRecommended();
      }
    } catch (error) {
      console.error('Error loading recommended products:', error);
    }
  },
  { immediate: true },
);

// Scroll Navigation for Recommended Products
const updateScrollButtonsRecommended = () => {
  if (!recommendedSliderContainer.value) return;

  const container = recommendedSliderContainer.value;
  const hasScroll = container.scrollWidth > container.clientWidth + 5;
  needsScrollButtonsRecommended.value = hasScroll;
  canScrollLeftRecommended.value = container.scrollLeft > 5;
  canScrollRightRecommended.value = container.scrollLeft < container.scrollWidth - container.clientWidth - 5;
};

const scrollLeftRecommended = () => {
  if (!recommendedSliderContainer.value) return;
  recommendedSliderContainer.value.scrollBy({ left: -300, behavior: 'smooth' });
  setTimeout(updateScrollButtonsRecommended, 300);
};

const scrollRightRecommended = () => {
  if (!recommendedSliderContainer.value) return;
  recommendedSliderContainer.value.scrollBy({ left: 300, behavior: 'smooth' });
  setTimeout(updateScrollButtonsRecommended, 300);
};

// Watch for products updates
watch(
  () => availableRecommendedProducts.value.length,
  async () => {
    await nextTick();
    updateScrollButtonsRecommended();
  },
);

onBeforeUnmount(() => {
  if (similarSliderContainer.value) {
    similarSliderContainer.value.removeEventListener('scroll', updateScrollButtonsSimilar);
  }
  if (replacementSliderContainer.value) {
    replacementSliderContainer.value.removeEventListener('scroll', updateScrollButtonsReplacement);
  }
  basketOverlayCategorySliders.value.forEach((slider) => {
    if (slider.containerRef && slider.scrollHandler) {
      slider.containerRef.removeEventListener('scroll', slider.scrollHandler);
      slider.scrollHandler = null;
    }
  });

  // Cleanup Mobile Header Height Tracking
  window.removeEventListener('resize', updateMobileHeaderHeight);
});

// Watch for modal open/close to update header height
watch(
  () => isOpen.value,
  async (modalIsOpen) => {
    await nextTick();
    updateMobileHeaderHeight();
  },
);
</script>

<style scoped>
/* Hide scrollbar but keep functionality */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Modal z-index muss höher sein als Overlay (z-998) */
.quick-checkout-modal {
  z-index: 999;
}
</style>
