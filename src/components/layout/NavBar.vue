<template>
  <header class="relative z-50 bg-slate-300 border-b border-slate-300 shadow-sm px-4 md:px-6 py-2.5 md:py-3 flex items-center gap-3 transition-all">
    
    <router-link to="/" class="shrink-0 group">
      <span class="text-xl md:text-2xl font-extrabold text-indigo-600 tracking-tighter transition-all duration-200 group-hover:-translate-y-0.5">
        Galdcup
      </span>
    </router-link>

    <div class="flex-1 relative" ref="searchContainerRef">
      <div class="relative w-full max-w-2xl mx-auto">
        <input 
          :value="searchQuery"
          @input="handleSearchInput"
          @focus="isSearchDropdownOpen = true"
          type="text" 
          placeholder="갈드컵 검색..."
          class="w-full bg-white border border-slate-300 rounded-2xl px-4 md:px-6 py-2 md:py-2.5 text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-inner"
        />
        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold pointer-events-none text-xs md:text-base">
          🔍
        </span>
      </div>

      <transition name="fade">
        <div 
          v-if="isSearchDropdownOpen && searchQuery.trim()" 
          class="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-[60] flex flex-col max-w-2xl mx-auto"
        >
          <div v-if="isSearching" class="px-5 py-6 text-center text-indigo-500 text-sm font-bold animate-pulse">
            ⏳ 검색 중...
          </div>
          <ul v-else-if="searchResults.length > 0" class="max-h-[60vh] overflow-y-auto">
            <li v-for="board in searchResults" :key="board.id">
              <button @click="goToBoard(board.id)" class="w-full text-left px-5 py-4 hover:bg-indigo-50 transition border-b border-slate-100 last:border-0 flex flex-col">
                <span class="font-bold text-slate-800 text-sm md:text-base truncate">{{ board.topic }}</span>
                <span class="text-[10px] md:text-xs font-medium text-slate-400 mt-1">📅 {{ formatDate(board.createdAt) }}</span>
              </button>
            </li>
          </ul>
          <div v-else class="px-5 py-8 text-center text-slate-400 text-sm font-bold italic bg-slate-50">
            결과가 없습니다.
          </div>
        </div>
      </transition>
    </div>

    <nav class="shrink-0 relative" ref="userMenuRef">
      <template v-if="isLoggedIn">
        <div
          @click="isUserMenuOpen = !isUserMenuOpen"
          class="flex items-center gap-2 p-1 md:px-3 md:py-1.5 bg-white border border-slate-200 rounded-full md:rounded-2xl hover:border-indigo-300 hover:shadow-md transition cursor-pointer group select-none"
        >
          <div class="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 text-white font-black shadow-sm text-sm">
            {{ nickname ? nickname.charAt(0) : '👤' }}
          </div>
          <span class="text-slate-700 font-bold text-sm hidden sm:block">
            {{ nickname }}
          </span>
          <span class="text-[10px] text-slate-400 hidden sm:block transition-transform" :class="{'rotate-180': isUserMenuOpen}">▼</span>
        </div>

        <transition name="fade">
          <div v-if="isUserMenuOpen" class="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-[70]">
            <div class="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
              <p class="text-xs text-slate-400 font-bold">내 계정</p>
              <p class="text-sm font-black text-slate-800 truncate">{{ nickname }}</p>
            </div>
            <button @click="handleMyPage" class="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition flex items-center gap-2">
              <span>👤</span> 내 정보 보기
            </button>
            <button @click="logout" class="w-full text-left px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 transition border-t border-slate-50 flex items-center gap-2">
              <span>🚪</span> 로그아웃
            </button>
          </div>
        </transition>
      </template>

      <template v-else>
        <button
          @click="handleLogin"
          class="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-white text-slate-900 font-bold rounded-xl shadow-md hover:bg-slate-50 hover:-translate-y-0.5 transition transform text-xs md:text-sm"
        >
          <span class="bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px]">G</span>
          <span class="hidden xs:block">로그인</span>
          <span class="xs:hidden">Login</span>
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

const isLoggedIn = computed(() => store.isLoggedIn)
const nickname = computed(() => store.nickname || '')

const searchQuery = ref('')
const searchResults = ref([])
const isSearchDropdownOpen = ref(false)
const isSearching = ref(false)
const isUserMenuOpen = ref(false) // ✨ 사용자 메뉴 상태

const searchContainerRef = ref(null)
const userMenuRef = ref(null) // ✨ 사용자 메뉴 ref
let searchTimeout = null

onMounted(async () => {
  await store.restore()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function handleClickOutside(event) {
  // 검색 드롭다운 닫기
  if (searchContainerRef.value && !searchContainerRef.value.contains(event.target)) {
    isSearchDropdownOpen.value = false
  }
  // 사용자 메뉴 닫기
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    isUserMenuOpen.value = false
  }
}

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
  }, 500)
}

function goToBoard(boardId) {
  isSearchDropdownOpen.value = false
  searchQuery.value = '' 
  router.push(`/boards/${boardId}`)
}

function handleMyPage() {
  isUserMenuOpen.value = false
  router.push('/mypage')
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

async function handleLogin() {
  const success = await store.reissue()
  if (success) return
  store.clearLocalData()
  loginWithGoogle()
}

function loginWithGoogle() {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account"
  })
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

async function logout() {
  isUserMenuOpen.value = false
  try {
    await api.delete('/auth/logout')
  } catch (err) {
    console.error('로그아웃 실패:', err)
  } finally {
    store.logout()
    router.push('/')
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }

/* 스크롤바 커스텀 */
ul::-webkit-scrollbar { width: 6px; }
ul::-webkit-scrollbar-track { background: transparent; }
ul::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
ul::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
</style>