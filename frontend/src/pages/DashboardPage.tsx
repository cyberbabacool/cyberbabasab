import { useState } from 'react'
import { Pause, Play, HardDrive, Clock, Download, Zap, Maximize, Minimize } from 'lucide-react'
import { useQueue } from '../hooks/useSab'
import type { Page } from '../App'
import { NzbDropzone } from '../components/NzbDropzone'
import { AddNzbModal } from '../components/AddNzbModal'

interface Props { onNavigate: (p: Page) => void }

function SpeedGauge({ kbpersec, maxMbps = 150 }: { kbpersec: string; maxMbps?: number }) {
  const speedMbps = parseFloat(kbpersec) / 1024
  const pct = Math.min(speedMbps / maxMbps, 1)
  const R = 70, cx = 100, cy = 90, sw = 10
  // Demi-cercle par le haut: de gauche (30,90) a droite (170,90) via (100,20)
  // angle PI+pct*PI trace le demi-cercle superieur en sens horaire SVG (sweep=1)
  // L'arc de progression fait toujours <= 180 deg -> largeArc toujours 0
  const x1 = cx - R, y1 = cy
  const x2 = cx + R, y2 = cy
  const angle = Math.PI + pct * Math.PI
  const px = cx + R * Math.cos(angle)
  const py = cy + R * Math.sin(angle)
  const mbps = speedMbps.toFixed(1)
  return (
    <svg viewBox="0 0 200 110" className="w-full max-w-xs mx-auto">
      {/* Arc fond: sweep=1 (horaire SVG) -> passe par le haut */}
      <path d={`M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`}
        fill="none" stroke="#1e293b" strokeWidth={sw} strokeLinecap="round" />
      {/* Arc prog: largeArc toujours 0 car <= 180deg */}
      {pct > 0 && (
        <path d={`M ${x1} ${y1} A ${R} ${R} 0 0 1 ${px} ${py}`}
          fill="none" stroke="var(--accent)" strokeWidth={sw} strokeLinecap="round" />
      )}
      <circle cx={px} cy={py} r={sw / 2 + 2} fill="white" />
      <text x={cx} y={cy + 6} textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">{mbps}</text>
      <text x={cx} y={cy + 20} textAnchor="middle" fill="#64748b" fontSize="9">MB/s</text>
    </svg>
  )
}

function StorageBar({ used, total, label }: { used: string; total: string; label: string }) {
  const usedN = parseFloat(used) || 0
  const totalN = parseFloat(total) || 1
  const pct = Math.min((usedN / totalN) * 100, 100)
  const free = totalN - usedN
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span>{free.toFixed(1)} GB libres</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function DashboardPage({ onNavigate }: Props) {
  const { data, pause, resume } = useQueue()
  const [showAdd, setShowAdd] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  if (!data) return <div className="text-slate-500 p-4">Chargement...</div>

  const topJobs = (data.slots ?? []).slice(0, 5)

  return (
    <div className={fullscreen ? 'fixed inset-0 z-40 bg-slate-950 overflow-auto p-6' : 'space-y-6'}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black">Dashboard</h1>
            <button onClick={() => setFullscreen(!fullscreen)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800">
              {fullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          </div>
          <p className="text-slate-400 mt-1 text-sm">{data.noofslots} job(s) en queue - {data.sizeleft} restants</p>
        </div>
        <div className="flex gap-2">
          {data.paused
            ? <button onClick={resume} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm font-semibold"><Play size={14} /> Reprendre</button>
            : <button onClick={pause}  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10  text-amber-400  hover:bg-amber-500/20  text-sm font-semibold"><Pause size={14} /> Pause</button>
          }
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-sm font-semibold"><Download size={14} /> Ajouter NZB</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-3"><Zap size={13} /><span className="uppercase tracking-widest">Vitesse</span></div>
          <SpeedGauge kbpersec={data.kbpersec} />
          <div className="text-center text-xs text-slate-500 mt-3">
            Limite: {data.speedlimit ? data.speedlimit + '%' : 'Aucune'}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs"><HardDrive size={13} /><span className="uppercase tracking-widest">Stockage</span></div>
          <StorageBar used={data.diskspace1} total={data.diskspacetotal1} label="Telechargement" />
          <StorageBar used={data.diskspace2} total={data.diskspacetotal2} label="Completions" />
          <div className="text-xs text-slate-500">Cache: {data.cache_size}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-3"><Clock size={13} /><span className="uppercase tracking-widest">Progression</span></div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Global</span><span>{data.mbleft} MB restants</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${Math.min(100 - (parseFloat(data.mbleft) / Math.max(parseFloat(data.mb), 1)) * 100, 100)}%` }} />
              </div>
            </div>
            <div className="text-sm font-semibold">{data.timeleft} restant</div>
            <div className="text-xs text-slate-500">ETA: {data.eta}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-3">
            <div className="flex items-center gap-2"><Download size={13} /><span className="uppercase tracking-widest">Queue</span></div>
            <button onClick={() => onNavigate('queue')} className="text-[var(--accent)] hover:underline">Tout voir</button>
          </div>
          <div className="space-y-2">
            {topJobs.length === 0
              ? <div className="text-slate-600 text-sm">Queue vide</div>
              : topJobs.map(job => (
                <div key={job.nzo_id} className="space-y-1">
                  <div className="text-xs text-slate-300 truncate">{job.filename}</div>
                  <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-[var(--accent)]/60" style={{ width: `${job.percentage}%` }} />
                  </div>
                </div>
              ))
            }
            {data.noofslots > 5 && <div className="text-xs text-slate-600">{data.noofslots - 5} job(s) de plus</div>}
          </div>
        </div>
      </div>

      <NzbDropzone />
      {showAdd && <AddNzbModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
