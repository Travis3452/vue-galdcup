<template>
  <main class="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-96px)] bg-gradient-to-br from-indigo-50 via-sky-50 to-blue-100 p-4 md:p-10 font-sans">
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 md:gap-8">
      
      <aside class="w-full md:w-1/3 lg:w-1/4 shrink-0">
        <div class="bg-white rounded-2xl md:rounded-[2rem] shadow-xl p-5 md:p-8 border border-indigo-50 relative overflow-hidden flex flex-col items-center">
          
          <div class="absolute -top-16 -right-16 w-32 h-32 bg-indigo-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>
          
          <div v-if="isLoading" class="relative z-10 w-full animate-pulse">
            <div class="w-16 h-16 md:w-24 md:h-24 mx-auto bg-slate-200 rounded-full mb-3 md:mb-4"></div>
            <div class="w-24 h-6 bg-slate-200 rounded-lg mx-auto mb-2"></div>
            <div class="hidden md:flex flex-col gap-3 mt-8">
              <div v-for="i in 4" :key="i" class="w-full h-10 bg-slate-100 rounded-xl"></div>
            </div>
          </div>

          <div v-else class="relative z-10 w-full flex flex-col items-center">
            <div class="w-16 h-16 md:w-24 md:h-24 bg-indigo-100 rounded-full flex items-center justify-center text-2xl md:text-4xl mb-3 md:mb-4 shadow-inner border-4 border-white font-black">
              <span class="text-indigo-600">{{ user.nickname ? user.nickname.charAt(0) : '👤' }}</span>
            </div>
            <h2 class="text-lg md:text-2xl font-black text-slate-800 mb-0.5 break-all">{{ user.nickname || '사용자' }}</h2>
            <p class="text-[10px] md:text-sm font-bold text-slate-400 mb-6 md:mb-8 truncate max-w-full px-2">{{ user.email || '이메일 정보 없음' }}</p>

            <nav class="flex md:flex-col w-full gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
              <button 
                v-for="tab in tabList" :key="tab.id"
                v-show="tab.id !== 'approval' || user.role === 'ADMIN'"
                @click="changeTab(tab.id)"
                class="whitespace-nowrap flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl text-xs md:text-base font-bold transition-all shrink-0 border"
                :class="currentTab === tab.id 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                  : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'"
              >
                <span>{{ tab.icon }}</span>
                {{ tab.label }}
              </button>
            </nav>
          </div>
        </div>
      </aside>

      <section class="w-full md:w-2/3 lg:w-3/4">
        <div class="bg-white rounded-2xl md:rounded-[2rem] shadow-xl p-5 md:p-12 border border-indigo-50 min-h-[400px] md:min-h-[600px] flex flex-col">
          
          <h3 class="text-xl md:text-2xl font-extrabold text-slate-800 mb-6 md:mb-8 border-b-2 border-slate-100 pb-4 md:pb-6 flex items-center gap-2">
            <span :class="currentTab === 'approval' ? 'text-purple-600' : currentTab === 'withdraw' ? 'text-rose-500' : 'text-indigo-600'">
              {{ currentTabLabel }}
            </span>
          </h3>

          <div v-if="isLoading" class="flex-1 space-y-4 animate-pulse">
            <div v-for="i in 4" :key="i" class="w-full h-16 md:h-20 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl"></div>
          </div>

          <div v-else-if="['posts', 'comments'].includes(currentTab)" class="flex-1 flex flex-col">
            <div class="flex-1">
              <div v-if="items.length > 0" class="flex flex-col gap-3 md:gap-4">
                <router-link
                  v-for="item in items" :key="item.id"
                  :to="getItemLink(item)"
                  class="group flex flex-col md:flex-row justify-between items-start md:items-center px-4 py-4 md:px-6 md:py-5 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl hover:bg-white hover:border-indigo-300 transition-all"
                >
                  <div class="flex-1 w-full mb-2 md:mb-0">
                    <h4 class="text-sm md:text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition truncate pr-2">
                      {{ currentTab === 'comments' ? item.content : item.title }}
                    </h4>
                    <p class="text-[10px] md:text-sm font-medium text-slate-400 mt-1">📅 {{ formatDate(item.createdAt) }}</p>
                  </div>
                  <div v-if="currentTab === 'posts'" class="text-[10px] md:text-sm font-bold text-slate-400 bg-white px-2 py-0.5 rounded-lg border border-slate-100">
                    👀 {{ item.viewCount || 0 }}
                  </div>
                </router-link>
              </div>
              <div v-else class="py-16 md:py-24 text-center text-slate-400 font-medium italic border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-sm md:text-base">
                작성된 내역이 없습니다.
              </div>
            </div>
            
            <div v-if="totalPages > 1" class="flex justify-center gap-1.5 md:gap-2 mt-8 md:mt-10">
              <button v-for="p in totalPages" :key="p" @click="goToPage(p-1)"
                :class="['w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl font-bold transition text-xs md:text-sm shadow-sm', currentPage === p-1 ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50']">
                {{ p }}
              </button>
            </div>
          </div>

          <div v-else-if="currentTab === 'profile'" class="flex-1 space-y-6 md:space-y-8">
            <div class="bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl p-6 md:p-8">
              <h4 class="text-lg md:text-xl font-extrabold text-slate-800 mb-4 md:mb-6">닉네임 변경</h4>
              <div class="flex flex-col sm:flex-row gap-3">
                <input v-model="newNickname" placeholder="새로운 닉네임" class="flex-1 border border-slate-200 px-4 py-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800 text-sm md:text-base" />
                <button @click="changeNickname" class="bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md text-sm">변경하기</button>
              </div>
            </div>
          </div>

          <div v-else-if="currentTab === 'role'" class="flex-1 space-y-6 md:space-y-8 text-center sm:text-left">
            <div class="bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl p-6 md:p-8">
              <p class="text-sm md:text-lg font-bold text-slate-600">
                현재 등급: <span class="ml-1 md:ml-2 text-base md:text-xl px-3 py-1.5 bg-white border-2 rounded-lg md:rounded-xl shadow-sm text-indigo-600 border-indigo-100">{{ user.role || 'USER' }}</span>
              </p>
            </div>
            <div class="flex justify-center sm:justify-end">
              <button v-if="user.role !== 'ADMIN' && user.role !== 'MANAGER'" @click="requestRole" class="w-full sm:w-auto bg-emerald-500 text-white px-8 py-3.5 rounded-xl font-bold text-base md:text-lg hover:bg-emerald-600 shadow-md">매니저 권한 신청하기</button>
              <p v-else class="text-slate-400 font-bold italic text-sm">이미 상위 권한을 보유 중입니다.</p>
            </div>
          </div>

          <div v-else-if="currentTab === 'approval'" class="flex-1 space-y-4 md:space-y-6">
            <div v-if="roleRequests.length === 0" class="py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 font-bold text-sm">대기 중인 요청이 없습니다.</div>
            <div v-else class="grid gap-3 md:gap-4">
              <div v-for="req in roleRequests" :key="req.id" class="p-4 md:p-6 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors">
                <div class="flex items-center gap-3 md:gap-4 self-start sm:self-center">
                  <div class="w-10 h-10 md:w-12 md:h-12 bg-purple-600 text-white rounded-lg md:rounded-xl flex items-center justify-center font-black text-lg shadow-md">{{ (req.applicantNickname || '익').charAt(0) }}</div>
                  <div>
                    <h4 class="font-bold text-slate-800 text-base md:text-lg leading-none mb-1">{{ req.applicantNickname }}</h4>
                    <p class="text-[9px] text-purple-600 font-black tracking-widest uppercase">REQUEST</p>
                  </div>
                </div>
                <div class="flex gap-2 w-full sm:w-auto">
                  <button @click="approveRole(req.id)" class="flex-1 sm:flex-none px-5 py-2.5 bg-purple-600 text-white rounded-lg md:rounded-xl font-bold hover:bg-purple-700 text-xs md:text-sm">승인</button>
                  <button @click="denyRole(req.id)" class="flex-1 sm:flex-none px-5 py-2.5 bg-red-50 text-red-600 rounded-lg md:rounded-xl font-bold hover:bg-red-100 text-xs md:text-sm">거절</button>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="currentTab === 'withdraw'" class="flex-1 space-y-6 md:space-y-8">
            <div class="bg-rose-50 border border-rose-100 rounded-xl md:rounded-2xl p-6 md:p-8">
              <p class="text-rose-700 font-bold leading-relaxed text-xs md:text-sm">
                탈퇴 시 모든 활동 정보가 삭제되며 복구할 수 없습니다.<br />
                이메일(<span class="font-black text-slate-900 underline">{{ user.email }}</span>)을 입력해 주세요.
              </p>
            </div>
            <div class="flex flex-col gap-3 md:gap-4">
              <input v-model="confirmEmail" placeholder="이메일 확인 입력" class="w-full border border-slate-200 px-4 py-3.5 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-bold text-slate-800 text-sm md:text-base" />
              <div class="flex justify-end">
                <button @click="deleteAccount" class="w-full sm:w-auto bg-rose-500 text-white px-8 py-3.5 rounded-xl font-bold text-sm md:text-lg hover:bg-rose-600 shadow-md">회원 탈퇴하기</button>
              </div>
            </div>
          </div>

          <div v-if="errorMessage" class="mt-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl font-bold text-xs md:text-sm">{{ errorMessage }}</div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import api from '@/axios'

