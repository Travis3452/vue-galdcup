function nonNegativeInteger(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? Math.floor(number) : fallback
}

// 기존 API 계약과 동일하게 UI, URL, 서버 요청 모두 0부터 시작한다.
export function toApiPage(page = 0) {
  return nonNegativeInteger(page)
}

export function clampPage(page, totalPages) {
  return Math.min(nonNegativeInteger(page), Math.max(nonNegativeInteger(totalPages) - 1, 0))
}

export function normalizePage(data) {
  if (!data || !Array.isArray(data.content)) return data

  const source = data.page && typeof data.page === 'object' ? data.page : data
  const size = Math.max(nonNegativeInteger(source.size, data.content.length || 10), 1)
  const totalElements = nonNegativeInteger(source.totalElements, data.content.length)
  const totalPages = nonNegativeInteger(source.totalPages, Math.ceil(totalElements / size))
  const number = nonNegativeInteger(source.number)
  const metadata = { size, totalElements, totalPages, number }

  return {
    ...data,
    ...metadata,
    first: number === 0,
    last: totalPages === 0 || number >= totalPages - 1,
    page: metadata,
  }
}

export function pageNumbers(currentPage, totalPages, maximum = 5) {
  const total = nonNegativeInteger(totalPages)
  const count = Math.min(total, Math.max(nonNegativeInteger(maximum, 5), 1))
  const current = Math.min(nonNegativeInteger(currentPage), Math.max(total - 1, 0))
  const start = Math.max(0, Math.min(current - Math.floor(count / 2), total - count))
  return Array.from({ length: count }, (_, index) => start + index + 1)
}
