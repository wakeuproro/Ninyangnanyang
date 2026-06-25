import { useState, type ChangeEvent } from 'react'
import { cutout } from '@/lib/capture/cutout'
import { buildContext } from '@/lib/capture/context'
import { generateCard, type GenerateResult } from '@/lib/cards/generate'
import { CatCard } from '@/components/card/CatCard'

type Status = 'idle' | 'processing' | 'done' | 'error'

export function Capture() {
  const [status, setStatus] = useState<Status>('idle')
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null)
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus('processing')
    setError(null)
    setResult(null)
    setCutoutUrl(null)
    try {
      const photoUrl = URL.createObjectURL(file)
      const blob = await cutout(file)
      const cut = URL.createObjectURL(blob)
      setCutoutUrl(cut)

      const context = buildContext()
      const seed = `${file.name}-${file.size}-${file.lastModified}`
      const res = generateCard({
        seed,
        photoUrl,
        cutoutUrl: cut,
        context,
        firstDiscovery: true,
      })
      setResult(res)
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류')
      setStatus('error')
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center gap-5 px-5 py-8">
      <h1 className="text-xl font-semibold text-stone-800">니냥내냥 · 캐치 PoC</h1>

      <label className="cursor-pointer rounded-full bg-amber-500 px-5 py-2.5 text-sm font-medium text-white active:scale-95">
        <span className="material-symbols-outlined mr-1 align-[-5px] text-[18px]">photo_camera</span>
        고양이 사진 고르기
        <input type="file" accept="image/*" className="hidden" onChange={onFile} />
      </label>

      {status === 'processing' && (
        <p className="text-sm text-stone-500">누끼 따고 카드 만드는 중… 🐱</p>
      )}
      {status === 'error' && <p className="text-sm text-red-500">에러: {error}</p>}

      {status === 'done' && result && cutoutUrl && (
        <>
          <CatCard card={result.card} cutoutUrl={cutoutUrl} />
          <div className="w-full rounded-xl bg-stone-50 p-3 text-xs text-stone-600">
            <p className="mb-1 font-medium text-stone-700">등급 근거</p>
            <ul className="list-disc pl-4">
              {result.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
            <p className="mt-2">
              스탯 · 예쁨 {result.card.stats.cuteness} / 통통 {result.card.stats.chonky} / 친화{' '}
              {result.card.stats.friendliness} / 카리스마 {result.card.stats.charisma}
            </p>
            {result.card.abilityText && <p className="mt-1">능력 · {result.card.abilityText}</p>}
          </div>
        </>
      )}
    </div>
  )
}
