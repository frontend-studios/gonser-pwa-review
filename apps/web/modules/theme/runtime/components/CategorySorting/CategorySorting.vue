<template>
  <div class="category-sorting" data-testid="category-sorting" ref="dropdownRef">
    <!-- Dropdown Button -->
    <div
      class="flex items-center justify-between py-2 px-5 rounded-[46px] border border-gray cursor-pointer bg-white select-none max-w-max md:max-w-48"
      @click="toggleOpen"
    >
      <span class="text-base">{{ selectedLabel }}</span>
      <SfIconChevronLeft :class="['text-black ml-2', open ? 'rotate-90' : '-rotate-90']" />
    </div>

    <!-- Dropdown Options -->
    <div
      v-if="open"
      class="absolute top-full left-0 mt-0.5 w-full bg-white border border-gray rounded-[10px] z-50 max-h-[400px] overflow-y-auto"
    >
      <div
        v-for="option in options"
        :key="option"
        class="px-2 py-3.5 hover:bg-gray-light cursor-pointer text-base"
        @click="selectOption(option)"
      >
        {{ t(`category.sorting.${option}`) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { SfIconChevronLeft } from '@storefront-ui/vue';
import { useRoute } from 'vue-router';
import { isPageOfType } from '~/utils/pathHelper';

const { updateSorting } = useCategoryFilter();
const { getJsonSetting: availableSortingOptions } = useSiteSettings('availableSortingOptions');
const { getSetting: defaultSortingSearch } = useSiteSettings('defaultSortingSearch');
const { getSetting: defaultSortingOption } = useSiteSettings('defaultSortingOption');

const route = useRoute();
const open = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const options = computed<string[]>(() => availableSortingOptions());
const defaultOption = computed<string | undefined>(() =>
  isPageOfType('search') ? defaultSortingSearch() : defaultSortingOption(),
);

const selected = computed<string>({
  get: () => {
    const sortQueryParam = route.query.sort;
    const currentSort = typeof sortQueryParam === 'string' ? sortQueryParam : '';
    if (currentSort && options.value.includes(currentSort)) return currentSort;

    return (
      (defaultOption.value && options.value.includes(defaultOption.value) ? defaultOption.value : options.value[0]) ??
      ''
    );
  },
  set: (val) => {
    if (!val) return;
    updateSorting(val);
  },
});

const selectedLabel = computed(() => {
  return selected.value ? t(`category.sorting.${selected.value}`) : t('common.labels.sortBy');
});

const toggleOpen = () => {
  open.value = !open.value;
};

const selectOption = (option: string) => {
  selected.value = option;
  open.value = false;
};

// Click outside handler to close dropdown
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (dropdownRef.value && !dropdownRef.value.contains(target)) {
    open.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.category-sorting {
  position: relative;
  min-width: 200px;
  max-width: 300px;
}
</style>
