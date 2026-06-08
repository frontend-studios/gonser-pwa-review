<template>
  <main data-testid="checkout-layout">
    <NuxtLazyHydrate when-visible>
      <NarrowContainer v-if="breadcrumbs?.length" class="p-4">
        <LazyUiBreadcrumbs :breadcrumbs="breadcrumbs" />
      </NarrowContainer>
      <NarrowContainer class="px-4 @md:px-0 mb-20">
        <div class="flex items-center justify-between my-0 @md:mt-8 @mb-10 @md:px-0">
          <h1 v-if="route.path.includes('/checkout')" class="pl-0">{{ t('checkout.checkoutHeadline') }}</h1>
          <h1 v-else class="pl-0">{{ t('checkout.cartHeadline') }}</h1>
          <!-- <UiButton
            :class="[viewport.isLessThan('lg') ? 'flex lg:hidden whitespace-nowrap' : 'hidden lg:flex']"
            :size="viewport.isLessThan('md') ? 'sm' : 'base'"
            :aria-label="t('common.navigation.previousAriaLabel')"
            data-testid="checkout-back-button"
            variant="tertiary"
            @click="goToPreviousRoute()"
          >
            <template #prefix>
              <SfIconArrowBack />
            </template>
            {{ viewport.isLessThan('md') ? backLabelMobile : backLabelDesktop }}
          </UiButton> -->
        </div>
        <span v-if="isLoading && !cart" class="!flex justify-center my-40 h-24">
          <SfLoaderCircular size="2xl" />
        </span>
        <slot v-else />
      </NarrowContainer>
    </NuxtLazyHydrate>
  </main>
</template>

<script setup lang="ts">
import { SfIconArrowBack, SfLoaderCircular } from '@storefront-ui/vue';
import type { CheckoutLayoutProps } from './types';

const route = useRoute();
const { data: cart, loading: isLoading } = useCart();
const { setInitialData } = useInitialSetup();
const { goToPreviousRoute } = useBrowserNavigation();
const viewport = useViewport();
const { heading, backLabelMobile, backLabelDesktop, breadcrumbs } = defineProps<CheckoutLayoutProps>();

onNuxtReady(async () => await setInitialData());
</script>
