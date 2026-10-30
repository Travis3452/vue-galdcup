import { nextTick, onScopeDispose, watch } from 'vue'

let lockCount = 0
let previousOverflow = ''
const dialogs = []
const focusable = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// 맨 위 대화상자만 키 입력을 처리하고, 닫으면 열기 버튼으로 초점을 돌린다.
export function useDialog(element, isOpen, close) {
  const token = {}
  let previousFocus
  let active = false
  function keydown(event) {
    if (dialogs.at(-1) !== token) return
    const dialog = element.value
    if (!dialog) return
    if (event.key === 'Escape') { event.preventDefault(); close(); return }
    if (event.key !== 'Tab') return
    const candidates = [...dialog.querySelectorAll(focusable)].filter(node => node.getClientRects().length && !node.closest('[inert]'))
    const first = candidates[0], last = candidates.at(-1)
    if (!first) { event.preventDefault(); dialog.focus(); return }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog || !dialog.contains(document.activeElement))) {
      event.preventDefault(); last.focus()
    } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
      event.preventDefault(); first.focus()
    }
  }
  function deactivate() {
    if (!active) return
    active = false
    document.removeEventListener('keydown', keydown)
    dialogs.splice(dialogs.indexOf(token), 1)
    if (--lockCount === 0) document.body.style.overflow = previousOverflow
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
  }
  watch(isOpen, async open => {
    if (!open) { deactivate(); return }
    if (active) return
    active = true
    previousFocus = document.activeElement
    if (lockCount++ === 0) { previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden' }
    dialogs.push(token)
    document.addEventListener('keydown', keydown)
    await nextTick()
    if (active) element.value?.focus({ preventScroll: true })
  }, { immediate: true, flush: 'post' })
  onScopeDispose(deactivate)
}
