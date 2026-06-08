import { createError, defineEventHandler, readBody } from 'h3';

interface BatchRequestBody {
  itemIds?: Array<string | number>;
}

const CACHE_TTL_MS = 60_000;
const MAX_BATCH_IDS = 80;
const FETCH_CONCURRENCY = 6;

type CachedProduct = {
  value: Record<string, unknown> | null;
  expiresAt: number;
};

const productCache = new Map<string, CachedProduct>();

const now = () => Date.now();

const normalizeItemIds = (input: BatchRequestBody['itemIds']) => {
  if (!Array.isArray(input)) {
    return [];
  }

  const unique = new Set<string>();

  for (const value of input) {
    const asString = String(value ?? '').trim();
    if (!/^\d+$/.test(asString)) {
      continue;
    }

    unique.add(asString);
    if (unique.size >= MAX_BATCH_IDS) {
      break;
    }
  }

  return Array.from(unique);
};

const getMiddlewareBaseUrl = () => {
  const configured = String(
    process.env.SHOP_CORE_MIDDLEWARE_SSR_URL || process.env.NUXT_SHOP_CORE_MIDDLEWARE_SSR_URL || '',
  ).trim();

  if (configured) {
    return configured.replace(/\/$/, '');
  }

  return 'http://localhost:8181';
};

const normalizeGetProductResponse = (payload: unknown): Record<string, unknown> | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const asRecord = payload as Record<string, unknown>;

  if (asRecord.data && typeof asRecord.data === 'object') {
    return asRecord.data as Record<string, unknown>;
  }

  return asRecord;
};

const fetchSingleProduct = async (itemId: string): Promise<Record<string, unknown> | null> => {
  const cached = productCache.get(itemId);
  if (cached && cached.expiresAt > now()) {
    return cached.value;
  }

  const middlewareBase = getMiddlewareBaseUrl();

  try {
    const response = await $fetch<unknown>(`${middlewareBase}/plentysystems/getProduct`, {
      method: 'POST',
      body: [{ id: itemId }],
      timeout: 5000,
    });

    const normalized = normalizeGetProductResponse(response);
    productCache.set(itemId, {
      value: normalized,
      expiresAt: now() + CACHE_TTL_MS,
    });

    return normalized;
  } catch {
    productCache.set(itemId, {
      value: null,
      expiresAt: now() + CACHE_TTL_MS,
    });

    return null;
  }
};

const fetchProductsBatch = async (itemIds: string[]) => {
  const variants: Record<string, Record<string, unknown> | null> = {};

  let index = 0;
  const workerCount = Math.max(1, Math.min(FETCH_CONCURRENCY, itemIds.length));

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (index < itemIds.length) {
        const currentIndex = index;
        index += 1;
        const itemId = itemIds[currentIndex];

        if (!itemId) {
          continue;
        }

        variants[itemId] = await fetchSingleProduct(itemId);
      }
    }),
  );

  return variants;
};

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as BatchRequestBody | null;
  const itemIds = normalizeItemIds(body?.itemIds);

  if (!itemIds.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'itemIds must include at least one numeric id',
    });
  }

  const variants = await fetchProductsBatch(itemIds);

  return {
    variants,
    meta: {
      requested: itemIds.length,
      cacheTtlMs: CACHE_TTL_MS,
    },
  };
});
