import type { Product } from '@plentymarkets/shop-api';
import type { ItemGridContent } from '~/components/blocks/ItemGrid/types';

export type ProductCardProps = {
  product: Product;
  configuration?: ItemGridContent;
  index?: number;
  isFromWishlist?: boolean;
  isFromSlider?: boolean;
  lazy?: boolean;
  shouldLoadImage?: boolean;
  /**
   * Hide the recommended retail price (UVP / crossedPrice) display
   * @default false
   */
  hideRecommendedRetailPrice?: boolean;
  /**
   * Hide pseudo variants (color and size variants)
   * @default false
   */
  hidePseudoVariants?: boolean;
  /**
   * Show Add-To-Cart button only for GonserBox articles
   * @default false
   */
  showAddToCart?: boolean;
  /**
   * Constrain and left-align the Add-To-Cart button layout inside the card
   * @default false
   */
  addToCartCompact?: boolean;
};
