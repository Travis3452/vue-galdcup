import { defineStore } from 'pinia'
import axios from '../axios'
import { useUserStore } from '@/stores/user'

export const useBoardStore = defineStore('board', {
  state: () => ({
    currentBoard: null,
    currentPolicy: null,
    categories: [],
    activeVoteSession: null,
    opinionAnalysis: null,
    isAnalysisLoading: false, // AI 분석 로딩 상태 관리 추가
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

    /**
     * [GET] 캐싱된 AI 여론 분석 데이터 조회 (Fast Path)
     * 페이지 진입 시 화면 렌더링을 위해 호출됩니다.
     */
    async fetchOpinionAnalysis(boardId, voteSessionId) {
      this.isAnalysisLoading = true;
      try {
        const response = await axios.get(`/boards/${boardId}/vote-session/${voteSessionId}/opinion-analysis`);
        // 204 No Content일 경우 response.data가 없으므로 null 처리
        this.opinionAnalysis = response.data || null;
      } catch (error) {
        console.error('여론 분석 데이터를 불러오는데 실패했습니다.', error);
        this.opinionAnalysis = null;
      } finally {
        this.isAnalysisLoading = false;
      }
    },

    /**
     * [POST] 새로운 AI 여론 분석 실행 및 갱신 요청 (Heavy Path)
     * 사용자가 '분석 시작' 또는 '갱신' 버튼을 눌렀을 때 호출됩니다.
     */
    async startOpinionAnalysis(boardId, voteSessionId) {
      this.isAnalysisLoading = true;
      try {
        // 컨트롤러 설정에 맞게 POST 요청 전송
        const response = await axios.post(`/boards/${boardId}/vote-session/${voteSessionId}/opinion-analysis`);
        this.opinionAnalysis = response.data;
        return true; // UI 컴포넌트에서 성공 여부를 알 수 있도록 반환
      } catch (error) {
        console.error('AI 분석 요청에 실패했습니다.', error);
        return false;
      } finally {
        this.isAnalysisLoading = false;
      }
    },

    clearBoardDetails() {
      this.currentBoard = null;
      this.currentPolicy = null;
      this.categories = [];
      this.activeVoteSession = null;
      this.opinionAnalysis = null;
      this.isAnalysisLoading = false;
      this.isBoardManager = false;
      this.isSubManager = false;
    }
  }
})