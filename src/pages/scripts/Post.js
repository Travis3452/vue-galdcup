import { ref, computed } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { useRoute, useRouter } from 'vue-router'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function usePost() {
  const store = useUserStore()
  const route = useRoute()
  const router = useRouter()

  // 상태 관리
  const post = ref(null)
  const comments = ref([])
  const replies = ref({})
  const newComment = ref('')
  const newReplies = ref({})
  const currentPage = ref(0)
  const totalPages = ref(0)
  const hasNextPage = ref(false)
  const activeReplyBox = ref(null)

  // 페이지네이션 표시 (최대 5개)
  const visiblePages = computed(() => {
    const pages = []
    const maxVisible = 5
    const start = Math.max(1, currentPage.value + 1 - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages.value, start + maxVisible - 1)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  })

  // 날짜 포맷
  function formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })
  }

  // 게시글 단건 조회
  async function fetchPost(postId) {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/posts/${postId}`)
      post.value = res.data
    } catch (err) {
      console.error('게시글 조회 실패:', err)
      alert(err.response?.data?.message || '게시글을 불러오는 중 오류가 발생했습니다.')
    }
  }

  // 댓글 조회
  async function fetchComments(postId) {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/comments/post/${postId}`, {
        params: { size: 30, page: currentPage.value }
      })

      comments.value = res.data.content ?? res.data
      totalPages.value = res.data.totalPages ?? 1
      hasNextPage.value = !res.data.last

      // 각 댓글의 대댓글 조회 (리액티브 갱신 보장)
      const newRepliesMap = { ...replies.value }
      for (const comment of comments.value) {
        const replyRes = await axios.get(`${API_BASE_URL}/api/replies/comment/${comment.id}`)
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
      await axios.post(`${API_BASE_URL}/api/comments`, {
        postId: post.value.id,
        content: newComment.value.trim()
      }, {
        headers: { Authorization: `Bearer ${store.accessToken}` }
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
      await axios.post(`${API_BASE_URL}/api/replies`, {
        commentId,
        content: content.trim()
      }, {
        headers: { Authorization: `Bearer ${store.accessToken}` }
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
      await axios.put(`${API_BASE_URL}/api/comments/${comment.id}`, { content: newContent }, {
        headers: { Authorization: `Bearer ${store.accessToken}` }
      })
      await fetchComments(post.value.id)
    } catch (err) {
      console.error('댓글 수정 실패:', err)
      alert(err.response?.data?.message || '댓글 수정 중 오류가 발생했습니다.')
    }
  }

  async function deleteComment(commentId) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return
    try {
      await axios.delete(`${API_BASE_URL}/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${store.accessToken}` }
      })
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
      await axios.put(`${API_BASE_URL}/api/replies/${reply.id}`, { content: newContent }, {
        headers: { Authorization: `Bearer ${store.accessToken}` }
      })
      await fetchComments(post.value.id)
    } catch (err) {
      console.error('대댓글 수정 실패:', err)
      alert(err.response?.data?.message || '대댓글 수정 중 오류가 발생했습니다.')
    }
  }

  async function deleteReply(replyId) {
    if (!confirm('대댓글을 삭제하시겠습니까?')) return
    try {
      await axios.delete(`${API_BASE_URL}/api/replies/${replyId}`, {
        headers: { Authorization: `Bearer ${store.accessToken}` }
      })
      await fetchComments(post.value.id)
    } catch (err) {
      console.error('대댓글 삭제 실패:', err)
      alert(err.response?.data?.message || '대댓글 삭제 중 오류가 발생했습니다.')
    }
  }

  // 게시글 수정/삭제
  function editPost() {
    const boardId = route.params.boardId
    const postId = post.value?.id
    if (!postId) return
    router.push(`/boards/${boardId}/posts/${postId}/update`)
  }

  async function deletePost() {
    if (!confirm('게시글을 삭제하시겠습니까?')) return
    try {
      await axios.delete(`${API_BASE_URL}/api/posts/${post.value.id}`, {
        headers: { Authorization: `Bearer ${store.accessToken}` }
      })
      alert('게시글이 삭제되었습니다.')
      router.push(`/boards/${route.params.boardId}`)
    } catch (err) {
      console.error('게시글 삭제 실패:', err)
      alert(err.response?.data?.message || '게시글 삭제 중 오류가 발생했습니다.')
    }
  }

  // 좋아요/싫어요
  async function reactToPost(type) {
    try {
      await axios.post(`${API_BASE_URL}/api/posts/${post.value.id}/reactions`, {}, {
        params: { type },
        headers: { Authorization: `Bearer ${store.accessToken}` }
      })
      await fetchPost(post.value.id)
    } catch (err) {
      console.error('게시글 반응 실패:', err)
      alert(err.response?.data?.message || '게시글 반응 처리 중 오류가 발생했습니다.')
    }
  }

  // 대댓글 입력창 토글
  function toggleReplyBox(commentId) {
    activeReplyBox.value = activeReplyBox.value === commentId ? null : commentId
  }

  // 페이지 이동
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

  return {
    store, post, comments, replies,
    newComment, newReplies,
    currentPage, totalPages, hasNextPage,
    activeReplyBox, visiblePages,
    formatDate, fetchPost, fetchComments,
    createComment, createReply, toggleReplyBox,
    prevPage, nextPage, goToPage,
    editComment, deleteComment,
    editReply, deleteReply,
    editPost, deletePost, reactToPost
  }
}