import { useState } from 'react'
import { Rss, RefreshCw } from 'lucide-react'
import { useConfig } from '../hooks/useSab'
import axios from 'axios'

export function RssPage() {
  const { data } = useConfig()
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, any>>({})

  const feeds = Object.entries(data?.config?.rss ?? {}).filter(([k]) => k !== 'uris')

  const readFeed = async (name: string) => {
    setLoading(name)
    try {
      const r = await axios.get(`/api/rss/read?feed=${encodeURIComponent(name)}`)
      setResults(prev => ({ ...prev, [name]: r.data }))
    } catch {}
    setLoading(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black">RSS</h1>
        <p className="text-slate-400 mt-1">{feeds.length} flux configure(s)</p>
      </div>

      {feeds.length === 0
        ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center space-y-3">
            <Rss size={32} className="text-slate-600 mx-auto" />
            <p className="text-slate-500">Aucun flux RSS configure</p>
            <p className="text-xs text-slate-600">Configurez vos flux dans SABnzbd et revenez ici.</p>
          </div>
        )
        : (
          <div className="space-y-4">
            {feeds.map(([name, feed]: [string, any]) => (
              <div key={name} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Rss size={18} className="text-orange-400" />
                    <div>
                      <div className="font-semibold">{name}</div>
                      <div className="text-xs text-slate-500 mt-0.5 font-mono truncate max-w-xs">{feed?.uri ?? ''}</div>
                    </div>
                  </div>
                  <button onClick={() => readFeed(name)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs">
                    <RefreshCw size={12} className={loading === name ? 'animate-spin' : ''} />
                    Lire
                  </button>
                </div>
                {results[name] && (
                  <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                    {(results[name]?.feed?.entries ?? []).slice(0, 20).map((entry: any, i: number) => (
                      <div key={i} className="text-xs text-slate-400 border-l-2 border-slate-700 pl-3 py-1">
                        <div className="text-slate-200">{entry.title}</div>
                        <div className="text-slate-600 mt-0.5">{entry.cat} - {entry.size}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}
