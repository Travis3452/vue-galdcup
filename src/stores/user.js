import { defineStore } from 'pinia'
import api from '@/axios' // 우리가 앞서 설정한 axios 인스턴스

export const useUserStore = defineStore('user', {
  state: () => ({
    // 이제 accessToken은 쿠키(HttpOnly)에 있으므로 state에서 제외합니다.
    userId: localStorage.getItem('userId') || null,
    nickname: localStorage.getItem('nickname') || null,
    role: localStorage.getItem('role') || null,
    // 세션 유지 여부를 나타내는 플래그 (토큰 만료 시 401 인터셉터가 처리)
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true'
  }),
  
  getters: {
    isAdmin: (state) => state.role === 'ADMIN',
    isManager: (state) => state.role === 'MANAGER' || state.role === 'ADMIN'
  },
  
  actions: {
    /**
     * 로그인 처리: 백엔드에서 전달받은 프로필 정보를 스토어와 로컬스토리지에 저장
     */
    setProfile({ userId, nickname, role }) {
      this.userId = userId;
      this.nickname = nickname;
      this.role = role;
      this.isLoggedIn = true;

      // 비민감 정보만 로컬 스토리지에 저장 (새로고침 시 UI 유지용)
      localStorage.setItem('userId', String(userId));
      localStorage.setItem('nickname', nickname);
      localStorage.setItem('role', role);
      localStorage.setItem('isLoggedIn', 'true');
    },

    /**
     * 로그아웃: 서버에 로그아웃 요청을 보내 쿠키를 삭제하고 로컬 데이터를 초기화
     */
    async logout() {
      try {
        // 1. 백엔드에 로그아웃 요청 
        // 백엔드는 이 요청의 응답 헤더에 Set-Cookie: accessToken=; Max-Age=0; 등을 실어 보내야 함
        await api.delete('/auth/logout');
      } catch (error) {
        console.error("서버 로그아웃 처리 중 에러가 발생했으나 로컬 정보는 삭제합니다.");
      } finally {
        // 2. 서버 요청 성공 여부와 상관없이 프론트엔드 상태는 무조건 초기화
        this.clearLocalData();
      }
    },
    
    clearLocalData() {
      this.userId = null;
      this.nickname = null;
      this.role = null;
      this.isLoggedIn = false;
      localStorage.clear();
    },

    /**
     * 앱 초기화 시 호출: 세션 유효성 확인 및 프로필 갱신
     */
    async restore() {
      if (!this.isLoggedIn) return;

      try {
        // 백엔드에 현재 로그인 정보를 요청 (쿠키가 유효한지 확인)
        // 우리가 만든 /api/auth/refresh 또는 /api/auth/me를 활용합니다.
        const success = await this.reissue();
        if (!success) {
          this.clearLocalData();
        }
      } catch (error) {
        this.clearLocalData();
      }
    },

    /**
     * 토큰 재발급 및 프로필 정보 동기화
     */
    async reissue() {
      try {
        // 🚨 중요: 인터셉터가 걸려있는 'api' 대신 순수 'axios'를 사용합니다.
        // 이렇게 해야 이 요청이 401이 나더라도 다시 인터셉터로 빠지지 않습니다.
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`, 
          {}, 
          { withCredentials: true } // 쿠키를 포함하기 위해 명시
        );
        
        if (response.data) {
          this.setProfile(response.data);
          return true;
        }
        return false;
      } catch (error) {
        // 여기서 401이 발생하면 (Refresh Token 만료) 
        // 인터셉터로 가지 않고 바로 catch로 들어와서 안전하게 종료됩니다.
        console.error("세션 갱신 실패 (리프레시 토큰 만료):", error);
        this.clearLocalData();
        return false;
      }
    },
  }
})