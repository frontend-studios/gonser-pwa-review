<template>
  <UiModal
    v-if="isOpen"
    v-model="isOpen"
    tag="section"
    class="h-full md:h-fit m-0 p-0 lg:w-[1140px] overflow-y-auto"
    aria-label="quick-checkout-modal"
    @mousemove="endTimer()"
  >
    <header>
      <h2 class="font-bold text-lg leading-6 md:text-2xl">
        <span>{{ t('quickCheckout.heading') }}</span>
      </h2>
      <div class="absolute right-2 top-2 flex items-center">
        <span v-if="hasTimer" class="mr-2 text-gray-400">{{ timer }}s</span>
        <UiButton
          :aria-label="t('common.navigation.closeDialog')"
          data-testid="quick-checkout-close"
          square
          variant="tertiary"
          @click="close"
        >
          <SfIconClose />
        </UiButton>
      </div>
    </header>

    <div class="lg:grid lg:grid-cols-2 lg:gap-4">
      <div class="lg:border-r-2 flex flex-col items-center p-8">
        <NuxtImg
          :src="addModernImageExtension(productGetters.getMiddleImage(props.product))"
          :alt="imageAlt"
          :title="
            productImageGetters.getImageName(productImageGetters.getFirstImage(props.product))
              ? productImageGetters.getImageName(productImageGetters.getFirstImage(props.product))
              : null
          "
          width="240"
          height="240"
          loading="lazy"
          class="mb-3"
        />
        <div class="flex mb-1">
          <h1 class="font-bold typography-headline-4 break-word" data-testid="product-name">
            {{ productGetters.getName(props.product) }}
          </h1>
        </div>
        <div class="mb-3">
          <span class="self-center text-gray-600 sm:typography-headline-4 typography-headline-3">
            {{ t('account.ordersAndReturns.orderDetails.quantity') }}: {{ quantity }}
          </span>
        </div>

        <ProductPrice :product="props.product" />

        <div
          class="mb-4 font-normal typography-text-sm"
          data-testid="product-description"
          v-html="productGetters.getShortDescription(props.product)"
        />

        <div class="mt-4 typography-text-xs flex gap-1">
          <span>{{ t('common.labels.asterisk') }}</span>
          <span v-if="showNetPrices">{{ t('product.priceExclVAT') }}</span>
          <span v-else>{{ t('product.priceInclVAT') }}</span>
          <i18n-t keypath="shipping.excludedLabel" scope="global">
            <template #shipping>
              <SfLink
                :href="localePath(paths.shipping)"
                target="_blank"
                class="focus:outline focus:outline-offset-2 focus:outline-2 outline-secondary-600 rounded"
              >
                {{ t('common.labels.delivery') }}
              </SfLink>
            </template>
          </i18n-t>
        </div>

        <VariationProperties :product="lastUpdatedProduct" />
      </div>
      <div class="py-8 px-10">
        <div class="mb-8">
          <p class="font-medium text-base">{{ t('quickCheckout.cartContains', { count: cartItemsCount }) }}</p>
          <div class="grid grid-cols-2">
            <p class="text-base">{{ t('quickCheckout.subTotal') }}:</p>
            <p v-if="showNetPrices" data-testid="subtotal" class="font-medium text-right">
              {{ format(cartGetters.getItemSumNet(cart)) }}
            </p>
            <p v-else data-testid="subtotal" class="font-medium text-right">{{ format(totals.subTotal) }}</p>
          </div>
        </div>

        <UiButton
          data-testid="quick-checkout-cart-button"
          size="lg"
          class="w-full mb-3"
          variant="secondary"
          @click="goToPage(paths.cart)"
        >
          {{ t('quickCheckout.checkYourCart') }}
        </UiButton>

        <UiButton
          data-testid="quick-checkout-checkout-button"
          size="lg"
          class="w-full mb-4 md:mb-0"
          @click="goToCheckout()"
        >
          {{ t('common.actions.goToCheckout') }}
        </UiButton>
        <OrDivider v-if="isPaypalAvailable('quickCheckout').value" class="my-4" />
        <PayPalExpressButton
          class="w-full text-center"
          location="quickCheckout"
          type="CartPreview"
          @on-approved="isOpen = false"
        />
        <PayPalPayLaterBanner placement="payment" location="quickCheckout" :amount="totals.total" />
      </div>
    </div>

    <div v-if="similarDisplayProducts?.length > 0" class="fs-xselling-similar mt-6 px-8">
      <h2 class="text-[28px] font-semibold mb-4">{{ t('theme.ProductPage.similarProducts') }}</h2>

      <div class="relative">
        <div
          ref="similarSliderContainer"
          class="overflow-x-auto scroll-smooth flex gap-4 pb-4 snap-x snap-mandatory"
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

    <div v-if="replacementDisplayProducts?.length > 0" class="fs-xselling-replacement mt-6 px-8">
      <h2 class="text-[28px] font-semibold mb-4">{{ t('theme.ProductPage.replacementParts') }}</h2>

      <div class="relative">
        <div
          ref="replacementSliderContainer"
          class="overflow-x-auto scroll-smooth flex gap-4 pb-4 snap-x snap-mandatory"
          @scroll="updateScrollButtonsReplacement"
        >
          <div
            v-for="(replacementProduct, index) in replacementDisplayProducts"
            :key="productGetters.getVariationId(replacementProduct)"
            class="flex-shrink-0 snap-start w-[calc((100%-1.5rem)/2.5)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-4rem)/5)]"
          >
            <ProductCard :product="replacementProduct" :index="index" :lazy="index >= 5" />
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
      <div v-for="(slider, sliderIndex) in basketOverlayCategorySliders" :key="slider.categoryId" class="mb-6 px-8">
        <h2 class="text-[28px] font-semibold mb-4">{{ slider.categoryName || `Kategorie ${slider.categoryId}` }}</h2>

        <div class="relative">
          <div
            :ref="(el) => setCategorySliderRef(el, sliderIndex)"
            class="overflow-x-auto scroll-smooth flex gap-4 pb-4 snap-x snap-mandatory"
            @scroll="updateCategoryScrollButtons(sliderIndex)"
          >
            <div
              v-for="(categoryProduct, index) in slider.products"
              :key="productGetters.getVariationId(categoryProduct)"
              class="flex-shrink-0 snap-start w-[calc((100%-1.5rem)/2.5)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-4rem)/5)]"
            >
              <ProductCard :product="categoryProduct" :index="index" :lazy="index >= 5" />
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
  </UiModal>
