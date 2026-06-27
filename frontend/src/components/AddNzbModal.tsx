import { useState, useRef } from 'react'
import { X, Link, Upload, FileText } from 'lucide-react'
import axios from 'axios'
import { usePrefs } from '../hooks/usePrefs'

interface Props { onClose: () => void }

export function AddNzbModal({ onClose }: Props) {
  const { t } = usePrefs()
  const [tab, setTab] = useState<'url' | 'file'>('url')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [cat, setCat] = useState('')
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const submit = async () => {
    try {
      if (tab === 'url') {
        if (!url) { setStatus('error'); setMsg(t.addnzb_error_url); return }
        await axios.get(`/api/addurl?url=${encodeURIComponent(url)}&cat=${encodeURIComponent(cat)}`)
      } else {
        if (!file) { setStatus('error'); setMsg(t.addnzb_error_file); return }
        const formData = new FormData()
        formData.append('nzbfile', file)
        if (cat) formData.append('cat', cat)
        await axios.post('/api/addnzb', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      setStatus('ok')
      setMsg(t.addnzb_success)
      setTimeout(onClose, 1500)
    } catch (e: any) {
      setStatus('error')
      setMsg(e.response?.data?.error ?? e.message)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="text-lg font-bold">{t.addnzb_title}</div>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex gap-2">
            {([['url', t.addnzb_tab_url, Link], ['file', t.addnzb_tab_file, Upload]] as const).map(([key, label, Icon]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  tab === key ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}>
                <Icon size={14} />{label}
              </button>
            ))}
          </div>

          {tab === 'url' ? (
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-widest block mb-2">{t.addnzb_url_label}</label>
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-cyan-500" />
            </div>
          ) : (
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-widest block mb-2">{t.addnzb_file_label}</label>
              <input ref={fileInputRef} type="file" accept=".nzb" onChange={handleFileChange} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 bg-slate-800 border border-slate-700 border-dashed rounded-xl px-4 py-3 text-sm text-slate-300 hover:border-cyan-500 hover:text-white transition-colors">
                <FileText size={16} className="shrink-0" />
                {file ? (
                  <span className="truncate">{file.name}</span>
                ) : (
                  <span className="text-slate-500">{t.addnzb_browse_placeholder}</span>
                )}
              </button>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-500 uppercase tracking-widest block mb-2">{t.addnzb_cat_label}</label>
            <input value={cat} onChange={e => setCat(e.target.value)} placeholder="Default"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500" />
          </div>

          {msg && (
            <div className={`text-sm px-4 py-2 rounded-xl ${status === 'ok' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{msg}</div>
          )}

          <button onClick={submit}
            className="w-full py-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 font-semibold text-sm flex items-center justify-center gap-2">
            <Upload size={16} /> {t.addnzb_submit}
          </button>
        </div>
      </div>
    </div>
  )
}
