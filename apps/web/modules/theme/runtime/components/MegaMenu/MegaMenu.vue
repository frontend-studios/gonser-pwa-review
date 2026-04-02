<template>
  <UiInfoBar />
  <header ref="referenceRef" :class="headerClass" class="relative w-full md:sticky z-10 bg-white">
    <!-- Navigation zuerst (nur ab md sichtbar) -->
    <slot name="top-nav" />

    <div class="w-full" data-testid="navbar-top" :style="{ backgroundColor: headerBackgroundColor }">
      <div
        class="w-full border-0 text-primary-500 px-4 md:px-6 lg:px-6 relative"
        @mouseenter="onDesktopHeaderAreaEnter"
      >
        <div class="flex justify-between items-center w-full lg:py-5 py-2">
          <NuxtLink
            :to="localePath(paths.home)"
            :aria-label="t('common.actions.goToHomepage')"
            class="logo md:max-w-none md:w-[280px] md:h-10 md:flex md:items-center shrink-0"
          >
            <UiLogo class="md:w-full md:h-full" />
          </NuxtLink>

          <div v-if="viewport.isLessThan('lg')" class="flex items-center gap-2">
            <slot name="mobile-actions" />
            <UiButton
              variant="tertiary"
              square
              :aria-label="isOpen ? t('common.navigation.closeMenu') : t('common.navigation.openMenu')"
              class="!p-0 bg-transparent active:bg-transparent"
              :style="{ color: iconColor }"
              @click="toggleMobileMenu()"
            >
              <img :src="mobileMenuIcon" aria-hidden="true" />
            </UiButton>
          </div>
          <slot v-else />
        </div>

        <div v-if="viewport.isLessThan('lg')" class="w-full pb-2">
          <slot name="mobile-search" />
        </div>
      </div>
    </div>

    <div v-if="viewport.isGreaterOrEquals('lg')">
      <nav ref="floatingRef" class="fs-desktop-nav">
        <ul
          class="fs-menu fs-main-categories lg:flex lg:flex-nowrap lg:items-center lg:justify-start lg:w-full lg:max-w-[1920px] lg:mx-auto lg:py-3 lg:gap-2.5"
          @blur="
            (event: FocusEvent) => {
              if (!(event.currentTarget as Element).contains(event.relatedTarget as Element)) {
                close();
              }
            }
          "
        >
          <li v-if="categoryTree.length === 0" class="fs-main-empty lg:h-10" />

          <li
            v-for="(menuNode, index) in categoryTree"
            v-else
            :key="index"
            :class="[
              'fs-main-category-item !bg-gray-light hover:!bg-gray lg:w-[200px] lg:flex-[0_1_200px] lg:min-w-0 lg:rounded-[5px]',
              {
                'fs-main-category-item--active !bg-gray':
                  isOpen && activeNode.length === 1 && activeNode[0] === menuNode.id,
              },
            ]"
            @mouseenter="onCategoryMouseEnter(menuNode)"
            @mouseleave="onCategoryMouseLeave"
          >
            <NuxtLink
              v-if="menuNode.childCount > 0"
              ref="triggerReference"
              :to="localePath(generateCategoryLink(menuNode))"
              data-testid="category-button"
              class="fs-main-category-link text-black hover:text-black focus-visible:text-black active:text-black lg:inline-flex lg:w-full lg:min-w-0 lg:items-center lg:justify-center lg:gap-2 lg:px-4 lg:py-2 lg:rounded-md lg:font-semibold lg:leading-6 lg:no-underline lg:cursor-pointer lg:transition-[background-color,color] lg:duration-200"
              tabindex="0"
              aria-haspopup="true"
              :aria-expanded="isOpen && activeNode[0] === menuNode.id ? 'true' : 'false'"
              @touchstart="onTouchStart"
              @mousedown="onMouseDown"
              @click.capture="onCategoryClickCapture($event, menuNode)"
              @keydown.enter="onEnterKey"
              @keydown.space.prevent="openMenuAndFocusFirst(menuNode)"
              @keydown.down.prevent="openMenuAndFocusFirst(menuNode)"
              @keydown.left="focusPreviousCategory(index)"
              @keydown.right="focusNextCategory(index)"
            >
              <span class="lg:max-w-full lg:whitespace-nowrap lg:overflow-hidden">{{
                categoryTreeGetters.getName(menuNode)
              }}</span>
            </NuxtLink>

            <NuxtLink
              v-else
              ref="triggerReference"
              :to="localePath(generateCategoryLink(menuNode))"
              data-testid="category-button"
              class="fs-main-category-link text-black hover:text-black focus-visible:text-black active:text-black lg:inline-flex lg:w-full lg:min-w-0 lg:items-center lg:justify-center lg:gap-2 lg:px-4 lg:py-2 lg:rounded-md lg:font-semibold lg:leading-6 lg:no-underline lg:cursor-pointer lg:transition-[background-color,color] lg:duration-200"
              tabindex="0"
              @keydown.left="focusPreviousCategory(index)"
              @keydown.right="focusNextCategory(index)"
            >
              <span class="lg:max-w-full lg:whitespace-nowrap lg:overflow-hidden">{{
                categoryTreeGetters.getName(menuNode)
              }}</span>
            </NuxtLink>

            <div
              v-if="
                isOpen &&
                activeMenu &&
                activeNode.length === 1 &&
                activeNode[0] === menuNode.id &&
                menuNode.childCount > 0
              "
              :key="activeMenu.id"
              ref="megaMenuReference"
              :style="style"
              class="fs-submenu fs-submenu-panel !bg-gray-light lg:relative lg:z-40 lg:w-full lg:p-6 lg:overflow-y-auto lg:rounded-[5px] lg:leading-[160%]"
              @mouseleave="onMouseLeave"
              @keydown.esc="focusTrigger(index)"
              @keydown.up="navigateDropdownItems($event, 'up')"
              @keydown.down="navigateDropdownItems($event, 'down')"
              @keydown.tab="handleTabInDropdown($event)"
            >
              <div class="fs-submenu-inner lg:flex lg:w-full lg:max-w-[1920px] lg:mx-auto lg:px-10 lg:justify-center">
                <div class="sub-wrapper fs-sub-wrapper lg:flex lg:items-start lg:justify-center lg:w-full">
                  <div
                    v-for="(column, columnIndex) in submenuColumns"
                    :key="`submenu-column-${columnIndex}`"
                    class="fs-sub-column lg:flex-[1_1_220px] lg:max-w-[220px] lg:min-w-0"
                  >
                    <template v-for="node in column" :key="node.id">
                      <template v-if="node.childCount === 0">
                        <ul class="fs-subcategory-group lg:m-0 lg:p-0">
                          <li>
                            <NuxtLink
                              :to="localePath(generateCategoryLink(node))"
                              class="fs-direct-subcategory text-red hover:bg-gray lg:block lg:rounded-md lg:text-base lg:font-semibold lg:no-underline lg:whitespace-normal lg:m-0 lg:mt-2"
                            >
                              {{ categoryTreeGetters.getName(node) }}
                            </NuxtLink>
                          </li>
                        </ul>
                      </template>
                      <div v-else class="fs-subcategory-group lg:m-0 lg:p-0">
                        <NuxtLink
                          :to="localePath(generateCategoryLink(node))"
                          class="fs-direct-subcategory fs-direct-subcategory--with-children text-red hover:bg-gray lg:block lg:rounded-md lg:text-base lg:font-semibold lg:no-underline lg:whitespace-normal lg:m-0 lg:mt-2"
                        >
                          {{ categoryTreeGetters.getName(node) }}
                        </NuxtLink>
                        <ul class="fs-subcategory-children">
                          <li v-for="child in node.children" :key="child.id">
                            <NuxtLink
                              v-if="categoryTreeGetters.getName(child)"
                              :to="localePath(generateCategoryLink(child))"
                              class="fs-subcategory-child text-black hover:bg-gray lg:block lg:rounded-md lg:text-sm lg:no-underline"
                            >
                              {{ categoryTreeGetters.getName(child) }}
                            </NuxtLink>
                          </li>
                        </ul>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </div>

    <template v-else>
      <div
        v-if="isOpen"
        class="fixed z-[50] left-0 right-0 bg-neutral-500 bg-opacity-50"
        :style="mobileDrawerOffsetStyle"
      />
      <SfDrawer
        ref="drawerReference"
        v-model="isOpen"
        placement="left"
        :disable-click-away="true"
        :style="mobileDrawerOffsetStyle"
        class="right-12 max-w-96 bg-white overflow-y-auto z-[1000]"
      >
        <nav>
          <ul v-if="activeMenu" class="mt-2 mb-6">
            <li v-if="activeMenu.id !== 0">
              <SfListItem
                size="lg"
                tag="button"
                type="button"
                class="border-b border-b-neutral-200 border-b-solid hover:bg-secondary-100"
                :aria-label="t('common.actions.back') + ' - ' + categoryTreeGetters.getName(activeMenu)"
                @click="goBack()"
              >
                <div class="flex items-center min-w-0">
                  <span class="inline-flex w-5 h-5 mr-2 items-center justify-center shrink-0" aria-hidden="true">
                    <img
                      src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/Header/Back.svg"
                      aria-hidden="true"
                      class="text-neutral-500"
                    />
                  </span>
                  <p class="font-semibold">Zurück</p>
                </div>
              </SfListItem>
            </li>
            <li v-if="activeMenu.id !== 0">
              <SfListItem
                size="lg"
                :tag="NuxtLink"
                :href="localePath(generateCategoryLink(activeMenu))"
                class="hover:bg-secondary-100"
                :aria-label="t('common.actions.back') + ' - ' + categoryTreeGetters.getName(activeMenu)"
              >
                <div class="flex items-center min-w-0">
                  <span class="inline-flex w-5 h-5 mr-2 items-center justify-center shrink-0" aria-hidden="true">
                    <img
                      :src="getCategoryIconUrl(activeMenu)"
                      class="w-full h-full object-contain"
                      alt=""
                      @error="onCategoryIconError($event, activeMenu)"
                      @load="onCategoryIconLoad($event, activeMenu)"
                    />
                  </span>
                  <p class="text-left font-semibold">{{ categoryTreeGetters.getName(activeMenu) }}</p>
                </div>
              </SfListItem>
            </li>
            <template v-for="node in activeMenu.children" :key="node.id">
              <li v-if="node.childCount === 0">
                <SfListItem
                  size="lg"
                  :tag="NuxtLink"
                  :href="localePath(generateCategoryLink(node))"
                  class="hover:bg-secondary-100"
                  @click="close()"
                >
                  <div class="flex items-center min-w-0">
                    <span class="inline-flex w-5 h-5 mr-2 items-center justify-center shrink-0" aria-hidden="true">
                      <img
                        :src="getCategoryIconUrl(node)"
                        class="w-full h-full object-contain"
                        alt=""
                        @error="onCategoryIconError($event, node)"
                        @load="onCategoryIconLoad($event, node)"
                      />
                    </span>
                    <p class="text-left">{{ categoryTreeGetters.getName(node) }}</p>
                  </div>
                </SfListItem>
              </li>
              <li v-else>
                <div class="flex items-center hover:bg-secondary-100">
                  <NuxtLink
                    class="flex-1 m-0 px-4 py-3 text-left"
                    :to="localePath(generateCategoryLink(node))"
                    @click="close()"
                  >
                    <div class="flex items-center min-w-0">
                      <span class="inline-flex w-5 h-5 mr-2 items-center justify-center shrink-0" aria-hidden="true">
                        <img
                          :src="getCategoryIconUrl(node)"
                          class="w-full h-full object-contain"
                          alt=""
                          @error="onCategoryIconError($event, node)"
                          @load="onCategoryIconLoad($event, node)"
                        />
                      </span>
                      <p class="text-left">{{ categoryTreeGetters.getName(node) }}</p>
                      <!-- <SfCounter class="ml-2">{{ categoryTreeGetters.getCount(node) }}</SfCounter> -->
                    </div>
                  </NuxtLink>
                  <button
                    type="button"
                    class="flex justify-center items-center h-full w-16 px-4"
                    :aria-label="t('common.navigation.showSubcategories') + ' - ' + categoryTreeGetters.getName(node)"
                    @click="goNext(node.id)"
                  >
                    <img
                      src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/Header/Continue.svg"
                      aria-hidden="true"
                      class="text-neutral-500"
                    />
                  </button>
                </div>
              </li>
            </template>
            <li>
              <SfListItem
                size="lg"
                :tag="NuxtLink"
                :href="localePath(paths.wishlist)"
                class="border-y border-y-neutral-200 border-y-solid hover:bg-secondary-100"
                :aria-label="t('common.labels.wishlist')"
                @click="close()"
              >
                <div class="flex items-center min-w-0">
                  <span class="inline-flex w-5 h-5 mr-2 items-center justify-center shrink-0" aria-hidden="true">
                    <img
                      src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/Header/Wishlist.svg"
                      class="w-full h-full object-contain"
                      alt=""
                    />
                  </span>
                  <p class="text-left">{{ t('common.labels.wishlist') }}</p>
                </div>
              </SfListItem>
            </li>
            <li>
              <SfListItem
                size="lg"
                :tag="NuxtLink"
                :href="localePath('/about-us')"
                class="hover:bg-secondary-100"
                :aria-label="t('theme.header.aboutUs')"
                @click="close()"
              >
                <p class="text-left">{{ t('theme.header.aboutUs') }}</p>
              </SfListItem>
            </li>
            <li>
              <SfListItem
                size="lg"
                :tag="NuxtLink"
                :href="localePath('/faq')"
                class="hover:bg-secondary-100"
                :aria-label="t('theme.header.faq')"
                @click="close()"
              >
                <p class="text-left">{{ t('theme.header.faq') }}</p>
              </SfListItem>
            </li>
            <li>
              <SfListItem
                size="lg"
                :tag="NuxtLink"
                :href="localePath(paths.contact)"
                class="hover:bg-secondary-100"
                :aria-label="t('theme.header.contact')"
                @click="close()"
              >
                <p class="text-left">{{ t('theme.header.contact') }}</p>
              </SfListItem>
            </li>
            <li v-if="localeCodes.length > 1" class="relative">
              <div
                v-if="isMobileLanguageDropdownOpen"
                class="absolute left-8 bottom-[calc(100%-0.25rem)] w-max bg-white border border-neutral-200 rounded-md overflow-hidden z-[1010]"
              >
                <button
                  v-for="(languageCode, index) in selectableMobileLanguageCodes"
                  :key="`mobile-language-${languageCode}`"
                  type="button"
                  :class="[
                    'relative w-full px-4 py-3 text-left hover:bg-secondary-100 whitespace-nowrap',
                    { 'fs-mobile-language-option--with-divider': index < selectableMobileLanguageCodes.length - 1 },
                  ]"
                  :aria-label="getLanguageAutonym(languageCode)"
                  @click="selectMobileLanguage(languageCode)"
                >
                  <span>{{ getLanguageAutonym(languageCode) }}</span>
                </button>
              </div>
              <SfListItem
                size="lg"
                tag="button"
                type="button"
                class="border-t border-t-neutral-200 border-t-solid hover:bg-secondary-100"
                :aria-label="t('common.navigation.languageSelector')"
                @click="toggleMobileLanguageDropdown"
              >
                <div class="flex w-full items-center justify-between">
                  <span class="inline-flex items-center gap-2 min-w-0">
                    <img
                      src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/Header/Language.svg"
                      class="w-5 h-5 object-contain shrink-0"
                      alt=""
                      aria-hidden="true"
                    />
                    <p class="text-left">{{ currentLanguageLabel }}</p>
                  </span>
                  <img
                    src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/Header/Vector.svg"
                    class="w-3 h-3 object-contain shrink-0"
                    alt=""
                    aria-hidden="true"
                  />
                </div>
              </SfListItem>
            </li>
          </ul>
        </nav>
      </SfDrawer>
    </template>
  </header>
