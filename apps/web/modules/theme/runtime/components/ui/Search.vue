<template>
  <form ref="referenceRef" role="search" class="relative w-full" @submit.prevent="handleSubmit">
    <SfInput
      id="search-bar"
      ref="inputReference"
      v-model="inputModel"
      wrapper-class="w-full"
      class="w-full"
      data-testid="search-bar-input"
      :aria-label="t('common.actions.search')"
      :placeholder="t('common.actions.search')"
      @focus="open"
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
            <SfLoaderCircular v-if="loading" />
            <img v-else src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/Header/Search.svg" alt=""/>
          </button>
        </div>
      </template>
    </SfInput>
  </form>
</template>

<script setup lang="ts">
import { SfIconCancel, SfInput, useDisclosure, SfLoaderCircular } from '@storefront-ui/vue';
import { unrefElement } from '@vueuse/core';

const props = defineProps<{
  close?: () => boolean;
}>();

const localePath = useLocalePath();
const router = useRouter();
const { open } = useDisclosure();
const { updateSearchTerm } = useCategoryFilter();
const { loading } = useSearch();
const { emit } = usePlentyEvent();

const inputModel = ref('');
const inputReference = ref<HTMLSpanElement>();
const handleInputFocus = () => {
  const inputElement = unrefElement(inputReference)?.querySelector('input');
  inputElement?.focus();
};
const handleReset = () => {
  inputModel.value = '';
  handleInputFocus();
};
const handleSubmit = () => {
  props.close?.();
  updateSearchTerm(inputModel.value);
  emit('frontend:searchProduct', inputModel.value);
  router.push({ path: localePath(paths.search), query: { term: inputModel.value } });
  handleReset();
};

watch(inputModel, () => {
  if (inputModel.value === '') {
    handleReset();
  }
});
</script>

<style scoped>
:deep([data-testid='search-bar-input']::placeholder) {
  color: var(--black);
}

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