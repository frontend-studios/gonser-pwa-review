<template>
  <div ref="rootRef" class="mx-2 relative w-full z-[200] @container/search">
    <form ref="referenceRef" role="search" class="relative w-full" @submit.prevent="handleSubmit">
      <SfInput
        id="search-bar"
        ref="inputReference"
        v-model="inputModel"
        wrapper-class="w-full hover:!ring-[var(--gray-dark)] focus-within:!ring-[var(--gray-dark)] active:!ring-[var(--gray-dark)] focus-within:!outline-none"
        class="w-full placeholder:text-black"
        data-testid="search-bar-input"
        :aria-label="t('common.actions.search')"
        :placeholder="t('common.actions.search')"
        @focus="handleOpen"
      >
        <template #suffix>
          <div class="flex items-center gap-2">
            <button
              v-if="inputModel"
              type="button"
              :aria-label="t('common.actions.resetSearch')"
              class="flex rounded-md text-black focus-visible:outline focus-visible:outline-offset"
              @click="handleReset"
            >
              <SfIconCancel />
            </button>
            <button
              type="submit"
              :aria-label="t('common.actions.search')"
              class="w-[30px] h-[30px] rounded-full inline-flex items-center justify-center bg-gray-light text-black [&_svg]:w-[15px] [&_svg]:h-[15px] [&_.animate-spin]:w-[15px] [&_.animate-spin]:h-[15px] hover:bg-gray-200 transition-colors"
            >
              <SfLoaderCircular v-if="loading || loadingSuggestions" />
              <img v-else src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/Header/Search.svg" alt="" />
            </button>
          </div>
        </template>
      </SfInput>
    </form>

    <section
      v-if="isDropdownVisible"
      class="w-full grid md:shadow @2xl:grid-cols-3 bg-white absolute px-4 pt-4 rounded-md border border-neutral-100 mt-[2px] gap-8 max-h-[calc(var(--viewport-height,100dvh)-120px)] overflow-y-auto"
      aria-live="polite"
      aria-relevant="all"
      :aria-label="t('searchBar.searchSuggestions')"
    >
      <div class="w-full @2xl:col-span-1">
        <div v-if="results?.suggestions?.length" class="mb-8">
          <h3 class="sr-only uppercase tracking-widest text-sm font-bold text-neutral-700">
            {{ t('searchBar.searchSuggestions') }}
          </h3>
          <ul>
            <li v-for="(item, index) in results.suggestions" :key="index">
              <UiSearchSuggestionItem :item="item" />
            </li>
          </ul>
        </div>

        <h3 class="uppercase tracking-widest text-sm font-bold text-neutral-700">
          {{ t('searchBar.matchingCategories') }}
        </h3>
        <hr class="h-px mt-2 bg-neutral-200 border-0" />
        <div class="@2xl:mb-4">
          <ul v-if="results?.categories?.length" class="mt-4 flex flex-wrap gap-1.5 @2xl:flex-col @2xl:items-start">
            <li v-for="(category, index) in results.categories" :key="index">
              <NuxtLink :to="category.url">
                <div
                  class="bg-neutral-100 hover:bg-neutral-200 transition-colors duration-200 text-neutral-800 text-sm px-3 py-1.5 rounded-md"
                >
                  {{ category.label }}
                </div>
              </NuxtLink>
            </li>
          </ul>
          <div v-else class="text-base mt-4 text-neutral-900">{{ t('searchBar.noResultsFound') }}</div>
        </div>
      </div>

      <div class="w-full @2xl:col-span-2 @container/products @2xl:mb-4 overflow-hidden">
        <div class="flex items-center justify-between gap-2">
          <h3 class="uppercase tracking-widest text-sm font-bold text-neutral-700 shrink-0">
            {{ t('searchBar.productSuggestions') }}
          </h3>
          <NuxtLink
            v-if="results?.total"
            :to="getSearchPath(searchTerm)"
            class="hidden @2xl/search:flex text-neutral-900 text-sm font-medium underline underline-offset-4 min-w-0 shrink"
          >
            <template v-for="(part, i) in searchLinkParts" :key="i">
              <span v-if="part === '{{SEARCH_TERM}}'" class="truncate">{{ searchTerm }}</span>
              <span v-else-if="part === '{{HITS_COUNT}}'" class="shrink-0">{{ results?.total }}</span>
              <span v-else class="shrink-0 whitespace-pre">{{ part }}</span>
            </template>
          </NuxtLink>
        </div>

        <hr class="h-px mt-2 bg-neutral-200 border-0" />
        <ul v-if="results?.items?.length" class="mt-4 gap-4 grid @sm/products:grid-cols-2 items-stretch">
          <li v-for="(item, index) in results.items" :key="index">
            <UiSearchSuggestionProduct :item="item" />
          </li>
        </ul>
        <div v-else class="mt-4 text-base text-neutral-900 mb-4 @2xl:mb-0">{{ t('searchBar.noResultsFound') }}</div>
      </div>

      <NuxtLink
        v-if="results?.total"
        :to="getSearchPath(searchTerm)"
        class="sticky bottom-0 @2xl:hidden px-2 py-4 bg-white text-base underline underline-offset-4 text-neutral-900 flex w-full overflow-hidden"
      >
        <template v-for="(part, i) in searchLinkParts" :key="i">
          <span v-if="part === '{{SEARCH_TERM}}'" class="truncate">{{ searchTerm }}</span>
          <span v-else-if="part === '{{HITS_COUNT}}'" class="shrink-0">{{ results?.total }}</span>
          <span v-else class="shrink-0 whitespace-pre">{{ part }}</span>
        </template>
      </NuxtLink>
    </section>
  </div>
