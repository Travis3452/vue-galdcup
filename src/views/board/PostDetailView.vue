<template>
  <div class="w-full font-sans">
    
    <div class="w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      
      <div class="p-8 md:p-12">
        <div class="space-y-6 pb-8 border-b-2 border-slate-100">
          
          <div v-if="isLoading" class="h-10 w-3/4 bg-slate-200 rounded-xl animate-pulse"></div>
          <h1 v-else class="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight leading-snug break-all">
            {{ post?.title }}
          </h1>

          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm font-medium text-slate-500">
            <div v-if="isLoading" class="flex items-center gap-4 w-full md:w-1/2">
              <div class="h-8 w-24 bg-slate-200 rounded-xl animate-pulse"></div>
              <div class="h-8 w-32 bg-slate-200 rounded-xl animate-pulse"></div>
              <div class="h-8 w-20 bg-slate-200 rounded-xl animate-pulse"></div>
            </div>
            
            <div v-else class="flex items-center gap-4">
              <span class="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl text-slate-700 border border-slate-100">
                <span class="text-indigo-500">👤</span> {{ post?.authorNickname }}
              </span>
              <span class="flex items-center gap-1.5">
                📅 {{ formatDate(post?.createdAt) }}
                <span v-if="post?.updatedAt && post?.updatedAt !== post?.createdAt" class="text-xs text-slate-400 italic">(수정됨)</span>
              </span>
              <span class="flex items-center gap-1.5 text-indigo-500 font-bold">
                👀 조회수 {{ post?.viewCount || post?.view || 0 }}
              </span>
            </div>

            <div class="flex gap-2 shrink-0">
              <template v-if="!isLoading && store.id && post?.authorId === store.id">
                <button @click="editPost" class="px-4 py-2 bg-yellow-50 text-yellow-600 border border-yellow-200 rounded-xl text-sm font-bold hover:bg-yellow-100 transition">
                  수정
                </button>
                <button @click="deletePost" class="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-bold hover:bg-red-100 transition">
                  삭제
                </button>
              </template>

              <template v-if="!isLoading && (boardStore.isBoardManager || boardStore.isSubManager)">
                <button @click="adminDeletePost" class="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition border border-slate-700">
                  관리자 삭제
                </button>
              </template>
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="min-h-[400px] py-12 space-y-4 w-full max-w-none">
          <div class="h-6 w-full bg-slate-200 rounded animate-pulse"></div>
          <div class="h-6 w-full bg-slate-200 rounded animate-pulse"></div>
          <div class="h-6 w-5/6 bg-slate-200 rounded animate-pulse"></div>
          <div class="h-6 w-4/6 bg-slate-200 rounded animate-pulse"></div>
          <div class="h-48 w-full bg-slate-200 rounded-2xl animate-pulse mt-8"></div>
        </div>
        
        <div v-else class="prose max-w-none w-full text-slate-800 text-base md:text-lg leading-relaxed min-h-[400px] py-12 break-words" v-html="post?.content"></div>

        <div v-if="isLoading" class="flex justify-center items-center gap-8 py-10">
          <div class="w-32 h-32 rounded-3xl bg-slate-200 animate-pulse"></div>
          <div class="w-32 h-32 rounded-3xl bg-slate-200 animate-pulse"></div>
        </div>
        
        <div v-else class="flex justify-center items-center gap-8 py-10">
          <button @click="reactToPost('LIKE')" 
                  class="group flex flex-col items-center justify-center w-32 h-32 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-indigo-600 hover:border-indigo-600 shadow-sm hover:shadow-xl hover:shadow-indigo-200 transition-all cursor-pointer">
            <span class="text-4xl mb-2 group-hover:scale-125 transition-transform duration-300">👍</span>
            <span class="text-base font-black text-indigo-600 group-hover:text-white transition-colors">좋아요</span>
            <span class="text-xl font-black text-slate-800 group-hover:text-white mt-1">{{ post?.likeCount }}</span>
          </button>

          <button @click="reactToPost('DISLIKE')" 
                  class="group flex flex-col items-center justify-center w-32 h-32 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-rose-600 hover:border-rose-600 shadow-sm hover:shadow-xl hover:shadow-rose-200 transition-all cursor-pointer">
            <span class="text-4xl mb-2 group-hover:scale-125 transition-transform duration-300">👎</span>
            <span class="text-base font-black text-rose-600 group-hover:text-white transition-colors">싫어요</span>
            <span class="text-xl font-black text-slate-800 group-hover:text-white mt-1">{{ post?.dislikeCount }}</span>
          </button>
        </div>
      </div>

      <div class="h-2 w-full bg-slate-50 border-y border-slate-100"></div>

      <div v-if="!isLoading" class="p-8 md:p-12 bg-white">
        <h2 class="text-2xl font-extrabold text-slate-800 mb-8 flex items-center gap-3">
          <span class="text-indigo-600">💬</span> 댓글
        </h2>
        
        </div>
      
      <div v-if="!isLoading" class="p-8 md:p-12 border-t border-slate-200 bg-slate-50">
        <PostList
          :boardId="route.params.boardId"
          :page="Number(route.query.page) || 0"
          :selectedPostId="post?.id"
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useBoardStore } from '@/stores/board'
import api from '@/axios'
import PostList from '@/views/board/PostListView.vue'

const store = useUserStore()
const route = useRoute()
const router = useRouter()
const boardStore = useBoardStore()

// --- 상태 관리 ---
const post = ref(null)
const comments = ref([])
const replies = ref({})
const newComment = ref('')
const newReplies = ref({})
const currentPage = ref(0)
const totalPages = ref(0)
const hasNextPage = ref(false)
const activeReplyBox = ref(null)

// ✨ 로딩 상태 변수 추가 (기본값 true)
const isLoading = ref(true)

