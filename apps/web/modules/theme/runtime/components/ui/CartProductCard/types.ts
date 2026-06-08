import type { CartItem } from '@plentymarkets/shop-api';

export interface Attribute {
  label: string;
  name: string;
  value: string;
}
// generisches Context-System für die unterschiedlichen Anwendungsfälle der CartProductCard (Cart, Drawer, Checkout, Readonly-Checkout)
export type CartProductCardContext = 'drawer' | 'cart' | 'checkout' | 'readonly-checkout';

export type CartProductCardProps = {
  cartItem: CartItem;
  disabled?: boolean;
  context?: CartProductCardContext;
};
