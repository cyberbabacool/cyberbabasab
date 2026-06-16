import { useEffect, useState, useRef } from 'react'

interface SpeedPoint {
  t: number
  kbps: number
}

const WINDOW_MS = 10 * 60 * 1000

export function useSpeedHistory(kbpersec: string) {
  const [points, setPoints] = useState<SpeedPoint[]>([])
  const lastValue = useRef<number>(0)

  useEffect(() => {
    const kbps = parseFloat(kbpersec) || 0
    lastValue.current = kbps
  }, [kbpersec])

  useEffect(() => {
    const tick = () => {
      const now = Date.now()
      setPoints(prev => {
        const next = [...prev, { t: now, kbps: lastValue.current }]
        return next.filter(p => now - p.t <= WINDOW_MS)
      })
    }
    tick()
    const interval = setInterval(tick, 5000)
    return () => clearInterval(interval)
  }, [])

  return points
}

export function SpeedSparkline({ points }: { points: SpeedPoint[] }) {
  const W = 280, H = 60, PAD = 4
  if (points.length < 2) {
    return (
      <div className="flex items-center justify-center h-14 text-xs text-slate-600">
        Collecte des donnees...
      </div>
    )
  }

  const maxKbps = Math.max(...points.map(p => p.kbps), 1)
  const minT = points[0].t
  const maxT = points[points.length - 1].t
  const spanT = Math.max(maxT - minT, 1)

  const coords = points.map(p => {
    const x = PAD + ((p.t - minT) / spanT) * (W - PAD * 2)
    const y = H - PAD - (p.kbps / maxKbps) * (H - PAD * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  const linePath = `M ${coords.join(' L ')}`
  const areaPath = `M ${PAD},${H - PAD} L ${coords.join(' L ')} L ${W - PAD},${H - PAD} Z`

  const maxMbps = (maxKbps / 1024).toFixed(1)

  return (
    <div className="space-y-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-14" preserveAspectRatio="none">
        <defs>
          <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#speedGrad)" stroke="none" />
        <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="flex justify-between text-xs text-slate-600">
        <span>-10 min</span>
        <span>max {maxMbps} MB/s</span>
        <span>maintenant</span>
      </div>
    </div>
  )
}
