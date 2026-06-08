<template>
  <div v-if="product" class="product-pseudo-variants">
    <div v-if="shouldShowColorSelector" class="fs-pseudovariants-color mb-4">
      <div class="mb-2">
        <span class="font-semibold">{{ t('theme.ProductPage.color') }}&nbsp;</span>
        <span v-if="displayedColorName"> {{ displayedColorName }}</span>
      </div>
      <div
        class="flex flex-nowrap lg:flex-wrap gap-2 items-center overflow-x-auto overflow-y-visible lg:overflow-visible pt-1 pr-1 pb-1"
        @mouseleave="hoveredColorItemId = null"
      >
        <button
          v-for="opt in colorOptions"
          :key="opt.itemId"
          type="button"
          class="relative shrink-0 border bg-white p-1 overflow-visible transition-colors w-[72px] h-[72px] rounded-[5px]"
          :class="[opt.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer']"
          :style="{
            borderColor:
              opt.itemId === currentItemId || hoveredColorItemId === opt.itemId ? '#151515' : '#E8E5EB',
          }"
          :disabled="opt.disabled || opt.itemId === currentItemId"
          @mouseenter="hoveredColorItemId = opt.itemId"
          @click="onColorClick(opt.itemId)"
        >
          <span
            v-if="hasProperty39(opt.product)"
            class="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-white font-semibold z-2 bg-red w-6 h-6"
          >
            %
          </span>

          <div
            v-if="hasNoStock(opt.product)"
            class="absolute inset-0 bg-white/70 rounded-[5px] z-10 flex items-center justify-center"
          >
            <img
              src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/PDP/Mail.svg"
              :alt="t('theme.ProductPage.outOfStock')"
              class="w-[18px] h-[14px]"
            />
          </div>

          <NuxtImg
            :src="opt.thumbUrl"
            :alt="opt.label"
            class="w-full h-full object-cover rounded-[5px]"
            :class="{ grayscale: opt.disabled }"
          />
        </button>
      </div>
    </div>

    <div v-if="shouldShowSizeSelector" class="fs-pseudovariants-size w-full mb-6">
      <div ref="dropdownRef" class="relative w-full">
        <button
          type="button"
          class="btn btn-secondary w-full flex justify-between items-center py-2 px-3.5 border border-gray bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-[5px]"
          :disabled="isSizeSelectDisabled"
          @click.stop="toggleDropdown"
        >
          <div>
            <span>{{ t('theme.ProductPage.variant') }}&nbsp;</span>
            <span><strong>{{ currentSizeLabel }}</strong></span>
          </div>
          <div class="flex gap-1">
            <svg v-if="!isDropdownOpen" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </div>
        </button>

        <div
          v-if="isDropdownOpen && !isSizeSelectDisabled"
          class="absolute z-[101] w-full mt-1 bg-white border border-gray shadow-lg max-h-64 overflow-y-auto rounded-[5px]"
        >
          <div v-for="(opt, index) in sizeOptions" :key="opt.itemId">
            <div
              v-if="opt.itemId === currentItemId"
              class="flex justify-between items-center px-3.5 py-2 bg-gray-light cursor-default"
              :class="{ 'border-t border-neutral-200': index > 0 }"
            >
              <span><span class="font-semibold">{{ opt.label }}</span></span>
              <div class="flex items-center gap-2">
                <span
                  v-if="hasProperty39(opt.product)"
                  class="flex items-center justify-center rounded-full text-white font-semibold bg-red w-5 h-5 text-xs"
                >
                  %
                </span>
                <span><span class="font-semibold">{{ opt.price }}</span></span>
              </div>
            </div>

            <a
              v-else
              :href="buildProductPath(opt.product)"
              class="flex justify-between items-center px-3.5 py-2 hover:bg-gray-light transition-colors"
              :class="[
                { 'border-t border-neutral-200': index > 0 },
                { 'opacity-50 cursor-not-allowed pointer-events-none': opt.disabled },
              ]"
              @click.prevent="onSizeOptionClick(opt)"
            >
              <span><span class="font-semibold">{{ opt.label }}</span></span>
              <div class="flex items-center gap-2">
                <span
                  v-if="hasProperty39(opt.product)"
                  class="flex items-center justify-center rounded-full text-white font-semibold bg-red w-5 h-5 text-xs"
                >
                  %
                </span>
                <span><span class="font-semibold">{{ opt.price }}</span></span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '@plentymarkets/shop-api';
import type { ProductPseudoVariantsProps } from './types';
import { productGetters, productImageGetters } from '@plentymarkets/shop-api';

type VariationPropertyValue = {
  value?: string | null;
};

type VariationProperty = {
  id?: number | string;
  values?: VariationPropertyValue;
};

type VariationPropertyGroup = {
  properties?: VariationProperty[];
};

type ProductWithVariationProperties = Product & {
  variationProperties?: VariationPropertyGroup[];
};