const store = useUserStore()
const router = useRouter()
const route = useRoute()

// --- 상수 및 탭 정보 ---
const tabList = [
  { id: 'posts', label: '게시글', icon: '📝' },
  { id: 'comments', label: '댓글', icon: '💬' },
  { id: 'profile', label: '설정', icon: '⚙️' },
  { id: 'role', label: '권한', icon: '🛡️' },
  { id: 'approval', label: '승인', icon: '⚖️' },
  { id: 'withdraw', label: '탈퇴', icon: '🚪' }
]

const currentTabLabel = computed(() => {
  const tab = tabList.find(t => t.id === currentTab.value)
  return tab ? `${tab.icon} ${tab.label}` : ''
})

// --- 상태 관리 ---
const isLoading = ref(true) 
const currentTab = ref('posts')
const items = ref([])
const roleRequests = ref([])
const currentPage = ref(0)
const totalPages = ref(1)
const user = ref({})
const newNickname = ref('')
const confirmEmail = ref('')
const errorMessage = ref('')

onMounted(async () => {
  if (route.query.tab) currentTab.value = route.query.tab
  
  isLoading.value = true
  try {
    await fetchUser()
    await handleTabData()
  } finally {
    setTimeout(() => { isLoading.value = false }, 400)
  }
})

async function changeTab(tab) {
  currentTab.value = tab
  currentPage.value = 0
  errorMessage.value = ''
  router.replace({ query: { tab, page: 0 } })
  
  isLoading.value = true
  try {
    await handleTabData()
  } finally {
    isLoading.value = false
  }
}

