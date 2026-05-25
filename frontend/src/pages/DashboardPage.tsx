import { useState } from 'react'
import { Pause, Play, HardDrive, Clock, Download, Zap } from 'lucide-react'
import { useQueue } from '../hooks/useSab'
import type { Page } from '../App'
import { NzbDropzone } from '../components/NzbDropzone'
import { AddNzbModal } from '../components/AddNzbModal'

interface Props { onNavigate: (p: Page) => void }

function SpeedGauge({ kbpersec, maxMbps = 150 }: { kbpersec: string; maxMbps?: number }) {
  const speedMbps = parseFloat(kbpersec) / 1024
  const pct = Math.min(speedMbps / maxMbps, 1)
  const R = 80
  const cx = 100
  const cy = 105
  const startAngle = -210
  const totalDeg = 240
  const toRad = (d: number) => (d * Math.PI) / 180
  const bgStart = toRad(startAngle)
  const bgEnd   = toRad(startAngle + totalDeg)
  const bgD = `M ${cx + R * Math.cos(bgStart)} ${cy + R * Math.sin(bgStart)} A ${R} ${R} 0 1 1 ${cx + R * Math.cos(bgEnd)} ${cy + R * Math.sin(bgEnd)}`
  const fillDeg = totalDeg * pct
  const fillEnd = toRad(startAngle + fillDeg)
  const largeArc = fillDeg > 180 ? 1 : 0
  const fillD = fillDeg > 0
    ? `M ${cx + R * Math.cos(bgStart)} ${cy + R * Math.sin(bgStart)} A ${R} ${R} 0 ${largeArc} 1 ${cx + R * Math.cos(fillEnd)} ${cy + R * Math.sin(fillEnd)}`
    : ''
  const needleAngle = startAngle + totalDeg * pct
  const needleRad = toRad(needleAngle)
  const nx = cx + (R - 8) * Math.cos(needleRad)
  const ny = cy + (R - 8) * Math.sin(needleRad)
  const ticks = Array.from({ length: 9 }, (_, i) => {
    const a = toRad(startAngle + (totalDeg / 8) * i)
    const inner = R - 14
    const outer = R - 4
    return {
      x1: cx + inner * Math.cos(a), y1: cy + inner * Math.sin(a),
      x2: cx + outer * Math.cos(a), y2: cy + outer * Math.sin(a),
      label: Math.round((maxMbps / 8) * i),
      lx: cx + (R - 26) * Math.cos(a), ly: cy + (R - 26) * Math.sin(a),
    }
  })
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 130" className="w-52 h-36">
        <path d={bgD} fill="none" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
        {fillD && <path d={fillD} fill="none" stroke="url(#speedGrad)" strokeWidth="10" strokeLinecap="round" />}
        <defs>
          <linearGradient id="speedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="60%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#334155" strokeWidth="1.5" />
            {i % 2 === 0 && (
              <text x={t.lx} y={t.ly} textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7">{t.label}</text>
            )}
          </g>
        ))}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="5" fill="#22d3ee" />
        <text x={cx} y={cy - 22} textAnchor="middle" fill="white" fontSize="22" fontWeight="900">
          {speedMbps >= 100 ? speedMbps.toFixed(0) : speedMbps.toFixed(1)}
        </text>
        <text x={cx} y={cy - 8} textAnchor="middle" fill="#22d3ee" fontSize="8" fontWeight="600">MB/s</text>
      </svg>
      <div className="text-xs text-slate-500 -mt-2">Limite: {maxMbps} MB/s</div>
    </div>
  )
}

const PRIORITIES: Record<string, string> = { '-100': 'Default', '-2': 'Pause', '-1': 'Bas', '0': 'Normal', '1': 'Haut', '2': 'Force' }
const PRIO_COLORS: Record<string, string> = { '2': 'text-red-400', '1': 'text-amber-400', '0': 'text-slate-400', '-1': 'text-blue-400', '-2': 'text-slate-600' }

