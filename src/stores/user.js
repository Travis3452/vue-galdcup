import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    accessToken: null,
    id: null,
    nickname: null,
    role: null
  }),
  
  getters: {
    isAdmin: (state) => state.role?.includes('ADMIN') || false,
    isManager: (state) => state.role?.includes('MANAGER') || false,
    // 1. 단순히 존재 여부만 보지 않고, 만료되지 않았는지까지 확인하도록 강화
    isLoggedIn: (state) => {
      if (!state.accessToken) return false;
      const payload = parseJwt(state.accessToken);
      if (!payload || !payload.exp) return false;
      
      // 현재 시간(초)보다 만료 시간이 큰지 확인
      return Math.floor(Date.now() / 1000) < payload.exp;
    }
  },
  
  actions: {
    login(accessToken, nickname) {
      this.accessToken = accessToken
      const payload = parseJwt(accessToken)
      this.id = payload?.sub ? Number(payload.sub) : null
      this.role = payload?.roles ? payload.roles[0] : null
      this.nickname = nickname || null

      localStorage.setItem('accessToken', accessToken)
      if (this.id) localStorage.setItem('id', String(this.id))
      if (this.nickname) localStorage.setItem('nickname', this.nickname)
      if (this.role) localStorage.setItem('role', this.role)
    },

    logout() {
      this.accessToken = null
      this.id = null
      this.nickname = null
      this.role = null

      localStorage.removeItem('accessToken')
      localStorage.removeItem('id')
      localStorage.removeItem('nickname')
      localStorage.removeItem('role')
    },

    // 2. 앱 실행 시 호출되는 restore 로직 강화
    async restore() {
      const token = localStorage.getItem('accessToken')
      if (!token) return;

      const payload = parseJwt(token);
      const now = Math.floor(Date.now() / 1000);

      // 토큰이 존재하지만 만료되었다면 자동으로 재발급 시도
      if (payload && now >= payload.exp) {
        console.log("액세스 토큰 만료 감지, 재발급 시도...");
        const success = await this.reissue();
        if (!success) {
          this.logout();
        }
      } else {
        // 아직 유효하다면 그대로 스토어에 복원
        this.accessToken = token
        this.id = localStorage.getItem('id') ? Number(localStorage.getItem('id')) : null
        this.nickname = localStorage.getItem('nickname')
        this.role = localStorage.getItem('role')
      }
    },

    async reissue() {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const { accessToken, nickname } = response.data;
        this.login(accessToken, nickname);
        return true;
      } catch (error) {
        console.error("토큰 재발급 실패 (리프레시 토큰 만료 또는 서버 에러):", error);
        this.logout();
        return false;
      }
    }
  }
})