export function isCanceled(error) {
  return error?.code === 'ERR_CANCELED' || error?.name === 'AbortError'
}

export function getErrorMessage(error, fallback = '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.') {
  const status = error?.response?.status
  if (status === 401) return '로그인이 필요하거나 로그인 시간이 만료되었습니다.'
  if (status === 403) return '이 작업을 수행할 권한이 없습니다.'
  if (status === 404) return '요청한 내용을 찾을 수 없습니다.'
  if (status >= 500) return '서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해 주세요.'
  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
    return '응답이 늦어지고 있습니다. 잠시 후 다시 시도해 주세요.'
  }
  const message = error?.response?.data?.message
  return typeof message === 'string' && message.trim() ? message.slice(0, 300) : fallback
}

// 취소를 지원하지 않는 응답도 버전 검사로 최신 화면을 덮어쓰지 못하게 한다.
export function createRequestGuard() {
  let version = 0
  let controller
  return {
    start() {
      controller?.abort()
      const activeController = new AbortController()
      controller = activeController
      const current = ++version
      return {
        signal: activeController.signal,
        isCurrent: () => current === version && !activeController.signal.aborted,
      }
    },
    invalidate() {
      version += 1
      controller?.abort()
    },
  }
}
