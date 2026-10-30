export const MONITORING_RANGES = [
  { value: '30m', label: '최근 30분' },
  { value: '1h', label: '최근 1시간' },
  { value: '6h', label: '최근 6시간' },
]

export function formatMetric(value, digits = 1) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString('ko-KR', { maximumFractionDigits: digits }) : '—'
}

export function formatBytes(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return '—'
  if (value < 1024) return `${formatMetric(value, 0)} B`
  if (value < 1024 ** 2) return `${formatMetric(value / 1024)} KiB`
  if (value < 1024 ** 3) return `${formatMetric(value / 1024 ** 2)} MiB`
  return `${formatMetric(value / 1024 ** 3)} GiB`
}

export function statusLabel(status) {
  return ({ UP: '정상', DOWN: '연결 실패', OUT_OF_SERVICE: '서비스 중단', UNKNOWN: '확인 불가' })[status] || '확인 불가'
}

export function hasChartValues(points) {
  return points?.some(point => typeof point.value === 'number' && Number.isFinite(point.value)) || false
}
