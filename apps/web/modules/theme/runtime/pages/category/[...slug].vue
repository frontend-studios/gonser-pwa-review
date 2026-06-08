<template>
  <NuxtLayout
    name="default"
    :breadcrumbs="breadcrumbs"
    class="relative"
    :class="{ 'pointer-events-none opacity-50': loading }"
  >
    <SfLoaderCircular v-if="loading" class="fixed top-[50%] right-0 left-0 m-auto z-[99999]" size="2xl" />

    <!-- Content-Seite (falls keine Produktkategorie) -->
    <div v-if="isContentPage" class="content-area max-w-screen-2xl mx-auto p-8">
      <h1 class="text-4xl font-bold mb-4">{{ categoryName }}</h1>
      <div v-if="categoryDescription" class="mt-4" v-html="categoryDescription"></div>
      <p class="text-gray-500 mt-8">Custom Content-Seite - Hier kannst du deinen eigenen Content einfügen</p>
    </div>

    <!-- Short Description -->
    <h1
      v-if="categoryShortDescription && !isContentPage"
      class="max-w-screen-2xl mx-auto px-4 lg:px-0 mb-4 font-semibold"
      v-html="categoryShortDescription"
    ></h1>

    <!-- Unterkategorien-Grid (nur für Hauptkategorien / Level 1) -->
    <div v-if="shouldShowSubcategories" class="mt-8 max-w-screen-2xl mx-auto px-4 md:px-0 mb-3 md:mb-12">
      <div
        class="flex overflow-x-scroll xl:grid xl:overflow-visible xl:grid-cols-8 gap-2 md:gap-4 mb-6 md:pb-4 md:mb-0 -mx-4 px-4 md:mx-0 md:px-0 [scrollbar-width:thin] [scrollbar-color:#e8e5eb_transparent]"
      >
        <NuxtLink
          v-for="subcategory in subcategories"
          :key="subcategory.id"
          :to="localePath(buildCategoryMenuLink(subcategory, categoryTree))"
          class="flex flex-col gap-2 no-underline text-black hover:text-black transition-transform duration-200 ease-out hover:-translate-y-1 group mb-4 flex-shrink-0 w-auto"
        >
          <div
            class="aspect-square overflow-hidden rounded-full bg-gray-light flex items-center justify-center w-[100px] h-[100px] md:w-[156px] md:h-[156px] mx-auto"
          >
            <img
              v-if="subcategoryImage(subcategory)"
              :src="subcategoryImage(subcategory)"
              :alt="categoryTreeGetters.getName(subcategory)"
              class="object-contain transition-transform duration-300 ease-out group-hover:scale-105 max-w-[70px] max-h-[70px] md:max-w-[96px] md:max-h-[96px] mix-blend-multiply"
              loading="lazy"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-gray-100">
              <span class="text-4xl text-gray-300"></span>
            </div>
          </div>
          <p
            class="font-semibold text-center flex items-center justify-center text-xs sm:text-sm md:text-base min-h-[40px] md:min-h-[48px] max-w-[100px] md:max-w-none"
          >
            {{ categoryTreeGetters.getName(subcategory) }}
          </p>
        </NuxtLink>
      </div>
    </div>

    <!-- Filter vollflächig oberhalb der Artikelliste -->
    <div v-if="!isContentPage && productsCatalog.facets?.length" class="max-w-screen-2xl mx-auto px-4 md:px-0 mb-6">
      <CategoryFilters
        :facets="productsCatalog.facets"
        :current-count="productsCatalog?.products?.length || 0"
        :total-products="productsCatalog?.pagination?.totals || 0"
      />
    </div>

    <!-- Kategorie mit Produkt-Grid -->
    <CategoryPageContent
      v-if="!isContentPage"
      :title="categoryName"
      :products="productsCatalog?.products || []"
      :total-products="productsCatalog?.pagination?.totals || 0"
      :items-per-page="productsPerPage"
      class="px-4 lg:px-0"
    />

    <!-- Kategorie-Beschreibung 1 -->
    <div
      v-if="categoryDescription && !isContentPage"
      class="max-w-screen-2xl mx-auto px-5 xl:px-0 pt-12 xl:pt-24 category-description"
      v-html="categoryDescription"
    ></div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { categoryGetters, categoryTreeGetters } from '@plentymarkets/shop-api';
import { SfLoaderCircular } from '@storefront-ui/vue';
import type { Locale } from '#i18n';
import type { CategoryTreeItem } from '@plentymarkets/shop-api';

definePageMeta({
  layout: false,
  middleware: ['category-guard'],
  type: 'category',
  isBlockified: false,
  identifier: 0,
});

defineI18nRoute({
  locales: process.env.LANGUAGELIST?.split(',') as Locale[],
});

const { locale } = useI18n();
const route = useRoute();
const router = useRouter();
const { setCategoriesPageMeta } = useUrlPageMeta();
const { setBlocksListContext } = useBlocksList();
const { getFacetsFromURL, checkFiltersInURL } = useCategoryFilter();
const { fetchProducts, data: productsCatalog, loading, productsPerPage } = useProducts();
const { data: categoryTree } = useCategoryTree();
const { buildCategoryLanguagePath } = useLocalization();
const { setPageMeta } = usePageMeta();

const identifier = computed(() =>
  productsCatalog.value.category?.type === 'content' ? productsCatalog.value.category?.id : 0,
);

