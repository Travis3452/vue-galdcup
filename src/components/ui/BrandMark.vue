<template>
  <svg :width="size" :height="size" viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false" class="brand-symbol">
    <path d="M13 4h15a11 11 0 0 1 11 11v8a11 11 0 0 1-11 11H17L5 42V31a11 11 0 0 1-3-8v-8A11 11 0 0 1 13 4Z" fill="var(--ui-primary)" />
    <path d="M12 15h15M12 22h9" stroke="var(--ui-on-primary)" stroke-width="3" stroke-linecap="round" />
    <path d="M29 23h8a9 9 0 0 1 9 9v5a7 7 0 0 1-7 7h-3l-6 4v-5a9 9 0 0 1-9-9v-2a9 9 0 0 1 8-9Z" fill="var(--ui-logo-secondary)" />
    <path d="M29 32h9M29 37h5" stroke="#1e40af" stroke-width="2.5" stroke-linecap="round" />
  </svg>
</template>

<script setup>
defineProps({ size: { type: [Number, String], default: 36 } })
</script>

<style scoped>
.brand-symbol { display:block; flex:0 0 auto; }
</style>
