<template>
  <div v-if="shouldDisplay && content" class=" bg-primary-500 py-2 relative">
    <div class="max-w-screen-2xl mx-auto px-4 text-white text-center">
      <a
        v-if="activeLink"
        :href="activeLink"
        class="block pr-8 cursor-pointer text-white"
        v-html="content"
      />
      <div
        v-else
        class="block pr-8 text-white"
        v-html="content"
      />
      <button
        v-if="showCloseButton"
        type="button"
        class="absolute top-0 right-0 mt-1 mr-1 px-2 text-white"
        :aria-label="closeLabel"
        @click="dismissInfoBar"
      >
        <strong>x</strong>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { InfoBarProps } from './types';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const props = withDefaults(defineProps<InfoBarProps>(), {
  variant: 'global',
});

const route = useRoute();
const { $i18n } = useNuxtApp();
const isDismissed = ref(false);

const closeButtonSetting = computed(() => getTranslationValue('theme.infoBar.closeButton'));

const showCloseButton = computed(() => {
  return !!closeButtonSetting.value && hasVisibleText(closeButtonSetting.value);
});

const closeLabel = computed(() => {
  if (closeButtonSetting.value) {
    return closeButtonSetting.value.trim();
  }

  return normalizeTranslationValue($i18n.t('close'), 'close') ?? 'Close info bar';
});

const hasVisibleText = (value: string): boolean => {
  const withoutTags = value.replace(/<[^>]*>/g, ' ');
  const withoutNbsp = withoutTags.replace(/&nbsp;|&#160;/gi, ' ');
  return withoutNbsp.trim().length > 0;
};

const normalizeTranslationValue = (value: unknown, key: string): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  if (value === key) {
    return null;
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    return null;
  }

  return value;
};

const getTranslationValue = (key: string): string | null => {
  const translatedKey = `translated.${key}`;
  if ($i18n.te(translatedKey)) {
    const translatedValue = normalizeTranslationValue($i18n.t(translatedKey), translatedKey);
    if (translatedValue) {
      return translatedValue;
    }
  }

  return normalizeTranslationValue($i18n.t(key), key);
};

const normalizeLink = (value: string | null): string | null => {
  if (!value) {
    return null;
  }

  const link = value.trim();
  if (link.length === 0) {
    return null;
  }

  // Accept absolute URLs plus typical internal/utility link schemes.
  if (/^(https?:\/\/|mailto:|tel:|\/)/i.test(link)) {
    return link;
  }

  return null;
};

// Bestimme die aktive Variante basierend auf der Route
const activeVariant = computed(() => {
  // Global überschreibt alles
  const globalContent = getTranslationValue('theme.infoBar.global');
  if (globalContent && hasVisibleText(globalContent)) {
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
  const contentText = getTranslationValue(`theme.infoBar.${activeVariant.value}`);
  if (!contentText || !hasVisibleText(contentText)) {
    return null;
  }
  return contentText;
});

// Hole den Link für die aktive Variante
const activeLink = computed(() => {
  if (!activeVariant.value) return null;
  const linkValue = getTranslationValue(`theme.infoBar.${activeVariant.value}Link`);
  return normalizeLink(linkValue);
});

const getDismissStorageKey = (): string | null => {
  if (!activeVariant.value) {
    return null;
  }

  return `theme.infoBar.dismissed.${activeVariant.value}`;
};

const updateDismissedState = (): void => {
  if (!import.meta.client) {
    isDismissed.value = false;
    return;
  }

  const storageKey = getDismissStorageKey();
  if (!storageKey) {
    isDismissed.value = false;
    return;
  }

  isDismissed.value = window.sessionStorage.getItem(storageKey) === '1';
};

const dismissInfoBar = (): void => {
  if (!import.meta.client) {
    return;
  }

  const storageKey = getDismissStorageKey();
  if (!storageKey) {
    return;
  }

  window.sessionStorage.setItem(storageKey, '1');
  isDismissed.value = true;
};

watch(activeVariant, () => {
  updateDismissedState();
}, { immediate: true });

// Zeige die Bar nur an, wenn Content vorhanden ist
const shouldDisplay = computed(() => {
  return !!content.value && !isDismissed.value;
});
</script>

<style scoped></style>
