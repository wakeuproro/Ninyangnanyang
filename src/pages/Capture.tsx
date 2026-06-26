import { useRef, useState, useEffect, useCallback, type ChangeEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useProfile } from '@/hooks/use-profile'
import { applyCatchRewards } from '@/lib/profile/profile.service'
import { cutout } from '@/lib/capture/cutout'
import { trimAndAssess, type CutoutQuality } from '@/lib/capture/trim'
import { buildContext } from '@/lib/capture/context'
import { generateCard, type GenerateResult } from '@/lib/cards/generate'
import { saveCatchedCard } from '@/lib/cards/card.service'
import { FOODS, DEFAULT_FOOD, getFood, type FoodId } from '@/lib/cards/food'
import { CatCard } from '@/components/card/CatCard'
import { CardBack } from '@/components/card/CardBack'
import { FlipCard } from '@/components/card/FlipCard'
import { CameraView } from '@/components/capture/CameraView'
import { CatFoundReveal } from '@/components/capture/CatFoundReveal'
import { rewardFor } from '@/lib/cards/reward'
import { makeAbility } from '@/lib/cards/ability'
import { PICKABLE_TRIBES, TRIBE_COLOR, TRIBE_LABEL, type Tribe } from '@/lib/cards/tribe'
import type { CaptureContext, CatKind } from '@/types'

