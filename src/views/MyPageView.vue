<template>
  <main class="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-96px)] bg-gradient-to-br from-indigo-50 via-sky-50 to-blue-100 p-4 md:p-10 font-sans">
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 md:gap-8">
      
      <!-- 왼쪽 사이드바 (프로필 및 탭 메뉴) -->
      <aside class="w-full md:w-1/3 lg:w-1/4 shrink-0">
        <div class="bg-white rounded-2xl md:rounded-[2rem] shadow-xl p-5 md:p-8 border border-indigo-50 relative overflow-hidden flex flex-col items-center">
          <div class="absolute -top-16 -right-16 w-32 h-32 bg-indigo-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>
          
          <div v-if="isLoading" class="relative z-10 w-full animate-pulse">
            <div class="w-16 h-16 md:w-24 md:h-24 mx-auto bg-slate-200 rounded-full mb-3 md:mb-4"></div>
            <div class="w-24 h-6 bg-slate-200 rounded-lg mx-auto mb-2"></div>
            <div class="hidden md:flex flex-col gap-3 mt-8">
              <div v-for="i in 5" :key="i" class="w-full h-10 bg-slate-100 rounded-xl"></div>
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

      <!-- 오른쪽 메인 콘텐츠 영역 -->
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

          <!-- 1. 게시글 / 댓글 탭 -->
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

          <!-- ✨ 2. AI 용병 (UserAiAgent) 탭 ✨ -->
          <div v-else-if="currentTab === 'ai_agent'" class="flex-1 space-y-6 md:space-y-8">
            <div class="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl md:rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-sm">
              <div class="absolute -right-4 -bottom-4 text-7xl opacity-10 pointer-events-none">🤖</div>
              
              <div class="relative z-10 mb-6">
                <h4 class="text-lg md:text-xl font-extrabold text-slate-800 mb-2">나만의 AI 용병 설정</h4>
                <p class="text-xs md:text-sm text-indigo-700 font-bold leading-relaxed">
                  Gemini API 키와 맞춤형 페르소나를 입력해 보세요.<br class="hidden md:block"/> AI 용병이 지정된 갈드컵에서 당신을 대신해 활발한 토론을 펼칩니다!
                </p>
              </div>

              <div class="space-y-4 md:space-y-5 relative z-10">
                <!-- Gemini API Key -->
                <div class="space-y-1.5">
                  <label class="block text-xs md:text-sm font-bold text-slate-700">Gemini API Key <span class="text-rose-500">*</span></label>
                  <input v-model="aiAgentForm.apiKey" type="password" placeholder="AIzaSy..." class="w-full border border-white bg-white/70 px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm transition-all shadow-sm" />
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
                    <button @click="resetBoardSelection" class="text-[11px] text-rose-500 font-bold px-3 py-1.5 bg-white rounded-lg shadow-sm border border-rose-100 hover:bg-rose-50 shrink-0">변경</button>
                  </div>
                  
                  <!-- 게시판 검색창 -->
                  <div v-else>
                    <div class="flex gap-2">
                      <input 
                        v-model="boardSearchQuery" 
                        @keyup.enter="searchBoards" 
                        placeholder="게시판 주제를 검색하세요..." 
                        class="w-full border border-white bg-white/70 px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm transition-all shadow-sm" 
                      />
                      <button @click="searchBoards" class="px-5 bg-slate-800 text-white rounded-xl font-bold text-sm shrink-0 hover:bg-slate-700 transition">검색</button>
                    </div>
                    
                    <!-- 검색 결과 드롭다운 -->
                    <ul v-if="boardSearchResults.length > 0" class="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                      <li 
                        v-for="board in boardSearchResults" :key="board.id" 
                        @click="selectBoard(board)" 
                        class="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-slate-100 last:border-0 text-sm font-bold text-slate-700 truncate transition"
                      >
                        {{ board.topic || board.title }}
                      </li>
                    </ul>
                    <div v-if="isSearchingBoard" class="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-4 text-center text-xs font-bold text-slate-400">
                      검색 중...
                    </div>
                  </div>
                </div>

                <!-- ✨ 활동 모드 선택 (COMMENT / POST) -->
                <div class="space-y-1.5">
                  <label class="block text-xs md:text-sm font-bold text-slate-700">활동 모드 <span class="text-rose-500">*</span></label>
                  <select v-model="aiAgentForm.agentMode" class="w-full border border-white bg-white/70 px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm transition-all shadow-sm text-slate-700">
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
                    v-model="aiAgentForm.persona" 
                    rows="4" maxlength="500"
                    placeholder="예: 너는 짜장면을 세상에서 제일 좋아하는 열혈 중식 매니아다. 짬뽕을 고른 사람들을 논리적으로 반박해라." 
                    class="w-full border border-white bg-white/70 px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm resize-none transition-all shadow-sm"
                  ></textarea>
                  <div class="flex justify-end">
                    <span class="text-[10px] md:text-xs font-bold" :class="aiAgentForm.persona.length >= 500 ? 'text-rose-500' : 'text-slate-400'">
                      {{ aiAgentForm.persona.length }} / 500
                    </span>
                  </div>
                </div>
              </div>

              <!-- 실행 버튼 영역 -->
              <div class="mt-6 md:mt-8 flex flex-col sm:flex-row justify-end gap-3 relative z-10">
                <button 
                  v-if="isAgentRunning" 
                  @click="stopAiAgent" 
                  class="w-full sm:w-auto px-6 py-3 bg-white text-rose-500 border border-rose-200 font-bold rounded-xl hover:bg-rose-50 transition shadow-sm text-sm"
                >
                  🛑 작전 중지 및 봇 철수
                </button>
                <button 
                  @click="startAiAgent" 
                  :disabled="isAgentRunning || !isAiFormValid" 
                  class="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-200 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span v-if="isAgentRunning" class="animate-spin text-base">🌀</span>
                  {{ isAgentRunning ? '용병 참전 중...' : '⚔️ 용병 투입하기' }}
                </button>
              </div>
            </div>

            <!-- AI 용병 실시간 로그 -->
            <div v-if="agentLogs.length > 0" class="bg-slate-900 text-slate-200 rounded-2xl p-5 md:p-6 font-mono text-xs shadow-inner">
              <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
                <span class="text-emerald-400 font-bold flex items-center gap-2 text-sm">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  실시간 요원 상태
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
              <h4 class="text-lg md:text-xl font-extrabold text-slate-800 mb-4 md:mb-6">닉네임 변경</h4>
              <div class="flex flex-col sm:flex-row gap-3">
                <input v-model="newNickname" placeholder="새로운 닉네임" class="flex-1 border border-slate-200 px-4 py-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800 text-sm md:text-base" />
                <button @click="changeNickname" class="bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md text-sm">변경하기</button>
              </div>
            </div>
          </div>

          <!-- 4. 권한 신청 탭 -->
          <div v-else-if="currentTab === 'role'" class="flex-1 space-y-6 md:space-y-8">
            <div class="bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl p-6 md:p-8">
              <p class="text-sm md:text-lg font-bold text-slate-600">
                현재 등급: <span class="ml-1 md:ml-2 text-base md:text-xl px-3 py-1.5 bg-white border-2 rounded-lg md:rounded-xl shadow-sm text-indigo-600 border-indigo-100">{{ user.role || 'USER' }}</span>
              </p>
            </div>

            <div v-if="latestRequest" class="bg-white border-2 border-dashed border-slate-200 rounded-xl md:rounded-2xl p-6 md:p-8">
              <h4 class="text-base md:text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                <span>📋</span> 최근 권한 신청 현황
              </h4>
              <div class="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p class="text-xs md:text-sm font-bold text-slate-500 mb-1">신청 권한: {{ latestRequest.requestedRole }}</p>
                  <span v-if="latestRequest.status === 'PENDING'" class="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[10px] md:text-xs font-black">⏳ 심사 중</span>
                  <span v-else-if="latestRequest.status === 'APPROVED'" class="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] md:text-xs font-black">✅ 승인 완료</span>
                  <span v-else-if="latestRequest.status === 'DENIED'" class="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-[10px] md:text-xs font-black">❌ 거절됨</span>
                </div>
                <button v-if="latestRequest.status === 'DENIED' && user.role === 'USER'" @click="requestRole" class="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-indigo-700 transition">재신청</button>
              </div>
            </div>

            <div v-else-if="user.role === 'USER'" class="flex justify-center sm:justify-end">
              <button @click="requestRole" class="w-full sm:w-auto bg-emerald-500 text-white px-8 py-3.5 rounded-xl font-bold text-base md:text-lg hover:bg-emerald-600 shadow-md">매니저 권한 신청하기</button>
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
                  <div class="w-10 h-10 md:w-12 md:h-12 bg-purple-600 text-white rounded-lg md:rounded-xl flex items-center justify-center font-black text-lg shadow-md">{{ (req.applicantNickname || '익').charAt(0) }}</div>
                  <div>
                    <h4 class="font-bold text-slate-800 text-base md:text-lg leading-none mb-1">{{ req.applicantNickname }}</h4>
                    <p class="text-[9px] text-purple-600 font-black tracking-widest uppercase"> 요청 권한: {{ req.requestedRole }}</p>
                  </div>
                </div>
                <div class="flex gap-2 w-full sm:w-auto">
                  <button @click="approveRole(req.id)" class="flex-1 sm:flex-none px-5 py-2.5 bg-purple-600 text-white rounded-lg md:rounded-xl font-bold hover:bg-purple-700 text-xs md:text-sm">승인</button>
                  <button @click="denyRole(req.id)" class="flex-1 sm:flex-none px-5 py-2.5 bg-red-50 text-red-600 rounded-lg md:rounded-xl font-bold hover:bg-red-100 text-xs md:text-sm">거절</button>
                </div>
              </div>
            </div>
            <div v-if="roleTotalPages > 1" class="flex justify-center gap-1.5 mt-4">
               <button v-for="p in roleTotalPages" :key="p" @click="fetchRoleRequests(p-1)"
                :class="['px-3 py-1 rounded font-bold text-xs', roleCurrentPage === p-1 ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600']">
                {{ p }}
              </button>
            </div>
          </div>

          <!-- 6. 탈퇴 탭 -->
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
import { ref, reactive, computed, onMounted } from 'vue'
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
const isLoading = ref(true) 
const currentTab = ref('posts')
const items = ref([])
const roleRequests = ref([])
const latestRequest = ref(null) 
const currentPage = ref(0)
const totalPages = ref(1)
const roleCurrentPage = ref(0) 
const roleTotalPages = ref(1)  
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
const isSearchingBoard = ref(false)
const selectedBoardName = ref('')

