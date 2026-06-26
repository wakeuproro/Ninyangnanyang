import { useRef, useState, type ChangeEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { cutout } from '@/lib/capture/cutout'
import { trimAndAssess, type CutoutQuality } from '@/lib/capture/trim'
import { buildContext } from '@/lib/capture/context'
import { generateCard, type GenerateResult } from '@/lib/cards/generate'
import { saveCatchedCard } from '@/lib/cards/card.service'
import { FOODS, DEFAULT_FOOD, type FoodId } from '@/lib/cards/food'
import { CatCard } from '@/components/card/CatCard'
import { CardBack } from '@/components/card/CardBack'
import { FlipCard } from '@/components/card/FlipCard'
import type { CatKind } from '@/types'

type Status = 'idle' | 'processing' | 'done' | 'error'
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function Capture() {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)

  const [foodId, setFoodId] = useState<FoodId>(DEFAULT_FOOD)
  const [status, setStatus] = useState<Status>('idle')
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null)
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [quality, setQuality] = useState<CutoutQuality | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null)

  // 니냥/내냥 분류
  const [kind, setKind] = useState<CatKind | null>(null)
  const [nameInput, setNameInput] = useState('')

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
    setKind(null)
    setNameInput('')
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
      const res = generateCard({
        seed,
        photoUrl,
        cutoutUrl: cut,
        context,
        firstDiscovery: true,
        foodId,
      })
      setResult(res)
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류')
      setStatus('error')
    }
    e.target.value = ''
  }

  async function save(chosenKind: CatKind, name: string) {
    if (!result || !photoFile || !cutoutBlob) return
    setSaveStatus('saving')
    setSaveError(null)
    try {
      const card = { ...result.card, kind: chosenKind, name }
      const saved = await saveCatchedCard({ card, photoBlob: photoFile, cutoutBlob })
      setSavedDexNo(saved.dexNo)
      setSaveStatus('saved')
      queryClient.invalidateQueries({ queryKey: ['my-cards'] })
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '알 수 없는 오류')
      setSaveStatus('error')
    }
  }

  const lowQuality = quality !== null && !quality.ok
  const randomName = result?.card.name ?? '냥이'

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center gap-5 px-5 py-8">
      <h1 className="text-xl font-semibold text-stone-800">니냥내냥 · 캐치 PoC</h1>

      <div className="w-full">
        <p className="mb-1.5 text-center text-xs text-stone-500">먹이 선택 — 비쌀수록 예쁜 카드 확률↑</p>
        <div className="flex w-full gap-1">
          {FOODS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFoodId(f.id)}
              className={`flex flex-1 flex-col items-center rounded-xl border px-1 py-2 active:scale-95 ${
                foodId === f.id
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-stone-200 text-stone-500'
              }`}
            >
              <span className="text-lg">{f.emoji}</span>
              <span className="mt-0.5 text-[10px] font-medium leading-tight">{f.label}</span>
              <span className="text-[9px] text-stone-400">{f.bonus > 0 ? `+${f.bonus}` : '기본'}</span>
            </button>
          ))}
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      <button
        onClick={pickFile}
        className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-medium text-white active:scale-95"
      >
        <span className="material-symbols-outlined mr-1 align-[-5px] text-[18px]">photo_camera</span>
        고양이 사진 고르기
      </button>

      {status === 'processing' && <p className="text-sm text-stone-500">누끼 따고 카드 만드는 중… 🐱</p>}
      {status === 'error' && <p className="text-sm text-red-500">에러: {error}</p>}

      {status === 'done' && result && cutoutUrl && (
        <>
          <FlipCard
            front={<CatCard card={result.card} cutoutUrl={cutoutUrl} />}
            back={<CardBack card={result.card} />}
          />
          <p className="-mt-2 text-[11px] text-stone-400">카드를 탭하면 뒤집혀요 🔄</p>

          {lowQuality && saveStatus !== 'saved' && (
            <div className="w-full rounded-xl border border-amber-300 bg-amber-50 p-3">
              <p className="text-sm font-medium text-amber-800">
                <span className="material-symbols-outlined mr-1 align-[-5px] text-[18px]">warning</span>
                누끼가 깔끔하지 않아요
              </p>
              <p className="mt-1 text-xs text-amber-700">
                {quality?.message} 대비되는 배경에서 전신을 크게 다시 찍으면 좋아요.
              </p>
              <button
                onClick={pickFile}
                className="mt-2 rounded-full bg-amber-600 px-4 py-2 text-xs font-medium text-white active:scale-95"
              >
                <span className="material-symbols-outlined mr-1 align-[-4px] text-[16px]">refresh</span>
                다시 찍기
              </button>
            </div>
          )}

          {/* 분류: 니냥 / 내냥 */}
          {saveStatus === 'saved' && savedDexNo !== null ? (
            <p className="text-sm font-medium text-emerald-600">
              #{String(savedDexNo).padStart(6, '0')} {kind === 'naenyang' ? '내냥' : '니냥'} 도감에
              저장됐어요! 📖
            </p>
          ) : kind === null ? (
            <div className="w-full">
              <p className="mb-2 text-center text-sm text-stone-600">이 냥이는?</p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => save('ninyang', randomName)}
                  disabled={saveStatus === 'saving'}
                  className="flex flex-1 flex-col items-center gap-1 rounded-2xl border-2 border-amber-400 bg-amber-50 py-4 active:scale-95 disabled:opacity-50"
                >
                  <span className="text-2xl">🐱</span>
                  <span className="text-base font-semibold text-amber-700">니냥</span>
                  <span className="text-[11px] text-amber-600">길에서 만난 냥 · 랜덤 이름</span>
                </button>
                <button
                  onClick={() => {
                    setKind('naenyang')
                    setNameInput('')
                  }}
                  disabled={saveStatus === 'saving'}
                  className="flex flex-1 flex-col items-center gap-1 rounded-2xl border-2 border-pink-400 bg-pink-50 py-4 active:scale-95 disabled:opacity-50"
                >
                  <span className="text-2xl">🏠</span>
                  <span className="text-base font-semibold text-pink-700">내냥</span>
                  <span className="text-[11px] text-pink-600">내 반려묘 · 이름 직접</span>
                </button>
              </div>
            </div>
          ) : (
            // 내냥: 이름 입력
            <div className="w-full rounded-2xl border-2 border-pink-300 bg-pink-50 p-4">
              <p className="mb-2 text-sm font-medium text-pink-700">🏠 우리 냥이 이름은?</p>
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder={`예: ${randomName}`}
                maxLength={20}
                className="w-full rounded-xl border border-pink-300 bg-white px-3 py-2 text-sm outline-none focus:border-pink-500"
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setKind(null)}
                  className="rounded-full border border-stone-300 px-4 py-2 text-xs text-stone-500 active:scale-95"
                >
                  뒤로
                </button>
                <button
                  onClick={() => save('naenyang', nameInput.trim() || randomName)}
                  disabled={saveStatus === 'saving'}
                  className="flex-1 rounded-full bg-pink-500 px-4 py-2 text-sm font-medium text-white active:scale-95 disabled:opacity-50"
                >
                  {saveStatus === 'saving' ? '저장 중…' : '이 이름으로 내냥 도감에 넣기'}
                </button>
              </div>
            </div>
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
