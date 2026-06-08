<template>
  <form
    novalidate
    class="grid grid-cols-4 @md:grid-cols-12 gap-4"
    data-testid="billing-address-form"
    @submit.prevent="validateAndSubmitForm"
  >
    <!-- Firma Radio Buttons -->
    <div class="col-span-4 @md:col-span-12">
      <div class="flex items-center gap-6">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="billing-address-type"
            value="private"
            :checked="!hasCompany"
            class="w-4 h-4 cursor-pointer"
            @change="hasCompany = false"
          />
          <span class="select-none">{{ t('checkout.addressForm.privatePerson') }}</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="billing-address-type"
            value="company"
            :checked="hasCompany"
            class="w-4 h-4 cursor-pointer"
            data-testid="company-radio-billing"
            @change="hasCompany = true"
          />
          <span class="select-none">{{ t('form.companyLabel') }}</span>
        </label>
      </div>
    </div>

    <!-- Firmenname wenn aktiv -->
    <div v-if="hasCompany" class="col-span-4 @md:col-span-12 relative">
      <div
        class="relative"
        :class="{
          '[&>span[data-testid=input]]:![box-shadow:3px_0px_0px_0px_#20A33E80_inset] [&>span[data-testid=input]]:!border [&>span[data-testid=input]]:!border-gray-dark':
            companyName && companyName.length > 0 && !!!errors['companyName'],
          '[&>span[data-testid=input]]:![box-shadow:3px_0px_0px_0px_#D4001C80_inset] [&>span[data-testid=input]]:!border [&>span[data-testid=input]]:!border-gray-dark':
            !!errors['companyName'],
        }"
      >
        <SfInput
          id="billingCompanyName"
          v-model="companyName"
          name="companyName"
          autocomplete="organization"
          :placeholder="companyName || isFocused.companyName ? '' : `${t('form.companyLabel')}*`"
          v-bind="companyNameAttributes"
          :invalid="!!errors['companyName']"
          :aria-invalid="!!errors['companyName']"
          @focus="isFocused.companyName = true"
          @blur="isFocused.companyName = false"
        />
        <label
          for="billingCompanyName"
          class="absolute left-3 transition-all pointer-events-none bg-white px-1"
          :class="
            companyName || isFocused.companyName
              ? '-top-2.5 text-xs text-black'
              : 'top-1/2 -translate-y-1/2 text-base text-gray-500'
          "
        >
          {{ t('form.companyLabel') }}*
        </label>
        <SfIconCheck
          v-if="companyName && companyName.length > 0 && !!!errors['companyName']"
          class="w-[18px] h-[18px] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-green-600"
        />
      </div>
    </div>

    <!-- Vorname 50% -->
    <div class="col-span-2 @md:col-span-6 relative">
      <div
        class="relative"
        :class="{
          '[&>span[data-testid=input]]:![box-shadow:3px_0px_0px_0px_#20A33E80_inset] [&>span[data-testid=input]]:!border [&>span[data-testid=input]]:!border-gray-dark':
            firstName && firstName.length > 0 && !!!errors['firstName'],
          '[&>span[data-testid=input]]:![box-shadow:3px_0px_0px_0px_#D4001C80_inset] [&>span[data-testid=input]]:!border [&>span[data-testid=input]]:!border-gray-dark':
            !!errors['firstName'],
        }"
      >
        <SfInput
          id="billingFirstName"
          v-model="firstName"
          name="firstName"
          autocomplete="given-name"
          :placeholder="firstName || isFocused.firstName ? '' : `${t('form.firstNameLabel')}*`"
          v-bind="firstNameAttributes"
          :invalid="!!errors['firstName']"
          @focus="isFocused.firstName = true"
          @blur="isFocused.firstName = false"
        />
        <label
          for="billingFirstName"
          class="absolute left-3 transition-all pointer-events-none bg-white px-1"
          :class="
            firstName || isFocused.firstName
              ? '-top-2.5 text-xs text-black'
              : 'top-1/2 -translate-y-1/2 text-base text-gray-500'
          "
        >
          {{ t('form.firstNameLabel') }}*
        </label>
        <SfIconCheck
          v-if="firstName && firstName.length > 0 && !!!errors['firstName']"
          class="w-[18px] h-[18px] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-green-600"
        />
      </div>
    </div>

    <!-- Nachname 50% -->
    <div class="col-span-2 @md:col-span-6 relative">
      <div
        class="relative"
        :class="{
          '[&>span[data-testid=input]]:![box-shadow:3px_0px_0px_0px_#20A33E80_inset] [&>span[data-testid=input]]:!border [&>span[data-testid=input]]:!border-gray-dark':
            lastName && lastName.length > 0 && !!!errors['lastName'],
          '[&>span[data-testid=input]]:![box-shadow:3px_0px_0px_0px_#D4001C80_inset] [&>span[data-testid=input]]:!border [&>span[data-testid=input]]:!border-gray-dark':
            !!errors['lastName'],
        }"
      >
        <SfInput
          id="billingLastName"
          v-model="lastName"
          name="lastName"
          autocomplete="family-name"
          :placeholder="lastName || isFocused.lastName ? '' : `${t('form.lastNameLabel')}*`"
          v-bind="lastNameAttributes"
          :invalid="!!errors['lastName']"
          @focus="isFocused.lastName = true"
          @blur="isFocused.lastName = false"
        />
        <label
          for="billingLastName"
          class="absolute left-3 transition-all pointer-events-none bg-white px-1"
          :class="
            lastName || isFocused.lastName
              ? '-top-2.5 text-xs text-black'
              : 'top-1/2 -translate-y-1/2 text-base text-gray-500'
          "
        >
          {{ t('form.lastNameLabel') }}*
        </label>
        <SfIconCheck
          v-if="lastName && lastName.length > 0 && !!!errors['lastName']"
          class="w-[18px] h-[18px] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-green-600"
        />
      </div>
    </div>

    <!-- Straße (66% mobil) + Nr. (33% mobil) -->
    <!-- Straße + Nr: Mobile 75%/25%, Desktop 66%/33% -->
    <div class="col-span-4 @md:col-span-12 grid grid-cols-4 @md:grid-cols-12 gap-4">
      <!-- Straße 75% mobile, 66% desktop -->
      <div class="col-span-3 @md:col-span-8 relative">
        <div
          class="relative"
          :class="{
            '[&>span[data-testid=input]]:![box-shadow:3px_0px_0px_0px_#20A33E80_inset] [&>span[data-testid=input]]:!border [&>span[data-testid=input]]:!border-gray-dark':
              streetName && streetName.length > 0 && !!!errors['streetName'],
            '[&>span[data-testid=input]]:![box-shadow:3px_0px_0px_0px_#D4001C80_inset] [&>span[data-testid=input]]:!border [&>span[data-testid=input]]:!border-gray-dark':
              !!errors['streetName'],
          }"
        >
          <SfInput
            id="billingStreetName"
            v-model="streetName"
            name="streetName"
            autocomplete="address-line1"
            :placeholder="streetName || isFocused.streetName ? '' : `${t('form.streetNameLabel')}*`"
            v-bind="streetNameAttributes"
            :invalid="!!errors['streetName']"
            @focus="isFocused.streetName = true"
            @blur="isFocused.streetName = false"
          />
          <label
            for="billingStreetName"
            class="absolute left-3 transition-all pointer-events-none bg-white px-1"
            :class="
              streetName || isFocused.streetName
                ? '-top-2.5 text-xs text-black'
                : 'top-1/2 -translate-y-1/2 text-base text-gray-500'
            "
          >
            {{ t('checkout.streetPlaceholder') }}
          </label>
          <SfIconCheck
            v-if="streetName && streetName.length > 0 && !!!errors['streetName']"
            class="w-[18px] h-[18px] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-green-600"
          />
        </div>
      </div>

      <!-- Nr 25% mobile, 33% desktop -->
      <div class="col-span-1 @md:col-span-4 relative">
        <div
          class="relative"
          :class="{
            '[&>span[data-testid=input]]:![box-shadow:3px_0px_0px_0px_#20A33E80_inset] [&>span[data-testid=input]]:!border [&>span[data-testid=input]]:!border-gray-dark':
              apartment && apartment.length > 0 && !!!errors['apartment'],
            '[&>span[data-testid=input]]:![box-shadow:3px_0px_0px_0px_#D4001C80_inset] [&>span[data-testid=input]]:!border [&>span[data-testid=input]]:!border-gray-dark':
              !!errors['apartment'],
          }"
        >
          <SfInput
            id="billingApartment"
            v-model="apartment"
            name="streetNumber"
            autocomplete="address-line2"
            :placeholder="apartment || isFocused.apartment ? '' : 'Nr*'"
            v-bind="apartmentAttributes"
            :invalid="!!errors['apartment']"
            @focus="isFocused.apartment = true"
            @blur="isFocused.apartment = false"
          />
          <label
            for="billingApartment"
            class="absolute left-3 transition-all pointer-events-none bg-white px-1"
            :class="
              apartment || isFocused.apartment
                ? '-top-2.5 text-xs text-black'
                : 'top-1/2 -translate-y-1/2 text-base text-gray-500'
            "
          >
            Nr*
          </label>
          <SfIconCheck
            v-if="apartment && apartment.length > 0 && !!!errors['apartment']"
            class="w-[18px] h-[18px] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-green-600"
          />
        </div>
      </div>
    </div>

    <!-- PLZ + Ort: Mobile PLZ 25%/Ort 75%, Desktop PLZ 33%/Ort 33% (Teil von PLZ/Ort/Land Reihe) -->
    <div class="col-span-4 @md:col-span-8 grid grid-cols-4 @md:grid-cols-12 gap-4">
      <!-- PLZ 25% mobile, 50% von 66% = 33% desktop -->
      <div class="col-span-1 @md:col-span-6 relative">
        <div
          class="relative"
          :class="{
            '[&>span[data-testid=input]]:![box-shadow:3px_0px_0px_0px_#20A33E80_inset] [&>span[data-testid=input]]:!border [&>span[data-testid=input]]:!border-gray-dark':
              zipCode && zipCode.length > 0 && !!!errors['zipCode'],
            '[&>span[data-testid=input]]:![box-shadow:3px_0px_0px_0px_#D4001C80_inset] [&>span[data-testid=input]]:!border [&>span[data-testid=input]]:!border-gray-dark':
              !!errors['zipCode'],
          }"
        >
          <SfInput
            id="billingZipCode"
            ref="postalCodeInputRef"
            v-model="zipCode"
            name="zipCode"
            autocomplete="off"
            :placeholder="zipCode || isFocused.zipCode ? '' : 'PLZ *'"
            v-bind="zipCodeAttributes"
            :invalid="!!errors['zipCode']"
            @focus="isFocused.zipCode = true"
            @blur="isFocused.zipCode = false"
            @keydown="handlePostalCodeKeydown"
          />
          <label
            for="billingZipCode"
            class="absolute left-3 transition-all pointer-events-none bg-white px-1 z-10"
            :class="
              zipCode || isFocused.zipCode
                ? '-top-2.5 text-xs text-black'
                : 'top-1/2 -translate-y-1/2 text-base text-gray-500'
            "
          >
            PLZ *
          </label>
          <SfIconCheck
            v-if="zipCode && zipCode.length > 0 && !!!errors['zipCode']"
            class="w-[18px] h-[18px] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-green-600 z-10"
          />
        </div>

        <!-- Postal Code Autocomplete Dropdown -->
        <div
          v-if="showPostalCodeDropdown && postalCodeSuggestions.length > 0"
          class="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-dark rounded-md shadow-lg z-50 max-h-[300px] overflow-y-auto"
        >
          <button
            v-for="(suggestion, index) in postalCodeSuggestions"
            :key="`${suggestion.zip}-${suggestion.city}-${index}`"
            type="button"
            class="w-full text-left px-4 py-2.5 hover:bg-gray-light transition-colors cursor-pointer border-b border-gray last:border-b-0"
            :class="{
              'bg-gray-light': selectedSuggestionIndex === index,
            }"
            @click="selectPostalCode(suggestion)"
          >
            <div class="flex items-center justify-between">
              <span class="font-semibold text-black">{{ suggestion.zip }}</span>
              <span class="text-black ml-2">{{ suggestion.city }}</span>
              <span class="text-gray-500 text-sm ml-auto">{{ suggestion.canton }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Ort 75% mobile, 50% von 66% = 33% desktop -->
      <div class="col-span-3 @md:col-span-6 relative">
        <div
          class="relative"
          :class="{
            '[&>span[data-testid=input]]:![box-shadow:3px_0px_0px_0px_#20A33E80_inset] [&>span[data-testid=input]]:!border [&>span[data-testid=input]]:!border-gray-dark':
              city && city.length > 0 && !!!errors['city'],
            '[&>span[data-testid=input]]:![box-shadow:3px_0px_0px_0px_#D4001C80_inset] [&>span[data-testid=input]]:!border [&>span[data-testid=input]]:!border-gray-dark':
              !!errors['city'],
          }"
        >
          <SfInput
            id="billingCity"
            ref="cityInputRef"
            v-model="city"
            name="city"
            autocomplete="off"
            :placeholder="city || isFocused.city ? '' : `${t('form.cityLabel')}*`"
            v-bind="cityAttributes"
            :invalid="!!errors['city']"
            @focus="isFocused.city = true"
            @blur="isFocused.city = false"
            @keydown="handleCityKeydown"
          />
          <label
            for="billingCity"
            class="absolute left-3 transition-all pointer-events-none bg-white px-1 z-10"
            :class="
              city || isFocused.city
                ? '-top-2.5 text-xs text-black'
                : 'top-1/2 -translate-y-1/2 text-base text-gray-500'
            "
          >
            {{ t('form.cityLabel') }}*
          </label>
          <SfIconCheck
            v-if="city && city.length > 0 && !!!errors['city']"
            class="w-[18px] h-[18px] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-green-600 z-10"
          />
        </div>

        <!-- City Autocomplete Dropdown -->
        <div
          v-if="showCityDropdown && citySuggestions.length > 0"
          class="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-dark rounded-md shadow-lg z-50 max-h-[300px] overflow-y-auto"
        >
          <button
            v-for="(suggestion, index) in citySuggestions"
            :key="`${suggestion.city}-${suggestion.zip}-${index}`"
            type="button"
            class="w-full text-left px-4 py-2.5 hover:bg-gray-light transition-colors cursor-pointer border-b border-gray last:border-b-0"
            :class="{
              'bg-gray-light': selectedCitySuggestionIndex === index,
            }"
            @click="selectCity(suggestion)"
          >
            <div class="flex items-center justify-between">
              <span class="font-semibold text-black">{{ suggestion.city }}</span>
              <span class="text-black ml-2">{{ suggestion.zip }}</span>
              <span class="text-gray-500 text-sm ml-auto">{{ suggestion.canton }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Land: Mobile 100% (volle Breite, kein Telefon im Billing), Desktop 33% (in Reihe mit PLZ/Ort) -->
    <div class="col-span-4 @md:col-span-4">
      <div
        class="relative [&_select]:!appearance-none [&>span>svg]:!hidden"
        :class="{
          '[&>span]:!border [&>span]:!border-gray-dark': country && country.length > 0 && !!!errors['country'],
          '[&>span]:!border [&>span]:!border-red-600': !!errors['country'],
        }"
      >
        <SfSelect
          v-model="country"
          name="country"
          v-bind="countryAttributes"
          :placeholder="t('form.countryLabel') + '*'"
          :invalid="!!errors['country']"
          wrapper-class-name="bg-white"
          :class="{
            '!ring-1': true,
            '!ring-neutral-200': true,
          }"
          autocomplete="country-name"
        >
          <option
            v-for="(billingCountry, index) in billingCountries"
            :key="`billing-country-${index}`"
            :value="billingCountry.id.toString()"
          >
            {{ billingCountry.currLangName }}
          </option>
        </SfSelect>
        <SfIconUnfoldMore class="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
      </div>
    </div>

    <div
      v-if="!restrictedAddresses || showAddressSaveButton"
      class="col-span-4 @md:col-span-12 flex flex-col @sm:flex-row @sm:justify-end @sm:items-center"
    >
      <div v-if="showAddressSaveButton" class="flex items-center">
        <UiButton
          :data-testid="`save-address-${AddressType.Billing}`"
          :disabled="formIsLoading"
          variant="secondary"
          type="submit"
          class="hidden"
        >
          {{ t('common.actions.saveAddress') }}
        </UiButton>

        <UiButton
          v-if="hasCheckoutAddress"
          :disabled="formIsLoading || disabled"
          variant="secondary"
          class="ml-2"
          :data-testid="`close-address-${AddressType.Billing}`"
          :aria-label="t('common.navigation.closeAddressForm')"
          @click="edit"
        >
          Schließen
        </UiButton>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { type Address, AddressType, ApiError, userAddressGetters } from '@plentymarkets/shop-api';
