import { useState } from 'react'
import { X, Link, HardDrive, Upload } from 'lucide-react'
import axios from 'axios'

interface Props { onClose: () => void }

export function AddNzbModal({ onClose }: Props) {
  const [tab, setTab] = useState<'url' | 'local'>('url')
  const [url, setUrl] = useState('')
  const [local, setLocal] = useState('')
  const [cat, setCat] = useState('')
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  const submit = async () => {
    try {
      if (tab === 'url') {
        await axios.get(`/api/addurl?url=${encodeURIComponent(url)}&cat=${encodeURIComponent(cat)}`)
      } else {
        await axios.get(`/api/addlocal?name=${encodeURIComponent(local)}&cat=${encodeURIComponent(cat)}`)
      }
      setStatus('ok')
      setMsg('Ajoute avec succes !')
      setTimeout(onClose, 1500)
    } catch (e: any) {
      setStatus('error')
      setMsg(e.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="text-lg font-bold">Ajouter un NZB</div>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex gap-2">
            {([['url', 'Par URL', Link], ['local', 'Chemin local', HardDrive]] as const).map(([key, label, Icon]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  tab === key ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}>
                <Icon size={14} />{label}
              </button>
            ))}
          </div>
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-widest block mb-2">
              {tab === 'url' ? 'URL du NZB' : 'Chemin complet du fichier'}
            </label>
            <input value={tab === 'url' ? url : local}
              onChange={e => tab === 'url' ? setUrl(e.target.value) : setLocal(e.target.value)}
              placeholder={tab === 'url' ? 'https://...' : '/chemin/vers/fichier.nzb'}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-widest block mb-2">Categorie (optionnel)</label>
            <input value={cat} onChange={e => setCat(e.target.value)} placeholder="Default"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500" />
          </div>
          {msg && (
            <div className={`text-sm px-4 py-2 rounded-xl ${status === 'ok' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{msg}</div>
          )}
          <button onClick={submit}
            className="w-full py-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 font-semibold text-sm flex items-center justify-center gap-2">
            <Upload size={16} /> Ajouter
          </button>
        </div>
      </div>
    </div>
  )
}
