<template>
  <div v-if="shouldDisplay && content" class="w-full bg-primary-500 py-3">
    <div class="max-w-screen-2xl mx-auto px-4 text-white text-center" v-html="content" />
  </div>
</template>

<script setup lang="ts">
import type { InfoBarProps } from './types';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const props = withDefaults(defineProps<InfoBarProps>(), {
  variant: 'global',
});

const route = useRoute();
const { t } = useI18n();

// Bestimme die aktive Variante basierend auf der Route
const activeVariant = computed(() => {
  // Global überschreibt alles
  const globalContent = t('theme.infoBar.global');
  if (globalContent && globalContent.trim() !== '' && globalContent !== 'theme.infoBar.global') {
    return 'global';
  }

  // Wenn eine spezifische Variante als Prop übergeben wurde, verwende diese
  if (props.variant && props.variant !== 'global') {
    return props.variant;
  }

  // Automatische Erkennung basierend auf der Route
  const path = route.path;
  const routeName = route.name?.toString() || '';

  // Startseite - exakte Übereinstimmung oder index route
  if (path === '/' || routeName === 'index' || routeName.includes('index___')) {
    return 'home';
  }

  // Checkout
  if (path.includes('/checkout') || routeName.includes('checkout')) {
    return 'checkout';
  }

  // Produktseite - prüfe Route-Name oder Pfad
  if (routeName.startsWith('product') || path.startsWith('/product/') || path.includes('/product/')) {
    return 'product';
  }

  // Kategorie-Seite - verwendet [...slug].vue, Route-Name enthält "slug"
  if (routeName.includes('slug') && !routeName.includes('product')) {
    return 'category';
  }

  return null;
});

// Hole den Content für die aktive Variante
const content = computed(() => {
  if (!activeVariant.value) return null;
  const contentText = t(`theme.infoBar.${activeVariant.value}`);
  // Prüfe ob der Key übersetzt wurde oder der Key selbst zurückgegeben wurde
  if (!contentText || contentText.trim() === '' || contentText === `theme.infoBar.${activeVariant.value}`) {
    return null;
  }
  return contentText;
});

// Zeige die Bar nur an, wenn Content vorhanden ist
const shouldDisplay = computed(() => {
  return !!content.value;
});
</script>

<style scoped></style>
