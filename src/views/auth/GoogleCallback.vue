<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-slate-50">
    <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
    <h2 class="text-xl font-bold text-slate-700">로그인 정보를 확인 중입니다...</h2>
    <p class="text-slate-500 mt-2">잠시만 기다려 주세요.</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import api from '@/axios'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

onMounted(async () => {
  const code = route.query.code
  
  if (code) {
    try {
      // 1. 백엔드와 통신하여 로그인 처리
      const res = await api.post(`/auth/callback/google?code=${code}`)
      userStore.setProfile(res.data)
      
      // 2. 세션 스토리지에서 로그인 전 페이지 경로 가져오기
      const redirectPath = sessionStorage.getItem('redirectPath')
      
      if (redirectPath) {
        // 경로가 있다면 해당 페이지로 이동 후 스토리지 비우기
        sessionStorage.removeItem('redirectPath')
        router.push(redirectPath)
      } else {
        // 저장된 경로가 없다면 홈으로 이동
        router.push('/')
      }

    } catch (err) {
      console.error("로그인 실패", err)
      alert("로그인 중 오류가 발생했습니다.")
      // 에러 발생 시에도 세션은 비워주는 것이 안전함
      sessionStorage.removeItem('redirectPath')
      router.push('/')
    }
  } else {
    // 코드가 없는 경우 예외 처리
    router.push('/')
  }
})
</script>