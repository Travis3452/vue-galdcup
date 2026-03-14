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

        // 2. 권한 체크 로직 복구 (누락 방지)
        const userStore = useUserStore();
        const currentUserId = userStore.id;

        if (currentUserId && data.policy) {
          // 관리자 ID 비교
          this.isBoardManager = data.policy.boardManager?.id === currentUserId;
          // 부관리자 목록 중 현재 유저가 있는지 확인
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