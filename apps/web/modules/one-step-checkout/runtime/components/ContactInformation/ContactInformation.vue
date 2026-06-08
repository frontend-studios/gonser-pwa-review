<template>
  <div data-testid="contact-information" class="px-0 @md:px-0 pb-6">
    <!-- Wenn der User bereits eingeloggt ist, zeige nur die E-Mail -->
    <div v-if="customerEmail && isAuthorized" class="w-full">{{ t('contact.info.email') }}: {{ customerEmail }}</div>

    <!-- Accordion für nicht-eingeloggte Benutzer -->
    <div v-else class="">
      <!-- Accordion Item: Ich bin bereits Kunde -->
      <SfAccordionItem v-model="isCustomerAccordionOpen" class="accordion-with-transition">
        <template #summary>
          <div class="flex items-center justify-between w-full py-4">
            <h3 class="font-semibold">{{ t('checkout.contactInformation.existingCustomer') }}</h3>
            <SfIconChevronLeft
              :class="[
                'text-neutral-500 transition-transform duration-350',
                isCustomerAccordionOpen ? 'rotate-90' : '-rotate-90',
              ]"
            />
          </div>
        </template>
        <Transition
          name="expand"
          @enter="onEnter"
          @after-enter="onAfterEnter"
          @leave="onLeave"
          @after-leave="onAfterLeave"
        >
          <div v-if="isCustomerAccordionOpen" class="pb-4">
            <LoginComponent :is-soft-login="true" @logged-in="handleSuccessfulLogin" />
          </div>
        </Transition>
      </SfAccordionItem>

      <!-- Accordion Item: Ich bin Gast -->
      <SfAccordionItem v-model="isGuestAccordionOpen" class="accordion-with-transition">
        <template #summary>
          <div class="flex items-center justify-between w-full py-4">
            <h3 class="font-semibold">{{ t('checkout.contactInformation.guest') }}</h3>
            <SfIconChevronLeft
              :class="[
                'text-neutral-500 transition-transform duration-350',
                isGuestAccordionOpen ? 'rotate-90' : '-rotate-90',
              ]"
            />
          </div>
        </template>
        <Transition
          name="expand"
          @enter="onEnter"
          @after-enter="onAfterEnter"
          @leave="onLeave"
          @after-leave="onAfterLeave"
        >
          <div v-if="isGuestAccordionOpen" class="">
            <!-- Lieferadresse - immer sichtbar im Gast-Accordion -->
            <div>
              <AddressFormShipping :disabled="disabled" add-address />
            </div>
          </div>
        </Transition>
      </SfAccordionItem>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AddressType } from '@plentymarkets/shop-api';
import { SfAccordionItem, SfIconChevronLeft } from '@storefront-ui/vue';
import type { ContactInformationProps } from '~/components/ContactInformation/types';

const { disabled = false } = defineProps<ContactInformationProps>();

const { user, isAuthorized } = useCustomer();

const customerEmail = computed(() => user.value?.email || user.value?.guestMail || '');

// Accordion state - Standard: Gast ist offen
const isCustomerAccordionOpen = ref(false);
const isGuestAccordionOpen = ref(true);

// Verhindert Endlosschleifen bei wechselseitigen Updates
let isUpdating = false;

// Wenn ein Accordion geöffnet/geschlossen wird, stelle sicher, dass immer genau eines offen ist
watch(isCustomerAccordionOpen, (newValue) => {
  if (isUpdating) return;
  isUpdating = true;

  if (newValue) {
    // Kunde wird geöffnet -> Gast schließen
    isGuestAccordionOpen.value = false;
  } else if (!isGuestAccordionOpen.value) {
    // Kunde wird geschlossen UND Gast ist auch geschlossen -> Gast öffnen
    isGuestAccordionOpen.value = true;
  }

  nextTick(() => {
    isUpdating = false;
  });
});

watch(isGuestAccordionOpen, (newValue) => {
  if (isUpdating) return;
  isUpdating = true;

  if (newValue) {
    // Gast wird geöffnet -> Kunde schließen
    isCustomerAccordionOpen.value = false;
  } else if (!isCustomerAccordionOpen.value) {
    // Gast wird geschlossen UND Kunde ist auch geschlossen -> Kunde öffnen
    isCustomerAccordionOpen.value = true;
  }

  nextTick(() => {
    isUpdating = false;
  });
});

// Handler für erfolgreichen Login
const handleSuccessfulLogin = async () => {
  // Nach erfolgreichem Login beide Accordions schließen, da der User jetzt eingeloggt ist
  isCustomerAccordionOpen.value = false;
  isGuestAccordionOpen.value = false;
};

// Transition Hooks für Höhen-Animation
const onEnter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = '0';
  element.style.overflow = 'hidden';
  // Force reflow
  element.offsetHeight;
  element.style.transition = 'height 0.35s ease';
  element.style.height = `${element.scrollHeight}px`;
};

const onAfterEnter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = '';
  element.style.overflow = '';
  element.style.transition = '';
};

const onLeave = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = `${element.scrollHeight}px`;
  element.style.overflow = 'hidden';
  // Force reflow
  element.offsetHeight;
  element.style.transition = 'height 0.35s ease';
  element.style.height = '0';
};

const onAfterLeave = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = '';
  element.style.overflow = '';
  element.style.transition = '';
};
</script>
