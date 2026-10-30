import { readonly, ref } from 'vue'
import { readStorage, writeStorage } from '@/utils/storage'

const storageKey = 'galdcup-theme'
const preference = ref('system')
const resolved = ref('light')
let media
let initialized = false

function validPreference(value) {
  return ['light', 'dark', 'system'].includes(value) ? value : 'system'
}

function apply(value) {
  preference.value = validPreference(value)
  resolved.value = preference.value === 'system' ? (media?.matches ? 'dark' : 'light') : preference.value
  document.documentElement.dataset.theme = resolved.value
  document.documentElement.style.colorScheme = resolved.value
}

export function initializeTheme() {
  if (initialized) return
  initialized = true
  media = window.matchMedia('(prefers-color-scheme: dark)')
  apply(readStorage(storageKey, 'system'))
  media.addEventListener('change', () => {
    if (preference.value === 'system') apply('system')
  })
  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) apply(readStorage(storageKey, 'system'))
  })
}

export function useTheme() {
  return {
    themePreference: readonly(preference),
    resolvedTheme: readonly(resolved),
    setTheme(value) {
      const next = validPreference(value)
      apply(next)
      writeStorage(storageKey, next)
    },
  }
}
