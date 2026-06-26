import type { CatCard } from '@/types'
import type { BgTheme } from '@/lib/backgrounds/theme'
import { popartStyle } from '@/lib/backgrounds/popart'
import { cutoutFeather } from '@/components/card/cutoutFeather'
import { RarityBadge } from '@/components/card/RarityBadge'

export function DexCell({ card, onClick }: { card: CatCard; onClick?: () => void }) {
  const theme = (card.bgTheme ?? 'alley') as BgTheme
  return (
    <button
      onClick={onClick}
      className="relative block overflow-hidden rounded-xl border border-stone-800 text-left active:scale-95"
      style={{ aspectRatio: '3 / 4' }}
    >
      <div className="absolute inset-0" style={popartStyle(theme)} />
      {card.cutoutUrl && (
        <img
          src={card.cutoutUrl}
          alt={card.name ?? ''}
          className="absolute left-1/2 top-[45%] max-h-[80%] max-w-[92%] -translate-x-1/2 -translate-y-1/2 object-contain"
          style={cutoutFeather}
        />
      )}
      <span className="absolute left-1 top-1 origin-top-left scale-90">
        <RarityBadge rarity={card.rarity} />
      </span>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1 pt-5">
        <p className="truncate text-[11px] font-medium text-white">{card.name ?? '이름없음'}</p>
        <p className="font-mono text-[9px] text-white/70">
          #{String(card.dexNo).padStart(6, '0')}
        </p>
      </div>
    </button>
  )
}
