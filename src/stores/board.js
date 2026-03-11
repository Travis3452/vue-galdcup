import { defineStore } from 'pinia'
import axios from '../axios'

export const useBoardStore = defineStore('board', {
  state: () => ({
    currentBoard: null,
    currentPolicy: null,
    categories: [],
    activeVoteSession: null,
    isLoading: false, // 로딩 상태 추가
  }),

  actions: {
    // 🚀 통합 API 단일 호출 액션
    async fetchBoardDetails(boardId) {
      this.isLoading = true;
      try {
        const response = await axios.get(`/boards/${boardId}/details`);
        const data = response.data;
        
        // 한 번의 응답으로 모든 상태 업데이트
        this.currentBoard = data.board;
        this.currentPolicy = data.policy;
        this.categories = data.categories;
        this.activeVoteSession = data.activeVoteSession;
      } catch (error) {
        console.error('게시판 상세 정보를 불러오는데 실패했습니다.', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // (선택) 상태 초기화
    clearBoardDetails() {
      this.currentBoard = null;
      this.currentPolicy = null;
      this.categories = [];
      this.activeVoteSession = null;
    }
  }
})