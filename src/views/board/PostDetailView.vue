<template>
  <div class="post-detail">
    <AsyncState :loading="isLoading" :error="error" @retry="fetchPost(route.params.postId)">
      <article v-if="post" class="surface">
        <header class="post-detail-header">
          <router-link :to="`/boards/${route.params.boardId}`" class="back-to-list">← 게시글 목록</router-link>
          <span class="badge badge-neutral">{{ post.categoryName || '일반' }}</span>
          <h1>{{ post.title }}</h1>
          <div class="post-byline"><span class="post-byline-author">{{ post.authorNickname }}</span><time>{{ formatDate(post.createdAt) }}</time><span v-if="post.updatedAt && post.updatedAt !== post.createdAt">수정됨</span><span>조회 {{ post.viewCount || post.view || 0 }}</span></div>
          <div v-if="store.id && post.authorId === store.id || boardStore.isBoardManager || boardStore.isSubManager" class="post-owner-actions">
            <template v-if="store.id && post.authorId === store.id"><button type="button" class="ui-button ui-button-quiet" :disabled="pending" @click="editPost">수정</button><button type="button" class="ui-button ui-button-quiet" :disabled="pending" @click="deletePost">삭제</button></template>
            <button v-if="boardStore.isBoardManager || boardStore.isSubManager" type="button" class="ui-button ui-button-quiet" :disabled="pending" @click="adminDeletePost">관리자 삭제</button>
          </div>
        </header>
        <div class="reading-content post-body" v-html="safeContent"></div>
        <footer class="post-reactions">
          <p v-if="!store.accessToken" class="field-help mb-4">로그인 후 좋아요·싫어요를 남길 수 있습니다.</p>
          <div class="reaction-buttons"><button type="button" class="ui-button ui-button-secondary" :disabled="pending || reacted || !store.accessToken" @click="reactToPost('LIKE')"><span aria-hidden="true">👍</span>좋아요 <strong>{{ post.likeCount || 0 }}</strong></button><button type="button" class="ui-button ui-button-secondary" :disabled="pending || reacted || !store.accessToken" @click="reactToPost('DISLIKE')"><span aria-hidden="true">👎</span>싫어요 <strong>{{ post.dislikeCount || 0 }}</strong></button></div>
        </footer>
        <CommentView :postId="post.id" />
      </article>
    </AsyncState>
    <section v-if="!isLoading && post" class="surface panel-padding mt-6" aria-label="다른 게시글"><PostList :boardId="route.params.boardId" :selectedPostId="post.id" /></section>
  </div>
</template>
<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useBoardStore } from '@/stores/board'
import api from '@/axios'
import PostList from '@/views/board/PostListView.vue'
import CommentView from '@/views/board/CommentView.vue'
import DOMPurify from 'dompurify'
import { useResource } from '@/composables/useResource'
import { getErrorMessage } from '@/utils/request'
import { notify } from '@/services/notifications'
import AsyncState from '@/components/ui/AsyncState.vue'

const store = useUserStore()
const route = useRoute()
const router = useRouter()
const boardStore = useBoardStore()

const post = ref(null)
const { loading: isLoading, error, load } = useResource('게시글을 불러오지 못했습니다.')
const pending = ref(false)
const reacted = ref(false)
const safeContent = computed(() => DOMPurify.sanitize(post.value?.content || ''))

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

function fetchPost(postId) {
  return load(signal => api.get(`/posts/${postId}`, { signal }), response => {
    if (response.data.boardId != null && String(response.data.boardId) !== String(route.params.boardId)) throw new Error('다른 게시판의 게시글입니다.')
    post.value = response.data
  })
}

function editPost() {
  router.push(`/boards/${route.params.boardId}/posts/${post.value.id}/edit`)
}

async function removePost(asManager = false) {
  if (pending.value || !post.value || !confirm(asManager ? '관리자 권한으로 삭제하시겠습니까?' : '정말 삭제하시겠습니까?')) return
  pending.value = true
  try {
    const endpoint = asManager ? `/posts/board/${route.params.boardId}/post/${post.value.id}` : `/posts/${post.value.id}`
    await api.delete(endpoint)
    notify('게시글이 삭제되었습니다.')
    await router.push(`/boards/${route.params.boardId}`)
  } catch (error) { notify(getErrorMessage(error, '게시글을 삭제하지 못했습니다.'), 'error') }
  finally { pending.value = false }
}
function deletePost() { return removePost() }
function adminDeletePost() { return removePost(true) }
async function reactToPost(type) {
  if (pending.value || reacted.value || !post.value || !store.accessToken) return
  pending.value = true
  const selected = post.value
  try {
    await api.post(`/posts/${selected.id}/reactions`, {}, { params: { type } })
    if (post.value !== selected) return
    const field = type === 'LIKE' ? 'likeCount' : 'dislikeCount'
    selected[field] = (Number(selected[field]) || 0) + 1
    reacted.value = true
    notify('의견을 반영했습니다.')
  } catch (error) { notify(getErrorMessage(error, '의견을 반영하지 못했습니다.'), 'error') }
  finally { pending.value = false }
}
watch(() => route.params.postId, id => { if (id) { reacted.value = false; post.value = null; fetchPost(id) } }, { immediate: true })
</script>
<style scoped>
.post-detail-header { position:relative; padding:24px 20px; border-bottom:1px solid var(--ui-border); text-align:left; }
.back-to-list { display:flex; align-items:center; width:fit-content; min-height:44px; margin-bottom:12px; color:var(--ui-text-muted); font-size:13px; }
.back-to-list:hover { color:var(--ui-primary); }
.post-detail-header h1 { margin-block:18px; font-size:clamp(24px,3vw,36px); font-weight:800; line-height:1.4; letter-spacing:-.045em; }
.post-byline { display:flex; flex-wrap:wrap; gap:6px 16px; font-size:12px; color:var(--ui-text-muted); }
.post-byline-author { color:var(--ui-secondary); font-weight:600; }
.post-owner-actions { display:flex; flex-wrap:wrap; justify-content:flex-end; margin-top:12px; }
.post-body { width:100%; max-width:none; margin:0; min-height:240px; padding:24px 20px; text-align:left; }
.post-body :deep(:is(p, h1, h2, h3, h4, h5, h6, li, blockquote, pre, div)) { text-align:left !important; }
.post-reactions { margin-inline:20px; padding:20px 0 28px; border-top:1px solid var(--ui-divider); text-align:center; }
.reaction-buttons { display:flex; flex-wrap:wrap; justify-content:center; gap:12px; }
.reaction-buttons button { min-width:116px; }
.reaction-buttons strong { margin-left:4px; color:var(--ui-primary); }
@media(min-width:768px) { .post-detail-header { padding:28px 32px; } .post-body { padding:32px; } }
</style>
