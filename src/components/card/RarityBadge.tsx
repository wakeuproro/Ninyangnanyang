import type { Rarity } from '@/types'

const COLOR: Record<Rarity, string> = {
  common: '#9ca3af',
  uncommon: '#34d399',
  rare: '#60a5fa',
  epic: '#a78bfa',
  legendary: '#f59e0b',
}

export function RarityBadge({ rarity }: { rarity: Rarity }) {
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-white"
      style={{ backgroundColor: COLOR[rarity] }}
    >
      {rarity.toUpperCase()}
    </span>
  )
}
