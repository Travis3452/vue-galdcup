import { createClient } from '@supabase/supabase-js'

export let supabase = null

export function getSupabase() {
  if (supabase) return supabase
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_PUBLIC_KEY
  if (!url || !key) throw new Error('이미지 업로드 설정을 확인할 수 없습니다.')
  // 앱 인증은 백엔드 쿠키로 처리한다. Storage 클라이언트는 별도 세션을 저장하지 않는다.
  supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
  return supabase
}
