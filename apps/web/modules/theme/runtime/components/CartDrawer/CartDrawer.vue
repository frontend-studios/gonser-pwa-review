<template>
  <Teleport to="body">
    <Transition name="cart-drawer">
      <div v-if="modelValue" class="cart-drawer fixed inset-0 z-[9999] flex justify-end" @click.self="closeDrawer">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-neutral-500/50 transition-opacity duration-300" @click="closeDrawer"></div>

        <!-- Drawer -->
        <div class="relative bg-white w-full max-w-[90vw] md:max-w-[460px] h-full flex flex-col shadow-xl" @click.stop>
          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-2.5 border-b border-gray">
            <h4 class="">{{ t('theme.cartDrawer.title') }}</h4>
            <button
              type="button"
              :aria-label="t('common.navigation.closeDialog')"
              class="text-black bg-gray-light hover:bg-gray w-10 h-10 rounded-[40px] transition-colors"
              @click="closeDrawer"
            >
              <SfIconClose />
            </button>
          </div>

          <!-- Cart Items List -->
          <div class="flex-1 overflow-y-auto">
            <div v-if="!cartIsEmpty">
              <div v-for="cartItem in cart?.items" :key="cartItem.id">
                <UiCartProductCard :cart-item="cartItem" context="drawer" />
              </div>
            </div>
            <div v-else class="h-full flex items-center justify-center">
              <div class="text-center">
                <!-- Empty Cart Message - vertically centered -->
                <p class="text-black mb-5">{{ t('theme.cartDrawer.cartEmpty') }}</p>
                <NuxtLink
                  class="rounded-[40px] py-2.5 px-6 bg-gray hover:bg-gray-dark text-black text-base font-semibold transition-colors"
                  @click="closeDrawer"
                >
                  {{ t('theme.cartDrawer.goShopping') }}
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div v-if="!cartIsEmpty" class="border-t border-gray bg-gray-light">
            <div class="px-6 py-4 space-y-4">
              <!-- GonserBox mit Fortschrittsbalken -->
              <UiGonserBox
                v-if="gonserBoxTotal > 0"
                :force-show="true"
                :compact="false"
                :hide-image="true"
                :hide-buttons="false"
                :hide-content-when-reached="true"
                :info-text1="t('theme.cartDrawer.gonserBoxInfo')"
                custom-class="!mb-0 !bg-transparent !p-0"
              />

              <!-- Order Summary -->
              <div class="space-y-2">
                <!-- Warenwert -->
                <!-- <div class="flex justify-between text-base">
                  <span>{{ t('theme.cartDrawer.itemsSubtotal') }}</span>
                  <span class="font-medium">{{ format(totals.subTotal) }}</span>
                </div> -->

                <!-- Versandkosten -->
                <div class="flex justify-between text-base">
                  <span class="font-semibold">{{ t('common.labels.delivery') }}</span>
                  <span class="font-semibold">{{ formatCustomPrice(cartGetters.getShippingPrice(cart)) }}</span>
                </div>

                <!-- Divider -->
                <UiDivider class="!my-3" />

                <!-- Gesamtsumme -->
                <div class="flex justify-between">
                  <div>
                    <span class="text-lg font-semibold">{{ t('theme.cartDrawer.total') }}</span>
                    <span class="text-xs ml-2">{{ t('theme.cartDrawer.vat') }}</span>
                  </div>
                  <span class="font-semibold">{{ formatCustomPrice(totals.total) }}</span>
                </div>

                <UiDivider class="!my-3" />
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-3 pt-2">
                <NuxtLink
                  :to="localePath(paths.cart)"
                  class="flex-1 inline-flex items-center justify-center rounded-[40px] py-2.5 px-6 bg-gray hover:bg-gray-dark text-black text-base font-semibold transition-colors"
                  @click="closeDrawer"
                >
                  {{ t('theme.cartDrawer.viewCart') }}
                </NuxtLink>
                <NuxtLink
                  :to="goToCheckout()"
                  class="flex-1 inline-flex items-center justify-center rounded-[40px] py-2.5 px-6 bg-[#20A33E] hover:bg-[#14832E] text-white text-base font-semibold transition-colors"
                  @click="closeDrawer"
                >
                  {{ t('theme.cartDrawer.checkout') }}
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Footer for Empty Cart with Recommended Products -->
          <div v-if="cartIsEmpty && recommendedProducts.length > 0" class="">
            <div class="overflow-y-auto max-h-[60vh]">
              <!-- Recommended Products from Category 2107 -->
              <h3 class="px-3 md:px-5 mb-3 mt-5 font-semibold text-black">
                {{ t('theme.cartDrawer.recommendedProducts') }}
              </h3>
              <div
                v-for="product in recommendedProducts"
                :key="productGetters.getId(product)"
                class="relative flex border-gray border-b pb-3 m-3 md:m-5 last:mb-0"
              >
                <!-- Product Image -->
                <div class="relative overflow-hidden rounded-md w-[100px] sm:w-[100px]">
                  <NuxtLink :to="getProductPath(product)" class="flex items-center justify-center" @click="closeDrawer">
                    <NuxtImg
                      v-if="getProductImage(product)"
                      :src="getProductImage(product)"
                      :alt="productGetters.getName(product)"
                      width="300"
                      height="300"
                      loading="lazy"
                      class="w-full h-auto border rounded-[10px] border-gray"
                    />
                  </NuxtLink>
                </div>

                <!-- Product Info -->
                <div class="flex flex-col pl-4 min-w-[180px] flex-1 justify-between">
                  <NuxtLink
                    :to="getProductPath(product)"
                    class="text-black w-fit no-underline text-base font-semibold line-clamp-1 max-w-[80%] md:max-w-[260px]"
                    @click="closeDrawer"
                  >
                    {{ productGetters.getName(product) }}
                  </NuxtLink>

                  <UiBadges
                    :product="product"
                    :use-tags="false"
                    :use-availability="true"
                    :show-availability-text="true"
                  />

                  <div class="items-end sm:mt-1 flex flex-row justify-between mt-auto">
                    <ClientOnly>
                      <div class="flex items-center gap-1 mb-1">
                        <SfRating
                          size="xs"
                          :half-increment="true"
                          :value="getProductRating(product) ?? 0"
                          :max="5"
                          class="[&>*]:-mx-px"
                        />
                        <span
                          class="inline-flex items-center before:content-['('] after:content-[')'] text-black text-xs"
                          >{{ getProductRatingCount(product) }}</span
                        >
                      </div>
                    </ClientOnly>
                    <span class="order-1 font-bold ml-auto">
                      <span class="text-black text-sm md:text-base font-semibold">CHF</span>
                      <span class="text-red ml-1 text-[20px] md:text-[22px] font-semibold">{{
                        formatPriceAmount(productGetters.getPrice(product) || 0)
                      }}</span>
                    </span>
                  </div>
                </div>

                <!-- Add to Cart Button (top right, styled like close button but with cart icon) -->
                <div v-if="addingToCart[productGetters.getId(product)]" class="absolute top-1 right-1 p-2">
                  <SfLoaderCircular aria-label="loading" size="sm" />
                </div>
                <button
                  v-else
                  type="button"
                  :aria-label="t('common.actions.addToCart')"
                  class="absolute top-0 right-0 p-2 bg-green-600 rounded-full hover:bg-[#14832E] transition-colors w-9 h-9 flex items-center justify-center"
                  @click="handleAddToCart(product)"
                >
                  <img
                    src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/Header/cart-white.svg"
                    alt="Add to cart"
                    class="w-5 h-5"
                  />
                </button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 pt-2 m-5">
              <NuxtLink
                :to="localePath(paths.cart)"
                class="flex-1 inline-flex items-center justify-center rounded-[40px] py-2.5 px-6 bg-gray hover:bg-gray-dark text-black text-base font-semibold transition-colors"
                @click="closeDrawer"
              >
                {{ t('theme.cartDrawer.viewCart') }}
              </NuxtLink>
              <NuxtLink
                :to="goToCheckout()"
                class="flex-1 inline-flex items-center justify-center rounded-[40px] py-2.5 px-6 bg-[#20A33E] hover:bg-[#14832E] text-white text-base font-semibold transition-colors"
                @click="closeDrawer"
              >
                {{ t('theme.cartDrawer.checkout') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { SfIconClose, SfLoaderCircular, SfRating } from '@storefront-ui/vue';
import {
  cartGetters,
  productGetters,
  productImageGetters,
  type Product,
  type DoAddItemParams,
} from '@plentymarkets/shop-api';
import { paths } from '~/utils/paths';
import { useGonserBoxCart } from '../../composables/useGonserBoxCart/useGonserBoxCart';

interface CartDrawerProps {
  modelValue: boolean;
}

const props = defineProps<CartDrawerProps>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const NuxtLink = resolveComponent('NuxtLink');
const localePath = useLocalePath();
const { format } = usePriceFormatter();
const { data: cart, cartIsEmpty, addToCart, setCartItemQuantity } = useCart();
const { isAuthorized } = useCustomer();
const { gonserBoxTotal } = useGonserBoxCart();
const { send } = useNotification();

// Recommended products for empty cart
const recommendedProducts = ref<Product[]>([]);
const productsLoaded = ref(false);
const loadingProducts = ref(false);
const addingToCart = ref<Record<string, boolean>>({});

// Load recommended products function using SDK directly
const loadRecommendedProducts = async () => {
  if (productsLoaded.value || !cartIsEmpty.value || loadingProducts.value) return;

  loadingProducts.value = true;
  try {
    const result = await useSdk().plentysystems.getFacet({
      categoryId: '2107',
      page: 1,
      itemsPerPage: 4,
    });

    if (result?.data?.products) {
      // Get first 4 products (position 0-3)
      recommendedProducts.value = result.data.products.slice(0, 4);
      productsLoaded.value = true;
    }
  } catch (error) {
    console.error('Error loading recommended products:', error);
  } finally {
    loadingProducts.value = false;
  }
};

const totals = computed(() => {
  const totalsData = cartGetters.getTotals(cart.value);
  return {
    total: totalsData.total,
    subTotal: totalsData.subtotal,
  };
});

const getShippingAmount = (amount: number) => {
  return format(Number(amount));
};

const goToCheckout = () => localePath(paths.checkout);

const closeDrawer = () => {
  emit('update:modelValue', false);
};

// Helper functions for recommended products
const getProductPath = (product: Product) => {
  return localePath(`/${productGetters.getSlug(product)}`);
};

const getProductImage = (product: Product) => {
  const firstImage = productImageGetters.getFirstImage(product);
  return firstImage ? productImageGetters.getImageUrl(firstImage) : '';
};

const formatPrice = (price: number) => {
  return format(price);
};

// Format price amount only (without currency)
const formatPriceAmount = (price: number) => {
  const fullPrice = format(price) || 'CHF 0.00';
  // "16,90 CHF" oder "CHF 16,90" → "16.90"
  const amount = fullPrice
    .replace(/CHF|EUR|USD/g, '')
    .trim()
    .replace(',', '.');
  return amount || '0.00';
};

// Format price with currency prefix: "CHF xx.xx"
const formatCustomPrice = (price: number) => {
  const formatted = format(price) || 'CHF 0.00';
  // "16,90 CHF" → "CHF 16.90"
  const amount = formatted
    .replace(/CHF|EUR|USD/g, '')
    .trim()
    .replace(',', '.');
  return `CHF ${amount}`;
};

// Get product rating
const getProductRating = (product: Product) => {
  return productGetters.getAverageRating(product, 'half');
};

// Get product rating count
const getProductRatingCount = (product: Product) => {
  return productGetters.getTotalReviews(product);
};

// Add product to cart
const handleAddToCart = async (product: Product) => {
  const productId = productGetters.getId(product);
  if (!productId) return;

  addingToCart.value[productId] = true;

  try {
    // Check if product already exists in cart
    const existingCartItem = cart.value?.items?.find((item) => item.variationId === Number(productId));

    if (existingCartItem) {
      // Product exists, increase quantity
      const newQuantity = existingCartItem.quantity + 1;
      await setCartItemQuantity({
        cartItemId: existingCartItem.id,
        productId: Number(productId),
        quantity: newQuantity,
      });
      send({ message: t('cart.itemAdded'), type: 'positive' });
    } else {
      // Product doesn't exist, add new
      const addToCartObject: DoAddItemParams = {
        productId: Number(productId),
        quantity: 1,
      };

      await addToCart(addToCartObject);
      send({ message: t('cart.itemAdded'), type: 'positive' });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    send({ message: t('cart.error'), type: 'negative' });
  } finally {
    addingToCart.value[productId] = false;
  }
};

// Close drawer on ESC key
onMounted(() => {
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && props.modelValue) {
      closeDrawer();
    }
  };
  window.addEventListener('keydown', handleEscape);
  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape);
  });
});

// Prevent body scroll when drawer is open and load products
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Load recommended products when drawer opens and cart is empty
      if (cartIsEmpty.value && !productsLoaded.value) {
        loadRecommendedProducts();
      }
    } else {
      document.body.style.overflow = '';
    }
  },
);
</script>

<style scoped>
.cart-drawer-enter-active,
.cart-drawer-leave-active {
  transition: all 0.3s ease;
}

.cart-drawer-enter-from,
.cart-drawer-leave-to {
  opacity: 0;
}

.cart-drawer-enter-from .bg-white,
.cart-drawer-leave-to .bg-white {
  transform: translateX(100%);
}

.cart-drawer-enter-active .bg-white,
.cart-drawer-leave-active .bg-white {
  transition: transform 0.3s ease;
}
.cart-drawer :deep(.gonser-box .mb-6.min-h-8) {
  min-height: unset;
  margin-bottom: 0.5rem;
}

.cart-drawer :deep(.gonser-box .flex.items-start.gap-1) {
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.cart-drawer :deep(.gonser-box .flex.items-start.gap-1 p.text-base.font-semibold) {
  margin-top: 0rem;
}
</style>
