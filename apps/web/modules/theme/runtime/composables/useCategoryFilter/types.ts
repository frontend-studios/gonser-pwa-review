import type { FacetSearchCriteria } from '@plentymarkets/shop-api';

export interface GetFacetsFromURLResponse extends FacetSearchCriteria {
  term?: string;
  feedbackPage?: number;
  feedbacksPerPage?: number;
  categoryUrlPath?: string;
}

export interface Filters {
  [key: string]: boolean;
}

export interface UseCategoryFiltersResponse {
  getFacetsFromURL(): GetFacetsFromURLResponse;
  updateFilters(filters: Filters): Promise<void>;
  updatePrices(priceMin: string, priceMax: string): Promise<void>;
  updateItemsPerPage(itemsPerPage: number): void;
  updateSearchTerm(term: string): void;
  updateSorting(sort: string): void;
  updatePage(page: string, currentPageName: string): void;
  updateQuery(parameter?: object): Promise<void>;
  checkFiltersInURL(): void;
}
