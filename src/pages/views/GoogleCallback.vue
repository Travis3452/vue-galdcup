<template>
  <div class="p-6 text-sm text-gray-600">
    로그인 처리 중입니다. 잠시만 기다려주세요...
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const store = useUserStore()

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const accessToken = params.get('accessToken')
  const nickname = params.get('nickname')

  if (accessToken && nickname) {
    store.login(accessToken, nickname)
    router.push('/')
  } else {
    console.error('콜백 파라미터 누락')
    router.push('/login')
  }
})
</script>