import { useState, type CSSProperties } from 'react'
import { cutoutFeather } from '@/components/card/cutoutFeather'

type Phase = 'ready' | 'throw' | 'burst'

interface CatchAnimationProps {
  cutoutUrl: string
  foodEmoji: string
  onDone: () => void
}

// 펑! 터지는 파티클 방향 (원형 배치)
const PARTICLES = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2
  const dist = 95
  return {
    tx: Math.round(Math.cos(angle) * dist),
    ty: Math.round(Math.sin(angle) * dist),
    emoji: ['⭐', '✨', '💛', '🐾'][i % 4],
  }
})

export function CatchAnimation({ cutoutUrl, foodEmoji, onDone }: CatchAnimationProps) {
  const [phase, setPhase] = useState<Phase>('ready')

  function throwIt() {
    if (phase !== 'ready') return
    setPhase('throw')
    window.setTimeout(() => setPhase('burst'), 650)
    window.setTimeout(() => onDone(), 650 + 650)
  }

  return (
    <div
      className="relative flex w-[250px] flex-col items-center justify-end overflow-hidden rounded-2xl border-2 border-stone-900 bg-gradient-to-b from-stone-700 to-stone-900"
      style={{ aspectRatio: '3 / 4' }}
    >
      {/* 야생 냥 */}
      <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2">
        <img
          src={cutoutUrl}
          alt="wild cat"
          className={`max-h-[150px] max-w-[200px] object-contain ${
            phase === 'burst' ? 'animate-nyang-shake' : 'animate-nyang-float'
          }`}
          style={cutoutFeather}
        />
      </div>

      {/* 던지는 먹이 */}
      {phase === 'throw' && (
        <div className="animate-nyang-throw absolute bottom-0 left-1/2 text-4xl">{foodEmoji}</div>
      )}

      {/* 펑! 버스트 */}
      {phase === 'burst' && (
        <>
          <div className="animate-nyang-flash absolute left-1/2 top-[44%] h-20 w-20 rounded-full bg-white" />
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="animate-nyang-particle absolute left-1/2 top-[44%] text-xl"
              style={{ ['--tx']: `${p.tx}px`, ['--ty']: `${p.ty}px` } as CSSProperties}
            >
              {p.emoji}
            </span>
          ))}
        </>
      )}

      {/* 던지기 버튼 */}
      {phase === 'ready' && (
        <button
          onClick={throwIt}
          className="z-10 mb-5 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg active:scale-95"
        >
          {foodEmoji} 던지기!
        </button>
      )}
    </div>
  )
}
