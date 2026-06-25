import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/capture', icon: 'photo_camera', label: '캐치' },
  { to: '/dex', icon: 'grid_view', label: '도감' },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md border-t border-stone-200 bg-white/95 backdrop-blur">
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${
              isActive ? 'text-amber-600' : 'text-stone-400'
            }`
          }
        >
          <span className="material-symbols-outlined text-[22px]">{t.icon}</span>
          {t.label}
        </NavLink>
      ))}
    </nav>
  )
}
