<template>
  <div
    ref="containerRef"
    class="fancyboxGallery w-full"
    data-testid="fancybox-gallery"
    :style="{
      '--preview-width': `${previewWidth}px`,
      '--preview-height': `${previewHeight}px`,
    }"
  >
    <div
      class="flex min-w-0 flex-col gap-4 md:grid md:items-start"
      :class="desktopGridClass"
    >
      <div
        v-if="hasMultipleImages && showThumbnails"
        class="thumbnail-list order-2 flex flex-row gap-2 max-w-[var(--preview-width)] overflow-x-auto overflow-y-hidden pb-2 [scrollbar-gutter:stable] [scrollbar-width:thin] md:order-1 md:w-[6.625rem] md:max-w-[6.625rem] md:max-h-[var(--preview-height)] md:flex-col md:overflow-x-hidden md:overflow-y-auto md:pb-0 md:pr-3 md:[scrollbar-width:none] md:[scrollbar-gutter:stable] md:hover:[scrollbar-width:thin] md:focus-within:[scrollbar-width:thin]"
      >
        <a
          v-for="(item, index) in galleryItems"
          :key="thumbnailKey(item, index)"
          :href="interactiveHref(item.src)"
          :data-fancybox="resolvedGroup"
          :data-caption="mediaCaption(item)"
          :data-type="item.type === 'image' ? undefined : item.type"
          :data-thumb="item.thumbSrc"
          class="relative flex h-16 w-16 flex-none overflow-hidden rounded-[5px] border bg-white transition-colors md:h-[95px] md:w-[95px]"
          :class="index === activeIndex ? 'border-[#151515]' : 'border-[#e8e5eb]'"
          @click.stop.prevent="setActiveIndex(index)"
          @auxclick.stop.prevent
        >
          <NuxtImg
            :src="thumbnailRenderSrc(item, index)"
            :alt="mediaAlt(item)"
            :title="mediaTitle(item)"
            class="block h-full w-full object-contain"
            :width="item.width ?? 95"
            :height="item.height ?? 95"
            :quality="80"
            loading="lazy"
            @error="onThumbnailError(item, index)"
          />

          <div
            v-if="isVideoItem(item)"
            class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10"
          >
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white">
              <svg viewBox="0 0 24 24" class="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M8 5.5v13l10-6.5-10-6.5Z" />
              </svg>
            </span>
          </div>
        </a>
      </div>

      <a
        ref="mainImageLinkRef"
        :href="interactiveHref(mainLightboxHref)"
        :data-fancybox="currentImage ? resolvedGroup : undefined"
        :data-caption="currentImage ? currentImageCaption : undefined"
        :data-type="currentImage && currentImage.type !== 'image' ? currentImage.type : undefined"
        :data-thumb="currentImage?.thumbSrc"
        class="order-1 relative block w-full min-w-0 flex-1 overflow-hidden rounded-[0.625rem] border border-[#eceaef] bg-white md:order-2"
        :aria-label="currentImageAlt || 'Gallery image preview'"
        @click.stop.prevent="openLightbox(activeIndex)"
      >
        <img
          :key="mainImageRenderKey"
          :src="mainDisplaySrc"
          :alt="currentImageAlt"
          :title="currentImageTitle || undefined"
          class="block aspect-square min-h-[220px] h-auto max-h-[600px] w-full object-contain"
          :width="mainDisplayWidth"
          :height="mainDisplayHeight"
          loading="eager"
          fetchpriority="high"
          decoding="async"
          @error="onMainImageError"
        />

        <div
          v-if="currentImage && isVideoItem(currentImage)"
          class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10"
        >
          <span class="flex h-16 w-16 items-center justify-center rounded-full bg-black/70 text-white shadow-lg">
            <svg viewBox="0 0 24 24" class="ml-1 h-7 w-7 fill-current" aria-hidden="true">
              <path d="M8 5.5v13l10-6.5-10-6.5Z" />
            </svg>
          </span>
        </div>

        <button
          v-if="hasMultipleImages"
          type="button"
          class="f-button !absolute !left-3 !top-1/2 !z-10 !h-10 !w-10 !-translate-y-1/2 !opacity-100 !rounded-[40px]"
          :disabled="!canGoPrevious"
          aria-label="Previous image"
          @click.stop.prevent="showPreviousImage"
        >
          <svg viewBox="0 0 24 24" role="img" tabindex="-1" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>

        <button
          v-if="hasMultipleImages"
          type="button"
          class="f-button !absolute !right-3 !top-1/2 !z-10 !h-10 !w-10 !-translate-y-1/2 !opacity-100 !rounded-[40px]"
          :disabled="!canGoNext"
          aria-label="Next image"
          @click.stop.prevent="showNextImage"
        >
          <svg viewBox="0 0 24 24" role="img" tabindex="-1" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>

        <div class="absolute bottom-3 right-3 z-10">
          <Magic360 :item-id="props.itemId" />
        </div>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ImagesData, Product } from '@plentymarkets/shop-api';
