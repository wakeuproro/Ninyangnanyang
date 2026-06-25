import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Capture } from '@/pages/Capture'
import { Dex } from '@/pages/Dex'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/capture" replace />} />
        <Route path="/capture" element={<Capture />} />
        <Route path="/dex" element={<Dex />} />
      </Routes>
    </AppShell>
  )
}
