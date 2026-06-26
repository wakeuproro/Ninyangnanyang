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

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between gap-2 bg-white/70 px-3 py-2 backdrop-blur">
      <div className="flex items-center gap-1.5">
        <span className="flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-sm font-bold text-sky-700 shadow-sm">
          🐟 {p.churu}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-sm font-bold text-yellow-700 shadow-sm">
          🪙 {p.coins}
        </span>
        <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700 shadow-sm">
          Lv.{p.level}
        </span>
      </div>
      <button
        onClick={charge}
        disabled={p.coins < 10 || busy}
        className="btn-3d rounded-full bg-amber-400 px-3 py-1.5 text-[11px] font-bold text-amber-900 disabled:opacity-40 disabled:shadow-none"
      >
        🪙10 → 🐟5
      </button>
    </div>
  )
}
