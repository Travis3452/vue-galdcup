<template>
  <div ref="container" class="theme-switcher" @keydown.esc.stop.prevent="close(true)">
    <button ref="trigger" type="button" class="icon-button theme-trigger" :aria-expanded="open"
      :aria-controls="panelId" aria-haspopup="dialog" :aria-label="`화면 테마: ${currentLabel}. 테마 선택 열기`"
      :title="`화면 테마: ${currentLabel}`" @click="toggle">
      <AppIcon :name="themePreference === 'system' ? 'monitor' : resolvedTheme === 'dark' ? 'moon' : 'sun'" />
    </button>
    <div v-if="open" :id="panelId" role="dialog" aria-label="화면 테마 선택" class="dropdown-panel theme-panel">
      <fieldset>
        <legend>화면 테마</legend>
        <label v-for="option in options" :key="option.value" class="theme-option">
          <AppIcon :name="option.icon" :size="18" />
          <span>{{ option.label }}</span>
          <input type="radio" :name="panelId" :value="option.value" :checked="themePreference === option.value"
            @change="setTheme(option.value)" />
        </label>
      </fieldset>
      <p>시스템 설정은 기기의 밝기 모드를 따릅니다.</p>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, useId } from 'vue'
import AppIcon from './AppIcon.vue'
import { useTheme } from '@/composables/useTheme'

const { themePreference, resolvedTheme, setTheme } = useTheme()
const open = ref(false)
const container = ref(null)
const trigger = ref(null)
const panelId = `theme-${useId()}`
const options = [
  { value: 'light', label: '밝게', icon: 'sun' },
  { value: 'dark', label: '어둡게', icon: 'moon' },
  { value: 'system', label: '시스템', icon: 'monitor' },
]
const currentLabel = computed(() => options.find(option => option.value === themePreference.value)?.label)
async function toggle() {
  open.value = !open.value
  if (open.value) {
    await nextTick()
    container.value?.querySelector('input:checked')?.focus()
  }
}
function close(restoreFocus = false) {
  if (!open.value) return
  open.value = false
  if (restoreFocus) trigger.value?.focus()
}
function outside(event) {
  if (!container.value?.contains(event.target)) close()
}
onMounted(() => {
  document.addEventListener('pointerdown', outside)
  document.addEventListener('focusin', outside)
})
onUnmounted(() => {
  document.removeEventListener('pointerdown', outside)
  document.removeEventListener('focusin', outside)
})
</script>

<style scoped>
.theme-switcher { position:relative; flex:0 0 auto; }
.theme-trigger { border:1px solid var(--ui-border); }
.theme-panel { position:absolute; top:calc(100% + 12px); right:0; z-index:60; width:228px; padding:12px; }
.theme-panel legend { padding:4px 8px 10px; color:var(--ui-text); font-size:13px; font-weight:700; }
.theme-option { display:flex; align-items:center; gap:12px; min-height:44px; padding:10px 8px; border-radius:8px; font-size:14px; color:var(--ui-text-muted); }
.theme-option:has(input:checked) { background:var(--ui-primary-soft); color:var(--ui-primary); }
.theme-option:hover { background:var(--ui-surface-subtle); }
.theme-option input { margin-left:auto; width:16px; height:16px; accent-color:var(--ui-primary); }
.theme-panel p { margin:10px 8px 2px; font-size:12px; line-height:1.6; color:var(--ui-text-muted); }
@media(max-width:767px) { .theme-panel { position:fixed; top:72px; right:16px; max-width:calc(100vw - 32px); } }
</style>
