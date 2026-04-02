<template>
  <nav data-testid="breadcrumbs" class="inline-flex items-center text-sm font-normal w-full">
    <ol class="flex w-auto leading-none group md:flex-wrap items-center">
      <!-- First breadcrumb (Home) - immer sichtbar -->
      <li
        v-if="firstBreadcrumb"
        class="flex items-center text-neutral-500 after:content-['/'] after:px-2 after:leading-5"
      >
        <SfLink
          :tag="NuxtLink"
          :to="localePath(firstBreadcrumb.link)"
          variant="secondary"
          class="leading-5 no-underline hover:underline active:underline whitespace-nowrap outline-secondary-600 text-inherit"
        >
          {{ firstBreadcrumb.name }}
        </SfLink>
      </li>

      <!-- Dropdown für ausgeblendete mittlere Breadcrumbs (nur Mobile wenn überlauf) -->
      <li v-if="hasHiddenBreadcrumbs" class="flex md:hidden items-center text-neutral-500">
        <NuxtLazyHydrate :on-interaction="['click', 'touchstart']">
          <SfDropdown v-model="dropdownOpened" strategy="absolute" placement="bottom-start" @update:model-value="close">
            <template #trigger>
              <UiButton
                class="relative w-5 h-5 !p-0 rounded-sm outline-secondary-600 hover:bg-transparent active:bg-transparent"
                :aria-label="t('theme.breadcrumbs.showMore')"
                variant="tertiary"
                square
                data-testid="breadcrumbs-dropdown-button"
                @click="toggle"
              >
                <template #prefix>
                  <SfIconMoreHoriz
                    size="sm"
                    class="text-neutral-500 hover:text-primary-500 active:text-primary-800 active:bg-transparent"
                  />
                </template>
              </UiButton>
            </template>
            <ol
              class="px-4 py-2 rounded-md shadow-md border-neutral-100 bg-white z-2"
              data-testid="breadcrumbs-dropdown"
            >
              <li v-for="item in hiddenBreadcrumbs" :key="item.name" class="py-2">
                <SfLink
                  :tag="NuxtLink"
                  :to="localePath(item.link)"
                  variant="secondary"
                  class="leading-5 no-underline text-inherit hover:underline active:underline whitespace-nowrap outline-secondary-600"
                >
                  {{ item.name }}
                </SfLink>
              </li>
            </ol>
          </SfDropdown>
        </NuxtLazyHydrate>
        <span class="px-2">/</span>
      </li>

      <!-- Sichtbare Breadcrumbs (nur letzter auf Mobile, alle auf Desktop) -->
      <li
        v-for="(item, index) in visibleMiddleAndLastBreadcrumbs"
        :key="item.name"
        class="flex items-center text-neutral-500 last-of-type:text-neutral-900 last-of-type:font-medium"
        :class="{ 'hidden md:flex': shouldHideOnMobile(index) }"
      >
        <SfLink
          v-if="index < visibleMiddleAndLastBreadcrumbs.length - 1"
          :tag="NuxtLink"
          :to="localePath(item.link)"
          variant="secondary"
          class="leading-5 no-underline hover:underline active:underline whitespace-nowrap outline-secondary-600 text-inherit"
        >
          {{ item.name }}
        </SfLink>
        <span v-else>
          {{ item.name }}
        </span>
        <span v-if="index < visibleMiddleAndLastBreadcrumbs.length - 1" class="px-2">/</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { SfLink, SfDropdown, SfIconMoreHoriz } from '@storefront-ui/vue';
import type { BreadcrumbsProps } from '~/components/ui/Breadcrumbs/types';

const props = defineProps<BreadcrumbsProps>();

const { t } = useI18n();
const localePath = useLocalePath();
const NuxtLink = resolveComponent('NuxtLink');
const route = useRoute();

const dropdownOpened = ref(false);
const close = () => {
  dropdownOpened.value = false;
};
const toggle = () => {
  dropdownOpened.value = !dropdownOpened.value;
};

// Filter breadcrumbs: Auf Produktseiten den letzten Eintrag (Produktname) entfernen
const filteredBreadcrumbs = computed(() => {
  if (!props.breadcrumbs) return [];

  // Prüfe ob wir auf einer Produktseite sind (route.meta.type === 'product')
  const isProductPage = route.meta?.type === 'product';

  if (isProductPage && props.breadcrumbs.length > 0) {
    // Entferne den letzten Breadcrumb (Produktname)
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
const visibleMiddleAndLastBreadcrumbs = computed(() => {
  return displayBreadcrumbs.value.slice(1);
});

// Letzter Breadcrumb (immer sichtbar auf Mobile)
const lastBreadcrumb = computed(() => {
  const items = visibleMiddleAndLastBreadcrumbs.value;
  return items.length > 0 ? items[items.length - 1] : null;
});

// Mobile: Prüfe ob es mehr als 1 Breadcrumb gibt (außer Home)
// Wenn ja, zeige Dropdown mit allen außer dem letzten
const hasHiddenBreadcrumbs = computed(() => {
  return visibleMiddleAndLastBreadcrumbs.value.length > 1;
});

// Alle Breadcrumbs außer Home und letztem (gehen ins Dropdown auf Mobile)
const hiddenBreadcrumbs = computed(() => {
  if (!hasHiddenBreadcrumbs.value) return [];

  // Alle außer dem letzten
  return visibleMiddleAndLastBreadcrumbs.value.slice(0, -1);
});

// Mobile: Verstecke alle außer dem letzten Breadcrumb
const shouldHideOnMobile = (index: number) => {
  const isLastItem = index === visibleMiddleAndLastBreadcrumbs.value.length - 1;
  return !isLastItem;
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
