import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { startCamera, captureFrame, stopStream } from '@/lib/capture/camera'

type Phase = 'loading' | 'live' | 'throwing'

interface CameraViewProps {
  foodEmoji: string
  onCapture: (blob: Blob) => void
  onError: (msg: string) => void
}

const PARTICLES = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2
  const dist = 110 + (i % 3) * 18
  return {
    tx: Math.round(Math.cos(angle) * dist),
    ty: Math.round(Math.sin(angle) * dist),
    emoji: ['⭐', '✨', '💛', '🐾', '💥'][i % 5],
  }
})

export function CameraView({ foodEmoji, onCapture, onError }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [phase, setPhase] = useState<Phase>('loading')
  const [snapshot, setSnapshot] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    startCamera()
      .then((stream) => {
        if (!active) {
          stopStream(stream)
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
        setPhase('live')
      })
      .catch((e) => onError(e instanceof Error ? e.message : '카메라를 열 수 없어요.'))
    return () => {
      active = false
      stopStream(streamRef.current)
    }
  }, [onError])

  async function throwFood() {
    const video = videoRef.current
    if (!video || phase !== 'live') return
    try {
      const blob = await captureFrame(video)
      setSnapshot(URL.createObjectURL(blob))
      setPhase('throwing')
      stopStream(streamRef.current) // 프레임 정지
      window.setTimeout(() => onCapture(blob), 1050)
    } catch (e) {
      onError(e instanceof Error ? e.message : '캡처 실패')
    }
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[28px] border-4 border-amber-300 bg-stone-900 shadow-xl ${
        phase === 'throwing' ? 'animate-nyang-frameshake' : ''
      }`}
      style={{ aspectRatio: '3 / 4', animationDelay: phase === 'throwing' ? '0.42s' : undefined }}
    >
      {snapshot ? (
        <img src={snapshot} alt="captured" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {phase === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-white/80">
          카메라 켜는 중… 📷
        </div>
      )}

      {/* 귀여운 가이드 프레임 */}
      {phase === 'live' && (
        <>
          <div className="pointer-events-none absolute left-5 top-5 h-7 w-7 rounded-tl-xl border-l-4 border-t-4 border-white/90" />
          <div className="pointer-events-none absolute right-5 top-5 h-7 w-7 rounded-tr-xl border-r-4 border-t-4 border-white/90" />
          <div className="pointer-events-none absolute bottom-20 left-5 h-7 w-7 rounded-bl-xl border-b-4 border-l-4 border-white/90" />
          <div className="pointer-events-none absolute bottom-20 right-5 h-7 w-7 rounded-br-xl border-b-4 border-r-4 border-white/90" />
          <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-[11px] text-white">
            🐱 고양이를 가운데에!
          </div>
        </>
      )}

      {/* 던지기 애니메이션 */}
      {phase === 'throwing' && (
        <>
          <div className="animate-nyang-throw absolute bottom-0 left-1/2 text-5xl drop-shadow-lg">
            {foodEmoji}
          </div>
          <div
            className="animate-nyang-flash absolute left-1/2 top-1/2 h-28 w-28 rounded-full bg-white opacity-0"
            style={{ animationDelay: '0.42s' }}
          />
          <div
            className="animate-nyang-pop absolute left-1/2 top-1/2 flex items-center justify-center opacity-0"
            style={{ animationDelay: '0.42s', width: 170, height: 170 }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: '#ffd23f',
                clipPath:
                  'polygon(50% 0%, 58% 18%, 79% 9%, 73% 31%, 95% 31%, 78% 47%, 95% 63%, 73% 63%, 79% 85%, 58% 76%, 50% 100%, 42% 76%, 21% 85%, 27% 63%, 5% 63%, 22% 47%, 5% 31%, 27% 31%, 21% 9%, 42% 18%)',
              }}
            />
            <div
              className="absolute inset-[14px]"
              style={{
                background: '#ff5a5f',
                clipPath:
                  'polygon(50% 0%, 58% 18%, 79% 9%, 73% 31%, 95% 31%, 78% 47%, 95% 63%, 73% 63%, 79% 85%, 58% 76%, 50% 100%, 42% 76%, 21% 85%, 27% 63%, 5% 63%, 22% 47%, 5% 31%, 27% 31%, 21% 9%, 42% 18%)',
              }}
            />
            <span
              className="relative text-2xl font-black italic text-white"
              style={{ WebkitTextStroke: '1.5px #1f1f1f', textShadow: '2px 2px 0 #1f1f1f' }}
            >
              GOTCHA!
            </span>
          </div>
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="animate-nyang-particle absolute left-1/2 top-1/2 text-xl opacity-0"
              style={
                { ['--tx']: `${p.tx}px`, ['--ty']: `${p.ty}px`, animationDelay: '0.42s' } as CSSProperties
              }
            >
              {p.emoji}
            </span>
          ))}
        </>
      )}

      {/* 던지기 버튼 */}
      {phase === 'live' && (
        <div className="absolute inset-x-0 bottom-5 flex justify-center">
          <button
            onClick={throwFood}
            className="btn-3d rounded-full bg-amber-400 px-8 py-3.5 text-lg font-black text-amber-900"
          >
            {foodEmoji} 던지기!
          </button>
        </div>
      )}
    </div>
  )
}
