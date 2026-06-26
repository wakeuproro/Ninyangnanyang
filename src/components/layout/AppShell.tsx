import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { TopBar } from './TopBar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh max-w-md pb-16">
      <TopBar />
      {children}
      <BottomNav />
    </div>
  )
}
