import { addImports, createResolver, defineNuxtModule } from 'nuxt/kit';

export default defineNuxtModule({
  meta: {
    name: 'one-step-checkout',
    configKey: 'oneStepCheckout',
  },
  defaults: {},
  async setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url);

    // i18n Sprachdateien registrieren
    nuxt.hook('i18n:registerModule', (register: any) => {
      register({
        langDir: resolve('./runtime/lang'),
        locales: [
          { code: 'de', file: 'de.json' },
          { code: 'en', file: 'en.json' },
          { code: 'fr', file: 'fr.json' },
        ],
      });
    });

    // Override paths from the main app by adding them with explicit imports
    addImports({
      name: 'paths',
      from: resolve('./runtime/utils/paths'),
    });

    // Override useShippingAsBilling composable
    addImports({
      name: 'useShippingAsBilling',
      from: resolve('./runtime/composables/useShippingAsBilling'),
    });

    // Remove the original paths import from app/utils to avoid duplication warning
    nuxt.hook('imports:extend', (imports) => {
      const pathsIndex = imports.findIndex((i) => i.name === 'paths' && i.from.includes('app/utils/paths'));
      if (pathsIndex !== -1) {
        imports.splice(pathsIndex, 1);
      }

      // Remove the original useShippingAsBilling import to avoid duplication
      const useShippingAsBillingIndex = imports.findIndex(
        (i) => i.name === 'useShippingAsBilling' && i.from.includes('app/composables/useShippingAsBilling'),
      );
      if (useShippingAsBillingIndex !== -1) {
        imports.splice(useShippingAsBillingIndex, 1);
      }
    });

    // Override checkout layout
    nuxt.hook('app:resolve', (app) => {
      app.layouts['checkout'] = {
        name: 'checkout',
        file: resolve('./runtime/layouts/checkout.vue'),
      };
    });

    // Override checkout page
    nuxt.hook('pages:extend', (pages) => {
      const checkoutPage = pages.find((page) => page.path === '/checkout');
      if (checkoutPage) {
        checkoutPage.file = resolve('./runtime/pages/checkout.vue');
      }
    });

    nuxt.hook('components:extend', (components) => {
      const addressContainer = components.find((c) => c.pascalName === 'AddressContainer');
      if (addressContainer) {
        addressContainer.filePath = resolve('./runtime/components/AddressContainer/AddressContainer.vue');
      }

      const addressFormBilling = components.find((c) => c.pascalName === 'AddressFormBilling');
      if (addressFormBilling) {
        addressFormBilling.filePath = resolve('./runtime/components/AddressFormBilling/AddressFormBilling.vue');
      }

      const addressFormShipping = components.find((c) => c.pascalName === 'AddressFormShipping');
      if (addressFormShipping) {
        addressFormShipping.filePath = resolve('./runtime/components/AddressFormShipping/AddressFormShipping.vue');
      }

      const contactInformation = components.find((c) => c.pascalName === 'ContactInformation');
      if (contactInformation) {
        contactInformation.filePath = resolve('./runtime/components/ContactInformation/ContactInformation.vue');
      }

      const loginComponent = components.find((c) => c.pascalName === 'LoginComponent');
      if (loginComponent) {
        loginComponent.filePath = resolve('./runtime/components/LoginComponent/LoginComponent.vue');
      }

      const forgotPasswordComponent = components.find((c) => c.pascalName === 'ForgotPasswordComponent');
      if (forgotPasswordComponent) {
        forgotPasswordComponent.filePath = resolve(
          './runtime/components/ForgotPasswordComponent/ForgotPasswordComponent.vue',
        );
      }

      const checkoutPayment = components.find((c) => c.pascalName === 'CheckoutPayment');
      if (checkoutPayment) {
        checkoutPayment.filePath = resolve('./runtime/components/CheckoutPayment/CheckoutPayment.vue');
      }

      const checkoutGeneralTerms = components.find((c) => c.pascalName === 'CheckoutGeneralTerms');
      if (checkoutGeneralTerms) {
        checkoutGeneralTerms.filePath = resolve('./runtime/components/CheckoutGeneralTerms/CheckoutGeneralTerms.vue');
      }

      const orderSummary = components.find((c) => c.pascalName === 'OrderSummary');
      if (orderSummary) {
        orderSummary.filePath = resolve('./runtime/components/OrderSummary/OrderSummary.vue');
      }

      const coupon = components.find((c) => c.pascalName === 'Coupon');
      if (coupon) {
        coupon.filePath = resolve('./runtime/components/Coupon/Coupon.vue');
      }

      const paymentButtons = components.find((c) => c.pascalName === 'PaymentButtons');
      if (paymentButtons) {
        paymentButtons.filePath = resolve('./runtime/components/PaymentButtons/PaymentButtons.vue');
      }

      const confirmationPageContent = components.find((c) => c.pascalName === 'ConfirmationPageContent');
      if (confirmationPageContent) {
        confirmationPageContent.filePath = resolve(
          './runtime/components/ConfirmationPageContent/ConfirmationPageContent.vue',
        );
      }

      const orderSummaryProductCard = components.find((c) => c.pascalName === 'OrderSummaryProductCard');
      if (orderSummaryProductCard) {
        orderSummaryProductCard.filePath = resolve(
          './runtime/components/OrderSummaryProductCard/OrderSummaryProductCard.vue',
        );
      }

      const uiFormPasswordInput = components.find((c) => c.pascalName === 'UiFormPasswordInput');
      if (uiFormPasswordInput) {
        uiFormPasswordInput.filePath = resolve('./runtime/components/ui/Form/FormPasswordInput.vue');
      }

      // const quickCheckout = components.find((c) => c.pascalName === 'QuickCheckout');
      // if (quickCheckout) {
      //   quickCheckout.filePath = resolve('./runtime/components/QuickCheckout/QuickCheckout.vue');
      // }
    });
  },
});
