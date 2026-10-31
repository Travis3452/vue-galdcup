export function koreaDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
  const part = type => parts.find(value => value.type === type).value
  return `${part('year')}-${part('month')}-${part('day')}`
}

export function isActivityPage(path) {
  return path === '/' || path === '/mypage' || /^\/boards(?:\/|$)/.test(path)
}

export function createActivityReporter(send, { day = koreaDate, now = Date.now } = {}) {
  let recorded = '', pending = '', retryKey = '', retryAt = 0, generation = 0, controller
  return {
    async report(userId) {
      if (!Number.isSafeInteger(userId) || userId <= 0) return false
      const key = `${userId}:${day()}`
      if (recorded === key || pending === key || (retryKey === key && now() < retryAt)) return false
      controller?.abort()
      controller = new AbortController()
      const current = ++generation
      pending = key
      try {
        await send(controller.signal)
        if (current !== generation) return false
        recorded = key
        retryKey = ''
        return true
      } catch {
        if (current === generation) { retryKey = key; retryAt = now() + 30000 }
        return false
      } finally { if (current === generation) pending = '' }
    },
    reset() {
      generation += 1
      controller?.abort()
      recorded = ''; pending = ''; retryKey = ''; retryAt = 0
    },
  }
}
