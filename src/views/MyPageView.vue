<template>
  <div class="page-container account-page">
    <div class="account-layout">

      <!-- 왼쪽 사이드바 (프로필 및 탭 메뉴) -->
      <aside class="account-sidebar">
        <div class="surface account-profile">


          <div v-if="profileLoading" class="relative z-10 w-full animate-pulse">
            <div class="account-avatar-large"></div>
            <div class="w-24 h-6 bg-slate-200 rounded-lg mx-auto mb-2"></div>
            <div class="hidden md:flex flex-col gap-3 mt-8">
              <div v-for="i in 5" :key="i" class="w-full h-10 bg-slate-100 rounded-xl"></div>
            </div>
          </div>

          <div v-else class="account-profile-body">
            <div class="account-avatar-large">
              <span class="text-indigo-600">{{ user.nickname ? user.nickname.charAt(0) : '👤' }}</span>
            </div>
            <h2 class="text-lg md:text-2xl font-semibold text-slate-800 mb-0.5 break-all">{{ user.nickname || '사용자' }}</h2>
            <p class="text-xs md:text-sm font-bold text-slate-400 mb-5 max-w-full px-2 break-all">{{ user.email || '이메일 정보 없음' }}</p>

            <nav class="account-tabs" aria-label="내 정보 메뉴">
              <button
                v-for="tab in tabList" :key="tab.id"
                v-show="tab.id !== 'approval' || user.role === 'ADMIN'"
                @click="changeTab(tab.id)" :aria-pressed="currentTab === tab.id" :disabled="mutationPending"
                class="account-tab"
                :class="currentTab === tab.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'"
              >
                <span aria-hidden="true">{{ tab.icon }}</span>
                {{ tab.label }}
              </button>
            </nav>
          </div>
        </div>
      </aside>

      <!-- 오른쪽 메인 콘텐츠 영역 -->
      <section class="account-content">
        <div class="surface panel-padding account-content-panel">

          <h1 class="text-xl md:text-2xl font-semibold text-slate-800 mb-6 border-b-2 border-slate-100 pb-4 flex items-center gap-2">
            <span :class="currentTab === 'approval' ? 'text-purple-600' : currentTab === 'withdraw' ? 'text-rose-500' : 'text-indigo-600'">
              {{ currentTabLabel }}
            </span>
          </h1>

          <AsyncState :loading="isLoading || profileLoading" :error="tabError || profileError" @retry="reloadCurrent">

          <!-- 1. 게시글 / 댓글 탭 -->
          <div v-if="['posts', 'comments'].includes(currentTab)" class="flex-1 flex flex-col">
            <div class="flex-1">
              <div v-if="items.length > 0" class="flex flex-col gap-3 md:gap-4">
                <router-link
                  v-for="item in items" :key="item.id"
                  :to="getItemLink(item)"
                  class="group flex flex-col md:flex-row justify-between items-start md:items-center px-4 py-4 md:px-6 md:py-5 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl hover:bg-[var(--ui-surface)] hover:border-indigo-300 transition-all"
                >
                  <div class="flex-1 w-full mb-2 md:mb-0">
                    <h4 class="text-sm md:text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition truncate pr-2">
                      {{ currentTab === 'comments' ? item.content : item.title }}
                    </h4>
                    <p class="text-xs md:text-sm font-medium text-slate-400 mt-1">📅 {{ formatDate(item.createdAt) }}</p>
                  </div>
                  <div v-if="currentTab === 'posts'" class="text-xs md:text-sm font-bold text-slate-400 bg-[var(--ui-surface)] px-2 py-0.5 rounded-lg border border-slate-100">
                    👀 {{ item.viewCount || 0 }}
                  </div>
                </router-link>
              </div>
              <div v-else class="py-16 md:py-24 text-center text-slate-400 font-medium italic border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-sm md:text-base">
                작성된 내역이 없습니다.
              </div>
            </div>

            <AppPagination :current-page="currentPage" :total-pages="totalPages" :disabled="isLoading" @change="goToPage" />
          </div>

          <!-- ✨ 2. AI 용병 (UserAiAgent) 탭 ✨ -->
          <div v-else-if="currentTab === 'ai_agent'" class="flex-1 space-y-6 md:space-y-8">
            <div class="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl md:rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-sm">


              <div class="relative z-10 mb-6">
                <h4 class="text-lg md:text-xl font-semibold text-slate-800 mb-2">AI 용병 설정</h4>
                <p class="text-xs md:text-sm text-indigo-700 font-bold leading-relaxed">
                  Gemini API 키와 맞춤형 페르소나를 입력해 보세요.<br class="hidden md:block"/> AI 용병이 지정된 갈드컵에서 당신을 대신해 활발한 토론을 펼칩니다!
                </p>
              </div>

              <div class="space-y-4 md:space-y-5 relative z-10">
                <!-- Gemini API 키 -->
                <div class="space-y-1.5">
                  <label class="block text-xs md:text-sm font-bold text-slate-700">Gemini API Key <span class="text-rose-500">*</span></label>
                  <input v-model="aiAgentForm.apiKey" aria-label="Gemini API 키" type="password" autocomplete="off" spellcheck="false" placeholder="AIzaSy..." class="form-control" />
                </div>

                <!-- ✨ 대상 게시판 검색 및 선택 -->
                <div class="space-y-1.5 relative">
                  <label class="block text-xs md:text-sm font-bold text-slate-700">활동 대상 갈드컵 <span class="text-rose-500">*</span></label>

                  <!-- 게시판이 선택된 상태 -->
                  <div v-if="aiAgentForm.targetBoardId" class="flex items-center justify-between bg-indigo-50 border border-indigo-200 px-4 py-3 rounded-xl shadow-sm transition-all">
                    <div class="flex items-center gap-2 overflow-hidden">
                      <span class="text-indigo-500">📌</span>
                      <span class="font-bold text-indigo-700 text-sm truncate">{{ selectedBoardName }}</span>
                    </div>
                    <button @click="resetBoardSelection" class="ui-button ui-button-secondary">변경</button>
                  </div>

                  <!-- 게시판 검색창 -->
                  <div v-else>
                    <div class="flex gap-2">
                      <input
                        v-model="boardSearchQuery" aria-label="활동 대상 갈드컵 검색"
                        @keyup.enter="searchBoards"
                        placeholder="게시판 주제를 검색하세요..."
                        class="form-control"
                      />
                      <button @click="searchBoards" class="ui-button ui-button-secondary">검색</button>
                    </div>

                    <p v-if="boardSearchError" role="alert" class="mt-2 text-sm text-rose-700">{{ boardSearchError }}</p>
                    <p v-else-if="hasSearchedBoard && !isSearchingBoard && boardSearchResults.length === 0 && boardSearchQuery.trim()" role="status" class="mt-2 text-sm text-slate-600">검색 결과가 없습니다.</p>
                    <!-- 검색 결과 드롭다운 -->
                    <ul v-if="boardSearchResults.length > 0" class="absolute z-20 w-full mt-2 bg-[var(--ui-surface)] border border-slate-200 rounded-xl max-h-48 overflow-y-auto custom-scrollbar">
                      <li
                        v-for="board in boardSearchResults" :key="board.id"

                        class="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-slate-100 last:border-0 text-sm font-bold text-slate-700 truncate transition"
                      ><button type="button" class="ui-button" @click="selectBoard(board)">{{ board.topic || board.title }}</button></li>
                    </ul>
                    <div v-if="isSearchingBoard" class="absolute z-20 w-full mt-2 bg-[var(--ui-surface)] border border-slate-200 rounded-xl p-4 text-center text-xs font-bold text-slate-400">
                      검색 중...
                    </div>
                  </div>
                </div>

                <!-- ✨ 활동 모드 선택 (COMMENT / POST) -->
                <div class="space-y-1.5">
                  <label class="block text-xs md:text-sm font-bold text-slate-700">활동 모드 <span class="text-rose-500">*</span></label>
                  <select v-model="aiAgentForm.agentMode" aria-label="활동 모드" class="form-control">
                    <option value="COMMENT">댓글 작성 모드 (추천)</option>
                    <option value="POST">새 게시글 작성 모드</option>
                  </select>
                </div>

                <!-- ✨ 페르소나 프롬프트 (500자 제한) -->
                <div class="space-y-1.5">
                  <label class="block text-xs md:text-sm font-bold text-slate-700 flex justify-between">
                    <span>AI 페르소나 프롬프트 <span class="text-rose-500">*</span></span>
                  </label>
                  <textarea
                    v-model="aiAgentForm.persona" aria-label="AI 페르소나"
                    rows="4" maxlength="500"
                    placeholder="예: 너는 짜장면을 세상에서 제일 좋아하는 열혈 중식 매니아다. 짬뽕을 고른 사람들을 논리적으로 반박해라."
                    class="form-control"
                  ></textarea>
                  <div class="flex justify-end">
                    <span class="text-xs md:text-xs font-bold" :class="aiAgentForm.persona.length >= 500 ? 'text-rose-500' : 'text-slate-400'">
                      {{ aiAgentForm.persona.length }} / 500
                    </span>
                  </div>
                </div>
              </div>

              <!-- 실행 버튼 영역 -->
              <div class="mt-6 md:mt-8 flex flex-col sm:flex-row justify-end gap-3 relative z-10">
                <button
                  v-if="isAgentRunning"
                  @click="stopAiAgent" :disabled="mutationPending"
                  class="ui-button ui-button-secondary"
                >
                  AI 활동 중지
                </button>
                <button
                  @click="startAiAgent"
                  :disabled="isAgentRunning || mutationPending || !isAiFormValid"
                  class="ui-button"
                >
                  <span v-if="isAgentRunning" class="animate-spin text-base">🌀</span>
                  {{ isAgentRunning ? 'AI 활동 중' : 'AI 활동 시작' }}
                </button>
              </div>
            </div>

            <!-- AI 용병 실시간 로그 -->
            <div v-if="agentLogs.length > 0" class="agent-console text-slate-200 rounded-2xl p-5 md:p-6 font-mono text-xs">
              <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
                <span class="text-emerald-400 font-bold flex items-center gap-2 text-sm">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  활동 상태
                </span>
              </div>
              <div class="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                <div v-for="(log, index) in agentLogs" :key="index" class="flex gap-2.5 leading-relaxed">
                  <span class="text-slate-500 shrink-0">[{{ log.time }}]</span>
                  <span :class="log.type === 'success' ? 'text-emerald-400' : (log.type === 'error' ? 'text-rose-400' : 'text-indigo-300')">{{ log.message }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. 프로필 설정 탭 -->
          <div v-else-if="currentTab === 'profile'" class="flex-1 space-y-6 md:space-y-8">
            <div class="bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl p-6 md:p-8">
              <h4 class="text-lg md:text-xl font-semibold text-slate-800 mb-4 md:mb-6">닉네임 변경</h4>
              <div class="flex flex-col sm:flex-row gap-3">
                <input v-model="newNickname" aria-label="새 닉네임" placeholder="새로운 닉네임" class="form-control" />
                <button @click="changeNickname" :disabled="mutationPending" class="ui-button">변경하기</button>
              </div>
            </div>
          </div>

          <!-- 4. 권한 신청 탭 -->
          <div v-else-if="currentTab === 'role'" class="flex-1 space-y-6 md:space-y-8">
            <div class="bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl p-6 md:p-8">
              <p class="text-sm md:text-lg font-bold text-slate-600">
                현재 등급: <span class="ml-1 md:ml-2 text-base md:text-xl px-3 py-1.5 bg-[var(--ui-surface)] border-2 rounded-lg md:rounded-xl shadow-sm text-indigo-600 border-indigo-100">{{ user.role || 'USER' }}</span>
              </p>
            </div>

            <div v-if="latestRequest" class="bg-[var(--ui-surface)] border-2 border-dashed border-slate-200 rounded-xl md:rounded-2xl p-6 md:p-8">
              <h4 class="text-base md:text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span>📋</span> 최근 권한 신청 현황
              </h4>
              <div class="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p class="text-xs md:text-sm font-bold text-slate-500 mb-1">신청 권한: {{ latestRequest.requestedRole }}</p>
                  <span v-if="latestRequest.status === 'PENDING'" class="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs md:text-xs font-semibold">⏳ 심사 중</span>
                  <span v-else-if="latestRequest.status === 'APPROVED'" class="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs md:text-xs font-semibold">✅ 승인 완료</span>
                  <span v-else-if="latestRequest.status === 'DENIED'" class="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs md:text-xs font-semibold">❌ 거절됨</span>
                </div>
                <button v-if="latestRequest.status === 'DENIED' && user.role === 'USER'" @click="requestRole" :disabled="mutationPending" class="ui-button">재신청</button>
              </div>
            </div>

            <div v-else-if="user.role === 'USER'" class="flex justify-center sm:justify-end">
              <button @click="requestRole" :disabled="mutationPending" class="ui-button">매니저 권한 신청하기</button>
            </div>
            <div v-else class="text-center py-8">
              <p class="text-slate-400 font-bold italic text-sm md:text-base">이미 상위 권한을 보유 중입니다. ✨</p>
            </div>
          </div>

          <!-- 5. 승인 탭 (Admin Only) -->
          <div v-else-if="currentTab === 'approval'" class="flex-1 space-y-4 md:space-y-6">
            <div v-if="roleRequests.length === 0" class="py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 font-bold text-sm">대기 중인 요청이 없습니다.</div>
            <div v-else class="grid gap-3 md:gap-4">
              <div v-for="req in roleRequests" :key="req.id" class="p-4 md:p-6 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors">
                <div class="flex items-center gap-3 md:gap-4 self-start sm:self-center">
                  <div class="w-10 h-10 md:w-12 md:h-12 bg-purple-600 text-white rounded-lg md:rounded-xl flex items-center justify-center font-semibold text-lg">{{ (req.applicantNickname || '익').charAt(0) }}</div>
                  <div>
                    <h4 class="font-bold text-slate-800 text-base md:text-lg leading-none mb-1">{{ req.applicantNickname }}</h4>
                    <p class="text-xs text-purple-600 font-semibold tracking-widest uppercase"> 요청 권한: {{ req.requestedRole }}</p>
                  </div>
                </div>
                <div class="flex gap-2 w-full sm:w-auto">
                  <button @click="approveRole(req.id)" :disabled="mutationPending" class="ui-button">승인</button>
                  <button @click="denyRole(req.id)" :disabled="mutationPending" class="ui-button ui-button-secondary">거절</button>
                </div>
              </div>
            </div>
            <AppPagination :current-page="roleCurrentPage" :total-pages="roleTotalPages" :disabled="isLoading" label="권한 신청 페이지" @change="changeRolePage" />
          </div>

          <!-- 6. 탈퇴 탭 -->
          <div v-else-if="currentTab === 'withdraw'" class="flex-1 space-y-6 md:space-y-8">
            <div class="bg-rose-50 border border-rose-100 rounded-xl md:rounded-2xl p-6 md:p-8">
              <p class="text-rose-700 font-bold leading-relaxed text-xs md:text-sm">
                탈퇴 시 모든 활동 정보가 삭제되며 복구할 수 없습니다.<br />
                이메일(<span class="font-semibold text-slate-900 underline">{{ user.email }}</span>)을 입력해 주세요.
              </p>
            </div>
            <div class="flex flex-col gap-3 md:gap-4">
              <input v-model="confirmEmail" aria-label="탈퇴 확인 이메일" placeholder="이메일 확인 입력" class="form-control" />
              <div class="flex justify-end">
                <button @click="deleteAccount" :disabled="mutationPending" class="ui-button ui-button-danger">회원 탈퇴하기</button>
              </div>
            </div>
          </div>

          </AsyncState>
          <div role="alert" v-if="errorMessage" class="field-error">{{ errorMessage }}</div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, onScopeDispose } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import api from '@/axios'
