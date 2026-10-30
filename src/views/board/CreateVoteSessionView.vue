<template>
  <section class="vote-form-page">
    <div class="page-heading"><div><p class="eyebrow">{{ boardTitle }}</p><h1>새로운 투표 만들기</h1><p class="page-description">함께 선택하고 싶은 주제를 정해 주세요.<br />선택지는 2~10개까지, 각 선택지에는 이미지가 필요합니다.</p></div><button type="button" class="ui-button ui-button-secondary" :disabled="isAiButtonDisabled" @click="fetchAiRecommendation">{{ cooldownText }}</button></div>
    <form class="surface panel-padding" @submit.prevent="createVoteSession">
      <div class="form-section"><h2 class="form-section-title">어떤 주제로 이야기할까요?</h2>
        <div><label for="vote-topic" class="field-label">투표 주제 <span class="muted">(필수)</span></label><input id="vote-topic" v-model="topic" class="form-control" maxlength="100" :disabled="isSubmitting || isAiLoading" placeholder="예: 민트초코, 당신의 선택은?" required /><p class="field-help">{{ topic.length }} / 100자</p></div>
        <div><label for="vote-description" class="field-label">투표 설명 <span class="muted">(선택)</span></label><textarea id="vote-description" v-model="description" class="form-control" maxlength="1000" :disabled="isSubmitting || isAiLoading" rows="3" placeholder="참여자가 알아야 할 배경이나 선택 기준을 적어주세요."></textarea></div>
      </div>
      <div class="form-section"><div><h2 class="form-section-title">언제 투표할까요?</h2><p class="field-help">날짜와 시간은 한국 시간(KST) 기준입니다.</p></div>
        <div class="vote-date-fields"><div><label for="vote-start" class="field-label">시작 시간 <span class="muted">(필수)</span></label><input id="vote-start" v-model="startTime" class="form-control" type="datetime-local" :disabled="isSubmitting || isAiLoading" required /></div><div><label for="vote-end" class="field-label">종료 시간 <span class="muted">(필수)</span></label><input id="vote-end" v-model="endTime" class="form-control" type="datetime-local" :disabled="isSubmitting || isAiLoading" required /></div></div>
      </div>
      <div class="form-section"><div><h2 class="form-section-title">선택지를 추가해 주세요</h2><p class="field-help">일반 이미지 형식 · 이미지당 최대 10MB</p></div>
        <div class="option-edit-list"><fieldset v-for="(option, index) in options" :key="option.id" class="option-edit-card">
          <legend class="option-legend">선택지 {{ index + 1 }}</legend>
          <button v-if="options.length > 2" type="button" class="icon-button option-remove" :disabled="isSubmitting || isAiLoading" :aria-label="`선택지 ${index + 1} 삭제`" @click="removeOption(index)">×</button>
          <div class="option-edit-content"><div><input type="file" :accept="IMAGE_ACCEPT" class="sr-only" :ref="el => setFileInput(option.id, el)" :aria-label="`선택지 ${index + 1} 이미지`" :tabindex="-1" @change="handleImageChange($event, index)" />
            <button type="button" class="image-picker" :disabled="isSubmitting || isAiLoading || option.uploading" :aria-label="`선택지 ${index + 1} 이미지 선택`" @click="triggerFileInput(index)"><img v-if="optionPreviews[index]" :src="optionPreviews[index]" :alt="`선택지 ${index + 1} 미리보기`" /><template v-else><span aria-hidden="true" class="text-xl">＋</span><span>이미지</span></template><span v-if="option.uploading" class="image-upload-state" role="status">업로드 중…</span></button>
          </div><div class="min-w-0"><label :for="`vote-option-${option.id}`" class="field-label">선택지 내용 <span class="muted">(필수)</span></label><input :id="`vote-option-${option.id}`" v-model="option.label" class="form-control" :disabled="isSubmitting || isAiLoading" placeholder="선택할 내용을 입력해 주세요" required /><p v-if="option.error" role="alert" class="field-error">{{ option.error }}</p></div></div>
        </fieldset></div>
        <button type="button" class="ui-button ui-button-secondary w-full" :disabled="options.length >= 10 || isSubmitting || isAiLoading" @click="addOption">＋ 선택지 추가 <span class="muted">({{ options.length }} / 10)</span></button>
      </div>
      <p v-if="errorMessage" role="alert" class="field-error">{{ errorMessage }}</p><p v-else-if="!isFormValid" class="field-help">{{ validationMessage }}</p>
      <div class="form-actions"><button type="button" class="ui-button ui-button-secondary" :disabled="isSubmitting" @click="$router.back()">취소</button><button type="submit" class="ui-button" :disabled="!isFormValid || isSubmitting || isAiLoading">{{ isSubmitting ? '만드는 중…' : '투표 만들기' }}</button></div>
    </form>
  </section>
