<template>
  <div v-if="shouldDisplay" class="recently-viewed-products w-full">
    <div class="max-w-screen-2xl mx-auto">
      <!-- Headline -->
      <div class="mb-6">
        <h3 class="mb-4">
          {{ title || t('theme.recentlyViewed.headline') }}
        </h3>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <SfLoaderCircular size="lg" />
      </div>

      <!-- Products Grid -->
      <div v-else-if="products.length > 0" class="relative">
        <!-- Horizontal Layout mit Slider -->
        <template v-if="props.layout === 'horizontal'">
          <!-- Scroll Navigation Buttons -->
          <button
            v-if="needsScrollButtons"
            :disabled="!canScrollLeft"
            type="button"
            class="hidden md:block absolute left-0 -translate-x-1/2 top-1/4 -translate-y-1/2 rounded-full p-2 shadow-lg z-10 transition-all border"
            :class="{
              'cursor-not-allowed bg-white border-gray text-gray': !canScrollLeft,
              'bg-gray-light border-gray-light text-black hover:bg-gray hover:border-gray': canScrollLeft,
            }"
            :aria-label="t('theme.recentlyViewed.scrollLeft')"
            @click="scrollLeft"
          >
            <SfIconChevronLeft class="w-5 h-5" />
          </button>

          <button
            v-if="needsScrollButtons"
            :disabled="!canScrollRight"
            type="button"
            class="hidden md:block absolute right-0 translate-x-1/2 top-1/4 -translate-y-1/2 rounded-full p-2 shadow-lg z-10 transition-all border"
            :class="{
              'cursor-not-allowed bg-white border-gray text-gray': !canScrollRight,
              'bg-gray-light border-gray-light text-black hover:bg-gray hover:border-gray': canScrollRight,
            }"
            :aria-label="t('theme.recentlyViewed.scrollRight')"
            @click="scrollRight"
          >
            <SfIconChevronRight class="w-5 h-5" />
          </button>

          <!-- Products Slider -->
          <div
            ref="sliderContainer"
            class="overflow-x-auto scroll-smooth flex gap-4 pb-4 snap-x snap-mandatory scrollbar-hide"
            @scroll="updateScrollButtons"
          >
            <div
              v-for="(product, index) in displayProducts"
              :key="productGetters.getId(product)"
              class="flex-shrink-0 snap-start min-w-[155px] w-[calc((100%-1.5rem)/2.5)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-4rem)/5)]"
            >
              <UiProductCard :product="product" :lazy="index >= 5" />
            </div>
          </div>
        </template>

        <!-- Vertical Layout als Grid -->
        <template v-else>
          <div class="flex flex-col gap-4">
            <div v-for="product in displayProducts" :key="productGetters.getId(product)">
              <UiProductCard :product="product" />
            </div>
          </div>
        </template>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 text-gray-500">
        <p>{{ t('theme.recentlyViewed.empty') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { productGetters } from '@plentymarkets/shop-api';
import { SfLoaderCircular, SfIconChevronLeft, SfIconChevronRight } from '@storefront-ui/vue';
import { useRecentlyViewed } from '../../../composables/useRecentlyViewed/useRecentlyViewed';
import type { RecentlyViewedProductsProps } from './types';

const props = withDefaults(defineProps<RecentlyViewedProductsProps>(), {
  maxItems: 10,
  autoFetch: true,
  showEmpty: false,
  layout: 'horizontal',
});

const { items: products, loading, fetchProducts } = useRecentlyViewed();
const { t } = useI18n();

const sliderContainer = ref<HTMLElement | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
const needsScrollButtons = ref(false);
const reviewsLoaded = ref(false);
const reviewMap = ref<Record<number, { feedbackCount: string; feedbackDecimal: string }>>({});

// Lade Review-Daten CLIENT-ONLY (Review API ist nicht SSR-kompatibel)
watch(
  products,
  async (productList) => {
    // Nur im Browser ausführen
    if (!import.meta.client) return;
    if (!productList || productList.length === 0) {
      reviewsLoaded.value = true;
      return;
    }

    reviewsLoaded.value = false;

    await Promise.all(
      productList.map(async (product) => {
        if (!product.item?.id) return;

        const itemId = product.item.id;
        try {
          const reviewResponse = await useSdk().plentysystems.getReview({
            itemId: Number(itemId),
            feedbacksPerPage: 1,
            page: 1,
          });

          if (reviewResponse.data?.counts) {
            reviewMap.value[itemId] = {
              feedbackCount: String(reviewResponse.data.counts.ratingsCountTotal || 0),
              feedbackDecimal: String(Number(reviewResponse.data.counts.averageValue) || 0),
            };
          }
        } catch (error) {
          // Reviews sind nicht kritisch - silent fail
        }
      }),
    );

    reviewsLoaded.value = true;
  },
  { immediate: true },
);

// Limitiere Produktanzahl
const displayProducts = computed(() => {
  // Nur Produkte zurückgeben wenn Reviews geladen sind
  if (!import.meta.client || !reviewsLoaded.value) {
    return [];
  }
  const map = reviewMap.value;
  return products.value.slice(0, props.maxItems).map((p) => {
    if (!p.item?.id) return p;
    const review = map[p.item.id];
    if (!review) return p;
    return { ...p, item: { ...p.item, feedbackCount: review.feedbackCount, feedbackDecimal: review.feedbackDecimal } };
  });
});

// Zeige Komponente nur wenn Produkte vorhanden oder showEmpty=true
const shouldDisplay = computed(() => {
  if (props.showEmpty) return true;
  return displayProducts.value.length > 0;
});

// Scroll Navigation
const updateScrollButtons = () => {
  if (!sliderContainer.value) return;

  const container = sliderContainer.value;
  const hasScroll = container.scrollWidth > container.clientWidth + 5;
  needsScrollButtons.value = hasScroll;
  canScrollLeft.value = container.scrollLeft > 5;
  canScrollRight.value = container.scrollLeft < container.scrollWidth - container.clientWidth - 5;
};

const scrollLeft = () => {
  if (!sliderContainer.value) return;
  sliderContainer.value.scrollBy({ left: -300, behavior: 'smooth' });
  setTimeout(updateScrollButtons, 300);
};

const scrollRight = () => {
  if (!sliderContainer.value) return;
  sliderContainer.value.scrollBy({ left: 300, behavior: 'smooth' });
  setTimeout(updateScrollButtons, 300);
};

// Auto-fetch beim Mount
onMounted(async () => {
  if (props.autoFetch) {
    await fetchProducts();

    // Nur bei horizontalem Layout Scroll-Buttons initialisieren
    if (props.layout === 'horizontal') {
      await nextTick();
      updateScrollButtons();

      // Event-Listener hinzufügen
      if (sliderContainer.value) {
        sliderContainer.value.addEventListener('scroll', updateScrollButtons);
      }
    }
  }
});

// Cleanup
onBeforeUnmount(() => {
  if (sliderContainer.value) {
    sliderContainer.value.removeEventListener('scroll', updateScrollButtons);
  }
});

// Watch für Produkt-Updates (nur bei horizontalem Layout)
watch(
  () => displayProducts.value.length,
  async () => {
    if (props.layout === 'horizontal') {
      await nextTick();
      updateScrollButtons();
    }
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
</style>