async function handleTabData() {
  if (['posts', 'comments'].includes(currentTab.value)) await fetchData()
  if (currentTab.value === 'approval') await fetchRoleRequests()
}

// --- API 로직 ---
async function fetchUser() {
  try {
    const res = await api.get('/users/me')
    user.value = res.data
    store.nickname = res.data.nickname
  } catch (err) { errorMessage.value = '유저 정보를 불러오지 못했습니다.' }
}

async function fetchData() {
  if (!user.value.nickname) return
  const endpoint = currentTab.value === 'posts' ? `/posts/user/${user.value.nickname}` : `/comments/user/${user.value.nickname}`
  try {
    const res = await api.get(endpoint, { params: { page: currentPage.value, size: 10 } })
    items.value = res.data.content || []
    totalPages.value = res.data.totalPages || 1
  } catch (err) { items.value = [] }
}

async function fetchRoleRequests() {
  try {
    const res = await api.get('/role-changes')
    roleRequests.value = res.data
  } catch (err) { console.error('요청 목록 로드 실패') }
}

async function approveRole(id) {
  try {
    await api.post(`/role-changes/${id}/approve`)
    alert('승인되었습니다.')
    fetchRoleRequests()
  } catch (err) { alert('승인 처리 실패') }
}

async function denyRole(id) {
  if (!confirm('거절하시겠습니까?')) return
  try {
    await api.post(`/role-changes/${id}/deny`)
    fetchRoleRequests()
  } catch (err) { alert('거절 처리 실패') }
}

async function changeNickname() {
  const name = newNickname.value.trim()
  if (!name || name.length < 2) return alert('2자 이상의 닉네임을 입력해주세요.')
  try {
    await api.put(`/users/${user.value.id}`, { nickname: name })
    alert('닉네임이 변경되었습니다.')
    await fetchUser()
    newNickname.value = ''
  } catch (err) { errorMessage.value = '이미 사용중인 닉네임이거나 변경할 수 없습니다.' }
}

async function deleteAccount() {
  if (confirmEmail.value.trim() !== user.value.email) {
    errorMessage.value = '이메일을 정확히 입력해 주세요.'
    return
  }
  if (!confirm('정말 회원 탈퇴하시겠습니까? 모든 데이터가 영구 삭제됩니다.')) return
  try {
    await api.delete(`/users/${user.value.id}`)
    alert('탈퇴가 완료되었습니다.')
    store.logout()
    router.push('/')
  } catch (err) { alert('탈퇴 실패') }
}

async function requestRole() {
  try {
    await api.post(`/role-changes`, { requestedRole: 'MANAGER' })
    alert('매니저 신청이 완료되었습니다. 관리자 승인 후 반영됩니다.')
  } catch (err) { alert('이미 신청했거나 요청 중 오류가 발생했습니다.') }
}

const getItemLink = (item) => {
  if (currentTab.value === 'comments') {
    return `/boards/${item.boardId || 1}/posts/${item.postId}`
  }
  return `/boards/${item.boardId || 1}/posts/${item.id}`
}

const formatDate = (str) => str ? new Date(str).toLocaleDateString('ko-KR') : ''

const goToPage = async (p) => { 
  currentPage.value = p
  isLoading.value = true
  await fetchData()
  isLoading.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>