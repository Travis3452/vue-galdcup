import { defineStore } from 'pinia'
import axios from '../axios'
import { useUserStore } from '@/stores/user'

export const useBoardStore = defineStore('board', {
  state: () => ({
    currentBoard: null,
    currentPolicy: null,
    categories: [],
    activeVoteSession: null,
    isBoardManager: false,
    isSubManager: false,
    isLoading: false,
  }),

  actions: {
    async fetchBoardDetails(boardId) {
      this.isLoading = true;
      try {
        const response = await axios.get(`/boards/${boardId}/details`);
        const data = response.data;
        
        // 1. 기본 정보 매핑
        this.currentBoard = data.board;
        this.currentPolicy = data.policy;
        this.categories = data.categories;
        this.activeVoteSession = data.activeVoteSession;

        const userStore = useUserStore();
        const currentUserId = userStore.id;

        if (currentUserId && data.policy) {
          this.isBoardManager = data.policy.boardManager?.id === currentUserId;
          this.isSubManager = data.policy.subManagers?.some(sm => sm.id === currentUserId) || false;
        } else {
          this.isBoardManager = false;
          this.isSubManager = false;
        }

      } catch (error) {
        console.error('게시판 정보를 불러오는데 실패했습니다.', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    clearBoardDetails() {
      this.currentBoard = null;
      this.currentPolicy = null;
      this.isBoardManager = false;
      this.isSubManager = false;
    }
  }
})