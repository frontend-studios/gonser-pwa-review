<template>
  <div v-if="!isForgotPassword">
    <div class="flex flex-col items-center justify-center my-1">
      <form class="flex flex-col gap-4 w-full" @submit.prevent="loginUser">
        <div class="relative">
          <div
            class="relative"
            :class="{
              '[&>span[data-testid=input]]:![box-shadow:3px_0px_0px_0px_#20A33E80_inset] [&>span[data-testid=input]]:!border [&>span[data-testid=input]]:!border-gray-dark':
                email && email.length > 0 && isValidEmail,
              '[&>span[data-testid=input]]:![box-shadow:3px_0px_0px_0px_#D4001C80_inset] [&>span[data-testid=input]]:!border [&>span[data-testid=input]]:!border-gray-dark':
                email && email.length > 0 && !isValidEmail,
            }"
          >
            <SfInput
              id="loginEmail"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              :placeholder="email || isFocused.email ? '' : `${t('form.emailLabel')}*`"
              required
              @focus="isFocused.email = true"
              @blur="isFocused.email = false"
            />
            <label
              for="loginEmail"
              class="absolute left-3 transition-all pointer-events-none bg-white px-1"
              :class="
                email || isFocused.email
                  ? '-top-2.5 text-xs text-gray-700'
                  : 'top-1/2 -translate-y-1/2 text-base text-gray-500'
              "
            >
              {{ t('form.emailLabel') }}*
            </label>
            <SfIconCheck
              v-if="email && email.length > 0 && isValidEmail"
              class="w-[18px] h-[18px] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-green-600"
            />
          </div>
        </div>

        <div class="relative">
          <div
            class="relative"
            :class="{
              '[&>span[data-testid=input]]:![box-shadow:3px_0px_0px_0px_#20A33E80_inset] [&>span[data-testid=input]]:!border [&>span[data-testid=input]]:!border-gray-dark':
                password && password.length > 0,
            }"
          >
            <UiFormPasswordInput
              id="loginPassword"
              v-model="password"
              name="password"
              autocomplete="current-password"
              :placeholder="password || isFocused.password ? '' : `${t('form.passwordLabel')}*`"
              required
              @focus="isFocused.password = true"
              @blur="isFocused.password = false"
            />
            <label
              for="loginPassword"
              class="absolute left-3 transition-all pointer-events-none bg-white px-1 z-10"
              :class="
                password || isFocused.password
                  ? '-top-2.5 text-xs text-gray-700'
                  : 'top-1/2 -translate-y-1/2 text-base text-gray-500'
              "
            >
              {{ t('form.passwordLabel') }}*
            </label>
            <SfIconCheck
              v-if="password && password.length > 0"
              class="w-[18px] h-[18px] absolute right-11 top-1/2 -translate-y-1/2 pointer-events-none text-green-600"
            />
          </div>
        </div>

        <div class="flex items-center justify-between gap-4 mt-2">
          <UiLink
            variant="primary"
            class="cursor-pointer whitespace-nowrap !no-underline !text-[#D4001C] font-semibold"
            @click="changeToForgotPassword"
          >
            {{ t('authentication.login.forgotPasswordLabel') }}
          </UiLink>

          <button
            type="submit"
            :disabled="loading"
            data-testid="login-submit"
            class="shrink-0 bg-gray-light px-6 p-2.5 rounded-[40px] hover:bg-gray disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SfLoaderCircular v-if="loading" class="flex justify-center items-center" size="base" />
            <span v-else>
              {{ t('authentication.login.submitLabel') }}
            </span>
          </button>
        </div>

        <div v-if="!isSoftLogin" class="text-center">
          <div class="my-5 font-bold">{{ t('authentication.login.createAccount') }}</div>
          <UiLink variant="primary" class="cursor-pointer" @click="$emit('change-view')">
            {{ t('authentication.login.createAccountLinkLabel') }}
          </UiLink>
        </div>
      </form>
    </div>
  </div>
  <div v-else>
    <ForgotPasswordComponent
      :is-soft-login="isSoftLogin"
      @change-view-login="changeToForgotPassword"
      @change-view-register="$emit('change-view')"
    />
  </div>
</template>

<script lang="ts" setup>
import { SfInput, SfLoaderCircular, SfIconCheck } from '@storefront-ui/vue';
import type { LoginProps } from './types';

const { login, loading } = useCustomer();
const { send } = useNotification();

const { isSoftLogin = false, isModal = false } = defineProps<LoginProps>();
const emits = defineEmits(['loggedIn', 'change-view', 'change-forgot-password']);

const isForgotPassword = ref(false);
const email = ref('');
const password = ref('');

// Focus-State für Floating Labels
const isFocused = ref({
  email: false,
  password: false,
});

// E-Mail-Validierung
const isValidEmail = computed(() => {
  if (!email.value) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.value);
});

const changeToForgotPassword = () => {
  isForgotPassword.value = !isForgotPassword.value;
  emits('change-forgot-password');
};

const loginUser = async () => {
  const success = await login(email.value, password.value);
  if (success) {
    send({ message: t('authentication.login.success'), type: 'positive' });
    emits('loggedIn');
  } else {
    send({ message: t('authentication.login.error'), type: 'negative' });
  }
};
</script>
