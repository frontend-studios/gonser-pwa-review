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
        <div class="flex justify-between items-center w-full lg:max-w-screen-2xl lg:mx-auto lg:py-5 py-2">
          <NuxtLink
            :to="localePath(paths.home)"
            :aria-label="t('common.actions.goToHomepage')"
            class="logo w-[175px] h-[25px] flex items-center md:max-w-none md:w-[280px] md:h-10 shrink-0"
          >
            <UiLogo class="w-full h-full" />
          </NuxtLink>

          <div v-if="isMobileNavigation" class="flex items-center gap-2.5">
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

        <div v-if="isMobileNavigation" class="w-full pt-2 pb-px">
          <slot name="mobile-search" />
        </div>
      </div>
    </div>

    <div v-if="isDesktopNavigation">
      <nav ref="floatingRef" class="fs-desktop-nav px-4 md:px-6" @mouseleave="onMouseLeave">
        <ul
          class="fs-menu fs-main-categories lg:flex lg:flex-nowrap lg:items-center lg:justify-start lg:w-full lg:max-w-screen-2xl lg:mx-auto lg:py-3 lg:gap-3"
          @focusout="handleDesktopMenuBlur"
        >
          <li v-if="categoryTree.length === 0" class="fs-main-empty lg:h-10" />

          <li
            v-for="(menuNode, index) in categoryTree"
            v-else
            :key="index"
            :style="getDesktopMainCategoryItemStyle(menuNode)"
            :class="[
              'fs-main-category-item !bg-gray-light hover:!bg-gray lg:min-w-0 lg:rounded-[5px]',
              {
                'fs-main-category-item--selected !bg-primary-500 hover:!bg-primary-500':
                  isDesktopMainCategorySelected(menuNode),
                'fs-main-category-item--active !bg-gray':
                  isOpen &&
                  activeNode.length === 1 &&
                  activeNode[0] === menuNode.id &&
                  !isDesktopMainCategorySelected(menuNode),
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
              :style="desktopMainCategoryLinkStyle"
              :class="[
                'fs-main-category-link text-black hover:text-black focus-visible:text-black active:text-black lg:inline-flex lg:w-full lg:min-w-0 lg:items-center lg:justify-center lg:gap-2 lg:py-2 lg:rounded-md lg:font-semibold lg:leading-6 lg:no-underline lg:cursor-pointer lg:transition-[background-color,color] lg:duration-200',
                'lg:uppercase',
                'lg:px-[clamp(0.25rem,2cqi,1rem)]',
                {
                  '!text-white hover:!text-white focus-visible:!text-white active:!text-white':
                    isDesktopMainCategorySelected(menuNode),
                },
              ]"
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
              :style="desktopMainCategoryLinkStyle"
              :class="[
                'fs-main-category-link text-black hover:text-black focus-visible:text-black active:text-black lg:inline-flex lg:w-full lg:min-w-0 lg:items-center lg:justify-center lg:gap-2 lg:py-2 lg:rounded-md lg:font-semibold lg:leading-6 lg:no-underline lg:cursor-pointer lg:transition-[background-color,color] lg:duration-200',
                'lg:uppercase',
                'lg:px-[clamp(0.25rem,2cqi,1rem)]',
                {
                  '!text-white hover:!text-white focus-visible:!text-white active:!text-white':
                    isDesktopMainCategorySelected(menuNode),
                },
              ]"
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
              <div class="fs-submenu-inner lg:flex lg:w-full lg:max-w-screen-2xl lg:mx-auto lg:px-10 lg:justify-center">
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
                              class="fs-subcategory-child text-black hover:bg-gray lg:block lg:rounded-md lg:text-sm lg:no-underline lg:mt-2"
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
        @click="closeMobileMenu"
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
              <li v-if="node.childCount === 0" :class="{ 'fs-mobile-subcategory-indented': activeNode.length > 0 }">
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
              <li v-else :class="{ 'fs-mobile-subcategory-indented': activeNode.length > 0 }">
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

// Toggle this manually while styling the desktop mega menu.
const KEEP_DESKTOP_MENU_OPEN_FOR_STYLING = false;

const viewport = useViewport();
const { isMobilePreview, isInEditor, device } = useEditorState();
const { locale, localeCodes } = useI18n();
const localePath = useLocalePath();
const { buildCategoryMenuLink, switchLocale } = useLocalization();
const { getCategoryTree } = useCategoryTree();
const router = useRouter();
const route = useRoute();
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

