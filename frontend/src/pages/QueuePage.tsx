import { useState, useMemo } from 'react'
import { Pause, Play, Trash2, ChevronUp, ChevronDown, FileText, Edit2, X, Check, Search, Clock, ArrowUpDown, Tag } from 'lucide-react'
import { useQueue } from '../hooks/useSab'
import { NzbDropzone } from '../components/NzbDropzone'
import { AddNzbModal } from '../components/AddNzbModal'
import { JobFilesModal } from '../components/JobFilesModal'
import { CatBadge } from '../components/useCategoryColors'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useToast } from '../hooks/useToast'
import type { QueueSlot } from '../hooks/useSab'

const PRIORITIES: Record<string, string> = { '-100': 'Default', '-2': 'Pause', '-1': 'Low', '0': 'Normal', '1': 'High', '2': 'Force' }
const PRIO_COLORS: Record<string, string> = { '2': 'text-red-400', '1': 'text-amber-400', '0': 'text-slate-400', '-1': 'text-blue-400', '-2': 'text-slate-500' }
const SORT_OPTIONS = [
  { v: 'default', l: 'Ordre queue' },
  { v: 'name', l: 'Nom' },
  { v: 'size', l: 'Taille' },
  { v: 'progress', l: 'Progression' },
  { v: 'priority', l: 'Priorite' },
  { v: 'cat', l: 'Categorie' },
]
const PAUSE_DURATIONS = [15, 30, 60, 120, 240]

