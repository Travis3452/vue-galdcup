import { ref } from 'vue'

export const notifications = ref([])
let nextId = 0
export function dismissNotice(id) {
  notifications.value = notifications.value.filter(notice => notice.id !== id)
}
export function notify(message, type = 'info') {
  const id = ++nextId
  notifications.value = [...notifications.value.slice(-3), { id, message, type }]
  if (type !== 'error') setTimeout(() => dismissNotice(id), 6000)
  return id
}
