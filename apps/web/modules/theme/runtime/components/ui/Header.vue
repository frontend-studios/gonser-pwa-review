<template>
  <MegaMenu :categories="categoryTree">
    <template v-if="isDesktopNavigation">
      <UiSearch
        v-if="!isConfirmationPage"
        class="hidden lg:flex w-[785px] max-w-[785px] flex-[1_999_785px] min-w-0 [&_[data-testid='input']]:w-full [&_[data-testid='input']]:h-[50px] [&_[data-testid='input']]:!rounded-[40px] [&_[data-testid='input']]:overflow-hidden [&_[data-testid='input']]:!border-gray-dark [&_[data-testid='input']]:!bg-white [&_[data-testid='search-bar-input']]:min-w-0 [&_[data-testid='search-bar-input']]:w-full [&_[data-testid='search-bar-input']]:h-full [&_[data-testid='search-bar-input']]:!border-0 [&_[data-testid='search-bar-input']]:!rounded-[40px] [&_[data-testid='search-bar-input']]:bg-transparent"
      />
      <div class="hidden lg:flex lg:items-center lg:flex-nowrap shrink-0">
        <NuxtLink
          :to="localePath('/about-us')"
          class="text-black hover:text-black font-body font-normal text-base leading-[160%] whitespace-nowrap"
          >{{ t('theme.header.aboutUs') }}</NuxtLink
        >
        <NuxtLink
          :to="localePath('/faq')"
          class="ml-5 text-black hover:text-black font-body font-normal text-base leading-[160%] whitespace-nowrap"
          >{{ t('theme.header.faq') }}</NuxtLink
        >
        <NuxtLink
          :to="localePath(paths.contact)"
          class="ml-5 text-black hover:text-black font-body font-normal text-base leading-[160%] whitespace-nowrap"
        >
          {{ t('theme.header.contact') }}
        </NuxtLink>
        <span class="mx-2 h-5 w-px bg-neutral-300" aria-hidden="true" />
        <div v-if="desktopLanguageCodes.length > 1" ref="desktopLanguageSelectorRef" class="relative">
          <button
            type="button"
            class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-transparent text-black font-body text-base font-normal leading-[1.6]"
            :aria-label="t('common.navigation.languageSelector')"
            :disabled="(showConfigurationDrawer && isEditing) || (showConfigurationDrawer && disableActions)"
            @click="toggleDesktopLanguageDropdown"
          >
            <span>{{ currentDesktopLanguageCode }}</span>
            <img
              src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/Header/Vector.svg"
              class="w-3 h-3 object-contain shrink-0"
              alt=""
              aria-hidden="true"
            />
          </button>

          <div
            v-if="isDesktopLanguageDropdownOpen"
            class="absolute left-0 top-[calc(100%+0.25rem)] min-w-16 bg-white border border-gray-200 rounded-md overflow-hidden z-20"
          >
            <button
              v-for="(languageCode, index) in selectableDesktopLanguageCodes"
              :key="`desktop-language-${languageCode}`"
              type="button"
              :class="[
                'w-full text-left px-3 py-2 bg-white text-black hover:bg-gray-light hover:text-red',
                { 'border-b border-gray-200': index < selectableDesktopLanguageCodes.length - 1 },
              ]"
              :aria-label="languageCode.toUpperCase()"
              @click="selectDesktopLanguage(languageCode)"
            >
              {{ languageCode.toUpperCase() }}
            </button>
          </div>
        </div>
        <span class="mx-2 h-5 w-px bg-neutral-300" aria-hidden="true" />
        <UiButton
          v-if="isAuthorized"
          class="group relative text-black !bg-gray-light hover:!bg-gray active:!bg-gray !w-10 !h-10 !min-w-10 !rounded-full !p-0 inline-flex items-center justify-center [&_svg]:w-6 [&_svg]:h-6"
          :tag="NuxtLink"
          :to="localePath(paths.account)"
          :style="{ color: iconColor }"
          :aria-label="t('account.heading')"
          variant="tertiary"
          square
          data-testid="account-page-navigation"
        >
          <template #prefix>
            <!-- <SfIconPerson /> -->
            <img src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/Header/Account.svg" />
          </template>
        </UiButton>
        <UiButton
          v-else
          :style="{ color: iconColor }"
          class="group relative text-black !bg-gray-light hover:!bg-gray active:!bg-gray !w-10 !h-10 !min-w-10 !rounded-full !p-0 inline-flex items-center justify-center [&_svg]:w-6 [&_svg]:h-6"
          variant="tertiary"
          square
          :aria-label="t('authentication.login.openLoginForm')"
          @click="navigateToLogin"
        >
          <template #prefix>
            <!-- <SfIconPerson /> -->
            <img src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/Header/Account.svg" />
          </template>
        </UiButton>
        <UiButton
          class="group relative hover:!bg-gray active:!bg-gray ml-3 text-black !bg-gray-light !w-10 !h-10 !min-w-10 !rounded-full !p-0 inline-flex items-center justify-center [&_svg]:w-6 [&_svg]:h-6"
          :tag="NuxtLink"
          :to="localePath(paths.wishlist)"
          :style="{ color: iconColor }"
          :aria-label="t('cart.numberInWishlist', { count: wishlistItemIds.length })"
          variant="tertiary"
          square
          data-testid="wishlist-page-navigation"
        >
          <template #prefix>
            <span class="relative inline-flex">
              <!-- <SfIconFavorite /> -->
              <img src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/Header/Wishlist.svg" />
              <!-- <SfBadge
                  :content="wishlistItemIds.length"
                  :style="{
                    backgroundColor: iconColor,
                    outlineColor: headerBackgroundColor,
                    color: headerBackgroundColor,
                  }"
                  class="fw-badge-offset outline group-hover:outline-primary-800 group-active:outline-primary-700 flex justify-center items-center text-xs min-w-[16px] min-h-[16px]"
                  data-testid="wishlist-badge"
                  placement="top-right"
                  :max="99"
                /> -->
            </span>
          </template>
        </UiButton>
        <UiButton
          class="group relative hover:!bg-gray active:!bg-gray ml-3 text-black !bg-gray-light !w-10 !h-10 !min-w-10 !rounded-full !p-0 inline-flex items-center justify-center [&_svg]:w-6 [&_svg]:h-6"
          :style="{ color: iconColor }"
          :aria-label="t('cart.numberInCart', { count: cartItemsCount })"
          variant="tertiary"
          square
          @click="openCartDrawer"
        >
          <template #prefix>
            <span class="relative inline-flex">
              <!-- <SfIconShoppingCart /> -->
              <img src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/Header/Cart.svg" />
              <SfBadge
                v-if="cartItemsCount > 0"
                :content="cartItemsCount"
                class="absolute !top-0 !right-0 !translate-x-[80%] !-translate-y-[80%] w-5 h-5 rounded-[14px] gap-2.5 opacity-100 group-hover:outline-primary-800 group-active:outline-primary-700 flex justify-center items-center text-xs min-w-4 min-h-4 !bg-red text-white"
                data-testid="cart-badge"
                :max="99"
              />
            </span>
          </template>
        </UiButton>
      </div>
    </template>

    <template #mobile-actions>
      <UiButton
        v-if="isAuthorized"
        class="group relative text-black !bg-gray-light !w-10 !h-10 !min-w-10 !rounded-full !p-0 inline-flex items-center justify-center [&_svg]:w-6 [&_svg]:h-6"
        :tag="NuxtLink"
        :to="localePath(paths.account)"
        :style="{ color: iconColor }"
        :aria-label="t('account.heading')"
        variant="tertiary"
        square
        data-testid="account-page-navigation"
      >
        <template #prefix>
          <img src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/Header/Account.svg" />
        </template>
      </UiButton>
      <UiButton
        v-else
        :style="{ color: iconColor }"
        class="group relative text-black !bg-gray-light !w-10 !h-10 !min-w-10 !rounded-full !p-0 inline-flex items-center justify-center [&_svg]:w-6 [&_svg]:h-6"
        variant="tertiary"
        square
        :aria-label="t('authentication.login.openLoginForm')"
        @click="navigateToLogin"
      >
        <template #prefix>
          <img src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/Header/Account.svg" />
        </template>
      </UiButton>
      <UiButton
        class="group relative hover:!bg-header-400 active:!bg-header-400 text-black !bg-gray-light !w-10 !h-10 !min-w-10 !rounded-full !p-0 inline-flex items-center justify-center [&_svg]:w-6 [&_svg]:h-6"
        :style="{ color: iconColor }"
        :aria-label="t('cart.numberInCart', { count: cartItemsCount })"
        variant="tertiary"
        square
        @click="openCartDrawer"
      >
        <template #prefix>
          <span class="relative inline-flex">
            <img src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/Header/Cart.svg" />
            <SfBadge
              v-if="cartItemsCount > 0"
              :content="cartItemsCount"
              class="absolute !top-0 !right-0 !translate-x-[80%] !-translate-y-[80%] w-5 h-5 rounded-[14px] gap-2.5 opacity-100 group-hover:outline-primary-800 group-active:outline-primary-700 flex justify-center items-center text-xs min-w-4 min-h-4 !bg-red text-white"
              data-testid="cart-badge"
              :max="99"
            />
          </span>
        </template>
      </UiButton>
    </template>

    <template #mobile-search>
      <UiSearch
        v-if="!isConfirmationPage"
        class="w-full [&_[data-testid='input']]:w-full [&_[data-testid='input']]:h-[50px] [&_[data-testid='input']]:!rounded-[40px] [&_[data-testid='input']]:overflow-hidden [&_[data-testid='input']]:!border-gray-dark [&_[data-testid='input']]:!bg-white [&_[data-testid='search-bar-input']]:min-w-0 [&_[data-testid='search-bar-input']]:w-full [&_[data-testid='search-bar-input']]:h-full [&_[data-testid='search-bar-input']]:!border-0 [&_[data-testid='search-bar-input']]:!rounded-[40px] [&_[data-testid='search-bar-input']]:bg-transparent"
      />
    </template>
  </MegaMenu>
  <UiModal
    v-if="shouldUseDesktopAuthModal && isAuthenticationOpen"
    v-model="isAuthenticationOpen"
    tag="section"
    class="h-full md:w-[500px] md:h-fit m-0 p-0 overflow-y-auto"
  >
    <header>
      <UiButton
        :aria-label="t('common.navigation.closeDialog')"
        square
        variant="tertiary"
        class="absolute right-2 top-2"
        @click="closeAuthentication"
      >
        <SfIconClose />
      </UiButton>
    </header>
    <LoginComponent
      v-if="isLogin"
      :is-modal="true"
      @change-view="isLogin = false"
      @logged-in="navigateAfterAuth(true)"
    />
    <Register v-else :is-modal="true" @change-view="isLogin = true" @registered="closeAuthentication" />
  </UiModal>

  <!-- Cart Drawer -->
  <CartDrawer v-model="isCartDrawerOpen" />
