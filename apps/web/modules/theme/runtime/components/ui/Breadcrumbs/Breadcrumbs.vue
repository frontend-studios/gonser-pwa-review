<template>
  <nav ref="breadcrumbsNavRef" data-testid="breadcrumbs" class="inline-flex items-center text-sm font-normal w-full">
    <ol class="flex w-auto leading-none group md:flex-wrap items-center">
      <!-- First breadcrumb (Home) - immer sichtbar -->
      <li
        v-if="firstBreadcrumb"
        class="flex items-center text-neutral-500 after:content-['/'] after:px-2 after:leading-5"
      >
        <UiLink
          :tag="NuxtLink"
          :to="localePath(firstBreadcrumb.link)"
          variant="secondary"
          class="leading-5 no-underline hover:underline active:underline whitespace-nowrap outline-secondary-600 text-inherit"
        >
          {{ firstBreadcrumb.name }}
        </UiLink>
      </li>

      <!-- Sichtbare Breadcrumbs (auf Mobile nur die Breadcrumbs, die in die verfügbare Breite passen) -->
      <template v-for="(item, index) in remainingBreadcrumbs" :key="item.name">
        <li v-if="shouldShowDropdownBefore(index)" class="flex md:hidden items-center text-neutral-500">
          <NuxtLazyHydrate :on-interaction="['click', 'touchstart']">
            <SfDropdown v-model="dropdownOpened" strategy="absolute" placement="bottom-start" @update:model-value="close">
              <template #trigger>
                <UiButton
                  class="relative !p-0 rounded-sm outline-secondary-600 hover:bg-transparent active:bg-transparent"
                  :aria-label="t('theme.breadcrumbs.showMore')"
                  variant="tertiary"
                  square
                  data-testid="breadcrumbs-dropdown-button"
                  @click="toggle"
                >
                  <template #prefix>
                    <span class="relative -top-px leading-5 font-normal !text-black">...</span>
                  </template>
                </UiButton>
              </template>
              <ol
                class="px-4 py-2 rounded-md shadow-md border-neutral-100 bg-white z-2"
                data-testid="breadcrumbs-dropdown"
              >
                <li v-for="hiddenItem in hiddenBreadcrumbs" :key="hiddenItem.name" class="py-2">
                  <UiLink
                    :tag="NuxtLink"
                    :to="localePath(hiddenItem.link)"
                    variant="secondary"
                    class="leading-5 no-underline text-inherit hover:underline active:underline whitespace-nowrap outline-secondary-600"
                  >
                    {{ hiddenItem.name }}
                  </UiLink>
                </li>
              </ol>
            </SfDropdown>
          </NuxtLazyHydrate>
          <span class="px-2">/</span>
        </li>

        <li
          class="flex items-center text-neutral-500 last-of-type:text-neutral-900 last-of-type:font-medium"
          :class="{ 'hidden md:flex': shouldHideOnMobile(index) }"
        >
          <UiLink
            v-if="index < remainingBreadcrumbs.length - 1"
            :tag="NuxtLink"
            :to="localePath(item.link)"
            variant="secondary"
            class="leading-5 no-underline hover:underline active:underline whitespace-nowrap outline-secondary-600 text-inherit"
          >
            {{ item.name }}
          </UiLink>
          <span v-else>
            {{ item.name }}
          </span>
          <span v-if="index < remainingBreadcrumbs.length - 1" class="px-2">/</span>
        </li>
      </template>
    </ol>

    <ol
      aria-hidden="true"
      class="invisible pointer-events-none absolute -left-[9999px] top-0 flex items-center leading-none whitespace-nowrap"
    >
      <li
        v-if="firstBreadcrumb"
        ref="measurementHomeRef"
        class="flex items-center text-neutral-500 after:content-['/'] after:px-2 after:leading-5"
      >
        <span class="leading-5 whitespace-nowrap">{{ firstBreadcrumb.name }}</span>
      </li>
      <li ref="measurementDropdownRef" class="flex items-center text-neutral-500">
        <span class="relative -top-px leading-5 font-normal !text-black">...</span>
        <span class="px-2">/</span>
      </li>
      <li
        v-for="(item, index) in remainingBreadcrumbs"
        :key="`${item.name}-measurement`"
        :ref="(element) => setMeasurementBreadcrumbRef(element, index)"
        class="flex items-center text-neutral-500 last-of-type:text-neutral-900 last-of-type:font-medium"
      >
        <span class="leading-5 whitespace-nowrap">{{ item.name }}</span>
        <span v-if="index < remainingBreadcrumbs.length - 1" class="px-2">/</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { SfDropdown } from '@storefront-ui/vue';
