export type GaugeType = 1 | 2 | 3 | 4 | 5

interface GaugeProps {
  kbpersec: string
  speedlimit?: string
  maxMbps?: number
  gaugeType?: GaugeType
}

function fmt(mbps: number): string {
  return mbps.toFixed(1)
}

// Type 1: Arc demi-cercle - stroke-dasharray sur meme chemin => zero debordement
function GaugeArc({ mbps, pct, limit }: { mbps: number; pct: number; limit: string }) {
  const R = 65, cx = 100, cy = 90, sw = 10
  // Meme circle, dasharray pour fond puis progression
  // Rotation: cercle commence a droite (0deg), on veut commencer a gauche (180deg)
  // stroke-dashoffset = -semi/2 - (circ-semi)/2 ... non: rotation transform
  // Plus simple: utiliser un path SVG calcule une seule fois
  const x1 = cx - R, y1 = cy  // point gauche
  const x2 = cx + R, y2 = cy  // point droit
  const bgPath = `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`
  const progAngle = Math.PI + pct * Math.PI
  const px = cx + R * Math.cos(progAngle)
  const py = cy + R * Math.sin(progAngle)
  const progPath = `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${px.toFixed(1)} ${py.toFixed(1)}`
  return (
    <svg viewBox="0 0 200 110" className="w-full">
      <path d={bgPath} fill="none" stroke="#1e293b" strokeWidth={sw} strokeLinecap="round" />
      {pct > 0.01 && <path d={progPath} fill="none" stroke="var(--accent)" strokeWidth={sw} strokeLinecap="round" />}
      <circle cx={px} cy={py} r={sw/2+2} fill="white" />
      <text x={cx} y={cy+5} textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">{fmt(mbps)}</text>
      <text x={cx} y={cy+18} textAnchor="middle" fill="#64748b" fontSize="8">MB/s</text>
      {limit && <text x={cx} y={cy+30} textAnchor="middle" fill="#475569" fontSize="7">{limit}</text>}
    </svg>
  )
}

// Type 2: Donut
function GaugeDonut({ mbps, pct, limit }: { mbps: number; pct: number; limit: string }) {
  const R = 32, cx = 50, cy = 50, sw = 8
  const circ = 2 * Math.PI * R
  const prog = pct * circ
  const offset = -circ / 4  // rotation pour commencer en haut
  return (
    <svg viewBox="0 0 100 110" className="w-full max-w-xs mx-auto">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#1e293b" strokeWidth={sw} />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--accent)" strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={`${prog.toFixed(1)} ${circ.toFixed(1)}`}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cx-4} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{fmt(mbps)}</text>
      <text x={cx} y={cx+7} textAnchor="middle" fill="#64748b" fontSize="6">MB/s</text>
      {limit && <text x={cx} y={95} textAnchor="middle" fill="#475569" fontSize="6">{limit}</text>}
    </svg>
  )
}

// Type 3: Barre horizontale
function GaugeBar({ mbps, pct, limit }: { mbps: number; pct: number; limit: string }) {
  const w = 180, bh = 10
  return (
    <svg viewBox="0 0 200 80" className="w-full">
      <text x={100} y={30} textAnchor="middle" fill="white" fontSize="26" fontWeight="bold">{fmt(mbps)}</text>
      <text x={100} y={43} textAnchor="middle" fill="#64748b" fontSize="8">MB/s</text>
      <rect x={10} y={52} width={w} height={bh} rx={5} fill="#1e293b" />
      <rect x={10} y={52} width={Math.max(pct*w, pct>0?6:0)} height={bh} rx={5} fill="var(--accent)" />
      {limit && <text x={100} y={74} textAnchor="middle" fill="#475569" fontSize="7">{limit}</text>}
    </svg>
  )
}

