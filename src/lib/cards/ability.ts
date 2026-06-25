import type { CaptureContext, Rarity } from '@/types'
import { TRIBE_LABEL, type Tribe } from './tribe'

/**
 * 능력 문구 — PoC는 규칙기반 템플릿(결정적). 추후 LLM으로 톤 입힘.
 */
export function makeAbility(tribe: Tribe, rarity: Rarity, ctx: CaptureContext): string {
  const lines: string[] = []

  if (ctx.timeOfDay === 'night') lines.push('밤에 잡으면 카리스마 +1.')
  if (ctx.timeOfDay === 'sunset') lines.push('노을에 잡으면 예쁨 +1.')
  if (tribe !== 'unknown') lines.push(`같은 ${TRIBE_LABEL[tribe]}끼리 모으면 친화력 +1.`)
  if (rarity === 'legendary') lines.push('전설: 도감 등장 시 모든 냥 +1 매력.')

  return lines.length > 0 ? lines.join(' ') : '특별한 능력은 아직 잠들어 있다.'
}