</template>

<script lang="ts" setup>
import { SfDrawer, SfListItem, useTrapFocus, useDropdown } from '@storefront-ui/vue';
import { unrefElement } from '@vueuse/core';
import { type CategoryTreeItem, categoryTreeGetters } from '@plentymarkets/shop-api';
import { paths } from '~/utils/paths';
import type { MegaMenuProps } from '~/components/MegaMenu/types';

const props = defineProps<MegaMenuProps>();
const NuxtLink = resolveComponent('NuxtLink');

const viewport = useViewport();
const { locale, localeCodes } = useI18n();
const localePath = useLocalePath();
const { buildCategoryMenuLink, switchLocale } = useLocalization();
const { getCategoryTree } = useCategoryTree();
const router = useRouter();
const { close, open, isOpen, activeNode, category, setCategory } = useMegaMenu();
const { setDrawerOpen } = useDrawerState();
const { getSetting: getHeaderBackgroundColor } = useSiteSettings('headerBackgroundColor');
const { getSetting: getIconColor } = useSiteSettings('iconColor');
const { referenceRef, floatingRef, style } = useDropdown({
  isOpen,
  onClose: close,
  placement: 'bottom-start',
  middleware: [],
});
const iconColor = computed(() => getIconColor());
const mobileMenuIcon = computed(() =>
  isOpen.value
    ? 'https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/Header/HamburgerMenu2.svg'
    : 'https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/Header/HamburgerMenu1.svg',
);
const mobileHeaderHeight = ref(0);
const mobileDrawerOffsetStyle = computed(() => ({
  top: `${mobileHeaderHeight.value}px`,
  height: `calc(100dvh - ${mobileHeaderHeight.value}px)`,
}));
const CATEGORY_ICON_BASE_URL = 'https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/Header/Kategorien';

