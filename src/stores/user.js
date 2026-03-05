import { defineStore } from 'pinia'
import axios from 'axios' // reissue에서 직접 사용하기 위해 기본 axios 임포트

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
    isLoggedIn: (state) => !!state.accessToken
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

    restore() {
      const token = localStorage.getItem('accessToken')
      const idStr = localStorage.getItem('id')
      const name = localStorage.getItem('nickname')
      const roleStr = localStorage.getItem('role')

      if (token) {
        this.accessToken = token
        this.id = idStr ? Number(idStr) : null
        this.nickname = name || null
        this.role = roleStr || null
      }
    },

    // ✨ reissue 액션 추가 (NavBar.vue 에러 해결)
    async reissue() {
      try {
        // 인터셉터가 없는 기본 axios 인스턴스로 요청 (무한루프 방지)
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const { accessToken, nickname } = response.data;
        this.login(accessToken, nickname);
        return true;
      } catch (error) {
        console.error("토큰 재발급 실패:", error);
        this.logout();
        return false;
      }
    }
  }
})