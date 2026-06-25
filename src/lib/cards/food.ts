// 먹이(미끼) 5단계. 비쌀수록 희귀도 보너스↑ → 레전드/예쁜 카드 확률↑.
// 가격(cost, 츄르 재화)은 지금은 표시용 (경제 시스템은 추후 슬라이스 B).

export type FoodId = 'churu' | 'can' | 'hwangtae' | 'sashimi' | 'feast'

export interface Food {
  id: FoodId
  label: string
  emoji: string
  bonus: number // 희귀도 점수 보너스
  cost: number // 츄르 재화
}

export const FOODS: Food[] = [
  { id: 'churu', label: '츄르', emoji: '🐟', bonus: 0, cost: 0 },
  { id: 'can', label: '통살 캔', emoji: '🥫', bonus: 2, cost: 5 },
  { id: 'hwangtae', label: '황태 트릿', emoji: '🍗', bonus: 4, cost: 15 },
  { id: 'sashimi', label: '참치 회', emoji: '🍣', bonus: 7, cost: 40 },
  { id: 'feast', label: '황금 만찬', emoji: '👑', bonus: 11, cost: 100 },
]

export const DEFAULT_FOOD: FoodId = 'churu'

export function getFood(id: FoodId): Food {
  return FOODS.find((f) => f.id === id) ?? FOODS[0]
}
