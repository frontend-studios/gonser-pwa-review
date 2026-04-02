/**
 * useRecentlyViewed - Verwaltet zuletzt angesehene Produkte
 *
 * Speichert Product-IDs im localStorage und lädt die vollständigen
 * Produkt-Daten über die API nach.
 */

import { productGetters } from '@plentymarkets/shop-api';
import type { Product } from '@plentymarkets/shop-api';
import type { RecentlyViewedItem, UseRecentlyViewedState, UseRecentlyViewedReturn } from './types';

const STORAGE_KEY = 'plentyshop-recently-viewed';
const MAX_ITEMS = 20;

export const useRecentlyViewed = (): UseRecentlyViewedReturn => {
  const state = useState<UseRecentlyViewedState>('useRecentlyViewed', () => ({
    items: [],
    loading: false,
  }));

  /**
   * Gibt den Storage Key zurück
   */
  const getStorageKey = (): string => STORAGE_KEY;

  /**
   * Lädt IDs aus localStorage
   */
  const loadFromStorage = (): RecentlyViewedItem[] => {
    if (import.meta.server) return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error loading recently viewed from storage:', error);
      return [];
    }
  };

  /**
   * Speichert IDs in localStorage
   */
  const saveToStorage = (items: RecentlyViewedItem[]): void => {
    if (import.meta.server) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving recently viewed to storage:', error);
    }
  };

  /**
   * Fügt ein Produkt zur Liste hinzu
   */
  const addProduct = (product: Product): void => {
    if (!product || import.meta.server) return;

    const itemId = productGetters.getItemId(product);
    const variationId = productGetters.getVariationId(product);

    if (!itemId) return;

    const itemIdNumber = Number(itemId);
    const storedItems = loadFromStorage();

    // Entferne Duplikate (gleiche itemId)
    const filtered = storedItems.filter((item) => item.itemId !== itemIdNumber);

    // Füge neues Item am Anfang hinzu
    const newItem: RecentlyViewedItem = {
      itemId: itemIdNumber,
      variationId: variationId || 0,
      timestamp: Date.now(),
    };

    const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
    saveToStorage(updated);

    // Aktualisiere State nur wenn das Produkt noch nicht drin ist
    const existsInState = state.value.items.some((p) => Number(productGetters.getItemId(p)) === itemIdNumber);

    if (!existsInState) {
      state.value.items = [product, ...state.value.items].slice(0, MAX_ITEMS);
    }
  };

  /**
   * Entfernt ein Produkt aus der Liste
   */
  const removeProduct = (itemId: number): void => {
    if (import.meta.server) return;

    const storedItems = loadFromStorage();
    const filtered = storedItems.filter((item) => item.itemId !== itemId);
    saveToStorage(filtered);

    state.value.items = state.value.items.filter((product) => Number(productGetters.getItemId(product)) !== itemId);
  };

  /**
   * Löscht alle gespeicherten Produkte
   */
  const clearAll = (): void => {
    if (import.meta.server) return;

    try {
      localStorage.removeItem(STORAGE_KEY);
      state.value.items = [];
    } catch (error) {
      console.error('Error clearing recently viewed:', error);
    }
  };

  /**
   * Lädt vollständige Produktdaten von der API
   */
  const fetchProducts = async (): Promise<void> => {
    if (import.meta.server) return;

    const storedItems = loadFromStorage();
    if (storedItems.length === 0) {
      state.value.items = [];
      return;
    }

    state.value.loading = true;

    try {
      const sdk = useSdk();

      // Lade Produkte parallel
      const productPromises = storedItems.map(async (item) => {
        try {
          const { data } = await sdk.plentysystems.getProduct({
            id: String(item.itemId),
            variationId: item.variationId ? String(item.variationId) : undefined,
          });
          return data;
        } catch (error) {
          console.error(`Error fetching product ${item.itemId}:`, error);
          return null;
        }
      });

      const products = await Promise.all(productPromises);

      // Filtere null-Werte (fehlgeschlagene Requests)
      const validProducts = products.filter((p): p is Product => p !== null);

      state.value.items = validProducts;

      // Entferne nicht mehr verfügbare Produkte aus dem Storage
      if (validProducts.length < storedItems.length) {
        const validItemIds = validProducts.map((p) => Number(productGetters.getItemId(p)));
        const cleanedItems = storedItems.filter((item) => validItemIds.includes(item.itemId));
        saveToStorage(cleanedItems);
      }
    } catch (error) {
      console.error('Error fetching recently viewed products:', error);
      state.value.items = [];
    } finally {
      state.value.loading = false;
    }
  };

  return {
    items: computed(() => state.value.items),
    loading: computed(() => state.value.loading),
    addProduct,
    removeProduct,
    clearAll,
    fetchProducts,
    getStorageKey,
  };
};
