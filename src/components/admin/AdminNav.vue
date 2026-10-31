<template>
  <nav class="admin-nav" aria-label="관리자 대시보드">
    <router-link to="/admin/monitoring"><AppIcon name="monitor" :size="17" />운영 모니터링</router-link>
    <router-link to="/admin/statistics"><AppIcon name="trend" :size="17" />서비스 통계</router-link>
  </nav>
</template>
<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
</script>
<style scoped>
.admin-nav { display:flex; gap:8px; flex-wrap:wrap; padding-bottom:20px; margin-bottom:24px; border-bottom:1px solid var(--ui-border); }
a { display:inline-flex; align-items:center; gap:8px; padding:10px 14px; min-height:44px; border-radius:8px; font-size:13px; color:var(--ui-text-muted); }
a:hover { background:var(--ui-surface-muted); } a.router-link-active { color:var(--ui-primary); background:var(--ui-primary-soft); font-weight:700; }
@media(max-width:360px) { a { padding-inline:10px; gap:6px; } }
</style>
