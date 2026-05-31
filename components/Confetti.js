import { useState, useEffect } from 'react'

export default function Confetti({ show }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (!show) {
      setParticles([])
      return
    }

    const colors = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6']
    const newParticles = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
      drift: -20 + Math.random() * 40,
    }))
    setParticles(newParticles)

    const timer = setTimeout(() => setParticles([]), 4000)
    return () => clearTimeout(timer)
  }, [show])

  if (!show || particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.x}%`,
            top: '-10px',
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            backgroundColor: p.color,
            borderRadius: '2px',
            transform: `rotate(${p.rotation}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--drift': `${p.drift}px`,
          }}
        />
      ))}

      {/* Congratulations banner */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl px-10 py-8 text-center animate-fade-in">
          <p className="text-5xl mb-3">🎉</p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Congratulations!</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">You completed all 8 weeks!</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10px) rotate(0deg) translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg) translateX(var(--drift));
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti-fall ease-in forwards;
        }
      `}</style>
    </div>
  )
}
