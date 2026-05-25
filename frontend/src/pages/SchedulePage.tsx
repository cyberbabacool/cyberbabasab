import { useState, useEffect } from 'react'
import { Clock, Plus, Trash2 } from 'lucide-react'
import { useConfig } from '../hooks/useSab'
import axios from 'axios'

const ACTIONS = ['resume', 'pause', 'shutdown', 'restart', 'speedlimit', 'pause_all', 'resume_all']
const DAYS = ['Every day', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function SchedulePage() {
  const { data } = useConfig()
  const [schedules, setSchedules] = useState<string[]>([])
  const [hour, setHour] = useState('00')
  const [minute, setMinute] = useState('00')
  const [day, setDay] = useState('0')
  const [action, setAction] = useState('pause')
  const [param, setParam] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const raw = data?.config?.scheduling?.schedlines
    if (raw) setSchedules(Array.isArray(raw) ? raw : [raw])
  }, [data])

  const parseSchedule = (s: string) => {
    const parts = s.trim().split(' ')
    return { minute: parts[0], hour: parts[1], day: parts[2], action: parts[3], param: parts[4] ?? '' }
  }

  const addSchedule = () => {
    const line = `${minute} ${hour} ${day} ${action}${param ? ' ' + param : ''}`
    setSchedules(prev => [...prev, line])
  }

  const removeSchedule = (i: number) => {
    setSchedules(prev => prev.filter((_, idx) => idx !== i))
  }

  const save = async () => {
    const joined = schedules.join('|')
    await axios.get(`/api/config/save?section=scheduling&keyword=schedlines&value=${encodeURIComponent(joined)}`)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black">Planning</h1>
        <p className="text-slate-400 mt-1">Taches programmees</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
        <div className="text-xs uppercase tracking-widest text-slate-500">Ajouter une tache</div>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <div className="text-xs text-slate-500 mb-1">Heure</div>
            <input type="number" min="0" max="23" value={hour} onChange={e => setHour(e.target.value.padStart(2,'0'))}
              className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Minute</div>
            <input type="number" min="0" max="59" value={minute} onChange={e => setMinute(e.target.value.padStart(2,'0'))}
              className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Jour</div>
            <select value={day} onChange={e => setDay(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Action</div>
            <select value={action} onChange={e => setAction(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
              {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          {action === 'speedlimit' && (
            <div>
              <div className="text-xs text-slate-500 mb-1">Valeur %</div>
              <input type="number" value={param} onChange={e => setParam(e.target.value)} placeholder="0-100"
                className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
            </div>
          )}
          <button onClick={addSchedule} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-sm font-semibold">
            <Plus size={14} /> Ajouter
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        {schedules.length === 0
          ? <div className="p-8 text-center text-slate-500">Aucune tache planifiee</div>
          : (
            <div className="divide-y divide-slate-800/50">
              {schedules.map((s, i) => {
                const p = parseSchedule(s)
                return (
                  <div key={i} className="px-6 py-4 flex items-center gap-4">
                    <Clock size={16} className="text-cyan-400 shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{DAYS[parseInt(p.day)] ?? p.day} a {p.hour}:{p.minute}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{p.action}{p.param ? ' - ' + p.param : ''}</div>
                    </div>
                    <button onClick={() => removeSchedule(i)} className="text-slate-600 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                )
              })}
            </div>
          )
        }
      </div>

      {schedules.length > 0 && (
        <button onClick={save} className="px-6 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 font-semibold text-sm">
          {saved ? 'Sauvegarde !' : 'Sauvegarder le planning'}
        </button>
      )}
    </div>
  )
}
