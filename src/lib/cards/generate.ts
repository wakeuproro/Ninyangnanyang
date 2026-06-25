import type { CaptureContext, NewCatCard } from '@/types'
import { pickBgTheme } from '@/lib/backgrounds/theme'
import { computeStats } from './stats'
import { computeRarity } from './rarity'
import { resolveTribe, type Tribe } from './tribe'
import { makeAbility } from './ability'
import { generateName } from './name'
import { getFood, DEFAULT_FOOD, type FoodId } from './food'

export interface GenerateInput {
  /** 재현용 시드 (예: 사진 파일 해시 또는 캡처 uuid) */
  seed: string
  photoUrl: string
  cutoutUrl?: string | null
  context: CaptureContext
  tribeHint?: Tribe
  firstDiscovery?: boolean
  foodId?: FoodId
  name?: string | null
}

export interface GenerateResult {
  card: NewCatCard
  reasons: string[] // 등급 산정 근거 (explainable)
}

/**
 * 캐치 → 카드 생성 파이프라인의 "두뇌" (규칙기반, 결정적).
 * 누끼/이미지 처리와 분리되어 있어 테스트·재현이 쉬움.
 */
export function generateCard(input: GenerateInput): GenerateResult {
  const { seed, context } = input

  const food = getFood(input.foodId ?? DEFAULT_FOOD)
  const stats = computeStats(seed, context)
  const { rarity, reasons } = computeRarity(stats, context, {
    firstDiscovery: input.firstDiscovery,
    foodBonus: food.bonus,
    foodLabel: food.label,
  })
  const tribe = resolveTribe(input.tribeHint)
  const bgTheme = pickBgTheme(context)
  const abilityText = makeAbility(tribe, rarity, context)

  const card: NewCatCard = {
    name: input.name ?? generateName(seed, rarity),
    kind: 'ninyang', // 기본 니냥(랜덤이름). 저장 시 내냥으로 덮어쓸 수 있음.
    animalType: 'cat',
    photoUrl: input.photoUrl,
    cutoutUrl: input.cutoutUrl ?? null,
    rarity,
    tribe,
    stats,
    abilityText,
    bgTheme,
    region: context.region ?? null,
    lat: context.lat ?? null,
    lng: context.lng ?? null,
    capturedAt: context.capturedAt,
    timeOfDay: context.timeOfDay ?? null,
    weather: context.weather ?? null,
    season: context.season ?? null,
  }

  return { card, reasons }
}