</template>

<script setup lang="ts">
import { SfIconCancel, SfInput, SfLoaderCircular } from '@storefront-ui/vue';
import { onClickOutside, unrefElement } from '@vueuse/core';
import { debounce } from '~/utils/debounce';

const props = defineProps<{
  close?: () => boolean;
}>();

const localePath = useLocalePath();
const router = useRouter();
const route = useRoute();
const { updateSearchTerm } = useCategoryFilter();
const { loading } = useSearch();
const rootRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);

const {
  results,
  searchSuggestions,
  searchTerm,
  loading: loadingSuggestions,
  resetSuggestions,
} = useSearchSuggestions();
const { emit } = usePlentyEvent();
const { t } = useI18n();

const searchLinkParts = computed(() => {
  const translated = t('searchBar.showAllResults', {
    searchTerm: '{{SEARCH_TERM}}',
    hitsCount: '{{HITS_COUNT}}',
  });
  return translated.split(/({{SEARCH_TERM}}|{{HITS_COUNT}})/);
});

const inputModel = ref('');
const inputReference = ref<HTMLSpanElement>();

const isDropdownVisible = computed(() => {
  const value = inputModel.value.trim().slice(0, 80);
  return isOpen.value && value.length > 1 && searchTerm.value === value;
});

const handleInputFocus = () => {
  const inputElement = unrefElement(inputReference)?.querySelector('input');
  inputElement?.focus();
};

const handleReset = () => {
  inputModel.value = '';
  handleInputFocus();
};

const handleSubmit = () => {
  if (!inputModel.value.trim()) return;
  handleClose();
  props.close?.();
  emit('frontend:searchProduct', inputModel.value);
  router.push({ path: localePath(paths.search), query: { term: inputModel.value } });
  handleReset();
};

const handleSearch = () => {
  if (inputModel.value.length > 1) {
    handleOpen();
    searchSuggestions(inputModel.value);
  }
};

const debounceInput = debounce(handleSearch, 250);

const handleOpen = () => {
  isOpen.value = true;
};

const handleClose = () => {
  isOpen.value = false;
};

onClickOutside(rootRef, () => {
  handleClose();
});

watch(inputModel, () => {
  if (inputModel.value === '') {
    resetSuggestions();
    handleClose();
    return;
  }
  if (inputModel.value.length > 1) {
    debounceInput();
  }
});

watch(
  () => route.fullPath,
  () => {
    inputModel.value = '';
    resetSuggestions();
    handleClose();
  },
);

onUnmounted(() => debounceInput.cancel());
</script>

<style scoped>
/* Autofill styling */
:deep(input:-webkit-autofill),
:deep(input:-webkit-autofill:hover),
:deep(input:-webkit-autofill:focus),
:deep(input:-webkit-autofill:active) {
  -webkit-box-shadow: 0 0 0 30px white inset !important;
  -webkit-text-fill-color: var(--black) !important;
}

/* Remove blue outline on autofill */
:deep(input:-webkit-autofill) {
  -webkit-box-shadow: 0 0 0 30px white inset !important;
}
</style>