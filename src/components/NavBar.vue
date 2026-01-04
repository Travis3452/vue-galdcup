<template>
  <header class="bg-white shadow-md p-6 flex justify-between items-center">
    <h1 class="text-3xl font-bold text-indigo-700">Galdcup</h1>
    <nav class="space-x-6 flex items-center">
      <router-link to="/" class="text-gray-600 hover:text-indigo-600">홈</router-link>

      <template v-if="isLoggedIn">
        <div class="flex items-center space-x-4">
          <!-- 프로필 박스 -->
          <div
            class="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-1 shadow-sm hover:shadow-md transition"
          >
            <!-- 닉네임 첫 글자 아이콘 -->
            <div class="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-500 text-white font-bold">
              {{ nickname.charAt(0) }}
            </div>
            <!-- 닉네임 텍스트 (강조) -->
            <span class="text-black text-lg font-bold tracking-wide hover:text-indigo-600 transition">
              {{ nickname }}
            </span>
          </div>

          <button
            @click="logout"
            class="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 transition"
          >
            로그아웃
          </button>
        </div>
      </template>

      <template v-else>
        <button
          @click="loginWithGoogle"
          class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          Google 로그인
        </button>
      </template>
    </nav>
  </header>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import axios from '@/api'

const store = useUserStore()
const router = useRouter()

const isLoggedIn = computed(() => !!store.accessToken)
const nickname = computed(() => store.nickname || '')

onMounted(async () => {
  store.restore()

  if (!store.accessToken) {
    try {
      const res = await axios.post('/auth/refresh', {}, { withCredentials: true })
      store.login(res.data.accessToken, res.data.nickname)
    } catch {
      // refresh 실패 → 로그인 필요
    }
  }
})

function loginWithGoogle() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const redirectUri = `${import.meta.env.VITE_API_BASE_URL}/api/auth/callback/google`
  const scope = "openid email profile"

  const googleAuthUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    prompt: "select_account"
  })

  window.location.href = googleAuthUrl
}

async function logout() {
  try {
    await axios.delete('/auth/logout', {
      headers: { Authorization: `Bearer ${store.accessToken}` },
      withCredentials: true,
    })
  } catch (err) {
    console.error('서버 로그아웃 실패:', err)
  } finally {
    store.logout()
    router.push('/')
  }
}
</script>