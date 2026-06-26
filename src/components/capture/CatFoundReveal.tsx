import type { ReactNode } from 'react'
import type { Rarity } from '@/types'
import { RARITY_ORDER, RARITY_LABEL } from '@/types'
import type { Reward } from '@/lib/cards/reward'

const RARITY_COLOR: Record<Rarity, string> = {
  common: '#9ca3af',
  uncommon: '#10b981',
  rare: '#3b82f6',
  epic: '#8b5cf6',
  legendary: '#f59e0b',
}

const AURA: Record<Rarity, string> = {
  common: 'transparent',
  uncommon: 'rgba(52,211,153,.35)',
  rare: 'rgba(96,165,250,.45)',
  epic: 'rgba(167,139,250,.5)',
  legendary: 'rgba(245,158,11,.6)',
}

const CONFETTI_COLORS = ['#f59e0b', '#f472b6', '#60a5fa', '#34d399', '#a78bfa', '#ffffff']
const PIECES = Array.from({ length: 24 }, (_, i) => ({
  left: (i * 37 + 7) % 100,
  delay: (i % 10) * 0.12,
  dur: 1.5 + (i % 5) * 0.25,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: 6 + (i % 3) * 3,
  round: i % 2 === 0,
}))

function confettiCount(r: Rarity): number {
  return r === 'legendary' ? 24 : r === 'epic' ? 16 : r === 'rare' ? 10 : 0
}

interface CatFoundRevealProps {
  rarity: Rarity
  name: string
  reward: Reward
  children: ReactNode
}

export function CatFoundReveal({ rarity, name, reward, children }: CatFoundRevealProps) {
  const rank = RARITY_ORDER.indexOf(rarity) + 1
  const count = confettiCount(rarity)

  return (
    <div className="relative flex w-full flex-col items-center gap-2">
      {count > 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[470px] overflow-hidden">
          {PIECES.slice(0, count).map((p, i) => (
            <span
              key={i}
              className="animate-nyang-confetti absolute -top-2"
              style={{
                left: `${p.left}%`,
                width: p.size,
                height: p.size,
                background: p.color,
                borderRadius: p.round ? '50%' : '2px',
                animationDuration: `${p.dur}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="animate-nyang-banner text-center">
        <p className="text-base font-black tracking-widest" style={{ color: RARITY_COLOR[rarity] }}>
          ★ 냥이 발견! ★
        </p>
        <p className="text-[13px] text-amber-500">
          {'★'.repeat(rank)}
          <span className="text-stone-300">{'★'.repeat(5 - rank)}</span>
        </p>
      </div>

      <p className="text-sm font-semibold text-stone-700">
        {name} <span className="text-xs font-normal text-stone-400">· {RARITY_LABEL[rarity]}</span>
      </p>

      <div className="relative animate-nyang-reveal">
        <div
          className="animate-nyang-aura absolute -inset-6 rounded-full blur-2xl"
          style={{ background: AURA[rarity] }}
        />
        {children}
      </div>

      <div className="mt-1 flex gap-2">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          XP +{reward.xp}
        </span>
        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
          🪙 +{reward.coins}
        </span>
      </div>
    </div>
  )
}
