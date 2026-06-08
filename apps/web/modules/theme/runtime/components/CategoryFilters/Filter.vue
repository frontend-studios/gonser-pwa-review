<template>
  <div
    v-if="facet"
    ref="dropdownRef"
    :class="['relative', delayed ? 'modal-filter border-b border-gray' : 'visible-filter']"
  >
    <!-- Summary/Header (ClickableButton) -->
    <div
      :class="[
        'flex items-center justify-between select-none cursor-pointer',
        delayed ? 'py-2.5' : 'mb-2 px-4 py-0.5 bg-gray-light hover:bg-gray rounded-[46px] border border-transparent',
        { '!border-black': hasActiveFilters && !delayed },
      ]"
      @click="toggleOpen"
    >
      <div :class="['py-1 rounded-none text-base select-none', { 'font-bold': delayed }]">
        {{ facetGetters.getName(facet) }}
      </div>
      <SfIconClose
        v-if="hasActiveFilters && !delayed"
        class="text-black cursor-pointer"
        size="xs"
        @click.stop="resetFacetFilters"
      />
      <SfIconChevronLeft v-else :class="['text-black', open ? 'rotate-90' : '-rotate-90']" />
    </div>

    <!-- Dropdown Content (Conditional Positioning) -->
    <div
      v-if="open"
      :class="[
        'bg-white rounded-lg overflow-y-auto',
        delayed
          ? 'relative mb-2 max-h-none'
          : 'absolute top-full left-0 w-full shadow-lg mt-1 z-[9999] max-h-[400px] border border-gray-200',
      ]"
    >
      <!-- Feedback Type -->
      <div v-if="facetGetters.getType(facet) === 'feedback'" class="py-4">
        <SfListItem v-for="(filter, index) in sortedReviews(facet)" :key="index" tag="label" class="mb-3" size="sm">
          <div class="flex items-center space-x-1">
            <span class="pt-1 flex items-center">
              <SfCheckbox
                :id="filter.id"
                v-model="models[filter.id]"
                :value="filter"
                @change="handleChange(filter.id)"
              />
            </span>
            <span class="flex items-center pt-[2px]">
              <SfRating :value="feedbackNumber(filter)" :max="5" />
            </span>
            <span
              :class="[
                'ml-2 pt-1 min-w-[10px] text-base text-center flex items-center justify-center',
                { 'font-medium': feedbackNumber(filter) === 5 },
              ]"
            >
              {{ feedbackNumber(filter) }}
            </span>
            <span v-if="feedbackNumber(filter) != 5" class="ml-1 pt-1 flex items-center">
              <SfIconArrowUpward size="sm" />
            </span>
            <span>
              <SfCounter :class="['ml-1 pt-1 flex items-center text-base', { 'ml-3': feedbackNumber(filter) === 5 }]">
                {{ filter.count }}
              </SfCounter>
            </span>
          </div>
        </SfListItem>
      </div>

      <!-- Price Type -->
      <form
        v-else-if="facetGetters.getType(facet) === 'price'"
        :class="delayed ? 'px-1' : 'p-2'"
        @submit.prevent="handlePriceSubmit"
      >
        <!-- Range Slider -->
        <div class="mb-3">
          <div class="relative h-8">
            <!-- Min Range Slider -->
            <input
              type="range"
              :min="0"
              :max="maxPriceValue"
              :step="1"
              v-model.number="minPriceSlider"
              @input="handleMinSliderChange"
              class="absolute w-full h-2 appearance-none bg-transparent pointer-events-none z-10"
              :style="{
                '--range-thumb-color': '#FFF',
                top: '7px',
              }"
            />
            <!-- Max Range Slider -->
            <input
              type="range"
              :min="0"
              :max="maxPriceValue"
              :step="1"
              v-model.number="maxPriceSlider"
              @input="handleMaxSliderChange"
              class="absolute w-full h-2 appearance-none bg-transparent pointer-events-none z-10"
              :style="{
                '--range-thumb-color': '#FFF',
                top: '7px',
              }"
            />
            <!-- Track Background -->
            <div class="absolute w-full h-1 bg-gray-200 rounded top-3"></div>
            <!-- Active Track -->
            <div
              class="absolute h-1 bg-black rounded top-3"
              :style="{
                left: `${(minPriceSlider / maxPriceValue) * 100}%`,
                right: `${100 - (maxPriceSlider / maxPriceValue) * 100}%`,
              }"
            ></div>
          </div>
          <!-- Price Range Display -->
          <div class="flex justify-between text-sm text-gray-600 mt-2">
            <span>{{ minPriceSlider }} CHF</span>
            <span>{{ maxPriceSlider }} CHF</span>
          </div>
        </div>

        <div class="flex items-center gap-2 mb-1">
          <span class="text-sm font-medium shrink-0">CHF</span>
          <div class="w-full [&>span]:rounded-[40px] [&>span]:ring-[#E8E5EB] [&_input]:placeholder-black">
            <SfInput id="min" v-model="minPrice" placeholder="0" class="w-full" @input="handleMinInputChange" />
          </div>
          <span class="text-sm font-medium shrink-0">CHF</span>
          <div class="w-full [&>span]:rounded-[40px] [&>span]:ring-[#E8E5EB] [&_input]:placeholder-black">
            <SfInput
              id="max"
              v-model="maxPrice"
              :placeholder="t('common.labels.max')"
              class="w-full"
              @input="handleMaxInputChange"
            />
          </div>
        </div>
        <div v-if="!delayed" class="flex">
          <UiButton
            type="submit"
            class="w-full mr-3 h-10"
            :disabled="minPrice.length === 0 && maxPrice.length === 0"
            variant="secondary"
          >
            <template #prefix>
              <SfIconCheck />
            </template>
            {{ t('common.actions.apply') }}
          </UiButton>
          <UiButton
            type="reset"
            class="h-10"
            variant="secondary"
            :aria-label="t('common.actions.clear')"
            @click="handlePriceReset"
          >
            <SfIconClose />
          </UiButton>
        </div>
      </form>

      <!-- Default Filter Type -->
      <div v-else :class="delayed ? '' : 'py-4'">
        <SfListItem
          v-for="(filter, index) in sortedFilters"
          :key="index"
          tag="label"
          size="sm"
          :data-testid="'category-filter-' + index"
          :class="[delayed ? '!px-1' : 'px-2', 'bg-transparent hover:bg-transparent']"
        >
          <p class="select-none flex items-center justify-between w-full">
            <span class="flex items-center">
              <!-- Color circle for Farbe facet (ID 4) & Lichtfarbe (ID 10)-->
              <span
                v-if="(facet && String(facet.id) === '4') || (facet && String(facet.id) === '10')"
                class="inline-flex items-center"
              >
                <!-- Bunt (ID 31) - Image -->
                <span
                  v-if="isColorImage(String(filter.id))"
                  class="inline-block w-[19px] h-[19px] rounded-full border border-gray mr-2 bg-center bg-cover"
                  :style="{
                    backgroundImage: 'url(https://cdn10.plentymarkets.com/mrt54q44tptl/frontend/Gonser/icons/bunt.png)',
                  }"
                ></span>
                <!-- Transparent (ID 34) - Only border -->
                <span
                  v-else-if="isTransparent(String(filter.id))"
                  class="inline-block w-[19px] h-[19px] rounded-full border border-gray mr-2"
                ></span>
                <!-- Normal colors -->
                <span
                  v-else-if="getColorByFilterId(String(filter.id))"
                  class="inline-block w-[19px] h-[19px] rounded-full border border-gray mr-2"
                  :style="{ backgroundColor: getColorByFilterId(String(filter.id)) || '' }"
                ></span>
              </span>
              <span class="mr-2 text-sm">{{ getFilterDisplayName(filter) }}</span>
              <span class="text-gray-super-dark">({{ filter.count ?? 0 }})</span>
            </span>
          </p>
          <template #suffix>
            <SfCheckbox
              :id="filter.id"
              v-model="models[filter.id]"
              :value="filter"
              class="flex items-center"
              @change="handleChange(filter.id)"
            />
          </template>
        </SfListItem>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted, reactive, nextTick, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { type Filter, type FilterGroup, facetGetters } from '@plentymarkets/shop-api';