type SizeOption = {
  itemId: string;
  label: string;
  disabled: boolean;
  product: Product;
  price: string;
};

type ColorOption = {
  itemId: string;
  label: string;
  disabled: boolean;
  thumbUrl: string;
  product: Product;
};

const props = defineProps<ProductPseudoVariantsProps>();

const route = useRoute();
const { t } = useI18n();
const { format } = usePriceFormatter();
const { buildProductLanguagePath } = useLocalization();

const CURRENCY_CODE_SUFFIX_PATTERN = /^(.+?)\s([A-Z]{3})$/;

const formatSizePrice = (priceValue: number) => {
  const formattedPrice = format(priceValue)?.trim() || '';
  if (!formattedPrice) return '';

  const normalizedPrice = formattedPrice.replace(/\s+/g, ' ');
  if (/^[A-Z]{3}\s/.test(normalizedPrice)) return normalizedPrice;

  const suffixMatch = normalizedPrice.match(CURRENCY_CODE_SUFFIX_PATTERN);
  if (!suffixMatch) return normalizedPrice;

  const [, amount, currencyCode] = suffixMatch;
  return `${currencyCode} ${amount}`;
};

const product = computed(() => props.product ?? null);

const colorIds = computed(() => {
  if (!product.value) return [];
  const groups = (product.value as ProductWithVariationProperties).variationProperties;
  if (!Array.isArray(groups)) return [];

  for (const group of groups) {
    const properties = group?.properties;
    if (!Array.isArray(properties)) continue;
    for (const property of properties) {
      if (Number(property?.id ?? 0) !== 61) continue;
      const value = property?.values?.value;
      if (typeof value !== 'string') return [];
      return value
        .split(',')
        .map((entry: string) => entry.trim())
        .filter(Boolean);
    }
  }
  return [];
});

const sizeIds = computed(() => {
  if (!product.value) return [];
  const groups = (product.value as ProductWithVariationProperties).variationProperties;
  if (!Array.isArray(groups)) return [];

  for (const group of groups) {
    const properties = group?.properties;
    if (!Array.isArray(properties)) continue;
    for (const property of properties) {
      if (Number(property?.id ?? 0) !== 62) continue;
      const value = property?.values?.value;
      if (typeof value !== 'string') return [];
      return value
        .split(',')
        .map((entry: string) => entry.trim())
        .filter(Boolean);
    }
  }
  return [];
});

const extractProperty44Value = (productValue: Product): string => {
  const groups = (productValue as ProductWithVariationProperties).variationProperties;
  if (!Array.isArray(groups)) return '';

  for (const group of groups) {
    const properties = group?.properties;
    if (!Array.isArray(properties)) continue;
    for (const property of properties) {
      if (Number(property?.id ?? 0) !== 44) continue;
      const value = property?.values?.value;
      if (typeof value === 'string') return value.trim();
    }
  }
  return '';
};

const currentItemId = computed(() => {
  if (!product.value) return '';
  const id = productGetters.getItemId(product.value);
  return id ? String(id) : '';
});

const { data: fetchedSizeProducts } = useAsyncData<Product[]>(
  `fs-pseudovariants-size-${currentItemId.value}-${sizeIds.value.join(',')}`,
  async () => {
    if (!sizeIds.value?.length || !currentItemId.value) return [];
    try {
      const validIds = sizeIds.value.filter((id) => id && String(id).trim());
      if (!validIds.length) return [];

      const results = await Promise.all(
        validIds.map((id) =>
          useSdk()
            .plentysystems.getProduct({ id })
            .then((res: { data: Product }) => res.data)
            .catch(() => null),
        ),
      );
      return results.filter((entry): entry is Product => Boolean(entry));
    } catch {
      return [];
    }
  },
  {
    watch: [sizeIds, currentItemId],
    default: () => [],
  },
);

const { data: fetchedColorProducts } = useAsyncData<Product[]>(
  `fs-pseudovariants-color-${currentItemId.value}-${colorIds.value.join(',')}`,
  async () => {
    if (!colorIds.value?.length || !currentItemId.value) return [];
    try {
      const validIds = colorIds.value.filter((id) => id && String(id).trim());
      if (!validIds.length) return [];

      const results = await Promise.all(
        validIds.map((id) =>
          useSdk()
            .plentysystems.getProduct({ id })
            .then((res: { data: Product }) => res.data)
            .catch(() => null),
        ),
      );
      return results.filter((entry): entry is Product => Boolean(entry));
    } catch {
      return [];
    }
  },
  {
    watch: [colorIds, currentItemId],
    default: () => [],
  },
);

