<template>
  <UiThemeFooter v-if="shouldRenderThemeFooter" />
</template>

<script setup lang="ts">
const { footer } = useBlocks();
const route = useRoute();
const isBlockified = computed(() => route.meta?.isBlockified === true);

// Preserve existing theme behavior while migrating to the newer footer flow:
// - always render theme footer on non-blockified pages
// - on blockified pages, render it only if a footer block exists
const shouldRenderThemeFooter = computed(() => {
  if (!isBlockified.value) return true;
  return !!footer.value;
});
</script>
