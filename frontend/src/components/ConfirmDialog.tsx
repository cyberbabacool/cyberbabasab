import { AlertTriangle, X } from 'lucide-react'
import { usePrefs } from '../hooks/usePrefs'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  title, message, confirmLabel, cancelLabel,
  danger = true, onConfirm, onCancel
}: ConfirmDialogProps) {
  const { t } = usePrefs()
  const confirm = confirmLabel ?? t.common_confirm
  const cancel  = cancelLabel  ?? t.common_cancel

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onCancel}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl shrink-0 ${danger ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
            <AlertTriangle size={20} className={danger ? 'text-red-400' : 'text-amber-400'} />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-white">{title}</div>
            <div className="text-sm text-slate-400 mt-1">{message}</div>
          </div>
          <button onClick={onCancel} className="text-slate-500 hover:text-white shrink-0"><X size={16} /></button>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-semibold">
            {cancel}
          </button>
          <button onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-semibold ${ danger ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20' }`}>
            {confirm}
          </button>
        </div>
      </div>
    </div>
  )
}