import { clampPage, toApiPage } from '@/utils/pagination'
import { useResource } from '@/composables/useResource'
import { writeStorage } from '@/utils/storage'
import AsyncState from '@/components/ui/AsyncState.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

const store = useUserStore()
const router = useRouter()
const route = useRoute()

// --- 상수 및 탭 정보 ---
const tabList = [
  { id: 'posts', label: '게시글', icon: '📝' },
  { id: 'comments', label: '댓글', icon: '💬' },
  { id: 'ai_agent', label: 'AI 용병', icon: '🤖' },
  { id: 'profile', label: '설정', icon: '⚙️' },
  { id: 'role', label: '권한', icon: '🛡️' },
  { id: 'approval', label: '승인', icon: '⚖️' },
  { id: 'withdraw', label: '탈퇴', icon: '🚪' }
]

const currentTabLabel = computed(() => {
  const tab = tabList.find(t => t.id === currentTab.value)
  return tab ? `${tab.icon} ${tab.label}` : ''
})

// --- 일반 상태 관리 ---
const { loading: isLoading, error: tabError, load: loadTab } = useResource('요청한 정보를 불러오지 못했습니다.')
const { loading: profileLoading, error: profileError, load: loadProfile } = useResource('내 정보를 불러오지 못했습니다.')
const mutationPending = ref(false)
const ready = ref(false)
const currentTab = ref('posts')
const items = ref([])
const roleRequests = ref([])
const latestRequest = ref(null)
const currentPage = ref(0)
const totalPages = ref(0)
const roleCurrentPage = ref(0)
const roleTotalPages = ref(0)
const user = ref({})
const newNickname = ref('')
const confirmEmail = ref('')
const errorMessage = ref('')

