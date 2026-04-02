import { addComponentsDir, addImportsDir, createResolver, defineNuxtModule } from '@nuxt/kit';

export default defineNuxtModule({
  meta: {
    name: 'theme',
  },
  setup(_, nuxt) {
    const { resolve } = createResolver(import.meta.url);

    nuxt.options.css = nuxt.options.css || [];
    nuxt.options.css.push(resolve('./runtime/assets/styles.scss'));

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
          // Weitere Sprachen können hier hinzugefügt werden
        ],
      });
    });

    // ✅ Theme-Composables registrieren (überschreiben Core-Composables)
    addImportsDir(resolve('./runtime/composables/**'));

    // ✅ Theme-Components hinzufügen (vor den Core-Components)
    addComponentsDir({
      path: resolve('./runtime/components'),
      priority: 10, // Höhere Priorität als Core-Components
    });

    nuxt.hook('components:extend', (components) => {
      const megaMenuComp = components.find((c) => c.pascalName === 'MegaMenu');
      if (megaMenuComp) {
        megaMenuComp.filePath = resolve('./runtime/components/MegaMenu/MegaMenu.vue');
      }

      const headerComp = components.find(
        (c) =>
          c.pascalName === 'Header' || c.pascalName === 'UiHeader' || c.filePath?.endsWith('/components/ui/Header.vue'),
      );

      if (headerComp) {
        headerComp.filePath = resolve('./runtime/components/ui/Header.vue');
      }

      const searchComp = components.find(
        (c) =>
          c.pascalName === 'Search' || c.pascalName === 'UiSearch' || c.filePath?.endsWith('/components/ui/Search.vue'),
      );

      if (searchComp) {
        searchComp.filePath = resolve('./runtime/components/ui/Search.vue');
      }

      const navbarBottomComp = components.find(
        (c) =>
          c.pascalName === 'NavbarBottom' ||
          c.pascalName === 'UiNavbarBottom' ||
          c.filePath?.endsWith('/components/ui/NavbarBottom.vue'),
      );

      if (navbarBottomComp) {
        navbarBottomComp.filePath = resolve('./runtime/components/ui/NavbarBottom.vue');
      }

      // Footer überschreiben
      const footerComp = components.find((c) => c.pascalName === 'BlocksFooter');
      if (footerComp) {
        footerComp.filePath = resolve('./runtime/components/blocks/Footer/Footer.vue');
      }

      // FooterBlocks: Core-Version komplett entfernen (Theme-Version wird über addComponentsDir bereits registriert)
      const footerBlocksCompIndex = components.findIndex(
        (c) => c.pascalName === 'UiFooterBlocks' && c.filePath?.includes('/app/components/ui/FooterBlocks'),
      );
      if (footerBlocksCompIndex !== -1) {
        components.splice(footerBlocksCompIndex, 1);
      }

      // DAN Badges überschreiben (Custom Availability Styling)
      const badgesComp = components.find(
        (c) =>
          c.pascalName === 'Badges' ||
          c.pascalName === 'UiBadges' ||
          c.filePath?.endsWith('/components/ui/Badges/Badges.vue'),
      );
      if (badgesComp) {
        badgesComp.filePath = resolve('./runtime/components/ui/Badges/Badges.vue');
      }

      // DAN QuickCheckout überschreiben
      const quickCheckoutComp = components.find(
        (c) => c.pascalName === 'QuickCheckout' || c.filePath?.endsWith('/components/QuickCheckout/QuickCheckout.vue'),
      );
      if (quickCheckoutComp) {
        quickCheckoutComp.filePath = resolve('./runtime/components/QuickCheckout/QuickCheckout.vue');
      }

      // DAN ProductCard überschreiben
      const productCardComp = components.find(
        (c) =>
          c.pascalName === 'ProductCard' ||
          c.pascalName === 'UiProductCard' ||
          c.filePath?.endsWith('/components/ui/ProductCard/ProductCard.vue'),
      );
      if (productCardComp) {
        productCardComp.filePath = resolve('./runtime/components/ui/ProductCard/ProductCard.vue');
      }

      // DAN QuantitySelector überschreiben
      const quantitySelectorComp = components.find(
        (c) =>
          c.pascalName === 'QuantitySelector' ||
          c.pascalName === 'UiQuantitySelector' ||
          c.filePath?.endsWith('/components/ui/QuantitySelector/QuantitySelector.vue'),
      );
      if (quantitySelectorComp) {
        quantitySelectorComp.filePath = resolve('./runtime/components/ui/QuantitySelector/QuantitySelector.vue');
      }

      // PN Gallery überschreiben (PDP Fancybox)
      const galleryComp = components.find(
        (c) => c.pascalName === 'Gallery' || c.filePath?.endsWith('/components/Gallery/Gallery.vue'),
      );
      if (galleryComp) {
        galleryComp.filePath = resolve('./runtime/components/ui/FancyboxGallery/FancyboxGallery.vue');
      }

      // DAN Breadcrumbs überschreiben
      const breadcrumbsComp = components.find(
        (c) =>
          c.pascalName === 'Breadcrumbs' ||
          c.pascalName === 'UiBreadcrumbs' ||
          c.filePath?.endsWith('/components/ui/Breadcrumbs/Breadcrumbs.vue'),
      );
      if (breadcrumbsComp) {
        breadcrumbsComp.filePath = resolve('./runtime/components/ui/Breadcrumbs/Breadcrumbs.vue');
      }

      // DAN NarrowContainer überschreiben
      const narrowContainerComp = components.find(
        (c) =>
          c.pascalName === 'NarrowContainer' ||
          c.pascalName === 'UiNarrowContainer' ||
          c.filePath?.endsWith('/components/ui/NarrowContainer.vue'),
      );
      if (narrowContainerComp) {
        narrowContainerComp.filePath = resolve('./runtime/components/ui/NarrowContainer.vue');
      }

      // DAN CategoryPageContent überschreiben
      const categoryPageContentComp = components.find(
        (c) =>
          c.pascalName === 'CategoryPageContent' ||
          c.filePath?.endsWith('/components/CategoryPageContent/CategoryPageContent.vue'),
      );
      if (categoryPageContentComp) {
        categoryPageContentComp.filePath = resolve('./runtime/components/CategoryPageContent/CategoryPageContent.vue');
      }

      // DAN Pagination überschreiben
      const paginationComp = components.find(
        (c) =>
          c.pascalName === 'Pagination' ||
          c.pascalName === 'UiPagination' ||
          c.filePath?.endsWith('/components/ui/Pagination/Pagination.vue'),
      );
      if (paginationComp) {
        paginationComp.filePath = resolve('./runtime/components/ui/Pagination/Pagination.vue');
      }

      // DAN CategoryItemsPerPage überschreiben
      const categoryItemsPerPageComp = components.find(
        (c) =>
          c.pascalName === 'CategoryItemsPerPage' ||
          c.filePath?.endsWith('/components/CategoryItemsPerPage/CategoryItemsPerPage.vue'),
      );
      if (categoryItemsPerPageComp) {
        categoryItemsPerPageComp.filePath = resolve(
          './runtime/components/CategoryItemsPerPage/CategoryItemsPerPage.vue',
        );
      }
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
    });
  },
});
