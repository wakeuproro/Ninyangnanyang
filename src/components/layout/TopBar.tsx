import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useProfile } from '@/hooks/use-profile'
import { buyChuru } from '@/lib/profile/profile.service'

export function TopBar() {
  const { data: p } = useProfile()
  const queryClient = useQueryClient()
  const [busy, setBusy] = useState(false)

  if (!p) return <div className="h-11 border-b border-stone-100" />

  async function charge() {
    if (busy) return
    setBusy(true)
    try {
      await buyChuru(10, 5)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    } catch {
      // 코인 부족 등 — 조용히 무시 (버튼이 이미 비활성)
    } finally {
      setBusy(false)
    }
  }

  const xpInLevel = p.xp % 100

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-stone-100 bg-white/90 px-4 py-2 backdrop-blur">
      <div className="flex items-center gap-3 text-sm">
        <span>
          🐟 <b className="text-amber-700">{p.churu}</b>
        </span>
        <span>
          🪙 <b className="text-yellow-700">{p.coins}</b>
        </span>
        <span className="text-xs text-stone-500">
          Lv.{p.level} <span className="text-stone-300">({xpInLevel}/100)</span>
        </span>
      </div>
      <button
        onClick={charge}
        disabled={p.coins < 10 || busy}
        className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700 active:scale-95 disabled:opacity-40"
      >
        🪙10 → 🐟5
      </button>
    </div>
  )
}