const headerBackgroundColor = computed(() => getHeaderBackgroundColor());

const isUsingTouch = ref(false);
const lastTouchTime = ref(0);
const normalizeName = (value: string) => value.toLowerCase().replace(/\/+$/, '').trim();
const shouldStripRoot = (node?: CategoryTreeItem) => {
  if (!node) return false;
  const name = normalizeName(categoryTreeGetters.getName(node) ?? '');
  if (!name) return false;
  return name.includes('.') && (node.children?.length ?? 0) > 0;
};
const filterRootTree = (categories: CategoryTreeItem[]) => {
  const tree = categoryTreeGetters.getTree(categories);
  const [root] = tree;
  if (root && tree.length === 1 && shouldStripRoot(root)) {
    return root.children ?? [];
  }
  return tree;
};
const fullCategoryTree = ref(categoryTreeGetters.getTree(props.categories));
const categoryTree = ref(filterRootTree(props.categories));
const drawerReference = ref();
const megaMenuReference = ref();
const triggerReference = ref();
const tappedCategories = ref<Map<number, boolean>>(new Map());
const TOUCH_DETECTION_THRESHOLD = 500;
const DESKTOP_MENU_OPEN_DELAY_MS = 180;
const DESKTOP_MENU_CLOSE_DELAY_MS = 180;
const pendingDesktopMenuOpen = ref<ReturnType<typeof setTimeout> | null>(null);
const pendingDesktopMenuClose = ref<ReturnType<typeof setTimeout> | null>(null);
const isMobileLanguageDropdownOpen = ref(false);
let removeHook: () => void;

