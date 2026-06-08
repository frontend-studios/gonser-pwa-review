<template>
  <ClientOnly>
    <UiDivider class="col-span-3 -mx-4 !w-auto @md:mx-0" />
    <div class="col-span-3 mx-4 @md:mx-0 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="typography-headline-4 font-bold" data-testid="account-orders-heading">
          {{ t('theme.MyAccount.orders.headline') }}
          <span v-if="activeSearchQuery && searchProgress < (data?.data?.lastPageNumber || 0)">
            ({{ allFilteredOrders.length }}+ von {{ data?.data.totalsCount || 0 }}) -
            {{ t('theme.MyAccount.orders.loadingMore') }}
          </span>
          <span v-else-if="activeSearchQuery">
            ({{ allFilteredOrders.length }} von {{ data?.data.totalsCount || 0 }})
          </span>
          <span v-else>
            {{ data?.data.totalsCount ? `(${data.data.totalsCount})` : '' }}
          </span>
        </h2>
        <button
          v-if="activeSearchQuery"
          class="text-red cursor-pointer typography-text-sm whitespace-nowrap"
          @click="
            searchQuery = '';
            activeSearchQuery = '';
            searchCurrentPage = 1;
          "
        >
          {{ t('theme.MyAccount.orders.resetSearch') }}
        </button>
      </div>

      <div class="flex gap-2">
        <div class="flex-1">
          <SfInput
            v-model="searchQuery"
            type="text"
            :placeholder="t('theme.MyAccount.orders.searchPlaceholder')"
            class="w-full"
            :disabled="loadingAllOrders"
            @keyup.enter="performSearch"
          />
        </div>
        <UiButton variant="secondary" :disabled="loadingAllOrders" class="flex-shrink-0" @click="performSearch">
          {{ loadingAllOrders ? t('theme.MyAccount.orders.searching') : t('theme.MyAccount.orders.searchButton') }}
        </UiButton>
      </div>
    </div>

    <div
      v-if="(loading && !data) || loadingAllOrders"
      class="col-span-3 flex justify-center items-center min-h-[400px]"
    >
      <SfLoaderCircular size="2xl" />
    </div>

    <div
      v-else-if="!data || data.data.entries.length === 0"
      class="col-span-3 text-center"
      data-testid="account-orders-content"
    >
      <h3 class="typography-headline-3 font-bold mt-6 mb-4">{{ t('account.ordersAndReturns.noOrders') }}</h3>
      <UiButton :tag="NuxtLink" :to="localePath(paths.category)" variant="secondary" class="!ring-neutral-200">
        {{ t('account.ordersAndReturns.continue') }}
      </UiButton>
    </div>

    <div v-else-if="filteredOrders.length === 0" class="col-span-3 text-center">
      <h3 class="typography-headline-3 font-bold mt-6 mb-4">{{ t('theme.MyAccount.orders.noResultsHeadline') }}</h3>
      <p class="mb-4">{{ t('theme.MyAccount.orders.noResultsText', { query: activeSearchQuery }) }}</p>
      <UiButton
        variant="secondary"
        @click="
          searchQuery = '';
          activeSearchQuery = '';
          searchCurrentPage = 1;
        "
      >
        {{ t('theme.MyAccount.orders.resetSearch') }}
      </UiButton>
    </div>

    <div v-else class="col-span-3" data-testid="account-orders-content">
      <div class="relative col-span-3" :class="{ 'pointer-events-none opacity-50': loading }">
        <SfLoaderCircular v-if="loading" class="absolute top-0 bottom-0 right-0 left-0 m-auto z-[999]" size="2xl" />
        <template v-if="viewport.isLessThan('md')">
          <ul v-for="order in filteredOrders" :key="orderGetters.getId(order)" class="my-4 last-of-type:mb-0">
            <li>
              <p class="block typography-text-sm font-medium">{{ t('account.ordersAndReturns.orderId') }}</p>
              <span class="block typography-text-sm mb-2">{{ orderGetters.getId(order) }}</span>
            </li>
            <li>
              <p class="block typography-text-sm font-medium">
                {{ t('account.ordersAndReturns.orderDate') }}
              </p>
              <span class="block typography-text-sm mb-2">{{ formatOrderDate(order) }}</span>
            </li>
            <li>
              <p class="block typography-text-sm font-medium">{{ t('account.ordersAndReturns.amount') }}</p>
              <span v-if="order.totals.isNet" class="block typography-text-sm mb-2">
                {{ formatOrderPrice(orderGetters.getTotalNet(orderGetters.getTotals(order)), order.totals.currency) }}
              </span>
              <span v-else class="block typography-text-sm mb-2">
                {{ formatOrderPrice(orderGetters.getPrice(order), order.totals.currency) }}
              </span>
            </li>
            <li v-if="orderGetters.getShippingDate(order, locale)">
              <p class="block typography-text-sm font-medium">{{ t('account.ordersAndReturns.shippingDate') }}</p>
              <span class="block typography-text-sm mb-2">{{ orderGetters.getShippingDate(order, locale) }}</span>
            </li>
            <li class="flex flex-wrap items-center mb-2">
              <p class="block typography-text-sm font-medium flex-[100%]">
                {{ t('account.ordersAndReturns.status') }}
              </p>
              <span class="typography-text-sm flex-1">{{ formatOrderStatus(order) }}</span>
              <UiButton :tag="NuxtLink" size="sm" variant="tertiary" :to="localePath(generateOrderDetailsLink(order))">
                {{ t('account.ordersAndReturns.details') }}
              </UiButton>
              <UiDropdown class="relative">
                <template #trigger>
                  <UiButton :aria-label="t('account.ordersAndReturns.more')" size="sm" variant="tertiary">
                    <SfIconMoreHoriz size="sm" />
                  </UiButton>
                </template>
                <ul
                  class="rounded bg-white relative shadow-md border border-neutral-100 text-neutral-900 min-w-[152px] py-2"
                >
                  <li>
                    <SfListItem tag="button" class="text-left" @click="openOrderAgainModal(order)">
                      {{ t('account.ordersAndReturns.orderAgain.heading') }}
                    </SfListItem>
                  </li>
                  <li v-if="orderGetters.isReturnable(order)">
                    <NuxtLink :to="localePath(generateNewReturnLink(order))">
                      <SfListItem tag="button" class="text-left">
                        {{ t('returns.return') }}
                      </SfListItem>
                    </NuxtLink>
                  </li>
                </ul>
              </UiDropdown>
            </li>
            <UiDivider class="col-span-3 -mx-4 !w-auto @md:mx-0" />
          </ul>
        </template>

        <table v-else class="@md:block @md:overflow-x-auto text-left typography-text-sm w-auto mx-4 scrollbar-hidden">
          <caption class="hidden">
            {{
              t('account.ordersAndReturns.listOfOrders')
            }}
          </caption>
          <thead class="border-b-2 border-neutral-200">
            <tr>
              <th class="@lg:py-4 py-2 @lg:pr-4 pr-2 font-medium">{{ t('account.ordersAndReturns.orderId') }}</th>
              <th class="@lg:p-4 p-2 font-medium @lg:whitespace-nowrap">
                {{ t('account.ordersAndReturns.orderDate') }}
              </th>
              <th class="@lg:p-4 p-2 font-medium">{{ t('theme.MyAccount.orders.amount') }}</th>
              <th class="@lg:p-4 p-2 font-medium">{{ t('account.ordersAndReturns.shippingDate') }}</th>
              <th class="@lg:p-4 p-2 font-medium">{{ t('account.ordersAndReturns.status') }}</th>
              <th class="@lg:py-4 py-2 @lg:pl-4 pl-2 font-medium">{{ t('account.ordersAndReturns.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="orderGetters.getId(order)" class="border-b border-neutral-200">
              <td class="@lg:py-4 py-2 @lg:pr-4 pr-2 @lg:whitespace-nowrap">{{ orderGetters.getId(order) }}</td>
              <td class="@lg:p-4 p-2 @lg:whitespace-nowrap">{{ formatOrderDate(order) }}</td>
              <td v-if="orderGetters.getTotals(order).isNet" class="@lg:p-4 p-2">
                {{
                  formatOrderPrice(
                    orderGetters.getTotalNet(orderGetters.getTotals(order)),
                    orderGetters.getCurrency(order),
                  )
                }}
              </td>
              <td v-else class="@lg:p-4 p-2">
                {{
                  formatOrderPrice(
                    orderGetters.getTotal(orderGetters.getTotals(order)),
                    orderGetters.getCurrency(order),
                  )
                }}
              </td>
              <td class="@lg:p-4 p-2">{{ orderGetters.getShippingDate(order, locale) ?? '' }}</td>
              <td class="@lg:p-4 p-2 @lg:whitespace-nowrap w-full">{{ formatOrderStatus(order) }}</td>
              <td class="@lg:p-4 p-2 text-right">
                <div class="flex items-center justify-end">
                  <UiButton
                    :tag="NuxtLink"
                    size="sm"
                    variant="tertiary"
                    :to="localePath(generateOrderDetailsLink(order))"
                  >
                    {{ t('account.ordersAndReturns.details') }}
                  </UiButton>
                  <UiDropdown class="relative">
                    <template #trigger>
                      <UiButton size="sm" variant="tertiary">
                        <SfIconMoreHoriz size="sm" />
                      </UiButton>
                    </template>
                    <ul
                      class="rounded bg-white relative shadow-md border border-neutral-100 text-neutral-900 min-w-[152px] py-2"
                    >
                      <li>
                        <SfListItem tag="button" class="text-left" @click="openOrderAgainModal(order)">
                          {{ t('account.ordersAndReturns.orderAgain.heading') }}
                        </SfListItem>
                      </li>
                      <li v-if="orderGetters.isReturnable(order)">
                        <NuxtLink :to="localePath(generateNewReturnLink(order))">
                          <SfListItem tag="button" class="text-left">
                            {{ t('returns.return') }}
                          </SfListItem>
                        </NuxtLink>
                      </li>
                    </ul>
                  </UiDropdown>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination für normale Bestellungen (Server-seitig) -->
        <UiPagination
          v-if="!activeSearchQuery && data.data.lastPageNumber > 1"
          :disabled="loading"
          :current-page="data.data.page"
          :total-items="data.data.totalsCount"
          :page-size="data.data.itemsPerPage"
          :max-visible-pages="maxVisiblePages"
        />

        <!-- Pagination für Suchergebnisse (Client-seitig) -->
        <UiPagination
          v-if="activeSearchQuery && searchTotalPages > 1"
          :disabled="loadingAllOrders"
          :current-page="searchCurrentPage"
          :total-items="allFilteredOrders.length"
          :page-size="itemsPerPage"
          :max-visible-pages="maxVisiblePages"
          @update:current-page="searchCurrentPage = $event"
        />
      </div>
    </div>
  </ClientOnly>
  <OrderAgain v-if="selectedOrder" :order="selectedOrder" />
</template>

<script setup lang="ts">
import { type Order, orderGetters } from '@plentymarkets/shop-api';
import { SfIconMoreHoriz, SfListItem, SfLoaderCircular, SfInput } from '@storefront-ui/vue';
import { paths } from '~/utils/paths';
import type { Locale } from '#i18n';

defineI18nRoute({
  locales: process.env.LANGUAGELIST?.split(',') as Locale[],
});

const NuxtLink = resolveComponent('NuxtLink');
const { openOrderAgainModal, order: selectedOrder } = useOrderAgain();
const route = useRoute();
const localePath = useLocalePath();
const { formatWithSymbol } = usePriceFormatter();
const { locale } = useI18n();
const viewport = useViewport();
const maxVisiblePages = ref(1);
const setMaxVisiblePages = (isWide: boolean) => (maxVisiblePages.value = isWide ? 5 : 1);
const isDesktop = computed(() => viewport.isGreaterOrEquals('lg'));

// Helper: Formatiere Preis mit CHF zuerst und Punkt statt Komma (z.B. CHF 144.90)
const formatOrderPrice = (amount: number, currency: string) => {
  const formatted = formatWithSymbol(amount, currency);
  if (!formatted) return '';

  // "144,90 CHF" -> "CHF 144.90"
  const match = formatted.match(/^([\d,\.]+)\s*([A-Z]{3})$/);
  if (match && match[1] && match[2]) {
    const price = match[1].replace(',', '.');
    const curr = match[2];
    return `${curr} ${price}`;
  }
  // Fallback wenn Format anders ist
  return formatted.replace(',', '.');
};

// Helper: Formatiere Datum ohne Uhrzeit (nur Tag.Monat.Jahr)
const formatOrderDate = (order: Order) => {
  const createdAt = order?.order?.createdAt;
  if (!createdAt) return '';

  const date = new Date(createdAt);
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

// Helper: Formatiere Order Status mit eigenen Übersetzungen
const formatOrderStatus = (order: Order) => {
  const statusId = order?.order?.statusId;
  if (!statusId) return orderGetters.getStatus(order);

  // Status-IDs die eigene Übersetzungen haben
  const customStatusIds = [3, 3.1, 3.5, 3.6, 3.7, 4, 4.5, 5, 6, 6.1, 7, 8, 8.1, 9, 12];

  if (customStatusIds.includes(statusId)) {
    // Ersetze Punkt durch Unterstrich für Translation-Key (z.B. 3.1 -> 3_1)
    const statusKey = statusId.toString().replace('.', '_');
    const translationKey = `theme.MyAccount.orders.status.${statusKey}`;
    return t(translationKey);
  }

  // Fallback: Verwende Standard orderGetters.getStatus
  return orderGetters.getStatus(order);
};

definePageMeta({
  layout: 'account',
  pageType: 'static',
  middleware: ['auth-guard'],
});

// Search functionality
const searchQuery = ref('');
const activeSearchQuery = ref('');
const allOrders = ref<Order[]>([]);
const loadingAllOrders = ref(false);
const searchCurrentPage = ref(1);
const itemsPerPage = 5;
const searchProgress = ref(0);

// Funktion zum Vorladen aller Bestellungen im Hintergrund (still, ohne UI-Feedback)
const preloadAllOrders = async () => {
  // Nur laden, wenn noch nicht geladen
  if (allOrders.value.length > 0) return;

  const totalPages = data.value?.data?.lastPageNumber || 1;

  // Starte mit den bereits geladenen Daten
  if (data.value?.data?.entries) {
    allOrders.value = [...data.value.data.entries];
  }

  // Wenn nur 1 Seite, nichts weiter zu tun
  if (totalPages <= 1) return;

  // Lade alle restlichen Seiten STILL im Hintergrund (kein loadingAllOrders flag)
  (async () => {
    try {
      const batchSize = 50;
      const allLoadedOrders: Order[] = [...allOrders.value];

      // Lade alle Seiten in Batches
      for (let i = 0; i < totalPages; i += batchSize) {
        const batchPromises = [];
        const endPage = Math.min(i + batchSize, totalPages);

        for (let page = i + 1; page <= endPage; page++) {
          batchPromises.push(useSdk().plentysystems.getOrders({ page }));
        }

        const responses = await Promise.all(batchPromises);
        responses.forEach((response) => {
          if (response.data?.data?.entries) {
            allLoadedOrders.push(...response.data.data.entries);
          }
        });

        // Dedupliziere Bestellungen basierend auf ID
        const uniqueOrders = Array.from(
          new Map(allLoadedOrders.map((order) => [orderGetters.getId(order), order])).values(),
        );

        allOrders.value = uniqueOrders;
        searchProgress.value = Math.min(endPage, totalPages);
      }
    } catch (error) {
      console.error('Fehler beim Vorladen aller Bestellungen:', error);
    }
  })();
};

const performSearch = () => {
  const trimmedQuery = searchQuery.value.trim().toLowerCase();

  if (!trimmedQuery) {
    activeSearchQuery.value = '';
    searchCurrentPage.value = 1;
    return;
  }

  // Wenn noch nicht alle Daten geladen sind, zeige Loading-Indikator
  if (allOrders.value.length < (data.value?.data?.totalsCount || 0)) {
    loadingAllOrders.value = true;
  }

  // Aktiviere Suche - Daten sind bereits vorgeladen oder werden gerade geladen
  searchCurrentPage.value = 1;
  activeSearchQuery.value = trimmedQuery;

  // Warte darauf dass Vorladen fertig ist, dann entferne Loading-Indikator
  const checkInterval = setInterval(() => {
    if (allOrders.value.length >= (data.value?.data?.totalsCount || 0)) {
      loadingAllOrders.value = false;
      clearInterval(checkInterval);
    }
  }, 100);
};

onMounted(() => setMaxVisiblePages(isDesktop.value));

const { fetchCustomerOrders, data, loading } = useCustomerOrders();

// Starte automatisches Vorladen, sobald die erste Seite geladen ist
watch(
  () => data.value,
  (newData) => {
    if (newData?.data?.entries && allOrders.value.length === 0) {
      preloadAllOrders();
    }
  },
  { immediate: true },
);

// Filter orders based on search query - ALLE gefilterten Bestellungen
const allFilteredOrders = computed(() => {
  // Wenn Suche aktiv ist, filtere aus allen geladenen Bestellungen
  if (activeSearchQuery.value && allOrders.value.length > 0) {
    return allOrders.value.filter((order: Order) => {
      const orderId = orderGetters.getId(order).toString().toLowerCase();
      const searchLower = activeSearchQuery.value;

      // Search in order ID
      if (orderId.includes(searchLower)) return true;

      // Search in order items (article ID and name)
      const items = orderGetters.getItems(order) || [];
      return items.some((item: any) => {
        const itemId = item.itemVariationId?.toString().toLowerCase() || '';
        const itemName = orderGetters.getItemName(item)?.toLowerCase() || '';
        return itemId.includes(searchLower) || itemName.includes(searchLower);
      });
    });
  }

  // Ohne Suche: Zeige aktuelle Seite vom Server
  if (!data.value?.data?.entries) return [];
  return data.value.data.entries;
});

// Paginierte Bestellungen für die Anzeige
const filteredOrders = computed(() => {
  if (activeSearchQuery.value && allFilteredOrders.value.length > 0) {
    // Client-seitige Pagination für Suchergebnisse
    const start = (searchCurrentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return allFilteredOrders.value.slice(start, end);
  }

  // Ohne Suche: Zeige aktuelle Seite vom Server
  return allFilteredOrders.value;
});

// Berechne Pagination-Infos für Suchergebnisse
const searchTotalPages = computed(() => {
  if (!activeSearchQuery.value) return 0;
  return Math.ceil(allFilteredOrders.value.length / itemsPerPage);
});

const generateOrderDetailsLink = (order: Order) => {
  return `${paths.confirmation}/${orderGetters.getId(order)}/${orderGetters.getAccessKey(order)}`;
};

const generateNewReturnLink = (order: Order) => {
  return `${paths.accountNewReturn}/${orderGetters.getId(order)}/${orderGetters.getAccessKey(order)}`;
};

watch(isDesktop, (value) => setMaxVisiblePages(value));

watch(
  () => route.query.page,
  (page) => fetchCustomerOrders({ page: Number(page) || defaults.DEFAULT_PAGE }),
  { immediate: true },
);
</script>
