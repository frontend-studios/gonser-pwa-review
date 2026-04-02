import type { Product } from '@plentymarkets/shop-api';

export interface EnergyLabelProps {
  /**
   * Das Produkt-Objekt
   */
  product: Product;

  /**
   * Position des Labels
   * @default 'top-left'
   */
  position?: 'top-left' | 'inline';

  /**
   * Größe des Labels in px
   * @default 52
   */
  size?: number;

  /**
   * Optionale CSS-Klassen
   */
  customClass?: string;

  /**
   * Ob das Label klickbar sein soll (öffnet Lightbox)
   * @default true
   */
  clickable?: boolean;
}