const iconColor = computed(() => props.iconColor || getIconColor());
const headerBackgroundColor = computed(() => props.headerBackgroundColor || getHeaderBackgroundColor());
const isEditorMobileOrTablet = computed(() => isInEditor.value && device.value !== 'desktop');
const isDesktopNavigation = computed(
  () => viewport.isGreaterOrEquals('lg') && !isMobilePreview.value && !isEditorMobileOrTablet.value,
);
const isMobileNavigation = computed(() => !isDesktopNavigation.value);

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
const tappedCategoryId = ref<number | null>(null);
const TOUCH_DETECTION_THRESHOLD = 500;
const DESKTOP_MENU_OPEN_DELAY_MS = 180;
const DESKTOP_MENU_CLOSE_DELAY_MS = 180;
const pendingDesktopMenuOpen = ref<ReturnType<typeof setTimeout> | null>(null);
const pendingDesktopMenuClose = ref<ReturnType<typeof setTimeout> | null>(null);
const isMobileLanguageDropdownOpen = ref(false);
const desktopMainCategoryFontStep = ref(0);
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
  const columnCount = Math.min(6, Math.max(1, children.length));
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
const shouldKeepDesktopMenuOpen = () => KEEP_DESKTOP_MENU_OPEN_FOR_STYLING && isDesktopNavigation.value;

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

const getDesktopMainCategoryItemStyle = (menuNode: CategoryTreeItem) => {
  const categoryNameLength = categoryTreeGetters.getName(menuNode)?.trim().length ?? 0;
  const proportionalWeight = Math.max(8, Math.min(28, categoryNameLength));

  return {
    flex: `${proportionalWeight} 1 0%`,
    flexGrow: proportionalWeight,
    flexShrink: 1,
    flexBasis: '0%',
    minWidth: '0',
    maxWidth: '12.5rem',
  };
};

const DESKTOP_MAIN_CATEGORY_FONT_SIZES = ['1rem', '0.875rem', '0.8125rem'] as const;

const desktopMainCategoryLinkStyle = computed(() => {
  if (!isDesktopNavigation.value) return {};

  return {
    fontSize: DESKTOP_MAIN_CATEGORY_FONT_SIZES[desktopMainCategoryFontStep.value] ?? '1rem',
  };
});

const getDesktopMainCategoryLinkElements = () => {
  const desktopNavElement = unrefElement(floatingRef.value) as HTMLElement | null;
  if (!desktopNavElement) return [];

  return Array.from(desktopNavElement.querySelectorAll('.fs-main-category-link')) as HTMLElement[];
};

const measureTextWidth = (text: string, sourceElement: HTMLElement) => {
  if (!text) return 0;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return 0;

  const styles = getComputedStyle(sourceElement);
  context.font = styles.font;

  const baseWidth = context.measureText(text).width;
  const letterSpacing = Number.parseFloat(styles.letterSpacing || '0');
  if (!Number.isFinite(letterSpacing) || letterSpacing === 0) return baseWidth;

  return baseWidth + letterSpacing * Math.max(text.length - 1, 0);
};

const hasDesktopMainCategoryTextOverflow = () => {
  const linkElements = getDesktopMainCategoryLinkElements();
  if (linkElements.length === 0) return false;

  return linkElements.some((linkElement) => {
    const styles = getComputedStyle(linkElement);
    const horizontalPadding =
      (Number.parseFloat(styles.paddingLeft || '0') || 0) + (Number.parseFloat(styles.paddingRight || '0') || 0);
    const availableWidth = linkElement.clientWidth - horizontalPadding;
    if (availableWidth <= 0) return false;

    const labelText = linkElement.textContent?.trim() ?? '';
    const textWidth = measureTextWidth(labelText, linkElement);

    return textWidth - availableWidth > 1;
  });
};

const applyDesktopMainCategoryFontFallback = async () => {
  if (!isDesktopNavigation.value) {
    desktopMainCategoryFontStep.value = 0;
    return;
  }

  desktopMainCategoryFontStep.value = 0;
  await nextTick();

  if (!hasDesktopMainCategoryTextOverflow()) return;

  desktopMainCategoryFontStep.value = 1;
  await nextTick();

  if (!hasDesktopMainCategoryTextOverflow()) return;

  desktopMainCategoryFontStep.value = 2;
};

const handleWindowResize = () => {
  updateMobileHeaderHeight();
  void applyDesktopMainCategoryFontFallback();
};

const normalizePath = (path: string) => {
  if (!path || path === '/') return '/';
  return path.replace(/\/+$/, '');
};

const isDesktopMainCategorySelected = (menuNode: CategoryTreeItem) => {
  const currentPath = normalizePath(route.path);
  const categoryPath = normalizePath(router.resolve(localePath(generateCategoryLink(menuNode))).path);

  if (categoryPath === '/') return currentPath === '/';

  return currentPath === categoryPath || currentPath.startsWith(`${categoryPath}/`);
};

