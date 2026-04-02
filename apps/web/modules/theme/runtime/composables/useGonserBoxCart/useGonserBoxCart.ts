/**
 * useGonserBoxCart - Berechnet Gonser Box Artikel im Warenkorb
 *
 * Erkennt Artikel mit Property ID 4, value '1'
 * Passe getCartItems() an dein Cart-System an
 */

import { computed } from 'vue';

export interface GonserBoxCartItem {
  price: number;
  quantity: number;
  basketItemOrderParams?: Array<{
    propertyId?: string | number;
    value?: string | number;
  }>;
  variation?: any; // Flexible type for compatibility with different cart systems
  [key: string]: any; // Allow additional properties for maximum compatibility
}

export const useGonserBoxCart = () => {
  // Adapter für Cart-System - hier anpassen für andere Projekte
  const getCartItems = (): GonserBoxCartItem[] => {
    try {
      const { data: cart } = useCart();
      return (cart.value?.items || []) as unknown as GonserBoxCartItem[];
    } catch (error) {
      console.warn('useCart() not available, returning empty cart');
      return [];
    }
  };

  // Prüft Property ID 4 mit value '1'
  const hasGonserBoxProperty = (item: GonserBoxCartItem): boolean => {
    try {
      // Primary: basketItemOrderParams (persistent)
      if (item.basketItemOrderParams && Array.isArray(item.basketItemOrderParams)) {
        const hasProperty = item.basketItemOrderParams.some((param) => {
          const propertyId = param?.propertyId ? String(param.propertyId) : null;
          const value = param?.value ? String(param.value) : null;
          return propertyId === '4' && value === '1';
        });

        if (hasProperty) return true;
      }

      // Fallback: variationPropertyGroups (direkt nach Add-to-Cart)
      const variationPropertyGroups = item?.variation?.variationPropertyGroups || item?.variation?.variationProperties;
      if (variationPropertyGroups && Array.isArray(variationPropertyGroups) && variationPropertyGroups.length > 0) {
        const isFlat = variationPropertyGroups[0]?.id && !variationPropertyGroups[0]?.properties;
        const allProperties = isFlat
          ? variationPropertyGroups
          : variationPropertyGroups.flatMap((group: any) => group?.properties || []);

        return allProperties.some((prop: any) => {
          const value = prop?.values?.value ? String(prop.values.value) : null;
          return prop?.id === 4 && value === '1';
        });
      }

      return false;
    } catch (error) {
      console.error('Error checking Gonser Box property:', error);
      return false;
    }
  };

  // Berechnet Gesamtsumme aller Gonser Box Artikel
  const gonserBoxTotal = computed(() => {
    try {
      const items = getCartItems();
      const gonserBoxItems = items.filter(hasGonserBoxProperty);

      const total = gonserBoxItems.reduce((sum: number, item) => {
        const price = item.price || 0;
        const quantity = item.quantity || 1;
        return sum + price * quantity;
      }, 0);

      return total || 0;
    } catch (error) {
      console.error('Error calculating Gonser Box total:', error);
      return 0;
    }
  });

  const gonserBoxItemCount = computed(() => {
    try {
      const items = getCartItems();
      return items.filter(hasGonserBoxProperty).length;
    } catch (error) {
      return 0;
    }
  });

  const gonserBoxItems = computed(() => {
    try {
      const items = getCartItems();
      return items.filter(hasGonserBoxProperty);
    } catch (error) {
      return [];
    }
  });

  return {
    gonserBoxTotal,
    gonserBoxItemCount,
    gonserBoxItems,
    hasGonserBoxProperty,
  };
};
