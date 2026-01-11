import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLIC_KEY
)

export async function uploadImage(file) {
  // 확장자 추출
  const ext = file.name.split('.').pop()
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