import {
  SfInput,
  SfIconCheck,
  SfIconClose,
  SfIconChevronLeft,
  SfListItem,
  SfRating,
  SfCheckbox,
  SfCounter,
  SfIconArrowUpward,
  SfIconCancel,
} from '@storefront-ui/vue';
import type { FilterProps } from './types';
import { useDelayedFilters } from '../../composables/useDelayedFilters/useDelayedFilters';
import { useCategoryFilter } from '../../../../../app/composables/useCategoryFilter/useCategoryFilter';
import { useProducts } from '../../../../../app/composables/useProducts/useProducts';
import { useI18n } from 'vue-i18n';

type Filters = Record<string, boolean>;

// Ensure truly global cache across ALL component instances and HMR reloads
// Store it on globalThis to survive component remounts and different instances
if (typeof globalThis !== 'undefined') {
  if (!(globalThis as any).__plentyFilterCache) {
    (globalThis as any).__plentyFilterCache = reactive(new Map<string | number, Filter[]>());
  }
}

// Get the shared global cache
const globalFilterCache =
  typeof globalThis !== 'undefined'
    ? ((globalThis as any).__plentyFilterCache as Map<string | number, Filter[]>)
    : reactive(new Map<string | number, Filter[]>());

const props = withDefaults(defineProps<FilterProps>(), {
  delayed: false,
});

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const { getFacetsFromURL, updateFilters, updatePrices } = useCategoryFilter();
const { delayedFilters, delayedPriceMin, delayedPriceMax, updateDelayedFilter, updateDelayedPrice } =
  useDelayedFilters();

