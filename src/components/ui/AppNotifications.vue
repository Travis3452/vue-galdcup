<template>
  <aside aria-label="알림" aria-live="polite" aria-atomic="false"
    class="notification-stack">
    <div v-for="notice in notifications" :key="notice.id" :role="notice.type === 'error' ? 'alert' : 'status'"
      class="notification"
      :class="{ 'notification-error': notice.type === 'error' }">
      <p class="break-words">{{ notice.message }}</p>
      <button type="button" aria-label="알림 닫기" class="icon-button" @click="dismissNotice(notice.id)">×</button>
    </div>
  </aside>
</template>
<script setup>
import { notifications, dismissNotice } from '../../services/notifications.js'
</script>
