import { useState } from 'react'
import { CheckCircle, XCircle, Clock, Trash2, RefreshCw, Search, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { useHistory } from '../hooks/useSab'

const STATUS_COLORS: Record<string, string> = {
  Completed: 'text-emerald-400', Failed: 'text-red-400',
  Extracting: 'text-cyan-400', Moving: 'text-blue-400',
}

export function HistoryPage() {
  const { data, error, loading, refresh, deleteItem, retryItem, retryAll } = useHistory(200)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [retryingAll, setRetryingAll] = useState(false)

  const filtered = data.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
  const failedCount = data.filter(s => s.status === 'Failed').length

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try { await deleteItem(id) } catch {}
    setDeleting(null)
  }

  const handleRetryAll = async () => {
    setRetryingAll(true)
    try { await retryAll() } catch {}
    setRetryingAll(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-4xl font-black">Historique</h1>
          <p className="text-slate-400 mt-1 text-sm">{data.length} entrees{failedCount > 0 && <span className="text-red-400 ml-2">({failedCount} echec(s))</span>}</p>
        </div>
        <div className="flex gap-2">
          {failedCount > 0 && (
            <button onClick={handleRetryAll} disabled={retryingAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-sm font-semibold disabled:opacity-50">
              <RotateCcw size={14} className={retryingAll ? 'animate-spin' : ''} />
              Relancer tous les echecs
            </button>
          )}
          <button onClick={refresh} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500" />
      </div>

      {error && <div className="text-red-400">{error}</div>}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        {filtered.length === 0
          ? <div className="p-8 text-center text-slate-500">Aucun resultat</div>
          : (
            <div className="divide-y divide-slate-800/50">
              {filtered.map(slot => {
                const ok = slot.status === 'Completed'
                const failed = slot.status === 'Failed'
                const date = new Date(slot.completed * 1000).toLocaleString('fr-FR')
                const color = STATUS_COLORS[slot.status] ?? 'text-slate-400'
                const isDeleting = deleting === slot.nzo_id
                const isExpanded = expanded === slot.nzo_id
                const logs = slot.stage_log ?? []
                return (
                  <div key={slot.nzo_id} className={`transition-opacity ${isDeleting ? 'opacity-40' : ''}`}>
                    <div className="px-6 py-4 flex items-center gap-4">
                      {ok
                        ? <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                        : <XCircle size={16} className="text-red-400 shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{slot.name}</div>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-1">
                          <span className={color}>{slot.status}</span>
                          <span>{slot.cat}</span>
                          <span>{slot.size}</span>
                          {slot.fail_message && <span className="text-red-400 truncate max-w-xs">{slot.fail_message}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-xs text-slate-500 items-center gap-1 hidden sm:flex">
                          <Clock size={11} />{date}
                        </div>
                        {logs.length > 0 && (
                          <button onClick={() => setExpanded(isExpanded ? null : slot.nzo_id)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-800">
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        )}
                        {failed && (
                          <button onClick={() => retryItem(slot.nzo_id)} title="Relancer"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-amber-400 hover:bg-slate-800">
                            <RotateCcw size={14} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(slot.nzo_id)} disabled={isDeleting}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-slate-800 disabled:opacity-40">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {isExpanded && logs.length > 0 && (
                      <div className="border-t border-slate-800 bg-slate-950/50 px-6 py-4 space-y-3">
                        {logs.map((stage: any, i: number) => (
                          <div key={i}>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{stage.name}</div>
                            <div className="space-y-0.5">
                              {(stage.actions ?? []).map((action: string, j: number) => (
                                <div key={j} className={`text-xs font-mono px-3 py-0.5 rounded ${ action.toLowerCase().includes('fail') || action.toLowerCase().includes('error') ? 'text-red-400 bg-red-500/5' : action.toLowerCase().includes('warning') ? 'text-amber-400 bg-amber-500/5' : 'text-slate-400' }`}>
                                  {action}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        }
      </div>
    </div>
  )
}