const categoryName = computed(() => categoryGetters.getCategoryName(productsCatalog.value.category) || '');
const categoryDescription = computed(() => categoryGetters.getCategoryDescription1(productsCatalog.value.category));
const categoryShortDescription = computed(() =>
  categoryGetters.getCategoryShortDescription(productsCatalog.value.category),
);
const isContentPage = computed(() => productsCatalog.value.category?.type === 'content');

// Unterkategorien-Logic
const localePath = useLocalePath();
const { buildCategoryMenuLink } = useLocalization();

const currentCategoryTreeItem = computed(() => {
  if (!productsCatalog.value.category) return null;
  const categoryId = categoryGetters.getId(productsCatalog.value.category);
  return categoryTreeGetters.findCategoryById(categoryTree.value, categoryId);
});

const isMainCategory = computed(() => {
  if (!currentCategoryTreeItem.value) return false;

  // Prüfen ob es eine Hauptkategorie ist (Level 1)
  // Level 1 = direkt unter Root, also keine Parent-Kategorie oder Parent ist Root
  const findParentLevel = (item: CategoryTreeItem, tree: CategoryTreeItem[], currentLevel: number = 0): number => {
    for (const node of tree) {
      if (node.id === item.id) {
        return currentLevel;
      }
      if (node.children) {
        const level = findParentLevel(item, node.children, currentLevel + 1);
        if (level >= 0) return level;
      }
    }
    return -1;
  };

  const level = findParentLevel(currentCategoryTreeItem.value, categoryTree.value, 1);
  return level === 1;
});

const subcategories = computed(() => {
  if (!currentCategoryTreeItem.value || !currentCategoryTreeItem.value.children) return [];
  return currentCategoryTreeItem.value.children;
});

const shouldShowSubcategories = computed(() => {
  return isMainCategory.value && subcategories.value.length > 0 && !isContentPage.value;
});

const subcategoryImage = (subcategory: CategoryTreeItem) => {
  const details = subcategory.details?.[0];
  const imagePath = details?.image2Path || details?.imagePath;
  if (!imagePath) return undefined;

  // Stelle sicher, dass der Pfad mit /documents beginnt
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // TODO: WICHTIG - Bei Go-Live "https://www.gonser.ch" entfernen!
  // Lokale Entwicklung: Absolute URL zur Produktiv-Site
  if (imagePath.startsWith('/documents')) {
    return `https://www.gonser.ch${imagePath}`;
  }

  // Füge /documents hinzu, wenn es fehlt
  return `https://www.gonser.ch/documents/${imagePath}`;
};

const breadcrumbs = computed(() => {
  if (productsCatalog.value.category) {
    const breadcrumb = categoryTreeGetters.generateBreadcrumbFromCategory(
      categoryTree.value,
      categoryGetters.getId(productsCatalog.value.category),
    );
    breadcrumb.unshift({ name: t('common.labels.home'), link: '/' });

    return breadcrumb;
  }

  return [];
});

const canonicalDb = productsCatalog.value.category?.details?.[0]?.canonicalLink;

const handleQueryUpdate = async () => {
  await fetchProducts(getFacetsFromURL()).then(() => checkFiltersInURL());

  if (!productsCatalog.value.category) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page not found',
    });
  }
};

await handleQueryUpdate().then(() => {
  setCategoriesPageMeta(productsCatalog.value, getFacetsFromURL(), canonicalDb);
  setBlocksListContext(productsCatalog.value.category.type === 'item' ? 'productCategory' : 'content');
});

const icon = 'sell';
setPageMeta(categoryName.value, icon);

watch(
  () => locale.value,
  (changedLocale: string) => {
    router.push({
      path: buildCategoryLanguagePath(`${productsCatalog.value.languageUrls[changedLocale]}`),
      query: route.query,
    });
  },
);

const headTitle = computed(() =>
  productsCatalog.value?.category
    ? ((categoryGetters.getMetaTitle(productsCatalog.value.category) || process.env.METATITLE) ?? '')
    : (process.env.METATITLE ?? ''),
);

const descriptionContent = computed(() =>
  productsCatalog.value?.category
    ? ((categoryGetters.getMetaDescription(productsCatalog.value.category) || process.env.METADESC) ?? '')
    : (process.env.METADESC ?? ''),
);

const keywordsContent = computed((): string =>
  productsCatalog.value?.category
    ? ((categoryGetters.getMetaKeywords(productsCatalog.value.category) || process.env.METAKEYWORDS) ?? '')
    : (process.env.METAKEYWORDS ?? ''),
);

const robotsContent = computed((): string =>
  productsCatalog.value?.category ? categoryGetters.getCategoryRobots(productsCatalog.value.category) : '',
);

// Watch für Route-Änderungen (Kategorie-Wechsel und Filter)
watch(
  () => [route.path, route.query] as const,
  async () => {
    await handleQueryUpdate().then(() => setCategoriesPageMeta(productsCatalog.value, getFacetsFromURL()));
  },
);

watchEffect(() => {
  route.meta.identifier = productsCatalog.value.category?.type === 'content' ? productsCatalog.value.category?.id : 0;
});

useHead({
  title: headTitle,
  meta: [
    { name: 'description', content: descriptionContent },
    { name: 'keywords', content: keywordsContent },
    { name: 'robots', content: robotsContent },
  ],
});
</script>

<style>
.category-description p {
  margin: 30px 0;
}
</style>
