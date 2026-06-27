import { useStatus } from '../hooks/useSab'
import { usePrefs } from '../hooks/usePrefs'
import { WifiOff, Loader } from 'lucide-react'

export function ConnectionStatus() {
  const { connected } = useStatus()
  const { t } = usePrefs()

  if (connected === null) return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500">
      <Loader size={12} className="animate-spin" />
      <span>{t.conn_connecting}</span>
    </div>
  )

  if (!connected) return (
    <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
      <WifiOff size={12} />
      <span>{t.conn_unreachable}</span>
    </div>
  )

  return (
    <div className="flex items-center gap-1.5 text-xs text-emerald-400">
      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span>{t.conn_connected}</span>
    </div>
  )
}