</template>
<script setup>
import { ref, computed, onScopeDispose } from 'vue'
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'
import api from '@/axios'
import { useBoardStore } from '@/stores/board'
import { useVoteOptions } from '@/composables/useVoteOptions'
import { IMAGE_ACCEPT } from '@/utils/image'
import { voteFormError, toSeoulOffsetDateTime, seoulDateInput } from '@/utils/voteForm'
import { getErrorMessage } from '@/utils/request'
import { notify } from '@/services/notifications'

const router = useRouter(), route = useRoute(), boardStore = useBoardStore()
const topic = ref(''), description = ref('')
const startTime = ref(seoulDateInput(Date.now()))
const endTime = ref(seoulDateInput(Date.now() + 7 * 86400000))
const fileInputs = new Map()
const { options, uploading, add: addOption, remove: removeOption, reset: resetOptions, changeImage } = useVoteOptions()
const optionPreviews = computed(() => options.value.map(row => row.preview))
const optionImages = computed(() => options.value.map(row => row.imageUrl))
const isSubmitting = ref(false), isAiLoading = ref(false), errorMessage = ref('')
const boardTitle = computed(() => boardStore.currentBoard?.topic || '게시판')
const cooldownRemaining = ref(0)
let cooldownTimer, disposed = false, completed = false
const controller = new AbortController()
const isAiButtonDisabled = computed(() => isAiLoading.value || isSubmitting.value || uploading.value || cooldownRemaining.value > 0)
const cooldownText = computed(() => isAiLoading.value ? 'AI가 고민 중…' : cooldownRemaining.value > 0 ? `${cooldownRemaining.value}초 후 재추천 가능` : 'Gemini에게 추천받기')
const form = () => ({ topic: topic.value, description: description.value, startTime: startTime.value, endTime: endTime.value, options: options.value })
const validationMessage = computed(() => voteFormError(form()))
const isFormValid = computed(() => !validationMessage.value)
function startCooldown(seconds) {
  clearInterval(cooldownTimer)
  const until = Date.now() + seconds * 1000
  cooldownRemaining.value = seconds
  cooldownTimer = setInterval(() => {
    cooldownRemaining.value = Math.max(0, Math.ceil((until - Date.now()) / 1000))
    if (!cooldownRemaining.value) clearInterval(cooldownTimer)
  }, 1000)
}
async function fetchAiRecommendation() {
  if (isAiButtonDisabled.value) return
  if ((topic.value.trim() || options.value.some(row => row.label.trim() || row.preview))
      && !confirm('입력한 주제·설명·선택지·이미지를 AI 추천 내용으로 바꾸시겠습니까?')) return
  isAiLoading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get(`/boards/${route.params.boardId}/vote-session/recommend`, { signal: controller.signal, timeout: 90000 })
    if (disposed) return
    const data = response.data
    if (typeof data?.topic !== 'string' || !Array.isArray(data.options) || data.options.length < 2 || data.options.length > 10
      || data.options.some(label => typeof label !== 'string' || !label.trim())) throw new Error('Invalid recommendation')
    topic.value = data.topic
    description.value = typeof data.description === 'string' ? data.description : ''
    resetOptions(data.options)
    startCooldown(60)
  } catch (error) {
    if (!disposed) {
      if (error.response?.status === 429) startCooldown(30)
      errorMessage.value = getErrorMessage(error, 'AI 추천을 불러오지 못했습니다. 다시 시도해 주세요.')
    }
  } finally { if (!disposed) isAiLoading.value = false }
}
function setFileInput(id, element) { if (element) fileInputs.set(id, element); else fileInputs.delete(id) }
function triggerFileInput(index) { fileInputs.get(options.value[index]?.id)?.click() }
function handleImageChange(event, index) {
  const file = event.target.files?.[0], row = options.value[index]
  event.target.value = ''
  if (file && row && !isSubmitting.value && !isAiLoading.value) changeImage(row, file)
}
async function createVoteSession() {
  if (isSubmitting.value || isAiLoading.value) return
  errorMessage.value = voteFormError(form())
  if (errorMessage.value) return
  isSubmitting.value = true
  try {
    await api.post(`/boards/${route.params.boardId}/vote-session`, {
      topic: topic.value.trim(), description: description.value.trim(),
      startTime: toSeoulOffsetDateTime(startTime.value), endTime: toSeoulOffsetDateTime(endTime.value),
      options: options.value.map(row => ({ label: row.label.trim(), imageUrl: row.imageUrl })),
    })
    completed = true
    notify('투표가 생성되었습니다.')
    await router.replace(`/boards/${route.params.boardId}`)
  } catch (error) { if (!disposed) errorMessage.value = getErrorMessage(error, '투표를 생성하지 못했습니다.') }
  finally { if (!disposed) isSubmitting.value = false }
}
onBeforeRouteLeave(() => {
  if (completed) return true
  if (isSubmitting.value) return false
  const dirty = topic.value.trim() || description.value.trim() || options.value.some(row => row.label.trim() || row.preview)
  return !dirty || confirm('작성 중인 투표를 저장하지 않고 이동하시겠습니까?')
})
onScopeDispose(() => { disposed = true; controller.abort(); clearInterval(cooldownTimer) })
</script>
<style scoped>
.vote-form-page { max-width:896px; margin-inline:auto; min-width:0; }
.form-section-title { font-size:17px; font-weight:700; }
.vote-date-fields { display:grid; grid-template-columns:minmax(0,1fr); gap:20px; }
.option-edit-list { display:grid; gap:16px; }
.option-edit-card { position:relative; min-width:0; padding:20px 16px; border:1px solid var(--ui-border); border-radius:12px; background:var(--ui-surface-subtle); }
.option-legend { padding-inline:8px; color:var(--ui-secondary); font-size:13px; font-weight:650; }
.option-remove { position:absolute; right:4px; top:-18px; background:var(--ui-surface); border:1px solid var(--ui-border); font-size:20px; }
.option-edit-content { display:grid; grid-template-columns:72px minmax(0,1fr); gap:16px; align-items:start; }
.image-picker { position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; width:72px; height:84px; overflow:hidden; border:1px dashed var(--ui-control-border); border-radius:10px; background:var(--ui-surface); color:var(--ui-text-muted); font-size:12px; }
.image-picker:hover { border-color:var(--ui-primary); color:var(--ui-primary); }
.image-picker img { width:100%; height:100%; object-fit:cover; }
.image-upload-state { position:absolute; inset:0; display:grid; place-items:center; padding:4px; color:var(--ui-on-overlay); background:var(--ui-overlay); font-size:11px; }
@media(min-width:768px) { .vote-date-fields { grid-template-columns:repeat(2,minmax(0,1fr)); } .option-edit-content { grid-template-columns:96px minmax(0,1fr); gap:20px; } .image-picker { width:96px; height:96px; } }
</style>
