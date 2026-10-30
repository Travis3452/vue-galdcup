// 만료 시점을 이용한 갱신 최적화다. 서명 확인과 인가는 반드시 서버에서 수행한다.
export function tokenExpiresSoon(token, now = Date.now()) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const expires = JSON.parse(atob(payload)).exp
    return Number.isFinite(expires) && expires * 1000 <= now + 30000
  } catch { return false }
}
