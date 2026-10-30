import axios from "axios";
import { useUserStore } from "./stores/user.js";
import { API_BASE_URL } from './services/authClient.js';
import { normalizePage } from './utils/pagination.js';

const expiredNotifications = new WeakMap();

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  timeout: 30000
});

// ⭐ [핵심] 요청 인터셉터: 메모리에 있는 Access Token을 헤더에 장착하여 전송
api.interceptors.request.use(
  (config) => {
    const store = useUserStore();
    config._authGeneration = store.sessionGeneration;
    if (store.accessToken) {
      config.headers['Authorization'] = `Bearer ${store.accessToken}`;
    } else {
      delete config.headers['Authorization'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (res) => {
    res.data = normalizePage(res.data);
    return res;
  },
  async (err) => {
    const store = useUserStore();
    const originalRequest = err.config;

    if (err.response?.status !== 401 || !originalRequest
        || originalRequest.url?.includes('/auth/')) {
      return Promise.reject(err);
    }

    const hadSession = store.isLoggedIn || Boolean(store.accessToken);
    if (!hadSession) return Promise.reject(err);
    if (originalRequest._authGeneration !== store.sessionGeneration) return Promise.reject(err);

    if (!originalRequest._retry) {
      originalRequest._retry = true;
      // 이미 갱신된 토큰보다 늦게 도착한 401은 새 토큰으로 한 번만 재시도한다.
      if (store.accessToken && originalRequest.headers?.Authorization
          && originalRequest.headers.Authorization !== `Bearer ${store.accessToken}`) {
        return api(originalRequest);
      }
      if (await store.reissue()) return api(originalRequest);
      // 통신 실패는 유효한 쿠키·프로필을 지우거나 페이지를 강제 이동시키지 않는다.
      if (store.isLoggedIn) return Promise.reject(err);
    } else {
      store.clearLocalData();
    }

    if (expiredNotifications.get(store) !== store.sessionEpoch) {
      expiredNotifications.set(store, store.sessionEpoch);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('galdcup:session-expired'));
      }
    }

    return Promise.reject(err);
  }
);

export default api;
