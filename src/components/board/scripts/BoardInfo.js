import { ref } from 'vue'
import api from '@/axios'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

export default function useBoardInfo(boardId) {
  const board = ref(null)
  const boardPolicy = ref(null)
  const isBoardManager = ref(false)
  const isSubManager = ref(false)

  const router = useRouter()
  const store = useUserStore()

  async function fetchBoard() {
    const res = await api.get(`/boards/${boardId}`)
    board.value = res.data
  }

  async function fetchBoardPolicy() {
    try {
      const res = await api.get(`/boards/${boardId}/policy`)
      boardPolicy.value = res.data

      const currentUserId = store.id

      // 관리자 여부 확인
      isBoardManager.value = boardPolicy.value?.boardManager?.id === currentUserId

      // 서브 매니저 여부 확인
      isSubManager.value = boardPolicy.value?.subManagers?.some(sm => sm.id === currentUserId) || false
    } catch {
      boardPolicy.value = null
      isBoardManager.value = false
      isSubManager.value = false
    }
  }

  async function deleteBoard() {
    if (!confirm('정말 이 게시판을 삭제하시겠습니까?')) return
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
    isBoardManager,
    isSubManager,
    fetchBoard,
    fetchBoardPolicy,
    deleteBoard,
    applyForBoardManager,
    addSubManager,
    removeSubManager,
    formatDate
  }
}