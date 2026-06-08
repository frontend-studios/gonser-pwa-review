import type { Breadcrumb } from '~/components/ui/Breadcrumbs/types';

export type CheckoutLayoutProps = {
  heading: string;
  backLabelMobile: string;
  backLabelDesktop: string;
  breadcrumbs?: Breadcrumb[];
};
