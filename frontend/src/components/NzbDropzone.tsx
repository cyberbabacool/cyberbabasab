import { useState, useCallback } from 'react'
import { Upload, CheckCircle, XCircle, Loader } from 'lucide-react'
import axios from 'axios'

interface Result { filename: string; status: 'ok' | 'error'; message?: string }

export function NzbDropzone() {
  const [dragging, setDragging] = useState(false)
  const [results, setResults] = useState<Result[]>([])
  const [uploading, setUploading] = useState(false)

  const uploadFile = async (file: File): Promise<Result> => {
    if (!file.name.toLowerCase().endsWith('.nzb'))
      return { filename: file.name, status: 'error', message: 'Pas un .nzb' }
    const form = new FormData()
    form.append('nzbfile', file)
    try {
      const res = await axios.post('/api/addnzb', form)
      const ok = res.data?.status === true || (res.data?.nzo_ids?.length ?? 0) > 0
      return { filename: file.name, status: ok ? 'ok' : 'error', message: ok ? undefined : 'Echec ajout' }
    } catch (e: any) {
      return { filename: file.name, status: 'error', message: e.message }
    }
  }

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files)
    if (!arr.length) return
    setUploading(true)
    const res = await Promise.all(arr.map(uploadFile))
    setResults(prev => [...res, ...prev].slice(0, 10))
    setUploading(false)
  }, [])

  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }

  return (
    <div className="space-y-3">
      <label onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop}
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-colors ${
          dragging ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-700 bg-slate-900/30 hover:border-slate-500'
        }`}>
        <input type="file" accept=".nzb" multiple className="hidden" onChange={e => { if (e.target.files) handleFiles(e.target.files); e.target.value = '' }} />
        {uploading ? <Loader size={28} className="text-cyan-400 animate-spin" /> : <Upload size={28} className={dragging ? 'text-cyan-400' : 'text-slate-500'} />}
        <div className="text-center">
          <div className={`font-semibold text-sm ${dragging ? 'text-cyan-400' : 'text-slate-300'}`}>
            {uploading ? 'Envoi en cours...' : 'Deposez vos fichiers NZB ici'}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">ou cliquez pour parcourir - multi-fichiers supporte</div>
        </div>
      </label>
      {results.length > 0 && (
        <div className="space-y-1.5">
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-slate-900/70 border border-slate-800 px-4 py-2.5">
              {r.status === 'ok' ? <CheckCircle size={14} className="text-emerald-400 shrink-0" /> : <XCircle size={14} className="text-red-400 shrink-0" />}
              <span className="text-sm truncate flex-1">{r.filename}</span>
              {r.message && <span className="text-xs text-red-400">{r.message}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
