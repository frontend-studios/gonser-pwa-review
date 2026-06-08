<template>
  <form
    novalidate
    class="grid grid-cols-4 @md:grid-cols-12 gap-4"
    data-testid="shipping-address-form"
    @submit.prevent="validateAndSubmitForm"
  >
    <!-- Firma Radio Buttons -->
    <div class="col-span-4 @md:col-span-12">
      <div class="flex items-center gap-6">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="shipping-address-type"
            value="private"
            :checked="!hasShippingCompany"
            class="w-4 h-4 cursor-pointer"
            @change="hasShippingCompany = false"
          />
          <span class="select-none">{{ t('checkout.addressForm.privatePerson') }}</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="shipping-address-type"
            value="company"
            :checked="hasShippingCompany"
            class="w-4 h-4 cursor-pointer"
            data-testid="company-radio-shipping"
            @change="hasShippingCompany = true"
          />
          <span class="select-none">{{ t('form.companyLabel') }}</span>
        </label>
      </div>
    </div>

    <!-- Firmenname wenn aktiv -->
    <div v-if="hasShippingCompany" class="col-span-4 @md:col-span-12 relative">
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
          id="shippingCompanyName"
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
          for="shippingCompanyName"
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

    <!-- E-Mail: Mobile 100% (order-3), Desktop 50% (order-5) -->
    <div class="col-span-4 @md:col-span-6 relative order-3 @md:order-5">
      <div
        class="relative"
        :class="{
          '[&>span[data-testid=input]]:![box-shadow:3px_0px_0px_0px_#20A33E80_inset] [&>span[data-testid=input]]:!border [&>span[data-testid=input]]:!border-gray-dark':
            customerEmail && customerEmail.length > 0 && !!!errors['customerEmail'],
          '[&>span[data-testid=input]]:![box-shadow:3px_0px_0px_0px_#D4001C80_inset] [&>span[data-testid=input]]:!border [&>span[data-testid=input]]:!border-gray-dark':
            !!errors['customerEmail'],
        }"
      >
        <SfInput
          id="customerEmail"
          v-model="customerEmail"
          name="customerEmail"
          type="email"
          autocomplete="email"
          :placeholder="customerEmail || isFocused.customerEmail ? '' : `${t('contact.info.email')}*`"
          v-bind="customerEmailAttributes"
          :invalid="!!errors['customerEmail']"
          @focus="isFocused.customerEmail = true"
          @blur="
            isFocused.customerEmail = false;
            isTouched.customerEmail = true;
          "
        />
        <label
          for="customerEmail"
          class="absolute left-3 transition-all pointer-events-none bg-white px-1"
          :class="
            customerEmail || isFocused.customerEmail
              ? '-top-2.5 text-xs text-black'
              : 'top-1/2 -translate-y-1/2 text-base text-gray-500'
          "
        >
          {{ t('contact.info.email') }}*
        </label>
        <SfIconCheck
          v-if="customerEmail && customerEmail.length > 0 && !!!errors['customerEmail']"
          class="w-[18px] h-[18px] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-green-600"
        />
      </div>
    </div>

    <!-- Vorname: Mobile 50% (order-4), Desktop 50% (order-3) -->
    <div class="col-span-2 @md:col-span-6 relative order-4 @md:order-3">
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
          id="firstName"
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
          for="firstName"
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

    <!-- Nachname: Mobile 50% (order-5), Desktop 50% (order-4) -->
    <div class="col-span-2 @md:col-span-6 relative order-5 @md:order-4">
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
          id="lastName"
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
          for="lastName"
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

    <!-- Telefon: Mobile nebeneinander mit Land (order-8), Desktop neben E-Mail (order-6) -->
    <div class="col-span-2 @md:col-span-6 relative order-8 @md:order-6">
      <div
        class="relative"
        :class="{
          '[&>span[data-testid=input]]:![box-shadow:3px_0px_0px_0px_#20A33E80_inset] [&>span[data-testid=input]]:!border [&>span[data-testid=input]]:!border-gray-dark':
            phoneNumber && phoneNumber.length >= 7,
        }"
      >
        <SfInput
          id="phoneNumber"
          v-model="phoneNumber"
          name="phoneNumber"
          type="tel"
          autocomplete="tel"
          :placeholder="phoneNumber || isFocused.phoneNumber ? '' : `${t('form.phoneLabel')} (${t('form.optional')})`"
          minlength="7"
          maxlength="18"
          @input="onFormChange"
          @focus="isFocused.phoneNumber = true"
          @blur="isFocused.phoneNumber = false"
        />
        <label
          for="phoneNumber"
          class="absolute left-3 transition-all pointer-events-none bg-white px-1"
          :class="
            phoneNumber || isFocused.phoneNumber
              ? '-top-2.5 text-xs text-black'
              : 'top-1/2 -translate-y-1/2 text-base text-gray-500'
          "
        >
          {{ t('form.phoneLabel') }} ({{ t('form.optional') }})
        </label>
        <SfIconCheck
          v-if="phoneNumber && phoneNumber.length >= 7"
          class="w-[18px] h-[18px] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-green-600"
        />
      </div>
    </div>

    <!-- Straße + Nr: Mobile 75%/25% (order-6), Desktop 66%/33% (order-7) -->
    <div class="col-span-4 @md:col-span-12 order-6 @md:order-7 grid grid-cols-4 @md:grid-cols-12 gap-4">
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
            id="streetName"
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
            for="streetName"
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
            id="apartment"
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
            for="apartment"
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

    <!-- PLZ + Ort: Mobile 25%/75% in einer Zeile, Desktop 33%/33% (Teil von PLZ/Ort/Land Reihe) -->
    <div class="col-span-4 @md:col-span-8 order-7 @md:order-8 grid grid-cols-4 @md:grid-cols-12 gap-4">
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
            id="zipCode"
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
            for="zipCode"
            class="absolute left-3 transition-all pointer-events-none bg-white px-1 z-10"
            :class="
              zipCode || isFocused.zipCode
                ? '-top-2.5 text-xs text-black'
                : 'top-1/2 -translate-y-1/2 text-base text-gray-500'
            "
          >
            {{ t('checkout.plzPlaceholder') }}
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
            id="city"
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
            for="city"
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

    <!-- Land: Mobile 50% (nebeneinander mit Telefon), Desktop 33% (in Reihe mit PLZ/Ort) -->
    <div class="col-span-2 @md:col-span-4 order-8 @md:order-8">
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
            v-for="(shippingCountry, index) in shippingCountries"
            :key="`shipping-country-${index}`"
            :value="shippingCountry.id.toString()"
          >
            {{ shippingCountry.currLangName }}
          </option>
        </SfSelect>
        <SfIconUnfoldMore class="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
      </div>
    </div>

    <div
      v-if="!restrictedAddresses || showAddressSaveButton"
      class="col-span-4 @md:col-span-12 order-9 @md:order-9 flex flex-col @sm:flex-row @sm:justify-between @sm:items-center"
    >
      <label v-if="!restrictedAddresses" class="flex items-center gap-2">
        <SfCheckbox v-model="shippingAsBilling" data-testid="use-shipping-as-billing" />
        <span class="cursor-pointer select-none">{{ t('form.useAsBillingLabel') }}</span>
      </label>
    </div>
  </form>
