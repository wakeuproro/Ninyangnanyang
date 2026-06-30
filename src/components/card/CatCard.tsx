import type { NewCatCard, Rarity } from '@/types'
import { RARITY_ORDER } from '@/types'
import { bgUrl } from '@/lib/backgrounds/theme'
import { TRIBE_LABEL, TRIBE_COLOR, type Tribe } from '@/lib/cards/tribe'
import { formatSerial } from '@/lib/cards/serial'

interface CatCardProps {
  card: NewCatCard & { dexNo?: number; createdAt?: string }
  cutoutUrl: string
}

// 등급별 프레임(테두리 그라데이션)
const FRAME: Record<Rarity, string> = {
  common: 'linear-gradient(145deg,#eaeaea,#b6b6b6,#ffffff,#c9c9c9)',
  uncommon: 'linear-gradient(145deg,#c6f3d0,#34c46f,#eafff0,#2fa55f)',
  rare: 'linear-gradient(145deg,#c3ddff,#3b82f6,#eaf3ff,#2f6fe0)',
  epic: 'linear-gradient(145deg,#e6d6ff,#8b5cf6,#f5efff,#7a45e8)',
  legendary: 'linear-gradient(145deg,#fff2bd,#f5c542,#fffdf0,#e0a417,#f5c542)',
}

// 등급 리본 (좌상단)
const RIBBON: Record<Rarity, { bg: string; text: string }> = {
  common: { bg: '#6b7280', text: '#ffffff' },
  uncommon: { bg: '#10b981', text: '#ffffff' },
  rare: { bg: '#3b82f6', text: '#ffffff' },
  epic: { bg: '#8b5cf6', text: '#ffffff' },
  legendary: { bg: '#171717', text: '#ffd24a' },
}

// 홀로 강도
const HOLO_OP: Record<Rarity, number> = {
  common: 0.06,
  uncommon: 0.12,
  rare: 0.2,
  epic: 0.32,
  legendary: 0.5,
}

const HOLO_BG =
  'repeating-linear-gradient(115deg, rgba(255,45,140,1) 0%, rgba(255,214,77,1) 12%, rgba(55,255,176,1) 24%, rgba(58,168,255,1) 36%, rgba(185,77,255,1) 48%, rgba(255,45,140,1) 60%)'

const NAME_HOLO =
  'linear-gradient(100deg,#ffffff,#ffe9a8,#ffffff,#d6ecff,#ffffff)'

/** 카드 앞면 — 프레임 + 배경 + 홀로 + 누끼 + 등급리본/별점/부족/이름(홀로)/일련번호 */
export function CatCard({ card, cutoutUrl }: CatCardProps) {
  const rarity = card.rarity
  const rank = RARITY_ORDER.indexOf(rarity) + 1
  const tribe = (card.tribe ?? 'unknown') as Tribe
  const ribbon = RIBBON[rarity]
  const dateIso = card.createdAt ?? card.capturedAt

  return (
    <div
      className="h-full w-full rounded-[22px] p-[5px]"
      style={{ background: FRAME[rarity], boxShadow: '0 8px 20px rgba(0,0,0,0.28)' }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[17px] border border-black/40">
        {/* 배경 */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgUrl(card.bgTheme)})` }}
        />
        {/* 홀로 시트 */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: HOLO_BG, mixBlendMode: 'screen', opacity: HOLO_OP[rarity] }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(125deg, transparent 42%, rgba(255,255,255,0.16) 49%, transparent 57%)' }}
        />

        {/* 접지 그림자 + 고양이 */}
        <div className="absolute bottom-[19%] left-1/2 h-3 w-1/2 -translate-x-1/2 rounded-[50%] bg-black/35 blur-md" />
        <img
          src={cutoutUrl}
          alt={card.name ?? '고양이'}
          className="absolute left-1/2 top-[46%] max-h-[74%] max-w-[90%] -translate-x-1/2 -translate-y-1/2 object-contain"
          style={{ filter: 'drop-shadow(0 10px 9px rgba(0,0,0,0.45))' }}
        />

        {/* 등급 리본 + 별점 */}
        <div
          className="absolute left-0 top-3 rounded-r-lg px-3 py-1 text-[11px] font-black tracking-wider"
          style={{ background: ribbon.bg, color: ribbon.text, boxShadow: '2px 2px 4px rgba(0,0,0,0.35)' }}
        >
          {rarity.toUpperCase()}
        </div>
        <div
          className="absolute left-2.5 top-[36px] text-[11px]"
          style={{ color: '#ffcf3a', textShadow: '0 1px 2px rgba(0,0,0,0.55)' }}
        >
          {'★'.repeat(rank)}
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>{'★'.repeat(5 - rank)}</span>
        </div>

        {/* 부족 칩 (우상단) */}
        {tribe !== 'unknown' && (
          <span
            className="absolute right-2.5 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
            style={{ background: 'rgba(0,0,0,0.45)', boxShadow: `inset 0 0 0 1.5px ${TRIBE_COLOR[tribe]}` }}
          >
            {TRIBE_LABEL[tribe]}
          </span>
        )}

        {/* 하단 패널: 이름(홀로) + 타입 + 일련번호 */}
        <div
          className="absolute inset-x-0 bottom-0 px-3 pb-2.5 pt-12"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.74), rgba(0,0,0,0.25) 55%, transparent)' }}
        >
          <p
            className="text-3xl leading-none"
            style={{
              backgroundImage: NAME_HOLO,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextStroke: '0.6px rgba(50,30,0,0.4)',
              filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.45))',
            }}
          >
            {card.name ?? '이름 없는 냥'}
          </p>
          <div className="mt-1.5 flex items-end justify-between">
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white/90">
              {tribe !== 'unknown' ? TRIBE_LABEL[tribe] : 'CAT'}
            </span>
            <span className="font-mono text-[9px] text-white/70">
              {formatSerial(rarity, dateIso, card.dexNo)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
