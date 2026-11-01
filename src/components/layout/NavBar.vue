<template>
  <header class="site-header" @keydown.esc="handleEscape">
    <div class="header-inner">
      <router-link to="/" class="brand" aria-label="갈드컵 홈">
        <BrandMark />
        <span>갈드컵<span class="brand-caption">비교와 논쟁의 커뮤니티</span></span>
      </router-link>
      <div ref="searchContainerRef" class="header-search">
        <div class="relative">
          <AppIcon name="search" class="search-icon" :size="18" />
          <input ref="searchInputRef" :value="searchQuery" @input="handleSearchInput" aria-label="갈드컵 검색" maxlength="100"
            aria-controls="board-search-results" type="search" placeholder="궁금한 주제, 갈드컵을 찾아보세요"
            class="form-control search-input" @focus="isSearchDropdownOpen = true"
            @compositionstart="handleCompositionStart" @compositionend="handleCompositionEnd" @keydown="handleSearchKeydown" />
        </div>
        <transition name="fade">
          <section v-if="isSearchDropdownOpen && searchQuery.trim()" id="board-search-results"
            class="dropdown-panel search-dropdown" aria-label="갈드컵 검색 결과">
            <div class="dropdown-heading">갈드컵 검색</div>
            <p v-if="isSearching" role="status" class="dropdown-message"><span class="state-spinner" aria-hidden="true"></span>검색 중입니다…</p>
            <div v-else-if="searchError" role="alert" class="dropdown-message">
              <p>{{ searchError }}</p><button type="button" class="ui-button ui-button-secondary" @click="searchBoards">다시 시도</button>
            </div>
            <ul v-else-if="searchResults.length > 0" class="search-results" @keydown="handleResultKeydown">
              <li v-for="board in searchResults" :key="board.id">
                <button type="button" class="search-result" @click="goToBoard(board.id)">
                  <span class="min-w-0"><span class="block font-semibold break-words">{{ board.topic }}</span><span class="search-result-meta">개설일 {{ formatDate(board.createdAt) }}</span></span>
                  <AppIcon name="chevron" :size="16" />
                </button>
              </li>
            </ul>
            <p v-else role="status" class="dropdown-message">검색 결과가 없습니다. 다른 주제로 찾아보세요.</p>
          </section>
        </transition>
      </div>
      <div class="header-controls">
      <ThemeSwitcher />
      <nav ref="userMenuRef" class="header-account" aria-label="사용자 계정">
        <template v-if="isLoggedIn">
          <button ref="accountButton" type="button" aria-label="내 계정 메뉴" :aria-expanded="isUserMenuOpen"
            aria-controls="account-menu" class="account-trigger" @click="isUserMenuOpen = !isUserMenuOpen">
            <span class="account-avatar">{{ nickname ? nickname.charAt(0) : '나' }}</span>
            <span class="account-name">{{ nickname }}</span><AppIcon name="down" :size="14" />
          </button>
          <transition name="fade">
            <div v-if="isUserMenuOpen" id="account-menu" class="dropdown-panel account-dropdown">
              <div class="dropdown-heading"><span class="block text-xs muted">내 계정</span><span class="block mt-1 font-semibold break-words">{{ nickname }}</span></div>
              <button type="button" class="account-menu-item" @click="handleMyPage"><AppIcon name="user" :size="18" />내 정보</button>
              <router-link v-if="store.isAdmin" to="/admin/monitoring" class="account-menu-item" @click="closeMenus"><AppIcon name="monitor" :size="18" />서비스 모니터링</router-link>
              <router-link v-if="store.isAdmin" to="/admin/statistics" class="account-menu-item" @click="closeMenus"><AppIcon name="trend" :size="18" />서비스 통계</router-link>
              <button type="button" class="account-menu-item account-menu-danger" :disabled="store.isLoggingOut" @click="logout">로그아웃</button>
            </div>
          </transition>
        </template>
        <button v-else type="button" class="ui-button" :disabled="isLoggingIn" @click="handleLogin">{{ isLoggingIn ? '확인 중…' : '로그인' }}</button>
      </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import BrandMark from '@/components/ui/BrandMark.vue'
import ThemeSwitcher from '@/components/ui/ThemeSwitcher.vue'
import { useUserStore } from '@/stores/user'
import { useRouter, useRoute } from 'vue-router'
import api from '@/axios'
import { useResource } from '@/composables/useResource'
import { readStorage, writeStorage, removeStorage, safeRedirectPath } from '@/utils/storage'
import { notify } from '@/services/notifications'