import { productGetters, productImageGetters } from '@plentymarkets/shop-api';
import type { PropType } from 'vue';
import type {
  FancyboxDisplayImageVariant,
  FancyboxGalleryItem,
  FancyboxImageItem,
  FancyboxVideoItem,
  FancyboxVideoProvider,
} from './types';
import Magic360 from './Magic360.vue';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

type FancyboxModule = {
  Fancybox: {
    bind(container: HTMLElement, selector: string, options?: Record<string, unknown>): void;
    unbind(container: HTMLElement): void;
    close(): void;
    show(items: Array<Record<string, unknown>>, options?: Record<string, unknown>): void;
  };
};

const props = defineProps({
  images: {
    type: Array as PropType<ImagesData[]>,
    required: true,
  },
  product: {
    type: Object as PropType<Product | null>,
    default: null,
  },
  fancyboxOptions: {
    type: Object as PropType<Record<string, unknown>>,
    default: () => ({}),
  },
  group: {
    type: String,
    default: 'product-gallery',
  },
  showThumbnails: {
    type: Boolean,
    default: true,
  },
  displayImageVariant: {
    type: String as PropType<FancyboxDisplayImageVariant>,
    default: 'secondPreview',
  },
  itemId: {
    type: [Number, String] as PropType<number | string | null>,
    default: null,
  },
});

const { showThumbnails } = toRefs(props);

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

type VimeoOEmbedResponse = {
  thumbnail_url?: string;
};

const YOUTUBE_VIDEO_PROPERTY_ID = 65;
const VIMEO_VIDEO_PROPERTY_ID = 55;
const DEFAULT_VIDEO_WIDTH = 800;
const DEFAULT_VIDEO_HEIGHT = 450;

const containerRef = ref<HTMLElement | null>(null);
const mainImageLinkRef = ref<HTMLElement | null>(null);
const activeIndex = ref(0);
const previewWidth = ref(600);
const previewHeight = ref(600);
const isClientInteractive = ref(false);
const resolvedGroup = computed(() => props.group || 'product-gallery');

const buildVideoPlaceholder = (provider: FancyboxVideoProvider) => {
  const label = provider === 'youtube' ? 'YouTube' : 'Vimeo';
  const background = provider === 'youtube' ? '#d4001c' : '#1ab7ea';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" role="img" aria-label="${label} video">
      <rect width="800" height="450" fill="#111827" />
      <rect width="800" height="450" fill="url(#g)" opacity="0.4" />
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${background}" />
          <stop offset="100%" stop-color="#111827" />
        </linearGradient>
      </defs>
      <circle cx="400" cy="225" r="54" fill="rgba(255,255,255,0.16)" />
      <path d="M382 190v70l56-35-56-35Z" fill="#fff" />
      <text x="400" y="320" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#fff">${label}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const normalizeYoutubeUrl = (value: string) => {
  return /^https?:\/\//i.test(value) ? value : `https://www.youtube.com/watch?v=${value}`;
};

const buildYoutubeThumbnailUrl = (url: string) => {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/i);
  if (!match?.[1]) return buildVideoPlaceholder('youtube');
  return `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg`;
};

const buildYoutubeDisplayUrl = (url: string) => {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/i);
  if (!match?.[1]) return buildVideoPlaceholder('youtube');
  return `https://i.ytimg.com/vi/${match[1]}/sddefault.jpg`;
};

const normalizeVimeoThumbnailUrl = (url: string) => {
  if (!url) return '';
  return url.replace(/_(\d+)x(\d+)(\.[a-z]+)$/i, '_1280x720$3');
};

