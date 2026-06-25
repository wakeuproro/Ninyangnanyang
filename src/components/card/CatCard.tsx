import type { NewCatCard } from '@/types'
import type { BgTheme } from '@/lib/backgrounds/theme'
import { popartStyle } from '@/lib/backgrounds/popart'
import { RarityBadge } from './RarityBadge'

interface CatCardProps {
  card: NewCatCard
  cutoutUrl: string
}

/** 카드 앞면 — 풀블리드 배경 + 누끼 고양이 + 희귀뱃지 + 이름 (정보는 뒷면) */
export function CatCard({ card, cutoutUrl }: CatCardProps) {
  const theme = (card.bgTheme ?? 'alley') as BgTheme
  return (
    <div
      className="relative w-[240px] overflow-hidden rounded-2xl border-2 border-stone-900 shadow-lg"
      style={{ aspectRatio: '3 / 4' }}
    >
      <div className="absolute inset-0" style={popartStyle(theme)} />
      <img
        src={cutoutUrl}
        alt={card.name ?? '고양이 카드'}
        className="absolute bottom-2 left-1/2 max-h-[78%] max-w-[92%] -translate-x-1/2 object-contain drop-shadow-lg"
      />
      <span className="absolute left-2.5 top-2.5">
        <RarityBadge rarity={card.rarity} />
      </span>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 pb-2.5 pt-8">
        <p className="text-base font-semibold text-white">{card.name ?? '이름 없는 냥'}</p>
      </div>
    </div>
  )
}