// --- ✨ AI Agent 상태 관리 및 로직 ---
const aiAgentForm = reactive({
  apiKey: '',
  targetBoardId: null,
  agentMode: 'COMMENT', // 'COMMENT' 또는 'POST'
  persona: ''
})
const isAgentRunning = ref(false)
const agentLogs = ref([])

// 폼 유효성 검사 (500자 이하 검증 포함)
const isAiFormValid = computed(() => {
  return aiAgentForm.apiKey.trim() !== '' &&
         aiAgentForm.targetBoardId !== null &&
         aiAgentForm.persona.trim() !== '' &&
         aiAgentForm.persona.length <= 500
})

// 게시판 검색 관련 상태
const boardSearchQuery = ref('')
const boardSearchResults = ref([])
const { loading: isSearchingBoard, error: boardSearchError, load: loadSearch } = useResource('갈드컵을 검색하지 못했습니다.')
const hasSearchedBoard = ref(false)
const selectedBoardName = ref('')

// 게시판 검색 함수 (백엔드 엔드포인트에 맞게 조정 필요: 예 `/boards?keyword=...`)
async function searchBoards() {
  const keyword = boardSearchQuery.value.trim()
  if (!keyword) { boardSearchResults.value = []; return }
  hasSearchedBoard.value = true
  await loadSearch(signal => api.get('/boards/search', { signal, params: { keyword, size: 10, page: toApiPage(0) } }), res => {
    if (boardSearchQuery.value.trim() === keyword) boardSearchResults.value = res.data.content || []
  })
}

