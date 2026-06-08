export type CouponContext = 'cart' | 'checkout';

export interface CouponProps {
  context?: CouponContext;
}