// Use global cache to persist filter options across component remounts (e.g., when modal reopens)
const filters = computed(() => {
  if (!props.facet) return [];

  const facetId = props.facet.id;
  const currentFilters = facetGetters.getFilters(props.facet) as Filter[];

  // Cache strategy:
  // - Visible filters (delayed=false): Populate cache if THIS facet has no active selections
  //   This ensures we cache the full list, not a filtered subset
  // - Modal filters (delayed=true): Use existing cache from visible filters, don't modify cache
  if (!globalFilterCache.has(facetId) && currentFilters.length > 0 && !props.delayed) {
    // Check if THIS specific facet has active selections in URL
    const currentFacetsInUrl = getFacetsFromURL().facets?.split(',') ?? [];
    const thisFacetHasActiveFilters = currentFilters.some((filter) => currentFacetsInUrl.includes(String(filter.id)));

    if (!thisFacetHasActiveFilters) {
      // Only cache if this facet has no active selections (= full list from backend)
      globalFilterCache.set(facetId, [...currentFilters]);
    }
  }

  const cachedFilters = globalFilterCache.get(facetId) || [];

  // If no cache yet, use current filters
  // (Cache will be populated when this facet has no active selections)
  if (cachedFilters.length === 0) {
    return currentFilters;
  }

  // Merge cached filters with current filters to update counts
  const filterMap = new Map<string | number, Filter>();

  // Start with all cached filters (keeps full list)
  cachedFilters.forEach((filter) => {
    filterMap.set(filter.id, { ...filter, count: 0 }); // Default count to 0
  });

  // Update with current filter data (fresh counts from backend)
  currentFilters.forEach((filter) => {
    const existing = filterMap.get(filter.id);
    if (existing) {
      // Update existing filter with fresh data
      filterMap.set(filter.id, { ...existing, ...filter });
    } else {
      // New filter not in cache (rare case)
      filterMap.set(filter.id, filter);
    }
  });

  return Array.from(filterMap.values());
});

