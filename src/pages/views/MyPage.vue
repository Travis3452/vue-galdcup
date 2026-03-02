<template>
  <main class="min-h-[calc(100vh-96px)] bg-gradient-to-br from-indigo-50 via-sky-50 to-blue-100 p-6 md:p-10 font-sans">
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      
      <aside class="w-full md:w-1/3 lg:w-1/4">
        <div class="bg-white rounded-[2rem] shadow-xl p-8 border border-indigo-50 relative overflow-hidden flex flex-col items-center text-center">
          <div class="absolute -top-20 -right-20 w-48 h-48 bg-indigo-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>
          
          <div class="relative z-10 w-full">
            <div class="w-24 h-24 mx-auto bg-indigo-100 rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner border-4 border-white">
              <span class="text-indigo-600">{{ user.nickname ? user.nickname.charAt(0) : '👤' }}</span>
            </div>
            <h2 class="text-2xl font-black text-slate-800 mb-1 break-all">{{ user.nickname || '사용자' }}</h2>
            <p class="text-sm font-bold text-slate-400 mb-8">{{ user.email || '이메일 정보 없음' }}</p>

            <div class="flex flex-col gap-3 w-full">
              <button @click="changeTab('posts')" class="w-full py-3.5 px-5 rounded-2xl font-bold text-base transition-all flex items-center gap-3"
                :class="currentTab === 'posts' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 transform hover:-translate-y-0.5' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'">
                <span>📝</span> 내가 쓴 게시글
              </button>
              
              <button @click="changeTab('comments')" class="w-full py-3.5 px-5 rounded-2xl font-bold text-base transition-all flex items-center gap-3"
                :class="currentTab === 'comments' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 transform hover:-translate-y-0.5' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'">
                <span>💬</span> 내가 쓴 댓글
              </button>

              <div class="h-px bg-slate-200 w-full my-2"></div>

              <button @click="changeTab('profile')" class="w-full py-3.5 px-5 rounded-2xl font-bold text-base transition-all flex items-center gap-3"
                :class="currentTab === 'profile' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 transform hover:-translate-y-0.5' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'">
                <span>⚙️</span> 프로필 설정
              </button>
              
              <button @click="changeTab('role')" class="w-full py-3.5 px-5 rounded-2xl font-bold text-base transition-all flex items-center gap-3"
                :class="currentTab === 'role' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 transform hover:-translate-y-0.5' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'">
                <span>🛡️</span> 권한 관리
              </button>

              <button @click="changeTab('withdraw')" class="w-full py-3.5 px-5 rounded-2xl font-bold text-base transition-all flex items-center gap-3"
                :class="currentTab === 'withdraw' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 transform hover:-translate-y-0.5' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'">
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
            <span v-else-if="currentTab === 'withdraw'" class="text-rose-500">🚪 회원 탈퇴</span>
          </h3>

          <div v-if="['posts', 'comments'].includes(currentTab)" class="flex-1 flex flex-col">
            <div class="flex-1">
              <div v-if="items.length > 0" class="flex flex-col gap-4">
                <router-link
                  v-for="item in items" 
                  :key="item.id"
                  :to="getItemLink(item)"
                  class="group flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-indigo-300 hover:shadow-md transition cursor-pointer"
                >
                  <div class="flex-1 w-full mb-3 md:mb-0">
                    <h4 class="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition truncate pr-4">
                      {{ currentTab === 'comments' ? item.content : item.title }}
                    </h4>
                    <div class="flex items-center gap-3 mt-1.5 text-sm font-medium text-slate-500">
                      <span>📅 {{ formatDate(item.createdAt) }}</span>
                    </div>
                  </div>
                  
                  <div v-if="currentTab === 'posts'" class="flex items-center gap-4 text-sm font-bold text-slate-400 shrink-0">
                    <div class="flex items-center gap-1.5" title="조회수">
                      <span>👁️</span> {{ item.viewCount || item.view || 0 }}
                    </div>
                  </div>
                </router-link>
              </div>
              <div v-else class="py-20 text-center text-slate-400 font-medium italic border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 flex flex-col items-center justify-center">
                <span class="text-4xl mb-4 text-slate-300">텅</span>
                <p>아직 작성된 내용이 없습니다.</p>
              </div>
            </div>

            <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-10 border-t-2 border-slate-100 pt-8">
              <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 0" class="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 disabled:opacity-40 transition shadow-sm">이전</button>
              <button v-for="page in visiblePages" :key="page" @click="goToPage(page - 1)" class="px-4 py-2 rounded-xl font-bold transition shadow-sm" :class="currentPage + 1 === page ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'">{{ page }}</button>
              <button @click="goToPage(currentPage + 1)" :disabled="currentPage >= totalPages - 1" class="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 disabled:opacity-40 transition shadow-sm">다음</button>
            </div>
          </div>

          <div v-else-if="currentTab === 'profile'" class="flex-1 space-y-8">
            <div class="flex items-center space-x-6 bg-slate-50 border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div class="w-16 h-16 flex items-center justify-center rounded-full bg-indigo-500 text-white font-black text-2xl shadow-md">
                {{ user.nickname ? user.nickname.charAt(0) : '?' }}
              </div>
              <div class="space-y-1">
                <p class="text-slate-500 font-bold">이메일: <span class="text-slate-800 ml-2">{{ user.email }}</span></p>
                <p class="text-slate-500 font-bold">닉네임: <span class="text-slate-800 ml-2">{{ user.nickname }}</span></p>
              </div>
            </div>

            <div class="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <h4 class="text-xl font-extrabold text-slate-800 mb-4">닉네임 변경</h4>
              <div class="flex flex-col sm:flex-row gap-4">
                <input
                  v-model="newNickname"
                  placeholder="새로운 닉네임을 입력하세요"
                  class="flex-1 border border-slate-300 px-5 py-4 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-lg font-medium text-slate-800 bg-slate-50"
                />
                <button
                  @click="changeNickname"
                  class="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition shadow-md whitespace-nowrap"
                >
                  변경하기
                </button>
              </div>
            </div>
          </div>

          <div v-else-if="currentTab === 'role'" class="flex-1 space-y-8">
            <div class="bg-slate-50 border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center">
              <p class="text-lg font-bold text-slate-600">
                현재 회원님의 권한은 
                <span class="ml-2 text-xl px-3 py-1 bg-white border rounded-lg shadow-sm"
                  :class="{
                    'text-blue-600 border-blue-200': user.role === 'USER',
                    'text-amber-600 border-amber-200': user.role === 'MANAGER',
                    'text-red-600 border-red-200': user.role === 'ADMIN',
                    'text-slate-500 border-slate-200': !['USER', 'MANAGER', 'ADMIN'].includes(user.role)
                  }">
                  {{ user.role || '알 수 없음' }}
                </span>
                입니다.
              </p>
            </div>

            <div class="flex justify-end mt-8">
              <button
                v-if="user.role === 'ADMIN'"
                @click="openApprovalWindow"
                class="bg-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition shadow-md transform hover:-translate-y-0.5"
              >
                요청 승인 관리창 열기
              </button>
              <button
                v-else
                @click="requestRole"
                class="bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-600 transition shadow-md transform hover:-translate-y-0.5"
              >
                매니저 권한 신청하기
              </button>
            </div>
          </div>

          <div v-else-if="currentTab === 'withdraw'" class="flex-1 space-y-8">
            <div class="bg-slate-50 border border-slate-100 rounded-2xl p-8 shadow-sm">
              <p class="text-slate-600 font-bold leading-relaxed text-base">
                탈퇴 시 작성한 게시글 및 모든 활동 정보가 삭제되며 복구할 수 없습니다.<br />
                안전한 처리를 위해 현재 계정의 이메일(<span class="font-black text-slate-800">{{ user.email }}</span>)을 아래에 정확히 입력해 주세요.
              </p>
            </div>
            
            <div class="flex flex-col gap-4">
              <input
                v-model="confirmEmail"
                placeholder="이메일 입력"
                class="w-full border border-slate-300 px-5 py-4 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 focus:outline-none text-lg font-medium text-slate-800 bg-white"
              />
              <div class="flex justify-end">
                <button
                  @click="deleteAccount"
                  class="bg-rose-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-rose-600 transition shadow-md whitespace-nowrap"
                >
                  회원 탈퇴
                </button>
              </div>
            </div>
          </div>

          <div v-if="errorMessage" class="mt-8 bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl flex items-center space-x-3">
            <span class="text-lg font-bold">{{ errorMessage }}</span>
          </div>

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
const currentTab = ref('posts') // posts, comments, profile, role, withdraw
const items = ref([])
const currentPage = ref(0)
const totalPages = ref(1)
const size = 10