import type { ComponentPublicInstance } from 'vue';
import type { BreadcrumbsProps } from '~/components/ui/Breadcrumbs/types';

const props = defineProps<BreadcrumbsProps>();

const { t } = useI18n();
const localePath = useLocalePath();
const NuxtLink = resolveComponent('NuxtLink');
const route = useRoute();

const dropdownOpened = ref(false);
const isMounted = ref(false);
const breadcrumbsNavRef = ref<HTMLElement | null>(null);
const measurementHomeRef = ref<HTMLElement | null>(null);
const measurementDropdownRef = ref<HTMLElement | null>(null);
const measurementBreadcrumbRefs = ref<Array<HTMLElement | null>>([]);
const mobileVisibleIndices = ref(new Set<number>());

let breadcrumbsResizeObserver: ResizeObserver | null = null;

const setMeasurementBreadcrumbRef = (element: Element | ComponentPublicInstance | null, index: number) => {
  measurementBreadcrumbRefs.value[index] = element instanceof HTMLElement ? element : null;
};

const close = () => {
  dropdownOpened.value = false;
};
const toggle = () => {
  dropdownOpened.value = !dropdownOpened.value;
};

// Filter breadcrumbs: Remove product name entry (identified by link: '#')
const filteredBreadcrumbs = computed(() => {
  if (!props.breadcrumbs || props.breadcrumbs.length === 0) return [];

  // Remove the last breadcrumb if it has link: '#' (product entry)
  const lastBreadcrumb = props.breadcrumbs[props.breadcrumbs.length - 1];
  if (lastBreadcrumb?.link === '#') {
    return props.breadcrumbs.slice(0, -1);
  }

  return props.breadcrumbs;
});

// Ersetze "Startseite" mit übersetztem "Home"
const displayBreadcrumbs = computed(() => {
  return filteredBreadcrumbs.value.map((breadcrumb, index) => {
    if (index === 0) {
      return {
        ...breadcrumb,
        name: t('theme.breadcrumbs.home'),
      };
    }
    return breadcrumb;
  });
});

// Erstes Breadcrumb (Home)
const firstBreadcrumb = computed(() => {
  return displayBreadcrumbs.value[0] || null;
});

// Alle Breadcrumbs außer Home
const remainingBreadcrumbs = computed(() => {
  return displayBreadcrumbs.value.slice(1);
});

const fallbackMobileVisibleIndices = (count: number) => {
  if (count <= 0) return new Set<number>();
  if (count <= 2) return new Set<number>(Array.from({ length: count }, (_, index) => index));

  return new Set<number>([count - 2, count - 1]);
};

const getMobileVisibilityPriority = (count: number) => {
  const priority: number[] = [];

  if (count > 1) {
    priority.push(count - 2);
  }

  priority.push(0);

  for (let index = 1; index < count - 2; index += 1) {
    priority.push(index);
  }

  return priority.filter((index, position, indices) => index >= 0 && index < count - 1 && indices.indexOf(index) === position);
};

