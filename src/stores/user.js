import { defineStore } from 'pinia'
import axios from 'axios'
import api from '@/axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useUserStore = defineStore('user', {
  state: () => ({
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

    async logout() {
      try {
        // ⭐ 핵심 해결 3: 로그아웃 시 인터셉터가 없는 순수 axios를 사용하여 무한 루프 원천 차단
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
      this.id = null;
      this.nickname = null;
      this.role = null;
      this.isLoggedIn = false;
      localStorage.clear();
    },

    async restore() {
      if (!this.isLoggedIn) return;

      try {
        const response = await api.get('/users/me');
        this.setProfile(response.data);
      } catch (error) {
        console.error("사용자 인증 복구 실패:", error);
        this.clearLocalData();
      }
    },

    async reissue() {
      try {
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
        console.error("세션 갱신 실패 (Refresh Token 만료):", error);
        // ⭐ 핵심 해결 4: 재발급 실패 시 서버에 로그아웃 요청을 보내지 않고 즉시 로컬만 비움
        this.clearLocalData(); 
        return false;
      }
    }
  }
})