import { useRef, useState, type ChangeEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { cutout } from '@/lib/capture/cutout'
import { trimAndAssess, type CutoutQuality } from '@/lib/capture/trim'
import { buildContext } from '@/lib/capture/context'
import { generateCard, type GenerateResult } from '@/lib/cards/generate'
import { saveCatchedCard } from '@/lib/cards/card.service'
import { CatCard } from '@/components/card/CatCard'

type Status = 'idle' | 'processing' | 'done' | 'error'
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function Capture() {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)

  const [status, setStatus] = useState<Status>('idle')
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null)
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [quality, setQuality] = useState<CutoutQuality | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [savedDexNo, setSavedDexNo] = useState<number | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  function pickFile() {
    inputRef.current?.click()
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus('processing')
    setError(null)
    setResult(null)
    setQuality(null)
    setCutoutUrl(null)
    setSaveStatus('idle')
    setSavedDexNo(null)
    setSaveError(null)
    try {
      const photoUrl = URL.createObjectURL(file)
      const removed = await cutout(file)
      const { blob: trimmed, quality: q } = await trimAndAssess(removed)
      setPhotoFile(file)
      setCutoutBlob(trimmed)
      setQuality(q)
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
    // 같은 파일 다시 선택 가능하도록 초기화
    e.target.value = ''
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
      queryClient.invalidateQueries({ queryKey: ['my-cards'] })
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '알 수 없는 오류')
      setSaveStatus('error')
    }
  }

  const lowQuality = quality !== null && !quality.ok

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center gap-5 px-5 py-8">
      <h1 className="text-xl font-semibold text-stone-800">니냥내냥 · 캐치 PoC</h1>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      <button
        onClick={pickFile}
        className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-medium text-white active:scale-95"
      >
        <span className="material-symbols-outlined mr-1 align-[-5px] text-[18px]">photo_camera</span>
        고양이 사진 고르기
      </button>

      {status === 'processing' && (
        <p className="text-sm text-stone-500">누끼 따고 카드 만드는 중… 🐱</p>
      )}
      {status === 'error' && <p className="text-sm text-red-500">에러: {error}</p>}

      {status === 'done' && result && cutoutUrl && (
        <>
          <CatCard card={result.card} cutoutUrl={cutoutUrl} />

          {lowQuality && saveStatus !== 'saved' && (
            <div className="w-full rounded-xl border border-amber-300 bg-amber-50 p-3">
              <p className="text-sm font-medium text-amber-800">
                <span className="material-symbols-outlined mr-1 align-[-5px] text-[18px]">
                  warning
                </span>
                누끼가 깔끔하지 않아요
              </p>
              <p className="mt-1 text-xs text-amber-700">
                {quality?.message} 대비되는 배경에서 전신을 크게 다시 찍으면 좋아요.
              </p>
              <button
                onClick={pickFile}
                className="mt-2 rounded-full bg-amber-600 px-4 py-2 text-xs font-medium text-white active:scale-95"
              >
                <span className="material-symbols-outlined mr-1 align-[-4px] text-[16px]">
                  refresh
                </span>
                다시 찍기
              </button>
            </div>
          )}

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
              {saveStatus === 'saving'
                ? '저장 중…'
                : lowQuality
                  ? '그래도 이대로 넣기'
                  : '📖 도감에 넣기'}
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
