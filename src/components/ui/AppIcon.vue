<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" class="ui-icon">
    <path v-for="(path, index) in paths[name] || paths.message" :key="index" :d="path" />
  </svg>
</template>
<script setup>
defineProps({ name: { type: String, default: 'message' }, size: { type: [Number, String], default: 20 } })
const paths = {
  sun: ['M12 3v1M12 20v1M3 12h1M20 12h1M5.6 5.6l.7.7M17.7 17.7l.7.7M5.6 18.4l.7-.7M17.7 6.3l.7-.7', 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0'],
  moon: ['M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z'],
  monitor: ['M3 4h18v12H3ZM8 21h8M12 16v5'],
  search: ['M21 21l-4.5-4.5', 'M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0'],
  plus: ['M12 5v14M5 12h14'],
  arrow: ['M5 12h14m-6-6 6 6-6 6'],
  chevron: ['m9 5 7 7-7 7'],
  down: ['m6 9 6 6 6-6'],
  close: ['m6 6 12 12M6 18 18 6'],
  user: ['M20 21v-2a7 7 0 0 0-14 0v2', 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0'],
  message: ['M21 11a8 8 0 0 1-8 8H7l-5 3V11a9.5 9.5 0 0 1 19 0Z', 'M7 9h10M7 13h6'],
  vote: ['m9 5 3-3 8 8-3 3L9 5Z', 'm4 11-2 4v6h20v-6l-2-4M2 15h20M8 11h5'],
  clock: ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0', 'M12 7v5l3 2'],
  trend: ['m3 17 6-6 4 4 8-10M15 5h6v6'],
  settings: ['M4 6h16M4 12h16M4 18h16', 'M8 4v4M16 10v4M10 16v4'],
  check: ['m5 12 4 4L19 6'],
  info: ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0', 'M12 11v6M12 7h.01'],
  document: ['M14 2H5v20h14V7l-5-5ZM14 2v6h5M8 12h8M8 16h8'],
}
</script>
<style scoped>.ui-icon { flex-shrink: 0; vertical-align: middle; }</style>
