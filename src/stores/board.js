import { defineStore } from 'pinia'
import api from '@/axios'
import { useUserStore } from '@/stores/user'

export const useBoardStore = defineStore('board', {
  state: () => ({
    isBoardManager: false,
    isSubManager: false,
    loading: false,
    error: null
  }),
  actions: {
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
    }
  }
})