// 유저 관련 상태
const user = ref({})
const newNickname = ref('')
const confirmEmail = ref('')
const errorMessage = ref('')

onMounted(async () => {
  if (route.query.tab) currentTab.value = route.query.tab
  if (route.query.page) currentPage.value = Number(route.query.page)
  
  await fetchUser() // 유저 정보는 항상 먼저 로드
  
  if (['posts', 'comments'].includes(currentTab.value)) {
    fetchData()
  }
})

// --- 리스트 (게시글/댓글) 데이터 통신 ---
function changeTab(tab) {
  currentTab.value = tab
  currentPage.value = 0
  errorMessage.value = '' // 탭 이동 시 에러 초기화
  newNickname.value = ''
  confirmEmail.value = ''
  updateQueryAndFetch()
}

async function fetchData() {
  if (!['posts', 'comments'].includes(currentTab.value)) return;
  try {
    let endpoint = currentTab.value === 'posts' ? `/posts/my` : `/comments/my`
    const res = await api.get(endpoint, {
      params: { page: currentPage.value, size },
      headers: { Authorization: `Bearer ${store.accessToken}` }
    })
    items.value = res.data.content || []
    totalPages.value = res.data.totalPages || 1
  } catch (err) {
    console.error('데이터 조회 실패:', err)
    items.value = []
    totalPages.value = 1
  }
}