const getVariationPropertyValues = (sourceProduct: Product | null | undefined, propertyId: number): string[] => {
  const groups = (sourceProduct as ProductWithVariationProperties | null | undefined)?.variationProperties;
  if (!Array.isArray(groups)) return [];

  for (const group of groups) {
    const properties = group?.properties;
    if (!Array.isArray(properties)) continue;

    for (const property of properties) {
      if (Number(property?.id ?? 0) !== propertyId) continue;
      const value = property?.values?.value;
      if (typeof value !== 'string') return [];

      return value
        .split(/[\n\r,]+/)
        .map((entry) => entry.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const galleryItemId = computed(() => {
  if (props.itemId !== null && props.itemId !== undefined && String(props.itemId).trim() !== '') {
    return String(props.itemId);
  }
  if (!props.product) return '';
  const id = productGetters.getItemId(props.product);
  return id ? String(id) : '';
});

const youtubeVideoUrls = computed(() => {
  return getVariationPropertyValues(props.product, YOUTUBE_VIDEO_PROPERTY_ID)
    .map(normalizeYoutubeUrl)
    .filter(Boolean);
});

const vimeoVideoUrls = computed(() => {
  return getVariationPropertyValues(props.product, VIMEO_VIDEO_PROPERTY_ID).filter((value) => /^https?:\/\//i.test(value));
});

const { data: vimeoThumbnailMap } = await useAsyncData<Record<string, string>>(
  () => `fs-vimeo-gallery-thumbs-${galleryItemId.value}-${vimeoVideoUrls.value.join(',')}`,
  async () => {
    const urls = vimeoVideoUrls.value;
    if (!urls.length) return {};

    const thumbnails = await Promise.all(
      urls.map(async (url) => {
        try {
          const response = await $fetch<VimeoOEmbedResponse>('https://vimeo.com/api/oembed.json', {
            query: { url, width: 1280 },
          });

          return [url, normalizeVimeoThumbnailUrl(response.thumbnail_url || '')] as const;
        } catch {
          return [url, ''] as const;
        }
      }),
    );

    return Object.fromEntries(thumbnails.filter((entry) => entry[1]));
  },
  {
    default: () => ({}),
    watch: [galleryItemId, vimeoVideoUrls],
  },
);

const galleryItems = computed<FancyboxGalleryItem[]>(() => {
  const imageItems = props.images.reduce<FancyboxImageItem[]>((items, image) => {
    const secondPreview = productImageGetters.getImageUrlSecondPreview(image) || '';
    const preview = productImageGetters.getImageUrlPreview(image) || '';
    const middle = productImageGetters.getImageUrlMiddle(image) || '';
    const original = productImageGetters.getImageUrl(image) || '';

    const src = original || middle || preview || secondPreview || '';
    if (!src) return items;

    const displaySrc = secondPreview || preview || middle || src;
    const thumbSrc = preview || middle || secondPreview || src;

    items.push({
      type: 'image',
      src,
      displaySrc,
      thumbSrc,
      alt: productImageGetters.getImageAlternate(image) || productImageGetters.getCleanImageName(image) || '',
      title: productImageGetters.getImageName(image) || null,
      caption: productImageGetters.getImageName(image) || productImageGetters.getCleanImageName(image) || '',
      width: productImageGetters.getImageWidth(image) ?? null,
      height: productImageGetters.getImageHeight(image) ?? null,
    } satisfies FancyboxImageItem);

    return items;
  }, []);

  const productName = props.product ? productGetters.getName(props.product) || '' : '';

  const youtubeItems: FancyboxVideoItem[] = youtubeVideoUrls.value.map((url, index) => {
    const title = `${productName} Video ${index + 1}`.trim();
    const thumbSrc = buildYoutubeThumbnailUrl(url);
    const displaySrc = buildYoutubeDisplayUrl(url);

    return {
      type: 'youtube',
      src: url,
      displaySrc,
      thumbSrc,
      alt: `${productName} YouTube video ${index + 1}`.trim(),
      title,
      caption: title,
      width: DEFAULT_VIDEO_WIDTH,
      height: DEFAULT_VIDEO_HEIGHT,
    } satisfies FancyboxVideoItem;
  });

  const vimeoItems: FancyboxVideoItem[] = vimeoVideoUrls.value.map((url, index) => {
    const title = `${productName} Video ${youtubeItems.length + index + 1}`.trim();
    const displaySrc = vimeoThumbnailMap.value[url] || buildVideoPlaceholder('vimeo');
    const thumbSrc = displaySrc;

    return {
      type: 'vimeo',
      src: url,
      displaySrc,
      thumbSrc,
      alt: `${productName} Vimeo video ${index + 1}`.trim(),
      title,
      caption: title,
      width: DEFAULT_VIDEO_WIDTH,
      height: DEFAULT_VIDEO_HEIGHT,
    } satisfies FancyboxVideoItem;
  });

  return [...imageItems, ...youtubeItems, ...vimeoItems];
});

const hasMultipleImages = computed(() => galleryItems.value.length > 1);
const desktopGridClass = computed(() => {
  return hasMultipleImages.value && showThumbnails.value
    ? 'md:grid-cols-[6.625rem_minmax(0,1fr)]'
    : 'md:grid-cols-[minmax(0,1fr)]';
});
const canGoPrevious = computed(() => activeIndex.value > 0);
const canGoNext = computed(() => activeIndex.value < galleryItems.value.length - 1);

const currentImage = computed(() => {
  return galleryItems.value[activeIndex.value] ?? galleryItems.value[0];
});

const isVideoItem = (item: FancyboxGalleryItem): item is FancyboxVideoItem => {
  return item.type === 'youtube' || item.type === 'vimeo';
};

const mediaTitle = (item: FancyboxGalleryItem) => {
  return item.title || null;
};

const mediaAlt = (item: FancyboxGalleryItem) => {
  return item.alt || item.title || '';
};

const mediaCaption = (item: FancyboxGalleryItem) => {
  return item.caption || item.title || item.alt || '';
};

const currentImageTitle = computed(() => (currentImage.value ? mediaTitle(currentImage.value) : null));
const currentImageAlt = computed(() => (currentImage.value ? mediaAlt(currentImage.value) : ''));
const currentImageCaption = computed(() => (currentImage.value ? mediaCaption(currentImage.value) : ''));
const mainLightboxHref = computed(() => (currentImage.value ? currentImage.value.src : ''));
const fallbackMainDisplaySrc =
  'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 800 800%22%3E%3Crect width=%22800%22 height=%22800%22 fill=%22%23f3f4f6%22/%3E%3Cpath d=%22M220 520l120-140 90 100 70-90 120 130H220z%22 fill=%22%23d1d5db%22/%3E%3Ccircle cx=%22300%22 cy=%22300%22 r=%2250%22 fill=%22%23d1d5db%22/%3E%3C/svg%3E';
const mainImageSourceIndex = ref(0);
const thumbnailSourceIndexMap = ref<Record<string, number>>({});
const mainImageSources = computed(() => {
  const item = currentImage.value ?? galleryItems.value[0];
  const candidates = [item?.displaySrc, item?.src, item?.thumbSrc, fallbackMainDisplaySrc].filter(
    (source): source is string => Boolean(source),
  );

  return [...new Set(candidates)];
});
const mainDisplaySrc = computed(() => {
  return mainImageSources.value[mainImageSourceIndex.value] || fallbackMainDisplaySrc;
});
const mainDisplayWidth = computed(() => {
  const item = currentImage.value ?? galleryItems.value[0];
  return item?.width ?? 800;
});
const mainDisplayHeight = computed(() => {
  const item = currentImage.value ?? galleryItems.value[0];
  return item?.height ?? 800;
});
const mainImageRenderKey = computed(() => {
  return `${mainDisplaySrc.value}::${activeIndex.value}::${mainImageSourceIndex.value}`;
});

const onMainImageError = () => {
  if (mainImageSourceIndex.value < mainImageSources.value.length - 1) {
    mainImageSourceIndex.value += 1;
  }
};

const setActiveIndex = (index: number) => {
  activeIndex.value = index;
};

const interactiveHref = (href: string) => {
  if (!isClientInteractive.value) return '#';
  return href || '#';
};

const thumbnailKey = (item: FancyboxGalleryItem, index: number) => {
  return item.src || `thumbnail-${index}`;
};

const thumbnailCandidates = (item: FancyboxGalleryItem): string[] => {
  const candidates = [item.thumbSrc, item.displaySrc, item.src].filter((source): source is string => Boolean(source));
  return [...new Set(candidates)];
};

const thumbnailRenderSrc = (item: FancyboxGalleryItem, index: number): string => {
  const key = thumbnailKey(item, index);
  const candidateIndex = thumbnailSourceIndexMap.value[key] ?? 0;
  const candidates = thumbnailCandidates(item);

  return candidates[candidateIndex] || item.thumbSrc || item.displaySrc || item.src;
};

const onThumbnailError = (item: FancyboxGalleryItem, index: number) => {
  const key = thumbnailKey(item, index);
  const candidates = thumbnailCandidates(item);
  const current = thumbnailSourceIndexMap.value[key] ?? 0;

  if (current < candidates.length - 1) {
    thumbnailSourceIndexMap.value[key] = current + 1;
  }
};

const showPreviousImage = () => {
  if (!canGoPrevious.value) return;
  activeIndex.value -= 1;
};

const showNextImage = () => {
  if (!canGoNext.value) return;
  activeIndex.value += 1;
};

const fancyboxSlides = computed(() => {
  return galleryItems.value.map((item) => ({
    src: item.src,
    type: item.type === 'image' ? 'image' : item.type,
    caption: mediaCaption(item),
    thumb: item.thumbSrc,
    width: item.width ?? undefined,
    height: item.height ?? undefined,
  }));
});

let fancybox: FancyboxModule['Fancybox'] | null = null;
let previewResizeObserver: ResizeObserver | null = null;

const ensureFancybox = async () => {
  if (fancybox || !import.meta.client) return fancybox;
  const module = (await import('@fancyapps/ui/dist/fancybox/')) as FancyboxModule;
  fancybox = module.Fancybox;
  return fancybox;
};

const bindFancybox = async () => {
  if (!import.meta.client || !containerRef.value) return;
  const instance = await ensureFancybox();
  if (!instance) return;

  instance.unbind(containerRef.value);
  instance.bind(containerRef.value, '[data-fancybox]', {
    ...(props.fancyboxOptions || {}),
  });
};

const openLightbox = async (index: number) => {
  if (!import.meta.client) return;

  const instance = await ensureFancybox();
  if (!instance || !fancyboxSlides.value.length) return;

  instance.show(fancyboxSlides.value, {
    ...(props.fancyboxOptions || {}),
    startIndex: index,
  });
};

const unbindFancybox = async () => {
  if (!import.meta.client || !containerRef.value) return;
  const instance = await ensureFancybox();
  if (!instance) return;

  instance.unbind(containerRef.value);
  instance.close();
};

watch(
  () => galleryItems.value,
  () => {
    activeIndex.value = 0;
    mainImageSourceIndex.value = 0;
    thumbnailSourceIndexMap.value = {};

    nextTick(() => {
      void bindFancybox();
    });
  },
  { deep: true },
);

watch(
  () => activeIndex.value,
  () => {
    mainImageSourceIndex.value = 0;
  },
);

watch(
  () => props.fancyboxOptions,
  () => {
    nextTick(() => {
      void bindFancybox();
    });
  },
  { deep: true },
);

onMounted(() => {
  isClientInteractive.value = true;

  if (import.meta.client && mainImageLinkRef.value) {
    previewResizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const width = Math.floor(entry.contentRect.width);
      const height = Math.floor(entry.contentRect.height);

      if (width > 0) previewWidth.value = width;
      if (height > 0) previewHeight.value = height;
    });

    previewResizeObserver.observe(mainImageLinkRef.value);
  }

  void bindFancybox();
});

onBeforeUnmount(() => {
  if (previewResizeObserver) {
    previewResizeObserver.disconnect();
    previewResizeObserver = null;
  }

  void unbindFancybox();
});
</script>

<style scoped>
.thumbnail-list::-webkit-scrollbar {
  height: 8px;
}

.thumbnail-list::-webkit-scrollbar-thumb {
  border-radius: 9999px;
  background-color: #c5c1cb;
}

@media (min-width: 768px) {
  .thumbnail-list::-webkit-scrollbar {
    height: 0;
    width: 0;
  }

  .thumbnail-list:hover::-webkit-scrollbar,
  .thumbnail-list:focus-within::-webkit-scrollbar {
    height: 0;
    width: 8px;
  }
}
</style>
