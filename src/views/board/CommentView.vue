<template>
  <div class="p-4 md:p-12 bg-white">
    <h2 class="text-xl md:text-2xl font-extrabold text-slate-800 mb-6 md:mb-8 flex items-center gap-2">
      <span class="text-indigo-600">💬</span> 댓글
    </h2>

    <div v-if="comments.length > 0" class="space-y-4 md:space-y-6 mb-10 md:mb-12">
      <div v-for="comment in comments" :key="comment.id" 
           class="p-4 md:p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition">
        
        <div class="flex justify-between items-start mb-2 md:mb-3">
          <div class="flex items-center gap-2 md:gap-3">
            <span class="font-bold text-slate-800 text-sm md:text-lg">👤 {{ comment.authorNickname }}</span>
            <span class="text-[10px] md:text-sm font-medium text-slate-500">
              {{ formatDate(comment.createdAt) }}
              <span v-if="comment.updatedAt && comment.updatedAt !== comment.createdAt" class="italic">(수정됨)</span>
            </span>
          </div>
          <div v-if="store.id && comment.authorId === store.id" class="flex gap-2 md:gap-3 shrink-0">
            <button v-if="editingId !== comment.id" @click="startEdit(comment.id, comment.content)" class="text-[11px] md:text-sm font-bold text-slate-400 hover:text-yellow-600 transition">수정</button>
            <button v-if="editingId !== comment.id" @click="deleteComment(comment.id)" class="text-[11px] md:text-sm font-bold text-slate-400 hover:text-red-600 transition">삭제</button>
          </div>
        </div>
        
        <div v-if="editingId === comment.id" class="mt-2 mb-4">
          <textarea v-model="editContent" rows="2" 
            class="w-full border border-indigo-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none bg-white shadow-inner" 
            placeholder="수정할 내용을 입력하세요..."></textarea>
          <div class="flex justify-end gap-2 mt-2">
            <button @click="cancelEdit" class="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition text-xs md:text-sm">취소</button>
            <button @click="saveEdit(comment.id)" class="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-sm text-xs md:text-sm">저장</button>
          </div>
        </div>
        <p v-else class="text-slate-800 text-sm md:text-lg leading-relaxed mb-4 font-medium break-words">{{ comment.content }}</p>

        <div v-if="comment.childrenComments && comment.childrenComments.length > 0" class="mt-4 ml-4 md:ml-8 pl-3 md:pl-4 border-l-2 border-indigo-200 space-y-3 md:space-y-4">
          <div v-for="reply in comment.childrenComments" :key="reply.id" class="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-100">
            <div class="flex justify-between items-start mb-2">
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-800 text-xs md:text-sm">👤 {{ reply.authorNickname }}</span>
                <span class="text-[9px] md:text-xs font-medium text-slate-500">{{ formatDate(reply.createdAt) }}</span>
              </div>
              <div v-if="store.id && reply.authorId === store.id" class="flex gap-2">
                <button v-if="editingId !== reply.id" @click="startEdit(reply.id, reply.content)" class="text-[10px] md:text-xs font-bold text-slate-400 hover:text-yellow-600 transition">수정</button>
                <button v-if="editingId !== reply.id" @click="deleteComment(reply.id)" class="text-[10px] md:text-xs font-bold text-slate-400 hover:text-red-600 transition">삭제</button>
              </div>
            </div>
            <p v-if="editingId !== reply.id" class="text-slate-800 text-xs md:text-sm font-medium break-words">{{ reply.content }}</p>
            <div v-else class="mt-2">
              <textarea v-model="editContent" rows="2" class="w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm bg-white"></textarea>
              <div class="flex justify-end gap-2 mt-2">
                <button @click="cancelEdit" class="text-xs font-bold text-slate-400">취소</button>
                <button @click="saveEdit(reply.id)" class="text-xs font-bold text-indigo-600">저장</button>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 flex flex-col items-end gap-3 w-full">
          <button 
            v-if="editingId !== comment.id" 
            @click="toggleReplyBox(comment.id)" 
            class="text-[11px] md:text-sm font-bold transition flex items-center gap-1 px-4 py-1.5 rounded-full border shadow-sm"
            :class="activeReplyBox === comment.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50'"
          >
            {{ activeReplyBox === comment.id ? '닫기' : '대댓글 작성' }}
          </button>

          <transition name="fade">
            <div v-if="activeReplyBox === comment.id" class="w-[calc(100%-1rem)] md:w-[calc(100%-2rem)] bg-white p-3 md:p-4 rounded-xl border-2 border-indigo-100 shadow-md flex flex-col gap-3">
              <textarea v-model="newReplies[comment.id]" rows="2" class="w-full border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none bg-slate-50" placeholder="대댓글 내용을 입력하세요..."></textarea>
              <div class="flex justify-end">
                <button @click="createReply(comment.id)" class="px-5 md:px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-md text-xs md:text-sm">작성 완료</button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <div v-else class="py-12 text-center text-slate-400 font-medium italic border-2 border-dashed border-slate-200 rounded-2xl mb-8">
      아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
    </div>

    <div class="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200 flex flex-col gap-3 md:gap-4 mb-10">
      <textarea v-model="newComment" rows="3" class="w-full border border-slate-300 rounded-xl px-4 md:px-5 py-3 md:py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-medium bg-white text-sm md:text-base" placeholder="댓글을 입력하세요..."></textarea>
      <div class="flex justify-end">
        <button @click="createComment" class="px-6 md:px-8 py-2.5 md:py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md">작성 완료</button>
      </div>
    </div>

    <div v-if="totalPages > 1" class="flex justify-center items-center gap-1 md:gap-3 mt-8 md:mt-12 pb-10">
      <button @click="prevPage" :disabled="currentPage === 0" class="px-3 py-2 md:px-4 md:py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 disabled:opacity-40 transition shadow-sm text-xs md:text-sm">이전</button>
      
      <div class="flex items-center gap-1 md:gap-2">
        <button v-for="page in visiblePages" :key="page" @click="goToPage(page - 1)"
          :class="['w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-xl font-black transition-all text-xs md:text-sm shadow-sm', 
            currentPage + 1 === page ? 'bg-indigo-600 text-white scale-110 shadow-indigo-200 shadow-lg' : 'bg-white border border-slate-100 text-slate-400 hover:border-indigo-300 hover:text-indigo-600']">
          {{ page }}
        </button>
      </div>

      <button @click="nextPage" :disabled="!hasNextPage" class="px-3 py-2 md:px-4 md:py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 disabled:opacity-40 transition shadow-sm text-xs md:text-sm">다음</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useUserStore } from '@/stores/user'