const trapFocusOptions = {
  activeState: isOpen,
  arrowKeysUpDown: false,
  initialFocus: false,
} as const;

const activeMenu = computed(() => (category.value ? findNode(activeNode.value, category.value) : null));
const getSubmenuGroupWeight = (node: CategoryTreeItem) => {
  const visibleChildrenCount =
    node.children?.filter((child) => Boolean(categoryTreeGetters.getName(child))).length ?? 0;
  return 1 + visibleChildrenCount;
};

const submenuColumns = computed(() => {
  const children = activeMenu.value?.children ?? [];
  const columnCount = Math.min(5, Math.max(1, children.length));
  const columns: CategoryTreeItem[][] = Array.from({ length: columnCount }, () => []);
  const columnWeights = Array.from({ length: columnCount }, () => 0);

  children.forEach((node) => {
    let lightestColumnIndex = 0;

    for (let index = 1; index < columnWeights.length; index += 1) {
      const currentWeight = columnWeights[index] ?? Number.POSITIVE_INFINITY;
      const lightestWeight = columnWeights[lightestColumnIndex] ?? Number.POSITIVE_INFINITY;

      if (currentWeight < lightestWeight) {
        lightestColumnIndex = index;
      }
    }

    const column = columns[lightestColumnIndex];
    if (!column) return;

    column.push(node);
    columnWeights[lightestColumnIndex] = (columnWeights[lightestColumnIndex] ?? 0) + getSubmenuGroupWeight(node);
  });

  return columns.filter((column) => column.length > 0);
});
const headerClass = computed(() => ({ 'z-[1101]': isOpen.value }));
const languageAutonyms: Record<string, string> = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
};
const getLanguageAutonym = (languageCode: string) => languageAutonyms[languageCode] ?? languageCode.toUpperCase();
const currentLanguageLabel = computed(() => getLanguageAutonym(locale.value));
const mobileLanguageCodes = computed(() =>
  localeCodes.value.filter((languageCode) => ['de', 'en', 'fr'].includes(languageCode)),
);
const selectableMobileLanguageCodes = computed(() =>
  mobileLanguageCodes.value.filter((languageCode) => languageCode !== locale.value),
);