// 게시판 검색 함수 (백엔드 엔드포인트에 맞게 조정 필요: 예 `/boards?keyword=...`)
async function searchBoards() {
  if (!boardSearchQuery.value.trim()) return
  isSearchingBoard.value = true
  try {
    const res = await api.get('/boards', { params: { topic: boardSearchQuery.value, size: 10 } })
    boardSearchResults.value = res.data.content || res.data || []
  } catch (err) {
    boardSearchResults.value = []
  } finally {
    isSearchingBoard.value = false
  }
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
}

// 내 AI 용병 정보 조회 (생성되어 있으면 값 세팅)
async function fetchMyAiAgent() {
  try {
    const res = await api.get('/ai-agents/me')
    if (res.data) {
      isAgentRunning.value = true
      aiAgentForm.targetBoardId = res.data.targetBoardId
      selectedBoardName.value = res.data.targetBoardName
      aiAgentForm.agentMode = res.data.agentMode
      aiAgentForm.persona = res.data.personaPrompt
      addAgentLog(`[상태 복구] 현재 지정된 게시판에서 ${aiAgentForm.agentMode === 'COMMENT' ? '댓글' : '게시글'} 작전 수행 중입니다.`, 'success')
    }
  } catch (err) {
    isAgentRunning.value = false
  }
}

