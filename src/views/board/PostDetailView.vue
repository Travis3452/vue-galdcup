<template>
  <div class="w-full font-sans">
    
    <div class="w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      
      <div class="p-8 md:p-12">
        <div class="space-y-6 pb-8 border-b-2 border-slate-100">
          
          <div v-if="isLoading" class="flex items-center gap-3">
            <div class="h-10 w-24 bg-slate-200 rounded-xl animate-pulse"></div>
            <div class="h-10 w-3/4 bg-slate-200 rounded-xl animate-pulse"></div>
          </div>

          <h1 v-else class="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight leading-snug break-all flex flex-wrap items-center gap-3">
            <span class="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 text-sm md:text-base font-black border border-indigo-100 uppercase tracking-wider shrink-0">
              {{ post?.categoryType === 'NOTICE' ? '📢 ' : '' }}{{ post?.categoryName || '일반' }}
            </span>
            <span class="flex-1">{{ post?.title }}</span>
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
          :selectedPostId="post?.id"
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useBoardStore } from '@/stores/board'
import api from '@/axios'
import PostList from '@/views/board/PostListView.vue'

const store = useUserStore()
const route = useRoute()
const router = useRouter()
const boardStore = useBoardStore()

// 상태 변수
const post = ref(null)
const isLoading = ref(true)

// 유틸리티: 날짜 포맷
function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })
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

// 게시글 수정 페이지 이동
function editPost() {
  const boardId = route.params.boardId
  const postId = post.value?.id
  router.push(`/boards/${boardId}/posts/${postId}/edit`)
}

// 게시글 삭제
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
    await api.delete(`/posts/board/${route.params.boardId}/post/${post.value.id}`)
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
    await fetchPost(post.value.id) // 반응 후 데이터 갱신
  } catch (err) {
    alert(err.response?.data?.message || '반응 처리 중 오류가 발생했습니다.')
  }
}

// 초기 로딩 (게시글 및 게시판 정책 병렬 처리)
onMounted(async () => {
  const postId = route.params.postId
  isLoading.value = true

  try {
    await Promise.all([
      fetchPost(postId),
      boardStore.fetchBoardPolicy(route.params.boardId)
    ])
  } catch (err) {
    console.error('데이터 로딩 실패:', err)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
/* Tailwind Typography(prose) 커스텀 스타일 */
:deep(.prose img) {
  border-radius: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  margin: 2rem auto;
}
:deep(.prose) {
  color: #334155; /* slate-700 */
}
</style>