const ensureDesktopMenuOpenForStyling = () => {
  if (!shouldKeepDesktopMenuOpen()) return;

  const firstExpandableNode = categoryTree.value.find((menuNode) => menuNode.childCount > 0);
  if (!firstExpandableNode) return;

  activeNode.value = [firstExpandableNode.id];
  open();
  setCategory([firstExpandableNode]);
};

const handleDesktopMenuBlur = (event: FocusEvent) => {
  if (shouldKeepDesktopMenuOpen()) return;

  if (!(event.currentTarget as Element).contains(event.relatedTarget as Element)) {
    close();
    tappedCategoryId.value = null;
  }
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
  if (!headerElement) {
    mobileHeaderHeight.value = 0;
    return;
  }

  const headerBottom = headerElement.getBoundingClientRect().bottom;
  mobileHeaderHeight.value = Math.max(Math.ceil(headerBottom), 0);
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
  if (!isDesktopNavigation.value || !isOpen.value || shouldKeepDesktopMenuOpen()) return;

  clearPendingDesktopMenuOpen();
  clearPendingDesktopMenuClose();

  pendingDesktopMenuClose.value = setTimeout(() => {
    close();
    tappedCategoryId.value = null;
    pendingDesktopMenuClose.value = null;
  }, DESKTOP_MENU_CLOSE_DELAY_MS);
};
const onEnterKey = () => {
  if (shouldKeepDesktopMenuOpen()) return;

  clearPendingDesktopMenuOpen();
  clearPendingDesktopMenuClose();
  close();
  tappedCategoryId.value = null;
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
  if (!isDesktopNavigation.value) return;

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
  tappedCategoryId.value = menuNode.id;
  onCategoryMouseEnter(menuNode, true);
};

const onCategoryClickCapture = (event: MouseEvent, menuNode: CategoryTreeItem) => {
  if (isUsingTouch.value && menuNode.childCount > 0 && tappedCategoryId.value !== menuNode.id) {
    event.stopPropagation();
    event.preventDefault();
    handleFirstTouch(menuNode);
    return;
  }

  if (shouldKeepDesktopMenuOpen()) return;

  clearPendingDesktopMenuOpen();
  clearPendingDesktopMenuClose();
  close();
  tappedCategoryId.value = null;
};

onMounted(() => {
  handleWindowResize();
  window.addEventListener('resize', handleWindowResize);
  ensureDesktopMenuOpenForStyling();
  void applyDesktopMainCategoryFontFallback();

  if (typeof document !== 'undefined' && 'fonts' in document) {
    void document.fonts.ready.then(() => {
      void applyDesktopMainCategoryFontFallback();
    });
  }

  removeHook = router.afterEach(() => {
    if (shouldKeepDesktopMenuOpen()) {
      ensureDesktopMenuOpenForStyling();
      return;
    }

    close();
    tappedCategoryId.value = null;
    void nextTick(() => applyDesktopMainCategoryFontFallback());
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleWindowResize);
  clearPendingDesktopMenuOpen();
  clearPendingDesktopMenuClose();
  setPageScrollLocked(false);
  removeHook?.();
});

watch(
  () => isOpen.value,
  async (menuIsOpen) => {
    await nextTick();
    handleWindowResize();

    if (!menuIsOpen) {
      isMobileLanguageDropdownOpen.value = false;
    }

    if (isMobileNavigation.value) {
      setPageScrollLocked(menuIsOpen);
      return;
    }

    setPageScrollLocked(false);
  },
);

watch(
  () => props.categories,
  async (categories: CategoryTreeItem[]) => {
    fullCategoryTree.value = categoryTreeGetters.getTree(categories);
    categoryTree.value = filterRootTree(categories);
    setCategory(categoryTree.value);
    ensureDesktopMenuOpenForStyling();
    await nextTick();
    await applyDesktopMainCategoryFontFallback();
  },
  { immediate: true },
);

watch(
  () => locale.value,
  async () => {
    await getCategoryTree();
    await nextTick();
    await applyDesktopMainCategoryFontFallback();
  },
);

useTrapFocus(drawerReference, trapFocusOptions);
</script>

<style scoped>
.logo :deep(img) {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
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

.fs-mobile-subcategory-indented {
  padding-left: 1rem;
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

  .fs-direct-subcategory {
    border-bottom: none;
  }

  .fs-sub-wrapper {
    max-width: calc((6 * 220px) + (5 * 1.5rem));
    /* gap: 1.5rem; */
  }

  .fs-subcategory-group {
    break-inside: avoid;
    -webkit-column-break-inside: avoid;
  }
}
</style>
