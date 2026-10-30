import { onScopeDispose, ref } from 'vue'
import { createRequestGuard, getErrorMessage, isCanceled } from '../utils/request.js'

export function useResource(fallback) {
  const loading = ref(false)
  const error = ref('')
  const guard = createRequestGuard()
  async function load(fetcher, commit) {
    const request = guard.start()
    loading.value = true
    error.value = ''
    try {
      const result = await fetcher(request.signal)
      if (!request.isCurrent()) return false
      commit(result)
      return true
    } catch (cause) {
      if (request.isCurrent() && !isCanceled(cause)) error.value = getErrorMessage(cause, fallback)
      return false
    } finally {
      if (request.isCurrent()) loading.value = false
    }
  }
  onScopeDispose(() => guard.invalidate())
  function reset() { guard.invalidate(); loading.value = false; error.value = '' }
  return { loading, error, load, reset }
}
