import type { Filters } from '~/composables/useCategoryFilter/types';

export interface UseDelayedFiltersState {
  delayedFilters: Filters;
  delayedPriceMin: string;
  delayedPriceMax: string;
}

export interface UseDelayedFiltersReturn {
  delayedFilters: Ref<Filters>;
  delayedPriceMin: Ref<string>;
  delayedPriceMax: Ref<string>;
  updateDelayedFilter: (filterId: string, value: boolean) => void;
  updateDelayedPrice: (min: string, max: string) => void;
  applyDelayedFilters: () => void;
  resetDelayedFilters: () => void;
  initializeDelayedFilters: () => void;
}