const sizeOptions = computed<SizeOption[]>(() => {
  if (!product.value) return [];
  try {
    const fetchedSize = fetchedSizeProducts.value || [];
    const others = fetchedSize.filter((entry) => String(productGetters.getItemId(entry) || '') !== currentItemId.value);
    const all = [product.value, ...others];

    const seen = new Set<string>();
    const unique = all.filter((entry) => {
      if (!entry) return false;
      const id = String(productGetters.getItemId(entry) || '');
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    return unique.map((entry) => {
      const id = String(productGetters.getItemId(entry) || '');
      const label = extractProperty44Value(entry) || productGetters.getName(entry) || id;
      const priceValue = Number(productGetters.getPrice(entry)) || 0;
      const price = priceValue > 0 ? formatSizePrice(priceValue) : '';
      return {
        itemId: id,
        label,
        disabled: isNotAvailable(entry),
        product: entry,
        price: price || '',
      };
    });
  } catch {
    return [];
  }
});

const colorOptions = computed<ColorOption[]>(() => {
  if (!product.value) return [];
  try {
    const fetchedColor = fetchedColorProducts.value || [];
    const others = fetchedColor.filter((entry) => String(productGetters.getItemId(entry) || '') !== currentItemId.value);
    const all = [product.value, ...others];

    const seen = new Set<string>();
    const unique = all.filter((entry) => {
      if (!entry) return false;
      const id = String(productGetters.getItemId(entry) || '');
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    return unique.map((entry) => ({
      itemId: String(productGetters.getItemId(entry) || ''),
      label: productGetters.getName(entry) || String(productGetters.getItemId(entry) || ''),
      disabled: isNotAvailable(entry),
      thumbUrl: getThumbUrl(entry),
      product: entry,
    }));
  } catch {
    return [];
  }
});

const shouldShowColorSelector = computed(() => {
  return (colorIds.value?.length || 0) > 0 && (colorOptions.value?.length || 0) > 0;
});

const shouldShowSizeSelector = computed(() => {
  return (sizeIds.value?.length || 0) > 0 && (sizeOptions.value?.length || 0) > 0;
});

const hoveredColorItemId = ref<string | null>(null);
const hoveredColorOption = computed(() => {
  if (!hoveredColorItemId.value) return undefined;
  return colorOptions.value.find((option) => option.itemId === hoveredColorItemId.value);
});

const isDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const currentSizeLabel = computed(() => {
  const current = sizeOptions.value.find((option) => option.itemId === currentItemId.value);
  return current?.label || '';
});

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const onSizeOptionClick = (option: SizeOption) => {
  if (option.disabled || option.itemId === currentItemId.value) return;
  isDropdownOpen.value = false;
  navigateTo({ path: buildProductPath(option.product), query: route.query });
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

const isSizeSelectDisabled = computed(() => {
  if (!shouldShowSizeSelector.value) return true;
  const options = sizeOptions.value;
  if (options.length <= 1) return true;
  const hasSelectableAlternative = options.some((option) => !option.disabled && option.itemId !== currentItemId.value);
  return !hasSelectableAlternative;
});

function isNotAvailable(productValue: Product) {
  return (productValue.variation?.availabilityId ?? 0) > 7;
}

function hasProperty39(productValue: Product): boolean {
  const groups = (productValue as ProductWithVariationProperties).variationProperties;
  if (!Array.isArray(groups)) return false;

  for (const group of groups) {
    const properties = group?.properties;
    if (!Array.isArray(properties)) continue;
    for (const property of properties) {
      if (Number(property?.id ?? 0) === 39) {
        return true;
      }
    }
  }
  return false;
}

function hasNoStock(productValue: Product): boolean {
  return (productValue.variation?.availabilityId ?? 0) > 7;
}

function extractColorLabel(productValue: Product): string {
  const name = (productGetters.getName(productValue) || '').trim();
  if (!name) return '';
  const parts = name.split(/\s+/).filter(Boolean);
  const last = parts.at(-1) ?? '';
  if (!last) return '';
  return last.charAt(0).toUpperCase() + last.slice(1);
}

const activeColorName = computed(() => (product.value ? extractColorLabel(product.value) : ''));
const displayedColorName = computed(() => {
  if (hoveredColorOption.value?.product) return extractColorLabel(hoveredColorOption.value.product);
  return activeColorName.value;
});

function getThumbUrl(productValue: Product, position = 1): string {
  const allImages = (productValue.images?.all || []) as any[];
  const index = Math.max(0, Number(position) - 1);
  const selectedImage = allImages[index] ?? productImageGetters.getFirstImage(productValue);
  return productImageGetters.getImageUrl(selectedImage) || '';
}

function buildProductPath(productValue: Product): string {
  const urlPath = productGetters.getUrlPath(productValue) || '';
  const itemId = String(productGetters.getItemId(productValue) ?? '');
  const variationId = String(productGetters.getVariationId(productValue) ?? '');
  const suffix = variationId ? `${itemId}_${variationId}` : itemId;
  return buildProductLanguagePath(`/${urlPath}_${suffix}`);
}

function onColorClick(nextId: string) {
  if (!nextId) return;
  if (nextId === currentItemId.value) return;
  const next = colorOptions.value.find((option) => option.itemId === nextId);
  if (!next || next.disabled) return;
  navigateTo({ path: buildProductPath(next.product), query: route.query });
}
</script>