import { SfInput, SfLink, SfSelect, SfIconCheck, SfIconUnfoldMore } from '@storefront-ui/vue';
import { ErrorMessage, useForm } from 'vee-validate';
import type { AddressFormBillingProps } from '~/components/AddressFormBilling/types';
import { object, string } from 'yup';
import { toTypedSchema } from '@vee-validate/yup';
import { useSwissPostalCodes, type PostalCodeSearchResult } from '../../composables/useSwissPostalCodes';
import { debounce } from '~/utils/debounce';

const { disabled, address, addAddress = false } = defineProps<AddressFormBillingProps>();

const { isGuest, missingGuestCheckoutEmail, backToContactInformation, loading: customerLoading } = useCustomer();
const { fetchSession } = useFetchSession();
const { shippingAsBilling } = useShippingAsBilling();
const {
  isLoading: formIsLoading,
  hasCompany,
  addressToSave,
  open: editing,
  addressToEdit,
  defaultFormValues,
  add: showNewForm,
  save: saveAddress,
  validationSchema: billingSchema,
  refreshAddressDependencies,
} = useAddressForm(AddressType.Billing);
const { invalidVAT, clearInvalidVAT, vatServerError } = useCreateAddress(AddressType.Billing);

const { addresses: billingAddresses } = useAddressStore(AddressType.Billing);
const { set: setCheckoutAddress, hasCheckoutAddress } = useCheckoutAddress(AddressType.Billing);
const { t } = useI18n();