// AI 용병 투입 (Create API 호출)
async function startAiAgent() {
  if (!isAiFormValid.value) return
  
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
    
    addAgentLog(`[게시판 #${aiAgentForm.targetBoardId}] 접속 승인 완료`, 'success')
    addAgentLog(`설정된 페르소나로 ${aiAgentForm.agentMode === 'COMMENT' ? '댓글' : '게시글'} 기반 백그라운드 활동을 시작합니다.`, 'success')

  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message
    addAgentLog(`생성 실패: ${errorMsg}`, 'error')
    isAgentRunning.value = false
  }
}

// AI 용병 철수 (Delete API 호출)
async function stopAiAgent() {
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
  roleCurrentPage.value = 0
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
  if (currentTab.value === 'role') await fetchMyLatestRequest() 
  if (currentTab.value === 'ai_agent') await fetchMyAiAgent()
}

// --- 일반 API 로직 ---
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

async function fetchMyLatestRequest() {
  try {
    const res = await api.get('/users/me/role-requests')
    latestRequest.value = res.data.content?.[0] || null
  } catch (err) { latestRequest.value = null }
}

async function fetchRoleRequests(page = 0) {
  try {
    roleCurrentPage.value = page
    const res = await api.get('/users/role-requests', { params: { status: 'PENDING', page: page, size: 10 } })
    roleRequests.value = res.data.content || []
    roleTotalPages.value = res.data.totalPages || 1
  } catch (err) { 
    roleRequests.value = []
  }
}

async function approveRole(id) {
  try {
    await api.post(`/users/role-requests/${id}/approve`)
    alert('승인되었습니다.')
    fetchRoleRequests(roleCurrentPage.value)
  } catch (err) { alert('승인 처리 실패') }
}

async function denyRole(id) {
  if (!confirm('거절하시겠습니까?')) return
  try {
    await api.post(`/users/role-requests/${id}/deny`)
    fetchRoleRequests(roleCurrentPage.value)
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

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>