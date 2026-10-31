export const STATISTICS_RANGES = [{ days: 1, label: '오늘' }, { days: 7, label: '7일' }, { days: 30, label: '30일' }, { days: 90, label: '90일' }]

export function signupChartPoints(points = []) {
  return points.map(point => ({ timestamp: Date.parse(`${point.date}T00:00:00+09:00`), value: point.count }))
}

export function formatDay(value) {
  if (!value) return '아직 없음'
  const date = new Date(`${value}T00:00:00+09:00`)
  return Number.isFinite(date.getTime()) ? date.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric' }) : '확인 불가'
}
