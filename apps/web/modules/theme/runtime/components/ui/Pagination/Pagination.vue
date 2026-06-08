<template>
  <nav
    class="flex justify-center items-center gap-2"
    role="navigation"
    :aria-label="t('common.labels.pagination')"
    data-testid="pagination"
  >
    <button
      :aria-label="t('common.navigation.previousAriaLabel')"
      :disabled="pagination.selectedPage <= 1 || disabled"
      class="rounded-full w-10 h-10 p-2 bg-gray-light border-gray-light text-black hover:bg-gray hover:border-gray hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      data-testid="pagination-previous"
      @click="previousPage"
    >
      <SfIconChevronLeft class="w-5 h-5" />
    </button>
    <ul class="flex justify-center items-center gap-1">
      <!-- Erste Seite (falls nicht in visiblePages) -->
      <li v-if="showFirstPage">
        <button
          type="button"
          :class="[
            'w-10 h-10 rounded-full text-sm',
            pagination.selectedPage === 1 ? 'text-gray-super-dark' : 'text-black',
            !disabled && pagination.selectedPage !== 1 && 'hover:bg-gray-light hover:cursor-pointer',
            pagination.selectedPage === 1 && 'cursor-default',
          ]"
          :aria-current="pagination.selectedPage === 1"
          :aria-label="getAriaLabel(pagination.selectedPage === 1, 1)"
          :disabled="disabled || pagination.selectedPage === 1"
          @click="setPage(1)"
        >
          1
        </button>
      </li>
      <!-- Erstes ... -->
      <li v-if="showFirstEllipsis">
        <span class="px-2 text-black">...</span>
      </li>
      <!-- Mittlere Seiten -->
      <li v-for="page in visiblePages" :key="`page-${page}`">
        <button
          type="button"
          :class="[
            'w-10 h-10 rounded-full text-sm',
            pagination.selectedPage === page ? 'text-gray-super-dark' : 'text-black',
            !disabled && pagination.selectedPage !== page && 'hover:bg-gray-light hover:cursor-pointer',
            pagination.selectedPage === page && 'cursor-default',
          ]"
          :aria-current="pagination.selectedPage === page"
          :aria-label="getAriaLabel(pagination.selectedPage === page, page)"
          :disabled="disabled || pagination.selectedPage === page"
          @click="setPage(page)"
        >
          {{ page }}
        </button>
      </li>
      <!-- Zweites ... -->
      <li v-if="showLastEllipsis">
        <span class="px-2 text-black">...</span>
      </li>
      <!-- Letzte Seite (falls nicht in visiblePages) -->
      <li v-if="showLastPage">
        <button
          type="button"
          :class="[
            'p-3 rounded-full text-sm',
            pagination.selectedPage === pagination.totalPages ? 'text-gray-super-dark' : 'text-black',
            !disabled &&
              pagination.selectedPage !== pagination.totalPages &&
              'hover:bg-gray-light hover:cursor-pointer',
            pagination.selectedPage === pagination.totalPages && 'cursor-default',
          ]"
          :aria-current="pagination.selectedPage === pagination.totalPages"
          :aria-label="getAriaLabel(pagination.selectedPage === pagination.totalPages, pagination.totalPages)"
          :disabled="disabled || pagination.selectedPage === pagination.totalPages"
          @click="setPage(pagination.totalPages)"
        >
          {{ pagination.totalPages }}
        </button>
      </li>
    </ul>
    <button
      :aria-label="t('common.navigation.nextAriaLabel')"
      :disabled="pagination.selectedPage >= pagination.totalPages || disabled"
      class="rounded-full w-10 h-10 p-2 bg-gray-light border-gray-light text-black hover:bg-gray hover:border-gray hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      data-testid="pagination-next"
      @click="nextPage"
    >
      <SfIconChevronRight class="w-5 h-5" />
    </button>
  </nav>
</template>

<script setup lang="ts">
import { SfIconChevronLeft, SfIconChevronRight, usePagination } from '@storefront-ui/vue';
import type { PaginationProps } from '~/components/ui/Pagination/types';

const { updatePage } = useCategoryFilter();

const {
  currentPage,
  currentPageName = 'page',
  pageSize,
  totalItems,
  maxVisiblePages: maxVisiblePagesProperty,
  disabled = false,
} = defineProps<PaginationProps>();

const pagination = computed(() =>
  reactive(
    usePagination({
      totalItems: totalItems,
      currentPage: currentPage,
      pageSize: pageSize,
      maxPages: maxVisiblePagesProperty,
    }),
  ),
);

// Intelligente Pagination-Logik
const visiblePages = computed(() => {
  const current = pagination.value.selectedPage;
  const total = pagination.value.totalPages;

  // Wenn 5 oder weniger Seiten, zeige alle
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  // Am Anfang (Seite 1-3): Zeige 1-5
  if (current <= 3) {
    return [1, 2, 3, 4, 5];
  }

  // Am Ende (letzte 6 Seiten): Zeige letzte 6
  if (current >= total - 5) {
    return Array.from({ length: 6 }, (_, i) => total - 5 + i);
  }

  // In der Mitte: Zeige prev, current, next
  return [current - 1, current, current + 1];
});

// Zeige erste Seite separat
const showFirstPage = computed(() => {
  return pagination.value.totalPages > 5 && !visiblePages.value.includes(1);
});

// Zeige erstes "..."
const showFirstEllipsis = computed(() => {
  const firstVisible = visiblePages.value[0];
  return showFirstPage.value && firstVisible && firstVisible > 2;
});

// Zeige letztes "..."
const showLastEllipsis = computed(() => {
  const lastVisible = visiblePages.value[visiblePages.value.length - 1];
  return lastVisible && lastVisible < pagination.value.totalPages - 1;
});

// Zeige letzte Seite separat
const showLastPage = computed(() => {
  return pagination.value.totalPages > 5 && !visiblePages.value.includes(pagination.value.totalPages);
});

const getAriaLabel = (isCurrent: boolean, page: number) => {
  return t(isCurrent ? 'common.navigation.currentPage' : 'common.navigation.goToPage', { page });
};

const setPage = (page: number) => {
  updatePage(page.toString(), currentPageName);
  pagination.value.setPage(page);
};

const previousPage = () => {
  setPage(pagination.value.selectedPage - 1);
};

const nextPage = () => {
  setPage(pagination.value.selectedPage + 1);
};
</script>
