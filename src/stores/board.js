import { defineStore } from 'pinia'
import api from '@/axios'
import { useUserStore } from '@/stores/user'

export const useBoardStore = defineStore('board', {
  state: () => ({
    currentBoard: null,       
    currentVoteSession: null, 
    isBoardManager: false,
    isSubManager: false,
    loading: false,
    error: null
  }),
  actions: {
    async fetchBoard(boardId) {
      try {
        const res = await api.get(`/boards/${boardId}`)
        this.currentBoard = res.data
      } catch (err) {
        console.error('게시판 정보 로드 실패', err)
        this.currentBoard = null
      }
    },

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

    async fetchVoteSession(boardId) {
      try {
        const response = await api.get(`/boards/${boardId}/vote-session`);
        this.currentVoteSession = response.data;
      } catch (error) {
        this.currentVoteSession = null;
      }
    }
  }
})