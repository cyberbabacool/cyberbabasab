import { useStats } from '../hooks/useSab'
import { BarChart2, TrendingDown, Zap, Calendar } from 'lucide-react'

function formatBytes(mb: number): string {
  if (mb >= 1024) return (mb / 1024).toFixed(2) + ' GB'
  return mb.toFixed(0) + ' MB'
}

function SpeedBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-20 text-right">{formatBytes(value)}</span>
    </div>
  )
}

export function StatsPage() {
  const { data } = useStats()

  if (!data) return <div className="flex items-center justify-center h-64 text-slate-500">Chargement des statistiques...</div>

  const daily   = data.day   ?? {}
  const weekly  = data.week  ?? {}
  const monthly = data.month ?? {}
  const total   = data.total ?? {}
  const servers = data.servers ?? {}

  // Historique vitesse par heure (les 24 dernieres heures)
  const hourly: number[] = data.day_articles_tried
    ? Object.values(data.day).slice(0, 24).map((v: any) => typeof v === 'number' ? v / 1024 : 0)
    : []
  const maxHourly = Math.max(...hourly, 1)

  const statCards = [
    { icon: Calendar, label: 'Aujourd\'hui', mb: daily.mb ?? 0, color: 'text-cyan-400' },
    { icon: BarChart2, label: 'Cette semaine', mb: weekly.mb ?? 0, color: 'text-violet-400' },
    { icon: TrendingDown, label: 'Ce mois', mb: monthly.mb ?? 0, color: 'text-emerald-400' },
    { icon: Zap, label: 'Total', mb: total.mb ?? 0, color: 'text-amber-400' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black">Statistiques</h1>
        <p className="text-slate-400 mt-1 text-sm">Donnees de telechargement SABnzbd</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(c => {
          const Icon = c.icon
          return (
            <div key={c.label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-3">
                <Icon size={13} />
                <span className="uppercase tracking-widest">{c.label}</span>
              </div>
              <div className={`text-2xl font-black ${c.color}`}>{formatBytes(c.mb)}</div>
            </div>
          )
        })}
      </div>

      {hourly.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="text-xs uppercase tracking-widest text-slate-500 mb-4">Telechargements par heure (24h)</div>
          <div className="flex items-end gap-1 h-32">
            {hourly.map((v, i) => {
              const pct = maxHourly > 0 ? (v / maxHourly) * 100 : 0
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-xs text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                    {formatBytes(v)}
                  </div>
                  <div className="w-full rounded-t" style={{ height: `${Math.max(pct, 2)}%`, backgroundColor: 'var(--accent)', opacity: 0.7 + (pct / 100) * 0.3 }} />
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-slate-600 mt-2">
            <span>-24h</span><span>maintenant</span>
          </div>
        </div>
      )}

      {Object.keys(servers).length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="text-xs uppercase tracking-widest text-slate-500 mb-4">Par serveur</div>
          <div className="space-y-4">
            {Object.entries(servers).map(([name, s]: [string, any]) => {
              const mb = (s.mb ?? 0)
              const maxMb = Math.max(...Object.values(servers).map((x: any) => x.mb ?? 0), 1)
              return (
                <div key={name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300 truncate">{name}</span>
                  </div>
                  <SpeedBar value={mb} max={maxMb} color="bg-cyan-500" />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
