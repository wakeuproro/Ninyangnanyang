import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Capture } from '@/pages/Capture'
import { Dex } from '@/pages/Dex'
import { warmupCutout } from '@/lib/capture/cutout'
import { warmupDetect } from '@/lib/capture/detect'

export default function App() {
  // 앱 로드 시 누끼·동물감지 모델을 백그라운드로 미리 다운로드 → 첫 캐치 빠르게
  useEffect(() => {
    warmupCutout()
    warmupDetect()
  }, [])

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
