import { motion } from 'framer-motion'

interface Props {
  kbpersec: string
  speedlimit: string
}

export function SpeedWidget({ kbpersec, speedlimit }: Props) {
  const speed = parseFloat(kbpersec) / 1024
  const limit = parseFloat(speedlimit) || 100
  const pct = Math.min((speed / (limit * 10)) * 100, 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-cyan-500/10 bg-slate-900/70 p-8"
    >
      <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Vitesse actuelle</div>
      <div className="mt-6 text-7xl font-black tracking-tighter">
        {speed.toFixed(2)}
      </div>
      <div className="mt-2 text-cyan-400 font-semibold">MB/s</div>
      <div className="mt-8 h-2 overflow-hidden rounded-full bg-slate-800">
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 80 }}
          className="h-full rounded-full bg-cyan-400"
        />
      </div>
      <div className="mt-2 text-xs text-slate-500">Limite : {speedlimit}%</div>
    </motion.div>
  )
}