const findNode = (keys: number[], node: CategoryTreeItem): CategoryTreeItem => {
  if (keys.length > 1) {
    const [currentKey, ...restKeys] = keys;
    return findNode(restKeys, node.children?.find((child) => child.id === currentKey) || node);
  } else {
    return node.children?.find((child) => child.id === keys[0]) || node;
  }
};

const generateCategoryLink = (category: CategoryTreeItem) => {
  return buildCategoryMenuLink(category, fullCategoryTree.value);
};

const getCategoryIconUrl = (categoryNode: CategoryTreeItem) => {
  const categoryId = categoryTreeGetters.getId(categoryNode);
  return `${CATEGORY_ICON_BASE_URL}/category-${categoryId}.svg`;
};

const onCategoryIconError = (event: Event, categoryNode: CategoryTreeItem) => {
  const imageElement = event.currentTarget as HTMLImageElement | null;
  if (!imageElement) return;

  imageElement.style.display = 'none';
};

const onCategoryIconLoad = (event: Event, categoryNode: CategoryTreeItem) => {
  const imageElement = event.currentTarget as HTMLImageElement | null;
  if (!imageElement) return;

  imageElement.style.display = 'block';
};

const openMenu = (menuType: number[]) => {
  activeNode.value = menuType;
  open();
  setDrawerOpen(true);
};

