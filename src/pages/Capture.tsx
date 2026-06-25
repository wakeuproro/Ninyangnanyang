import { useState, type ChangeEvent } from 'react'
import { cutout } from '@/lib/capture/cutout'
import { trimTransparent } from '@/lib/capture/trim'
import { buildContext } from '@/lib/capture/context'
import { generateCard, type GenerateResult } from '@/lib/cards/generate'
import { saveCatchedCard } from '@/lib/cards/card.service'
import { CatCard } from '@/components/card/CatCard'

type Status = 'idle' | 'processing' | 'done' | 'error'
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function Capture() {
  const [status, setStatus] = useState<Status>('idle')
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null)
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [savedDexNo, setSavedDexNo] = useState<number | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus('processing')
    setError(null)
    setResult(null)
    setCutoutUrl(null)
    setSaveStatus('idle')
    setSavedDexNo(null)
    setSaveError(null)
    try {
      const photoUrl = URL.createObjectURL(file)
      const blob = await cutout(file)
      const trimmed = await trimTransparent(blob)
      setPhotoFile(file)
      setCutoutBlob(trimmed)
      const cut = URL.createObjectURL(trimmed)
      setCutoutUrl(cut)

      const context = buildContext()
      const seed = `${file.name}-${file.size}-${file.lastModified}`
      const res = generateCard({ seed, photoUrl, cutoutUrl: cut, context, firstDiscovery: true })
      setResult(res)
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류')
      setStatus('error')
    }
  }

  async function onSave() {
    if (!result || !photoFile || !cutoutBlob) return
    setSaveStatus('saving')
    setSaveError(null)
    try {
      const saved = await saveCatchedCard({
        card: result.card,
        photoBlob: photoFile,
        cutoutBlob,
      })
      setSavedDexNo(saved.dexNo)
      setSaveStatus('saved')
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '알 수 없는 오류')
      setSaveStatus('error')
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

          {saveStatus === 'saved' && savedDexNo !== null ? (
            <p className="text-sm font-medium text-emerald-600">
              #{String(savedDexNo).padStart(6, '0')} 번으로 도감에 저장됐어요! 📖
            </p>
          ) : (
            <button
              onClick={onSave}
              disabled={saveStatus === 'saving'}
              className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white active:scale-95 disabled:opacity-50"
            >
              {saveStatus === 'saving' ? '저장 중…' : '📖 도감에 넣기'}
            </button>
          )}
          {saveStatus === 'error' && <p className="text-sm text-red-500">저장 실패: {saveError}</p>}

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
