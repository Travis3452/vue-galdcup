<template>
  <section class="page-container flex min-h-[60dvh] flex-col items-center justify-center gap-4 text-center">
    <div v-if="!error" role="status"><span class="state-spinner inline-block" aria-hidden="true"></span><p class="mt-4 font-bold">로그인 정보를 확인 중입니다…</p></div>
    <template v-else><h1 class="text-xl font-bold">로그인을 완료하지 못했습니다</h1><p role="alert" class="text-slate-600">{{ error }}</p><router-link to="/" class="ui-button">홈으로 이동</router-link></template>
  </section>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import api from '@/axios'
import { readStorage, removeStorage, safeRedirectPath } from '@/utils/storage'
const route = useRoute()
const router = useRouter()
const user = useUserStore()
const error = ref('')
const controller = new AbortController()
onUnmounted(() => controller.abort())
onMounted(async () => {
  const code = typeof route.query.code === 'string' ? route.query.code : ''
  // 교환 후 주소·브라우저 기록에 인가 코드를 남기지 않는다.
  window.history.replaceState(window.history.state, '', route.path)
  if (!code || route.query.error) { error.value = '로그인이 취소되었거나 유효한 인증 정보를 받지 못했습니다.'; return }
  try {
    const response = await api.post('/auth/callback/google', null, { params: { code }, signal: controller.signal })
    if (controller.signal.aborted) return
    user.setAuthData(response.data)
    const destination = safeRedirectPath(readStorage('redirectPath', '/', 'sessionStorage'))
    removeStorage('redirectPath', 'sessionStorage')
    await router.replace(destination)
  } catch {
    if (!controller.signal.aborted) error.value = '잠시 후 홈에서 로그인을 다시 시도해 주세요.'
  }
})
</script>
