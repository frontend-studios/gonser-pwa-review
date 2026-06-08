<template>
  <!-- Keine sichtbare Checkbox, aber automatisch akzeptiert -->
  <div class="hidden"></div>
</template>

<script setup lang="ts">
// Automatisch die Terms als akzeptiert setzen
const { setCheckboxValue } = useAgreementCheckbox('checkoutGeneralTerms');

// Beim Mount automatisch auf true setzen
onMounted(() => {
  setCheckboxValue(true);
});
</script>