// Regex-Pattern für lateinische Zeichen und westeuropäische Sonderzeichen
const latinCharsPattern = /^[a-zA-Z0-9\s\-\.,'äöüÄÖÜßéèêëáàâåãæçíìîïñóòôõøúùûýÿÉÈÊËÁÀÂÅÃÆÇÍÌÎÏÑÓÒÔÕØÚÙÛÝŸ]*$/;

// Eigenes Validierungsschema, um firstName und lastName immer als Pflicht zu definieren
const customBillingSchema = toTypedSchema(
  object({
    firstName: string()
      .required(t('error.requiredField'))
      .matches(latinCharsPattern, t('checkout.error.latinCharsOnly'))
      .default(''),
    lastName: string()
      .required(t('error.requiredField'))
      .matches(latinCharsPattern, t('checkout.error.latinCharsOnly'))
      .default(''),
    country: string().required(t('error.requiredField')).default(''),
    streetName: string()
      .required(t('error.requiredField'))
      .matches(latinCharsPattern, t('checkout.error.latinCharsOnly'))
      .default(''),
    apartment: string()
      .required(t('error.requiredField'))
      .matches(latinCharsPattern, t('checkout.error.latinCharsOnly'))
      .default(''),
    city: string()
      .required(t('error.requiredField'))
      .matches(latinCharsPattern, t('checkout.error.latinCharsOnly'))
      .default(''),
    zipCode: string().required(t('error.requiredField')).default(''),
    companyName: string().when([], {
      is: () => hasCompany.value,
      then: () =>
        string()
          .required(t('error.requiredField'))
          .matches(latinCharsPattern, t('checkout.error.latinCharsOnly'))
          .default(''),
      otherwise: () => string().optional().default(''),
    }),
    vatNumber: string().optional().default(''),
  }),
);

const { defineField, errors, setValues, validate, handleSubmit } = useForm({
  validationSchema: customBillingSchema,
  validateOnMount: false, // Keine Validierung beim initialen Laden
});
const { billingCountries: allBillingCountries } = useAggregatedCountries();
const billingCountries = computed(() => allBillingCountries.value.filter((country) => country.id !== 1));
const { restrictedAddresses } = useRestrictedAddress();
const { setBillingSkeleton } = useCheckout();

const [firstName, firstNameAttributes] = defineField('firstName');
const [lastName, lastNameAttributes] = defineField('lastName');
const [country, countryAttributes] = defineField('country');
const [streetName, streetNameAttributes] = defineField('streetName');
const [apartment, apartmentAttributes] = defineField('apartment');
const [city, cityAttributes] = defineField('city');
const [zipCode, zipCodeAttributes] = defineField('zipCode');
const [companyName, companyNameAttributes] = defineField('companyName');
const [vatNumber, vatNumberAttributes] = defineField('vatNumber');

// Focus-State für Floating Labels
const isFocused = ref({
  companyName: false,
  firstName: false,
  lastName: false,
  streetName: false,
  apartment: false,
  city: false,
  zipCode: false,
});

// Swiss Postal Code Autocomplete
const { loadPostalCodes, searchPostalCodes, searchCities } = useSwissPostalCodes();
const postalCodeSuggestions = ref<PostalCodeSearchResult[]>([]);
const showPostalCodeDropdown = ref(false);
const selectedSuggestionIndex = ref(-1);
const postalCodeInputRef = ref<HTMLElement | null>(null);

// City Autocomplete
const citySuggestions = ref<PostalCodeSearchResult[]>([]);
const showCityDropdown = ref(false);
const selectedCitySuggestionIndex = ref(-1);
const cityInputRef = ref<HTMLElement | null>(null);

const handlePostalCodeInput = () => {
  const query = zipCode.value as string;

  if (!query || query.length < 2) {
    postalCodeSuggestions.value = [];
    showPostalCodeDropdown.value = false;
    selectedSuggestionIndex.value = -1;
    return;
  }

  postalCodeSuggestions.value = searchPostalCodes(query, 20);
  showPostalCodeDropdown.value = postalCodeSuggestions.value.length > 0;
  selectedSuggestionIndex.value = -1;
};

const debouncedPostalCodeSearch = debounce(handlePostalCodeInput, 150);

const selectPostalCode = (suggestion: PostalCodeSearchResult) => {
  zipCode.value = suggestion.zip;
  city.value = suggestion.city;
  showPostalCodeDropdown.value = false;
  postalCodeSuggestions.value = [];
  selectedSuggestionIndex.value = -1;

  // Trigger form change für Auto-Save
  onFormChange();
};

const handlePostalCodeKeydown = (event: KeyboardEvent) => {
  if (!showPostalCodeDropdown.value || postalCodeSuggestions.value.length === 0) return;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      selectedSuggestionIndex.value = Math.min(
        selectedSuggestionIndex.value + 1,
        postalCodeSuggestions.value.length - 1,
      );
      break;
    case 'ArrowUp':
      event.preventDefault();
      selectedSuggestionIndex.value = Math.max(selectedSuggestionIndex.value - 1, -1);
      break;
    case 'Enter':
      if (selectedSuggestionIndex.value >= 0 && postalCodeSuggestions.value[selectedSuggestionIndex.value]) {
        event.preventDefault();
        selectPostalCode(postalCodeSuggestions.value[selectedSuggestionIndex.value]!);
      }
      break;
    case 'Escape':
      showPostalCodeDropdown.value = false;
      selectedSuggestionIndex.value = -1;
      break;
  }
};