const closeMobileMenu = () => {
  close();
  setDrawerOpen(false);
};

const toggleMobileLanguageDropdown = () => {
  isMobileLanguageDropdownOpen.value = !isMobileLanguageDropdownOpen.value;
};

const selectMobileLanguage = async (languageCode: string) => {
  if (languageCode !== locale.value) {
    await switchLocale(languageCode as never, false);
    await getCategoryTree();
  }

  isMobileLanguageDropdownOpen.value = false;
};

const toggleMobileMenu = () => {
  if (isOpen.value) {
    closeMobileMenu();
    return;
  }

  openMenu([]);
};

const updateMobileHeaderHeight = () => {
  const headerElement = referenceRef.value as HTMLElement | null | undefined;
  mobileHeaderHeight.value = headerElement?.offsetHeight ?? 0;
};

const setPageScrollLocked = (isLocked: boolean) => {
  if (typeof document === 'undefined') return;

  document.body.style.overflow = isLocked ? 'hidden' : '';
  document.documentElement.style.overflow = isLocked ? 'hidden' : '';
};

const goBack = () => {
  activeNode.value = activeNode.value.slice(0, -1);
};

const goNext = (key: number) => {
  activeNode.value = [...activeNode.value, key];
};

const focusTrigger = (index: number) => {
  unrefElement(triggerReference.value[index])?.focus();
};
const focusNextCategory = (currentIndex: number) => {
  const nextIndex = (currentIndex + 1) % categoryTree.value.length;
  focusTrigger(nextIndex);
};
const focusPreviousCategory = (currentIndex: number) => {
  const prevIndex = currentIndex === 0 ? categoryTree.value.length - 1 : currentIndex - 1;
  focusTrigger(prevIndex);
};
const openMenuAndFocusFirst = (menuNode: CategoryTreeItem) => {
  if (menuNode.childCount > 0) {
    onCategoryMouseEnter(menuNode, true);
    nextTick(() => {
      const firstLink = megaMenuReference.value?.[0]?.querySelector('a');
      firstLink?.focus();
    });
  }
};
const clearPendingDesktopMenuOpen = () => {
  if (!pendingDesktopMenuOpen.value) return;

  clearTimeout(pendingDesktopMenuOpen.value);
  pendingDesktopMenuOpen.value = null;
};
const clearPendingDesktopMenuClose = () => {
  if (!pendingDesktopMenuClose.value) return;

  clearTimeout(pendingDesktopMenuClose.value);
  pendingDesktopMenuClose.value = null;
};
const scheduleDesktopMenuClose = () => {
  if (!viewport.isGreaterOrEquals('lg') || !isOpen.value) return;

  clearPendingDesktopMenuOpen();
  clearPendingDesktopMenuClose();

  pendingDesktopMenuClose.value = setTimeout(() => {
    close();
    tappedCategories.value.clear();
    pendingDesktopMenuClose.value = null;
  }, DESKTOP_MENU_CLOSE_DELAY_MS);
};
const onEnterKey = () => {
  clearPendingDesktopMenuOpen();
  clearPendingDesktopMenuClose();
  close();
  tappedCategories.value.clear();
};
const navigateDropdownItems = (event: KeyboardEvent, direction: 'up' | 'down') => {
  event.preventDefault();
  const dropdown = megaMenuReference.value?.[0];
  if (!dropdown) return;
  const focusableItems = Array.from(dropdown.querySelectorAll('a')) as HTMLElement[];
  const currentIndex = focusableItems.findIndex((item) => item === document.activeElement);
  const nextIndex =
    direction === 'down'
      ? currentIndex < focusableItems.length - 1
        ? currentIndex + 1
        : 0
      : currentIndex > 0
        ? currentIndex - 1
        : focusableItems.length - 1;
  focusableItems[nextIndex]?.focus();
};
const handleTabInDropdown = (event: KeyboardEvent) => {
  const dropdown = megaMenuReference.value?.[0];
  if (!dropdown) return;
  const focusableItems = Array.from(dropdown.querySelectorAll('a')) as HTMLElement[];
  const currentIndex = focusableItems.findIndex((item) => item === document.activeElement);
  event.preventDefault();
  const nextIndex = event.shiftKey
    ? currentIndex > 0
      ? currentIndex - 1
      : focusableItems.length - 1
    : currentIndex < focusableItems.length - 1
      ? currentIndex + 1
      : 0;
  focusableItems[nextIndex]?.focus();
};