// 게시판 선택
function selectBoard(board) {
  aiAgentForm.targetBoardId = board.id
  selectedBoardName.value = board.topic || board.title || '게시판'
  boardSearchResults.value = []
  boardSearchQuery.value = ''
}

// 게시판 선택 초기화
function resetBoardSelection() {
  if (isAgentRunning.value) {
    alert('작전 수행 중에는 대상 게시판을 변경할 수 없습니다.')
    return
  }
  aiAgentForm.targetBoardId = null
  selectedBoardName.value = ''
}

const addAgentLog = (message, type = 'info') => {
  const time = new Date().toLocaleTimeString('ko-KR', { hour12: false })
  agentLogs.value.unshift({ time, message, type })
  agentLogs.value.length = Math.min(agentLogs.value.length, 100)
}

// 내 AI 용병 정보 조회 (생성되어 있으면 값 세팅)
function fetchMyAiAgent() {
  return loadTab(signal => api.get('/ai-agents/me', { signal }).catch(error => {
    if (error.response?.status === 404) return { data: null }
    throw error
  }), res => {
    const agent = res.data
    isAgentRunning.value = Boolean(agent && agent.isActive !== false && (!agent.expiredAt || new Date(agent.expiredAt).getTime() > Date.now()))
    if (agent) {
      aiAgentForm.targetBoardId = agent.targetBoardId
      selectedBoardName.value = agent.targetBoardName
      aiAgentForm.agentMode = agent.agentMode
      aiAgentForm.persona = agent.personaPrompt
      addAgentLog(isAgentRunning.value ? '등록된 AI 용병의 활동 상태를 불러왔습니다.' : '등록된 AI 용병의 활동이 종료되었습니다.')
    }
  })
}

