import type { UseDelayedFiltersReturn, UseDelayedFiltersState } from './types';
import type { Filters } from '~/composables/useCategoryFilter/types';

/**
 * @description Composable for managing delayed filter application (for modal use)
 * @returns UseDelayedFiltersReturn
 * @example
 * ``` ts
 * const { delayedFilters, updateDelayedFilter, applyDelayedFilters, resetDelayedFilters } = useDelayedFilters();
 * ```
 */
export const useDelayedFilters = (): UseDelayedFiltersReturn => {
  const { getFacetsFromURL, updateFilters, updatePrices } = useCategoryFilter();

  const state = useState<UseDelayedFiltersState>('useDelayedFilters', () => ({
    delayedFilters: {} as Filters,
    delayedPriceMin: '',
    delayedPriceMax: '',
  }));

  /**
   * @description Initialize delayed filters from current URL state
   */
  const initializeDelayedFilters = () => {
    const currentFacets = getFacetsFromURL();
    const facetIds = currentFacets.facets?.split(',') ?? [];

    const filters: Filters = {};
    facetIds.forEach((id: string) => {
      filters[id] = true;
    });

    state.value.delayedFilters = filters;
    state.value.delayedPriceMin = currentFacets.priceMin ?? '';
    state.value.delayedPriceMax = currentFacets.priceMax ?? '';
  };

  /**
   * @description Update a single delayed filter
   */
  const updateDelayedFilter = (filterId: string, value: boolean) => {
    state.value.delayedFilters = {
      ...state.value.delayedFilters,
      [filterId]: value,
    };
  };

  /**
   * @description Update delayed price range
   */
  const updateDelayedPrice = (min: string, max: string) => {
    state.value.delayedPriceMin = min;
    state.value.delayedPriceMax = max;
  };

  /**
   * @description Apply all delayed filters to URL (triggers actual filtering)
   */
  const applyDelayedFilters = async () => {
    // IMPORTANT: We need to REPLACE all filters, not merge them
    // First, get all current filters from URL and set them to false
    const currentFilters = getFacetsFromURL();
    const currentFacetIds = currentFilters.facets?.split(',') ?? [];
    const resetFilters: Filters = {};

    // Set all current filters to false (to remove them)
    currentFacetIds.forEach((id: string) => {
      resetFilters[id] = false;
    });

    // Then merge with delayed filters (which will override)
    const finalFilters = {
      ...resetFilters,
      ...state.value.delayedFilters,
    };

    // Get filter IDs string
    const filtersIds = Object.keys(finalFilters)
      .filter((key) => finalFilters[key])
      .join(',');

    // CRITICAL FIX: Build complete query update in one object
    // to avoid race condition between multiple navigateTo calls
    const queryUpdate: Record<string, string | null> = {};

    // Add facets
    if (filtersIds) {
      queryUpdate.facets = filtersIds;
    } else {
      queryUpdate.facets = null;
    }

    // Add prices
    const hasMinPrice = state.value.delayedPriceMin && state.value.delayedPriceMin.length > 0;
    const hasMaxPrice = state.value.delayedPriceMax && state.value.delayedPriceMax.length > 0;

    if (hasMinPrice) {
      queryUpdate.priceMin = state.value.delayedPriceMin;
    } else {
      queryUpdate.priceMin = null;
    }

    if (hasMaxPrice) {
      queryUpdate.priceMax = state.value.delayedPriceMax;
    } else {
      queryUpdate.priceMax = null;
    }

    // Get existing query params and merge with new ones
    const router = useRouter();
    const currentQuery = { ...router.currentRoute.value.query };

    // Apply updates (remove nulls)
    Object.entries(queryUpdate).forEach(([key, value]) => {
      if (value === null) {
        delete currentQuery[key];
      } else {
        currentQuery[key] = value;
      }
    });

    // Apply everything in ONE navigateTo call
    if (import.meta.client) {
      await navigateTo({ query: currentQuery });
    }
  };

  /**
   * @description Reset all delayed filters to empty state
   */
  const resetDelayedFilters = () => {
    // Set ALL filters in delayedFilters to false (including any from URL)
    const resetFilters: Filters = {};

    // Get all filter IDs from current delayedFilters state
    Object.keys(state.value.delayedFilters).forEach((id) => {
      resetFilters[id] = false;
    });

    // Also include any filters from URL that might not be in delayedFilters yet
    const currentFacets = getFacetsFromURL();
    const facetIds = currentFacets.facets?.split(',') ?? [];
    facetIds.forEach((id: string) => {
      resetFilters[id] = false;
    });

    state.value.delayedFilters = resetFilters;
    state.value.delayedPriceMin = '';
    state.value.delayedPriceMax = '';
  };

  // Initialize on first use
  if (Object.keys(state.value.delayedFilters).length === 0) {
    initializeDelayedFilters();
  }

  return {
    delayedFilters: computed(() => state.value.delayedFilters),
    delayedPriceMin: computed(() => state.value.delayedPriceMin),
    delayedPriceMax: computed(() => state.value.delayedPriceMax),
    updateDelayedFilter,
    updateDelayedPrice,
    applyDelayedFilters,
    resetDelayedFilters,
    initializeDelayedFilters,
  };
};

export default useDelayedFilters;