export function DashboardPage({ onNavigate }: Props) {
  const { data, error, pause, resume, pauseJob, resumeJob, setSpeed } = useQueue()
  const [showAdd, setShowAdd] = useState(false)
  const [speedInput, setSpeedInput] = useState('')

  if (error) return <div className="flex items-center justify-center h-64 text-red-400">{error}</div>
  if (!data)  return <div className="flex items-center justify-center h-64 text-slate-500">Chargement...</div>

  const slots = data.slots ?? []
  const mbDone = parseFloat(data.mb) - parseFloat(data.mbleft)
  const pctDone = parseFloat(data.mb) > 0 ? (mbDone / parseFloat(data.mb)) * 100 : 0
  const maxMbps = data.speedlimit_abs ? Math.max(10, parseFloat(data.speedlimit_abs) / 1024 / 1024) : 150

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black">Dashboard</h1>
          <p className="text-slate-400 mt-1 text-sm">SABnzbd {data.status}{data.paused ? ' - En pause' : ''}</p>
        </div>
        <div className="flex gap-2">
          {data.paused
            ? <button onClick={resume} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm font-semibold"><Play size={15} />Reprendre</button>
            : <button onClick={pause}  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10  text-amber-400  hover:bg-amber-500/20  text-sm font-semibold"><Pause size={15} />Pause</button>
          }
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-sm font-semibold">
            <Download size={15} />Ajouter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 flex flex-col items-center justify-between">
          <div className="text-xs uppercase tracking-widest text-slate-500 self-start">Vitesse actuelle</div>
          <SpeedGauge kbpersec={data.kbpersec} maxMbps={maxMbps} />
          <div className="w-full mt-2 space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Limite vitesse</span>
              <span>{data.speedlimit}%</span>
            </div>
            <div className="flex gap-2">
              <input type="number" min="0" max="100" value={speedInput}
                onChange={e => setSpeedInput(e.target.value)}
                placeholder="%" className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500" />
              <button onClick={() => { setSpeed(parseInt(speedInput) || 0); setSpeedInput('') }}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-semibold">OK</button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <div className="text-xs uppercase tracking-widest text-slate-500">Statistiques</div>
          <div className="space-y-3">
            {[
              { icon: Download,  label: 'Restant',       value: data.sizeleft || '0 B',    color: 'text-violet-400'  },
              { icon: Clock,     label: 'Temps restant', value: data.timeleft || '-',       color: 'text-amber-400'   },
              { icon: HardDrive, label: 'Espace libre',  value: data.diskspace1_norm,       color: 'text-emerald-400' },
              { icon: Zap,       label: 'Jobs en queue', value: String(data.noofslots),     color: 'text-cyan-400'    },
            ].map(s => {
              const Icon = s.icon
              return (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Icon size={14} className="text-slate-600" />{s.label}
                  </div>
                  <div className={`font-bold text-sm ${s.color}`}>{s.value}</div>
                </div>
              )
            })}
          </div>
          {parseFloat(data.mb) > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Progression globale</span>
                <span>{pctDone.toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-400 transition-all duration-700" style={{ width: `${pctDone}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <div className="text-xs uppercase tracking-widest text-slate-500">Stockage</div>
          {[
            { label: 'Telechargement', used: parseFloat(data.diskspacetotal1 ?? '0') - parseFloat(data.diskspace1 ?? '0'), total: parseFloat(data.diskspacetotal1 ?? '0'), norm: data.diskspace1_norm, color: 'bg-cyan-400' },
            { label: 'Completion',     used: parseFloat(data.diskspacetotal2 ?? '0') - parseFloat(data.diskspace2 ?? '0'), total: parseFloat(data.diskspacetotal2 ?? '0'), norm: data.diskspace2_norm, color: 'bg-emerald-400' },
          ].map(d => {
            const pct = d.total > 0 ? Math.min((d.used / d.total) * 100, 100) : 0
            const usedGB = d.used.toFixed(0)
            const totalGB = d.total.toFixed(0)
            return (
              <div key={d.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{d.label}</span>
                  <span className="text-slate-300 font-semibold">{d.norm} libre</span>
                </div>
                <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div className={`h-full rounded-full ${d.color} transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <div className="text-xs text-slate-600">{usedGB} GB / {totalGB} GB</div>
              </div>
            )
          })}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Cache</span>
              <span>{data.cache_size ?? '0 B'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="text-xs uppercase tracking-widest text-slate-500">
            File d'attente {slots.length > 0 ? `(${slots.length})` : ''}
          </div>
          {slots.length > 0 && (
            <button onClick={() => onNavigate('queue')} className="text-xs text-cyan-400 hover:text-cyan-300">Tout voir</button>
          )}
        </div>
        {slots.length === 0
          ? <div className="p-6"><NzbDropzone /></div>
          : (
            <div className="divide-y divide-slate-800/50">
              {slots.slice(0, 6).map(slot => {
                const pct = parseFloat(slot.percentage) || 0
                const isPaused = slot.status === 'Paused'
                return (
                  <div key={slot.nzo_id} className="px-5 py-3 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isPaused ? 'bg-amber-400' : pct > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{slot.filename}</div>
                        <div className="flex gap-3 text-xs text-slate-500 mt-0.5">
                          <span className={isPaused ? 'text-amber-400' : 'text-emerald-400'}>{slot.status}</span>
                          <span>{slot.sizeleft} restants</span>
                          {slot.timeleft !== '0:00:00' && <span>ETA: {slot.timeleft}</span>}
                          <span className={PRIO_COLORS[slot.priority] ?? ''}>{PRIORITIES[slot.priority] ?? ''}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-slate-300 w-10 text-right">{pct.toFixed(0)}%</span>
                        <button onClick={() => isPaused ? resumeJob(slot.nzo_id) : pauseJob(slot.nzo_id)}
                          className="p-1 rounded text-slate-600 hover:text-amber-400">
                          {isPaused ? <Play size={12} /> : <Pause size={12} />}
                        </button>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-cyan-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
              {slots.length > 6 && (
                <div className="px-5 py-3 text-center">
                  <button onClick={() => onNavigate('queue')} className="text-xs text-slate-500 hover:text-cyan-400">
                    + {slots.length - 6} job(s) de plus
                  </button>
                </div>
              )}
            </div>
          )
        }
      </div>

      {showAdd && <AddNzbModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
