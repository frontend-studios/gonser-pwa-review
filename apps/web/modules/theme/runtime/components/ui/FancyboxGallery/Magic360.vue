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
        <div class="magic360-stage flex min-h-0 flex-1 items-center justify-center p-4">
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
const detectedColumns = ref(36);
const hasResolvedDimensions = ref(false);
let availabilityProbeId = 0;
let dimensionsProbeId = 0;
let dimensionsDetectionPromise: Promise<void> | null = null;
let viewerInitRunId = 0;

const BASE_360_CDN_PATH = 'https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/360';
const MAX_ROWS = 24;
const MAX_COLUMNS = 72;
const IMAGE_SUFFIX = 'webp';
const DEFAULT_ROWS = 1;
const DEFAULT_COLUMNS = 36;
const DIMENSIONS_CACHE_PREFIX = 'magic360:dimensions:v1:';

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

const dimensionsCacheKey = computed(() => {
  if (!normalizedItemId.value) return '';
  return `${DIMENSIONS_CACHE_PREFIX}${normalizedItemId.value}`;
});

const readDimensionsCache = (): { rows: number; columns: number } | null => {
  if (!import.meta.client || !dimensionsCacheKey.value) return null;

  try {
    const raw = sessionStorage.getItem(dimensionsCacheKey.value);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { rows?: number; columns?: number };
    const rows = Number(parsed.rows);
    const columns = Number(parsed.columns);

    if (!Number.isInteger(rows) || !Number.isInteger(columns)) return null;
    if (rows < 1 || rows > MAX_ROWS || columns < 1 || columns > MAX_COLUMNS) return null;

    return { rows, columns };
  } catch {
    return null;
  }
};

const writeDimensionsCache = (rows: number, columns: number) => {
  if (!import.meta.client || !dimensionsCacheKey.value) return;

  try {
    sessionStorage.setItem(dimensionsCacheKey.value, JSON.stringify({ rows, columns }));
  } catch {
    // Ignore storage errors (quota/private mode).
  }
};

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

const waitForMagic360Api = async (maxWaitMs = 3000): Promise<Magic360Api | null> => {
  if (!import.meta.client) return null;

  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const api = (window as Window & { Magic360?: Magic360Api }).Magic360;
    if (api) return api;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  return null;
};

const resolveAxisCount = async (
  buildUrl: (index: number) => string,
  checkpoints: number[],
): Promise<number> => {
  let minExisting = 1;

  for (const checkpoint of checkpoints) {
    if (checkpoint <= minExisting) continue;

    const exists = await probeImageExists(buildUrl(checkpoint));
    if (exists) {
      minExisting = checkpoint;
      continue;
    }

    let low = minExisting;
    let high = checkpoint;
    while (low + 1 < high) {
      const mid = Math.floor((low + high) / 2);
      const midExists = await probeImageExists(buildUrl(mid));
      if (midExists) {
        low = mid;
      } else {
        high = mid;
      }
    }

    return low;
  }

  return minExisting;
};

const detectFrameDimensions = async (): Promise<{ rows: number; columns: number } | null> => {
  if (!firstFrameUrl.value) return null;

  const hasFirstFrame = await probeImageExists(firstFrameUrl.value);
  if (!hasFirstFrame) {
    return null;
  }

  const columnCheckpoints = [
    Math.min(DEFAULT_COLUMNS, MAX_COLUMNS),
    Math.min(48, MAX_COLUMNS),
    Math.min(60, MAX_COLUMNS),
    MAX_COLUMNS,
  ];

  const rowCheckpoints = [
    Math.min(2, MAX_ROWS),
    Math.min(4, MAX_ROWS),
    Math.min(8, MAX_ROWS),
    Math.min(16, MAX_ROWS),
    MAX_ROWS,
  ];

  const [columns, rows] = await Promise.all([
    resolveAxisCount((column) => frameUrl(1, column), columnCheckpoints),
    resolveAxisCount((row) => frameUrl(row, 1), rowCheckpoints),
  ]);

  return { rows, columns };
};

