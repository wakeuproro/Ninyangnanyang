import type { CSSProperties } from 'react'
import type { BgTheme } from './theme'

// 코드로 그리는 팝아트 배경 (생성형 0원). 맥락별 색만 바꿔 재활용.
interface Palette {
  base: string
  rayA: string
  rayB: string
  dot: string
}

const PALETTES: Record<BgTheme, Palette> = {
  sunset: { base: '#ff9e57', rayA: '#ff7a59', rayB: '#ffd06b', dot: 'rgba(150,40,20,.18)' },
  night: { base: '#3a3a66', rayA: '#4a4a88', rayB: '#2c2c4e', dot: 'rgba(255,255,255,.14)' },
  dawn: { base: '#ffcf9e', rayA: '#ffb98a', rayB: '#ffe6c2', dot: 'rgba(150,90,40,.15)' },
  rain: { base: '#7fb0d8', rayA: '#6b9fce', rayB: '#a8cce8', dot: 'rgba(20,50,80,.16)' },
  snow: { base: '#e3eef7', rayA: '#cfe0ee', rayB: '#f4f9ff', dot: 'rgba(90,120,150,.14)' },
  alley: { base: '#f0c75a', rayA: '#ffb24d', rayB: '#ffe08a', dot: 'rgba(120,80,20,.16)' },
  day: { base: '#ffce39', rayA: '#ff8a3d', rayB: '#ffe08a', dot: 'rgba(120,40,40,.16)' },
}

export function popartStyle(theme: BgTheme): CSSProperties {
  const p = PALETTES[theme] ?? PALETTES.alley
  return {
    backgroundColor: p.base,
    backgroundImage: [
      'radial-gradient(circle at 50% 60%, rgba(255,255,255,.5), rgba(255,255,255,0) 46%)',
      `radial-gradient(${p.dot} 1.6px, transparent 1.7px)`,
      `repeating-conic-gradient(from 0deg at 50% 40%, ${p.rayA} 0deg 9deg, ${p.rayB} 9deg 18deg)`,
    ].join(', '),
    backgroundSize: '100% 100%, 12px 12px, 100% 100%',
  }
}