// --- Computed ---
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  const start = Math.max(1, currentPage.value + 1 - Math.floor(maxVisible / 2))
  const end = Math.min(totalPages.value, start + maxVisible - 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

// --- 유틸리티 ---
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })
}

// 게시글 데이터 호출
async function fetchPost(postId) {
  try {
    const res = await api.get(`/posts/${postId}`)
    post.value = res.data
  } catch (err) {
    console.error('게시글 조회 실패:', err)
    alert(err.response?.data?.message || '게시글을 불러오는 중 오류가 발생했습니다.')
  }
}

// 댓글 및 답글 호출
async function fetchComments(postId) {
  try {
    const res = await api.get(`/comments/post/${postId}`, {
      params: { size: 30, page: currentPage.value }
    })

    comments.value = res.data.content ?? res.data
    totalPages.value = res.data.totalPages ?? 1
    hasNextPage.value = !res.data.last

    const newRepliesMap = { ...replies.value }
    for (const comment of comments.value) {
      const replyRes = await api.get(`/replies/comment/${comment.id}`)
      newRepliesMap[comment.id] = replyRes.data
    }
    replies.value = newRepliesMap
  } catch (err) {
    console.error('댓글 조회 실패:', err)
  }
}

// 댓글 작성
async function createComment() {
  if (!newComment.value.trim()) return
  try {
    await api.post(`/comments`, {
      postId: post.value.id,
      content: newComment.value.trim()
    })
    newComment.value = ''
    await fetchComments(post.value.id)
  } catch (err) {
    alert(err.response?.data?.message || '댓글 작성 중 오류가 발생했습니다.')
  }
}

// 답글 작성
async function createReply(commentId) {
  const content = newReplies.value[commentId]
  if (!content || !content.trim()) return
  try {
    await api.post(`/replies`, {
      commentId,
      content: content.trim()
    })
    newReplies.value[commentId] = ''
    activeReplyBox.value = null
    await fetchComments(post.value.id)
  } catch (err) {
    alert(err.response?.data?.message || '답글 작성 중 오류가 발생했습니다.')
  }
}

// 댓글 수정/삭제
async function editComment(comment) {
  const newContent = prompt('댓글 수정:', comment.content)
  if (!newContent) return
  try {
    await api.put(`/comments/${comment.id}`, { content: newContent })
    await fetchComments(post.value.id)
  } catch (err) {
    alert('댓글 수정 실패')
  }
}

async function deleteComment(commentId) {
  if (!confirm('댓글을 삭제하시겠습니까?')) return
  try {
    await api.delete(`/comments/${commentId}`)
    await fetchComments(post.value.id)
  } catch (err) {
    alert('댓글 삭제 실패')
  }
}

// 답글 수정/삭제
async function editReply(reply) {
  const newContent = prompt('답글 수정:', reply.content)
  if (!newContent) return
  try {
    await api.put(`/replies/${reply.id}`, { content: newContent })
    await fetchComments(post.value.id)
  } catch (err) {
    alert('답글 수정 실패')
  }
}

async function deleteReply(replyId) {
  if (!confirm('답글을 삭제하시겠습니까?')) return
  try {
    await api.delete(`/replies/${replyId}`)
    await fetchComments(post.value.id)
  } catch (err) {
    alert('답글 삭제 실패')
  }
}

// 게시글 편집 및 삭제
function editPost() {
  const boardId = route.params.boardId
  const postId = post.value?.id
  router.push(`/boards/${boardId}/posts/${postId}/edit`)
}

async function deletePost() {
  if (!confirm('게시글을 삭제하시겠습니까?')) return
  try {
    await api.delete(`/posts/${post.value.id}`)
    alert('게시글이 삭제되었습니다.')
    router.push(`/boards/${route.params.boardId}`)
  } catch (err) {
    alert(err.response?.data?.message || '게시글 삭제 실패')
  }
}

// 관리자 권한 삭제
async function adminDeletePost() {
  if (!confirm('관리자 권한으로 게시글을 삭제하시겠습니까?')) return
  try {
    await api.delete(`/boards/${route.params.boardId}/posts/${post.value.id}/admin-delete`)
    alert('관리자 권한으로 삭제되었습니다.')
    router.push(`/boards/${route.params.boardId}`)
  } catch (err) {
    alert('관리자 삭제 실패')
  }
}

// 좋아요/싫어요 반응
async function reactToPost(type) {
  try {
    await api.post(`/posts/${post.value.id}/reactions`, {}, { params: { type } })
    await fetchPost(post.value.id)
  } catch (err) {
    alert(err.response?.data?.message || '반응 처리 중 오류가 발생했습니다.')
  }
}

// UI 제어
function toggleReplyBox(commentId) {
  activeReplyBox.value = activeReplyBox.value === commentId ? null : commentId
}

async function goToPage(page) {
  currentPage.value = page
  await fetchComments(post.value.id)
}

async function prevPage() {
  if (currentPage.value > 0) await goToPage(currentPage.value - 1)
}

async function nextPage() {
  if (hasNextPage.value) await goToPage(currentPage.value + 1)
}

// --- 초기화 (✨ Promise.all 병렬 처리 & 로딩 상태 제어) ---
onMounted(async () => {
  const postId = route.params.postId
  isLoading.value = true // 스켈레톤 애니메이션 시작

  try {
    // 게시글, 댓글, 게시판 정책을 동시에 불러옵니다 (체감 속도 🚀)
    await Promise.all([
      fetchPost(postId),
      fetchComments(postId),
      boardStore.fetchBoardPolicy(route.params.boardId)
    ])
  } catch (err) {
    console.error('데이터 로딩 실패:', err)
  } finally {
    isLoading.value = false // 스켈레톤 종료, 화면 렌더링
  }
})
</script>