// AI 용병 투입 (Create API 호출)
async function startAiAgentAction() {
  if (!isAiFormValid.value || isAgentRunning.value) return

  isAgentRunning.value = true
  agentLogs.value = []
  addAgentLog('API 키 유효성 검증 및 암호화 진행 중...', 'info')

  try {
    const payload = {
      targetBoardId: aiAgentForm.targetBoardId,
      agentMode: aiAgentForm.agentMode,
      apiKey: aiAgentForm.apiKey,
      personaPrompt: aiAgentForm.persona
    }

    await api.post('/ai-agents', payload)
    aiAgentForm.apiKey = ''

    addAgentLog(`[게시판 #${aiAgentForm.targetBoardId}] 접속 승인 완료`, 'success')
    addAgentLog(`설정된 페르소나로 ${aiAgentForm.agentMode === 'COMMENT' ? '댓글' : '게시글'} 기반 백그라운드 활동을 시작합니다.`, 'success')

  } catch (err) {
    const errorMsg = '요청을 완료하지 못했습니다. 입력 내용과 연결 상태를 확인해 주세요.'
    addAgentLog(`생성 실패: ${errorMsg}`, 'error')
    isAgentRunning.value = false
  }
}

// AI 용병 철수 (Delete API 호출)
async function stopAiAgentAction() {
  if (!confirm('AI 용병 작전을 즉시 중지하고 서버에서 봇을 삭제하시겠습니까?')) return

  try {
    await api.delete('/ai-agents/me')
    addAgentLog('작전이 성공적으로 중지되었으며, 봇이 철수했습니다.', 'error')
    isAgentRunning.value = false
    aiAgentForm.apiKey = '' // 보안상 키는 초기화
  } catch (err) {
    alert(err.response?.data?.message || '중지 처리 중 오류가 발생했습니다.')
  }
}