const store = useUserStore()
const router = useRouter()
const route = useRoute()
const isLoggedIn = computed(() => Boolean(store.accessToken))
const nickname = computed(() => store.nickname || '')
const searchQuery = ref('')
const searchResults = ref([])
const isSearchDropdownOpen = ref(false)
const isComposing = ref(false)
const isUserMenuOpen = ref(false)
const isLoggingIn = ref(false)
const searchContainerRef = ref(null)
const searchInputRef = ref(null)
const userMenuRef = ref(null)
const accountButton = ref(null)
const { loading: isSearching, error: searchError, load, reset } = useResource('검색에 실패했습니다.')
let searchTimeout

function closeMenus() {
  if (isSearchDropdownOpen.value && searchContainerRef.value?.contains(document.activeElement)
      && document.activeElement !== searchInputRef.value) searchInputRef.value?.focus()
  if (isUserMenuOpen.value && userMenuRef.value?.contains(document.activeElement)) accountButton.value?.focus()
  isUserMenuOpen.value = false
  isSearchDropdownOpen.value = false
}
function focusFirstResult() {
  if (isComposing.value) return
  isSearchDropdownOpen.value = true
  searchContainerRef.value?.querySelector('.search-result')?.focus()
}
function handleEscape(event) {
  if (event.isComposing || isComposing.value || event.keyCode === 229) return
  closeMenus()
}
function handleSearchKeydown(event) {
  if (event.isComposing || isComposing.value || event.keyCode === 229) return
  if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return
  event.preventDefault()
  if (!searchQuery.value.trim()) return
  isSearchDropdownOpen.value = true
  if (searchResults.value.length && !isSearching.value) {
    const buttons = searchContainerRef.value?.querySelectorAll('.search-result')
    const button = event.key === 'ArrowUp' ? buttons?.[buttons.length - 1] : buttons?.[0]
    button?.focus()
  } else if (event.key === 'Enter') {
    clearTimeout(searchTimeout)
    const keyword = searchQuery.value.trim()
    searchBoards().then(success => {
      if (success && isSearchDropdownOpen.value && searchQuery.value.trim() === keyword
          && document.activeElement === searchInputRef.value) focusFirstResult()
    })
  }
}
function handleResultKeydown(event) {
  if (!['ArrowDown', 'ArrowUp'].includes(event.key) || event.isComposing) return
  event.preventDefault()
  const buttons = [...searchContainerRef.value.querySelectorAll('.search-result')]
  const current = buttons.indexOf(document.activeElement)
  const next = current + (event.key === 'ArrowDown' ? 1 : -1)
  if (next < 0) searchInputRef.value?.focus()
  else buttons[Math.min(next, buttons.length - 1)]?.focus()
}
function handleClickOutside(event) {
  if (!searchContainerRef.value?.contains(event.target)) isSearchDropdownOpen.value = false
  if (!userMenuRef.value?.contains(event.target)) isUserMenuOpen.value = false
}
function scheduleSearch() {
  clearTimeout(searchTimeout)
  reset()
  searchResults.value = []
  isSearchDropdownOpen.value = true
  if (!searchQuery.value.trim()) return
  isSearching.value = true
  searchTimeout = setTimeout(searchBoards, 300)
}
function handleSearchInput(event) {
  // v-model은 조합 중인 한글의 반영을 미루므로, 자동완성에는 실제 입력값을 사용한다.
  searchQuery.value = event.target.value
}
function handleCompositionStart() {
  isComposing.value = true
}
function handleCompositionEnd(event) {
  isComposing.value = false
  searchQuery.value = event.target.value
}
function searchBoards() {
  const keyword = searchQuery.value.trim()
  if (!keyword) return Promise.resolve(false)
  // 검색은 정상 동작하던 요청과 동일하게 첫 페이지를 0으로 전달한다.
  // one-indexed 설정을 쓰는 서버에서도 0은 첫 페이지로 처리된다.
  return load(signal => api.get('/boards/search', { signal, params: { page: 0, size: 7, keyword } }), res => {
    if (searchQuery.value.trim() === keyword) searchResults.value = res.data.content || []
  })
}
function goToBoard(id) {
  clearTimeout(searchTimeout)
  reset()
  searchQuery.value = ''
  closeMenus()
  router.push(`/boards/${id}`)
}
function handleMyPage() { closeMenus(); router.push('/mypage') }
function formatDate(value) {
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toLocaleDateString('ko-KR') : ''
}
async function handleLogin() {
  if (isLoggingIn.value) return
  isLoggingIn.value = true
  try {
    if (await store.reissue()) {
      const destination = safeRedirectPath(readStorage('redirectPath', '/', 'sessionStorage'))
      removeStorage('redirectPath', 'sessionStorage')
      notify('로그인되었습니다.')
      if (destination !== route.fullPath) await router.push(destination)
      return
    }
    if (store.sessionError) { notify(store.sessionError, 'error'); return }
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI
    if (!clientId || !redirectUri) { notify('로그인 설정을 확인할 수 없습니다. 관리자에게 문의해 주세요.', 'error'); return }
    if (route.query.login !== 'required') writeStorage('redirectPath', route.fullPath, 'sessionStorage')
    const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri,
      response_type: 'code', scope: 'openid email profile', prompt: 'select_account' })
    window.location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
  } finally { isLoggingIn.value = false }
}
async function logout() {
  closeMenus()
  const success = await store.logout()
  notify(success ? '로그아웃되었습니다.' : '기기에서 로그아웃했지만 서버의 로그아웃을 확인하지 못했습니다. 연결 상태를 확인해 주세요.', success ? 'info' : 'error')
  await router.replace('/')
}
watch(() => searchQuery.value.trim(), scheduleSearch)
watch(() => route.path, closeMenus)
onMounted(() => { document.addEventListener('click', handleClickOutside); document.addEventListener('focusin', handleClickOutside) })
onUnmounted(() => {
  clearTimeout(searchTimeout)
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('focusin', handleClickOutside)
})
</script>

