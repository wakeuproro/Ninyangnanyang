import { useQuery } from '@tanstack/react-query'
import { listMyCards } from '@/lib/cards/card.service'
import { DexCell } from '@/components/dex/DexCell'

export function Dex() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-cards'],
    queryFn: listMyCards,
  })

  return (
    <div className="px-4 py-6">
      <h1 className="mb-4 text-xl font-semibold text-stone-800">내 도감</h1>

      {isLoading && <p className="text-sm text-stone-500">불러오는 중…</p>}
      {error && (
        <p className="text-sm text-red-500">
          불러오기 실패: {error instanceof Error ? error.message : '오류'}
        </p>
      )}

      {data && data.length === 0 && (
        <p className="mt-10 text-center text-sm text-stone-400">
          아직 잡은 냥이 없어요.
          <br />
          캐치 탭에서 첫 냥이를 잡아보세요 🐱
        </p>
      )}

      {data && data.length > 0 && (
        <>
          <p className="mb-3 text-xs text-stone-500">총 {data.length}마리</p>
          <div className="grid grid-cols-2 gap-3">
            {data.map((card) => (
              <DexCell key={card.id} card={card} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
