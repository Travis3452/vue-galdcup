import { defineStore } from 'pinia'
import axios from '../axios.js'
import { useUserStore } from './user.js'
import { createRequestGuard, getErrorMessage, isCanceled } from '../utils/request.js'

const requests = new WeakMap()
function guardsFor(store) {
  if (!requests.has(store)) {
    requests.set(store, { details: createRequestGuard(), vote: createRequestGuard(), analysis: createRequestGuard() })
  }
  return requests.get(store)
}

export const useBoardStore = defineStore('board', {
  state: () => ({
    boardId: null,
    currentBoard: null,
    currentPolicy: null,
    categories: [],
    activeVoteSession: null,
    opinionAnalysis: null,
    isAnalysisLoading: false, // AI 분석 로딩 상태 관리 추가
    isLoading: false,
    error: '',
    voteError: '',
    analysisError: '',
  }),

  getters: {
    isBoardManager(state) {
      const id = useUserStore().id
      return Boolean(id && state.currentPolicy?.boardManager
        && String(state.currentPolicy.boardManager.id) === String(id))
    },
    isSubManager(state) {
      const id = useUserStore().id
      return Boolean(id && state.currentPolicy?.subManagers?.some(user => String(user.id) === String(id)))
    },
  },

  actions: {
    /**
     * 게시판 메타데이터 조회 (게시판 정보, 정책, 카테고리)
     */
    async fetchBoardDetails(boardId) {
      this.selectBoard(boardId);
      const request = guardsFor(this).details.start();
      this.isLoading = true;
      this.error = '';
      try {
        const response = await axios.get(`/boards/${boardId}/details`, { signal: request.signal });
        if (!request.isCurrent()) return null;
        const data = response.data;
        if (!data?.board || String(data.board.id) !== String(boardId)) {
          throw new Error('게시판 응답이 일치하지 않습니다.');
        }
        
        this.currentBoard = data.board;
        this.currentPolicy = data.policy;
        this.categories = data.categories;

        return data;
      } catch (error) {
        if (!request.isCurrent() || isCanceled(error)) return null;
        this.error = getErrorMessage(error, '게시판 정보를 불러오지 못했습니다.');
        throw error;
      } finally {
        if (request.isCurrent()) this.isLoading = false;
      }
    },

    /**
     * 활성화된 투표 세션 정보 별도 조회
     */
    async fetchActiveVoteSession(boardId) {
      this.selectBoard(boardId);
      const request = guardsFor(this).vote.start();
      this.voteError = '';
      try {
        const response = await axios.get(`/boards/${boardId}/vote-session`, { signal: request.signal });
        if (!request.isCurrent()) return;
        this.activeVoteSession = response.data || null;
      } catch (error) {
        if (!request.isCurrent() || isCanceled(error)) return;
        this.voteError = getErrorMessage(error, '투표 정보를 불러오지 못했습니다.');
        this.activeVoteSession = null;
      }
    },

    /**
     * [GET] 캐싱된 AI 여론 분석 데이터 조회 (Fast Path)
     * 페이지 진입 시 화면 렌더링을 위해 호출됩니다.
     */
    async fetchOpinionAnalysis(boardId, voteSessionId) {
      const request = guardsFor(this).analysis.start();
      this.isAnalysisLoading = true;
      this.analysisError = '';
      try {
        const response = await axios.get(`/boards/${boardId}/vote-session/${voteSessionId}/opinion-analysis`, { signal: request.signal });
        if (!request.isCurrent()) return;
        // 204 No Content일 경우 response.data가 없으므로 null 처리
        this.opinionAnalysis = response.data || null;
      } catch (error) {
        if (!request.isCurrent() || isCanceled(error)) return;
        this.analysisError = getErrorMessage(error, '여론 분석을 불러오지 못했습니다.');
        this.opinionAnalysis = null;
      } finally {
        if (request.isCurrent()) this.isAnalysisLoading = false;
      }
    },

    /**
     * [POST] 새로운 AI 여론 분석 실행 및 갱신 요청 (Heavy Path)
     * 사용자가 '분석 시작' 또는 '갱신' 버튼을 눌렀을 때 호출됩니다.
     */
    async startOpinionAnalysis(boardId, voteSessionId) {
      if (this.isAnalysisLoading) return false;
      const request = guardsFor(this).analysis.start();
      this.isAnalysisLoading = true;
      this.analysisError = '';
      try {
        // 컨트롤러 설정에 맞게 POST 요청 전송
        const response = await axios.post(`/boards/${boardId}/vote-session/${voteSessionId}/opinion-analysis`, null,
          { signal: request.signal, timeout: 90000 });
        if (!request.isCurrent()) return false;
        this.opinionAnalysis = response.data;
        return true; // UI 컴포넌트에서 성공 여부를 알 수 있도록 반환
      } catch (error) {
        if (!request.isCurrent() || isCanceled(error)) return false;
        this.analysisError = getErrorMessage(error, 'AI 분석을 완료하지 못했습니다.');
        return false;
      } finally {
        if (request.isCurrent()) this.isAnalysisLoading = false;
      }
    },

    selectBoard(boardId) {
      if (String(this.boardId) !== String(boardId)) {
        this.clearBoardDetails();
        this.boardId = String(boardId);
      }
    },

    clearBoardDetails() {
      Object.values(guardsFor(this)).forEach(guard => guard.invalidate());
      this.boardId = null;
      this.currentBoard = null;
      this.currentPolicy = null;
      this.categories = [];
      this.activeVoteSession = null;
      this.opinionAnalysis = null;
      this.isAnalysisLoading = false;
      this.isLoading = false;
      this.error = '';
      this.voteError = '';
      this.analysisError = '';
    }
  }
})
