import { useState, useEffect } from 'react'
import { Rss, Plus, Trash2, Edit2, X, Check, ChevronDown, ChevronUp, Play } from 'lucide-react'
import { useConfig } from '../hooks/useSab'
import { usePrefs } from '../hooks/usePrefs'
import axios from 'axios'

interface RssFilter {
  cat: string; pp: string; script: string; type: string
  text: string; priority: string; enabled: boolean
}

interface RssFeed {
  name: string; uri: string; cat: string; pp: string
  script: string; enable: number; priority: string; filters: RssFilter[]
}

const DEFAULT_FEED: RssFeed = { name: '', uri: '', cat: '', pp: '', script: '', enable: 1, priority: '-100', filters: [] }
const DEFAULT_FILTER: RssFilter = { cat: '', pp: '', script: '', type: 'A', text: '', priority: '-100', enabled: true }

function parseFilters(feed: any): RssFilter[] {
  const filters: RssFilter[] = []
  let i = 0
  while (feed[`filter${i}`]) {
    const f = feed[`filter${i}`]
    filters.push({ cat: f[0] ?? '', pp: f[1] ?? '', script: f[2] ?? '',
      type: f[3] ?? 'A', text: f[4] ?? '', priority: f[5] ?? '-100',
      enabled: f[6] !== '0' && f[6] !== 0 })
    i++
  }
  return filters
}

