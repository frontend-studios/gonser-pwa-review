/**
 * useEnergyLabel - Verwaltet Energieeffizienzklassen-Label für Produkte
 *
 * Prüft ob Produkt Property ID 47 hat und gibt den Wert zurück.
 * Unterstützt Energieeffizienzklassen von A+++ bis G.
 */

import { productGetters } from '@plentymarkets/shop-api';
import type { Product } from '@plentymarkets/shop-api';
import type { EnergyLabelGalleryImage, EnergyLabelProperty, EnergyLabelPropertyGroup } from './types';

export const useEnergyLabel = () => {
  const { t } = useNuxtApp().$i18n;
  /**
   * Prüft ob Produkt eine Energieeffizienzklasse hat
   * @param product - Das Produkt-Objekt
   * @returns true wenn Property 47 vorhanden
   */
  const hasEnergyLabel = (product: Product): boolean => {
    try {
      const variationPropertyGroups = productGetters.getPropertyGroups(product) as EnergyLabelPropertyGroup[] | undefined;
      if (!variationPropertyGroups || variationPropertyGroups.length === 0) return false;

      const allProperties = variationPropertyGroups.flatMap((group) => group.properties || []);

      return allProperties.some((prop) => {
        if (prop.id !== 47) return false;
        const value = getPropertyValue(prop);
        return value && value.length > 0;
      });
    } catch (error) {
      return false;
    }
  };

  /**
   * Gibt die Energieeffizienzklasse eines Produkts zurück
   * @param product - Das Produkt-Objekt
   * @returns Energieeffizienzklasse (z.B. "A++") oder null
   */
  const getEnergyLabelValue = (product: Product): string | null => {
    try {
      const variationPropertyGroups = productGetters.getPropertyGroups(product) as EnergyLabelPropertyGroup[] | undefined;
      if (!variationPropertyGroups || variationPropertyGroups.length === 0) return null;

      const allProperties = variationPropertyGroups.flatMap((group) => group.properties || []);
      const energyProperty = allProperties.find((prop) => prop.id === 47);

      if (!energyProperty) return null;

      const value = getPropertyValue(energyProperty);
      return value && value.length > 0 ? value : null;
    } catch (error) {
      console.error('Error getting energy label value:', error);
      return null;
    }
  };

  /**
   * Gibt die Bild-URL für eine Energieeffizienzklasse zurück
   * @param value - Energieeffizienzklasse (z.B. "A++" oder "neu_E")
   * @returns URL zur Grafik oder null
   */
  const getEnergyIconUrl = (value: string): string | null => {
    if (!value) return null;

    const baseUrl = t('theme.EnergyLabel.iconBaseUrl');

    // Mapping für Energieeffizienzklassen (neue ab 2021 mit "neu_" Präfix)
    const energyIconMapping: Record<string, string> = {
      // Neue Energieeffizienzklassen (ab 2021)
      neu_A: `${baseUrl}/neu_A_Left.png`,
      neu_B: `${baseUrl}/neu_B_Left.png`,
      neu_C: `${baseUrl}/neu_C_Left.png`,
      neu_D: `${baseUrl}/neu_D_Left.png`,
      neu_E: `${baseUrl}/neu_E_Left.png`,
      neu_F: `${baseUrl}/neu_F_Left.png`,
      neu_G: `${baseUrl}/neu_G_Left.png`,

      // Alte Energieeffizienzklassen (bis 2021)
      'alt_A+++': `${baseUrl}/alt_A+++_Left.png`,
      'alt_A++': `${baseUrl}/alt_A++_Left.png`,
      'alt_A+': `${baseUrl}/alt_A+_Left.png`,
      alt_A: `${baseUrl}/alt_A_Left.png`,
      alt_B: `${baseUrl}/alt_B_Left.png`,
      alt_C: `${baseUrl}/alt_C_Left.png`,
      alt_D: `${baseUrl}/alt_D_Left.png`,
      alt_E: `${baseUrl}/alt_E_Left.png`,
      alt_F: `${baseUrl}/alt_F_Left.png`,
      alt_G: `${baseUrl}/alt_G_Left.png`,
    };

    return energyIconMapping[value] || null;
  };

  /**
   * Gibt die Lightbox-Bild-URL für das Energielabel zurück
   * @param product - Das Produkt-Objekt
   * @returns URL zum Lightbox-Bild (Position 99) oder null
   */
  const getEnergyLabelLightboxImage = (product: Product): string | null => {
    try {
      const images = productGetters.getGallery(product) as EnergyLabelGalleryImage[] | undefined;
      if (!images || images.length === 0) return null;

      // Suche nach dem Bild mit Position 99
      const lightboxImage = images.find((img) => img.position === 99);

      if (lightboxImage?.url) {
        return lightboxImage.url;
      }

      return null;
    } catch (error) {
      console.error('Error getting energy label lightbox image:', error);
      return null;
    }
  };

  /**
   * Hilfsfunktion zum Extrahieren des Property-Werts
   * @param property - Property-Objekt
   * @returns Wert als String
   */
  const getPropertyValue = (property: EnergyLabelProperty): string => {
    const values = property.values;
    if (!values) return '';

    if (Array.isArray(values)) {
      const firstValue = values[0]?.value;
      return firstValue !== undefined && firstValue !== null ? String(firstValue) : '';
    }

    const directValue = values.value;
    return directValue !== undefined && directValue !== null ? String(directValue) : '';
  };

  return {
    hasEnergyLabel,
    getEnergyLabelValue,
    getEnergyIconUrl,
    getEnergyLabelLightboxImage,
  };
};
