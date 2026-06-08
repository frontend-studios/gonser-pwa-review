import { ref, computed } from 'vue';

export interface SwissPostalCode {
  zip: string;
  zipSuffix: string; // Zusatzziffern
  city: string;
  canton: string;
}

export interface PostalCodeSearchResult {
  zip: string;
  zipSuffix: string;
  city: string;
  canton: string;
  displayText: string; // "9601 Lütisburg Station"
}

const postalCodes = ref<SwissPostalCode[]>([]);
const loading = ref(false);
const loaded = ref(false);

export const useSwissPostalCodes = () => {
  const loadPostalCodes = async () => {
    if (loaded.value || loading.value) return;

    // Only load on client-side (SSR doesn't support relative URLs in fetch)
    if (!import.meta.client) return;

    loading.value = true;
    try {
      const response = await fetch('/one-step-checkout/swiss-postal-codes.json');
      if (!response.ok) {
        throw new Error('Failed to load postal codes');
      }
      postalCodes.value = await response.json();
      loaded.value = true;
    } catch (error) {
      console.error('Failed to load Swiss postal codes:', error);
      postalCodes.value = [];
    } finally {
      loading.value = false;
    }
  };

  const searchPostalCodes = (query: string, limit = 20): PostalCodeSearchResult[] => {
    if (!query || query.length < 2) return [];

    const normalizedQuery = query.trim();

    const results = postalCodes.value
      .filter((item) => item.zip.startsWith(normalizedQuery))
      .slice(0, limit)
      .map((item) => ({
        zip: item.zip,
        zipSuffix: item.zipSuffix,
        city: item.city,
        canton: item.canton,
        displayText: `${item.zip} ${item.city}`,
      }));

    return results;
  };

  const searchCities = (query: string, limit = 20): PostalCodeSearchResult[] => {
    if (!query || query.length < 2) return [];

    const normalizedQuery = query.trim().toLowerCase();

    const results = postalCodes.value
      .filter((item) => item.city.toLowerCase().startsWith(normalizedQuery))
      .slice(0, limit)
      .map((item) => ({
        zip: item.zip,
        zipSuffix: item.zipSuffix,
        city: item.city,
        canton: item.canton,
        displayText: `${item.city} ${item.zip}`,
      }));

    return results;
  };

  return {
    loadPostalCodes,
    searchPostalCodes,
    searchCities,
    loading: computed(() => loading.value),
    loaded: computed(() => loaded.value),
  };
};
