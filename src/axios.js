import axios from "axios";
import { useUserStore } from "@/stores/user";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true 
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const store = useUserStore();
    const originalRequest = err.config;

    // 1. 401 에러(인증 만료)가 발생했고, 아직 재시도하지 않은 요청인 경우
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("Access Token 만료 감지. 세션 연장을 시도합니다...");
        
        const isSuccess = await store.reissue();

        if (isSuccess) {
          console.log("세션 연장 성공. 실패했던 요청을 재전송합니다.");
          return api(originalRequest);
        }
      } catch (refreshErr) {
        console.error("세션이 완전히 만료되었습니다. 로그인이 필요합니다.");
        
        alert("로그인 세션이 만료되었습니다. 다시 로그인해 주세요.");
        
        window.location.href = "/login"; 
        
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default api;