const handlePostalCodeBlur = () => {
  // Verzögerung, damit Click auf Dropdown-Item funktioniert
  setTimeout(() => {
    showPostalCodeDropdown.value = false;
    selectedSuggestionIndex.value = -1;
  }, 200);
};

// City Autocomplete Handlers
const handleCityInput = () => {
  const query = city.value as string;

  if (!query || query.length < 2) {
    citySuggestions.value = [];
    showCityDropdown.value = false;
    selectedCitySuggestionIndex.value = -1;
    return;
  }

  citySuggestions.value = searchCities(query, 20);
  showCityDropdown.value = citySuggestions.value.length > 0;
  selectedCitySuggestionIndex.value = -1;
};

const debouncedCitySearch = debounce(handleCityInput, 150);

const selectCity = (suggestion: PostalCodeSearchResult) => {
  city.value = suggestion.city;
  zipCode.value = suggestion.zip;
  showCityDropdown.value = false;
  citySuggestions.value = [];
  selectedCitySuggestionIndex.value = -1;

  // Trigger form change für Auto-Save
  onFormChange();
};

const handleCityKeydown = (event: KeyboardEvent) => {
  if (!showCityDropdown.value || citySuggestions.value.length === 0) return;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      selectedCitySuggestionIndex.value = Math.min(
        selectedCitySuggestionIndex.value + 1,
        citySuggestions.value.length - 1,
      );
      break;
    case 'ArrowUp':
      event.preventDefault();
      selectedCitySuggestionIndex.value = Math.max(selectedCitySuggestionIndex.value - 1, -1);
      break;
    case 'Enter':
      if (selectedCitySuggestionIndex.value >= 0 && citySuggestions.value[selectedCitySuggestionIndex.value]) {
        event.preventDefault();
        selectCity(citySuggestions.value[selectedCitySuggestionIndex.value]!);
      }
      break;
    case 'Escape':
      showCityDropdown.value = false;
      selectedCitySuggestionIndex.value = -1;
      break;
  }
};