export function RssPage() {
  const { data: configData, refresh } = useConfig()
  const { t } = usePrefs()
  const [feeds, setFeeds] = useState<RssFeed[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<RssFeed>(DEFAULT_FEED)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [reading, setReading] = useState<string | null>(null)
  const [readResults, setReadResults] = useState<Record<string, any[]>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const FILTER_TYPES = [
    { v: 'A', l: t.rss_filter_type_a },
    { v: 'R', l: t.rss_filter_type_r },
    { v: 'M', l: t.rss_filter_type_m },
    { v: 'C', l: t.rss_filter_type_c },
    { v: 'S', l: t.rss_filter_type_s },
  ]

  const PRIORITIES = [
    { v: '-100', l: t.prio_default },
    { v: '-2',   l: t.prio_pause },
    { v: '-1',   l: t.prio_low },
    { v: '0',    l: t.prio_normal },
    { v: '1',    l: t.prio_high },
    { v: '2',    l: t.prio_force },
  ]

  const PP_OPTIONS = [
    { v: '', l: t.common_default },
    { v: '0', l: t.common_none },
    { v: '1', l: t.rss_pp_repair },
    { v: '2', l: t.rss_pp_repair_unpack },
    { v: '3', l: t.rss_pp_repair_del },
  ]

  useEffect(() => {
    const raw = configData?.config?.rss ?? []
    if (Array.isArray(raw)) {
      setFeeds(raw.map((f: any) => ({
        name: f.name ?? '',
        uri: Array.isArray(f.uri) ? f.uri[0] : (f.uri ?? ''),
        cat: f.cat ?? '', pp: f.pp ?? '', script: f.script ?? '',
        enable: f.enable ?? 1, priority: String(f.priority ?? '-100'),
        filters: parseFilters(f),
      })))
    }
  }, [configData])

  const setField = (k: keyof RssFeed, v: any) => setForm(f => ({ ...f, [k]: v }))

  const setFilterField = (idx: number, k: keyof RssFilter, v: any) => {
    setForm(f => {
      const filters = [...f.filters]
      filters[idx] = { ...filters[idx], [k]: v }
      return { ...f, filters }
    })
  }

  const addFilter = () => setForm(f => ({ ...f, filters: [...f.filters, { ...DEFAULT_FILTER }] }))
  const removeFilter = (idx: number) => setForm(f => ({ ...f, filters: f.filters.filter((_, i) => i !== idx) }))
  const moveFilter = (idx: number, dir: -1 | 1) => {
    setForm(f => {
      const filters = [...f.filters]
      const tmp = filters[idx]
      filters[idx] = filters[idx + dir]
      filters[idx + dir] = tmp
      return { ...f, filters }
    })
  }

  const saveFeed = async () => {
    setSaving(true)
    const params: Record<string, string> = {
      section: 'rss', keyword: form.name, uri: form.uri, cat: form.cat,
      pp: form.pp, script: form.script, enable: String(form.enable), priority: form.priority,
    }
    form.filters.forEach((f, i) => {
      params[`filter${i}`] = [f.cat, f.pp, f.script, f.type, f.text, f.priority, f.enabled ? '1' : '0'].join(',')
    })
    const qs = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
    await axios.get(`/api/config/save-rss?${qs}`)
    await refresh()
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setAdding(false); setEditing(null); setForm(DEFAULT_FEED)
  }

  const deleteFeed = async (name: string) => {
    if (!confirm(`${t.rss_confirm_delete} "${name}" ?`)) return
    await axios.get(`/api/config/delete?section=rss&keyword=${encodeURIComponent(name)}`)
    await refresh()
  }

  const readFeed = async (name: string) => {
    setReading(name)
    try {
      const r = await axios.get(`/api/rss/read?feed=${encodeURIComponent(name)}`)
      const entries = r.data?.entries ?? r.data?.items ?? []
      setReadResults(prev => ({ ...prev, [name]: entries }))
    } catch { setReadResults(prev => ({ ...prev, [name]: [] })) }
    setReading(null)
  }

  const toggleEnable = async (feed: RssFeed) => {
    const params = `section=rss&keyword=${encodeURIComponent(feed.name)}&enable=${feed.enable ? '0' : '1'}`
    await axios.get(`/api/config/save-rss?${params}`)
    await refresh()
  }

  const startEdit = (feed: RssFeed) => {
    setForm({ ...feed }); setEditing(feed.name); setAdding(false); setExpanded(feed.name)
  }

  const FeedForm = () => (
    <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/90 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-cyan-400">
          {adding ? t.rss_form_add_title : `${t.rss_form_edit_prefix} ${editing}`}
        </div>
        <button onClick={() => { setAdding(false); setEditing(null); setForm(DEFAULT_FEED) }}
          className="text-slate-500 hover:text-white"><X size={18} /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">{t.rss_feed_name}</label>
          <input value={form.name} onChange={e => setField('name', e.target.value)} disabled={!!editing}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 disabled:opacity-50" />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">{t.rss_feed_url}</label>
          <input value={form.uri} onChange={e => setField('uri', e.target.value)} placeholder="https://..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-cyan-500" />
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">{t.rss_feed_cat}</label>
          <input value={form.cat} onChange={e => setField('cat', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">{t.rss_feed_priority}</label>
          <select value={form.priority} onChange={e => setField('priority', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500">
            {PRIORITIES.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">{t.rss_feed_pp}</label>
          <select value={form.pp} onChange={e => setField('pp', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500">
            {PP_OPTIONS.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">{t.rss_feed_script}</label>
          <input value={form.script} onChange={e => setField('script', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-300">{t.rss_feed_active}</label>
          <button onClick={() => setField('enable', form.enable ? 0 : 1)}
            style={{ display:'flex', alignItems:'center', width:'44px', height:'24px', borderRadius:'12px', padding:'2px', border:'none', cursor:'pointer', backgroundColor: form.enable ? 'var(--accent)' : '#475569', transition:'background-color 200ms', boxSizing:'border-box', flexShrink:0, outline:'none' }}>
            <span style={{ display:'block', width:'20px', height:'20px', borderRadius:'50%', backgroundColor:'white', boxShadow:'0 1px 3px rgba(0,0,0,0.4)', transition:'transform 200ms ease-in-out', flexShrink:0, transform: form.enable ? 'translateX(20px)' : 'translateX(0px)' }} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-widest text-slate-500">{t.rss_filters}</div>
          <button onClick={addFilter}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs">
            <Plus size={12} /> {t.rss_add_filter}
          </button>
        </div>
        <div className="text-xs text-slate-600">{t.rss_filter_help}</div>
        {form.filters.length === 0 && (
          <div className="text-sm text-slate-500 text-center py-4 border border-dashed border-slate-700 rounded-xl">
            {t.rss_no_filters}
          </div>
        )}
        {form.filters.map((f, idx) => (
          <div key={idx} className="bg-slate-800/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400 font-semibold">{t.rss_filter_num} {idx + 1}</div>
              <div className="flex gap-1">
                <button onClick={() => idx > 0 && moveFilter(idx, -1)} disabled={idx === 0}
                  className="p-1 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20"><ChevronUp size={12} /></button>
                <button onClick={() => idx < form.filters.length - 1 && moveFilter(idx, 1)} disabled={idx === form.filters.length - 1}
                  className="p-1 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20"><ChevronDown size={12} /></button>
                <button onClick={() => removeFilter(idx)} className="p-1 rounded text-slate-600 hover:text-red-400"><Trash2 size={12} /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">{t.rss_filter_type}</label>
                <select value={f.type} onChange={e => setFilterField(idx, 'type', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none">
                  {FILTER_TYPES.map(t2 => <option key={t2.v} value={t2.v}>{t2.l}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-500 block mb-1">{t.rss_filter_text}</label>
                <input value={f.text} onChange={e => setFilterField(idx, 'text', e.target.value)} placeholder="* or regex"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">{t.rss_filter_cat}</label>
                <input value={f.cat} onChange={e => setFilterField(idx, 'cat', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">{t.rss_filter_priority}</label>
                <select value={f.priority} onChange={e => setFilterField(idx, 'priority', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none">
                  {PRIORITIES.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">{t.rss_filter_pp}</label>
                <select value={f.pp} onChange={e => setFilterField(idx, 'pp', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none">
                  {PP_OPTIONS.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">{t.rss_filter_active}</label>
              <button onClick={() => setFilterField(idx, 'enabled', !f.enabled)}
                style={{ display:'flex', alignItems:'center', width:'36px', height:'20px', borderRadius:'10px', padding:'2px', border:'none', cursor:'pointer', backgroundColor: f.enabled ? 'var(--accent)' : '#475569', transition:'background-color 200ms', boxSizing:'border-box', outline:'none' }}>
                <span style={{ display:'block', width:'16px', height:'16px', borderRadius:'50%', backgroundColor:'white', transition:'transform 200ms', transform: f.enabled ? 'translateX(16px)' : 'translateX(0px)' }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={saveFeed} disabled={saving || !form.name || !form.uri}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 font-semibold text-sm disabled:opacity-50">
        <Check size={16} /> {saving ? t.rss_saving : saved ? t.rss_saved : t.rss_save}
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-4xl font-black">{t.rss_title}</h1>
          <p className="text-slate-400 mt-1 text-sm">{feeds.length} {t.rss_feeds_count}</p>
        </div>
        <button onClick={() => { setAdding(true); setEditing(null); setForm(DEFAULT_FEED) }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-sm font-semibold">
          <Plus size={16} /> {t.rss_new_feed}
        </button>
      </div>

      {(adding || editing) && <FeedForm />}

      {feeds.length === 0 && !adding ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-12 text-center space-y-3">
          <Rss size={32} className="text-slate-600 mx-auto" />
          <p className="text-slate-500">{t.rss_no_feeds}</p>
          <p className="text-xs text-slate-600">{t.rss_no_feeds_hint}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feeds.map(feed => {
            const isExpanded = expanded === feed.name
            const results = readResults[feed.name] ?? []
            return (
              <div key={feed.name} className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
                <div className="p-5 flex items-center gap-4">
                  <div className={`p-2 rounded-xl shrink-0 ${feed.enable ? 'bg-orange-500/10' : 'bg-slate-800'}`}>
                    <Rss size={18} className={feed.enable ? 'text-orange-400' : 'text-slate-500'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{feed.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-3">
                      <span className="font-mono truncate max-w-xs">{feed.uri}</span>
                      {feed.cat && <span className="text-cyan-400">{feed.cat}</span>}
                      <span>{feed.filters.length} {t.rss_filters_count}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => toggleEnable(feed)}
                      style={{ display:'flex', alignItems:'center', width:'44px', height:'24px', borderRadius:'12px', padding:'2px', border:'none', cursor:'pointer', backgroundColor: feed.enable ? 'var(--accent)' : '#475569', transition:'background-color 200ms', boxSizing:'border-box', outline:'none' }}>
                      <span style={{ display:'block', width:'20px', height:'20px', borderRadius:'50%', backgroundColor:'white', boxShadow:'0 1px 3px rgba(0,0,0,0.4)', transition:'transform 200ms ease-in-out', transform: feed.enable ? 'translateX(20px)' : 'translateX(0px)' }} />
                    </button>
                    <button onClick={() => readFeed(feed.name)} title={t.rss_read_now}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-slate-800">
                      <Play size={14} className={reading === feed.name ? 'animate-pulse' : ''} />
                    </button>
                    <button onClick={() => startEdit(feed)} title={t.cat_edit}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800"><Edit2 size={14} /></button>
                    <button onClick={() => deleteFeed(feed.name)} title={t.cat_delete}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800"><Trash2 size={14} /></button>
                    <button onClick={() => setExpanded(isExpanded ? null : feed.name)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-800">
                    {feed.filters.length > 0 && (
                      <div className="px-5 py-3 bg-slate-950/30">
                        <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">{t.rss_filters}</div>
                        <div className="space-y-1">
                          {feed.filters.map((f, i) => (
                            <div key={i} className="flex items-center gap-3 text-xs">
                              <span className="w-4 text-slate-600">{i + 1}</span>
                              <span className={`px-2 py-0.5 rounded font-semibold ${ f.type === 'A' ? 'bg-emerald-500/10 text-emerald-400' : f.type === 'R' ? 'bg-red-500/10 text-red-400' : f.type === 'M' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400' }`}>
                                {FILTER_TYPES.find(t2 => t2.v === f.type)?.l ?? f.type}
                              </span>
                              <span className="font-mono text-slate-300">{f.text || '*'}</span>
                              {f.cat && <span className="text-cyan-400">{f.cat}</span>}
                              {!f.enabled && <span className="text-slate-600">({t.common_none})</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {results.length > 0 && (
                      <div className="px-5 py-3 max-h-64 overflow-y-auto">
                        <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">{t.rss_results_count} ({results.length})</div>
                        <div className="space-y-1">
                          {results.slice(0, 50).map((item: any, i: number) => (
                            <div key={i} className="text-xs text-slate-400 border-l-2 border-slate-700 pl-3 py-0.5">
                              <div className="text-slate-200 truncate">{item.title ?? item.name ?? t.rss_no_title}</div>
                              {(item.cat || item.category) && <div className="text-slate-600">{item.cat ?? item.category}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
