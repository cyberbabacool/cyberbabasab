import { useStatus } from '../hooks/useSab'
import { useHistory } from '../hooks/useSab'
import { usePrefs } from '../hooks/usePrefs'
import { BarChart2, TrendingDown, Zap, Calendar } from 'lucide-react'

function formatBytes(mb: number): string {
  if (mb >= 1024 * 1024) return (mb / 1024 / 1024).toFixed(2) + ' TB'
  if (mb >= 1024) return (mb / 1024).toFixed(2) + ' GB'
  return mb.toFixed(0) + ' MB'
}

export function StatsPage() {
  const { data: statusData } = useStatus()
  const { data: history, loading } = useHistory(10000)
  const { t } = usePrefs()

  const status = statusData?.status ?? {}
  const servers = status.servers ?? []

  const now = Date.now() / 1000
  const DAY   = 86400
  const WEEK  = 86400 * 7
  const MONTH = 86400 * 30

  function sumMb(slots: any[], since: number): number {
    return slots
      .filter(s => s.completed >= since && s.status === 'Completed')
      .reduce((acc, s) => {
        const mb = parseFloat(s.size)
        return acc + (isNaN(mb) ? 0 : mb)
      }, 0)
  }

  const dayMb   = sumMb(history, now - DAY)
  const weekMb  = sumMb(history, now - WEEK)
  const monthMb = sumMb(history, now - MONTH)
  const totalMb = sumMb(history, 0)

  const hourly = Array.from({ length: 24 }, (_, i) => {
    const from = now - DAY + i * 3600
    const to   = from + 3600
    return history
      .filter(s => s.completed >= from && s.completed < to && s.status === 'Completed')
      .reduce((acc, s) => acc + (parseFloat(s.size) || 0), 0)
  })
  const maxHourly = Math.max(...hourly, 1)

  const statCards = [
    { icon: Calendar,     label: t.stat_today,      mb: dayMb,   color: 'text-cyan-400'   },
    { icon: BarChart2,    label: t.stat_this_week,  mb: weekMb,  color: 'text-violet-400' },
    { icon: TrendingDown, label: t.stat_this_month, mb: monthMb, color: 'text-emerald-400' },
    { icon: Zap,          label: t.stat_total,      mb: totalMb, color: 'text-amber-400'  },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black">{t.stat_title}</h1>
        <p className="text-slate-400 mt-1 text-sm">
          {loading
            ? t.stat_subtitle_loading
            : `${t.stat_subtitle_entries} ${history.length} ${t.stat_subtitle_history}`
          }
        </p>
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

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="text-xs uppercase tracking-widest text-slate-500 mb-4">{t.stat_hourly_title}</div>
        {loading ? (
          <div className="text-slate-500 text-sm">{t.common_loading}</div>
        ) : (
          <>
            <div className="flex items-end gap-0.5 h-32">
              {hourly.map((v, i) => {
                const pct = maxHourly > 0 ? (v / maxHourly) * 100 : 0
                const hour = new Date((now - DAY + i * 3600) * 1000).getHours()
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {v > 0 && (
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-xs text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                        {hour}h: {formatBytes(v)}
                      </div>
                    )}
                    <div className="w-full rounded-sm" style={{
                      height: `${Math.max(pct, v > 0 ? 4 : 1)}%`,
                      backgroundColor: v > 0 ? 'var(--accent)' : '#1e293b'
                    }} />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between text-xs text-slate-600 mt-2">
              <span>{t.stat_24h_ago}</span><span>{t.stat_now}</span>
            </div>
          </>
        )}
      </div>

      {servers.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="text-xs uppercase tracking-widest text-slate-500 mb-4">{t.stat_servers_title}</div>
          <div className="space-y-4">
            {servers.map((srv: any) => {
              const bps = parseInt(srv.serverbps ?? '0') / 1024
              return (
                <div key={srv.servername}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300 truncate">{srv.servername}</span>
                    <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
                      <span className={srv.serveractive ? 'text-emerald-400' : 'text-red-400'}>
                        {srv.serveractive ? t.stat_active : t.stat_inactive}
                      </span>
                      <span>{srv.serveractiveconn}/{srv.servertotalconn} {t.stat_connections}</span>
                      {bps > 0 && <span>{bps.toFixed(1)} KB/s</span>}
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-400" style={{
                      width: srv.servertotalconn > 0 ? `${(srv.serveractiveconn / srv.servertotalconn) * 100}%` : '0%'
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
