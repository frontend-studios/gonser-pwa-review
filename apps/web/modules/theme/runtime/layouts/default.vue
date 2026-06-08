<template>
  <div>
    <UiHeaderBlocks v-if="shouldRenderBlockifiedHeader" />
    <UiHeader v-else />

    <NarrowContainer v-if="breadcrumbs?.length" class="!pt-4 !pb-0 @md:!py-4 @md:px-0">
      <LazyUiBreadcrumbs :breadcrumbs="breadcrumbs" />
    </NarrowContainer>
    <main>
      <slot />
    </main>
    <Cookiebar />
    <PreviewMode />
    <UiFooterBlocks />
    <QuickCheckout v-if="isOpen" :product="product" />
  </div>
</template>

<script setup lang="ts">
import type { DefaultLayoutProps } from '~/layouts/types';

defineProps<DefaultLayoutProps>();

const route = useRoute();
const { headerContainer } = useBlocks();
const { isEditingEnabled } = useEditor();
const { isInEditor } = useEditorState();

const hasHeaderContainerContent = computed(() => {
  const content = (headerContainer.value as { content?: unknown } | undefined)?.content;

  if (Array.isArray(content)) return content.length > 0;

  return !!content;
});

const shouldRenderBlockifiedHeader = computed(() => {
  if (!isInEditor.value) return false;

  if (!isEditingEnabled.value) return false;

  if (!route.meta.isBlockified) return false;

  return hasHeaderContainerContent.value;
});

const { setLogoMeta } = useStructuredData();
const { isOpen, product } = useQuickCheckout();
setLogoMeta();
</script>
