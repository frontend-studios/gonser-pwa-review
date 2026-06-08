/**
 * useGonserBoxProperty - Verwaltet Gonser Box Property für Add-to-Cart
 *
 * Prüft ob Produkt Property ID 4 mit value '1' hat und erstellt
 * basketItemOrderParams für den Warenkorb.
 */

import { productGetters } from '@plentymarkets/shop-api';
import type { Product } from '@plentymarkets/shop-api';
import type { GonserBoxPropertyParam, ProductPropertyGroup } from './types';

export const useGonserBoxProperty = () => {
  /**
   * Erstellt basketItemOrderParams für Gonser Box Property
   * @param product - Das Produkt-Objekt
   * @returns basketItemOrderParams oder null
   */
  const getGonserBoxPropertyParam = (product: Product): GonserBoxPropertyParam | null => {
    try {
      const variationPropertyGroups = productGetters.getPropertyGroups(product) as ProductPropertyGroup[] | undefined;
      if (!variationPropertyGroups || variationPropertyGroups.length === 0) return null;

      const allProperties = variationPropertyGroups.flatMap((group) => group.properties || []);
      const gonserBoxProperty = allProperties.find((prop) => {
        const value = prop?.values?.value ? String(prop.values.value) : null;
        return prop.id === 4 && value === '1';
      });

      if (!gonserBoxProperty) return null;

      return {
        property: {
          id: gonserBoxProperty.id,
          names: { name: gonserBoxProperty.names?.name || 'Boxartikel' },
          valueType: gonserBoxProperty.cast || 'int',
          value: String(gonserBoxProperty.values?.value),
        },
      };
    } catch (error) {
      console.error('Error creating Gonser Box property param:', error);
      return null;
    }
  };

  /**
   * Prüft ob Produkt eine Gonser Box Property (ID 4, value '1') hat
   * @param product - Das Produkt-Objekt
   * @returns true wenn Property vorhanden
   */
  const hasGonserBoxProperty = (product: Product): boolean => {
    try {
      const variationPropertyGroups = productGetters.getPropertyGroups(product) as ProductPropertyGroup[] | undefined;

      if (!variationPropertyGroups || variationPropertyGroups.length === 0) {
        return false;
      }

      const allProperties = variationPropertyGroups.flatMap((group) => group.properties || []);

      return allProperties.some((prop) => {
        if (prop.id !== 4) return false;
        const value = prop?.values?.value;
        return value === '1';
      });
    } catch (error) {
      console.error('Error checking Gonser Box property:', error);
      return false;
    }
  };

  return {
    getGonserBoxPropertyParam,
    hasGonserBoxProperty,
  };
};
