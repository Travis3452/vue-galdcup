<template>
  <header class="relative z-50 bg-slate-300 border-b border-slate-300 shadow-sm px-6 py-4 flex justify-between items-center transition-all">
    
    <router-link to="/" class="flex items-center gap-3 group shrink-0">
      <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md group-hover:bg-indigo-500 transition transform group-hover:-translate-y-0.5">
        G
      </div>
      <span class="text-2xl font-extrabold text-slate-800 tracking-tight group-hover:text-indigo-600 transition hidden sm:block">
        Galdcup
      </span>
    </router-link>

    <div class="flex-1 max-w-lg mx-6 relative hidden md:block" ref="searchContainerRef">
      <div class="relative">
        <input 
          :value="searchQuery"
          @input="handleSearchInput"
          @focus="isSearchDropdownOpen = true"
          type="text" 
          placeholder="어떤 갈드컵을 찾으시나요?"
          class="w-full bg-white border border-slate-300 rounded-full px-6 py-2.5 text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-inner"
        />
        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold pointer-events-none">
          🔍
        </span>
      </div>

      <transition name="fade">
        <div 
          v-if="isSearchDropdownOpen && searchQuery.trim()" 
          class="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 flex flex-col"
        >
          <div v-if="isSearching" class="px-5 py-6 text-center text-indigo-500 text-sm font-bold animate-pulse flex items-center justify-center gap-2">
            <span>⏳</span> 결과를 찾는 중...
          </div>
          
          <ul v-else-if="searchResults.length > 0" class="max-h-[24rem] overflow-y-auto">
            <li v-for="board in searchResults" :key="board.id">
              <button 
                @click="goToBoard(board.id)" 
                class="w-full text-left px-5 py-4 hover:bg-indigo-50 transition border-b border-slate-100 last:border-0 flex flex-col group/item"
              >
                <span class="font-bold text-slate-800 group-hover/item:text-indigo-700 text-base truncate">{{ board.topic }}</span>
                <span class="text-xs font-medium text-slate-400 mt-1">📅 {{ formatDate(board.createdAt) }}</span>
              </button>
            </li>
          </ul>

          <div v-else class="px-5 py-8 text-center text-slate-400 text-sm font-bold bg-slate-50 italic">
            "{{ searchQuery }}"에 해당하는 갈드컵이 없습니다.
          </div>
        </div>
      </transition>
    </div>

    <nav class="flex items-center gap-3 md:gap-4 shrink-0">
      
      <template v-if="isLoggedIn">
        <div class="h-6 w-px bg-slate-400 hidden lg:block mx-1"></div>

        <div
          class="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-md transition cursor-pointer group"
          @click="goToMyPage"
        >
          <div class="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold shadow-sm group-hover:scale-105 transition-transform">
            {{ nickname ? nickname.charAt(0) : '👤' }}
          </div>
          <span class="text-slate-700 font-bold text-sm group-hover:text-indigo-600 transition hidden sm:block">
            {{ nickname }}
          </span>
        </div>

        <button
          @click="logout"
          class="px-4 py-2 bg-white text-slate-600 border border-slate-200 shadow-sm font-bold text-sm rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition"
        >
          로그아웃
        </button>
      </template>

      <template v-else>
        <button
          @click="handleLogin"
          class="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 font-bold rounded-xl shadow-md hover:bg-slate-50 hover:-translate-y-0.5 transition transform text-sm"
        >
          <span class="bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center font-black text-xs">G</span>
          Google 로그인
        </button>
      </template>
    </nav>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import api from '@/axios'

const store = useUserStore()
const router = useRouter()

const isLoggedIn = computed(() => !!store.accessToken)
const nickname = computed(() => store.nickname || '')

const searchQuery = ref('')
const searchResults = ref([])
const isSearchDropdownOpen = ref(false)
const isSearching = ref(false)
const searchContainerRef = ref(null)
let searchTimeout = null

onMounted(() => {
  store.restore()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function handleClickOutside(event) {
  if (searchContainerRef.value && !searchContainerRef.value.contains(event.target)) {
    isSearchDropdownOpen.value = false
  }
}

// ✨ 한글 입력 실시간 반응을 위해 event를 받아 직접 할당합니다.
function handleSearchInput(event) {
  searchQuery.value = event.target.value
  isSearchDropdownOpen.value = true
  
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  clearTimeout(searchTimeout)
  
  searchTimeout = setTimeout(async () => {
    try {
      const res = await api.get('/boards/search', {
        params: { page: 0, size: 7, keyword: searchQuery.value.trim() }
      })
      searchResults.value = res.data.content || []
    } catch (err) {
      console.error('검색 실패', err)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }, 300)
}

function goToBoard(boardId) {
  isSearchDropdownOpen.value = false
  searchQuery.value = '' 
  router.push(`/boards/${boardId}`)
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

async function handleLogin() {
  const success = await store.reissue()
  if (success) return
  loginWithGoogle()
}

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
    await api.delete('/auth/logout')
  } catch (err) {
    console.error('서버 로그아웃 실패:', err)
  } finally {
    store.logout()
    router.push('/')
  }
}

function goToMyPage() {
  router.push('/mypage')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>