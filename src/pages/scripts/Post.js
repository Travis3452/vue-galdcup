import { ref, computed } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/stores/user'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function usePost() {
  const store = useUserStore()

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

  // 페이지네이션 표시
  const visiblePages = computed(() => {
    const pages = []
    const start = Math.max(1, currentPage.value + 1 - 2)
    const end = Math.min(totalPages.value, start + 4)
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
    const res = await axios.get(`${API_BASE_URL}/api/posts/${postId}`)
    post.value = res.data
  }

  // 댓글 조회
  async function fetchComments(postId) {
    const res = await axios.get(`${API_BASE_URL}/api/comments/post/${postId}`, {
      params: { size: 30, page: currentPage.value }
    })
    comments.value = res.data.content || res.data
    totalPages.value = res.data.totalPages || 1
    hasNextPage.value = !res.data.last

    // 각 댓글의 대댓글 조회
    for (const comment of comments.value) {
      const replyRes = await axios.get(`${API_BASE_URL}/api/replies/comment/${comment.id}`)
      replies.value[comment.id] = replyRes.data
    }
  }

  // 댓글 작성
  async function createComment() {
    if (!newComment.value.trim()) return
    await axios.post(`${API_BASE_URL}/api/comments`, {
      postId: post.value.id,
      content: newComment.value.trim()
    }, {
      headers: { Authorization: `Bearer ${store.accessToken}` }
    })
    newComment.value = ''
    await fetchComments(post.value.id)
  }

  // 대댓글 작성
  async function createReply(commentId) {
    const content = newReplies.value[commentId]
    if (!content || !content.trim()) return
    await axios.post(`${API_BASE_URL}/api/replies`, {
      commentId,
      content: content.trim()
    }, {
      headers: { Authorization: `Bearer ${store.accessToken}` }
    })
    newReplies.value[commentId] = ''
    activeReplyBox.value = null
    await fetchComments(post.value.id)
  }

  // 대댓글 입력창 토글
  function toggleReplyBox(commentId) {
    activeReplyBox.value = activeReplyBox.value === commentId ? null : commentId
  }

  // 페이지네이션 이동
  function prevPage() {
    if (currentPage.value > 0) {
      currentPage.value--
      fetchComments(post.value.id)
    }
  }

  function nextPage() {
    if (currentPage.value < totalPages.value - 1) {
      currentPage.value++
      fetchComments(post.value.id)
    }
  }

  function goToPage(pageIndex) {
    if (pageIndex >= 0 && pageIndex < totalPages.value) {
      currentPage.value = pageIndex
      fetchComments(post.value.id)
    }
  }

  // 댓글 수정/삭제
  async function editComment(comment) {
    const newContent = prompt('댓글 수정:', comment.content)
    if (!newContent) return
    await axios.put(`${API_BASE_URL}/api/comments/${comment.id}`, { content: newContent }, {
      headers: { Authorization: `Bearer ${store.accessToken}` }
    })
    await fetchComments(post.value.id)
  }

  async function deleteComment(commentId) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return
    await axios.delete(`${API_BASE_URL}/api/comments/${commentId}`, {
      headers: { Authorization: `Bearer ${store.accessToken}` }
    })
    await fetchComments(post.value.id)
  }

  // 대댓글 수정/삭제
  async function editReply(reply) {
    const newContent = prompt('대댓글 수정:', reply.content)
    if (!newContent) return
    await axios.put(`${API_BASE_URL}/api/replies/${reply.id}`, { content: newContent }, {
      headers: { Authorization: `Bearer ${store.accessToken}` }
    })
    await fetchComments(post.value.id)
  }

  async function deleteReply(replyId) {
    if (!confirm('대댓글을 삭제하시겠습니까?')) return
    await axios.delete(`${API_BASE_URL}/api/replies/${replyId}`, {
      headers: { Authorization: `Bearer ${store.accessToken}` }
    })
    await fetchComments(post.value.id)
  }

  // 게시글 수정/삭제
  async function editPost() {
    // 라우터 이동은 Vue 컴포넌트에서 처리하는 게 더 자연스럽습니다.
    alert('게시글 수정 페이지로 이동하세요.')
  }

  async function deletePost() {
    if (!confirm('게시글을 삭제하시겠습니까?')) return
    await axios.delete(`${API_BASE_URL}/api/posts/${post.value.id}`, {
      headers: { Authorization: `Bearer ${store.accessToken}` }
    })
    alert('게시글이 삭제되었습니다.')
  }

  // 좋아요/싫어요
  async function reactToPost(type) {
    await axios.post(`${API_BASE_URL}/api/posts/${post.value.id}/reactions`, {}, {
      params: { type },
      headers: { Authorization: `Bearer ${store.accessToken}` }
    })
    await fetchPost(post.value.id)
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