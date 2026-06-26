import type { NewCatCard, Stats, TimeOfDay, Weather } from '@/types'
import { RARITY_ORDER } from '@/types'
import { TRIBE_LABEL, type Tribe } from '@/lib/cards/tribe'
import { formatSerial } from '@/lib/cards/serial'

const TIME_LABEL: Record<TimeOfDay, string> = {
  dawn: '새벽',
  day: '낮',
  sunset: '노을',
  night: '밤',
}
const WEATHER_LABEL: Record<Weather, string> = {
  clear: '맑음',
  cloudy: '흐림',
  rain: '비',
  snow: '눈',
  fog: '안개',
}

const STAT_ROWS: { key: keyof Stats; label: string; color: string }[] = [
  { key: 'cuteness', label: '예쁨', color: '#f472b6' },
  { key: 'chonky', label: '통통', color: '#fbbf24' },
  { key: 'friendliness', label: '친화', color: '#a3e635' },
  { key: 'charisma', label: '카리스마', color: '#a78bfa' },
]

interface CardBackProps {
  card: NewCatCard & { dexNo?: number; createdAt?: string }
}

export function CardBack({ card }: CardBackProps) {
  const rank = RARITY_ORDER.indexOf(card.rarity) + 1
  const tribeLabel = card.tribe ? (TRIBE_LABEL[card.tribe as Tribe] ?? card.tribe) : '알 수 없음'
  const dateIso = card.createdAt ?? card.capturedAt
  const date = dateIso.slice(0, 10)

  return (
    <div className="flex h-full w-full flex-col gap-2 overflow-hidden rounded-2xl border-2 border-amber-700/60 bg-[#17131f] p-3 text-white">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-amber-200">CAT PROFILE</span>
        <span className="text-[11px] text-amber-400">
          {'★'.repeat(rank)}
          <span className="text-white/20">{'★'.repeat(5 - rank)}</span>
        </span>
      </div>

      <div className="flex items-center gap-1 text-[11px]">
        <span className="rounded bg-white/10 px-1.5 py-0.5">
          {card.kind === 'naenyang' ? '🏠 내냥' : '🐱 니냥'}
        </span>
        <span className="rounded bg-amber-400/15 px-1.5 py-0.5 text-amber-200">{tribeLabel}</span>
      </div>

      {card.abilityText && (
        <div className="rounded-lg bg-white/5 p-2">
          <p className="text-[10px] text-amber-200/80">ABILITY</p>
          <p className="mt-0.5 text-[11px] leading-snug text-white/90">{card.abilityText}</p>
        </div>
      )}

      <div className="rounded-lg bg-white/5 p-2">
        <p className="mb-1 text-[10px] text-amber-200/80">STATUS</p>
        <div className="flex flex-col gap-1">
          {STAT_ROWS.map((r) => {
            const v = card.stats[r.key] * 10
            return (
              <div key={r.key} className="flex items-center gap-1.5">
                <span className="w-12 text-[10px] text-white/70">{r.label}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${v}%`, background: r.color }}
                  />
                </span>
                <span className="w-6 text-right text-[10px] font-medium">{v}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-lg bg-white/5 p-2 text-[10px] leading-relaxed text-white/70">
        <p className="mb-0.5 text-amber-200/80">CAPTURED</p>
        <p>
          📍 {card.region ?? '미상'} · {card.timeOfDay ? TIME_LABEL[card.timeOfDay] : '-'} ·{' '}
          {card.weather ? WEATHER_LABEL[card.weather] : '-'}
        </p>
        <p>📅 {date}</p>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <span className="font-mono text-[10px] text-amber-200/70">
          {formatSerial(card.rarity, dateIso, card.dexNo)}
        </span>
        <span className="text-[10px] text-white/40">탭 → 앞면</span>
      </div>
    </div>
  )
}
