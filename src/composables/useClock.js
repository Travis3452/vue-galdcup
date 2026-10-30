import { onScopeDispose, ref } from 'vue'

export function useClock(interval = 1000) {
  const now = ref(Date.now())
  const timer = setInterval(() => { now.value = Date.now() }, interval)
  onScopeDispose(() => clearInterval(timer))
  return now
}
