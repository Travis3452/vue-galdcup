<template>
  <div class="w-full font-sans">
    
    <div class="w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      
      <div class="p-8 md:p-12">
        <div class="space-y-6 pb-8 border-b-2 border-slate-100">
          <h1 class="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight leading-snug break-all">
            {{ post?.title }}
          </h1>

          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm font-medium text-slate-500">
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl text-slate-700 border border-slate-100">
                <span class="text-indigo-500">👤</span> {{ post?.authorNickname }}
              </span>
              <span class="flex items-center gap-1.5">
                ⏰ {{ formatDate(post?.createdAt) }}
                <span v-if="post?.updatedAt && post?.updatedAt !== post?.createdAt" class="text-xs text-slate-400 italic">(수정됨)</span>
              </span>
              <span class="flex items-center gap-1.5 text-indigo-500 font-bold">
                👁️ {{ post?.viewCount || post?.view || 0 }}
              </span>
            </div>

            <div class="flex gap-2 shrink-0">
              <template v-if="store.id && post?.authorId === store.id">
                <button @click="editPost" class="px-4 py-2 bg-yellow-50 text-yellow-600 border border-yellow-200 rounded-xl text-sm font-bold hover:bg-yellow-100 transition">
                  수정
                </button>
                <button @click="deletePost" class="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-bold hover:bg-red-100 transition">
                  삭제
                </button>
              </template>

              <template v-if="boardStore.isBoardManager || boardStore.isSubManager">
                <button @click="adminDeletePost" class="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition border border-slate-700">
                  관리자 삭제
                </button>
              </template>
            </div>
          </div>
        </div>

        <div class="prose max-w-none w-full text-slate-800 text-base md:text-lg leading-relaxed min-h-[400px] py-12 break-words" v-html="post?.content"></div>

        <div class="flex justify-center items-center gap-8 py-10">
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

      <div class="p-8 md:p-12 bg-white">
        <h2 class="text-2xl font-extrabold text-slate-800 mb-8 flex items-center gap-3">
          <span class="text-indigo-600">💬</span> 댓글
        </h2>

        <div v-if="comments.length > 0" class="space-y-6 mb-12">
          <div v-for="comment in comments" :key="comment.id" class="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition">
            <div class="flex justify-between items-start mb-3">
              <div class="flex items-center gap-3">
                <span class="font-bold text-slate-800 text-lg">👤 {{ comment.authorNickname }}</span>
                <span class="text-sm font-medium text-slate-500">
                  {{ formatDate(comment.createdAt) }}
                  <span v-if="comment.updatedAt && comment.updatedAt !== comment.createdAt" class="italic">(수정됨)</span>
                </span>
              </div>
              <div v-if="store.id && comment.authorId === store.id" class="flex gap-3">
                <button @click="editComment(comment)" class="text-sm font-bold text-slate-400 hover:text-yellow-600 transition">수정</button>
                <button @click="deleteComment(comment.id)" class="text-sm font-bold text-slate-400 hover:text-red-600 transition">삭제</button>
              </div>
            </div>
            
            <p class="text-slate-800 text-lg leading-relaxed mb-4 font-medium">{{ comment.content }}</p>

            <button @click="toggleReplyBox(comment.id)" class="text-sm font-bold text-indigo-500 hover:text-indigo-700 transition flex items-center gap-1">
              ↳ 대댓글 작성
            </button>

            <div v-if="replies[comment.id] && replies[comment.id].length > 0" class="mt-4 ml-4 md:ml-8 pl-4 border-l-2 border-indigo-200 space-y-4">
              <div v-for="reply in replies[comment.id]" :key="reply.id" class="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div class="flex justify-between items-start mb-2">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-800 text-sm">👤 {{ reply.authorNickname }}</span>
                    <span class="text-xs font-medium text-slate-500">
                      {{ formatDate(reply.createdAt) }}
                      <span v-if="reply.updatedAt && reply.updatedAt !== reply.createdAt" class="italic">(수정됨)</span>
                    </span>
                  </div>
                  <div v-if="store.id && reply.authorId === store.id" class="flex gap-2">
                    <button @click="editReply(reply)" class="text-xs font-bold text-slate-400 hover:text-yellow-600 transition">수정</button>
                    <button @click="deleteReply(reply.id)" class="text-xs font-bold text-slate-400 hover:text-red-600 transition">삭제</button>
                  </div>
                </div>
                <p class="text-slate-800 text-sm font-medium">{{ reply.content }}</p>
              </div>
            </div>

            <div v-if="activeReplyBox === comment.id" class="mt-4 ml-4 md:ml-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
              <textarea v-model="newReplies[comment.id]" rows="2"
                class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none bg-slate-50"
                placeholder="대댓글을 입력하세요..."></textarea>
              <div class="flex justify-end">
                <button @click="createReply(comment.id)" class="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md">
                  작성 완료
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="py-12 text-center text-slate-400 font-medium italic border-2 border-dashed border-slate-200 rounded-2xl mb-8">
          아직 작성된 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
        </div>

        <div class="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col gap-4">
          <textarea v-model="newComment" rows="3"
            class="w-full border border-slate-300 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-slate-800 font-medium bg-white"
            placeholder="댓글을 입력하세요."></textarea>
          <div class="flex justify-end">
            <button @click="createComment" class="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md">
              작성 완료
            </button>
          </div>
        </div>

        <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-10">
          <button @click="prevPage" :disabled="currentPage === 0"
            class="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 disabled:opacity-40 transition">이전</button>
          
          <button v-for="page in visiblePages" :key="page" @click="goToPage(page - 1)"
            :class="['px-4 py-2 rounded-lg font-bold transition', 
              currentPage + 1 === page 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50']">
            {{ page }}
          </button>

          <button @click="nextPage" :disabled="!hasNextPage"
            class="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 disabled:opacity-40 transition">다음</button>
        </div>
      </div>
      
      <div class="p-8 md:p-12 border-t border-slate-200 bg-slate-50">
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
import PostList from '@/components/board/pages/PostList.vue'

