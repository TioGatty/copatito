'use client'

import { useEffect, useState } from 'react'

const PIECES = 60
const EMOJIS = ['🎉', '⚽', '🏆', '🥇', '✨', '🎊']

interface Piece {
  id: number
  x: number      // 0..100 vw
  delay: number  // 0..1.5 s
  dur: number    // 2..4 s
  rot: number    // initial rotation
  emoji: string
  size: number
}

export default function Confetti({ trigger, onDone }: { trigger: boolean; onDone?: () => void }) {
  const [pieces, setPieces] = useState<Piece[] | null>(null)

  useEffect(() => {
    if (!trigger) return
    const arr: Piece[] = Array.from({ length: PIECES }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 1.5,
      dur: 2 + Math.random() * 2,
      rot: Math.random() * 360,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      size: 18 + Math.random() * 18,
    }))
    setPieces(arr)
    const t = setTimeout(() => {
      setPieces(null)
      onDone?.()
    }, 4500)
    return () => clearTimeout(t)
  }, [trigger, onDone])

  if (!pieces) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0,
        pointerEvents: 'none', zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {pieces.map(p => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}vw`,
            top: -40,
            fontSize: p.size,
            transform: `rotate(${p.rot}deg)`,
            animation: `confetti-fall ${p.dur}s linear ${p.delay}s forwards`,
            willChange: 'transform',
          }}
        >{p.emoji}</span>
      ))}
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(0) rotate(0deg);   opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