</template>

<script setup lang="ts">
import { type Address, AddressType, ApiError, userAddressGetters } from '@plentymarkets/shop-api';
import {
  SfCheckbox,
  SfIconClose,
  SfInput,
  SfLink,
  SfSelect,
  SfLoaderCircular,
  SfIconCheck,
  SfIconUnfoldMore,
} from '@storefront-ui/vue';
import { ErrorMessage, useForm } from 'vee-validate';
import type { AddressFormShippingProps } from '~/components/AddressFormShipping/types';
import { object, string } from 'yup';
import { toTypedSchema } from '@vee-validate/yup';
import { useSwissPostalCodes, type PostalCodeSearchResult } from '../../composables/useSwissPostalCodes';
import { debounce } from '~/utils/debounce';

const { disabled, address, addAddress = false } = defineProps<AddressFormShippingProps>();

const {
  user,
  isGuest,
  missingGuestCheckoutEmail,
  backToContactInformation,
  loginAsGuest,
  validGuestEmail,
  isAuthorized,
  loading: customerLoading,
} = useCustomer();
const { fetchSession } = useFetchSession();

const { default: allShippingCountries } = useAggregatedCountries();
const shippingCountries = computed(() => allShippingCountries.value.filter((country) => country.id !== 1));
const { shippingAsBilling } = useShippingAsBilling();
const { handleCartTotalChanges } = useCartTotalChange();
const { addresses: shippingAddresses } = useAddressStore(AddressType.Shipping);
const { addresses: billingAddresses } = useAddressStore(AddressType.Billing);
const { set: setShippingAddress, hasCheckoutAddress: hasShippingAddress } = useCheckoutAddress(AddressType.Shipping);
const { set: setBillingAddress } = useCheckoutAddress(AddressType.Billing);
const { hasCheckoutAddress: hasBillingAddress } = useCheckoutAddress(AddressType.Billing);
const { addressToSave: billingAddressToSave, save: saveBillingAddress } = useAddressForm(AddressType.Billing);
const { restrictedAddresses } = useRestrictedAddress();
const { setShippingSkeleton, showBillingAddressSection } = useCheckout();
const {
  isLoading: formIsLoading,
  add: showNewForm,
  open: editing,
  addressToEdit,
  defaultFormValues,
  hasCompany: hasShippingCompany,
  addressToSave: shippingAddressToSave,
  save: saveShippingAddress,
  validationSchema: shippingSchema,
  refreshAddressDependencies,
} = useAddressForm(AddressType.Shipping);
const { invalidVAT, clearInvalidVAT, vatServerError } = useCreateAddress(AddressType.Shipping);
const { t } = useI18n();

