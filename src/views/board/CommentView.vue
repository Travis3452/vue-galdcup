<template>
  <section ref="commentsSection" aria-labelledby="comments-title" class="comments-section">
    <div class="section-heading"><h2 id="comments-title">댓글</h2><span class="section-subtitle">서로의 취향을 존중해 주세요.</span></div>
    <p v-if="mutationError" role="alert" class="field-error">{{ mutationError }}</p><p v-if="isSaving" role="status" class="field-help mb-4">저장하는 중입니다…</p>
    <AsyncState :loading="loading" :error="error" :empty="comments.length === 0" empty-message="첫 번째 댓글을 남겨보세요. 다른 생각도 환영합니다." @retry="fetchComments">
      <ol class="comment-list">
        <li v-for="comment in comments" :key="comment.id" class="comment-thread">
          <article>
            <header class="comment-meta"><strong>{{ comment.authorNickname }}</strong><time>{{ formatDate(comment.createdAt) }}</time><span v-if="comment.updatedAt && comment.updatedAt !== comment.createdAt">수정됨</span>
              <div v-if="store.id && comment.authorId === store.id && editingId !== comment.id" class="comment-actions"><button type="button" class="ui-button ui-button-secondary ui-button-small" :disabled="isSaving" @click="startEdit(comment.id, comment.content)">수정</button><button type="button" class="ui-button ui-button-danger-outline ui-button-small" :disabled="isSaving" @click="deleteComment(comment.id)">삭제</button></div>
            </header>
            <form v-if="editingId === comment.id" class="comment-editor" @submit.prevent="saveEdit(comment.id)"><textarea v-model="editContent" class="form-control" aria-label="댓글 수정 내용" rows="3" :disabled="isSaving"></textarea><div class="comment-editor-actions"><button type="button" class="ui-button ui-button-quiet" :disabled="isSaving" @click="cancelEdit">취소</button><button type="submit" class="ui-button" :disabled="isSaving || !editContent.trim()">저장</button></div></form>
            <p v-else class="comment-content"><AiContentBadge v-if="!comment.isDeleted" :source="comment.creationSource" />{{ comment.content }}</p>
            <ol v-if="comment.childrenComments?.length" class="reply-list"><li v-for="reply in comment.childrenComments" :key="reply.id">
              <header class="comment-meta"><span class="reply-mark" aria-hidden="true">↳</span><strong>{{ reply.authorNickname }}</strong><time>{{ formatDate(reply.createdAt) }}</time>
                <div v-if="store.id && reply.authorId === store.id && editingId !== reply.id" class="comment-actions"><button type="button" class="ui-button ui-button-secondary ui-button-small" :disabled="isSaving" @click="startEdit(reply.id, reply.content)">수정</button><button type="button" class="ui-button ui-button-danger-outline ui-button-small" :disabled="isSaving" @click="deleteComment(reply.id)">삭제</button></div>
              </header>
              <form v-if="editingId === reply.id" class="comment-editor" @submit.prevent="saveEdit(reply.id)"><textarea v-model="editContent" class="form-control" aria-label="대댓글 수정 내용" rows="3" :disabled="isSaving"></textarea><div class="comment-editor-actions"><button type="button" class="ui-button ui-button-quiet" :disabled="isSaving" @click="cancelEdit">취소</button><button type="submit" class="ui-button" :disabled="isSaving || !editContent.trim()">저장</button></div></form>
              <p v-else class="comment-content"><AiContentBadge v-if="!reply.isDeleted" :source="reply.creationSource" />{{ reply.content }}</p>
            </li></ol>
            <button v-if="editingId !== comment.id" type="button" class="reply-toggle ui-button ui-button-secondary ui-button-small" :disabled="isSaving" :aria-expanded="activeReplyBox === comment.id" @click="toggleReplyBox(comment.id)">{{ activeReplyBox === comment.id ? '답글 닫기' : '답글 달기' }}</button>
            <form v-if="activeReplyBox === comment.id" class="comment-editor reply-editor" @submit.prevent="createReply(comment.id)"><textarea v-model="newReplies[comment.id]" class="form-control" aria-label="대댓글 내용" rows="3" placeholder="어떤 생각이 드셨나요?" :disabled="isSaving"></textarea><div class="comment-editor-actions"><button type="submit" class="ui-button" :disabled="isSaving || !newReplies[comment.id]?.trim()">답글 등록</button></div></form>
          </article>
        </li>
      </ol>
    </AsyncState>
    <AppPagination :current-page="currentPage" :total-pages="totalPages" :disabled="loading || isSaving" label="댓글 페이지" @change="goToPage" />
    <form class="new-comment" @submit.prevent="createComment">
      <label for="new-comment-content" class="field-label">댓글 작성</label><textarea id="new-comment-content" v-model="newComment" rows="3" class="form-control" :disabled="!store.accessToken || isSaving" :placeholder="store.accessToken ? '당신의 생각을 들려주세요.' : '로그인 후 댓글을 작성할 수 있습니다.'"></textarea>
      <div class="comment-editor-actions"><button type="submit" class="ui-button" :disabled="isSaving || !store.accessToken || !newComment.trim()">{{ isSaving ? '저장 중…' : '댓글 등록' }}</button></div>
    </form>
  </section>
