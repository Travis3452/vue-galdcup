<template>
  <div v-if="isBoardManager" class="bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-2xl mb-8 border border-slate-700">
    
    <div class="flex items-center gap-4 mb-6 pb-5 border-b border-slate-800">
      <div class="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl shadow-inner border border-indigo-500/30">
        👨‍💻
      </div>
      <div>
        <h3 class="text-white font-black text-lg md:text-xl tracking-tight">매니저 대시보드</h3>
        <p class="text-slate-400 text-xs md:text-sm mt-1">게시판 환경과 투표 세션을 관리하는 전용 공간입니다.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
      
      <div class="bg-slate-800 rounded-2xl p-5 border border-slate-700 flex flex-col transition-all hover:border-slate-500">
        <div class="mb-4">
          <h4 class="text-slate-200 font-bold text-sm flex items-center gap-2">
            <span class="p-1.5 bg-slate-700 rounded-lg text-xs">🤖</span> 
            AI 생성
          </h4>
        </div>
        
        <div class="flex flex-col gap-2 mt-auto">
          <button 
            @click="handleGeneratePosts" 
            :disabled="isGeneratingPosts || isGeneratingComments"
            class="w-full py-2.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 rounded-xl transition-all text-xs font-bold disabled:opacity-50 flex justify-center items-center gap-2"
          >
            <span v-if="isGeneratingPosts" class="animate-spin text-[10px]">🌀</span>
            {{ isGeneratingPosts ? '글 생성 중...' : '게시글 10개 생성' }}
          </button>
          
          <button 
            @click="handleGenerateComments" 
            :disabled="isGeneratingPosts || isGeneratingComments"
            class="w-full py-2.5 bg-teal-600/20 text-teal-400 hover:bg-teal-500 hover:text-white border border-teal-500/30 rounded-xl transition-all text-xs font-bold disabled:opacity-50 flex justify-center items-center gap-2"
          >
            <span v-if="isGeneratingComments" class="animate-spin text-[10px]">🌀</span>
            {{ isGeneratingComments ? '댓글 생성 중...' : '댓글 20개 생성' }}
          </button>
        </div>
      </div>

      <div class="bg-slate-800 rounded-2xl p-5 border border-slate-700 flex flex-col transition-all hover:border-slate-500">
        <div class="mb-4">
          <h4 class="text-slate-200 font-bold text-sm flex items-center gap-2">
            <span class="p-1.5 bg-slate-700 rounded-lg text-xs">🗳️</span> 
            투표 세션 제어
          </h4>
          <p class="text-slate-400 text-[11px] mt-2 break-keep">현재 설정된 갈드컵의 투표 세션를 즉시 종료합니다.</p>
        </div>

        <div class="mt-auto">
          <button 
            v-if="voteSession && !voteSession.isFinished" 
            @click="handleFinishVote" 
            class="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-all text-sm font-black shadow-lg shadow-rose-900/20 flex justify-center items-center gap-2"
          >
            🛑 진행 중인 투표 마감
          </button>
          <button 
            v-else
            @click="handleCreateVote" 
            class="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all text-sm font-black shadow-lg shadow-indigo-900/20 flex justify-center items-center gap-2"
          >
            ✨ 새로운 투표 생성
          </button>
        </div>
      </div>

      <div class="bg-slate-800 rounded-2xl p-5 border border-slate-700 flex flex-col transition-all hover:border-slate-500">
        <div class="mb-4">
          <h4 class="text-slate-200 font-bold text-sm flex items-center gap-2">
            <span class="p-1.5 bg-slate-700 rounded-lg text-xs">🛠️</span> 
            환경 설정 및 삭제
          </h4>
          <p class="text-slate-400 text-[11px] mt-2 break-keep">권한 정책을 수정하거나 게시판 전체를 영구적으로 삭제합니다.</p>
        </div>

        <div class="flex gap-2 mt-auto">
          <button 
            @click="showPolicyModal = true" 
            class="flex-1 py-2.5 bg-slate-700 hover:bg-yellow-600 text-white border border-slate-600 hover:border-yellow-500 rounded-xl transition-all text-xs font-bold"
          >
            정책 변경
          </button>
          <button 
            @click="confirmDeleteBoard" 
            class="flex-1 py-2.5 bg-slate-700 hover:bg-red-600 text-white border border-slate-600 hover:border-red-500 rounded-xl transition-all text-xs font-bold"
          >
            게시판 삭제
          </button>
        </div>
      </div>

    </div>
    
    <BoardPolicyModal
      v-if="showPolicyModal"
      :boardId="String(boardId)"
      :boardPolicy="boardPolicy"
      @close="showPolicyModal = false"
      @updated="boardStore.fetchBoardDetails(String(boardId))"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/axios' 
