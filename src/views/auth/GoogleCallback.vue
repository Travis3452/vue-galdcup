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
      const res = await api.post(`/auth/callback/google?code=${code}`)
      userStore.setProfile(res.data)
    } catch (err) {
      console.error("로그인 실패", err)
      alert("로그인 중 오류가 발생했습니다.")
    }
    router.push('/')
  }
})
</script>