export function QueuePage() {
  const { data, error, pause, resume, pauseTimed, pauseJob, resumeJob, deleteJob, moveJob,
    changeCat, renameJob, purge, setPrioAll, setSpeed } = useQueue()
  const { toast } = useToast()
  const [confirmPurgeFiles, setConfirmPurgeFiles] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [filesFor, setFilesFor] = useState<string | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameVal, setRenameVal] = useState('')
  const [speedVal, setSpeedVal] = useState('')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [sortAsc, setSortAsc] = useState(true)
  const [showPauseMenu, setShowPauseMenu] = useState(false)
  const [showPurgeMenu, setShowPurgeMenu] = useState(false)
  const [showPrioMenu, setShowPrioMenu] = useState(false)
  const [changingCat, setChangingCat] = useState<string | null>(null)
  const [catVal, setCatVal] = useState('')

  const sortedSlots = useMemo(() => {
    if (!data) return []
    let slots: QueueSlot[] = [...(data.slots ?? [])]
    if (search) slots = slots.filter(s =>
      s.filename.toLowerCase().includes(search.toLowerCase()) ||
      s.cat.toLowerCase().includes(search.toLowerCase())
    )
    if (sortBy !== 'default') {
      slots.sort((a, b) => {
        let va: any = '', vb: any = ''
        if (sortBy === 'name')     { va = a.filename.toLowerCase(); vb = b.filename.toLowerCase() }
        if (sortBy === 'size')     { va = parseFloat(a.size); vb = parseFloat(b.size) }
        if (sortBy === 'progress') { va = parseFloat(a.percentage); vb = parseFloat(b.percentage) }
        if (sortBy === 'priority') { va = parseInt(a.priority); vb = parseInt(b.priority) }
        if (sortBy === 'cat')      { va = a.cat.toLowerCase(); vb = b.cat.toLowerCase() }
        return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
      })
    }
    return slots
  }, [data, search, sortBy, sortAsc])

  const run = async (action: () => Promise<any>, successMsg?: string) => {
    try {
      await action()
      if (successMsg) toast(successMsg, 'success')
    } catch {
      toast('Une erreur est survenue', 'error')
    }
  }

  if (error) return <div className="text-red-400 p-4">{error}</div>
  if (!data)  return <div className="text-slate-500 p-4">Chargement...</div>

  const startRename = (slot: QueueSlot) => { setRenaming(slot.nzo_id); setRenameVal(slot.filename) }
  const confirmRenameJob = (id: string) => { run(() => renameJob(id, renameVal), 'Job renomme'); setRenaming(null) }
  const pauseInt = data.pause_int ? parseInt(data.pause_int) : 0

  return (
    <div className="space-y-4" onClick={() => { setShowPauseMenu(false); setShowPurgeMenu(false); setShowPrioMenu(false) }}>
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-4xl font-black">Queue</h1>
          <p className="text-slate-400 mt-1 text-sm">
            {data.noofslots} job(s) - {data.sizeleft} restants
            {data.paused && pauseInt > 0 && <span className="text-amber-400 ml-2">(pause {pauseInt} min)</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2" onClick={e => e.stopPropagation()}>
          <div className="flex gap-1">
            <input value={speedVal} onChange={e => setSpeedVal(e.target.value)} placeholder="%" type="number" min="0" max="100"
              className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none" />
            <button onClick={() => { setSpeed(parseInt(speedVal) || 0); setSpeedVal('') }}
              className="px-2 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs">%</button>
          </div>

          <div className="relative">
            <div className="flex">
              {data.paused
                ? <button onClick={() => run(resume, 'Telechargements repris')} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm font-semibold">Reprendre</button>
                : <button onClick={() => run(pause, 'Telechargements en pause')} className="px-3 py-1.5 rounded-l-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-sm font-semibold">Pause</button>
              }
              {!data.paused && (
                <button onClick={e => { e.stopPropagation(); setShowPauseMenu(!showPauseMenu) }}
                  className="px-2 py-1.5 rounded-r-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-l border-amber-500/20">
                  <Clock size={12} />
                </button>
              )}
            </div>
            {showPauseMenu && !data.paused && (
              <div className="absolute top-full mt-1 right-0 bg-slate-900 border border-slate-700 rounded-xl p-2 z-20 min-w-36">
                {PAUSE_DURATIONS.map(m => (
                  <button key={m} onClick={() => { run(() => pauseTimed(m), `Pause de ${m} min activee`); setShowPauseMenu(false) }}
                    className="flex w-full text-left px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800 rounded-lg">
                    Pause {m} min
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={e => { e.stopPropagation(); setShowPrioMenu(!showPrioMenu) }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm">
              <ArrowUpDown size={13} /> Priorite
            </button>
            {showPrioMenu && (
              <div className="absolute top-full mt-1 right-0 bg-slate-900 border border-slate-700 rounded-xl p-2 z-20 min-w-40">
                {[['2','Force'], ['1','Haute'], ['0','Normale'], ['-1','Basse'], ['-2','Pause']].map(([v, l]) => (
                  <button key={v} onClick={() => { run(() => setPrioAll(parseInt(v)), `Priorite globale: ${l}`); setShowPrioMenu(false) }}
                    className="flex w-full text-left px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800 rounded-lg">
                    Tout en {l}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => setShowAdd(true)} className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-sm font-semibold">+ Ajouter</button>

          {sortedSlots.length > 0 && (
            <div className="relative">
              <button onClick={e => { e.stopPropagation(); setShowPurgeMenu(!showPurgeMenu) }}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-semibold">
                Vider
              </button>
              {showPurgeMenu && (
                <div className="absolute top-full mt-1 right-0 bg-slate-900 border border-slate-700 rounded-xl p-2 z-20 min-w-48">
                  <button onClick={() => { run(() => purge(0), 'Queue videe'); setShowPurgeMenu(false) }}
                    className="flex w-full text-left px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800 rounded-lg">
                    Vider (garder fichiers)
                  </button>
                  <button onClick={() => { setConfirmPurgeFiles(true); setShowPurgeMenu(false) }}
                    className="flex w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-slate-800 rounded-lg">
                    Vider + supprimer fichiers
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher dans la queue..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
          {SORT_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
        {sortBy !== 'default' && (
          <button onClick={() => setSortAsc(!sortAsc)}
            className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs">
            {sortAsc ? 'A-Z' : 'Z-A'}
          </button>
        )}
      </div>

      {sortedSlots.length === 0 ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center text-slate-500">Queue vide</div>
          <NzbDropzone />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
          <div className="divide-y divide-slate-800/50">
            {sortedSlots.map((slot, idx) => {
              const pct = parseFloat(slot.percentage) || 0
              const isPaused = slot.status === 'Paused'
              const isRenaming = renaming === slot.nzo_id
              const isChangingCat = changingCat === slot.nzo_id
              return (
                <div key={slot.nzo_id} className="p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col gap-1 shrink-0 mt-1">
                      <button onClick={() => moveJob(slot.nzo_id, idx - 1)} disabled={idx === 0 || sortBy !== 'default'}
                        className="text-slate-600 hover:text-slate-300 disabled:opacity-20"><ChevronUp size={14} /></button>
                      <button onClick={() => moveJob(slot.nzo_id, idx + 1)} disabled={idx === sortedSlots.length - 1 || sortBy !== 'default'}
                        className="text-slate-600 hover:text-slate-300 disabled:opacity-20"><ChevronDown size={14} /></button>
                    </div>
                    <div className="flex-1 min-w-0">
                      {isRenaming ? (
                        <div className="flex gap-2 mb-1">
                          <input autoFocus value={renameVal} onChange={e => setRenameVal(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') confirmRenameJob(slot.nzo_id); if (e.key === 'Escape') setRenaming(null) }}
                            className="flex-1 bg-slate-800 border border-cyan-500 rounded-lg px-3 py-1 text-sm text-white focus:outline-none" />
                          <button onClick={() => confirmRenameJob(slot.nzo_id)} className="text-emerald-400"><Check size={16} /></button>
                          <button onClick={() => setRenaming(null)} className="text-slate-500"><X size={16} /></button>
                        </div>
                      ) : (
                        <div className="text-sm font-medium truncate mb-1">{slot.filename}</div>
                      )}
                      {isChangingCat ? (
                        <div className="flex gap-2 mb-1">
                          <input autoFocus value={catVal} onChange={e => setCatVal(e.target.value)} placeholder="Categorie"
                            onKeyDown={e => { if (e.key === 'Enter') { run(() => changeCat(slot.nzo_id, catVal), 'Categorie modifiee'); setChangingCat(null) } if (e.key === 'Escape') setChangingCat(null) }}
                            className="flex-1 bg-slate-800 border border-cyan-500 rounded-lg px-3 py-1 text-sm text-white focus:outline-none" />
                          <button onClick={() => { run(() => changeCat(slot.nzo_id, catVal), 'Categorie modifiee'); setChangingCat(null) }} className="text-emerald-400"><Check size={16} /></button>
                          <button onClick={() => setChangingCat(null)} className="text-slate-500"><X size={16} /></button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                          <span className={isPaused ? 'text-amber-400' : 'text-emerald-400'}>{slot.status}</span>
                          <span>{slot.sizeleft} / {slot.size}</span>
                          <span>ETA: {slot.timeleft}</span>
                          <CatBadge cat={slot.cat} />
                          <span className={PRIO_COLORS[slot.priority] ?? ''}>{PRIORITIES[slot.priority] ?? slot.priority}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => setFilesFor(slot.nzo_id)} title="Fichiers"
                        className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-800"><FileText size={14} /></button>
                      <button onClick={() => startRename(slot)} title="Renommer"
                        className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-800"><Edit2 size={14} /></button>
                      <button onClick={() => { setChangingCat(slot.nzo_id); setCatVal(slot.cat) }} title="Categorie"
                        className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-800"><Tag size={14} /></button>
                      <button onClick={() => run(() => isPaused ? resumeJob(slot.nzo_id) : pauseJob(slot.nzo_id))}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-amber-400 hover:bg-slate-800">
                        {isPaused ? <Play size={14} /> : <Pause size={14} />}
                      </button>
                      <button onClick={() => setConfirmDeleteId(slot.nzo_id)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-slate-800"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-cyan-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-slate-600 text-right">{pct.toFixed(1)}%</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {showAdd && <AddNzbModal onClose={() => setShowAdd(false)} />}
      {filesFor && <JobFilesModal nzo_id={filesFor} onClose={() => setFilesFor(null)} />}

      {confirmPurgeFiles && (
        <ConfirmDialog
          title="Vider la queue"
          message="Tous les jobs seront supprimes de la queue ET leurs fichiers temporaires seront effaces du disque. Cette action est irreversible."
          confirmLabel="Vider et supprimer"
          onConfirm={() => { run(() => purge(1), 'Queue videe et fichiers supprimes'); setConfirmPurgeFiles(false) }}
          onCancel={() => setConfirmPurgeFiles(false)}
        />
      )}

      {confirmDeleteId && (
        <ConfirmDialog
          title="Supprimer le job"
          message="Ce job sera retire de la queue et ses fichiers temporaires seront supprimes."
          confirmLabel="Supprimer"
          onConfirm={() => { run(() => deleteJob(confirmDeleteId), 'Job supprime'); setConfirmDeleteId(null) }}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  )
}
