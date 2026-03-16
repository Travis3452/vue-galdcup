<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-sm text-gray-600 font-medium">로그인 정보를 확인 중입니다...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  // 1. 백엔드에서 리다이렉트 시 보낸 비민감 정보들을 추출합니다.
  const { userId, nickname, role } = route.query

  // 2. 모든 정보가 존재하는지 확인합니다.
  if (userId && nickname && role) {
    // 3. 토큰은 이미 HttpOnly 쿠키에 저장되어 있으므로, 
    // 화면에 보여줄 프로필 정보만 스토어에 기록합니다.
    userStore.setProfile({
      userId: Number(userId),
      nickname: decodeURIComponent(nickname),
      role: role
    })
    
    // 4. 메인 페이지로 이동합니다.
    router.push('/')
  } else {
    // 필수 데이터가 누락된 경우 에러 처리
    console.error('인증 응답 데이터(userId, nickname, role) 누락')
    alert('로그인 처리 중 오류가 발생했습니다. 다시 시도해 주세요.')
    router.push('/login')
  }
})
</script>