// Check if this filter has active selections
const hasActiveSelectionsInFacet = computed(() => {
  if (!props.facet) return false;

  // For delayed (modal) filters, check delayed state
  if (props.delayed) {
    return filters.value.some((filter) => {
      const filterId = String(filter.id);
      return delayedFilters.value[filterId] === true;
    });
  }

  // For immediate filters, check URL state
  const currentFacets = getFacetsFromURL().facets?.split(',') ?? [];
  return filters.value.some((filter) => {
    const filterId = String(filter.id);
    return currentFacets.includes(filterId);
  });
});

// Auto-open accordion if this facet has active filters (only in modal)
const open = ref(false);

// Use onMounted to set initial open state after component is fully rendered
onMounted(() => {
  if (props.delayed) {
    // Open if has active selections OR if it's a price filter (always show price in modal)
    const isPriceFilter = props.facet && facetGetters.getType(props.facet) === 'price';
    if (hasActiveSelectionsInFacet.value || isPriceFilter) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        open.value = true;
      }, 50);
    }
  }
});

// Watch for changes in active selections to reactively open/close accordion
watch(
  hasActiveSelectionsInFacet,
  (hasActive) => {
    if (props.delayed && hasActive && !open.value) {
      open.value = true;
    }
  },
  { flush: 'post' },
);

// Also watch delayedFilters directly to catch later updates
watch(
  () => delayedFilters.value,
  () => {
    if (props.delayed && hasActiveSelectionsInFacet.value && !open.value) {
      open.value = true;
    }
  },
  { deep: true },
);

const models = reactive<Filters>({});
const dropdownRef = ref<HTMLElement | null>(null);

// Sortiere Filter nach Position (0, 1, 2, 3...)
const sortedFilters = computed(() => {
  return [...filters.value].sort((a, b) => {
    const posA = a.position ?? 999999;
    const posB = b.position ?? 999999;
    return posA - posB;
  });
});

// Color mapping for Facette ID 4 (Farbe)
const getColorByFilterId = (filterId: string): string | null => {
  const colorMap: Record<string, string> = {
    '2': '#FFFF00', // gelb
    '14': '#FFFFFF', // weiß
    '19': '#AF9F96', // taube
    '15': '#000000', // schwarz
    '16': '#808080', // grau
    '17': '#293133', // anthrazit
    '18': '#F5F5DC', // beige
    '20': '#40E0D0', // türkis
    '21': '#FFC0CB', // rosa
    '22': '#0000FF', // blau
    '23': '#FF0000', // rot
    '24': '#008000', // grün
    '25': '#FF8C00', // orange
    '26': '#FF00FF', // pink
    '27': '#FDE8CC', // creme
    '28': '#8C23BD', // violett
    '29': '#5B3A29', // braun
    '30': '#2D6C7A', // petrol
    '32': '#C0C0C0', // silber
    '33': '#FFD700', // gold
  };
  return colorMap[filterId] || null;
};

// Check if filter is "bunt" (ID 31) - uses image
const isColorImage = (filterId: string): boolean => {
  return filterId === '31';
};

// Check if filter is "transparent" (ID 34) - only border
const isTransparent = (filterId: string): boolean => {
  return filterId === '34';
};

// Get display name for filter (with availability translation)
const getFilterDisplayName = (filter: Filter): string => {
  if (!props.facet) return filter.name || String(filter.id);

  const facetId = String(props.facet.id);
  const filterId = String(filter.id);

  // Check if this is an availability filter (ID 8)
  if (facetId === '8') {
    const translationKey = `theme.filter.availability.id${filterId}`;
    const translated = t(translationKey);
    if (translated && translated !== translationKey) {
      return translated;
    }
  }

  // Check if this is a SALE filter (ID 7)
  if (facetId === '7') {
    const translationKey = `theme.filter.sale.id${filterId}`;
    const translated = t(translationKey);
    if (translated && translated !== translationKey) {
      return translated;
    }
  }

  // Check for name-based override (strips spaces from filter.name as key)
  const nameKey = filter.name?.replace(/\s+/g, '');
  if (nameKey) {
    const overrideKey = `theme.filter.nameOverride.${nameKey}`;
    const overridden = t(overrideKey);
    if (overridden && overridden !== overrideKey) {
      return overridden;
    }
  }

  // Default: use filter name or id
  return filter.name || String(filter.id);
};

