import { useState } from 'react'
import { Pause, Play, Trash2, ChevronUp, ChevronDown, Tag, FileText, Edit2, X, Check } from 'lucide-react'
import { useQueue } from '../hooks/useSab'
import { NzbDropzone } from '../components/NzbDropzone'
import { AddNzbModal } from '../components/AddNzbModal'
import { JobFilesModal } from '../components/JobFilesModal'
import type { QueueSlot } from '../hooks/useSab'

const PRIORITIES: Record<string, string> = { '-100': 'Default', '-2': 'Paused', '-1': 'Low', '0': 'Normal', '1': 'High', '2': 'Force' }
const PRIORITY_COLORS: Record<string, string> = { '-2': 'text-slate-500', '-1': 'text-blue-400', '0': 'text-slate-300', '1': 'text-amber-400', '2': 'text-red-400' }

export function QueuePage() {
  const { data, error, pause, resume, pauseJob, resumeJob, deleteJob, moveJob, renameJob, purge, setSpeed } = useQueue()
  const [showAdd, setShowAdd] = useState(false)
  const [filesFor, setFilesFor] = useState<string | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameVal, setRenameVal] = useState('')
  const [speedVal, setSpeedVal] = useState('')

  if (error) return <div className="text-red-400 p-4">{error}</div>
  if (!data)  return <div className="text-slate-500 p-4">Chargement...</div>

  const slots: QueueSlot[] = data.slots ?? []

  const startRename = (slot: QueueSlot) => { setRenaming(slot.nzo_id); setRenameVal(slot.filename) }
  const confirmRename = (id: string) => { renameJob(id, renameVal); setRenaming(null) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">Queue</h1>
          <p className="text-slate-400 mt-1">{data.noofslots} job(s) - {data.sizeleft} restants</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <div className="flex gap-1">
            <input value={speedVal} onChange={e => setSpeedVal(e.target.value)} placeholder="Limite %" type="number" min="0" max="100"
              className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
            <button onClick={() => { setSpeed(parseInt(speedVal) || 0); setSpeedVal('') }}
              className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm">OK</button>
          </div>
          {data.paused
            ? <button onClick={resume} className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm font-semibold">Reprendre tout</button>
            : <button onClick={pause}  className="px-4 py-2 rounded-xl bg-amber-500/10  text-amber-400  hover:bg-amber-500/20  text-sm font-semibold">Pause tout</button>
          }
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-sm font-semibold">+ Ajouter NZB</button>
          {slots.length > 0 && <button onClick={purge} className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-semibold">Vider queue</button>}
        </div>
      </div>

      {slots.length === 0
        ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-12 text-center text-slate-500">Queue vide</div>
            <NzbDropzone />
          </div>
        )
        : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
            <div className="divide-y divide-slate-800/50">
              {slots.map((slot, idx) => {
                const pct = parseFloat(slot.percentage) || 0
                const isRenaming = renaming === slot.nzo_id
                const isPaused = slot.status === 'Paused'
                return (
                  <div key={slot.nzo_id} className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-1 shrink-0 mt-1">
                        <button onClick={() => moveJob(slot.nzo_id, idx - 1)} disabled={idx === 0}
                          className="text-slate-600 hover:text-slate-300 disabled:opacity-20"><ChevronUp size={14} /></button>
                        <button onClick={() => moveJob(slot.nzo_id, idx + 1)} disabled={idx === slots.length - 1}
                          className="text-slate-600 hover:text-slate-300 disabled:opacity-20"><ChevronDown size={14} /></button>
                      </div>
                      <div className="flex-1 min-w-0">
                        {isRenaming
                          ? (
                            <div className="flex gap-2 mb-1">
                              <input autoFocus value={renameVal} onChange={e => setRenameVal(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') confirmRename(slot.nzo_id); if (e.key === 'Escape') setRenaming(null) }}
                                className="flex-1 bg-slate-800 border border-cyan-500 rounded-lg px-3 py-1 text-sm text-white focus:outline-none" />
                              <button onClick={() => confirmRename(slot.nzo_id)} className="text-emerald-400 hover:text-emerald-300"><Check size={16} /></button>
                              <button onClick={() => setRenaming(null)} className="text-slate-500 hover:text-slate-300"><X size={16} /></button>
                            </div>
                          )
                          : <div className="text-sm font-medium truncate mb-1">{slot.filename}</div>
                        }
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                          <span className={isPaused ? 'text-amber-400' : 'text-emerald-400'}>{slot.status}</span>
                          <span>{slot.sizeleft} / {slot.size}</span>
                          <span>ETA: {slot.timeleft}</span>
                          <span className="flex items-center gap-1"><Tag size={11} />{slot.cat || 'Default'}</span>
                          <span className={PRIORITY_COLORS[slot.priority] ?? 'text-slate-400'}>{PRIORITIES[slot.priority] ?? slot.priority}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => setFilesFor(slot.nzo_id)} title="Fichiers"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-800"><FileText size={14} /></button>
                        <button onClick={() => startRename(slot)} title="Renommer"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-800"><Edit2 size={14} /></button>
                        <button onClick={() => isPaused ? resumeJob(slot.nzo_id) : pauseJob(slot.nzo_id)} title={isPaused ? 'Reprendre' : 'Pause'}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-amber-400 hover:bg-slate-800">
                          {isPaused ? <Play size={14} /> : <Pause size={14} />}
                        </button>
                        <button onClick={() => deleteJob(slot.nzo_id)} title="Supprimer"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-slate-800"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-cyan-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="text-xs text-slate-600 text-right">{pct.toFixed(1)}%</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      }

      {showAdd && <AddNzbModal onClose={() => setShowAdd(false)} />}
      {filesFor && <JobFilesModal nzo_id={filesFor} onClose={() => setFilesFor(null)} />}
    </div>
  )
}
