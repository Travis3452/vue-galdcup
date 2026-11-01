<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div><router-link to="/" class="footer-brand"><BrandMark :size="32" /><span>갈드컵</span></router-link><p class="footer-description">비교하면 갈리고, 투표하면 갈드컵.</p></div>
      <nav aria-label="서비스 정보" class="footer-links">
        <router-link to="/terms">이용약관</router-link><router-link to="/privacy">개인정보처리방침</router-link>
        <a href="mailto:your-email@example.com">의견·신고</a>
        <a href="https://github.com/travis3452/spring-galdcup" target="_blank" rel="noopener noreferrer">GitHub<span class="sr-only"> (새 탭)</span></a>
      </nav>
      <p class="footer-copyright">© 2026 Galdcup</p>
    </div>
  </footer>
</template>
<script setup>
import BrandMark from '@/components/ui/BrandMark.vue'
</script>
<style scoped>
.site-footer { margin-top: auto; border-top: 1px solid var(--ui-border); background:var(--ui-surface); }
.footer-inner { display:flex; flex-wrap:wrap; align-items:center; gap:20px 32px; max-width:var(--ui-content-width); margin-inline:auto; padding:28px 16px; }
.footer-brand { display:inline-flex; align-items:center; gap:8px; min-height:32px; color:var(--ui-secondary); font-size:16px; font-weight:750; }
.footer-description, .footer-copyright { margin-top: 4px; font-size: 12px; color: var(--ui-text-muted); }
.footer-links { display: flex; flex-wrap: wrap; gap: 0 20px; }
.footer-links a { display: inline-flex; align-items: center; min-height: 44px; font-size: 13px; color: var(--ui-text-muted); }
.footer-links a:hover { color: var(--ui-primary); text-decoration: underline; text-underline-offset: 4px; }
.footer-copyright { width: 100%; }
@media (min-width: 768px) { .footer-inner { padding: 32px 24px; } .footer-links { margin-left: auto; } .footer-copyright { width: auto; margin-top: 0; } }
</style>
