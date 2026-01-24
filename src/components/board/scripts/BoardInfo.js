import { ref } from 'vue'
import api from '@/axios'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useBoardStore } from '@/stores/board'

export default function useBoardInfo(boardId) {
  const board = ref(null)
  const boardPolicy = ref(null)

  const router = useRouter()
  const store = useUserStore()
  const boardStore = useBoardStore()

  async function fetchBoard() {
    const res = await api.get(`/boards/${boardId}`)
    board.value = res.data
  }

  async function fetchBoardPolicy() {
    try {
      const res = await api.get(`/boards/${boardId}/policy`)
      boardPolicy.value = res.data

      const currentUserId = store.id

      boardStore.isBoardManager = boardPolicy.value?.boardManager?.id === currentUserId
      boardStore.isSubManager = boardPolicy.value?.subManagers?.some(sm => sm.id === currentUserId) || false
    } catch {
      boardStore.isBoardManager = false
      boardStore.isSubManager = false
    }
  }

  async function deleteBoard() {
    try {
      await api.delete(`/boards/${boardId}`, {
        headers: { Authorization: `Bearer ${store.accessToken}` }
      })
      router.push('/')
    } catch (err) {
      console.error('게시판 삭제 실패', err)
      alert(err.response?.data?.message || '게시판 삭제 실패')
    }
  }

  async function applyForBoardManager() {
    try {
      await api.post(`/board-manager-requests/${boardId}/apply`, {}, {
        headers: { Authorization: `Bearer ${store.accessToken}` }
      })
      alert('권한 위임 신청이 접수되었습니다.')
    } catch (err) {
      console.error('권한 위임 신청 실패', err)
      alert(err.response?.data?.message || '권한 위임 신청 실패')
    }
  }

  async function addSubManager(nickname) {
    try {
      const res = await api.post(`/boards/${boardId}/policy/sub-managers`, { nickname }, {
        headers: { Authorization: `Bearer ${store.accessToken}` }
      })
      boardPolicy.value = res.data
      alert('서브 매니저가 추가되었습니다.')
    } catch (err) {
      console.error('서브 매니저 추가 실패', err)
      alert(err.response?.data?.message || '서브 매니저 추가 실패')
    }
  }

  async function removeSubManager(nickname) {
    try {
      const res = await api.delete(`/boards/${boardId}/policy/sub-managers`, {
        headers: { Authorization: `Bearer ${store.accessToken}` },
        data: { nickname }
      })
      boardPolicy.value = res.data
      alert('서브 매니저가 삭제되었습니다.')
    } catch (err) {
      console.error('서브 매니저 삭제 실패', err)
      alert(err.response?.data?.message || '서브 매니저 삭제 실패')
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })
  }

  return {
    board,
    boardPolicy,
    fetchBoard,
    fetchBoardPolicy,
    deleteBoard,
    applyForBoardManager,
    addSubManager,
    removeSubManager,
    formatDate
  }
}