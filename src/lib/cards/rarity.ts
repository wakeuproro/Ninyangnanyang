import type { CaptureContext, Rarity, Stats } from '@/types'

export interface RarityResult {
  rarity: Rarity
  score: number
  reasons: string[] // "왜 이 등급인가" 설명 (explainable)
}

/**
 * 등급 산정 — 규칙기반·결정적·설명 가능.
 * 점수 = 스탯 합(4~40) + 맥락 보너스. 임계값으로 등급 결정.
 * 학습/LLM은 이 점수를 바꾸지 않음 (deterministic 보장).
 */
export function computeRarity(
  stats: Stats,
  ctx: CaptureContext,
  opts: { firstDiscovery?: boolean } = {},
): RarityResult {
  const reasons: string[] = []
  let score = stats.cuteness + stats.chonky + stats.friendliness + stats.charisma
  reasons.push(`기본 스탯 합 ${score}`)

  const bonus = (label: string, n: number) => {
    score += n
    reasons.push(`${label} +${n}`)
  }

  if (ctx.timeOfDay === 'night' || ctx.timeOfDay === 'dawn') bonus('야간/새벽 발견', 3)
  if (ctx.weather === 'rain') bonus('비 오는 날', 4)
  if (ctx.weather === 'snow') bonus('눈 오는 날', 6)
  if (ctx.weather === 'fog') bonus('안개', 2)
  if (opts.firstDiscovery) bonus('최초 발견', 6)

  const rarity: Rarity =
    score >= 46 ? 'legendary'
    : score >= 38 ? 'epic'
    : score >= 30 ? 'rare'
    : score >= 22 ? 'uncommon'
    : 'common'

  return { rarity, score, reasons }
}
