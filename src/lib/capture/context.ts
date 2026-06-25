import type { CaptureContext, TimeOfDay } from '@/types'

/** 현재 시각 → 시간대 (영업일/날씨 보정은 추후) */
export function getTimeOfDay(d: Date): TimeOfDay {
  const h = d.getHours()
  if (h >= 5 && h < 8) return 'dawn'
  if (h >= 8 && h < 17) return 'day'
  if (h >= 17 && h < 19) return 'sunset'
  return 'night'
}

/** 캐치 시점의 맥락 조립. 날씨/지역은 추후 API 연동. */
export function buildContext(now: Date = new Date()): CaptureContext {
  return {
    capturedAt: now.toISOString(),
    timeOfDay: getTimeOfDay(now),
    weather: null,
    region: null,
    lat: null,
    lng: null,
    season: null,
  }
}
