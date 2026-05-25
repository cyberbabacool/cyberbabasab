import { Trash2 } from 'lucide-react'
import type { QueueSlot } from '../hooks/useSab'

interface Props {
  slots: QueueSlot[]
  onDelete: (id: string) => void
}

export function QueueTable({ slots, onDelete }: Props) {
  if (slots.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-700/40 bg-slate-900/70 p-8 text-center text-slate-500">
        Aucun telechargement en cours
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-slate-700/40 bg-slate-900/70 overflow-hidden">
      <div className="px-8 py-4 border-b border-slate-800">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-500">File d'attente</div>
      </div>
      <div className="divide-y divide-slate-800">
        {slots.map(slot => {
          const pct = parseFloat(slot.percentage) || 0
          return (
            <div key={slot.nzo_id} className="px-8 py-4 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{slot.filename}</div>
                  <div className="text-xs text-slate-500 mt-1 flex gap-4">
                    <span>{slot.cat}</span>
                    <span>{slot.sizeleft} restants / {slot.size}</span>
                    <span>ETA : {slot.timeleft}</span>
                    <span className={`font-semibold ${slot.status === 'Downloading' ? 'text-cyan-400' : 'text-amber-400'}`}>
                      {slot.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(slot.nzo_id)}
                  className="text-slate-600 hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="text-xs text-slate-600 text-right">{pct.toFixed(1)}%</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
