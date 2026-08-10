import { useEffect, useState } from 'react';

const COLORS = ['#6F5CFF', '#22D3B0', '#F7B955', '#FF6B6B', '#4CC9F0'];

export default function Confetti({ onDone }) {
  const [pieces] = useState(() =>
    Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.3,
      duration: 1.8 + Math.random() * 1.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotate: Math.random() * 360
    }))
  );

  useEffect(() => {
    const timer = setTimeout(() => onDone?.(), 2500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 300, overflow: 'hidden' }}>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: -20,
            left: `${p.left}%`,
            width: 8,
            height: 14,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `hs-confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`
          }}
        />
      ))}
      <style>{`
        @keyframes hs-confetti-fall {
          to { top: 105%; transform: rotate(720deg); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
