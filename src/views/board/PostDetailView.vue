<template>
  <div class="w-full font-sans pb-10">
    
    <div class="w-full bg-white rounded-2xl md:rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      
      <div class="p-5 md:p-12">
        <div class="space-y-4 md:space-y-6 pb-6 md:pb-8 border-b-2 border-slate-100">
          
          <div v-if="isLoading" class="flex items-center gap-3">
            <div class="h-8 w-20 bg-slate-200 rounded-xl animate-pulse"></div>
            <div class="h-8 flex-1 bg-slate-200 rounded-xl animate-pulse"></div>
          </div>

          <div v-else class="flex flex-col gap-3">
            <div>
              <span class="inline-flex items-center px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs md:text-sm font-black border border-indigo-100 uppercase tracking-wider">
                {{ post?.categoryType === 'NOTICE' ? '📢 ' : '' }}{{ post?.categoryName || '일반' }}
              </span>
            </div>
            <h1 class="text-xl md:text-3xl font-extrabold text-slate-800 tracking-tight leading-snug break-all">
              {{ post?.title }}
            </h1>
          </div>

          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs md:text-sm font-medium text-slate-500">
            <div v-if="isLoading" class="flex items-center gap-4 w-full md:w-1/2">
              <div class="h-6 w-20 bg-slate-200 rounded-lg animate-pulse"></div>
              <div class="h-6 w-32 bg-slate-200 rounded-lg animate-pulse"></div>
            </div>
            
            <div v-else class="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span class="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg text-slate-700 border border-slate-100">
                <span class="text-indigo-500">👤</span> {{ post?.authorNickname }}
              </span>
              <span class="flex items-center gap-1">
                📅 {{ formatDate(post?.createdAt) }}
                <span v-if="post?.updatedAt && post?.updatedAt !== post?.createdAt" class="text-[10px] text-slate-400 italic">(수정됨)</span>
              </span>
              <span class="flex items-center gap-1 text-indigo-500 font-bold">
                👀 {{ post?.viewCount || post?.view || 0 }}
              </span>
            </div>

            <div class="flex gap-2 w-full sm:w-auto justify-end">
              <template v-if="!isLoading && store.id && post?.authorId === store.id">
                <button @click="editPost" class="px-3 py-1.5 bg-yellow-50 text-yellow-600 border border-yellow-100 rounded-lg text-xs font-bold hover:bg-yellow-100 transition">
                  수정
                </button>
                <button @click="deletePost" class="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold hover:bg-red-100 transition">
                  삭제
                </button>
              </template>

              <template v-if="!isLoading && (boardStore.isBoardManager || boardStore.isSubManager)">
                <button @click="adminDeletePost" class="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition">
                  관리자 삭제
                </button>
              </template>
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="min-h-[300px] py-8 space-y-4">
          <div class="h-5 w-full bg-slate-100 rounded animate-pulse"></div>
          <div class="h-5 w-5/6 bg-slate-100 rounded animate-pulse"></div>
          <div class="h-40 w-full bg-slate-50 rounded-2xl animate-pulse mt-6"></div>
        </div>
        
        <div v-else 
          class="prose max-w-none w-full text-slate-800 text-sm md:text-lg leading-relaxed min-h-[300px] py-8 md:py-12 break-words" 
          v-html="DOMPurify.sanitize(post?.content || '')">
        </div>

        <div v-if="isLoading" class="flex justify-center items-center gap-4 md:gap-8 py-6">
          <div class="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-slate-100 animate-pulse"></div>
          <div class="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-slate-100 animate-pulse"></div>
        </div>
        
        <div v-else class="flex justify-center items-center gap-4 md:gap-8 py-6 md:py-10">
          <button @click="reactToPost('LIKE')" 
                  class="group flex flex-col items-center justify-center w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-3xl bg-slate-50 border border-slate-100 hover:bg-indigo-600 hover:border-indigo-600 shadow-sm hover:shadow-xl transition-all">
            <span class="text-2xl md:text-4xl mb-1 md:mb-2 group-hover:scale-110 transition-transform">👍</span>
            <span class="text-xs md:text-base font-black text-indigo-600 group-hover:text-white transition-colors">좋아요</span>
            <span class="text-sm md:text-xl font-black text-slate-800 group-hover:text-white mt-0.5 md:mt-1">{{ post?.likeCount }}</span>
          </button>

          <button @click="reactToPost('DISLIKE')" 
                  class="group flex flex-col items-center justify-center w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-3xl bg-slate-50 border border-slate-100 hover:bg-rose-600 hover:border-rose-600 shadow-sm hover:shadow-xl transition-all">
            <span class="text-2xl md:text-4xl mb-1 md:mb-2 group-hover:scale-110 transition-transform">👎</span>
            <span class="text-xs md:text-base font-black text-rose-600 group-hover:text-white transition-colors">싫어요</span>
            <span class="text-sm md:text-xl font-black text-slate-800 group-hover:text-white mt-0.5 md:mt-1">{{ post?.dislikeCount }}</span>
          </button>
        </div>
      </div>

      <div class="h-1.5 w-full bg-slate-50 border-y border-slate-100"></div>

      <CommentView v-if="post && !isLoading" :postId="post.id" />
      
      <div v-if="!isLoading" class="p-5 md:p-12 border-t border-slate-200 bg-slate-50">
        <PostList
          :boardId="route.params.boardId"
          :selectedPostId="post?.id"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useBoardStore } from '@/stores/board'
