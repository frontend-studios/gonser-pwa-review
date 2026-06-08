import {
  addComponent,
  addComponentsDir,
  addImports,
  addImportsDir,
  addServerHandler,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit';

export default defineNuxtModule({
  meta: {
    name: 'theme',
  },
  setup(_, nuxt) {
    const { resolve } = createResolver(import.meta.url);
    const swatchHandlerPath = `${nuxt.options.rootDir}/modules/theme/runtime/server/api/product-card-swatches.post.ts`;

    addServerHandler({
      route: '/api/product-card-swatches',
      handler: swatchHandlerPath,
      method: 'post',
    });

    const fontsOptions = (nuxt.options.fonts || {}) as {
      defaults?: {
        weights?: Array<number | string>;
      };
    };
    const currentWeights = fontsOptions.defaults?.weights ?? [];
    const mergedWeights = [...currentWeights, 600].map((weight) => Number(weight)).filter((weight) => Number.isFinite(weight));
    fontsOptions.defaults = fontsOptions.defaults ?? {};
    fontsOptions.defaults.weights = Array.from(new Set(mergedWeights)).sort((a, b) => a - b);
    nuxt.options.fonts = fontsOptions as typeof nuxt.options.fonts;

    nuxt.options.css = nuxt.options.css || [];
    nuxt.options.css.push(resolve('./runtime/assets/styles.scss'));

    nuxt.options.plugins = nuxt.options.plugins || [];
    nuxt.options.plugins.push(resolve('./runtime/plugins/font-runtime-fallback.client'));

    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.publicAssets = nitroConfig.publicAssets || [];
      nitroConfig.publicAssets.push({
        dir: resolve('./runtime/public'),
      });
    });

    // i18n Sprachdateien registrieren
    nuxt.hook('i18n:registerModule', (register: any) => {
      register({
        langDir: resolve('./runtime/lang'),
        locales: [
          { code: 'de', file: 'de.json' },
          { code: 'en', file: 'en.json' },
          { code: 'fr', file: 'fr.json' },
          // Weitere Sprachen können hier hinzugefügt werden
        ],
      });
    });

    // ✅ Theme-Composables registrieren (überschreiben Core-Composables)
    addImportsDir(resolve('./runtime/composables'));
    addImports({
      name: 'useSiteConfiguration',
      from: resolve('./runtime/composables/useSiteConfiguration/useSiteConfiguration'),
    });
    addImports({
      name: 'useProductRecommended',
      from: resolve('./runtime/composables/useProductRecommended/useProductRecommended'),
    });

    // Remove original app composables to avoid duplicate-import warnings
    // and ensure the theme overrides are the single auto-import source.
    nuxt.hook('imports:extend', (imports) => {
      const useSiteConfigurationIndex = imports.findIndex(
        (i) => i.name === 'useSiteConfiguration' && i.from.includes('app/composables/useSiteConfiguration'),
      );
      if (useSiteConfigurationIndex !== -1) {
        imports.splice(useSiteConfigurationIndex, 1);
      }

      const useProductRecommendedIndex = imports.findIndex(
        (i) => i.name === 'useProductRecommended' && i.from.includes('app/composables/useProductRecommended'),
      );
      if (useProductRecommendedIndex !== -1) {
        imports.splice(useProductRecommendedIndex, 1);
      }
    });

    // ✅ Theme-Components hinzufügen (vor den Core-Components)
    addComponentsDir({
      path: resolve('./runtime/components'),
      priority: 10, // Höhere Priorität als Core-Components
    });

    // Gallery wird durch FancyboxGallery ersetzt (abweichender Komponentenname)
    addComponent({
      name: 'Gallery',
      filePath: resolve('./runtime/components/ui/FancyboxGallery/FancyboxGallery.vue'),
      priority: 10,
    });

    // NarrowContainer überschreiben
    addComponent({
      name: 'NarrowContainer',
      filePath: resolve('./runtime/components/ui/NarrowContainer.vue'),
      priority: 10,
    });

    // CartProductCard überschreiben
    addComponent({
      name: 'UiCartProductCard',
      filePath: resolve('./runtime/components/ui/CartProductCard/CartProductCard.vue'),
      priority: 10,
    });

    // ✅ Theme-Layouts registrieren
    nuxt.hook('app:resolve', (app) => {
      app.layouts['default'] = {
        name: 'default',
        file: resolve('./runtime/layouts/default.vue'),
      };

      app.layouts['account'] = {
        name: 'account',
        file: resolve('./runtime/layouts/account.vue'),
      };
    });

    // Theme-Pages überschreiben (z.B. contact.vue)
    nuxt.hook('pages:extend', (pages) => {
      // DAN Kategorie-Seite: Original entfernen und Custom-Version hinzufügen
      const categoryPageIndex = pages.findIndex((page) => page.path === '/:slug(.*)');
      if (categoryPageIndex !== -1) {
        // Original-Page komplett entfernen
        pages.splice(categoryPageIndex, 1);
      }
      // Custom-Page hinzufügen
      pages.push({
        name: 'category-slug',
        path: '/:slug(.*)',
        file: resolve('./runtime/pages/category/[...slug].vue'),
        meta: {
          layout: false,
          middleware: ['category-guard'],
          type: 'category',
          isBlockified: false,
          identifier: 0,
        },
      });

      const productPageIndex = pages.findIndex((page) => page.path === '/:slug*_:itemId');
      if (productPageIndex !== -1) {
        // Original-Page komplett entfernen
        pages.splice(productPageIndex, 1);
      }
      pages.push({
        name: 'product-slug',
        path: '/:slug*_:itemId',
        file: resolve('./runtime/pages/product/[slug].vue'),
        meta: {
          layout: false,
          type: 'product',
          isBlockified: false,
          identifier: 0,
        },
      });

      // DAN Kontakt-Seite: Original entfernen und Custom-Version hinzufügen
      const themeContactPage = resolve('./runtime/pages/contact.vue');
      // Finde und entferne die Core contact.vue Page
      const contactPageIndex = pages.findIndex((page) => page.name === 'contact' || page.path === '/contact');

      if (contactPageIndex !== -1) {
        const contactPage = pages[contactPageIndex];
        if (contactPage) {
          // Ersetze die Core-Page mit der Theme-Page
          contactPage.file = themeContactPage;
        }
      }

      // DAN My Orders Page überschreiben
      const myOrdersPageIndex = pages.findIndex(
        (page) => page.name === 'my-account-my-orders' || page.path === '/my-account/my-orders',
      );

      if (myOrdersPageIndex !== -1) {
        const myOrdersPage = pages[myOrdersPageIndex];
        if (myOrdersPage) {
          myOrdersPage.file = resolve('./runtime/pages/my-account/my-orders.vue');
        }
      }

      // DAN Cart Page überschreiben
      const cartPageIndex = pages.findIndex((page) => page.name === 'cart' || page.path === '/cart');

      if (cartPageIndex !== -1) {
        const cartPage = pages[cartPageIndex];
        if (cartPage) {
          cartPage.file = resolve('./runtime/pages/cart.vue');
        }
      }
    });
  },
});
