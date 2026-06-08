<template>
  <NuxtLayout
    name="checkout"
    :back-label-desktop="t('common.actions.back')"
    :back-label-mobile="t('common.actions.back')"
    :heading="t('cart.myCart')"
    :breadcrumbs="breadcrumbs"
  >
    <div v-if="!cartIsEmpty" class="@md:grid @md:grid-cols-12 @md:gap-x-6" data-testid="cart-page-content-test">
      <div class="col-span-7 mb-2 @md:mb-0">
        <div v-for="cartItem in cart?.items" :key="cartItem.id">
          <UiCartProductCard :cart-item="cartItem" context="cart" />
        </div>

        <!-- GonserBox mit Fortschrittsbalken -->
        <UiGonserBox
          v-if="gonserBoxTotal > 0"
          :force-show="true"
          :compact="false"
          :hide-image="false"
          :hide-buttons="false"
          :hide-content-when-reached="true"
          :info-text1="t('theme.cartDrawer.gonserBoxInfo')"
          custom-class="!bg-transparent !p-5 border border-gray rounded-[10px] mt-4"
        />
      </div>
      <div
        class="relative col-span-5 @md:sticky @md:top-10 h-fit"
        :class="{ 'pointer-events-none opacity-50': loading }"
      >
        <SfLoaderCircular v-if="loading" class="absolute top-[130px] right-0 left-0 m-auto z-[999]" size="2xl" />

        <Coupon context="cart" />

        <OrderSummary :cart="cart">
          <button
            data-testid="checkout-button"
            type="button"
            class="bg-[#20A33E] hover:bg-green-700 active:bg-green-700 text-white font-semibold py-3 px-6 rounded-[40px] transition-colors duration-200 w-full mb-4 @md:mb-0"
            @click="navigateTo(goToCheckout())"
          >
            {{ t('theme.cart.toCheckout') }}
          </button>
          <client-only>
            <PayPalExpressButton :disabled="loading" location="cartPage" class="mt-4" type="CartPreview" />
            <PayPalPayLaterBanner
              placement="cart"
              location="cartPage"
              :amount="cartGetters.getTotal(cartGetters.getTotals(cart))"
            />
          </client-only>
        </OrderSummary>
      </div>
      <!-- Gonser Recommended Products (Category 376) -->
      <div v-if="availableRecommendedProducts.length > 0" class="col-span-12 mt-6 pl-0">
        <h3 class="mb-4">{{ t('theme.cart.recommendedProducts') }}</h3>

        <div class="relative">
          <div
            ref="recommendedSliderContainer"
            class="overflow-x-auto scroll-smooth flex gap-4 pb-4 snap-x snap-mandatory scrollbar-hide"
            @scroll="updateScrollButtonsRecommended"
          >
            <div
              v-for="(product, index) in availableRecommendedProducts"
              :key="productGetters.getId(product)"
              class="flex-shrink-0 snap-start w-[calc((100%-1.5rem)/2.5)] @md:w-[calc((100%-2rem)/3)] @lg:w-[calc((100%-4rem)/5)]"
            >
              <ProductCard
                :product="product"
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
              v-if="needsScrollButtonsRecommended"
              :disabled="!canScrollLeftRecommended"
              type="button"
              class="hidden @md:block absolute left-0 -translate-x-1/2 top-1/4 -translate-y-1/2 rounded-full p-2 shadow-lg z-10 transition-all border"
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
              class="hidden @md:block absolute right-0 translate-x-1/2 top-1/4 -translate-y-1/2 rounded-full p-2 shadow-lg z-10 transition-all border"
              :class="{
                'cursor-not-allowed bg-white border-gray text-gray': !canScrollRightRecommended,
                'bg-gray-light border-gray-light text-black hover:bg-gray hover:border-gray': canScrollRightRecommended,
              }"
              @click="scrollRightRecommended"
            >
              <SfIconChevronRight class="w-5 h-5" />
            </button>
          </ClientOnly>
        </div>
      </div>
    </div>
    <div
      v-else
      class="flex items-center justify-center flex-col pt-24 pb-32"
      data-testid="cart-page-content-test-empty"
    >
      <h2 class="mt-8 typography-headline-3 font-bold">{{ t('cart.empty') }}</h2>
      <div class="mt-6">
        <ModuleComponentRendering area="cart.empty" />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { SfLoaderCircular, SfIconChevronLeft, SfIconChevronRight } from '@storefront-ui/vue';
