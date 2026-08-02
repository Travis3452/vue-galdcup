import axios from "axios";
import { useUserStore } from "@/stores/user";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true // Refresh Token 쿠키 전달용으로 유지
});

// ⭐ [핵심] 요청 인터셉터: 메모리에 있는 Access Token을 헤더에 장착하여 전송
api.interceptors.request.use(
  (config) => {
    const store = useUserStore();
    if (store.accessToken) {
      config.headers['Authorization'] = `Bearer ${store.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const store = useUserStore();
    const originalRequest = err.config;

    // [Case 1] 429 Too Many Requests
    if (err.response?.status === 429) {
      const limitMessage = err.response.data?.message || "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
      console.warn(`[Rate Limit] ${limitMessage}`);
      alert(limitMessage);
      return Promise.reject(err);
    }

    // [Case 2] 401 Unauthorized (인증 만료)
    if (err.response?.status === 401 && !originalRequest._retry) {
      
      if (originalRequest.url.includes('/auth/')) {
        return Promise.reject(err);
      }

      originalRequest._retry = true;

      try {
        console.log("Access Token 만료 감지. 세션 연장을 시도합니다...");
        const isSuccess = await store.reissue();

        if (isSuccess) {
          console.log("세션 연장 성공. 실패했던 요청을 재전송합니다.");
          return api(originalRequest);
        } else {
          throw new Error("Refresh token expired or invalid");
        }
      } catch (refreshErr) {
        console.error("세션이 완전히 만료되었습니다. 로그인이 필요합니다.");
        store.clearLocalData(); 
        alert("로그인 세션이 만료되었습니다. 다시 로그인해 주세요.");
        window.location.href = "/"; 
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default api;