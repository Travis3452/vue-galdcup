import { onScopeDispose, ref } from 'vue'

export function useMediaQuery(query) {
  const media = window.matchMedia(query)
  const matches = ref(media.matches)
  const update = event => { matches.value = event.matches }
  media.addEventListener('change', update)
  onScopeDispose(() => media.removeEventListener('change', update))
  return matches
}
