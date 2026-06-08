<template>
  <div class="category-filters" data-testid="category-filters">
    <!-- Top Row: Sortieren Nach (links), Produktanzahl + Alle Filter (rechts) -->
    <div class="flex justify-between items-center mb-4">
      <!-- Sortieren Nach - Links -->
      <div class="flex-shrink-0">
        <CategorySorting />
      </div>

      <!-- Produktanzahl + Alle Filter - Rechts -->
      <div v-if="hasMoreFilters" class="flex items-center gap-4">
        <span v-if="isMdOrAbove && totalProducts !== undefined && currentCount !== undefined" class="text-base">
          {{
            t('search.numberOfProducts', {
              count: currentCount,
              total: totalProducts,
            })
          }}
        </span>
        <button
          class="flex items-center bg-black hover:bg-gray-super-dark text-white py-2.5 px-5 rounded-[46px] gap-2"
          @click="openModal"
        >
          <p>{{ t('theme.CatView.btnFilter') }}</p>
          <img src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/FilterButton.svg" />
          <span v-if="activeFiltersCount > 0" class="text-gray-light text-sm ml-2">({{ activeFiltersCount }})</span>
        </button>
      </div>
    </div>

    <!-- Horizontale Filter (max 5) - Scrollbar mit 3+ sichtbar mobile -->
    <div class="overflow-x-auto md:overflow-visible scrollbar-hide mb-2">
      <div class="flex gap-2 md:gap-4 items-start" style="min-width: min-content">
        <div
          v-for="facet in visibleFacets"
          :key="facet.id"
          class="flex-shrink-0 w-[30%] md:w-auto md:flex-1 md:min-w-[200px]"
        >
          <CategoryFiltersFilter :facet="facet" :delayed="false" />
        </div>
      </div>
    </div>

    <div v-if="!isMdOrAbove && totalProducts !== undefined && currentCount !== undefined" class="flex justify-end mb-4">
      <span class="text-xs text-black">
        {{
          t('theme.CatView.numberOfProductsMobile', {
            count: currentCount,
            total: totalProducts,
          })
        }}
      </span>
    </div>

    <!-- Filter Modal -->
    <CategoryFiltersModal v-if="isModalOpen" :facets="facets" :total-products="totalProducts" @close="closeModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import { SfIconTune, SfCounter } from '@storefront-ui/vue';
import type { CategoryFiltersProps } from './types';

const props = withDefaults(defineProps<CategoryFiltersProps>(), {
  limit: 5,
  currentCount: 0,
  totalProducts: 0,
});

const { getFacetsFromURL } = useCategoryFilter();
const isModalOpen = ref(false);
const isMounted = ref(false);
const isAboveMd = useMediaQuery('(min-width: 768px)');
const isMdOrAbove = computed(() => isMounted.value && isAboveMd.value);

onMounted(() => {
  isMounted.value = true;
});

const visibleFacets = computed(() => {
  return props.facets.slice(0, props.limit);
});

const hasMoreFilters = computed(() => {
  return props.facets.length > props.limit;
});

const activeFiltersCount = computed(() => {
  const { getFacetsFromURL } = useCategoryFilter();
  const currentFacets = getFacetsFromURL().facets?.split(',') ?? [];
  return currentFacets.length;
});

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};
</script>

<style scoped>
.category-filters {
  width: 100%;
}

/* Hide scrollbar for horizontal filter scrolling */
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
</style>
