import { useEffect, useState } from 'react'

const MESSAGES = [
  '츄르 데우는 중… 🐟',
  '냥이 살살 꼬시는 중… 🐱',
  '찰칵! 사진관 가는 중… 📸',
  '배경 싹 지우는 중… ✨',
  '카드 굽는 중… 🃏',
]

export function CatchLoading({
  photoUrl,
  progress,
}: {
  photoUrl?: string | null
  progress: number
}) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % MESSAGES.length), 1100)
    return () => clearInterval(t)
  }, [])

  const pct = Math.max(4, Math.min(100, progress))
  return (
    <div className="flex w-full flex-col items-center gap-3 py-4">
      {photoUrl && (
        <img
          src={photoUrl}
          alt="잡은 사진"
          className="animate-nyang-float w-[180px] rounded-2xl border-2 border-amber-300 object-cover"
          style={{ aspectRatio: '3 / 4' }}
        />
      )}
      <div className="h-3 w-[200px] overflow-hidden rounded-full bg-amber-100">
        <div
          className="h-full rounded-full bg-amber-400 transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-sm font-bold text-amber-600">{MESSAGES[i]}</p>
    </div>
  )
}
