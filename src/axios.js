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

    // [Case 1] 429 Too Many Requests (트래픽 제한 초과)
    if (err.response?.status === 429) {
      // 백엔드 ExceptionResponse에서 보낸 메시지 추출
      const limitMessage = err.response.data?.message || "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
      
      console.warn(`[Rate Limit] ${limitMessage}`);
      alert(limitMessage); // 사용자에게 알림
      
      // 추가적인 재시도 없이 즉시 거절하여 서버 부하 방지
      return Promise.reject(err);
    }

    // [Case 2] 401 Unauthorized (인증 만료)
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