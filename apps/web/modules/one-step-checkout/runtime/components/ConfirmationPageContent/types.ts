import type { Order } from '@plentymarkets/shop-api';

export type ConfirmationPageContentProps = {
  order: Order;
  context?: 'checkout' | 'account'; // Optional: wird automatisch erkannt wenn nicht angegeben
};