// Toggle dropdown open/close
const toggleOpen = () => {
  open.value = !open.value;
};

// Click outside handler to close dropdown
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (dropdownRef.value && !dropdownRef.value.contains(target)) {
    open.value = false;
  }
};

onMounted(() => {
  // Only add click outside handler for visible filters (not in modal)
  if (!props.delayed) {
    document.addEventListener('click', handleClickOutside);
  }
});

onUnmounted(() => {
  if (!props.delayed) {
    document.removeEventListener('click', handleClickOutside);
  }
});

// Check if any filter in this facet is active
const hasActiveFilters = computed(() => {
  if (props.delayed) return false; // Nur bei sichtbaren Filtern

  // Check for price filters - only active if values are in URL
  if (props.facet && facetGetters.getType(props.facet) === 'price') {
    const urlPriceMin = getFacetsFromURL().priceMin;
    const urlPriceMax = getFacetsFromURL().priceMax;
    return !!urlPriceMin || !!urlPriceMax;
  }

  // Check for normal filters
  return Object.values(models).some((value) => value === true);
});

// Price
const minPrice = ref('');
const maxPrice = ref('');

// Price Range Slider
const { data: productsCatalog } = useProducts();

// Global price cache per category (persists across mounts)
interface PriceCache {
  [key: string]: number;
}

if (typeof globalThis !== 'undefined' && !(globalThis as any).__plentyPriceCache) {
  (globalThis as any).__plentyPriceCache = reactive<PriceCache>({});
}
const globalPriceCache =
  typeof globalThis !== 'undefined' ? ((globalThis as any).__plentyPriceCache as PriceCache) : reactive<PriceCache>({});

// Fetch maximum price for current category/filters
const maxPriceValue = ref(1000); // Default
const maxPriceLoading = ref(false);

const isPriceFacet = computed(() => {
  return !!props.facet && facetGetters.getType(props.facet) === 'price';
});

const shouldFetchMaxPrice = computed(() => {
  // Only fetch for the visible price facet while we are on category routes.
  return isPriceFacet.value && !props.delayed && route.meta?.type === 'category';
});

const fetchMaxPrice = async () => {
  if (!shouldFetchMaxPrice.value) {
    return;
  }

  const currentFacets = getFacetsFromURL();
  const categoryUrlPath = currentFacets.categoryUrlPath;
  const categoryId = currentFacets.categoryId;

  // Skip calls outside category context (e.g. during route transition to PDP/search).
  if (!categoryUrlPath && !categoryId) {
    return;
  }

  // Build cache key from ONLY category (ignore active filters)
  const cacheKey = String(categoryUrlPath || categoryId);

  // Check cache first
  if (globalPriceCache[cacheKey]) {
    maxPriceValue.value = globalPriceCache[cacheKey];
    return;
  }

  // Fetch from API: Get first product sorted by price descending
  // IMPORTANT: Don't include 'facets' parameter to get max price of ALL products in category
  try {
    maxPriceLoading.value = true;

    const params = {
      categoryUrlPath,
      categoryId,
      // facets: currentFacets.facets, // REMOVED - we want max price without filters
      itemsPerPage: 1,
      page: 1,
      sort: 'sorting.price.avg_desc', // Sort by price descending
    };

    // @ts-ignore - useSdk is a Nuxt auto-import
    const { data } = await useSdk().plentysystems.getFacet(params);

    if (data?.products && data.products.length > 0) {
      const highestPrice = data.products[0]?.prices?.default?.price?.value || 0;
      if (highestPrice > 0) {
        const roundedMax = Math.ceil(highestPrice);
        maxPriceValue.value = roundedMax;
        globalPriceCache[cacheKey] = roundedMax;
      }
    } else {
      console.log('[Price Filter] Keine Produkte gefunden für:', params);
    }
  } catch (error) {
    console.warn('Failed to fetch max price:', error);
    // Keep default value
  } finally {
    maxPriceLoading.value = false;
  }
};

