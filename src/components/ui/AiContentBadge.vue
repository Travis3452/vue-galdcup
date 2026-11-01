<template>
  <span v-if="source === 'AI'" class="badge badge-neutral ai-content-badge" title="AI 용병이 생성한 콘텐츠입니다.">AI 작성</span>
</template>
<script setup>
defineProps({ source: { type: String, default: 'UNKNOWN' } })
</script>
<style scoped>
.ai-content-badge { flex-shrink: 0; white-space: nowrap; font-size: 0.7rem; line-height: 1.4; }
</style>
