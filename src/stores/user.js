import { defineStore } from 'pinia'
import axios from 'axios'
import api from '@/axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: localStorage.getItem('userId') || null,
    nickname: localStorage.getItem('nickname') || null,
    role: localStorage.getItem('role') || null,
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true'
  }),
  
  actions: {
    setProfile({ userId, nickname, role }) {
      this.id = userId;
      this.nickname = nickname;
      this.role = role;
      this.isLoggedIn = true;
      localStorage.setItem('userId', String(userId));
      localStorage.setItem('nickname', nickname);
      localStorage.setItem('role', role);
      localStorage.setItem('isLoggedIn', 'true');
    },

    /**
     * 로그아웃: 서버에 쿠키 삭제 요청을 보내고 로컬 데이터를 비웁니다.
     */
    async logout() {
      try {
        // 인터셉터가 있는 api 인스턴스를 사용해 로그아웃 요청
        // 서버는 응답 헤더에 Set-Cookie (Max-Age=0)를 실어 보냅니다.
        await api.delete('/auth/logout');
      } catch (error) {
        console.error("서버 로그아웃 처리 중 에러가 발생했으나 로컬 정보는 삭제합니다.");
      } finally {
        this.clearLocalData();
      }
    },

    clearLocalData() {
      this.userId = null;
      this.nickname = null;
      this.role = null;
      this.isLoggedIn = false;
      localStorage.clear();
      // 만약 세션 만료 알림 후 이동하고 싶다면 여기서 처리하거나 호출부에서 처리합니다.
    },

    async restore() {
      if (!this.isLoggedIn) return;
      const success = await this.reissue();
      if (!success) {
        this.clearLocalData();
      }
    },

    /**
     * 재발급 액션
     */
    async reissue() {
      try {
        // ✨ 순수 axios를 사용하여 인터셉터 무한 루프 방지
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`, 
          {}, 
          { withCredentials: true } 
        );
        
        if (response.data) {
          this.setProfile(response.data);
          return true;
        }
        return false;
      } catch (error) {
        console.error("세션 갱신 실패 (리프레시 토큰 만료):", error);
        
        // ✨ 재발급 실패 시 서버에 '쿠키 삭제'를 위한 로그아웃 요청을 보냅니다.
        // 이미 토큰이 만료되어 401이 나겠지만, 서버가 로그아웃 로직에서 
        // 쿠키 삭제 헤더를 보내주므로 브라우저 쿠키가 깨끗해집니다.
        this.logout(); 
        
        return false;
      }
    }
  }
})