import type { Rarity } from '@/types'

export interface Reward {
  xp: number
  coins: number
}

// 등급별 획득 보상 (지금은 연출용 표시. 츄르 경제 슬라이스에서 profile에 적립 연결.)
const TABLE: Record<Rarity, Reward> = {
  common: { xp: 10, coins: 1 },
  uncommon: { xp: 25, coins: 2 },
  rare: { xp: 60, coins: 5 },
  epic: { xp: 130, coins: 12 },
  legendary: { xp: 300, coins: 30 },
}

export function rewardFor(rarity: Rarity): Reward {
  return TABLE[rarity]
}