type Phase = 'camera' | 'processing' | 'done' | 'error'
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function Capture() {
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const { data: profile } = useProfile()

  const [foodId, setFoodId] = useState<FoodId>(DEFAULT_FOOD)
  const [sessionId, setSessionId] = useState(0) // CameraView 리마운트용
  const [phase, setPhase] = useState<Phase>('camera')
  const [camFallback, setCamFallback] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null)
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [quality, setQuality] = useState<CutoutQuality | null>(null)
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null)

  const [ctx, setCtx] = useState<CaptureContext | null>(null)
  const [selectedTribe, setSelectedTribe] = useState<Tribe>('unknown')
  const [kind, setKind] = useState<CatKind | null>(null)
  const [nameInput, setNameInput] = useState('')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [savedDexNo, setSavedDexNo] = useState<number | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  // 보유 츄르보다 비싼 먹이가 선택돼 있으면 기본으로 되돌림
  useEffect(() => {
    if (profile && getFood(foodId).cost > profile.churu) setFoodId(DEFAULT_FOOD)
  }, [profile, foodId])

  const process = useCallback(
    async (blob: Blob) => {
      const pUrl = URL.createObjectURL(blob)
      setPhotoUrl(pUrl)
      setPhotoBlob(blob)
      setPhase('processing')
      setError(null)
      try {
        const removed = await cutout(blob)
        const { blob: trimmed, quality: q } = await trimAndAssess(removed)
        setCutoutBlob(trimmed)
        setQuality(q)
        const cut = URL.createObjectURL(trimmed)
        setCutoutUrl(cut)

        const context = buildContext()
        setCtx(context)
        setSelectedTribe('unknown')
        const seed = `cam-${blob.size}-${Math.floor(performance.now())}`
        const res = generateCard({
          seed,
          photoUrl: pUrl,
          cutoutUrl: cut,
          context,
          firstDiscovery: true,
          foodId,
        })
        setResult(res)
        setPhase('done')
      } catch (err) {
        console.error('[capture] 누끼/생성 실패:', err)
        setError(err instanceof Error ? err.message : '알 수 없는 오류')
        setPhase('error')
      }
    },
    [foodId],
  )

  const onCamError = useCallback((msg: string) => {
    setCamFallback(true)
    setError(msg)
  }, [])

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) process(file)
    e.target.value = ''
  }

  async function save(chosenKind: CatKind, name: string) {
    if (!result || !photoBlob || !cutoutBlob) return
    setSaveStatus('saving')
    setSaveError(null)
    try {
      const card = { ...result.card, kind: chosenKind, name }
      const saved = await saveCatchedCard({ card, photoBlob, cutoutBlob })
      setSavedDexNo(saved.dexNo)
      setSaveStatus('saved')
      queryClient.invalidateQueries({ queryKey: ['my-cards'] })
      try {
        const reward = rewardFor(result.card.rarity)
        await applyCatchRewards({
          foodCost: getFood(foodId).cost,
          xp: reward.xp,
          coins: reward.coins,
          churuBack: 2,
        })
        queryClient.invalidateQueries({ queryKey: ['profile'] })
      } catch {
        // 보상 적립 실패는 저장 성공에 영향 없음
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '알 수 없는 오류')
      setSaveStatus('error')
    }
  }

  function pickTribe(t: Tribe) {
    setSelectedTribe(t)
    setResult((prev) =>
      prev && ctx
        ? { ...prev, card: { ...prev.card, tribe: t, abilityText: makeAbility(t, prev.card.rarity, ctx) } }
        : prev,
    )
  }

  function reset() {
    setPhase('camera')
    setCamFallback(false)
    setError(null)
    setResult(null)
    setQuality(null)
    setCutoutUrl(null)
    setPhotoUrl(null)
    setPhotoBlob(null)
    setCutoutBlob(null)
    setCtx(null)
    setSelectedTribe('unknown')
    setKind(null)
    setNameInput('')
    setSaveStatus('idle')
    setSavedDexNo(null)
    setSaveError(null)
    setSessionId((n) => n + 1)
  }

  const lowQuality = quality !== null && !quality.ok
  const randomName = result?.card.name ?? '냥이'

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center gap-4 px-5 py-6">
      <h1 className="text-2xl text-amber-500" style={{ textShadow: '0 2px 0 rgba(0,0,0,0.06)' }}>
        니냥내냥 🐱
      </h1>

      {/* 먹이 선택 (캐치 화면에서만) */}
      {phase === 'camera' && (
        <div className="w-full">
          <p className="mb-1.5 text-center text-xs text-stone-500">
            먹이 선택 — 비쌀수록 예쁜 카드 확률↑
          </p>
          <div className="flex w-full gap-1.5">
            {FOODS.map((f) => {
              const locked = f.cost > (profile?.churu ?? 0)
              return (
                <button
                  key={f.id}
                  onClick={() => !locked && setFoodId(f.id)}
                  disabled={locked}
                  className={`flex flex-1 flex-col items-center rounded-2xl border-2 px-1 py-3 active:scale-95 ${
                    locked
                      ? 'border-stone-100 text-stone-300'
                      : foodId === f.id
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-stone-200 text-stone-500'
                  }`}
                >
                  <span className="text-[26px] leading-none">{locked ? '🔒' : f.emoji}</span>
                  <span className="mt-1 text-[11px] font-medium leading-tight">{f.label}</span>
                  <span className="text-[10px] text-stone-400">
                    {f.cost > 0 ? `🐟${f.cost} · +${f.bonus}` : '기본'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />

      {/* 라이브 카메라 (또는 폴백) */}
      {phase === 'camera' && !camFallback && (
        <>
          <CameraView
            key={sessionId}
            foodEmoji={getFood(foodId).emoji}
            onCapture={process}
            onError={onCamError}
          />
          <button onClick={() => fileRef.current?.click()} className="text-xs text-stone-400 underline">
            카메라 대신 사진 고르기
          </button>
        </>
      )}
      {phase === 'camera' && camFallback && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-stone-200 p-6 text-center">
          <p className="text-sm text-stone-500">
            카메라를 열 수 없어요 📷
            <br />
            <span className="text-xs text-stone-400">{error}</span>
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-medium text-white active:scale-95"
          >
            사진 고르기
          </button>
        </div>
      )}

      {phase === 'processing' && (
        <div className="flex flex-col items-center gap-3 py-4">
          {photoUrl && (
            <img
              src={photoUrl}
              alt="잡은 사진"
              className="w-[200px] rounded-2xl border-2 border-amber-300 object-cover opacity-80"
              style={{ aspectRatio: '3 / 4' }}
            />
          )}
          <p className="text-sm text-stone-500">누끼 따고 카드 만드는 중… 🐱✨</p>
        </div>
      )}
      {phase === 'error' && (
        <div className="flex flex-col items-center gap-3 py-4">
          {photoUrl && (
            <img
              src={photoUrl}
              alt="잡은 사진"
              className="w-[200px] rounded-2xl border-2 border-red-300 object-cover"
              style={{ aspectRatio: '3 / 4' }}
            />
          )}
          <p className="text-sm font-medium text-red-500">누끼에 실패했어요 😿</p>
          <p className="max-w-[260px] text-center text-xs text-stone-400">{error}</p>
          <button
            onClick={reset}
            className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-medium text-white active:scale-95"
          >
            🐱 다시 잡기
          </button>
        </div>
      )}

      {phase === 'done' && result && cutoutUrl && (
        <>
          <CatFoundReveal
            rarity={result.card.rarity}
            name={result.card.name ?? '냥이'}
            reward={rewardFor(result.card.rarity)}
          >
            <FlipCard
              front={<CatCard card={result.card} cutoutUrl={cutoutUrl} />}
              back={<CardBack card={result.card} />}
            />
          </CatFoundReveal>
          <p className="-mt-1 text-[11px] text-stone-400">카드를 탭하면 뒤집혀요 🔄</p>

          {saveStatus !== 'saved' && (
            <div className="w-full">
              <p className="mb-1.5 text-center text-xs text-stone-500">털색 타입 고르기 (선택)</p>
              <div className="grid grid-cols-4 gap-1.5">
                {PICKABLE_TRIBES.map((t) => (
                  <button
                    key={t}
                    onClick={() => pickTribe(t)}
                    className={`flex items-center justify-center gap-1 rounded-xl border py-2 text-[11px] active:scale-95 ${
                      selectedTribe === t
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-stone-200 text-stone-500'
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-black/10"
                      style={{ background: TRIBE_COLOR[t] }}
                    />
                    {TRIBE_LABEL[t]}
                  </button>
                ))}
              </div>
            </div>
          )}

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
                onClick={reset}
                className="mt-2 rounded-full bg-amber-600 px-4 py-2 text-xs font-medium text-white active:scale-95"
              >
                <span className="material-symbols-outlined mr-1 align-[-4px] text-[16px]">refresh</span>
                다시 잡기
              </button>
            </div>
          )}

          {saveStatus === 'saved' && savedDexNo !== null ? (
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-medium text-emerald-600">
                #{String(savedDexNo).padStart(6, '0')} {kind === 'naenyang' ? '내냥' : '니냥'} 도감에
                저장됐어요! 📖
              </p>
              <button
                onClick={reset}
                className="btn-3d rounded-full bg-amber-400 px-6 py-3 text-base font-black text-amber-900"
              >
                🐱 또 잡기
              </button>
            </div>
          ) : kind === null ? (
            <div className="w-full">
              <p className="mb-2 text-center text-sm text-stone-600">이 냥이는?</p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => save('ninyang', randomName)}
                  disabled={saveStatus === 'saving'}
                  className="btn-3d flex flex-1 flex-col items-center gap-1 rounded-3xl bg-amber-200 py-4 text-amber-900 disabled:opacity-50"
                >
                  <span className="text-3xl">🐱</span>
                  <span className="text-base font-bold">니냥</span>
                  <span className="text-[11px] text-amber-700">길에서 만난 냥 · 랜덤 이름</span>
                </button>
                <button
                  onClick={() => {
                    setKind('naenyang')
                    setNameInput('')
                  }}
                  disabled={saveStatus === 'saving'}
                  className="btn-3d flex flex-1 flex-col items-center gap-1 rounded-3xl bg-pink-200 py-4 text-pink-900 disabled:opacity-50"
                >
                  <span className="text-3xl">🏠</span>
                  <span className="text-base font-bold">내냥</span>
                  <span className="text-[11px] text-pink-700">내 반려묘 · 이름 직접</span>
                </button>
              </div>
            </div>
          ) : (
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
                  className="btn-3d flex-1 rounded-full bg-pink-400 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
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
