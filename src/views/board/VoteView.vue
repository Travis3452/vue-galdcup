<template>
  <Teleport to="body">
    <div class="dialog-overlay" @click.self="closePopup">
      <section ref="dialog" role="dialog" aria-modal="true" :aria-labelledby="titleId" tabindex="-1"
        class="dialog-panel vote-dialog">
        <header class="mb-6 flex items-start justify-between gap-4">
          <div>
            <p class="mb-2 text-sm font-bold text-indigo-600">갈드컵 투표</p>
            <h1 :id="titleId" class="text-xl sm:text-2xl font-bold text-slate-800">{{ voteSession?.topic || '당신의 선택은?' }}</h1>
            <p v-if="voteSession" class="mt-3 text-sm text-slate-600">{{ formatDate(voteSession.startTime) }} ~ {{ formatDate(voteSession.endTime) }}</p>
          </div>
          <button type="button" aria-label="투표창 닫기" :disabled="isSubmitting" class="icon-button text-xl" @click="closePopup">×</button>
        </header>
        <AsyncState :loading="isLoading" :error="loadError" :empty="!voteSession" empty-message="투표 정보를 찾을 수 없습니다." @retry="fetchVoteSession">
          <form @submit.prevent="submitVote">
            <fieldset :disabled="isSubmitting || !canVote">
              <legend class="mb-4 text-sm font-semibold text-slate-600">하나의 항목을 선택해 주세요.</legend>
              <div class="grid grid-cols-2 gap-4 sm:gap-6">
                <label v-for="(option, index) in voteSession?.options" :key="option.id ?? index"
                  class="vote-choice"
                  :class="selectedOptionIndex === index ? 'vote-choice-selected' : ''">
                  <input v-model="selectedOptionIndex" type="radio" :name="titleId" :value="index" required class="absolute left-4 top-4 h-5 w-5 accent-indigo-600" />
                  <img :src="option.imageUrl || '/images/option-placeholder.svg'" :alt="option.label" loading="lazy" width="300" height="300"
                    class="aspect-square w-full rounded-lg object-cover" />
                  <span class="mt-3 block break-words px-1 pb-2 text-center text-sm font-semibold">{{ option.label }}</span>
                </label>
              </div>
            </fieldset>
            <p v-if="!canVote" role="status" class="mt-5 text-sm font-semibold text-slate-600">{{ statusMessage }}</p>
            <p v-if="submitError" role="alert" class="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{{ submitError }}</p>
            <button type="submit" :disabled="!canVote || selectedOptionIndex === null || isSubmitting" class="ui-button mt-6 w-full disabled:opacity-50">
              {{ isSubmitting ? '제출 중…' : '투표 제출하기' }}
            </button>
          </form>
        </AsyncState>
        <button type="button" :disabled="isSubmitting" class="ui-button ui-button-secondary mt-4 w-full" @click="closePopup">닫기</button>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, useId } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/axios'
import { useUserStore } from '@/stores/user'
import { useResource } from '@/composables/useResource'
import { useDialog } from '@/composables/useDialog'
import { useClock } from '@/composables/useClock'
import { voteStatus, matchingVoteSession } from '@/utils/vote'
import { getErrorMessage } from '@/utils/request'
import { notify } from '@/services/notifications'
import AsyncState from '@/components/ui/AsyncState.vue'

const props = defineProps({ boardId: { type: [String, Number], default: null }, voteSessionId: { type: [String, Number], default: null } })
const emit = defineEmits(['close', 'voted'])
const route = useRoute()
const router = useRouter()
const user = useUserStore()
const dialog = ref(null)
const titleId = useId()
const voteSession = ref(null)
const selectedOptionIndex = ref(null)
const isSubmitting = ref(false)
const submitError = ref('')
const { loading: isLoading, error: loadError, load } = useResource('투표 정보를 불러오지 못했습니다.')
const targetBoardId = computed(() => props.boardId || route.params.boardId)
const targetSessionId = computed(() => props.voteSessionId || route.params.voteSessionId)
const now = useClock()
const status = computed(() => voteStatus(voteSession.value, now.value))
const canVote = computed(() => status.value === 'LIVE' && Boolean(user.accessToken)
  && matchingVoteSession(voteSession.value, targetBoardId.value, targetSessionId.value))
const statusMessage = computed(() => {
  if (!matchingVoteSession(voteSession.value, targetBoardId.value, targetSessionId.value)) return '투표가 변경되었습니다. 창을 닫고 현재 투표를 다시 열어 주세요.'
  if (!user.accessToken) return '로그인 후 투표할 수 있습니다.'
  if (status.value === 'UPCOMING') return '아직 투표 시작 전입니다.'
  return '투표가 종료되었거나 현재 참여할 수 없습니다.'
})
useDialog(dialog, () => true, closePopup)

function closePopup() {
  if (isSubmitting.value) return
  emit('close')
  if (window.opener && !window.opener.closed) { window.close(); return }
  if (route.name === 'Vote') router.replace(`/boards/${targetBoardId.value}`)
}
function formatDate(value) {
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toLocaleString('ko-KR') : ''
}
function fetchVoteSession() {
  selectedOptionIndex.value = null
  submitError.value = ''
  return load(signal => api.get(`/boards/${targetBoardId.value}/vote-session`, { signal }), res => { voteSession.value = res.data || null })
}
async function submitVote() {
  if (isSubmitting.value || selectedOptionIndex.value === null || !canVote.value) return
  const session = voteSession.value
  if (!session.options?.[selectedOptionIndex.value]) return
  isSubmitting.value = true
  submitError.value = ''
  try {
    await api.post(`/boards/${targetBoardId.value}/vote-session/${session.id}/votes`, { selectedOptionIndex: selectedOptionIndex.value })
    notify('투표가 완료되었습니다.')
    emit('voted', session.id)
    isSubmitting.value = false
    closePopup()
  } catch (error) { submitError.value = getErrorMessage(error, '투표를 제출하지 못했습니다. 이미 참여했는지 확인해 주세요.') }
  finally { isSubmitting.value = false }
}
watch([targetBoardId, targetSessionId], () => { voteSession.value = null; fetchVoteSession() }, { immediate: true })
</script>
<style scoped>
.vote-dialog { max-width:600px; }
.vote-choice { position:relative; cursor:pointer; border:2px solid var(--ui-control-border); border-radius:12px; padding:8px; background:var(--ui-surface); min-width:0; }
.vote-choice-selected { border-color:var(--ui-primary); background:var(--ui-primary-soft); }
.vote-choice:focus-within { outline:3px solid var(--ui-primary); outline-offset:3px; }
.vote-choice input { width:22px; height:22px; }
</style>