import api from '@/axios'
import PostList from '@/views/board/PostListView.vue'
import CommentView from '@/views/board/CommentView.vue'
import DOMPurify from 'dompurify'

const store = useUserStore()
const route = useRoute()
const router = useRouter()
const boardStore = useBoardStore()

const post = ref(null)
const isLoading = ref(true)

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('ko-KR', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

async function fetchPost(postId) {
  try {
    const res = await api.get(`/posts/${postId}`)
    post.value = res.data
  } catch (err) {
    console.error('게시글 조회 실패:', err)
    alert(err.response?.data?.message || '게시글을 불러오지 못했습니다.')
    router.back()
  }
}

function editPost() {
  router.push(`/boards/${route.params.boardId}/posts/${post.value.id}/edit`)
}

async function deletePost() {
  if (!confirm('정말 삭제하시겠습니까?')) return
  try {
    await api.delete(`/posts/${post.value.id}`)
    alert('삭제되었습니다.')
    router.push(`/boards/${route.params.boardId}`)
  } catch (err) { alert('삭제 실패') }
}

async function adminDeletePost() {
  if (!confirm('관리자 권한으로 삭제하시겠습니까?')) return
  try {
    await api.delete(`/posts/board/${route.params.boardId}/post/${post.value.id}`)
    alert('관리자 권한으로 삭제되었습니다.')
    router.push(`/boards/${route.params.boardId}`)
  } catch (err) { alert('관리자 삭제 실패') }
}

async function reactToPost(type) {
  try {
    await api.post(`/posts/${post.value.id}/reactions`, {}, { params: { type } })
    await fetchPost(post.value.id)
  } catch (err) {
    alert(err.response?.data?.message || '로그인이 필요한 서비스입니다.')
  }
}

const loadData = async (postId) => {
  isLoading.value = true
  try {
    await Promise.all([
      fetchPost(postId),
      boardStore.fetchBoardDetails(route.params.boardId) 
    ])
  } finally {
    isLoading.value = false
  }
}

onMounted(() => loadData(route.params.postId))

// 같은 뷰 내에서 postId만 바뀔 때 대응
watch(() => route.params.postId, (newId) => {
  if (newId) loadData(newId)
})
</script>

<style scoped>
:deep(.prose img) {
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin: 1.5rem auto;
  max-width: 100%;
}
:deep(.prose) {
  color: #334155;
  word-break: break-word;
}
/* 모바일에서 본문 텍스트가 너무 작아지지 않게 조절 */
@media (max-width: 768px) {
  :deep(.prose p) {
    font-size: 0.95rem;
    line-height: 1.7;
  }
}
</style>