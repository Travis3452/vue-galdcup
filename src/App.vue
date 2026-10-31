<template>
  <div class="flex flex-col min-h-screen">
    <a class="skip-link" href="#main-content">본문으로 건너뛰기</a>
    <NavBar v-if="!$route.meta.noLayout" />

    <main id="main-content" tabindex="-1" class="flex-1 min-w-0">
      <router-view />
    </main>

    <Footer v-if="!$route.meta.noLayout" />
    <AppNotifications />
  </div>
</template>

<script setup>
import NavBar from '@/components/layout/NavBar.vue'
import Footer from '@/components/layout/Footer.vue'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, onUnmounted, watch } from 'vue'
import AppNotifications from '@/components/ui/AppNotifications.vue'
import { notify } from '@/services/notifications'
import { writeStorage } from '@/utils/storage'
import { useUserActivity } from '@/composables/useUserActivity'

useUserActivity()

const $route = useRoute()
const router = useRouter()
function sessionExpired() {
  notify('로그인 시간이 만료되었습니다. 다시 로그인해 주세요.', 'error')
  if ($route.meta.requiresAuth) {
    writeStorage('redirectPath', $route.fullPath, 'sessionStorage')
    router.replace({ path: '/', query: { login: 'required' } })
  }
}
watch(() => $route.query.login, value => {
  if (value === 'required') notify('로그인이 필요한 기능입니다. 상단의 로그인 버튼을 이용해 주세요.')
}, { immediate: true })
onMounted(() => window.addEventListener('galdcup:session-expired', sessionExpired))
onUnmounted(() => window.removeEventListener('galdcup:session-expired', sessionExpired))
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>