import api from '@/axios'

const props = defineProps({
  postId: { type: [Number, String], required: true }
})

const store = useUserStore()

// 상태 관리
const comments = ref([])
const newComment = ref('')
const currentPage = ref(0)
const totalPages = ref(1)
const hasNextPage = ref(false)
const replies = ref({})
const newReplies = ref({})
const activeReplyBox = ref(null)
const editingId = ref(null)
const editContent = ref('')

// 화면 너비 상태 (페이지네이션 개수 조절용)
const windowWidth = ref(window.innerWidth)
const updateWidth = () => { windowWidth.value = window.innerWidth }

// 날짜 포맷
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/**
 * 🔍 핵심 수정: 백엔드 JSON 구조에 맞춘 데이터 페칭
 */
async function fetchComments() {
  try {
    const res = await api.get(`/comments/post/${props.postId}`, {
      params: { size: 10, page: currentPage.value }
    })
    
    // 데이터 로깅 (확인용)
    console.log('Backend Data:', res.data)

    // [중요] 응답 구조 매핑
    comments.value = res.data.content || []
    
    // [핵심] page 객체 내부의 totalPages와 number 사용
    if (res.data.page) {
      totalPages.value = Number(res.data.page.totalPages) || 1
      hasNextPage.value = (res.data.page.number + 1) < res.data.page.totalPages
    }
  } catch (err) {
    console.error('댓글 조회 실패:', err)
  }
}

// 댓글 생성
async function createComment() {
  if (!newComment.value.trim()) return
  try {
    await api.post(`/comments/post/${props.postId}`, { content: newComment.value.trim(), parentCommentId: null })
    newComment.value = ''
    currentPage.value = 0
    await fetchComments()
  } catch (err) { alert(err.response?.data?.message || '로그인이 필요합니다.') }
}

// 대댓글 생성
async function createReply(commentId) {
  const content = newReplies.value[commentId]
  if (!content || !content.trim()) return
  try {
    await api.post(`/comments/post/${props.postId}`, { content: content.trim(), parentCommentId: commentId })
    newReplies.value[commentId] = ''
    activeReplyBox.value = null
    await fetchComments()
  } catch (err) { alert('대댓글 작성 실패') }
}

// 수정/삭제 로직
function startEdit(id, currentContent) { editingId.value = id; editContent.value = currentContent; }
function cancelEdit() { editingId.value = null; editContent.value = ''; }
async function saveEdit(id) {
  if (!editContent.value.trim()) return
  try {
    await api.put(`/comments/${id}`, { content: editContent.value.trim() })
    cancelEdit(); await fetchComments();
  } catch (err) { alert('수정 실패') }
}
async function deleteComment(id) {
  if (!confirm('정말 삭제하시겠습니까?')) return
  try { await api.delete(`/comments/${id}`); await fetchComments(); } catch (err) { alert('삭제 실패') }
}

function toggleReplyBox(commentId) { activeReplyBox.value = activeReplyBox.value === commentId ? null : commentId }

/**
 * ⭐ 슬라이딩 윈도우 페이지네이션 계산
 */
const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value + 1
  const maxVisible = windowWidth.value < 768 ? 3 : 5
  
  let start = Math.max(1, current - Math.floor(maxVisible / 2))
  let end = Math.min(total, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  const pages = []
  for (let i = Math.max(1, start); i <= end; i++) { pages.push(i) }
  return pages
})

async function goToPage(page) {
  currentPage.value = page
  await fetchComments()
  // 스무스하게 댓글 상단으로 이동
  window.scrollTo({ top: document.querySelector('h2').offsetTop - 50, behavior: 'smooth' })
}

async function prevPage() { if (currentPage.value > 0) await goToPage(currentPage.value - 1) }
async function nextPage() { if (hasNextPage.value) await goToPage(currentPage.value + 1) }

// 생명주기 훅
onMounted(() => { 
  if (props.postId) fetchComments()
  window.addEventListener('resize', updateWidth)
})

onUnmounted(() => { window.removeEventListener('resize', updateWidth) })

watch(() => props.postId, (newVal) => {
  if (newVal) { currentPage.value = 0; fetchComments() }
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
textarea { word-break: break-all; }
</style>