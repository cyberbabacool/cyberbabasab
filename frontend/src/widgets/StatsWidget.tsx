import { HardDrive, Clock, Download } from 'lucide-react'

interface Props {
  mbleft: string
  mb: string
  paused: boolean
  noofslots: number
  diskspace1_norm: string
  eta: string
}

export function StatsWidget({ mbleft, mb, paused, noofslots, diskspace1_norm, eta }: Props) {
  const total = parseFloat(mb)
  const left = parseFloat(mbleft)
  const done = total - left
  const pct = total > 0 ? (done / total) * 100 : 0

  const stats = [
    { icon: Download, label: 'Jobs en queue', value: String(noofslots) },
    { icon: HardDrive, label: 'Espace disque', value: diskspace1_norm },
    { icon: Clock, label: 'ETA', value: eta || '-' },
  ]

  return (
    <div className="rounded-3xl border border-slate-700/40 bg-slate-900/70 p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Progression globale</div>
        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${paused ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
          {paused ? 'En pause' : 'Actif'}
        </span>
      </div>
      <div>
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>{done.toFixed(0)} MB telecharges</span>
          <span>{left.toFixed(0)} MB restants</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {stats.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="space-y-1">
              <div className="flex items-center gap-2 text-slate-500">
                <Icon size={14} />
                <span className="text-xs">{s.label}</span>
              </div>
              <div className="text-lg font-bold">{s.value}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
