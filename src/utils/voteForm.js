export function toSeoulOffsetDateTime(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null
  const date = new Date(`${value}:00+09:00`)
  if (!Number.isFinite(date.getTime())) return null
  // 2월 30일처럼 Date가 자동 보정하는 잘못된 날짜도 거절한다.
  if (new Date(date.getTime() + 9 * 3600000).toISOString().slice(0, 16) !== value) return null
  return `${value}:00+09:00`
}
export function seoulDateInput(time) {
  return new Date(time + 9 * 3600000).toISOString().slice(0, 16)
}
export function voteFormError({ topic, description, startTime, endTime, options }) {
  if (!topic.trim() || topic.trim().length > 100) return '투표 주제를 1~100자로 입력해 주세요.'
  if (description.length > 1000) return '투표 설명은 1,000자 이하여야 합니다.'
  const start = toSeoulOffsetDateTime(startTime), end = toSeoulOffsetDateTime(endTime)
  if (!start || !end) return '시작·종료 시간을 올바르게 입력해 주세요. (한국 시간 기준)'
  if (new Date(end).getTime() <= new Date(start).getTime()) return '종료 시간은 시작 시간보다 늦어야 합니다.'
  if (options.length < 2 || options.length > 10) return '선택지는 2~10개가 필요합니다.'
  if (options.some(option => !option.label.trim() || !option.imageUrl || option.uploading)) return '모든 선택지에 내용과 이미지를 추가하고 업로드가 끝날 때까지 기다려 주세요.'
  return ''
}