// Type 4: Compteur avec aiguille (style speedometer classique)
// Arc de 210deg a 330deg (240deg de plage), sens horaire
function GaugeMeter({ mbps, pct, maxMbps, limit }: { mbps: number; pct: number; maxMbps: number; limit: string }) {
  const R = 58, cx = 100, cy = 90, sw = 8, Rn = 50
  const circ = 2 * Math.PI * R
  const arcDeg = 240
  const arcLen = (arcDeg / 360) * circ  // longueur arc 240deg
  const gap = circ - arcLen
  const prog = pct * arcLen
  // Rotation pour placer l'arc: debut a 150deg (bas gauche), fin a 30deg (bas droite)
  // stroke-dashoffset=0 commence a 3h, on veut commencer a 5h (150deg)
  const startDeg = 150
  const dashOffset = -(startDeg / 360) * circ
  // Aiguille
  const needleDeg = startDeg + pct * arcDeg
  const needleRad = (needleDeg * Math.PI) / 180
  const nx = cx + Rn * Math.cos(needleRad)
  const ny = cy + Rn * Math.sin(needleRad)
  // Graduations: 5 ticks a 0%, 25%, 50%, 75%, 100%
  const ticks = [0, 0.25, 0.5, 0.75, 1.0]
  const tickLabels = [0, Math.round(maxMbps*0.25), Math.round(maxMbps*0.5), Math.round(maxMbps*0.75), maxMbps]
  return (
    <svg viewBox="0 0 200 115" className="w-full">
      {/* Arc fond */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#1e293b" strokeWidth={sw}
        strokeDasharray={`${arcLen.toFixed(1)} ${gap.toFixed(1)}`}
        strokeDashoffset={dashOffset.toFixed(1)} />
      {/* Arc progression */}
      {pct > 0 && (
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--accent)" strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={`${prog.toFixed(1)} ${(circ-prog).toFixed(1)}`}
          strokeDashoffset={dashOffset.toFixed(1)} />
      )}
      {/* Ticks */}
      {ticks.map((t, i) => {
        const deg = startDeg + t * arcDeg
        const rad = (deg * Math.PI) / 180
        const Ri = R + sw/2 + 3, Ro = R + sw/2 + 9
        return <line key={i} x1={cx+Ri*Math.cos(rad)} y1={cy+Ri*Math.sin(rad)}
          x2={cx+Ro*Math.cos(rad)} y2={cy+Ro*Math.sin(rad)}
          stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
      })}
      {/* Labels de tick */}
      {ticks.map((t, i) => {
        const deg = startDeg + t * arcDeg
        const rad = (deg * Math.PI) / 180
        const Rl = R + sw/2 + 18
        return <text key={i} x={cx+Rl*Math.cos(rad)} y={cy+Rl*Math.sin(rad)+3}
          textAnchor="middle" fill="#475569" fontSize="7">{tickLabels[i]}</text>
      })}
      {/* Aiguille */}
      <line x1={cx} y1={cy} x2={nx.toFixed(1)} y2={ny.toFixed(1)}
        stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={5} fill="var(--accent)" />
      <circle cx={cx} cy={cy} r={2.5} fill="white" />
      <text x={cx} y={cy+14} textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">{fmt(mbps)}</text>
      <text x={cx} y={cy+25} textAnchor="middle" fill="#64748b" fontSize="7">MB/s</text>
      {limit && <text x={cx} y={112} textAnchor="middle" fill="#475569" fontSize="7">{limit}</text>}
    </svg>
  )
}

// Type 5: Numerique
function GaugeDigital({ mbps, pct, limit }: { mbps: number; pct: number; limit: string }) {
  const w = 160
  return (
    <svg viewBox="0 0 200 90" className="w-full">
      <text x={100} y={40} textAnchor="middle" fill="var(--accent)" fontSize="34" fontWeight="bold">{fmt(mbps)}</text>
      <text x={100} y={55} textAnchor="middle" fill="#64748b" fontSize="9">MB/s</text>
      <rect x={20} y={62} width={w} height={6} rx={3} fill="#1e293b" />
      {pct > 0 && <rect x={20} y={62} width={Math.max(pct*w, pct>0?4:0)} height={6} rx={3} fill="var(--accent)" opacity="0.7" />}
      {limit && <text x={100} y={82} textAnchor="middle" fill="#475569" fontSize="7">{limit}</text>}
    </svg>
  )
}

export function SpeedGauge({ kbpersec, speedlimit, maxMbps = 150, gaugeType = 1 }: GaugeProps) {
  const mbps = parseFloat(kbpersec) / 1024
  const pct = Math.min(mbps / maxMbps, 1)
  const limitText = speedlimit && speedlimit !== '0' ? `Limite: ${speedlimit}%` : ''
  if (gaugeType === 2) return <GaugeDonut mbps={mbps} pct={pct} limit={limitText} />
  if (gaugeType === 3) return <GaugeBar mbps={mbps} pct={pct} limit={limitText} />
  if (gaugeType === 4) return <GaugeMeter mbps={mbps} pct={pct} maxMbps={maxMbps} limit={limitText} />
  if (gaugeType === 5) return <GaugeDigital mbps={mbps} pct={pct} limit={limitText} />
  return <GaugeArc mbps={mbps} pct={pct} limit={limitText} />
}
