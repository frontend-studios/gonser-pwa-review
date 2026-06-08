import type { Product } from '@plentymarkets/shop-api';

export interface RecentlyViewedItem {
  itemId: number;
  variationId: number;
  timestamp: number;
}

export interface UseRecentlyViewedState {
  items: Product[];
  loading: boolean;
  loadedItemIds: string;
}

export interface UseRecentlyViewedReturn {
  items: ComputedRef<Product[]>;
  loading: ComputedRef<boolean>;
  addProduct: (product: Product) => void;
  removeProduct: (itemId: number) => void;
  clearAll: () => void;
  fetchProducts: () => Promise<void>;
  getStorageKey: () => string;
}