// Fetch max price when component mounts (for any facet, not just price facet)
onMounted(() => {
  if (shouldFetchMaxPrice.value) {
    fetchMaxPrice();
  }
});

watch(
  () => ({
    shouldFetch: shouldFetchMaxPrice.value,
    categoryPath: getFacetsFromURL().categoryUrlPath,
    categoryId: getFacetsFromURL().categoryId,
    // facets removed - we only fetch max price when category changes, not when filters change
  }),
  ({ shouldFetch }) => {
    if (!shouldFetch) {
      return;
    }

    // Fetch max price when category changes (not when filters change)
    fetchMaxPrice();
  },
  { deep: true },
);

// Slider values
const minPriceSlider = ref(0);
const maxPriceSlider = ref(1000); // Initial default

// Update slider max when maxPriceValue changes
watch(
  maxPriceValue,
  (newMax, oldMax) => {
    // Only auto-update if slider is at the old max (user hasn't changed it)
    // OR if there's no active price filter in URL
    const currentMaxPrice = getFacetsFromURL().priceMax;
    if (!currentMaxPrice || !oldMax || maxPriceSlider.value >= oldMax) {
      maxPriceSlider.value = newMax;
    }
  },
  { immediate: true }, // Run immediately to set initial value
);

// Slider change handlers
const handleMinSliderChange = () => {
  if (minPriceSlider.value > maxPriceSlider.value) {
    minPriceSlider.value = maxPriceSlider.value;
  }
  minPrice.value = minPriceSlider.value.toString();
};

const handleMaxSliderChange = () => {
  if (maxPriceSlider.value < minPriceSlider.value) {
    maxPriceSlider.value = minPriceSlider.value;
  }
  maxPrice.value = maxPriceSlider.value.toString();
};

// Input change handlers (sync slider with input)
const handleMinInputChange = () => {
  const value = Number(minPrice.value);
  if (!isNaN(value) && value >= 0 && value <= maxPriceValue.value) {
    minPriceSlider.value = Math.floor(value);
  }
};

const handleMaxInputChange = () => {
  const value = Number(maxPrice.value);
  if (!isNaN(value) && value >= 0 && value <= maxPriceValue.value) {
    maxPriceSlider.value = Math.floor(value);
  }
};

const updateFilter = () => {
  if (props.delayed) {
    // Use delayed filters state
    for (const filter of filters.value) {
      const filterId = typeof filter.id === 'string' ? filter.id : filter.id.toString();
      models[filterId] = delayedFilters.value[filterId] ?? false;
    }
    minPrice.value = delayedPriceMin.value;
    // If no max price in delayed state, use the calculated maximum as default
    maxPrice.value = delayedPriceMax.value || (maxPriceValue.value > 0 ? maxPriceValue.value.toString() : '');
  } else {
    // Use URL state (immediate mode)
    const currentFacets = getFacetsFromURL().facets?.split(',') ?? [];
    for (const filter of filters.value) {
      const filterId = typeof filter.id === 'string' ? filter.id : filter.id.toString();
      models[filterId] = currentFacets.includes(filterId);
    }
    minPrice.value = getFacetsFromURL().priceMin ?? '';
    // If no max price in URL, use the calculated maximum as default
    maxPrice.value = getFacetsFromURL().priceMax ?? (maxPriceValue.value > 0 ? maxPriceValue.value.toString() : '');
  }

  // Update slider values from input values
  if (minPrice.value) {
    const value = Number(minPrice.value);
    if (!isNaN(value)) {
      minPriceSlider.value = Math.floor(value);
    }
  } else {
    minPriceSlider.value = 0;
  }

  if (maxPrice.value) {
    const value = Number(maxPrice.value);
    if (!isNaN(value)) {
      maxPriceSlider.value = Math.floor(value);
    }
  } else {
    maxPriceSlider.value = maxPriceValue.value;
  }
};

