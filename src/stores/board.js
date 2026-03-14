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
    /**
     * 게시판 메타데이터 조회 (게시판 정보, 정책, 카테고리)
     */
    async fetchBoardDetails(boardId) {
      this.isLoading = true;
      try {
        const response = await axios.get(`/boards/${boardId}/details`);
        const data = response.data;
        
        this.currentBoard = data.board;
        this.currentPolicy = data.policy;
        this.categories = data.categories;

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

    /**
     * 활성화된 투표 세션 정보 별도 조회
     */
    async fetchActiveVoteSession(boardId) {
      try {
        const response = await axios.get(`/boards/${boardId}/vote-session`);
        this.activeVoteSession = response.data || null;
      } catch (error) {
        console.error('투표 세션 정보를 불러오는데 실패했습니다.', error);
        this.activeVoteSession = null;
      }
    },

    clearBoardDetails() {
      this.currentBoard = null;
      this.currentPolicy = null;
      this.categories = [];
      this.activeVoteSession = null;
      this.isBoardManager = false;
      this.isSubManager = false;
    }
  }
})