const onMouseLeave = () => {
  scheduleDesktopMenuClose();
};

const onDesktopHeaderAreaEnter = () => {
  scheduleDesktopMenuClose();
};

const onCategoryMouseLeave = () => {
  scheduleDesktopMenuClose();
};

const onCategoryMouseEnter = (menuNode: CategoryTreeItem, immediate = false) => {
  if (!viewport.isGreaterOrEquals('lg')) return;

  clearPendingDesktopMenuOpen();
  clearPendingDesktopMenuClose();

  if (menuNode.childCount > 0) {
    const openSelectedMenu = () => {
      activeNode.value = [menuNode.id];
      open();
      setCategory([menuNode]);
    };

    if (immediate || isOpen.value) {
      openSelectedMenu();
      return;
    }

    pendingDesktopMenuOpen.value = setTimeout(() => {
      openSelectedMenu();
      pendingDesktopMenuOpen.value = null;
    }, DESKTOP_MENU_OPEN_DELAY_MS);
    return;
  }

  if (category.value !== null) category.value = null;
};

const onTouchStart = () => {
  isUsingTouch.value = true;
  lastTouchTime.value = Date.now();
};
const onMouseDown = () => {
  const timeDiff = Date.now() - lastTouchTime.value;
  if (timeDiff > TOUCH_DETECTION_THRESHOLD) {
    isUsingTouch.value = false;
  }
};