const handleCityBlur = () => {
  // Verzögerung, damit Click auf Dropdown-Item funktioniert
  setTimeout(() => {
    showCityDropdown.value = false;
    selectedCitySuggestionIndex.value = -1;
  }, 200);
};

const showAddressSaveButton = computed(() => editing.value || showNewForm.value);
const guestHasShippingAsBilling = computed(() => isGuest.value && shippingAsBilling.value);

if (!addAddress && address) {
  hasCompany.value = addressToSave.value?.companyName ? true : !!userAddressGetters.getCompanyName(address as Address);

  const addressSource = invalidVAT.value || vatServerError.value ? addressToSave.value : address;

  setValues({
    ...address,
    firstName: addressSource?.firstName || '',
    lastName: addressSource?.lastName || '',
    country: addressSource?.country || '',
    streetName: addressSource?.streetName || '',
    apartment: addressSource?.apartment || '',
    city: addressSource?.city || '',
    zipCode: addressSource?.zipCode || '',
    companyName: addressSource.companyName || '',
    vatNumber: '', // USt-IdNr. wird nicht mehr verwendet
  } as unknown as Record<string, string>);

  if (!hasCompany.value) {
    companyName.value = '';
  }
} else if (addAddress && isGuest.value && addressToSave.value?.firstName) {
  // Für neue Adressen als Gast: Prüfen, ob bereits Daten vorhanden sind (z.B. nach Wechsel von Kunde zu Gast)
  hasCompany.value = !!addressToSave.value?.companyName;

  setValues({
    firstName: addressToSave.value?.firstName || '',
    lastName: addressToSave.value?.lastName || '',
    country: addressToSave.value?.country || '',
    streetName: addressToSave.value?.streetName || '',
    apartment: addressToSave.value?.apartment || '',
    city: addressToSave.value?.city || '',
    zipCode: addressToSave.value?.zipCode || '',
    companyName: addressToSave.value?.companyName || '',
    vatNumber: '',
  } as unknown as Record<string, string>);
}

