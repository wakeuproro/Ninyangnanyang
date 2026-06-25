import type { CaptureContext } from '@/types'

// 팝아트 배경 템플릿 키. 캐치 맥락(시간대·날씨)에 맞춰 자동 배정.
// 실제 SVG/CSS 템플릿은 추후 components/backgrounds 에서 키별로 렌더.
export type BgTheme = 'sunset' | 'night' | 'dawn' | 'rain' | 'snow' | 'alley' | 'day'

export function pickBgTheme(ctx: CaptureContext): BgTheme {
  if (ctx.weather === 'snow') return 'snow'
  if (ctx.weather === 'rain') return 'rain'
  if (ctx.timeOfDay === 'sunset') return 'sunset'
  if (ctx.timeOfDay === 'night') return 'night'
  if (ctx.timeOfDay === 'dawn') return 'dawn'
  if (ctx.timeOfDay === 'day') return 'day'
  return 'alley'
}
