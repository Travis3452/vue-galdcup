import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import api from '@/axios'
import { createActivityReporter, isActivityPage } from '@/utils/activity'

export function useUserActivity() {
  const store = useUserStore()
  const route = useRoute()
  const router = useRouter()
  let ready = false
  let disposed = false
  const reporter = createActivityReporter(signal => api.post('/activity', null, { signal, timeout: 10000 }))
  function report() {
    if (ready && !disposed && !document.hidden && store.hasRestoredSession && store.accessToken && isActivityPage(route.path)) {
      reporter.report(store.id)
    }
  }
  function interaction(event) { if (event.isTrusted) report() }
  watch(() => store.id, () => reporter.reset())
  // Token renewal alone is not a user activity.
  watch(() => [route.path, store.id, store.isLoggedIn, store.hasRestoredSession], report)
  onMounted(async () => {
    document.addEventListener('visibilitychange', report)
    window.addEventListener('pointerdown', interaction, { passive: true })
    window.addEventListener('keydown', interaction)
    window.addEventListener('scroll', interaction, { passive: true })
    await router.isReady()
    if (!disposed) { ready = true; report() }
  })
  onBeforeUnmount(() => {
    disposed = true
    reporter.reset()
    document.removeEventListener('visibilitychange', report)
    window.removeEventListener('pointerdown', interaction)
    window.removeEventListener('keydown', interaction)
    window.removeEventListener('scroll', interaction)
  })
}