const setDefaultFormValues = () => {
  defaultFormValues.value = {
    firstName: firstName.value,
    lastName: lastName.value,
    country: country.value,
    streetName: streetName.value,
    apartment: apartment.value,
    city: city.value,
    zipCode: zipCode.value,
    companyName: companyName.value,
    vatNumber: vatNumber.value,
  };
};

const syncCheckoutAddress = async () => {
  await setCheckoutAddress(
    addAddress || isGuest.value
      ? (billingAddresses.value[0] as Address)
      : (userAddressGetters.getDefault(billingAddresses.value) as Address),
    !addAddress,
  );

  if (guestHasShippingAsBilling.value) shippingAsBilling.value = false;
};

let formChangeTimeOut: NodeJS.Timeout | null = null;

const onFormChange = () => {
  // Warte, bis E-Mail-Validierung abgeschlossen ist
  if (!isGuest.value || missingGuestCheckoutEmail.value || customerLoading.value) return;
  if (formChangeTimeOut) clearTimeout(formChangeTimeOut);

  formChangeTimeOut = setTimeout(async () => {
    // Nochmal prüfen vor der Validierung
    if (missingGuestCheckoutEmail.value || customerLoading.value) return;

    const formData = await validate({ mode: 'validated-only' });
    if (formData.valid) {
      validateAndSubmitForm();
    }
  }, 1000); // Reduziert auf 1 Sekunde
};

