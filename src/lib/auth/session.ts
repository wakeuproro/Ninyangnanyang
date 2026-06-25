import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

/**
 * 세션 보장 — 없으면 익명 로그인.
 * (Supabase 대시보드에서 Anonymous sign-in 활성화 필요)
 * 추후 카카오/이메일 로그인으로 업그레이드 시 익명 계정 연동 가능.
 */
export async function ensureSession(): Promise<User> {
  const { data } = await supabase.auth.getSession()
  if (data.session) return data.session.user

  const { data: anon, error } = await supabase.auth.signInAnonymously()
  if (error || !anon.user) {
    throw new Error(`익명 로그인 실패: ${error?.message ?? 'unknown'}`)
  }
  return anon.user
}
