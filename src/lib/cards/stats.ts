import type { CaptureContext, Stats } from '@/types'
import { roll } from './seed'

const clamp = (n: number) => Math.max(1, Math.min(10, n))

/**
 * 스탯 산정 — 규칙기반·결정적.
 * 시드(사진 해시 등)에서 기본값을 굴리고, 캐치 맥락으로 보정.
 * 같은 (seed, ctx) → 항상 같은 스탯 (재현 가능, 설명 가능).
 */
export function computeStats(seed: string, ctx: CaptureContext): Stats {
  let cuteness = roll(seed, 'cuteness')
  let chonky = roll(seed, 'chonky')
  let friendliness = roll(seed, 'friendliness')
  let charisma = roll(seed, 'charisma')

  if (ctx.timeOfDay === 'night') charisma += 2
  if (ctx.timeOfDay === 'sunset') cuteness += 1
  if (ctx.weather === 'snow') charisma += 1

  return {
    cuteness: clamp(cuteness),
    chonky: clamp(chonky),
    friendliness: clamp(friendliness),
    charisma: clamp(charisma),
  }
}