<style scoped>
.site-header { position: relative; z-index: 50; background:var(--ui-surface); border-bottom: 1px solid var(--ui-border); }
.header-inner { display:grid; grid-template-areas:"brand account" "search search"; grid-template-columns:minmax(0,1fr) auto; align-items:center; gap:14px 12px; max-width:var(--ui-content-width); margin:auto; padding:16px; }
.brand { grid-area: brand; display: inline-flex; align-items: center; gap: 10px; width: fit-content; min-height:44px; font-size: 20px; line-height: 1.3; font-weight: 800; letter-spacing: -.04em; color: var(--ui-text); }
.brand-caption { display: none; margin-top: 3px; color: var(--ui-text-muted); font-size: 11px; font-weight: 400; letter-spacing: 0; }
.header-search { grid-area: search; position: relative; min-width: 0; }
.search-input { min-height: 44px; padding-left: 40px; padding-right: 12px; background: var(--ui-surface-subtle); font-size: 14px; }
.search-icon { position: absolute; top: 14px; left: 13px; color: var(--ui-text-muted); pointer-events: none; }
.header-controls { grid-area:account; display:flex; align-items:center; gap:8px; min-width:0; }
.header-account { position:relative; min-width:0; }
.account-trigger { display: flex; align-items: center; gap: 8px; min-height: 44px; border: 1px solid var(--ui-control-border); background:var(--ui-surface); border-radius: 10px; padding: 4px 8px; }
.account-trigger:hover { background: var(--ui-surface-subtle); }
.account-avatar { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; background: var(--ui-primary-soft); color: var(--ui-primary); font-size: 14px; font-weight: 700; }
.account-name { display: none; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; font-weight: 600; }
.search-dropdown { position: absolute; top: calc(100% + 8px); left: 0; right: 0; overflow: hidden; }
.dropdown-heading { padding: 12px 16px; border-bottom: 1px solid var(--ui-border); font-size: 13px; color: var(--ui-text-muted); }
.dropdown-message { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 24px 16px; font-size: 14px; text-align: center; color: var(--ui-text-muted); }
.search-results { max-height: min(420px, 55dvh); overflow-y: auto; overscroll-behavior: contain; }
.search-result { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; padding: 13px 16px; text-align: left; font-size: 14px; border-bottom: 1px solid var(--ui-divider); }
.search-result:hover { background: var(--ui-primary-soft); }
.search-result-meta { display: block; margin-top: 3px; font-size: 12px; color: var(--ui-text-muted); }
.account-dropdown { position: absolute; top: calc(100% + 8px); right: 0; width: min(224px, calc(100vw - 32px)); overflow: hidden; }
.account-menu-item { display: flex; align-items: center; gap: 10px; width: 100%; min-height: 48px; padding: 12px 16px; text-align: left; font-size: 14px; }
.account-menu-item:hover { background: var(--ui-surface-subtle); }
.account-menu-danger { color: var(--ui-danger); border-top: 1px solid var(--ui-border); }
.fade-enter-active, .fade-leave-active { transition: opacity .12s, transform .12s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }
@media (min-width: 768px) { .header-inner { grid-template-areas:"brand search account"; grid-template-columns:auto minmax(0,1fr) auto; padding:20px 28px; gap:28px; } .account-name { display:block; max-width:100px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; } }
@media (min-width: 1024px) { .brand-caption { display: block; } .header-search { max-width: 760px; width: 100%; justify-self: center; } }
</style>