const store = useUserStore()
const route = useRoute()
const router = useRouter()
const boardStore = useBoardStore()

// --- 상태 변수 ---
const post = ref(null)
const comments = ref([])
const replies = ref({})
const newComment = ref('')
const newReplies = ref({})
const currentPage = ref(0)
const totalPages = ref(0)
const hasNextPage = ref(false)
const activeReplyBox = ref(null)

// --- Computed ---
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  const start = Math.max(1, currentPage.value + 1 - Math.floor(maxVisible / 2))
  const end = Math.min(totalPages.value, start + maxVisible - 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

// --- 함수 ---
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })
}

// 게시글 데이터 페칭
async function fetchPost(postId) {
  try {
    const res = await api.get(`/posts/${postId}`)
    post.value = res.data
  } catch (err) {
    console.error('게시글 조회 실패:', err)
    alert(err.response?.data?.message || '게시글을 불러오는 중 오류가 발생했습니다.')
  }
}

// 댓글 페칭
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
    alert(err.response?.data?.message || '댓글을 불러오는 중 오류가 발생했습니다.')
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
    console.error('댓글 작성 실패:', err)
    alert(err.response?.data?.message || '댓글 작성 중 오류가 발생했습니다.')
  }
}

// 대댓글 작성
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
    console.error('대댓글 작성 실패:', err)
    alert(err.response?.data?.message || '대댓글 작성 중 오류가 발생했습니다.')
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
    console.error('댓글 수정 실패:', err)
    alert(err.response?.data?.message || '댓글 수정 중 오류가 발생했습니다.')
  }
}

async function deleteComment(commentId) {
  if (!confirm('댓글을 삭제하시겠습니까?')) return
  try {
    await api.delete(`/comments/${commentId}`)
    await fetchComments(post.value.id)
  } catch (err) {
    console.error('댓글 삭제 실패:', err)
    alert(err.response?.data?.message || '댓글 삭제 중 오류가 발생했습니다.')
  }
}

// 대댓글 수정/삭제
async function editReply(reply) {
  const newContent = prompt('대댓글 수정:', reply.content)
  if (!newContent) return
  try {
    await api.put(`/replies/${reply.id}`, { content: newContent })
    await fetchComments(post.value.id)
  } catch (err) {
    console.error('대댓글 수정 실패:', err)
    alert(err.response?.data?.message || '대댓글 수정 중 오류가 발생했습니다.')
  }
}

async function deleteReply(replyId) {
  if (!confirm('대댓글을 삭제하시겠습니까?')) return
  try {
    await api.delete(`/replies/${replyId}`)
    await fetchComments(post.value.id)
  } catch (err) {
    console.error('대댓글 삭제 실패:', err)
    alert(err.response?.data?.message || '대댓글 삭제 중 오류가 발생했습니다.')
  }
}

// 게시글 조작
function editPost() {
  const boardId = route.params.boardId
  const postId = post.value?.id
  if (!postId) return
  router.push(`/boards/${boardId}/posts/${postId}/update`)
}

async function deletePost() {
  if (!confirm('게시글을 삭제하시겠습니까?')) return
  try {
    await api.delete(`/posts/${post.value.id}`)
    alert('게시글이 삭제되었습니다.')
    router.push(`/boards/${route.params.boardId}`)
  } catch (err) {
    console.error('게시글 삭제 실패:', err)
    alert(err.response?.data?.message || '게시글 삭제 중 오류가 발생했습니다.')
  }
}

// 관리자 삭제
async function adminDeletePost() {
  if (!confirm('관리자 권한으로 게시글을 삭제하시겠습니까?')) return
  try {
    await api.delete(`/boards/${route.params.boardId}/posts/${post.value.id}/admin-delete`)
    alert('관리자 권한으로 게시글이 삭제되었습니다.')
    router.push(`/boards/${route.params.boardId}`)
  } catch (err) {
    console.error('관리자 게시글 삭제 실패:', err)
    alert(err.response?.data?.message || '관리자 게시글 삭제 중 오류가 발생했습니다.')
  }
}

// 좋아요/싫어요
async function reactToPost(type) {
  try {
    await api.post(`/posts/${post.value.id}/reactions`, {}, { params: { type } })
    await fetchPost(post.value.id)
  } catch (err) {
    console.error('게시글 반응 실패:', err)
    alert(err.response?.data?.message || '게시글 반응 처리 중 오류가 발생했습니다.')
  }
}

// 기타 UI 컨트롤
function toggleReplyBox(commentId) {
  activeReplyBox.value = activeReplyBox.value === commentId ? null : commentId
}

async function goToPage(page) {
  if (page < 0 || page >= totalPages.value) return
  currentPage.value = page
  await fetchComments(post.value.id)
}

async function prevPage() {
  if (currentPage.value === 0) return
  await goToPage(currentPage.value - 1)
}

async function nextPage() {
  if (!hasNextPage.value) return
  await goToPage(currentPage.value + 1)
}

// --- Lifecycle ---
onMounted(async () => {
  const postId = route.params.postId
  await fetchPost(postId)
  await fetchComments(postId)
  await boardStore.fetchBoardPolicy(route.params.boardId)
})
</script>