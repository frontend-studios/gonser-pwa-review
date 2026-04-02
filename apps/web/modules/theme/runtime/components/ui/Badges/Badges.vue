<template>
  <div v-if="haveBadges" data-testid="badges" class="z-[2]">
    <ul>
      <template v-if="useTags && productTags.length > 0">
        <SfListItem
          v-for="(tag, index) in productTags"
          :key="index"
          size="sm"
          class="text-xs font-medium select-none rounded-md !w-fit !px-2 opacity-75 mr-2 mb-2 cursor-pointer"
          :class="[
            tagGetters.getAgenciesTagCLass(tag),
            tagGetters.getTagTextColorIsDark(tag) ? 'text-dark' : 'text-white',
          ]"
          :style="{ backgroundColor: tagGetters.getTagBackgroundColor(tag) }"
          @click="onTagClick(tag)"
        >
          {{ tagGetters.getTagName(tag) }}
        </SfListItem>
      </template>

      <!-- Availability Icon mit Tooltip -->
      <li
        v-if="useAvailability && productGetters.getAvailabilityName(product)"
        class="relative inline-block cursor-pointer"
        @mouseenter="showTooltip = true"
        @mouseleave="showTooltip = false"
      >
        <img :src="availabilityIcon" :alt="availabilityName" class="w-[18px] h-[18px]" />
        <div
          v-if="showTooltip"
          class="absolute left-0 top-full mt-1 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg whitespace-nowrap z-20"
        >
          {{ availabilityName }}
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { SfListItem } from '@storefront-ui/vue';
import { type ProductTag, productGetters, tagGetters } from '@plentymarkets/shop-api';
import type { BadgesProps } from '~/components/ui/Badges/types';

const { t } = useI18n();
const localePath = useLocalePath();

const { product, useTags = true, useAvailability = false } = defineProps<BadgesProps>();

const showTooltip = ref(false);

const productTags = computed(() => {
  if (!useTags) return [];
  return tagGetters.getTags(product);
});

const availabilityId = computed(() => product.variation.availability.id);
const availabilityName = computed(() => productGetters.getAvailabilityName(product));

// Icon aus i18n basierend auf Availability ID
const availabilityIcon = computed(() => {
  const id = availabilityId.value;
  // Grün: IDs 1-3 (verfügbar)
  if (id >= 1 && id <= 3) return t('theme.availability.iconGreen');
  // Orange: IDs 4-7 (begrenzt verfügbar)
  if (id >= 4 && id <= 7) return t('theme.availability.iconOrange');
  // Rot: IDs 8-10 (nicht verfügbar)
  if (id >= 8 && id <= 10) return t('theme.availability.iconRed');
  // Fallback auf grün
  return t('theme.availability.iconGreen');
});

const haveBadges = computed(
  () => (useTags && productTags.value.length > 0) || (useAvailability && productGetters.getAvailabilityName(product)),
);

const onTagClick = (tag: ProductTag) => {
  navigateTo(localePath(`/tag/${tagGetters.getTagName(tag)}_${tagGetters.getTagId(tag)}`));
};
</script>