// Regex-Pattern für lateinische Zeichen und westeuropäische Sonderzeichen
const latinCharsPattern = /^[a-zA-Z0-9\s\-\.,'äöüÄÖÜßéèêëáàâåãæçíìîïñóòôõøúùûýÿÉÈÊËÁÀÂÅÃÆÇÍÌÎÏÑÓÒÔÕØÚÙÛÝŸ]*$/;

// Eigenes Validierungsschema, das alle Felder einschließlich E-Mail enthält
const customValidationSchema = toTypedSchema(
  object({
    firstName: string()
      .required(t('error.requiredField'))
      .matches(latinCharsPattern, t('checkout.error.latinCharsOnly'))
      .default(''),
    lastName: string()
      .required(t('error.requiredField'))
      .matches(latinCharsPattern, t('checkout.error.latinCharsOnly'))
      .default(''),
    customerEmail: string()
      .trim()
      .required(t('error.email.required'))
      .test('is-valid-email', t('error.email.valid'), (mail: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(mail);
      })
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
      is: () => hasShippingCompany.value,
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
  validationSchema: customValidationSchema,
  validateOnMount: false, // Keine Validierung beim initialen Laden
});

const [firstName, firstNameAttributes] = defineField('firstName');
const [lastName, lastNameAttributes] = defineField('lastName');
const [customerEmail, customerEmailAttributes] = defineField('customerEmail');
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
  customerEmail: false,
  country: false,
  streetName: false,
  apartment: false,
  city: false,
  zipCode: false,
  phoneNumber: false,
});

// Touched-State für Validierung (nur Fehler anzeigen wenn Feld berührt wurde)
const isTouched = ref({
  companyName: false,
  firstName: false,
  lastName: false,
  customerEmail: false,
  country: false,
  streetName: false,
  apartment: false,
  city: false,
  zipCode: false,
});

// Telefon ist optional und nicht Teil des Validierungsschemas
const phoneNumber = ref('');

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

// E-Mail-Speicherung-Status
const emailIsSaved = computed(
  () =>
    validGuestEmail.value &&
    customerEmail.value?.trim()?.toLowerCase() === user.value?.guestMail?.trim().toLowerCase() &&
    customerEmail.value?.length,
);

