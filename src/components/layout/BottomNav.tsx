import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/capture', icon: 'photo_camera', label: '캐치' },
  { to: '/dex', icon: 'grid_view', label: '도감' },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md justify-around rounded-t-3xl border-t-2 border-amber-100 bg-white/95 px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur">
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} className="flex-1">
          {({ isActive }) => (
            <span
              className={`mx-auto flex w-fit flex-col items-center gap-0.5 rounded-2xl px-5 py-1.5 transition-colors ${
                isActive ? 'bg-amber-100 text-amber-600' : 'text-stone-400'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">{t.icon}</span>
              <span className="text-[11px] font-bold">{t.label}</span>
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