const recalculateMobileVisibleIndices = () => {
  const count = remainingBreadcrumbs.value.length;

  if (count <= 0) {
    mobileVisibleIndices.value = new Set<number>();
    return;
  }

  if (!import.meta.client) {
    mobileVisibleIndices.value = fallbackMobileVisibleIndices(count);
    return;
  }

  const navWidth = breadcrumbsNavRef.value?.clientWidth ?? 0;
  const homeWidth = measurementHomeRef.value?.offsetWidth ?? 0;
  const dropdownWidth = measurementDropdownRef.value?.offsetWidth ?? 0;
  const breadcrumbWidths = remainingBreadcrumbs.value.map((_, index) => measurementBreadcrumbRefs.value[index]?.offsetWidth ?? 0);

  if (!navWidth || !homeWidth || breadcrumbWidths.some((width) => !width)) {
    mobileVisibleIndices.value = fallbackMobileVisibleIndices(count);
    return;
  }

  const visibleIndices = new Set<number>([count - 1]);
  const lastBreadcrumbWidth = breadcrumbWidths[count - 1];

  if (!lastBreadcrumbWidth) {
    mobileVisibleIndices.value = fallbackMobileVisibleIndices(count);
    return;
  }

  let hiddenCount = count - visibleIndices.size;
  let usedWidth = homeWidth + lastBreadcrumbWidth + (hiddenCount > 0 ? dropdownWidth : 0);

  const tryAddIndex = (index: number): boolean => {
    if (visibleIndices.has(index)) return true;

    const breadcrumbWidth = breadcrumbWidths[index];

    if (!breadcrumbWidth) return false;

    const nextHiddenCount = hiddenCount - 1;
    const nextUsedWidth = usedWidth + breadcrumbWidth - (hiddenCount > 0 && nextHiddenCount === 0 ? dropdownWidth : 0);

    if (nextUsedWidth <= navWidth) {
      visibleIndices.add(index);
      hiddenCount = nextHiddenCount;
      usedWidth = nextUsedWidth;
      return true;
    }

    return false;
  };

  for (const index of getMobileVisibilityPriority(count)) {
    if (!tryAddIndex(index)) break;
  }

  mobileVisibleIndices.value = visibleIndices;
};

watch(
  () => remainingBreadcrumbs.value.map((item) => item.name),
  async () => {
    measurementBreadcrumbRefs.value = [];
    await nextTick();
    recalculateMobileVisibleIndices();
  },
  { immediate: true },
);

onMounted(() => {
  isMounted.value = true;
  recalculateMobileVisibleIndices();

  if (!breadcrumbsNavRef.value) return;

  breadcrumbsResizeObserver = new ResizeObserver(() => {
    recalculateMobileVisibleIndices();
  });

  breadcrumbsResizeObserver.observe(breadcrumbsNavRef.value);
});

onBeforeUnmount(() => {
  breadcrumbsResizeObserver?.disconnect();
  breadcrumbsResizeObserver = null;
});

// Mobile: Prüfe ob es mehr als 1 Breadcrumb gibt (außer Home)
// Wenn ja, zeige Dropdown mit allen außer dem letzten
const hasHiddenBreadcrumbs = computed(() => {
  if (!isMounted.value) return false;
  return remainingBreadcrumbs.value.length > mobileVisibleIndices.value.size;
});

// Alle Breadcrumbs außer Home und letztem (gehen ins Dropdown auf Mobile)
const hiddenBreadcrumbs = computed(() => {
  if (!hasHiddenBreadcrumbs.value) return [];

  return remainingBreadcrumbs.value.filter((_, index) => !mobileVisibleIndices.value.has(index));
});

const shouldShowDropdownBefore = (index: number) => {
  if (!isMounted.value) return false;
  if (!hasHiddenBreadcrumbs.value || !mobileVisibleIndices.value.has(index)) return false;

  return index > 0 && !mobileVisibleIndices.value.has(index - 1);
};

// Mobile: Verstecke alle außer dem letzten Breadcrumb
const shouldHideOnMobile = (index: number) => {
  if (!isMounted.value) return false;
  return !mobileVisibleIndices.value.has(index);
};

const items = route.path.split('/');
const itemListElement = [] as Array<unknown>;
let name = '';
items.forEach((item, index) => {
  name += item;
  if (index === 0) {
    itemListElement.push({
      '@type': 'ListItem',
      position: 1,
      item: {
        '@id': '/',
        name: 'Home',
      },
    });
  } else {
    itemListElement.push({
      '@type': 'ListItem',
      position: index,
      item: {
        '@id': `/${name}/`,
        name: `${item}`,
      },
    });
  }
});

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement,
};
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(structuredData),
    },
  ],
});
</script>
