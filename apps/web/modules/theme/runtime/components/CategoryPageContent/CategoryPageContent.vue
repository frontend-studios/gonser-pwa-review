<template>
  <NarrowContainer class="" data-testid="category-layout">
    <h1 class="my-10 font-bold typography-headline-3 md:typography-headline-2">{{ title }}</h1>
    <div class="md:flex gap-6" data-testid="category-page-content">
      <div class="flex-1">
        <div class="flex justify-between items-center mb-6">
          <span class="font-bold md:text-lg">
            {{
              t('search.numberOfProducts', {
                count: products?.length ?? 0,
                total: totalProducts,
              })
            }}
          </span>
          <UiButton variant="tertiary" class="md:hidden whitespace-nowrap" @click="open">
            <template #prefix>
              <SfIconTune />
            </template>
            {{ t('common.labels.listSettings') }}
          </UiButton>
        </div>
        <section
          v-if="products?.length"
          class="grid grid-cols-1 2xs:grid-cols-2 gap-4 md:gap-6 md:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-5 mb-10 md:mb-5"
          data-testid="category-grid"
        >
          <NuxtLazyHydrate
            v-for="(product, index) in products"
            :key="productGetters.getVariationId(product)"
            when-visible
          >
            <UiProductCard
              :product="product"
              :name="productGetters.getName(product) ?? ''"
              :rating-count="productGetters.getTotalReviews(product)"
              :rating="productGetters.getAverageRating(product, 'half')"
              :image-url="addModernImageExtension(productGetters.getCoverImage(product))"
              :image-alt="
                productImageGetters.getImageAlternate(productImageGetters.getFirstImage(product)) ||
                productGetters.getName(product) ||
                ''
              "
              :image-title="productImageGetters.getImageName(productImageGetters.getFirstImage(product)) || ''"
              :image-height="productGetters.getImageHeight(product) || 600"
              :image-width="productGetters.getImageWidth(product) || 600"
              :slug="productGetters.getSlug(product) + `-${productGetters.getId(product)}`"
              :priority="index < 5"
              :base-price="productGetters.getDefaultBasePrice(product)"
              :unit-content="productGetters.getUnitContent(product)"
              :unit-name="productGetters.getUnitName(product)"
              :show-base-price="productGetters.showPricePerUnit(product)"
            />
          </NuxtLazyHydrate>
        </section>
        <LazyCategoryEmptyState v-else />
        <div class="relative">
          <UiPagination
            v-if="totalProducts > 0"
            :key="`${totalProducts}-${itemsPerPage}`"
            :current-page="getFacetsFromURL().page ?? 1"
            :total-items="totalProducts"
            :page-size="itemsPerPage"
            :max-visible-pages="maxVisiblePages"
          />
          <CategoryItemsPerPage v-if="totalProducts > 0" class="mt-6" :total-products="totalProducts" />
        </div>

        <div
          class="usps bg-gray-light px-3 md:px-0 md:py-s mt-6 md:mt-m rounded-[20px] grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 xl:grid-cols-4"
        >
          <div
            class="usp flex flex-col items-center border-b md:border-r md:border-b-0 border-color-gray-dark p-3 md:px-s md:py-0"
          >
            <img :src="t('theme.CatView.ups1icon')" :alt="t('theme.CatView.ups1headline')" class="usp-icon w-12 h-12" />
            <p class="font-semibold py-2.5">{{ t('theme.CatView.ups1headline') }}</p>
            <p class="text-sm text-center">
              {{ t('theme.CatView.ups1text') }}
            </p>
          </div>
          <div
            class="usp flex flex-col items-center border-b md:border-b-0 xl:border-r border-color-gray-dark p-3 md:px-s md:py-0"
          >
            <img :src="t('theme.CatView.ups2icon')" :alt="t('theme.CatView.ups2headline')" class="usp-icon w-12 h-12" />
            <p class="font-semibold py-2.5">{{ t('theme.CatView.ups2headline') }}</p>
            <p class="text-sm text-center">
              {{ t('theme.CatView.ups2text') }}
            </p>
          </div>
          <div
            class="usp flex flex-col items-center border-b md:border-b-0 md:border-r border-color-gray-dark p-3 md:px-s md:py-0"
          >
            <img :src="t('theme.CatView.ups3icon')" :alt="t('theme.CatView.ups3headline')" class="usp-icon w-12 h-12" />
            <p class="font-semibold py-2.5">{{ t('theme.CatView.ups3headline') }}</p>
            <p class="text-sm text-center">
              {{ t('theme.CatView.ups3text') }}
            </p>
          </div>
          <div class="usp flex flex-col items-center border-color-gray-dark p-3 md:px-s md:py-0">
            <img :src="t('theme.CatView.ups4icon')" :alt="t('theme.CatView.ups4headline')" class="usp-icon w-12 h-12" />
            <p class="font-semibold py-2.5">{{ t('theme.CatView.ups4headline') }}</p>
            <p class="text-sm text-center">
              {{ t('theme.CatView.ups4text') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </NarrowContainer>
</template>

<script setup lang="ts">
import { productGetters, productImageGetters } from '@plentymarkets/shop-api';
import { SfIconTune, useDisclosure, SfLink } from '@storefront-ui/vue';
import type { CategoryPageContentProps } from '~/components/CategoryPageContent/types';
import { paths } from '~/utils/paths';

const { title, totalProducts, itemsPerPage = 24, products = [] } = defineProps<CategoryPageContentProps>();

const localePath = useLocalePath();
const { getFacetsFromURL } = useCategoryFilter();
const { addModernImageExtension } = useModernImage();

const { showNetPrices } = useCart();

const { isOpen, open, close } = useDisclosure();
const viewport = useViewport();

const maxVisiblePages = computed(() => (viewport.isGreaterOrEquals('lg') ? 5 : 2));

if (viewport.isLessThan('md')) close();
</script>