// --- 초기화 및 라이프사이클 ---
onMounted(async () => { await fetchUser(); ready.value = true })
onScopeDispose(() => { aiAgentForm.apiKey = '' })
watch([() => route.query.tab, () => route.query.page, ready], () => {
  if (!ready.value) return
  const tab = route.query.tab
  currentTab.value = tabList.some(item => item.id === tab) && (tab !== 'approval' || store.isAdmin) ? tab : 'posts'
  const page = Number(route.query.page)
  currentPage.value = Number.isSafeInteger(page) && page >= 0 ? page : 0
  roleCurrentPage.value = currentPage.value
  errorMessage.value = ''
  handleTabData()
})
function changeTab(tab) {
  if (mutationPending.value) return
  router.replace({ query: { tab, page: 0 } })
}
async function reloadCurrent() { if (profileError.value) await fetchUser(); await handleTabData() }

async function handleTabData() {
  if (['profile', 'withdraw'].includes(currentTab.value)) await loadTab(async () => null, () => {})
  if (['posts', 'comments'].includes(currentTab.value)) await fetchData()
  if (currentTab.value === 'approval') await fetchRoleRequests(roleCurrentPage.value)
  if (currentTab.value === 'role') await fetchMyLatestRequest()
  if (currentTab.value === 'ai_agent') await fetchMyAiAgent()
}

