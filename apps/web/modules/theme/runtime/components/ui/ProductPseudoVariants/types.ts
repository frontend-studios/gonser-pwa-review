import type { Product } from '@plentymarkets/shop-api';

/**
 * Props for the ProductPseudoVariants component.
 */
export interface ProductPseudoVariantsProps {
  /**
   * Current PDP product used to derive color and size pseudo-variants.
   */
  product?: Product | null;
}