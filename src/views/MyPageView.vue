<template>
  <main class="min-h-[calc(100vh-96px)] bg-gradient-to-br from-indigo-50 via-sky-50 to-blue-100 p-6 md:p-10 font-sans">
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      
      <aside class="w-full md:w-1/3 lg:w-1/4">
        <div class="bg-white rounded-[2rem] shadow-xl p-8 border border-indigo-50 relative overflow-hidden flex flex-col items-center text-center">
          <div class="absolute -top-20 -right-20 w-48 h-48 bg-indigo-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>
          
          <div v-if="isLoading" class="relative z-10 w-full animate-pulse">
            <div class="w-24 h-24 mx-auto bg-slate-200 rounded-full mb-4"></div>
            <div class="w-32 h-7 bg-slate-200 rounded-lg mx-auto mb-2"></div>
            <div class="w-48 h-4 bg-slate-100 rounded-full mx-auto mb-8"></div>
            <div class="space-y-3">
              <div v-for="i in 5" :key="i" class="w-full h-12 bg-slate-100 rounded-2xl"></div>
            </div>
          </div>

          <div v-else class="relative z-10 w-full">
            <div class="w-24 h-24 mx-auto bg-indigo-100 rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner border-4 border-white font-black">
              <span class="text-indigo-600">{{ user.nickname ? user.nickname.charAt(0) : '👤' }}</span>
            </div>
            <h2 class="text-2xl font-black text-slate-800 mb-1 break-all">{{ user.nickname || '사용자' }}</h2>
            <p class="text-sm font-bold text-slate-400 mb-8">{{ user.email || '이메일 정보 없음' }}</p>

            <div class="flex flex-col gap-3 w-full">
              <button @click="changeTab('posts')" class="w-full py-3.5 px-5 rounded-2xl font-bold text-base transition-all flex items-center gap-3 shadow-sm"
                :class="currentTab === 'posts' ? 'bg-indigo-600 text-white shadow-indigo-200 transform hover:-translate-y-0.5' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'">
                <span>📝</span> 내가 쓴 게시글
              </button>
              
              <button @click="changeTab('comments')" class="w-full py-3.5 px-5 rounded-2xl font-bold text-base transition-all flex items-center gap-3 shadow-sm"
                :class="currentTab === 'comments' ? 'bg-indigo-600 text-white shadow-indigo-200 transform hover:-translate-y-0.5' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'">
                <span>💬</span> 내가 쓴 댓글
              </button>

              <div class="h-px bg-slate-200 w-full my-2"></div>

              <button @click="changeTab('profile')" class="w-full py-3.5 px-5 rounded-2xl font-bold text-base transition-all flex items-center gap-3 shadow-sm"
                :class="currentTab === 'profile' ? 'bg-indigo-600 text-white shadow-indigo-200 transform hover:-translate-y-0.5' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'">
                <span>⚙️</span> 프로필 설정
              </button>
              
              <button @click="changeTab('role')" class="w-full py-3.5 px-5 rounded-2xl font-bold text-base transition-all flex items-center gap-3 shadow-sm"
                :class="currentTab === 'role' ? 'bg-indigo-600 text-white shadow-indigo-200 transform hover:-translate-y-0.5' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'">
                <span>🛡️</span> 권한 관리
              </button>

              <button v-if="user.role === 'ADMIN'" @click="changeTab('approval')" class="w-full py-3.5 px-5 rounded-2xl font-bold text-base transition-all flex items-center gap-3 shadow-sm"
                :class="currentTab === 'approval' ? 'bg-purple-600 text-white shadow-purple-200 transform hover:-translate-y-0.5' : 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-100'">
                <span>⚖️</span> 권한 승인 관리
              </button>

              <button @click="changeTab('withdraw')" class="w-full py-3.5 px-5 rounded-2xl font-bold text-base transition-all flex items-center gap-3 shadow-sm"
                :class="currentTab === 'withdraw' ? 'bg-rose-500 text-white shadow-rose-200 transform hover:-translate-y-0.5' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'">
                <span>🚪</span> 회원 탈퇴
              </button>
            </div>
          </div>
        </div>
      </aside>

      <section class="w-full md:w-2/3 lg:w-3/4">
        <div class="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 border border-indigo-50 min-h-[600px] flex flex-col">
          
          <h3 class="text-2xl font-extrabold text-slate-800 mb-8 border-b-2 border-slate-100 pb-6 flex items-center gap-2">
            <span v-if="currentTab === 'posts'" class="text-indigo-600">📝 내가 쓴 게시글</span>
            <span v-else-if="currentTab === 'comments'" class="text-indigo-600">💬 내가 쓴 댓글</span>
            <span v-else-if="currentTab === 'profile'" class="text-indigo-600">⚙️ 프로필 설정</span>
            <span v-else-if="currentTab === 'role'" class="text-indigo-600">🛡️ 권한 관리</span>
            <span v-else-if="currentTab === 'approval'" class="text-purple-600">⚖️ 권한 승인 관리</span>
            <span v-else-if="currentTab === 'withdraw'" class="text-rose-500">🚪 회원 탈퇴</span>
          </h3>

          <div v-if="isLoading" class="flex-1 space-y-4 animate-pulse">
            <div v-if="['posts', 'comments', 'approval'].includes(currentTab)" class="space-y-4">
              <div v-for="i in 5" :key="i" class="w-full h-20 bg-slate-50 border border-slate-100 rounded-2xl"></div>
            </div>
            <div v-else class="w-full h-40 bg-slate-50 rounded-2xl"></div>
          </div>

          <div v-else-if="['posts', 'comments'].includes(currentTab)" class="flex-1 flex flex-col">
            <div class="flex-1">
              <div v-if="items.length > 0" class="flex flex-col gap-4">
                <router-link
                  v-for="item in items" :key="item.id"
                  :to="getItemLink(item)"
                  class="group flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-indigo-300 hover:shadow-md transition cursor-pointer"
                >
                  <div class="flex-1 w-full mb-3 md:mb-0">
                    <h4 class="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition truncate pr-4">
                      {{ currentTab === 'comments' ? item.content : item.title }}
                    </h4>
                    <p class="text-sm font-medium text-slate-500 mt-1.5">📅 {{ formatDate(item.createdAt) }}</p>
                  </div>
                  <div v-if="currentTab === 'posts'" class="text-sm font-bold text-slate-400">👁️ {{ item.viewCount || 0 }}</div>
                </router-link>
              </div>
              <div v-else class="py-20 text-center text-slate-400 font-medium italic border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                작성된 내역이 없습니다.
              </div>
            </div>
            <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-10">
              <button v-for="p in totalPages" :key="p" @click="goToPage(p-1)"
                :class="['w-10 h-10 rounded-xl font-bold transition shadow-sm', currentPage === p-1 ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50']">
                {{ p }}
              </button>
            </div>
          </div>

          <div v-else-if="currentTab === 'profile'" class="flex-1 space-y-8">
            <div class="bg-slate-50 border border-slate-100 rounded-2xl p-8 shadow-sm">
              <h4 class="text-xl font-extrabold text-slate-800 mb-6">닉네임 변경</h4>
              <div class="flex flex-col sm:flex-row gap-4">
                <input v-model="newNickname" placeholder="새로운 닉네임" class="flex-1 border border-slate-300 px-5 py-4 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-slate-800 bg-white" />
                <button @click="changeNickname" class="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md">변경하기</button>
              </div>
            </div>
          </div>

          <div v-else-if="currentTab === 'role'" class="flex-1 space-y-8">
            <div class="bg-slate-50 border border-slate-100 rounded-2xl p-8 shadow-sm">
              <p class="text-lg font-bold text-slate-600">
                현재 등급: <span class="ml-2 text-xl px-4 py-1.5 bg-white border-2 rounded-xl shadow-sm text-indigo-600 border-indigo-100">{{ user.role || 'USER' }}</span>
              </p>
            </div>
            <div class="flex justify-end">
              <button v-if="user.role !== 'ADMIN' && user.role !== 'MANAGER'" @click="requestRole" class="bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-600 transition shadow-md transform hover:-translate-y-0.5">매니저 권한 신청하기</button>
              <p v-else class="text-slate-400 font-bold italic">이미 상위 권한을 보유 중입니다.</p>
            </div>
          </div>

          <div v-else-if="currentTab === 'approval'" class="flex-1 space-y-6">
            <div v-if="roleRequests.length === 0" class="py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 font-bold">대기 중인 요청이 없습니다.</div>
            <div v-else class="grid gap-4">
              <div v-for="req in roleRequests" :key="req.id" class="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 hover:border-purple-200 transition-colors">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-md">{{ (req.applicantNickname || '익').charAt(0) }}</div>
                  <div>
                    <h4 class="font-bold text-slate-800 text-lg">{{ req.applicantNickname }}</h4>
                    <p class="text-xs text-purple-600 font-black uppercase tracking-widest">MANAGER REQUEST</p>
                  </div>
                </div>
                <div class="flex gap-2 w-full md:w-auto">
                  <button @click="approveRole(req.id)" class="flex-1 md:flex-none px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-sm">승인</button>
                  <button @click="denyRole(req.id)" class="flex-1 md:flex-none px-6 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition">거절</button>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="currentTab === 'withdraw'" class="flex-1 space-y-8">
            <div class="bg-rose-50 border border-rose-100 rounded-2xl p-8 shadow-sm">
              <p class="text-rose-700 font-bold leading-relaxed">
                탈퇴 시 모든 활동 정보가 삭제되며 복구할 수 없습니다.<br />
                이메일(<span class="font-black text-slate-900 underline">{{ user.email }}</span>)을 아래에 똑같이 입력해 주세요.
              </p>
            </div>
            <div class="flex flex-col gap-4">
              <input v-model="confirmEmail" placeholder="이메일 입력" class="w-full border border-slate-300 px-5 py-4 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none font-bold text-slate-800" />
              <div class="flex justify-end">
                <button @click="deleteAccount" class="bg-rose-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-rose-600 transition shadow-md transform hover:-translate-y-0.5">회원 탈퇴하기</button>
              </div>
            </div>
          </div>

          <div v-if="errorMessage" class="mt-8 bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl font-bold">{{ errorMessage }}</div>
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