</template>

<script setup lang="ts">
import { SfBadge, SfIconClose, useDisclosure } from '@storefront-ui/vue';
import { onClickOutside } from '@vueuse/core';
import { paths } from '~/utils/paths';

const isLogin = ref(true);
const { data: cart } = useCart();
const { wishlistItemIds } = useWishlist();
const cartItemsCount = ref(0);
const { getSetting: getIconColor } = useSiteSettings('iconColor');

const iconColor = computed(() => getIconColor());
const desktopLanguageSelectorRef = ref<HTMLElement | null>(null);
const isDesktopLanguageDropdownOpen = ref(false);
const isCartDrawerOpen = ref(false);

const NuxtLink = resolveComponent('NuxtLink');
const { locale, localeCodes } = useI18n();
const route = useRoute();
const localePath = useLocalePath();
const { isOpen: isAuthenticationOpen, open: openAuthentication, close: closeAuthentication } = useDisclosure();
const { switchLocale } = useLocalization();
const { data: categoryTree, getCategoryTree } = useCategoryTree();
const { isAuthorized } = useCustomer();
const viewport = useViewport();
const { isMobilePreview, isInEditor, device } = useEditorState();
const runtimeConfig = useRuntimeConfig();
const showConfigurationDrawer = runtimeConfig.public.showConfigurationDrawer;
const { isEditing, disableActions } = useEditor();
const isEditorMobileOrTablet = computed(() => isInEditor.value && device.value !== 'desktop');
const isDesktopNavigation = computed(
  () => viewport.isGreaterOrEquals('lg') && !isMobilePreview.value && !isEditorMobileOrTablet.value,
);
const shouldUseDesktopAuthModal = computed(
  () => viewport.isGreaterOrEquals('md') && !isMobilePreview.value && !isEditorMobileOrTablet.value,
);
const desktopLanguageCodes = computed(() =>
  localeCodes.value.filter((languageCode) => ['de', 'en', 'fr'].includes(languageCode)),
);
const currentDesktopLanguageCode = computed(() => locale.value.toUpperCase());
const selectableDesktopLanguageCodes = computed(() =>
  desktopLanguageCodes.value.filter((languageCode) => languageCode !== locale.value),
);
const isConfirmationPage = computed(
  () => route.path.startsWith('/confirmation') || route.path.includes('/confirmation/'),
);