// --- 유저 정보 (기존 MyPage 로직) 통신 ---
async function fetchUser() {
  try {
    const res = await api.get('/users/me', {
      headers: { Authorization: `Bearer ${store.accessToken}` }
    })
    user.value = res.data
    errorMessage.value = ''
    store.nickname = res.data.nickname
    if (res.data.nickname) {
      localStorage.setItem('nickname', res.data.nickname)
    }
  } catch (err) {
    console.error('유저 정보 불러오기 실패:', err)
    errorMessage.value = err.response?.data?.message || '유저 정보를 불러오지 못했습니다.'
  }
}

async function changeNickname() {
  if (!newNickname.value.trim()) {
    errorMessage.value = '닉네임을 입력하세요.'
    return
  }
  try {
    await api.put(`/users/${user.value.id}`, { nickname: newNickname.value.trim() }, {
      headers: { Authorization: `Bearer ${store.accessToken}` }
    })
    alert('닉네임이 변경되었습니다.')
    await fetchUser() // 변경 후 즉각 반영
    newNickname.value = ''
  } catch (err) {
    console.error('닉네임 변경 실패:', err)
    errorMessage.value = err.response?.data?.message || '닉네임 변경에 실패했습니다.'
  }
}

async function deleteAccount() {
  if (confirmEmail.value.trim() !== user.value.email) {
    errorMessage.value = '이메일을 정확히 입력해야 탈퇴할 수 있습니다.'
    return
  }
  if (!confirm('정말 회원 탈퇴하시겠습니까? 복구할 수 없습니다.')) return
  try {
    await api.delete(`/users/${user.value.id}`)
    alert('회원 탈퇴가 완료되었습니다.')
    store.logout()
    router.push('/')
  } catch (err) {
    console.error('회원 탈퇴 실패:', err)
    if (err.response && err.response.data && err.response.data.message) {
      errorMessage.value = err.response.data.message
      alert(`${err.response.data.message}`)
    } else {
      errorMessage.value = '회원 탈퇴에 실패했습니다.'
      alert('회원 탈퇴에 실패했습니다.')
    }
  }
}

async function requestRole() {
  try {
    await api.post(`/role-changes`, { requestedRole: 'MANAGER' })
    alert('권한 신청이 접수되었습니다.')
    errorMessage.value = ''
  } catch (err) {
    console.error('권한 신청 실패:', err)
    if (err.response && err.response.data && err.response.data.message) {
      errorMessage.value = err.response.data.message
      alert(`${err.response.data.message}`)
    } else {
      errorMessage.value = '권한 신청에 실패했습니다.'
      alert('권한 신청에 실패했습니다.')
    }
  }
}

function openApprovalWindow() {
  const url = `${window.location.origin}/role-approval`
  const features = [
    'width=640', 'height=720', 'top=100', 'left=100',
    'menubar=no', 'toolbar=no', 'location=no', 'status=no', 'resizable=yes'
  ].join(',')
  window.open(url, 'RoleApprovalWindow', features)
}

// --- 유틸리티 및 페이징 ---
function getItemLink(item) {
  const bId = item.boardId || 1
  const pId = currentTab.value === 'comments' ? item.postId : item.id
  return `/boards/${bId}/posts/${pId}`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR')
}

function goToPage(page) {
  if (page < 0 || page >= totalPages.value) return
  currentPage.value = page
  updateQueryAndFetch()
}

function updateQueryAndFetch() {
  router.replace({
    query: { tab: currentTab.value, page: currentPage.value }
  }).then(() => {
    fetchData()
  })
}

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  const start = Math.max(1, currentPage.value + 1 - Math.floor(maxVisible / 2))
  const end = Math.min(totalPages.value, start + maxVisible - 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
</script>