import { useState, useEffect } from 'react'
import { X, FileText, Loader } from 'lucide-react'
import axios from 'axios'

interface Props { nzo_id: string; onClose: () => void }

export function JobFilesModal({ nzo_id, onClose }: Props) {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`/api/job/files?nzo_id=${nzo_id}`)
      .then(r => setFiles(r.data?.files ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [nzo_id])

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
          <div className="text-lg font-bold">Fichiers du job</div>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto flex-1">
          {loading
            ? <div className="flex items-center justify-center p-12"><Loader size={24} className="animate-spin text-cyan-400" /></div>
            : files.length === 0
            ? <div className="p-8 text-center text-slate-500">Aucun fichier</div>
            : (
              <div className="divide-y divide-slate-800/50">
                {files.map((f: any, i: number) => (
                  <div key={i} className="px-6 py-3 flex items-center gap-3">
                    <FileText size={14} className="text-slate-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{f.filename}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{f.mb ?? '?'} MB - {f.status}</div>
                    </div>
                    <div className={`text-xs px-2 py-0.5 rounded-full ${f.status === 'finished' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {f.status}
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}