const handleFirstTouch = (menuNode: CategoryTreeItem) => {
  tappedCategories.value.clear();
  tappedCategories.value.set(menuNode.id, true);
  onCategoryMouseEnter(menuNode, true);
};

const onCategoryClickCapture = (event: MouseEvent, menuNode: CategoryTreeItem) => {
  if (isUsingTouch.value && menuNode.childCount > 0 && !tappedCategories.value.get(menuNode.id)) {
    event.stopPropagation();
    event.preventDefault();
    handleFirstTouch(menuNode);
    return;
  }

  clearPendingDesktopMenuOpen();
  clearPendingDesktopMenuClose();
  close();
  tappedCategories.value.clear();
};

onMounted(() => {
  updateMobileHeaderHeight();
  window.addEventListener('resize', updateMobileHeaderHeight);
  removeHook = router.afterEach(() => close());
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateMobileHeaderHeight);
  clearPendingDesktopMenuOpen();
  clearPendingDesktopMenuClose();
  setPageScrollLocked(false);
  removeHook?.();
});

watch(
  () => isOpen.value,
  async (menuIsOpen) => {
    await nextTick();
    updateMobileHeaderHeight();

    if (!menuIsOpen) {
      isMobileLanguageDropdownOpen.value = false;
    }

    if (viewport.isLessThan('lg')) {
      setPageScrollLocked(menuIsOpen);
      return;
    }

    setPageScrollLocked(false);
  },
);

watch(
  () => props.categories,
  (categories: CategoryTreeItem[]) => {
    fullCategoryTree.value = categoryTreeGetters.getTree(categories);
    categoryTree.value = filterRootTree(categories);
    setCategory(categoryTree.value);
  },
);

watch(
  () => locale.value,
  async () => {
    await getCategoryTree();
  },
);

setCategory(categoryTree.value);

useTrapFocus(drawerReference, trapFocusOptions);
</script>

<style scoped>
.logo :deep(img) {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  padding: 0;
}

.fs-mobile-language-option--with-divider::after {
  content: '';
  position: absolute;
  left: 0.75rem;
  right: 0.75rem;
  bottom: 0;
  border-bottom: 1px solid var(--gray) !important;
}

@media (min-width: 768px) {
  .logo :deep(img) {
    width: 280px;
    height: 40px;
    max-width: none;
  }
}

@media (min-width: 1024px) {
  .fs-main-category-item {
    container-type: inline-size;
  }

  .fs-main-category-link {
    font-size: clamp(0.75rem, 8cqi, 1rem);
  }

  .fs-direct-subcategory {
    border-bottom: none;
  }

  .fs-sub-wrapper {
    max-width: calc((5 * 220px) + (4 * 1.5rem));
    /* gap: 1.5rem; */
  }

  .fs-subcategory-group {
    break-inside: avoid;
    -webkit-column-break-inside: avoid;
  }
}
</style>