const detectAndApplyDimensions = async (probeId: number): Promise<void> => {
  if (hasResolvedDimensions.value) {
    return;
  }

  if (dimensionsDetectionPromise) {
    return dimensionsDetectionPromise;
  }

  dimensionsDetectionPromise = (async () => {
    const dimensions = await detectFrameDimensions();
    if (probeId !== dimensionsProbeId) {
      return;
    }

    if (!dimensions) {
      hasResolvedDimensions.value = true;
      return;
    }

    detectedRows.value = dimensions.rows;
    detectedColumns.value = dimensions.columns;
    hasResolvedDimensions.value = true;
    writeDimensionsCache(dimensions.rows, dimensions.columns);

    if (isOpen.value) {
      // Reinitialize the viewer with refined dimensions.
      spinKey.value += 1;
    }
  })().finally(() => {
    dimensionsDetectionPromise = null;
  });

  return dimensionsDetectionPromise;
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

  if (!hasResolvedDimensions.value) {
    void detectAndApplyDimensions(dimensionsProbeId);
  }
};

const closeModal = () => {
  viewerInitRunId += 1;
  isOpen.value = false;
};

const initializeViewer = async () => {
  const runId = ++viewerInitRunId;
  await nextTick();

  if (!isOpen.value || runId !== viewerInitRunId) {
    return;
  }

  // Allow enough time for deferred script loading on slower devices/network.
  const api = await waitForMagic360Api(15000);
  if (!api || !isOpen.value || runId !== viewerInitRunId) {
    return;
  }

  if (typeof api.start === 'function') {
    api.start(spinAnchorRef.value ?? undefined);
    return;
  }

  if (typeof api.refresh === 'function') {
    api.refresh();
  }
};

watch(
  firstFrameUrl,
  async () => {
    availabilityProbeId += 1;
    const currentProbeId = availabilityProbeId;
    dimensionsProbeId += 1;
    dimensionsDetectionPromise = null;
    hasResolvedDimensions.value = false;

    if (!firstFrameUrl.value) {
      isAvailable.value = false;
      detectedRows.value = DEFAULT_ROWS;
      detectedColumns.value = DEFAULT_COLUMNS;
      return;
    }

    const cachedDimensions = readDimensionsCache();
    if (cachedDimensions) {
      detectedRows.value = cachedDimensions.rows;
      detectedColumns.value = cachedDimensions.columns;
      hasResolvedDimensions.value = true;
    } else {
      detectedRows.value = DEFAULT_ROWS;
      detectedColumns.value = DEFAULT_COLUMNS;
    }

    // Optimistically render the launcher and validate in the background.
    isAvailable.value = true;

    const hasFirstFrame = await probeImageExists(firstFrameUrl.value);
    if (currentProbeId !== availabilityProbeId) {
      return;
    }

    if (!hasFirstFrame) {
      isAvailable.value = false;
      detectedRows.value = DEFAULT_ROWS;
      detectedColumns.value = DEFAULT_COLUMNS;

      if (isOpen.value) {
        closeModal();
      }
      return;
    }
  },
  { immediate: true },
);

watch(isOpen, (open) => {
  setPageScrollLock(open);
});

watch(
  () => [isOpen.value, spinKey.value],
  ([open]) => {
    if (!open) {
      return;
    }

    void initializeViewer();
  },
  { flush: 'post' },
);

onBeforeUnmount(() => {
  setPageScrollLock(false);
});

useHead({
  link: [
    { rel: 'dns-prefetch', href: '//cdn02.plentymarkets.com' },
    { rel: 'preconnect', href: 'https://cdn02.plentymarkets.com', crossorigin: '' },
    { rel: 'stylesheet', href: '/magic360/magic360.css' },
  ],
  script: [{ src: '/magic360/magic360.js', defer: true }],
});
</script>

<style scoped>
.magic360-stage :deep(.Magic360-container) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  max-width: calc(100vw - 2rem) !important;
  max-height: calc(100vh - 5rem) !important;
}

.magic360-stage :deep(.Magic360-container .Magic360) {
  display: block !important;
  margin: 0 !important;
}

.magic360-stage :deep(.Magic360-container .Magic360),
.magic360-stage :deep(.Magic360-container .Magic360 img) {
  max-height: calc(100vh - 5rem) !important;
}
</style>