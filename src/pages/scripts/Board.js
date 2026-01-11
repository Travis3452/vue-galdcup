import { ref, computed } from 'vue'
import api from '@/axios'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

export default function useBoard(boardId) {
  const board = ref(null)
  const posts = ref([])
  const voteSession = ref(null)
  const pageInfo = ref({ totalPages: 0, number: 0, first: true, last: true })

  const blockSize = 5
  const currentBlock = computed(() => Math.floor(pageInfo.value.number / blockSize))

  const visiblePages = computed(() => {
    const start = currentBlock.value * blockSize + 1
    const end = Math.min(start + blockSize - 1, pageInfo.value.totalPages || 1)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  })

  async function fetchBoard() {
    const res = await api.get(`/boards/${boardId}`)
    board.value = res.data
  }

  async function fetchVoteSession() {
    try {
      const res = await api.get(`/boards/${boardId}/vote-session`)
      voteSession.value = res.data
    } catch {
      voteSession.value = null
    }
  }

  async function fetchPosts(page) {
    const res = await api.get(`/posts/board/${boardId}`, { params: { page, size: 30 } })
    posts.value = res.data.content
    pageInfo.value = {
      totalPages: res.data.totalPages,
      number: res.data.number,
      first: res.data.first,
      last: res.data.last
    }
  }

  function goToBlock(block) {
    const page = Math.max(0, Math.min(block * blockSize, pageInfo.value.totalPages - 1))
    fetchPosts(page)
  }

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })
  }

  const router = useRouter()
  const store = useUserStore()

  async function deleteBoard() {
    if (!confirm('정말 이 게시판을 삭제하시겠습니까?')) return
    try {
      await api.delete(`/boards/${boardId}`, {
        headers: { Authorization: `Bearer ${store.accessToken}` }
      })
      router.push('/')
    } catch (err) {
      console.error('게시판 삭제 실패', err)
      if (err.response && err.response.data && err.response.data.message) {
        alert(`${err.response.data.message}`)
      } else {
        alert('알 수 없는 오류가 발생했습니다.')
      }
    }
  }

  function openVoteWindow(voteSessionId) {
    const url = `/boards/${boardId}/vote-session/${voteSessionId}/vote`
    window.open(url, '_blank', 'width=800,height=600,scrollbars=yes')
  }

  function openVoteStatusWindow(boardId) {
  const url = `/boards/${boardId}/vote-status`
  window.open(url, '_blank', 'width=800,height=600,scrollbars=yes')
}

  async function applyForBoardManager() {
    try {
      await api.post(`/board-manager-requests/${boardId}/apply`, {}, {
        headers: { Authorization: `Bearer ${store.accessToken}` }
      })
      alert('권한 위임 신청이 접수되었습니다.')
    } catch (err) {
      console.error('권한 위임 신청 실패', err)
      alert('권한 위임 신청 중 오류가 발생했습니다.')
    }
  }

  return {
    board, posts, voteSession, pageInfo,
    visiblePages, currentBlock,
    fetchBoard, fetchVoteSession, fetchPosts, goToBlock, formatDate,
    deleteBoard,
    openVoteWindow, openVoteStatusWindow,
    applyForBoardManager
  }
}
