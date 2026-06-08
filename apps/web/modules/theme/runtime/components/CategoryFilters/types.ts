import type { FilterGroup } from '@plentymarkets/shop-api';
import type { SortFilterContent } from '~/components/blocks/SortFilter/types';

export type CategoryFiltersProps = {
  facets: FilterGroup[];
  configuration?: SortFilterContent;
  renderKey?: string;
  showAll?: boolean;
  limit?: number;
  currentCount?: number;
  totalProducts?: number;
};

export type FilterProps = {
  facet?: FilterGroup;
  configuration?: SortFilterContent;
  renderKey?: string;
  showAll?: boolean;
  limit?: number;
  delayed?: boolean;
};
