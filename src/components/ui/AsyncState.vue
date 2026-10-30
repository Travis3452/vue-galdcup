<template>
  <div :aria-busy="loading">
    <div v-if="loading" role="status" class="state-panel">
      <span class="state-spinner" aria-hidden="true"></span>
      <p>불러오는 중입니다…</p>
    </div>
    <div v-else-if="error" role="alert" class="state-panel state-panel-error">
      <p>{{ error }}</p>
      <button type="button" class="ui-button" @click="$emit('retry')">다시 시도</button>
    </div>
    <div v-else-if="empty" role="status" class="state-panel"><p>{{ emptyMessage }}</p></div>
    <slot v-else />
  </div>
</template>

<script setup>
defineProps({ loading: Boolean, error: { type: String, default: '' }, empty: Boolean,
  emptyMessage: { type: String, default: '아직 등록된 내용이 없습니다.' } })
defineEmits(['retry'])
</script>
