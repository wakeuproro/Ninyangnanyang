import type { CaptureContext, Rarity } from '@/types'
import { hashSeed } from '@/lib/cards/seed'

// 디자인된 배경 18종 (public/bg/{key}.webp). 캐치 맥락 + 희귀도로 배정.
export type BgTheme =
  | 'day'
  | 'sunset'
  | 'night'
  | 'dawn'
  | 'rain'
  | 'snow'
  | 'fog'
  | 'spring'
  | 'summer'
  | 'autumn'
  | 'neon'
  | 'market'
  | 'park'
  | 'rooftop'
  | 'legend_aurora'
  | 'legend_petal'
  | 'legend_starsea'
  | 'legend_torii'

const ALL: BgTheme[] = [
  'day', 'sunset', 'night', 'dawn', 'rain', 'snow', 'fog',
  'spring', 'summer', 'autumn', 'neon', 'market', 'park', 'rooftop',
  'legend_aurora', 'legend_petal', 'legend_starsea', 'legend_torii',
]
const KNOWN = new Set<string>(ALL)

const LEGENDS: BgTheme[] = ['legend_aurora', 'legend_petal', 'legend_starsea', 'legend_torii']
const NIGHT_POOL: BgTheme[] = ['night', 'neon']
const DAY_POOL: BgTheme[] = ['day', 'park', 'rooftop', 'market']

function pick<T>(pool: T[], seed: string): T {
  return pool[hashSeed(seed) % pool.length]
}

function seasonal(month: number): BgTheme {
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'day' // 겨울은 day (눈은 날씨로 따로)
}

/** 배경 배정 — 결정적(seed). 레전드는 전용 씬, 날씨/시간대 우선, 낮엔 장소·계절로 다양성. */
export function pickBgTheme(ctx: CaptureContext, rarity: Rarity, seed: string): BgTheme {
  if (rarity === 'legendary') return pick(LEGENDS, `${seed}|bg`)
  if (ctx.weather === 'snow') return 'snow'
  if (ctx.weather === 'rain') return 'rain'
  if (ctx.weather === 'fog') return 'fog'
  if (ctx.timeOfDay === 'sunset') return 'sunset'
  if (ctx.timeOfDay === 'dawn') return 'dawn'
  if (ctx.timeOfDay === 'night') return pick(NIGHT_POOL, `${seed}|bg`)
  const month = new Date(ctx.capturedAt).getMonth() + 1
  return pick([...DAY_POOL, seasonal(month)], `${seed}|bg`)
}

export function bgUrl(theme: string | null | undefined): string {
  const key = theme && KNOWN.has(theme) ? theme : 'day'
  return `/bg/${key}.webp`
}

const THEME_LABEL: Record<string, string> = {
  day: 'Daylight',
  sunset: 'Sunset',
  night: 'Night',
  dawn: 'Dawn',
  rain: 'Rainy',
  snow: 'Snowy',
  fog: 'Foggy',
  spring: 'Spring',
  summer: 'Summer',
  autumn: 'Autumn',
  neon: 'Neon City',
  market: 'Market',
  park: 'Park',
  rooftop: 'Rooftop',
  legend_aurora: 'Aurora',
  legend_petal: 'Petals',
  legend_starsea: 'Star Sea',
  legend_torii: 'Torii',
}

export function themeLabel(theme: string | null | undefined): string {
  return (theme && THEME_LABEL[theme]) || 'Daylight'
}
