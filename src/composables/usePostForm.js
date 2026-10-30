import { ref, computed, onMounted, onScopeDispose } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import DOMPurify from 'dompurify'
import api from '../axios.js'
import { uploadImage } from '../services/uploadImage.js'
import { IMAGE_ACCEPT, validateImage } from '../utils/image.js'
import { getErrorMessage } from '../utils/request.js'

export function usePostForm({ boardId, postId, onSaved }) {
  const title = ref(''), categories = ref([]), selectedCategoryId = ref(null), editorRef = ref(null)
  const submitting = ref(false), loading = ref(true), ready = ref(false), uploading = ref(false), dirty = ref(false)
  const errorMessage = ref(''), contentLength = ref(0)
  const controller = new AbortController()
  let editor, disposed = false, initialized = false, completed = false, baselineTitle = '', baselineCategory = null
  let fileInput
  const hasChanges = computed(() => dirty.value || title.value !== baselineTitle || selectedCategoryId.value !== baselineCategory)
  function changed() { dirty.value = true; contentLength.value = editor?.root.innerHTML.length || 0 }
  function beforeUnload(event) { if (initialized && hasChanges.value) { event.preventDefault(); event.returnValue = '' } }
  async function initialize() {
    if (loading.value && initialized) return
    if (ready.value) return
    loading.value = true
    errorMessage.value = ''
    try {
      const [categoryResponse, postResponse, quillModule] = await Promise.all([
        api.get(`/boards/${boardId}/post-categories`, { signal: controller.signal }),
        postId ? api.get(`/posts/${postId}`, { signal: controller.signal }) : null,
        import('quill'), import('quill/dist/quill.snow.css'),
      ])
      if (disposed || !editorRef.value) return
      const post = postResponse?.data
      if (post && post.boardId != null && String(post.boardId) !== String(boardId)) throw new Error('다른 게시판의 게시글입니다.')
      categories.value = categoryResponse.data || []
      title.value = post?.title || ''
      selectedCategoryId.value = post?.categoryId ?? categories.value.find(category => (category.categoryType || category.type) === 'GENERAL')?.id ?? null
      baselineTitle = title.value
      baselineCategory = selectedCategoryId.value
      editor = new quillModule.default(editorRef.value, { theme: 'snow', placeholder: '의견을 자유롭게 작성해 주세요.',
        modules: { toolbar: [[{ header: [1, 2, false] }], ['bold', 'italic', 'underline'], ['link', 'image'], [{ list: 'ordered' }, { list: 'bullet' }]] } })
      editor.root.setAttribute('role', 'textbox')
      editor.root.setAttribute('aria-label', '게시글 본문')
      editor.root.setAttribute('aria-multiline', 'true')
      if (post) editor.setContents(editor.clipboard.convert({ html: DOMPurify.sanitize(post.content || '') }), 'silent')
      contentLength.value = editor.root.innerHTML.length
      editor.on('text-change', changed)
      const toolbar = editor.getModule('toolbar')
      const labels = { bold: '굵게', italic: '기울임', underline: '밑줄', link: '링크', image: '이미지', list: '목록', header: '제목 서식' }
      toolbar?.container.querySelectorAll('button, select').forEach(control => {
        const format = [...control.classList].find(name => name.startsWith('ql-'))?.slice(3)
        if (labels[format]) control.setAttribute('aria-label', `${labels[format]}${control.value === 'ordered' ? ' (번호)' : control.value === 'bullet' ? ' (글머리표)' : ''}`)
      })
      toolbar?.container.querySelectorAll('.ql-picker-label').forEach(control => {
        control.setAttribute('aria-label', '제목 서식 선택')
      })
      toolbar?.addHandler('image', chooseImage)
      initialized = true
      ready.value = true
      dirty.value = false
    } catch (error) {
      if (!disposed) errorMessage.value = getErrorMessage(error, '작성 화면을 준비하지 못했습니다. 다시 시도해 주세요.')
    } finally { if (!disposed) loading.value = false }
  }
  function chooseImage() {
    if (uploading.value || submitting.value || !editor) return
    const index = editor.getSelection(true)?.index ?? Math.max(editor.getLength() - 1, 0)
    fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = IMAGE_ACCEPT
    fileInput.onchange = async () => {
      const file = fileInput?.files?.[0]
      if (!file || disposed) return
      try { validateImage(file) } catch (error) { errorMessage.value = error.message; return }
      try {
        uploading.value = true
        editor.enable(false)
        const url = await uploadImage(file)
        if (disposed || !editor) return
        const insertion = Math.min(index, Math.max(editor.getLength() - 1, 0))
        editor.insertEmbed(insertion, 'image', url, 'user')
        editor.setSelection(insertion + 1, 0)
      } catch (error) {
        if (!disposed) errorMessage.value = getErrorMessage(error, '이미지 업로드에 실패했습니다.')
      } finally {
        if (!disposed) { uploading.value = false; editor?.enable(true) }
        if (fileInput) fileInput.onchange = null
        fileInput = null
      }
    }
    fileInput.click()
  }
  async function submit() {
    if (submitting.value || loading.value || uploading.value || !ready.value || !editor) return
    errorMessage.value = ''
    const content = DOMPurify.sanitize(editor.root.innerHTML)
    if (!selectedCategoryId.value || !title.value.trim()) { errorMessage.value = '카테고리와 제목을 입력해 주세요.'; return }
    if (title.value.trim().length > 50) { errorMessage.value = '제목은 50자 이하여야 합니다.'; return }
    if (!editor.getText().trim() && !editor.root.querySelector('img')) { errorMessage.value = '본문을 입력해 주세요.'; return }
    if (content.length > 2000) { errorMessage.value = '본문은 서식을 포함해 2,000자 이하여야 합니다. 내용을 줄여 주세요.'; return }
    submitting.value = true
    editor.enable(false)
    try {
      const payload = { categoryId: selectedCategoryId.value, title: title.value.trim(), content }
      if (postId) await api.put(`/posts/${postId}`, payload)
      else await api.post('/posts', { boardId, ...payload })
      dirty.value = false
      baselineTitle = title.value
      baselineCategory = selectedCategoryId.value
      completed = true
      await onSaved()
    } catch (error) { if (!disposed) errorMessage.value = getErrorMessage(error, '게시글을 저장하지 못했습니다.') }
    finally { submitting.value = false; if (!disposed) editor?.enable(true) }
  }
  onMounted(() => { initialize(); window.addEventListener('beforeunload', beforeUnload) })
  onBeforeRouteLeave(() => {
    if (submitting.value && !completed) return false
    return !initialized || !hasChanges.value || window.confirm('작성 중인 내용이 있습니다. 저장하지 않고 이동하시겠습니까?')
  })
  onScopeDispose(() => {
    disposed = true
    controller.abort()
    window.removeEventListener('beforeunload', beforeUnload)
    if (fileInput) fileInput.onchange = null
    fileInput = null
    editor?.off('text-change', changed)
    editor?.disable()
    editor = null
  })
  return { title, categories, selectedCategoryId, editorRef, submitting, loading, ready, uploading, errorMessage, contentLength, submit, initialize }
}