// --- 상태 관리 ---
const isLoading = ref(true) // ✨ 로딩 상태 추가
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
  
  isLoading.value = true // 로딩 시작
  try {
    await fetchUser()
    await handleTabData()
  } finally {
    // 자연스러운 전환을 위해 0.4초 지연
    setTimeout(() => {
      isLoading.value = false
    }, 400)
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
  if (!newNickname.value.trim()) return
  try {
    await api.put(`/users/${user.value.id}`, { nickname: newNickname.value.trim() })
    alert('닉네임이 변경되었습니다.')
    await fetchUser()
    newNickname.value = ''
  } catch (err) { errorMessage.value = '닉네임 변경 실패' }
}

async function deleteAccount() {
  if (confirmEmail.value.trim() !== user.value.email) {
    errorMessage.value = '이메일을 정확히 입력해 주세요.'
    return
  }
  if (!confirm('정말 회원 탈퇴하시겠습니까?')) return
  try {
    await api.delete(`/users/${user.value.id}`)
    alert('탈퇴 완료.')
    store.logout()
    router.push('/')
  } catch (err) { alert('탈퇴 실패') }
}

async function requestRole() {
  try {
    await api.post(`/role-changes`, { requestedRole: 'MANAGER' })
    alert('권한 신청이 접수되었습니다.')
  } catch (err) { alert('이미 신청했거나 요청 중 오류가 발생했습니다.') }
}

// --- 유틸리티 ---
const getItemLink = (item) => `/boards/${item.boardId || 1}/posts/${currentTab.value === 'comments' ? item.postId : item.id}`
const formatDate = (str) => str ? new Date(str).toLocaleDateString('ko-KR') : ''
const goToPage = async (p) => { 
  currentPage.value = p
  isLoading.value = true
  await fetchData()
  isLoading.value = false
}

const closePopup = () => {
  if (window.opener && !window.opener.closed) {
    window.close();
  } else {
    alert("브라우저 보안 설정으로 인해 창을 자동으로 닫을 수 없습니다. 탭을 직접 닫아주세요.");
    self.close();
  }
};
</script>