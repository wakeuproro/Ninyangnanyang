import type { NewCatCard } from '@/types'
import type { BgTheme } from '@/lib/backgrounds/theme'
import { popartStyle } from '@/lib/backgrounds/popart'
import { RarityBadge } from './RarityBadge'
import { cutoutFeather } from './cutoutFeather'

interface CatCardProps {
  card: NewCatCard
  cutoutUrl: string
}

/** 카드 앞면 — 풀블리드 배경 + 누끼 고양이 + 희귀뱃지 + 이름 (정보는 뒷면) */
export function CatCard({ card, cutoutUrl }: CatCardProps) {
  const theme = (card.bgTheme ?? 'alley') as BgTheme
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border-2 border-stone-900 shadow-lg">
      <div className="absolute inset-0" style={popartStyle(theme)} />
      <img
        src={cutoutUrl}
        alt={card.name ?? '고양이 카드'}
        className="absolute left-1/2 top-[46%] max-h-[82%] max-w-[94%] -translate-x-1/2 -translate-y-1/2 object-contain"
        style={cutoutFeather}
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