// Sofortiges Speichern beim Verlassen eines Feldes
const onFormBlur = async () => {
  if (!isGuest.value || missingGuestCheckoutEmail.value || customerLoading.value) return;
  if (formChangeTimeOut) {
    clearTimeout(formChangeTimeOut);
    formChangeTimeOut = null;
  }

  const formData = await validate({ mode: 'validated-only' });
  if (formData.valid) {
    validateAndSubmitForm();
  }
};

watch(missingGuestCheckoutEmail, () => {
  onFormChange();
});

watch(hasCompany, (newHasCompany) => {
  if (!newHasCompany) onFormChange();
});

// Schweiz als Standard-Land setzen, sobald Länder geladen sind
watch(
  billingCountries,
  (countries) => {
    if (countries && countries.length > 0 && !country.value) {
      const switzerlandCountry = countries.find(
        (c) =>
          c.id === 4 ||
          c.isoCode2 === 'CH' ||
          c.currLangName?.toLowerCase().includes('schweiz') ||
          c.currLangName?.toLowerCase().includes('switzerland'),
      );
      if (switzerlandCountry) {
        country.value = switzerlandCountry.id.toString();
      }
    }
  },
  { immediate: true },
);

// onInput- und onBlur-Handler setzen
firstNameAttributes.value.onInput = () => {
  onFormChange();
};
firstNameAttributes.value.onBlur = () => {
  onFormBlur();
};
lastNameAttributes.value.onInput = () => {
  onFormChange();
};
lastNameAttributes.value.onBlur = () => {
  onFormBlur();
};
countryAttributes.value.onInput = () => {
  onFormChange();
};
countryAttributes.value.onBlur = () => {
  onFormBlur();
};
streetNameAttributes.value.onInput = () => {
  onFormChange();
};
streetNameAttributes.value.onBlur = () => {
  onFormBlur();
};
apartmentAttributes.value.onInput = () => {
  onFormChange();
};
apartmentAttributes.value.onBlur = () => {
  onFormBlur();
};
cityAttributes.value.onInput = () => {
  debouncedCitySearch();
  onFormChange();
};
cityAttributes.value.onBlur = () => {
  handleCityBlur();
  onFormBlur();
};
zipCodeAttributes.value.onInput = () => {
  debouncedPostalCodeSearch();
  onFormChange();
};
zipCodeAttributes.value.onBlur = () => {
  handlePostalCodeBlur();
  onFormBlur();
};
companyNameAttributes.value.onInput = () => {
  onFormChange();
};
companyNameAttributes.value.onBlur = () => {
  onFormBlur();
};
vatNumberAttributes.value.onInput = () => {
  onFormChange();
};
vatNumberAttributes.value.onBlur = () => {
  onFormBlur();
};

