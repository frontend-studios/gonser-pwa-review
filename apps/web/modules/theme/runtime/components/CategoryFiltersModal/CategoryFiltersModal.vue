<template>
  <!-- Background Overlay -->
  <div
    v-if="isOpen"
    class="w-full h-full top-0 bottom-0 left-0 right-0 bg-neutral-500/50 fixed z-50"
    @click="close"
  ></div>

  <!-- Modal -->
  <div
    v-if="isOpen"
    class="fixed left-[20px] top-1/2 -translate-y-1/2 w-full p-s max-w-[300px] md:max-w-[385px] rounded-[20px] bg-white shadow-lg z-[51] max-h-[80vh] flex flex-col"
    role="dialog"
    aria-labelledby="filters-modal-title"
  >
    <header class="flex items-center justify-between pb-2.5 border-b">
      <h3 id="filters-modal-title" class="">
        {{ t('theme.CatView.modalFilter') }}
      </h3>
      <button
        class="rounded-full w-10 h-10 p-2 bg-gray-light border-gray-light text-black hover:bg-gray hover:border-gray hover:cursor-pointer"
        @click="close"
      >
        <SfIconClose class="w-5 h-5" />
      </button>
    </header>

    <div class="overflow-y-auto flex-1">
      <CategoryFiltersFilter v-for="facet in facets" :key="facet.id" :facet="facet" :delayed="true" />
    </div>

    <!-- Total Products Count -->
    <div v-if="totalProducts !== undefined" class="text-right text-sm py-2.5">
      {{ totalProducts }}
      {{ totalProducts === 1 ? t('theme.CatView.resultSingular') : t('theme.CatView.resultPlural') }}
    </div>

    <footer class="flex gap-4">
      <button
        class="flex-1 bg-gray font-semibold hover:bg-gray-dark rounded-[40px] py-1.5 px-2 md:px-s"
        @click="resetFilters"
      >
        {{ t('theme.CatView.reset') }}
      </button>
      <button
        class="flex-1 bg-black text-white font-semibold hover:bg-gray-super-dark rounded-[40px] py-1.5 px-2 md:px-s"
        @click="applyFilters"
      >
        {{ t('theme.CatView.apply') }}
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';
import { SfButton, SfIconClose } from '@storefront-ui/vue';
import type { FilterGroup } from '@plentymarkets/shop-api';
import { useDelayedFilters } from '../../composables/useDelayedFilters/useDelayedFilters';
import Button from '~/components/ui/Button/Button.vue';

interface CategoryFiltersModalProps {
  facets: FilterGroup[];
  totalProducts?: number;
}

const props = defineProps<CategoryFiltersModalProps>();
const emit = defineEmits<{
  close: [];
}>();

const isOpen = ref(true);
const { applyDelayedFilters, resetDelayedFilters, initializeDelayedFilters } = useDelayedFilters();

// Initialize delayed filters with current URL state when modal opens
onMounted(() => {
  initializeDelayedFilters();
});

const close = () => {
  isOpen.value = false;
  emit('close');
};

const applyFilters = async () => {
  await applyDelayedFilters();
  close();
};

const resetFilters = async () => {
  resetDelayedFilters();
  // Wait for filters to be applied to URL
  await applyDelayedFilters();
  // Close modal after URL has been updated
  close();
};

watch(isOpen, (newValue) => {
  if (!newValue) {
    emit('close');
  }
});
</script>
