import { supabase } from '@/lib/supabase/client'
import { ensureSession } from '@/lib/auth/session'
import type { Profile } from '@/types'

const COLS = 'id,nickname,xp,level,churu,coins'

export async function getMyProfile(): Promise<Profile> {
  const user = await ensureSession()
  const { data, error } = await supabase.from('profiles').select(COLS).eq('id', user.id).single()
  if (error) throw new Error(`프로필 불러오기 실패: ${error.message}`)
  return data as Profile
}

/** 캐치 보상 적립: 먹이비용 차감 + xp/coins/츄르 적립, 레벨 재계산 */
export async function applyCatchRewards(input: {
  foodCost: number
  xp: number
  coins: number
  churuBack: number
}): Promise<Profile> {
  const p = await getMyProfile()
  const xp = p.xp + input.xp
  const level = Math.floor(xp / 100) + 1
  const churu = Math.max(0, p.churu - input.foodCost + input.churuBack)
  const coins = p.coins + input.coins
  const { data, error } = await supabase
    .from('profiles')
    .update({ xp, level, churu, coins })
    .eq('id', p.id)
    .select(COLS)
    .single()
  if (error) throw new Error(`보상 적립 실패: ${error.message}`)
  return data as Profile
}

/** 코인으로 츄르 충전 */
export async function buyChuru(coinsCost: number, churuGain: number): Promise<Profile> {
  const p = await getMyProfile()
  if (p.coins < coinsCost) throw new Error('코인이 부족해요')
  const { data, error } = await supabase
    .from('profiles')
    .update({ coins: p.coins - coinsCost, churu: p.churu + churuGain })
    .eq('id', p.id)
    .select(COLS)
    .single()
  if (error) throw new Error(`충전 실패: ${error.message}`)
  return data as Profile
}
