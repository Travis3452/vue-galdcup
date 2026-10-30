import { computed, onScopeDispose, ref } from 'vue'
import { validateImage } from '../utils/image.js'
import { uploadImage } from '../services/uploadImage.js'

let nextId = 0
export function useVoteOptions({ upload = uploadImage, createURL = file => URL.createObjectURL(file), revokeURL = url => URL.revokeObjectURL(url) } = {}) {
  const options = ref([])
  let disposed = false
  const make = label => ({ id: ++nextId, label, preview: null, imageUrl: null, uploading: false, error: '', version: 0 })
  function release(row) {
    row.version++
    if (row.preview?.startsWith('blob:')) revokeURL(row.preview)
  }
  function reset(labels = ['', '']) {
    options.value.forEach(release)
    options.value = labels.map(label => make(label))
  }
  function add() { if (options.value.length < 10) options.value.push(make('')) }
  function remove(index) {
    if (options.value.length <= 2 || !options.value[index]) return
    release(options.value[index])
    options.value.splice(index, 1)
  }
  async function changeImage(row, file) {
    try { validateImage(file) } catch (error) { row.error = error.message; return false }
    const previousUrl = row.imageUrl
    release(row)
    const version = row.version
    row.preview = createURL(file)
    row.imageUrl = null
    row.error = ''
    row.uploading = true
    const isCurrent = () => !disposed && options.value.includes(row) && row.version === version
    try {
      const url = await upload(file)
      if (!isCurrent()) return false
      row.imageUrl = url
      return true
    } catch {
      if (isCurrent()) {
        if (row.preview?.startsWith('blob:')) revokeURL(row.preview)
        row.preview = previousUrl
        row.imageUrl = previousUrl
        row.error = '이미지 업로드에 실패했습니다. 다시 선택해 주세요.'
      }
      return false
    } finally { if (isCurrent()) row.uploading = false }
  }
  reset()
  onScopeDispose(() => { disposed = true; options.value.forEach(release) })
  const uploading = computed(() => options.value.some(row => row.uploading))
  return { options, uploading, add, remove, reset, changeImage }
}
