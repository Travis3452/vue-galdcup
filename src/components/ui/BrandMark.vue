<template>
  <img :src="logoUrl" :width="size" :height="size" alt="" aria-hidden="true" decoding="async" class="brand-symbol" />
</template>

<script setup>
defineProps({ size: { type: [Number, String], default: 40 } })
const logoUrl = import.meta.env.BASE_URL + 'images/galdcup-logo.png'
</script>

<style scoped>
.brand-symbol { display:block; flex:0 0 auto; object-fit:contain; border-radius:20%; }
</style>
