import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listMyCards } from '@/lib/cards/card.service'
import { DexCell } from '@/components/dex/DexCell'
import type { CatKind } from '@/types'

export function Dex() {
  const [kind, setKind] = useState<CatKind>('ninyang')
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-cards'],
    queryFn: listMyCards,
  })

  const ninyang = data?.filter((c) => c.kind === 'ninyang') ?? []
  const naenyang = data?.filter((c) => c.kind === 'naenyang') ?? []
  const shown = kind === 'ninyang' ? ninyang : naenyang

  return (
    <div className="px-4 py-6">
      <h1 className="mb-4 text-xl font-semibold text-stone-800">내 도감</h1>

      {/* 니냥 / 내냥 분리 탭 */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setKind('ninyang')}
          className={`flex-1 rounded-full py-2 text-sm font-medium active:scale-95 ${
            kind === 'ninyang' ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-500'
          }`}
        >
          🐱 니냥 {ninyang.length}
        </button>
        <button
          onClick={() => setKind('naenyang')}
          className={`flex-1 rounded-full py-2 text-sm font-medium active:scale-95 ${
            kind === 'naenyang' ? 'bg-pink-500 text-white' : 'bg-stone-100 text-stone-500'
          }`}
        >
          🏠 내냥 {naenyang.length}
        </button>
      </div>

      {isLoading && <p className="text-sm text-stone-500">불러오는 중…</p>}
      {error && (
        <p className="text-sm text-red-500">
          불러오기 실패: {error instanceof Error ? error.message : '오류'}
        </p>
      )}

      {data && shown.length === 0 && (
        <p className="mt-10 text-center text-sm text-stone-400">
          {kind === 'ninyang' ? '아직 잡은 길냥이가 없어요.' : '아직 등록한 내 냥이가 없어요.'}
          <br />
          캐치 탭에서 만나보세요 🐱
        </p>
      )}

      {shown.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {shown.map((card) => (
            <DexCell key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  )
}
