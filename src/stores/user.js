import { defineStore } from 'pinia'
import axios from 'axios'
import api from '@/axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useUserStore = defineStore('user', {
  state: () => ({
    accessToken: null, // ✨ 메모리에서 관리할 Access Token
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
    // 백엔드의 AuthResponse 구조에 맞게 프로필과 토큰을 함께 세팅
    setAuthData(data) {
      const profile = data.profile || data;

      this.accessToken = profile.accessToken;
      this.id = profile.userId || profile.id;
      this.nickname = profile.nickname;
      this.role = profile.role;
      this.isLoggedIn = true;
      
      localStorage.setItem('id', String(this.id));
      localStorage.setItem('nickname', this.nickname);
      localStorage.setItem('role', this.role);
      localStorage.setItem('isLoggedIn', 'true');
    },

    async logout() {
      try {
        await axios.delete(`${API_BASE_URL}/api/auth/logout`, { 
          withCredentials: true 
        });
      } catch (error) {
        console.error("서버 로그아웃 처리 중 에러 발생:", error);
      } finally {
        this.clearLocalData();
      }
    },

    clearLocalData() {
      this.accessToken = null;
      this.id = null;
      this.nickname = null;
      this.role = null;
      this.isLoggedIn = false;
      localStorage.clear();
    },

    async restore() {
      if (!this.isLoggedIn) return;

      // 메모리에 토큰이 없고 로그인 상태만 localStorage에 남아있는 경우 (새로고침 직후)
      if (!this.accessToken) {
        const success = await this.reissue(); // Refresh Token으로 Access Token 재발급 시도
        if (!success) return;
      }

      try {
        const response = await api.get('/users/me');
        this.id = response.data.id;
        this.nickname = response.data.nickname;
        this.role = response.data.role;
        this.isLoggedIn = true;
      } catch (error) {
        console.error("사용자 인증 복구 실패:", error);
        this.clearLocalData();
      }
    },

    async reissue() {
      try {
        // /api/auth/refresh 요청 시 백엔드는 HttpOnly 쿠키의 RefreshToken을 검증하고,
        // 새로운 AccessToken이 포함된 AuthResponse Body를 내려줍니다.
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`, 
          {}, 
          { withCredentials: true } 
        );
        
        if (response.data) {
          this.setAuthData(response.data); // ✨ 새 AccessToken과 프로필 메모리 갱신
          return true;
        }
        return false;
      } catch (error) {
        console.error("세션 갱신 실패 (Refresh Token 만료):", error);
        this.clearLocalData(); 
        return false;
      }
    }
  }
})