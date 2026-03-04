import { defineStore } from 'pinia'
import api from '@/axios'
import { useUserStore } from '@/stores/user'

export const useBoardStore = defineStore('board', {
  state: () => ({
    currentBoard: null,       // 현재 게시판 상세 정보
    currentVoteSession: null, // 진행 중인 투표 세션
    isBoardManager: false,    // 매니저 여부
    isSubManager: false,      // 부매니저 여부
    loading: false,
    error: null
  }),
  actions: {
    // 1. 게시판 기본 정보 가져오기 (방문 기록용 topic 포함)
    async fetchBoard(boardId) {
      try {
        const res = await api.get(`/boards/${boardId}`)
        this.currentBoard = res.data
      } catch (err) {
        console.error('게시판 정보 로드 실패', err)
        this.currentBoard = null
      }
    },

    // 2. 게시판 관리 권한 확인
    async fetchBoardPolicy(boardId) {
      this.loading = true
      try {
        const res = await api.get(`/boards/${boardId}/policy`)
        const userStore = useUserStore()
        const currentUserId = userStore.id

        this.isBoardManager = res.data?.boardManager?.id === currentUserId
        this.isSubManager = res.data?.subManagers?.some(sm => sm.id === currentUserId) || false
        this.error = null
      } catch (err) {
        this.isBoardManager = false
        this.isSubManager = false
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    // 3. 현재 진행 중인 투표 정보 가져오기
    async fetchVoteSession(boardId) {
      try {
        const response = await api.get(`/boards/${boardId}/vote-session`);
        this.currentVoteSession = response.data;
      } catch (error) {
        // 투표가 없는 경우(404/409 등) null 처리
        this.currentVoteSession = null;
      }
    }
  }
})