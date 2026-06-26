import { useState, type ReactNode } from 'react'

interface FlipCardProps {
  front: ReactNode
  back: ReactNode
  width?: number
}

/** 탭하면 앞↔뒤 뒤집히는 카드 (CSS 3D). 앞/뒤는 부모를 꽉 채우는 컴포넌트여야 함. */
export function FlipCard({ front, back, width = 250 }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false)
  return (
    <div
      className="relative cursor-pointer select-none"
      style={{ width, aspectRatio: '3 / 4', perspective: '1000px' }}
      onClick={() => setFlipped((f) => !f)}
    >
      <div
        className="relative h-full w-full transition-transform duration-500"
        style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'none' }}
      >
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {front}
        </div>
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {back}
        </div>
      </div>
    </div>
  )
}
