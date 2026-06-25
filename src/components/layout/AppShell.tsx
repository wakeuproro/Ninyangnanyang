import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh max-w-md pb-16">
      {children}
      <BottomNav />
    </div>
  )
}