// --- 일반 API 로직 ---
function fetchUser() {
  return loadProfile(signal => api.get('/users/me', { signal }), res => {
    user.value = res.data
    store.nickname = res.data.nickname
    writeStorage('nickname', res.data.nickname)
  })
}
async function fetchData() {
  if (!user.value.nickname) return
  const requestedPage = toApiPage(currentPage.value)
  let correctedPage = null
  const endpoint = currentTab.value === 'posts' ? `/posts/user/${encodeURIComponent(user.value.nickname)}` : `/comments/user/${encodeURIComponent(user.value.nickname)}`
  const loaded = await loadTab(signal => api.get(endpoint, { signal, params: { page: requestedPage, size: 10 } }), res => {
    totalPages.value = res.data.totalPages
    const validPage = clampPage(requestedPage, totalPages.value)
    if (validPage !== requestedPage) {
      items.value = []
      correctedPage = validPage
      return
    }
    items.value = res.data.content || []
  })
  if (loaded && correctedPage !== null) {
    return router.replace({ query: { ...route.query, page: correctedPage } })
  }
  return loaded
}
function fetchMyLatestRequest() {
  return loadTab(signal => api.get('/users/me/role-requests', { signal }), res => { latestRequest.value = res.data.content?.[0] || null })
}
async function fetchRoleRequests(page = 0) {
  const requestedPage = toApiPage(page)
  roleCurrentPage.value = requestedPage
  let correctedPage = null
  const loaded = await loadTab(signal => api.get('/users/role-requests', { signal, params: { status: 'PENDING', page: requestedPage, size: 10 } }), res => {
    roleTotalPages.value = res.data.totalPages
    const validPage = clampPage(requestedPage, roleTotalPages.value)
    if (validPage !== requestedPage) {
      roleRequests.value = []
      roleCurrentPage.value = validPage
      correctedPage = validPage
      return
    }
    roleRequests.value = res.data.content || []
  })
  if (loaded && correctedPage !== null) {
    const queryPage = Number(route.query.page)
    if (currentTab.value === 'approval' && queryPage !== correctedPage) {
      return router.replace({ query: { ...route.query, page: correctedPage } })
    }
    return fetchRoleRequests(correctedPage)
  }
  return loaded
}

function changeRolePage(page) {
  if (page < 0 || page >= roleTotalPages.value || isLoading.value) return
  router.replace({ query: { ...route.query, page } })
}

async function approveRoleAction(id) {
  try {
    await api.post(`/users/role-requests/${id}/approve`)
    alert('승인되었습니다.')
    await fetchRoleRequests(roleCurrentPage.value)
  } catch (err) { alert('승인 처리 실패') }
}

async function denyRoleAction(id) {
  if (!confirm('거절하시겠습니까?')) return
  try {
    await api.post(`/users/role-requests/${id}/deny`)
    await fetchRoleRequests(roleCurrentPage.value)
  } catch (err) { alert('거절 처리 실패') }
}

async function changeNicknameAction() {
  const name = newNickname.value.trim()
  if (!name || name.length < 2) return alert('2자 이상의 닉네임을 입력해주세요.')
  try {
    await api.put(`/users/${user.value.id}`, { nickname: name })
    alert('닉네임이 변경되었습니다.')
    await fetchUser()
    newNickname.value = ''
  } catch (err) { errorMessage.value = '이미 사용중인 닉네임이거나 변경할 수 없습니다.' }
}

async function deleteAccountAction() {
  if (confirmEmail.value.trim() !== user.value.email) {
    errorMessage.value = '이메일을 정확히 입력해 주세요.'
    return
  }
  if (!confirm('정말 회원 탈퇴하시겠습니까? 모든 데이터가 영구 삭제됩니다.')) return
  try {
    await api.delete(`/users/${user.value.id}`)
    alert('탈퇴가 완료되었습니다.')
    await store.logout()
    router.push('/')
  } catch (err) { alert('탈퇴 실패') }
}

