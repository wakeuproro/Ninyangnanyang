// DB(0001_init.sql)와 1:1 일치하는 앱 타입. 서비스 레이어에서 snake_case ↔ camelCase 매핑.

export type AnimalType = 'cat' | 'dog' | 'other'
/** 니냥(길에서 발견, 랜덤이름) / 내냥(내 반려묘, 직접 작명) */
export type CatKind = 'ninyang' | 'naenyang'
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type TimeOfDay = 'dawn' | 'day' | 'sunset' | 'night'
export type Weather = 'clear' | 'cloudy' | 'rain' | 'snow' | 'fog'

/** 스탯 (각 1~10, 규칙엔진 산출) */
export interface Stats {
  cuteness: number
  chonky: number
  friendliness: number
  charisma: number
}

/** 캐치 맥락 — 배경/등급 산정의 입력 */
export interface CaptureContext {
  region?: string | null
  lat?: number | null
  lng?: number | null
  capturedAt: string // ISO 8601
  timeOfDay?: TimeOfDay | null
  weather?: Weather | null
  season?: string | null
}

/** DB INSERT 직전의 카드 (서버 관리 필드 제외) */
export interface NewCatCard {
  name: string | null
  kind: CatKind
  animalType: AnimalType
  photoUrl: string
  cutoutUrl: string | null
  rarity: Rarity
  tribe: string | null
  stats: Stats
  abilityText: string | null
  bgTheme: string | null
  region: string | null
  lat: number | null
  lng: number | null
  capturedAt: string
  timeOfDay: TimeOfDay | null
  weather: Weather | null
  season: string | null
}

/** 영속화된 카드 (조회 결과) */
export interface CatCard extends NewCatCard {
  id: string
  ownerId: string
  dexNo: number
  intimacy: number
  isFavorite: boolean
  createdAt: string
}

export const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']

export const RARITY_LABEL: Record<Rarity, string> = {
  common: '커먼',
  uncommon: '언커먼',
  rare: '레어',
  epic: '에픽',
  legendary: '레전드',
}