import { useUserStore } from '@/stores/user'
import { useBoardStore } from '@/stores/board'
import BoardPolicyModal from '@/views/board/BoardPolicyView.vue'

const router = useRouter()
const userStore = useUserStore()
const boardStore = useBoardStore()

const showPolicyModal = ref(false)
const isGeneratingPosts = ref(false)
const isGeneratingComments = ref(false)

const board = computed(() => boardStore.currentBoard)
const boardPolicy = computed(() => boardStore.currentPolicy)
const boardId = computed(() => boardStore.currentBoard?.id)
const voteSession = computed(() => boardStore.activeVoteSession)

const isBoardManager = computed(() => {
  if (!boardPolicy.value?.boardManager || !userStore.id) return false
  return Number(boardPolicy.value.boardManager.id) === Number(userStore.id)
})

const handleCreateVote = () => {
  router.push({ name: 'CreateVoteSession', params: { boardId: boardId.value } })
}

const handleFinishVote = async () => {
  if (!voteSession.value) return;
  if (!confirm("현재 진행 중인 투표를 즉시 마감하시겠습니까?")) return;
  try {
    await api.post(`/boards/${boardId.value}/vote-session/${voteSession.value.id}/finish`);
    alert("투표가 종료되었습니다.");
    await boardStore.fetchActiveVoteSession(boardId.value);
  } catch (error) {
    alert(error.response?.data?.message || "마감 처리에 실패했습니다.");
  }
}

async function handleGeneratePosts() {
  if (!confirm('💡 AI가 투표 주제를 분석하여 게시글 10개를 기획하고 생성합니다.\n진행하시겠습니까?')) return
  isGeneratingPosts.value = true
  try {
    const res = await api.post(`/test/dummy/board/${boardId.value}/posts`)
    alert(res.data) 
    location.reload()
  } catch (err) {
    alert(err.response?.data || '게시글 생성에 실패했습니다.')
  } finally {
    isGeneratingPosts.value = false
  }
}

async function handleGenerateComments() {
  if (!confirm('💡 최신 게시글 10개에 20개의 더미 댓글을 생성합니다.\n여론 분석 테스트를 위한 데이터를 구성합니다.')) return
  isGeneratingComments.value = true
  try {
    const res = await api.post(`/test/dummy/board/${boardId.value}/comments`)
    alert(res.data)
  } catch (err) {
    alert(err.response?.data || '댓글 생성에 실패했습니다.')
  } finally {
    isGeneratingComments.value = false
  }
}

async function deleteBoard() {
  try {
    await api.delete(`/boards/${boardId.value}`)
    alert('게시판이 성공적으로 삭제되었습니다.')
    router.push('/')
  } catch (err) {
    alert(err.response?.data?.message || '삭제 실패')
  }
}

function confirmDeleteBoard() {
  if (!confirm('⚠️ 정말 삭제하시겠습니까?')) return
  const input = prompt(`확인을 위해 주제를 입력하세요: ${board.value?.topic}`)
  if (input === board.value?.topic) deleteBoard()
}
</script>