</template>
<script setup>
import AiContentBadge from '@/components/ui/AiContentBadge.vue'
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import api from '@/axios'
import { clampPage, toApiPage } from '@/utils/pagination'
import { getErrorMessage } from '@/utils/request'
import { useResource } from '@/composables/useResource'
import AsyncState from '@/components/ui/AsyncState.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

const props = defineProps({
  postId: { type: [Number, String], required: true }
})

const store = useUserStore()

// 상태 관리
const comments = ref([])
const newComment = ref('')
const currentPage = ref(0)
const totalPages = ref(0)

const newReplies = ref({})
const activeReplyBox = ref(null)
const editingId = ref(null)
const editContent = ref('')

const commentsSection = ref(null)
const isSaving = ref(false)
const mutationError = ref('')
const { loading, error, load } = useResource('댓글을 불러오지 못했습니다.')

// 날짜 포맷
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function fetchComments() {
  const requestedPage = toApiPage(currentPage.value)
  let correctedPage = null
  const loaded = await load(signal => api.get(`/comments/post/${props.postId}`, { signal,
    params: { size: 10, page: requestedPage } }), res => {
    totalPages.value = res.data.totalPages
    const validPage = clampPage(requestedPage, totalPages.value)
    if (validPage !== requestedPage) {
      comments.value = []
      currentPage.value = validPage
      correctedPage = validPage
      return
    }
    comments.value = res.data.content || []
  })
  return loaded && correctedPage !== null ? fetchComments() : loaded
}
async function mutate(action) {
  if (isSaving.value) return
  if (!store.accessToken) { mutationError.value = '로그인 후 댓글을 작성해 주세요.'; return }
  isSaving.value = true
  mutationError.value = ''
  try { await action(); await fetchComments() }
  catch (cause) { mutationError.value = getErrorMessage(cause, '변경 내용을 저장하지 못했습니다. 다시 시도해 주세요.') }
  finally { isSaving.value = false }
}

// 댓글 생성
async function createComment() {
  const content = newComment.value.trim()
  if (!content) return
  await mutate(async () => {
    await api.post(`/comments/post/${props.postId}`, { content, parentCommentId: null })
    newComment.value = ''
    currentPage.value = 0
  })
}
async function createReply(commentId) {
  const content = newReplies.value[commentId]?.trim()
  if (!content) return
  await mutate(async () => {
    await api.post(`/comments/post/${props.postId}`, { content, parentCommentId: commentId })
    newReplies.value[commentId] = ''
    activeReplyBox.value = null
  })
}
function startEdit(id, content) { editingId.value = id; editContent.value = content }
function cancelEdit() { editingId.value = null; editContent.value = '' }
async function saveEdit(id) {
  const content = editContent.value.trim()
  if (!content) return
  await mutate(async () => { await api.put(`/comments/${id}`, { content }); cancelEdit() })
}
async function deleteComment(id) {
  if (isSaving.value || !confirm('정말 삭제하시겠습니까?')) return
  await mutate(async () => {
    await api.delete(`/comments/${id}`)
  })
}

function toggleReplyBox(commentId) { activeReplyBox.value = activeReplyBox.value === commentId ? null : commentId }

async function goToPage(page) {
  if (page < 0 || page >= totalPages.value || loading.value || isSaving.value) return
  currentPage.value = page
  await fetchComments()
  commentsSection.value?.scrollIntoView({ block: 'start' })
}
watch(() => props.postId, () => {
  currentPage.value = 0
  comments.value = []
  activeReplyBox.value = null
  editingId.value = null
  mutationError.value = ''
  if (props.postId) fetchComments()
}, { immediate: true })
</script>
<style scoped>
.comments-section { padding:24px 20px; border-top:1px solid var(--ui-border); }
.comment-thread { padding-block:20px; border-bottom:1px solid var(--ui-border); }
.comment-meta { display:flex; flex-wrap:wrap; align-items:center; gap:4px 10px; font-size:12px; color:var(--ui-text-muted); }
.comment-meta strong { font-size:13px; color:var(--ui-secondary); font-weight:650; overflow-wrap:anywhere; }
.comment-actions { display:flex; flex-wrap:wrap; gap:6px; margin-left:auto; }
.comment-actions button { min-width:36px; min-height:36px; border-radius:6px; }

.comment-content :deep(.ai-content-badge) { margin-inline-end:6px; vertical-align:middle; }
.comment-content { margin-top:10px; font-size:15px; line-height:1.8; white-space:pre-wrap; overflow-wrap:anywhere; }
.reply-list { margin-top:16px; padding:4px 14px; border-left:2px solid var(--ui-primary-border); border-radius:0 10px 10px 0; background:var(--ui-surface-subtle); }
.reply-list li { padding-block:14px; }
.reply-list li + li { border-top:1px solid var(--ui-border); }
.reply-mark { color:var(--ui-primary); }
.reply-toggle { margin-top:10px; }

.comment-editor { margin-top:12px; }
.reply-editor { padding:16px; border-radius:12px; background:var(--ui-surface-subtle); }
.comment-editor-actions { display:flex; justify-content:flex-end; flex-wrap:wrap; gap:8px; margin-top:12px; }
.new-comment { margin-top:24px; padding-top:20px; border-top:1px solid var(--ui-border); }
@media(max-width:639px) { .comment-actions button { min-height:44px; min-width:44px; } }
@media(min-width:768px) { .comments-section { padding:28px 32px; } }
</style>
