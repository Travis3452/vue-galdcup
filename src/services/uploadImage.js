import { validateImage } from '../utils/image.js'

export async function uploadImage(file) {
  const ext = validateImage(file)
  const { getSupabase } = await import('../supabase.js')
  const supabase = getSupabase()
  // 안전한 파일명 생성 (UUID + 확장자)
  const safeName = `${Date.now()}_${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('post-images')
    .upload(safeName, file, { cacheControl: '3600', upsert: false })

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage
    .from('post-images')
    .getPublicUrl(safeName)

  if (!data?.publicUrl) {
    throw new Error('Public URL 생성 실패')
  }

  return data.publicUrl
}