const handleChange = (filterId: string | number) => {
  const filterIdStr = String(filterId);

  if (props.delayed) {
    // Update only the changed filter in delayed state
    updateDelayedFilter(filterIdStr, models[filterIdStr] ?? false);
  } else {
    // Apply immediately - update all filters
    updateFilters(models);
  }
};

const handlePriceSubmit = () => {
  const min = minPrice.value.length > 0 ? Number(minPrice.value) : Number.NaN;
  const max = maxPrice.value.length > 0 ? Number(maxPrice.value) : Number.NaN;
  const minValue = Number.isNaN(min) ? '' : min.toString();
  const maxValue = Number.isNaN(max) ? '' : max.toString();

  if (props.delayed) {
    updateDelayedPrice(minValue, maxValue);
  } else {
    updatePrices(minValue, maxValue);
  }
};

const handlePriceReset = () => {
  if (props.delayed) {
    updateDelayedPrice('', '');
    minPrice.value = '';
    maxPrice.value = '';
  } else {
    updatePrices('', '');
  }
  // Reset sliders and restore max price as default
  minPriceSlider.value = 0;
  maxPriceSlider.value = maxPriceValue.value;
  minPrice.value = '';
  maxPrice.value = maxPriceValue.value > 0 ? maxPriceValue.value.toString() : '';
};

// Reset all filters in this facet (for visible filters only)
const resetFacetFilters = () => {
  if (props.delayed) return; // Nur bei sichtbaren Filtern

  // Check if it's a price filter
  if (props.facet && facetGetters.getType(props.facet) === 'price') {
    minPrice.value = '';
    maxPrice.value = maxPriceValue.value > 0 ? maxPriceValue.value.toString() : '';
    minPriceSlider.value = 0;
    maxPriceSlider.value = maxPriceValue.value;
    updatePrices('', '');
    return;
  }

  // Reset all filter checkboxes in this facet
  for (const filter of filters.value) {
    const filterId = typeof filter.id === 'string' ? filter.id : filter.id.toString();
    models[filterId] = false;
  }

  // Apply immediately
  updateFilters(models);
};

updateFilter();

watch(
  () => router.currentRoute.value.query,
  () => {
    if (!props.delayed) {
      updateFilter();
    }
  },
);

watch(
  () => [delayedFilters.value, delayedPriceMin.value, delayedPriceMax.value],
  () => {
    if (props.delayed) {
      updateFilter();
    }
  },
  { deep: true },
);

// Update input fields when max price value changes
watch(maxPriceValue, () => {
  if (!props.delayed && !getFacetsFromURL().priceMax) {
    // Only update if there's no active price filter
    updateFilter();
  }
});

const feedbackNumber = (filter: Filter) => {
  return Number(filter.id.toString().replace('feedback-', ''));
};

const sortedReviews = (facet: FilterGroup): Filter[] =>
  facetGetters.getFilters(facet).sort((a, b) => feedbackNumber(b) - feedbackNumber(a));
</script>

<style scoped>
/* Range Slider Styles */
input[type='range'] {
  pointer-events: auto;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--range-thumb-color, #000);
  cursor: pointer;
  pointer-events: auto;
  position: relative;
  z-index: 20;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

input[type='range']::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--range-thumb-color, #000);
  cursor: pointer;
  pointer-events: auto;
  position: relative;
  z-index: 20;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

input[type='range']::-webkit-slider-runnable-track {
  width: 100%;
  height: 8px;
  cursor: pointer;
  background: transparent;
}

input[type='range']::-moz-range-track {
  width: 100%;
  height: 8px;
  cursor: pointer;
  background: transparent;
}

:deep(input[type='checkbox']:checked) {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath fill='none' stroke='%23000000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M2 6l3 3 5-5'/%3E%3C/svg%3E") !important;
  border-color: #151515 !important;
}
</style>