</template>

<script setup lang="ts">
import { SfIconClose, SfLink, SfIconChevronLeft, SfIconChevronRight } from '@storefront-ui/vue';
import type { QuickCheckoutProps } from '~/components/QuickCheckout/types';
import type { Product } from '@plentymarkets/shop-api';
import { cartGetters, productGetters, productImageGetters, categoryTreeGetters } from '@plentymarkets/shop-api';
import ProductPrice from '~/components/ProductPrice/ProductPrice.vue';
// Theme Product Import
import ProductCard from '../../components/ui/ProductCard/ProductCard.vue';
import { paths } from '~/utils/paths';

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
const { showNetPrices } = useCart();
const localePath = useLocalePath();
const { data: cart, lastUpdatedCartItem } = useCart();
const { isAvailable: isPaypalAvailable, loadConfig } = usePayPal();
const { addModernImageExtension } = useModernImage();
const { isOpen, timer, startTimer, endTimer, closeQuickCheckout, hasTimer, quantity } = useQuickCheckout();
const cartItemsCount = computed(() => cart.value?.items?.reduce((price, { quantity }) => price + quantity, 0) ?? 0);
const { isAuthorized } = useCustomer();
const { data: categoryTree } = useCategoryTree();

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
  startTimer();
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
});

onUnmounted(() => endTimer());

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

const goToCheckout = () => (isAuthorized.value ? goToPage(paths.checkout) : goToPage(paths.guestLogin));

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
        updateCategoryScrollButtons(index);
        slider.containerRef.addEventListener('scroll', () => updateCategoryScrollButtons(index), { passive: true });
      }
    });
  },
  { deep: true },
);
</script>
