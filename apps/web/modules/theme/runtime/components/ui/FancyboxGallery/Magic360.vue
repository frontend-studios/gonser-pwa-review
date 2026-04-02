<template>
  <button
    v-if="isAvailable"
    type="button"
    class="f-button !h-10 !w-10 !opacity-100 !rounded-[40px]"
    aria-label="Open 360 view"
    @click.stop.prevent="openModal"
  >
    360°
  </button>

  <Teleport to="body">
    <template v-if="isOpen">
      <button
        type="button"
        class="fixed right-3 top-3 z-[1400] flex h-10 w-10 items-center justify-center rounded-full border border-[#e8e5eb] bg-white"
        aria-label="Close 360 view"
        @click.stop.prevent="closeModal"
        @pointerdown.stop.prevent="closeModal"
      >
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div class="fixed inset-0 z-[1300] flex flex-col bg-white">
        <div class="flex min-h-0 flex-1 items-center justify-center p-4">
          <a
            :key="spinKey"
            ref="spinAnchorRef"
            class="Magic360 block"
            :href="firstFrameUrl"
            :data-options="magic360Options"
          >
            <img
              :src="firstFrameUrl"
              alt="360 view"
              style="display:block; max-width:100%; max-height:calc(100vh - 80px); width:auto; height:auto;"
            />
          </a>
        </div>
      </div>
    </template>
  </Teleport>
</template>

<script setup lang="ts">
type Magic360Props = {
  itemId?: number | string | null;
};

type Magic360Api = {
  start?: (target?: string | Element) => void;
  refresh?: () => void;
};

const props = withDefaults(defineProps<Magic360Props>(), {
  itemId: null,
});

const isOpen = ref(false);
const isAvailable = ref(false);
const spinKey = ref(0);
const spinAnchorRef = ref<HTMLAnchorElement | null>(null);
const detectedRows = ref(1);
const detectedColumns = ref(1);
let availabilityProbeId = 0;

const BASE_360_CDN_PATH = 'https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/360';
const MAX_ROWS = 24;
const MAX_COLUMNS = 72;
const IMAGE_SUFFIX = 'webp';

const normalizedItemId = computed(() => {
  const candidate = Number(props.itemId);
  if (!Number.isFinite(candidate) || candidate <= 0) return null;
  return Math.trunc(candidate);
});

const imageBasePath = computed(() => {
  if (!normalizedItemId.value) return '';
  return `${BASE_360_CDN_PATH}/${normalizedItemId.value}/`;
});

const filePrefix = computed(() => {
  if (!normalizedItemId.value) return '';
  return String(normalizedItemId.value);
});

const frameUrl = (row: number, column: number): string => {
  if (!imageBasePath.value || !filePrefix.value) return '';
  const rowPart = String(row).padStart(2, '0');
  const columnPart = String(column).padStart(2, '0');
  return `${imageBasePath.value}${filePrefix.value}-${rowPart}-${columnPart}.${IMAGE_SUFFIX}`;
};

const firstFrameUrl = computed(() => {
  return frameUrl(1, 1);
});

const magic360Options = computed(() => {
  if (!imageBasePath.value || !filePrefix.value) return '';
  return `filename:${filePrefix.value}-{row}-{col}.${IMAGE_SUFFIX}; filepath:${imageBasePath.value}; rows:${detectedRows.value}; columns:${detectedColumns.value}; row-digits:2; column-digits:2; row-start-index:1; column-start-index:1; spin:drag; autospin:off; magnify:false; fullscreen:false;`;
});

const imageProbeCache = new Map<string, boolean>();
const pendingImageProbeCache = new Map<string, Promise<boolean>>();

const probeImageExists = (url: string): Promise<boolean> => {
  if (!import.meta.client || !url) return Promise.resolve(false);

  const cached = imageProbeCache.get(url);
  if (typeof cached === 'boolean') {
    return Promise.resolve(cached);
  }

  const pending = pendingImageProbeCache.get(url);
  if (pending) {
    return pending;
  }

  const probePromise = new Promise<boolean>((resolve) => {
    const img = new Image();
    img.onload = () => {
      imageProbeCache.set(url, true);
      pendingImageProbeCache.delete(url);
      resolve(true);
    };
    img.onerror = () => {
      imageProbeCache.set(url, false);
      pendingImageProbeCache.delete(url);
      resolve(false);
    };
    img.src = url;
  });

  pendingImageProbeCache.set(url, probePromise);
  return probePromise;
};

const detectFrameDimensions = async (): Promise<{ rows: number; columns: number } | null> => {
  if (!firstFrameUrl.value) return null;

  const hasFirstFrame = await probeImageExists(firstFrameUrl.value);
  if (!hasFirstFrame) {
    return null;
  }

  let columns = 1;
  for (let column = 2; column <= MAX_COLUMNS; column += 1) {
    const exists = await probeImageExists(frameUrl(1, column));
    if (!exists) break;
    columns = column;
  }

  let rows = 1;
  for (let row = 2; row <= MAX_ROWS; row += 1) {
    const exists = await probeImageExists(frameUrl(row, 1));
    if (!exists) break;
    rows = row;
  }

  return { rows, columns };
};

const setPageScrollLock = (locked: boolean) => {
  if (!import.meta.client) return;

  const value = locked ? 'hidden' : '';
  document.documentElement.style.overflow = value;
  document.body.style.overflow = value;
};

const openModal = () => {
  if (!isAvailable.value) {
    return;
  }

  spinKey.value += 1;
  isOpen.value = true;

  nextTick(() => {
    const api = (window as Window & { Magic360?: Magic360Api }).Magic360;
    if (!api) return;

    if (typeof api.start === 'function') {
      api.start(spinAnchorRef.value ?? undefined);
      return;
    }

    if (typeof api.refresh === 'function') {
      api.refresh();
    }
  });
};

const closeModal = () => {
  isOpen.value = false;
};

watch(
  firstFrameUrl,
  async () => {
    availabilityProbeId += 1;
    const currentProbeId = availabilityProbeId;

    if (!firstFrameUrl.value) {
      isAvailable.value = false;
      detectedRows.value = 1;
      detectedColumns.value = 1;
      return;
    }

    const dimensions = await detectFrameDimensions();
    if (currentProbeId !== availabilityProbeId) {
      return;
    }

    if (!dimensions) {
      isAvailable.value = false;
      detectedRows.value = 1;
      detectedColumns.value = 1;

      if (isOpen.value) {
        closeModal();
      }
      return;
    }

    detectedRows.value = dimensions.rows;
    detectedColumns.value = dimensions.columns;
    isAvailable.value = true;
  },
  { immediate: true },
);

watch(isOpen, (open) => {
  setPageScrollLock(open);
});

onBeforeUnmount(() => {
  setPageScrollLock(false);
});

useHead({
  link: [{ rel: 'stylesheet', href: '/magic360/magic360.css' }],
  script: [{ src: '/magic360/magic360.js', defer: true }],
});
</script>