// Load Swiss Postal Codes
loadPostalCodes();

const validateAndSubmitForm = async () => {
  const formData = await validate();

  if (formIsLoading.value) return;
  if (missingGuestCheckoutEmail.value) return backToContactInformation();

  if (formData.valid) {
    if (hasCompany.value) setDefaultFormValues();

    try {
      setBillingSkeleton(true);
      await submitForm();

      // Nach erfolgreichem Speichern Formular-Flags zurücksetzen
      if (!invalidVAT.value && !vatServerError.value) {
        editing.value = false;
        showNewForm.value = false;
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === getErrorCode('1400')) {
          await fetchSession();
          await submitForm();
          // Auch hier nach erfolgreichem Retry zurücksetzen
          if (!invalidVAT.value && !vatServerError.value) {
            editing.value = false;
            showNewForm.value = false;
          }
        }
      } else if (error instanceof ApiError) {
        useHandleError(error);
      }
    } finally {
      setBillingSkeleton(false);
      formIsLoading.value = false;
    }
  }
};

const submitForm = handleSubmit((billingAddressForm) => {
  addressToSave.value = billingAddressForm as Address;

  if (guestHasShippingAsBilling.value && !addAddress) delete addressToSave.value?.id;
  if (addAddress) addressToSave.value.primary = true;

  // USt-IdNr. wird nicht mehr verwendet, immer leeren
  addressToSave.value.vatNumber = '';

  if (!hasCompany.value) {
    addressToSave.value.companyName = '';
  }

  return saveAddress()
    .then(() => {
      if (isGuest.value) editing.value = true;
      showNewForm.value = false;
    })
    .then(() => syncCheckoutAddress())
    .then(() => refreshAddressDependencies());
});

const edit = (address: Address) => {
  if (disabled) return;
  addressToEdit.value = editing.value || showNewForm.value ? ({} as Address) : address;
  editing.value = !(editing.value || showNewForm.value);
  showNewForm.value = false;
};
</script>
<style scoped>
:deep(#zipCode) {
  min-width: auto !important;
  width: auto !important;
}
:deep(#apartment) {
  min-width: auto !important;
  width: auto !important;
}
</style>
