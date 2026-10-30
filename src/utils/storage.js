export function readStorage(key, fallback = null, kind = 'localStorage') {
  try {
    return globalThis[kind]?.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

export function writeStorage(key, value, kind = 'localStorage') {
  try {
    globalThis[kind]?.setItem(key, String(value))
  } catch {
    // 저장소가 차단되어도 메모리 상태로 화면을 사용할 수 있다.
  }
}

export function removeStorage(key, kind = 'localStorage') {
  try {
    globalThis[kind]?.removeItem(key)
  } catch {
    // 브라우저 저장소 접근 불가 시에도 로그아웃 등 사용자 동작을 완료한다.
  }
}

export function readStoredArray(key) {
  try {
    const value = JSON.parse(readStorage(key, '[]'))
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function safeRedirectPath(value, fallback = '/') {
  return typeof value === 'string'
    && value.startsWith('/')
    && !value.startsWith('//')
    && !/[\\\u0000-\u001f]/.test(value)
    && !value.startsWith('/auth/callback/')
    ? value : fallback
}