async function requestRoleAction() {
  try {
    await api.post(`/users/role-requests`, { requestedRole: 'MANAGER' })
    alert('매니저 신청이 완료되었습니다. 관리자 승인 후 반영됩니다.')
    await fetchMyLatestRequest()
  } catch (err) { alert(err.response?.data?.message || '이미 신청했거나 요청 중 오류가 발생했습니다.') }
}

// --- 기타 유틸 ---
const getItemLink = (item) => {
  const boardId = item.boardId || 1
  if (currentTab.value === 'comments') return `/boards/${boardId}/posts/${item.postId}`
  return `/boards/${boardId}/posts/${item.id}`
}

const formatDate = (str) => str ? new Date(str).toLocaleDateString('ko-KR') : ''

function goToPage(page) {
  if (page < 0 || page >= totalPages.value || isLoading.value) return
  router.replace({ query: { ...route.query, page } })
}
function withPending(action) {
  return async (...args) => {
    if (mutationPending.value) return
    mutationPending.value = true
    try { return await action(...args) }
    finally { mutationPending.value = false }
  }
}
const startAiAgent = withPending(startAiAgentAction)
const stopAiAgent = withPending(stopAiAgentAction)
const approveRole = withPending(approveRoleAction)
const denyRole = withPending(denyRoleAction)
const changeNickname = withPending(changeNicknameAction)
const deleteAccount = withPending(deleteAccountAction)
const requestRole = withPending(requestRoleAction)
</script>
<style scoped>
.account-layout { display:grid; grid-template-columns:minmax(0,1fr); gap:20px; align-items:start; }
.account-sidebar, .account-content { min-width:0; }
.account-profile { padding:24px 18px; border-top:3px solid var(--ui-primary); }
.account-profile h2 { font-size:18px; font-weight:700; }
.account-tabs { display:flex; gap:6px; width:100%; overflow-x:auto; padding:4px; }
.account-tab { display:flex; flex:0 0 auto; align-items:center; gap:8px; min-height:44px; padding:10px 12px; border:0; border-radius:8px; background:var(--ui-surface-subtle); color:var(--ui-secondary); font-size:14px; font-weight:550; text-align:left; }
.account-tab[aria-pressed="true"] { background:var(--ui-primary-soft); color:var(--ui-primary); font-weight:650; }
.account-content-panel { min-height:400px; }
.account-content-panel h1 { font-size:24px; line-height:1.4; letter-spacing:-.03em; }
.account-content-panel h1 span { color:var(--ui-text); }
.account-content-panel :is(input,select,textarea) { min-width:0; }
.account-content-panel label { color:var(--ui-secondary); font-size:14px; font-weight:600; }
@media(min-width:1024px) { .account-layout { grid-template-columns:232px minmax(0,1fr); gap:28px; } .account-sidebar { position:sticky; top:24px; } .account-tabs { flex-direction:column; overflow:visible; } }
.account-page .text-slate-400 { color:var(--ui-text-muted); }
.account-page .agent-console .text-slate-500 { color:var(--ui-terminal-text); }
.account-page .agent-console .text-indigo-300 { color:var(--ui-terminal-text); }
.account-profile-body { display:grid; grid-template-columns:56px minmax(0,1fr); column-gap:12px; align-items:center; width:100%; }
.account-avatar-large { display:grid; place-items:center; grid-row:1 / 3; width:56px; height:56px; border-radius:50%; background:var(--ui-primary-soft); color:var(--ui-primary); font-size:24px; font-weight:700; }
.account-profile-body > h2 { grid-column:2; margin:0; align-self:end; }
.account-profile-body > p { grid-column:2; padding:0; margin:4px 0 0; align-self:start; font-size:12px; }
.account-profile-body > nav { grid-column:1 / -1; margin-top:16px; }
@media(min-width:1024px) { .account-profile-body { display:flex; flex-direction:column; align-items:center; } .account-avatar-large { margin-bottom:12px; } .account-profile-body > h2, .account-profile-body > p { align-self:center; text-align:center; } }
.account-page .text-emerald-600 { color:var(--ui-success); }
.account-page .text-rose-600 { color:var(--ui-danger); }
</style>
