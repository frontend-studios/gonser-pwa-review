<template>
  <SfInput :type="isPasswordVisible ? 'text' : 'password'" :minlength="minlength" :pattern="pattern">
    <template #suffix>
      <button type="button" :aria-label="t('form.passwordVisibility')" @click="isPasswordVisible = !isPasswordVisible">
        <SfIconVisibilityOff v-if="isPasswordVisible" />
        <NuxtImg
          v-else
          src="https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/PWA/PasswortEye.svg"
          alt="Toggle password visibility"
          class="w-5 h-5"
          loading="lazy"
        />
      </button>
    </template>
  </SfInput>
</template>

<script setup lang="ts">
import { SfInput, SfIconVisibilityOff } from '@storefront-ui/vue';
import type { FormPasswordProps } from '~/components/ui/Form/types';

defineProps<FormPasswordProps>();

const isPasswordVisible = ref<boolean>();
</script>
