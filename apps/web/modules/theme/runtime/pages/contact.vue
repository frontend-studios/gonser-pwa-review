<template>
  <NuxtLayout name="default">
    <div class="max-w-screen-2xl mx-auto px-4 py-8 category-contact">
      <h1 class="font-bold mb-10 typography-headline-3 md:typography-headline-2">
        {{ t('theme.ContactPage.name') }}
      </h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <!-- Kontaktinformationen -->
        <div class="lg:col-span-1">
          <p class="mb-4">{{ t('theme.ContactPage.intro.paragraph1') }}</p>
          <p class="mb-4">{{ t('theme.ContactPage.intro.paragraph2') }}</p>
          <p>
            {{ t('theme.ContactPage.intro.paragraph3') }}
            <a :href="t('theme.ContactPage.intro.faqUrl')" class="text-primary-500 hover:underline">{{
              t('theme.ContactPage.intro.faqLink')
            }}</a
            ><br />{{ t('theme.ContactPage.intro.paragraph3End') }}
          </p>
        </div>

        <!-- Formular -->
        <div class="formular lg:col-span-2">
          <div class="p-5 contact-form bg-white rounded-lg shadow">
            <form
              id="uploadForm"
              ref="uploadForm"
              accept-charset="utf-8"
              action="https://webhook.frontapp.com/forms/d17e8ebdb77174f22473/TZwgJjhdur1lUE1sf7Cv7QoMg4s3cyOv9aOAcPm4p2J330r9LZl07kjdYnOXo-Turc0KpLrESkBymPchj4CTcwdc7jxLwjvgzmvxaK7fiJ_DpFPG05d1oiWA2Y8"
              enctype="multipart/form-data"
              method="POST"
              name="fa-form-1"
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div class="mb-4">
                  <label for="inputName" class="block mb-2 font-medium">{{ t('theme.ContactPage.fields.name') }}</label>
                  <input
                    id="inputName"
                    class="contact-input w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    name="name"
                    type="text"
                    required
                  />
                </div>
                <div class="mb-4">
                  <label for="inputMail" class="block mb-2 font-medium">{{
                    t('theme.ContactPage.fields.email')
                  }}</label>
                  <input
                    id="inputMail"
                    class="contact-input w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    name="email"
                    type="email"
                    required
                  />
                </div>
              </div>

              <hr class="my-5 border-gray-300" />

              <div class="mb-5 font-bold text-lg">{{ t('theme.ContactPage.subjectHeadline') }}</div>

              <!-- Accordion: Um eine Bestellung -->
              <div class="mb-4">
                <div class="accordion-card border rounded bg-white shadow-sm" data-accordion="order">
                  <div class="accordion-header px-2">
                    <h2 class="mb-0 text-base">
                      <button
                        type="button"
                        class="accordion-btn w-full text-left font-bold px-2 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between text-[#151515] relative"
                        @click="toggleAccordion('order')"
                      >
                        <span>{{ t('theme.ContactPage.accordions.order') }}</span>
                        <SfIconExpandLess
                          v-if="activeAccordion === 'order'"
                          class="flex-shrink-0 transition-transform duration-300"
                        />
                        <SfIconExpandMore v-else class="flex-shrink-0 transition-transform duration-300" />
                      </button>
                    </h2>
                  </div>
                  <div v-show="activeAccordion === 'order'" class="accordion-content p-4">
                    <!-- Unteroptionen -->
                    <div class="space-y-2">
                      <div
                        v-for="(option, index) in orderOptions"
                        :key="index"
                        class="sub-accordion border-0 rounded bg-white"
                      >
                        <div class="sub-accordion-header p-0">
                          <button
                            type="button"
                            class="sub-accordion-btn w-full text-left px-2 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors relative"
                            @click="toggleSubAccordion('order-' + index, option.value, option.needsOrderId)"
                          >
                            <div class="flex items-center flex-1">
                              <input
                                type="radio"
                                :value="option.value"
                                :checked="selectedSubject === option.value"
                                class="mr-3 align-middle"
                                @click.stop
                              />
                              <span>{{ option.label }}</span>
                            </div>
                            <SfIconExpandMore
                              v-if="activeSubAccordion === 'order-' + index"
                              class="flex-shrink-0 text-sm transition-transform duration-300"
                            />
                            <SfIconChevronRight
                              v-else
                              class="flex-shrink-0 text-sm transition-transform duration-300"
                            />
                          </button>
                        </div>
                        <div
                          v-show="activeSubAccordion === 'order-' + index"
                          class="sub-accordion-content p-4 bg-gray-50"
                        >
                          <p class="text-sm text-gray-600 mb-4">
                            {{ option.description }}
                          </p>
                          <div v-if="option.needsOrderId" class="mb-4">
                            <label for="inputOrderID" class="block mb-2 font-medium">{{
                              t('theme.ContactPage.fields.orderId')
                            }}</label>
                            <input
                              id="inputOrderID"
                              class="contact-input w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                              name="Order-ID"
                              type="text"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Accordion: Um einen Artikel -->
              <div class="mb-4">
                <div class="accordion-card border rounded bg-white shadow-sm" data-accordion="item">
                  <div class="accordion-header px-2">
                    <h2 class="mb-0 text-base">
                      <button
                        type="button"
                        class="accordion-btn w-full text-left font-bold px-2 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between text-[#151515] relative"
                        @click="toggleAccordion('item')"
                      >
                        <span>{{ t('theme.ContactPage.accordions.item') }}</span>
                        <SfIconExpandLess
                          v-if="activeAccordion === 'item'"
                          class="flex-shrink-0 transition-transform duration-300"
                        />
                        <SfIconExpandMore v-else class="flex-shrink-0 transition-transform duration-300" />
                      </button>
                    </h2>
                  </div>
                  <div v-show="activeAccordion === 'item'" class="accordion-content p-4">
                    <div class="space-y-2">
                      <div
                        v-for="(option, index) in itemOptions"
                        :key="index"
                        class="sub-accordion border-0 rounded bg-white"
                      >
                        <div class="sub-accordion-header p-0">
                          <button
                            type="button"
                            class="sub-accordion-btn w-full text-left px-2 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors relative"
                            @click="toggleSubAccordion('item-' + index, option.value, option.needsItemId)"
                          >
                            <div class="flex items-center flex-1">
                              <input
                                type="radio"
                                :value="option.value"
                                :checked="selectedSubject === option.value"
                                class="mr-3 align-middle"
                                @click.stop
                              />
                              <span>{{ option.label }}</span>
                            </div>
                            <SfIconExpandMore
                              v-if="activeSubAccordion === 'item-' + index"
                              class="flex-shrink-0 text-sm transition-transform duration-300"
                            />
                            <SfIconChevronRight
                              v-else
                              class="flex-shrink-0 text-sm transition-transform duration-300"
                            />
                          </button>
                        </div>
                        <div
                          v-show="activeSubAccordion === 'item-' + index"
                          class="sub-accordion-content p-4 bg-gray-50"
                        >
                          <p class="text-sm text-gray-600 mb-4">
                            {{ option.description }}
                          </p>
                          <div v-if="option.needsItemId" class="mb-4">
                            <label for="inputItemID" class="block mb-2 font-medium">{{
                              t('theme.ContactPage.fields.itemId')
                            }}</label>
                            <input
                              id="inputItemID"
                              class="contact-input w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                              name="Artikel-ID"
                              type="text"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Accordion: Andere Anfrage -->
              <div class="mb-4">
                <div class="accordion-card border rounded bg-white shadow-sm" data-accordion="other">
                  <div class="accordion-header px-2">
                    <h2 class="mb-0 text-base">
                      <button
                        type="button"
                        class="accordion-btn w-full text-left font-bold px-2 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between text-[#151515] relative"
                        @click="toggleAccordion('other')"
                      >
                        <span>{{ t('theme.ContactPage.accordions.other') }}</span>
                        <SfIconExpandLess
                          v-if="activeAccordion === 'other'"
                          class="flex-shrink-0 transition-transform duration-300"
                        />
                        <SfIconExpandMore v-else class="flex-shrink-0 transition-transform duration-300" />
                      </button>
                    </h2>
                  </div>
                  <div v-show="activeAccordion === 'other'" class="accordion-content p-4">
                    <div class="space-y-2">
                      <div
                        v-for="(option, index) in otherOptions"
                        :key="index"
                        class="sub-accordion border-0 rounded bg-white"
                      >
                        <div class="sub-accordion-header p-0">
                          <button
                            type="button"
                            class="sub-accordion-btn w-full text-left px-2 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors relative"
                            @click="toggleSubAccordion('other-' + index, option.value, option.needsLink)"
                          >
                            <div class="flex items-center flex-1">
                              <input
                                type="radio"
                                :value="option.value"
                                :checked="selectedSubject === option.value"
                                class="mr-3 align-middle"
                                @click.stop
                              />
                              <span>{{ option.label }}</span>
                            </div>
                            <SfIconExpandMore
                              v-if="activeSubAccordion === 'other-' + index"
                              class="flex-shrink-0 text-sm transition-transform duration-300"
                            />
                            <SfIconChevronRight
                              v-else
                              class="flex-shrink-0 text-sm transition-transform duration-300"
                            />
                          </button>
                        </div>
                        <div
                          v-show="activeSubAccordion === 'other-' + index"
                          class="sub-accordion-content p-4 bg-gray-50"
                        >
                          <p class="text-sm text-gray-600 mb-4">
                            {{ option.description }}
                          </p>
                          <div v-if="option.needsLink" class="mb-4">
                            <label for="inputOtherLink" class="block mb-2 font-medium">{{
                              t('theme.ContactPage.fields.link')
                            }}</label>
                            <input
                              id="inputOtherLink"
                              class="contact-input w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                              name="link"
                              type="text"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <hr class="my-5 border-gray-300" />

              <div class="mb-5">
                <label for="inputTextArea" class="block mb-2 font-medium">{{
                  t('theme.ContactPage.fields.message')
                }}</label>
                <textarea
                  id="inputTextArea"
                  class="contact-input w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 h-auto"
                  name="body"
                  required
                  rows="12"
                ></textarea>
              </div>

              <hr class="my-5 border-gray-300" />

              <div class="mb-5">
                <div class="mb-3 font-bold">{{ t('theme.ContactPage.fileUpload.headline') }}</div>
                <div class="mb-4 text-sm text-gray-600">
                  {{ t('theme.ContactPage.fileUpload.description') }}
                </div>
                <div class="mt-4">
                  <div class="input-file-wrapper relative">
                    <input
                      id="inputFile"
                      ref="inputFile"
                      name="attachment"
                      type="file"
                      multiple
                      class="opacity-0 absolute top-0 left-0 w-0 h-[50px] cursor-pointer"
                      @change="handleFileChange"
                    />
                    <label
                      for="inputFile"
                      class="bg-gray-600 hover:bg-gray-700 text-white px-5 py-3 rounded cursor-pointer inline-flex items-center transition-colors"
                    >
                      {{ t('theme.ContactPage.fileUpload.selectButton') }}
                      <svg class="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z"
                        />
                      </svg>
                    </label>
                  </div>
                  <div id="preview" class="preview-container mt-4 grid grid-cols-3 gap-2 flex flex-wrap">
                    <div
                      v-for="(file, index) in selectedFiles"
                      :key="index"
                      class="preview-item relative border border-[#f7f6f9] rounded p-[5px] m-[10px]"
                    >
                      <button
                        type="button"
                        class="remove-btn absolute -top-[5px] -right-[5px] bg-transparent border-0 cursor-pointer text-[1.2em] text-red-500 w-6 h-6 flex items-center justify-center"
                        @click="removeFile(index)"
                      >
                        <SfIconClose />
                      </button>
                      <img
                        v-if="file.preview && file.type.startsWith('image/')"
                        :src="file.preview"
                        alt="Preview"
                        class="max-w-[100px] max-h-[100px] block"
                      />
                      <video
                        v-else-if="file.preview && file.type.startsWith('video/')"
                        :src="file.preview"
                        controls
                        class="max-w-[100px] max-h-[100px] block"
                      ></video>
                      <p v-else class="text-sm truncate">{{ file.name }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <hr class="my-5 border-gray-300" />

              <div class="mb-4">
                <div id="html_element" ref="recaptchaElement"></div>
              </div>

              <input name="autoreply-from" type="hidden" value="info@gonser.ch" />
              <input name="subject" type="hidden" :value="selectedSubject" />

              <div v-if="!selectedSubject" id="subjectError" class="mb-2 text-red-600 text-sm">
                <span>{{ t('theme.ContactPage.validation.selectReason') }}</span>
              </div>

              <button
                id="conformsubmitbtn"
                ref="submitBtn"
                type="submit"
                :disabled="!isFormValid"
                class="bg-green-600 hover:bg-green-700 w-full py-3 font-bold text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>{{ t('theme.ContactPage.submitButton') }}</span>
                <svg class="inline-block w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Locale } from '#i18n';
import { SfIconExpandLess, SfIconExpandMore, SfIconChevronRight, SfIconClose } from '@storefront-ui/vue';

defineI18nRoute({
  paths: {
    de: '/about/kontakt',
    fr: '/informations/contact',
    en: '/about/contact',
  },
});

definePageMeta({
  layout: false,
  pageType: 'static',
});

const { setPageMeta } = usePageMeta();
setPageMeta(t('theme.ContactPage.name'), 'page');

// Refs
const recaptchaElement = ref<HTMLElement | null>(null);
const submitBtn = ref<HTMLButtonElement | null>(null);
const uploadForm = ref<HTMLFormElement | null>(null);

// Accordion State
const activeAccordion = ref<string | null>(null);
const activeSubAccordion = ref<string | null>(null);

// Subject Selection
const selectedSubject = ref<string>('');

// File Upload
const inputFile = ref<HTMLInputElement | null>(null);
const selectedFiles = ref<Array<{ name: string; type: string; file: File; preview?: string }>>([]);

// reCAPTCHA State
const isRecaptchaValid = ref(false);
const recaptchaLoaded = ref(false);

// Form Validation
const isFormValid = computed(() => {
  return selectedSubject.value !== '' && isRecaptchaValid.value;
});

// Accordion Options
const orderOptions = computed(() => [
  {
    label: t('theme.ContactPage.orderOptions.payment.label'),
    value: t('theme.ContactPage.orderOptions.payment.value'),
    description: t('theme.ContactPage.orderOptions.payment.description'),
    needsOrderId: true,
  },
  {
    label: t('theme.ContactPage.orderOptions.delivery.label'),
    value: t('theme.ContactPage.orderOptions.delivery.value'),
    description: t('theme.ContactPage.orderOptions.delivery.description'),
    needsOrderId: true,
  },
  {
    label: t('theme.ContactPage.orderOptions.address.label'),
    value: t('theme.ContactPage.orderOptions.address.value'),
    description: t('theme.ContactPage.orderOptions.address.description'),
    needsOrderId: true,
  },
  {
    label: t('theme.ContactPage.orderOptions.cancel.label'),
    value: t('theme.ContactPage.orderOptions.cancel.value'),
    description: t('theme.ContactPage.orderOptions.cancel.description'),
    needsOrderId: true,
  },
  {
    label: t('theme.ContactPage.orderOptions.defect.label'),
    value: t('theme.ContactPage.orderOptions.defect.value'),
    description: t('theme.ContactPage.orderOptions.defect.description'),
    needsOrderId: true,
  },
  {
    label: t('theme.ContactPage.orderOptions.wrongDelivery.label'),
    value: t('theme.ContactPage.orderOptions.wrongDelivery.value'),
    description: t('theme.ContactPage.orderOptions.wrongDelivery.description'),
    needsOrderId: true,
  },
  {
    label: t('theme.ContactPage.orderOptions.other.label'),
    value: t('theme.ContactPage.orderOptions.other.value'),
    description: t('theme.ContactPage.orderOptions.other.description'),
    needsOrderId: true,
  },
]);

const itemOptions = computed(() => [
  {
    label: t('theme.ContactPage.itemOptions.question.label'),
    value: t('theme.ContactPage.itemOptions.question.value'),
    description: t('theme.ContactPage.itemOptions.question.description'),
    needsItemId: true,
  },
  {
    label: t('theme.ContactPage.itemOptions.delivery.label'),
    value: t('theme.ContactPage.itemOptions.delivery.value'),
    description: t('theme.ContactPage.itemOptions.delivery.description'),
    needsItemId: false,
  },
  {
    label: t('theme.ContactPage.itemOptions.availability.label'),
    value: t('theme.ContactPage.itemOptions.availability.value'),
    description: t('theme.ContactPage.itemOptions.availability.description'),
    needsItemId: false,
  },
]);

const otherOptions = computed(() => [
  {
    label: t('theme.ContactPage.otherOptions.general.label'),
    value: t('theme.ContactPage.otherOptions.general.value'),
    description: t('theme.ContactPage.otherOptions.general.description'),
    needsLink: false,
  },
  {
    label: t('theme.ContactPage.otherOptions.sponsoring.label'),
    value: t('theme.ContactPage.otherOptions.sponsoring.value'),
    description: t('theme.ContactPage.otherOptions.sponsoring.description'),
    needsLink: true,
  },
  {
    label: t('theme.ContactPage.otherOptions.reseller.label'),
    value: t('theme.ContactPage.otherOptions.reseller.value'),
    description: t('theme.ContactPage.otherOptions.reseller.description'),
    needsLink: true,
  },
  {
    label: t('theme.ContactPage.otherOptions.press.label'),
    value: t('theme.ContactPage.otherOptions.press.value'),
    description: t('theme.ContactPage.otherOptions.press.description'),
    needsLink: true,
  },
]);

// Google reCAPTCHA Functions
const onRecaptchaVerified = (response: string) => {
  if (response) {
    isRecaptchaValid.value = true;
  }
};

const onRecaptchaExpired = () => {
  isRecaptchaValid.value = false;
};

// Load Google reCAPTCHA Script
const loadRecaptchaScript = () => {
  if (import.meta.client && !recaptchaLoaded.value) {
    // Define callback functions on window object
    (window as any).onRecaptchaVerified = onRecaptchaVerified;
    (window as any).onRecaptchaExpired = onRecaptchaExpired;
    (window as any).onRecaptchaLoad = () => {
      if (recaptchaElement.value && (window as any).grecaptcha) {
        (window as any).grecaptcha.render('html_element', {
          sitekey: '6LdQC7kUAAAAAAb2t2Rwj4wI8qt5ZnMFGP3BFzEp',
          callback: 'onRecaptchaVerified',
          'expired-callback': 'onRecaptchaExpired',
        });
      }
    };

    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    recaptchaLoaded.value = true;
  }
};

// Functions
const toggleAccordion = (accordion: string) => {
  const previousAccordion = activeAccordion.value;
  activeAccordion.value = activeAccordion.value === accordion ? null : accordion;

  // Reset inputs when closing accordion
  if (previousAccordion && !activeAccordion.value) {
    resetAccordionInputs(previousAccordion);
  }
};

const resetAccordionInputs = (accordion: string) => {
  if (!uploadForm.value) return;

  const accordionElement = uploadForm.value.querySelector(`[data-accordion="${accordion}"]`);
  if (!accordionElement) return;

  // Reset radio buttons
  const radioInputs = accordionElement.querySelectorAll('input[type="radio"]');
  radioInputs.forEach((input: any) => {
    input.checked = false;
  });

  // Reset text inputs
  const textInputs = accordionElement.querySelectorAll('input[type="text"]');
  textInputs.forEach((input: any) => {
    input.value = '';
  });

  // Close sub-accordions
  activeSubAccordion.value = null;
  selectedSubject.value = '';
};

const toggleSubAccordion = (subAccordion: string, value: string, _needsExtra: boolean = false) => {
  activeSubAccordion.value = activeSubAccordion.value === subAccordion ? null : subAccordion;
  selectedSubject.value = value;
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = Array.from(target.files || []);

  if (selectedFiles.value.length + files.length > 5) {
    alert(t('theme.ContactPage.fileUpload.maxFilesError'));
    return;
  }

  files.forEach((file) => {
    const fileObj: { name: string; type: string; file: File; preview?: string } = {
      name: file.name,
      type: file.type,
      file: file,
    };

    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        fileObj.preview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }

    selectedFiles.value.push(fileObj);
  });
};

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
};

// Lifecycle
onMounted(() => {
  loadRecaptchaScript();
});
</script>

<style>
.contact-form {
  background-color: #f7f6f9;
}

.contact-form #subjectError {
  display: none;
}

.contact-form .contact-input {
  height: calc(1.33333em + 1.5rem + 12px);
  padding: 1.25rem 1rem 0.25rem 1rem;
  background-color: #ffffff;
}
</style>
