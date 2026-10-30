import { defineStore } from 'pinia'
import api from '../axios.js'
import { authClient } from '../services/authClient.js'
import { getErrorMessage } from '../utils/request.js'
import { readStorage, writeStorage, removeStorage } from '../utils/storage.js'

const refreshRequests = new WeakMap()
const restoreRequests = new WeakMap()
const authKeys = ['id', 'nickname', 'role', 'isLoggedIn']

export const useUserStore = defineStore('user', {
  state: () => ({
    accessToken: null, // ✨ 메모리에서 관리할 Access Token
    id: Number(readStorage('id')) > 0 ? Number(readStorage('id')) : null,
    nickname: readStorage('nickname'),
    role: readStorage('role'),
    isLoggedIn: readStorage('isLoggedIn') === 'true',
    hasRestoredSession: false,
    isLoggingOut: false,
    sessionEpoch: 0,
    sessionGeneration: 0,
    sessionError: '',
  }),
  
  getters: {
    isAdmin: (state) => state.role === 'ADMIN',
    isManager: (state) => state.role === 'MANAGER' || state.role === 'ADMIN'
  },
  
  actions: {
    // 백엔드의 AuthResponse 구조에 맞게 프로필과 토큰을 함께 세팅
    setAuthData(data) {
      const profile = data?.profile || data;
      if (!profile || typeof profile.accessToken !== 'string' || !profile.accessToken
          || !Number.isFinite(Number(profile.userId ?? profile.id))
          || Number(profile.userId ?? profile.id) <= 0) {
        throw new Error('유효한 로그인 정보를 받지 못했습니다.');
      }

      this.sessionEpoch += 1;
      if (!this.isLoggedIn || this.id !== Number(profile.userId ?? profile.id)) this.sessionGeneration += 1;
      this.accessToken = profile.accessToken;
      this.id = Number(profile.userId ?? profile.id);
      this.nickname = profile.nickname;
      this.role = profile.role;
      this.isLoggedIn = true;
      this.hasRestoredSession = true;
      this.sessionError = '';
      
      writeStorage('id', this.id);
      writeStorage('nickname', this.nickname || '');
      writeStorage('role', this.role || 'USER');
      writeStorage('isLoggedIn', 'true');
    },

    async logout() {
      if (this.isLoggingOut) return false;
      this.isLoggingOut = true;
      this.sessionEpoch += 1;
      try {
        await authClient.delete('/logout', {
          headers: this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {},
        });
        return true;
      } catch {
        return false;
      } finally {
        this.clearLocalData();
        this.isLoggingOut = false;
      }
    },

    clearLocalData() {
      this.sessionEpoch += 1;
      this.sessionGeneration += 1;
      this.accessToken = null;
      this.id = null;
      this.nickname = null;
      this.role = null;
      this.isLoggedIn = false;
      this.hasRestoredSession = true;
      this.sessionError = '';
      authKeys.forEach(key => removeStorage(key));
    },

    async restore() {
      if (this.hasRestoredSession) return Boolean(this.accessToken);
      if (restoreRequests.has(this)) return restoreRequests.get(this);
      const request = (async () => {
        try {
          if (!this.isLoggedIn) return false;
          if (!this.accessToken && !await this.reissue()) return false;
          const epoch = this.sessionEpoch;
          const response = await api.get('/users/me');
          if (epoch !== this.sessionEpoch || this.isLoggingOut) return false;
          this.setAuthData({ ...response.data, accessToken: this.accessToken });
          return true;
        } catch (error) {
          if ([400, 401, 403, 404].includes(error.response?.status)) this.clearLocalData();
          else this.sessionError = getErrorMessage(error, '로그인 상태를 확인하지 못했습니다.');
          return false;
        } finally {
          this.hasRestoredSession = true;
          restoreRequests.delete(this);
        }
      })();
      restoreRequests.set(this, request);
      return request;
    },

    async reissue() {
      if (this.isLoggingOut) return false;
      if (refreshRequests.has(this)) return refreshRequests.get(this);
      const epoch = this.sessionEpoch;
      const request = (async () => {
        try {
          const response = await authClient.post('/refresh', {});
          if (epoch !== this.sessionEpoch || this.isLoggingOut) return false;
          this.setAuthData(response.data);
          return true;
        } catch (error) {
          if (epoch !== this.sessionEpoch || this.isLoggingOut) return false;
          if ([400, 401, 403].includes(error.response?.status)) this.clearLocalData();
          else this.sessionError = getErrorMessage(error, '세션을 갱신하지 못했습니다. 다시 시도해 주세요.');
          return false;
        } finally {
          refreshRequests.delete(this);
        }
      })();
      refreshRequests.set(this, request);
      return request;
    }
  }
})
