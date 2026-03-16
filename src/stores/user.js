import { defineStore } from 'pinia'
import axios from 'axios'
import api from '@/axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useUserStore = defineStore('user', {
  state: () => ({
    // 초기값은 로컬 스토리지에서 가져오되, 보안 데이터가 아닌 UI 표시용 정보입니다.
    id: localStorage.getItem('id') ? Number(localStorage.getItem('id')) : null,
    nickname: localStorage.getItem('nickname') || null,
    role: localStorage.getItem('role') || null,
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true'
  }),
  
  getters: {
    isAdmin: (state) => state.role === 'ADMIN',
    isManager: (state) => state.role === 'MANAGER' || state.role === 'ADMIN'
  },
  
  actions: {
    /**
     * 프로필 정보 설정 및 로컬 스토리지 동기화
     */
    setProfile(profile) {
      const id = profile.id;
      
      this.id = id;
      this.nickname = profile.nickname;
      this.role = profile.role;
      this.isLoggedIn = true;
      
      localStorage.setItem('id', String(id));
      localStorage.setItem('nickname', profile.nickname);
      localStorage.setItem('role', profile.role);
      localStorage.setItem('isLoggedIn', 'true');
    },

    /**
     * 로그아웃: 서버에 쿠키 삭제 요청을 보내고 로컬 상태를 완전히 비웁니다.
     */
    async logout() {
      try {
        await api.delete('/auth/logout');
      } catch (error) {
        console.error("서버 로그아웃 처리 중 에러 발생:", error);
      } finally {
        this.clearLocalData();
      }
    },

    /**
     * 로컬 스토리지 및 Pinia 상태 즉시 초기화 (세션 만료 시 호출)
     */
    clearLocalData() {
      this.id = null;
      this.nickname = null;
      this.role = null;
      this.isLoggedIn = false;
      localStorage.clear();
    },

    /**
     * 앱 초기화 시 세션 복구 (App.vue 등에서 호출)
     * 단순히 로컬 정보를 믿지 않고 서버에 '나'의 정보를 물어봐서 쿠키 유효성을 검증합니다.
     */
    async restore() {
      if (!this.isLoggedIn) return;

      try {
        // /api/users/me를 호출합니다. 
        // 1. 토큰이 유효하면: 내 정보를 받아와서 setProfile 실행
        // 2. 만료되었다면: axios 인터셉터가 감지하여 자동으로 reissue()를 실행함
        const response = await api.get('/users/me');
        this.setProfile(response.data);
      } catch (error) {
        // reissue()까지 최종 실패하여 여기까지 에러가 올라오면 세션 종료
        console.error("사용자 인증 복구 실패:", error);
        this.clearLocalData();
      }
    },

    /**
     * 토큰 재발급 액션 (axios 인터셉터 전용)
     */
    async reissue() {
      try {
        // ✨ 인터셉터 무한 루프 방지를 위해 순수 axios 인스턴스 사용
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`, 
          {}, 
          { withCredentials: true } 
        );
        
        if (response.data) {
          // 백엔드 AuthProfileDto/UserDetailDto 응답으로 상태 갱신
          this.setProfile(response.data);
          return true;
        }
        return false;
      } catch (error) {
        console.error("세션 갱신 실패 (Refresh Token 만료):", error);
        // 재발급 실패 시 서버 쿠키도 지우기 위해 logout() 실행
        await this.logout(); 
        return false;
      }
    }
  }
})