import { cartGetters, productGetters, type Product, type DoAddItemParams } from '@plentymarkets/shop-api';
import type { Locale } from '#i18n';
import { useGonserBoxCart } from '../composables/useGonserBoxCart/useGonserBoxCart';
import { useGonserBoxProperty } from '../composables/useGonserBoxProperty/useGonserBoxProperty';
import ProductCard from '../components/ui/ProductCard/ProductCard.vue';

defineI18nRoute({
  locales: process.env.LANGUAGELIST?.split(',') as Locale[],
});

const { setPageMeta } = usePageMeta();

definePageMeta({ pageType: 'static' });

const NuxtLink = resolveComponent('NuxtLink');
const localePath = useLocalePath();
const { isAuthorized } = useCustomer();
const { data: cart, cartIsEmpty, loading, addToCart } = useCart();
const goToCheckout = () => (isAuthorized.value ? localePath(paths.checkout) : localePath(paths.guestLogin));
const { send } = useNotification();

const icon = 'page';
setPageMeta(t('common.labels.cart'), icon);

const { gonserBoxTotal } = useGonserBoxCart();
const { hasGonserBoxProperty } = useGonserBoxProperty();

// Breadcrumbs für Cart-Seite
const breadcrumbs = computed(() => [
  { name: t('common.labels.home'), link: '/' },
  { name: t('common.labels.cart'), link: localePath(paths.cart) },
]);

// Check if product is a GonserBox article
const isGonserBoxArticle = (product: Product): boolean => {
  return hasGonserBoxProperty(product);
};

// Recommended products from category 376 (ALWAYS shown)
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

// Load products from category 376 when component mounts using SDK directly
onMounted(async () => {
  try {
    const result = await useSdk().plentysystems.getFacet({
      categoryId: '376',
      page: 1,
      itemsPerPage: 12,
      sort: 'variation.position_asc', // Sortierung nach Position in der Kategorie
    });

    if (result?.data?.products) {
      recommendedProducts.value = result.data.products;
      await nextTick();
      updateScrollButtonsRecommended();
    }
  } catch (error) {
    console.error('Error loading recommended products:', error);
  }

  // ResizeObserver für automatische Anpassung bei Layout-Änderungen
  if (recommendedSliderContainer.value) {
    const resizeObserver = new ResizeObserver(() => {
      updateScrollButtonsRecommended();
    });
    resizeObserver.observe(recommendedSliderContainer.value);
  }

  // Window resize listener
  window.addEventListener('resize', updateScrollButtonsRecommended);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScrollButtonsRecommended);
});

// Scroll Navigation for Recommended Products
const updateScrollButtonsRecommended = () => {
  if (!recommendedSliderContainer.value) return;

  const container = recommendedSliderContainer.value;
  // Erhöhte Toleranz von 10px, um sicherzustellen dass Buttons nur bei echtem Scroll-Bedarf angezeigt werden
  const hasScroll = container.scrollWidth > container.clientWidth + 10;
  needsScrollButtonsRecommended.value = hasScroll;
  canScrollLeftRecommended.value = container.scrollLeft > 10;
  canScrollRightRecommended.value = container.scrollLeft < container.scrollWidth - container.clientWidth - 10;
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
    // Kurze Verzögerung, um sicherzustellen dass Layout vollständig gerendert ist
    setTimeout(() => {
      updateScrollButtonsRecommended();
    }, 100);
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