const showAddressSaveButton = computed(() => editing.value || showNewForm.value);

let formChangeTimeOut: NodeJS.Timeout | null = null;

const onFormChange = () => {
  // Warte, bis E-Mail-Validierung abgeschlossen ist
  if (missingGuestCheckoutEmail.value || customerLoading.value) return;
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
  if (missingGuestCheckoutEmail.value || customerLoading.value) return;
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

watch(hasShippingCompany, (newHasCompany) => {
  if (!newHasCompany) onFormChange();
});

// E-Mail-Speicherlogik
const saveContactInformation = async (guestEmail: string) => {
  await loginAsGuest(guestEmail);
};

const handleGuestEmailChange = async (guestEmail: string) => {
  await loginAsGuest(guestEmail);
};

const validateAndSaveEmail = async () => {
  if (!customerEmail.value) return;

  const guestEmail = customerEmail.value as string;

  if (!user.value?.guestMail) {
    await saveContactInformation(guestEmail);
  } else if (!emailIsSaved.value) {
    await handleGuestEmailChange(guestEmail);
  }
};

// Auto-Save mit E-Mail-Validierung
watch(customerEmail, async () => {
  await validateAndSaveEmail();
  // Warte kurz, bis validGuestEmail gesetzt ist, dann triggere Auto-Save
  await nextTick();
  onFormChange();
});

watch(isAuthorized, (updatedStatus) => {
  customerEmail.value = updatedStatus ? (user.value?.email ?? '') : (user.value?.guestMail ?? '');
});

watch(isGuest, (isGuestStatus) => {
  if (isGuestStatus) {
    customerEmail.value = user.value?.guestMail ?? '';
  }
});

// Schweiz als Standard-Land setzen, sobald Länder geladen sind
watch(
  shippingCountries,
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

// Initialisierung in onMounted, um Nuxt-Kontext sicherzustellen
onMounted(() => {
  // Lade Swiss Postal Codes
  loadPostalCodes();

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
  customerEmailAttributes.value.onInput = () => {
    validateAndSaveEmail();
    onFormChange();
  };
  customerEmailAttributes.value.onBlur = () => {
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

  // Initialisierung der Formularwerte
  if (!addAddress && address) {
    hasShippingCompany.value = shippingAddressToSave.value?.companyName
      ? true
      : !!userAddressGetters.getCompanyName(address as Address);

    const addressSource = invalidVAT.value || vatServerError.value ? shippingAddressToSave.value : address;

    setValues({
      ...address,
      firstName: addressSource?.firstName || '',
      lastName: addressSource?.lastName || '',
      customerEmail: isGuest.value ? (user.value?.guestMail ?? '') : (user.value?.email ?? ''),
      country: addressSource?.country || '',
      streetName: addressSource?.streetName || '',
      apartment: addressSource?.apartment || '',
      city: addressSource?.city || '',
      zipCode: addressSource?.zipCode || '',
      companyName: addressSource.companyName || '',
      vatNumber: '', // USt-IdNr. wird nicht mehr verwendet
    } as unknown as Record<string, string>);

    phoneNumber.value = addressSource?.phoneNumber || '';

    if (!hasShippingCompany.value) {
      companyName.value = '';
    }
  } else if (addAddress && isGuest.value && shippingAddressToSave.value?.firstName) {
    // Für neue Adressen als Gast: Prüfen, ob bereits Daten vorhanden sind (z.B. nach Wechsel von Kunde zu Gast)
    hasShippingCompany.value = !!shippingAddressToSave.value?.companyName;

    setValues({
      firstName: shippingAddressToSave.value?.firstName || '',
      lastName: shippingAddressToSave.value?.lastName || '',
      customerEmail: user.value?.guestMail ?? '',
      country: shippingAddressToSave.value?.country || '',
      streetName: shippingAddressToSave.value?.streetName || '',
      apartment: shippingAddressToSave.value?.apartment || '',
      city: shippingAddressToSave.value?.city || '',
      zipCode: shippingAddressToSave.value?.zipCode || '',
      companyName: shippingAddressToSave.value?.companyName || '',
      vatNumber: '',
    } as unknown as Record<string, string>);

    phoneNumber.value = shippingAddressToSave.value?.phoneNumber || '';
  } else {
    // Für neue Adressen: E-Mail vom User laden
    customerEmail.value = isGuest.value ? (user.value?.guestMail ?? '') : (user.value?.email ?? '');
  }
});

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
    phoneNumber: phoneNumber.value,
  };
};

const handleSaveShippingAsBilling = async (shippingAddressForm: Address) => {
  if (!restrictedAddresses.value && shippingAsBilling.value) {
    billingAddressToSave.value = isGuest.value
      ? (shippingAddresses.value[0] as Address)
      : (shippingAddressForm as Address);

    if (addAddress) billingAddressToSave.value.primary = true;

    // USt-IdNr. wird nicht mehr verwendet, immer leeren
    billingAddressToSave.value.vatNumber = '';

    if (!hasShippingCompany.value) {
      billingAddressToSave.value.companyName = '';
    }

    await saveBillingAddress();
  }
};

const handleShippingPrimaryAddress = async () => {
  if (shippingAddresses.value.length > 0) {
    await setShippingAddress(
      addAddress || isGuest.value
        ? (shippingAddresses.value[0] as Address)
        : (userAddressGetters.getDefault(shippingAddresses.value) as Address),
      !addAddress,
    );

    usePrimaryAddress(AddressType.Shipping).primaryAddressId.value =
      shippingAddresses.value?.find((item) => item.primary === true)?.id || -1;
  }
};

const handleBillingPrimaryAddress = async () => {
  if (!restrictedAddresses.value && shippingAsBilling.value && billingAddresses.value.length > 0) {
    await setBillingAddress(
      addAddress || isGuest.value
        ? (billingAddresses.value[0] as Address)
        : (userAddressGetters.getDefault(billingAddresses.value) as Address),
      false,
    );

    usePrimaryAddress(AddressType.Billing).primaryAddressId.value =
      billingAddresses.value?.find((item) => item.primary === true)?.id || -1;
  }
};

const validateAndSubmitForm = async () => {
  const formData = await validate();

  if (formIsLoading.value) return;
  if (missingGuestCheckoutEmail.value) return backToContactInformation();

  if (formData.valid) {
    if (hasShippingCompany.value) setDefaultFormValues();

    try {
      setShippingSkeleton(true);
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
      setShippingSkeleton(false);
      formIsLoading.value = false;
    }
  }
};

const submitForm = handleSubmit((shippingAddressForm) => {
  // Konvertiere Formular-Daten zu Address-Typ
  const { customerEmail: _customerEmail, ...addressFields } = shippingAddressForm as any;

  shippingAddressToSave.value = {
    ...addressFields,
    phoneNumber: phoneNumber.value,
    primary: addAddress ? true : false,
  } as Address;

  // USt-IdNr. wird nicht mehr verwendet, immer leeren
  shippingAddressToSave.value.vatNumber = '';

  if (!hasShippingCompany.value) {
    shippingAddressToSave.value.companyName = '';
  }

  return saveShippingAddress()
    .then(() => {
      if (isGuest.value) edit(shippingAddressToSave.value);
    })
    .then(() => handleSaveShippingAsBilling(shippingAddressToSave.value))
    .then(() => handleShippingPrimaryAddress())
    .then(() => handleBillingPrimaryAddress())
    .then(() => refreshAddressDependencies())
    .then(() => handleCartTotalChanges());
});

const edit = (address: Address) => {
  if (disabled) return;
  addressToEdit.value = editing.value || showNewForm.value ? ({} as Address) : address;
  editing.value = !(editing.value || showNewForm.value);
  showNewForm.value = false;
};

watch(shippingAsBilling, () => {
  showBillingAddressSection.value = !shippingAsBilling.value || hasBillingAddress.value;
});
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
