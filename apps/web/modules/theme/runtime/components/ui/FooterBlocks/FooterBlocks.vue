<template>
  <BlocksFooter v-if="!isBlockified" />
</template>

<script setup lang="ts">
// Statischer Theme-Footer nur auf non-blockified Pages rendern
// (Blockified Pages wie Startseite haben Footer bereits in EditableBlocks/CMS)
const route = useRoute();
const isBlockified = computed(() => route.meta?.isBlockified === true);
</script>