const toggleDesktopLanguageDropdown = () => {
  isDesktopLanguageDropdownOpen.value = !isDesktopLanguageDropdownOpen.value;
};

const selectDesktopLanguage = async (languageCode: string) => {
  if (languageCode !== locale.value) {
    await switchLocale(languageCode as never, false);
    await getCategoryTree();
  }

  isDesktopLanguageDropdownOpen.value = false;
};

onClickOutside(desktopLanguageSelectorRef, () => {
  isDesktopLanguageDropdownOpen.value = false;
});

onNuxtReady(async () => {
  if (categoryTree.value.length === 0) await getCategoryTree();
  cartItemsCount.value = cart.value?.items?.reduce((price, { quantity }) => price + quantity, 0) ?? 0;
});

const navigateAfterAuth = (reload: boolean) => {
  if (reload) {
    window.location.reload();
  } else {
    closeAuthentication();
  }
};

watch(
  () => cart.value?.items,
  (cartItems) => {
    cartItemsCount.value = cartItems?.reduce((price, { quantity }) => price + quantity, 0) ?? 0;
  },
);

watch(
  () => isAuthenticationOpen.value,
  () => (isLogin.value = true),
);

const navigateToLogin = () => {
  if (route.path !== localePath(paths.authLogin)) {
    openAuthentication();
  }
};

const openCartDrawer = () => {
  isCartDrawerOpen.value = true;
};
</script>
