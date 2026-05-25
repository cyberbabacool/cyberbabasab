import { useState } from 'react'
import { Server, Plus, Trash2, Edit2, Wifi, WifiOff, TestTube, X, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { useConfig, useStatus } from '../hooks/useSab'
import axios from 'axios'

interface ServerForm {
  keyword: string
  host: string
  port: string
  username: string
  password: string
  connections: string
  ssl: boolean
  enable: boolean
  optional: boolean
  retention: string
  timeout: string
  priority: string
}

const DEFAULT_FORM: ServerForm = {
  keyword: '', host: '', port: '563', username: '', password: '',
  connections: '8', ssl: true, enable: true, optional: false,
  retention: '0', timeout: '60', priority: '0'
}

export function ServersPage() {
  const { data: configData, refresh: refreshConfig } = useConfig()
  const { data: statusData } = useStatus()
  const [editing, setEditing] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<ServerForm>(DEFAULT_FORM)
  const [testing, setTesting] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<Record<string, string>>({})
  const [expanded, setExpanded] = useState<string | null>(null)

  const servers: any[] = configData?.config?.servers ?? []
  const statusServers: any[] = statusData?.status?.servers ?? []

  const getStatus = (name: string) => statusServers.find((s: any) => s.servername === name)

  const setField = (k: keyof ServerForm, v: any) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    const payload: Record<string, any> = {
      keyword: form.keyword,
      host: form.host,
      port: form.port,
      username: form.username,
      password: form.password,
      connections: form.connections,
      ssl: form.ssl ? '1' : '0',
      enable: form.enable ? '1' : '0',
      optional: form.optional ? '1' : '0',
      retention: form.retention,
      timeout: form.timeout,
      priority: form.priority,
    }
    await axios.post(adding ? '/api/servers/add' : '/api/servers/edit', payload)
    setAdding(false)
    setEditing(null)
    setForm(DEFAULT_FORM)
    refreshConfig()
  }

  const remove = async (name: string) => {
    if (!confirm('Supprimer ce serveur ?')) return
    await axios.get(`/api/servers/delete?servername=${encodeURIComponent(name)}`)
    refreshConfig()
  }

  const test = async (name: string) => {
    setTesting(name)
    try {
      const r = await axios.get(`/api/servers/test?servername=${encodeURIComponent(name)}`)
      setTestResult(prev => ({ ...prev, [name]: r.data?.error ? 'Echec: ' + r.data.error : 'Connexion OK' }))
    } catch {
      setTestResult(prev => ({ ...prev, [name]: 'Erreur de test' }))
    }
    setTesting(null)
  }

  const startEdit = (srv: any) => {
    setForm({
      keyword: srv.displayname ?? srv.host,
      host: srv.host,
      port: String(srv.port),
      username: srv.username ?? '',
      password: srv.password ?? '',
      connections: String(srv.connections),
      ssl: !!srv.ssl,
      enable: !!srv.enable,
      optional: !!srv.optional,
      retention: String(srv.retention ?? 0),
      timeout: String(srv.timeout ?? 60),
      priority: String(srv.priority ?? 0),
    })
    setEditing(srv.displayname ?? srv.host)
    setAdding(false)
  }

  const ServerFormPanel = () => (
    <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/90 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-cyan-400">{adding ? 'Nouveau serveur' : 'Modifier serveur'}</div>
        <button onClick={() => { setAdding(false); setEditing(null); setForm(DEFAULT_FORM) }}
          className="text-slate-500 hover:text-white"><X size={18} /></button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Nom (identifiant unique)</label>
          <input value={form.keyword} onChange={e => setField('keyword', e.target.value)} placeholder="mon-serveur"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-cyan-500" />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Hote</label>
          <input value={form.host} onChange={e => setField('host', e.target.value)} placeholder="news.example.com"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-cyan-500" />
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Port</label>
          <input value={form.port} onChange={e => setField('port', e.target.value)} type="number"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Connexions</label>
          <input value={form.connections} onChange={e => setField('connections', e.target.value)} type="number" min="1" max="100"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Utilisateur</label>
          <input value={form.username} onChange={e => setField('username', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Mot de passe</label>
          <input value={form.password} onChange={e => setField('password', e.target.value)} type="password"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Retention (jours, 0=illimite)</label>
          <input value={form.retention} onChange={e => setField('retention', e.target.value)} type="number" min="0"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Timeout (s)</label>
          <input value={form.timeout} onChange={e => setField('timeout', e.target.value)} type="number" min="10"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Priorite</label>
          <select value={form.priority} onChange={e => setField('priority', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500">
            <option value="0">Normal (0)</option>
            <option value="1">Backup (1)</option>
            <option value="2">Backup (2)</option>
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-6">
        {([['ssl', 'SSL/TLS'], ['enable', 'Actif'], ['optional', 'Optionnel (backup)']] as [keyof ServerForm, string][]).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => setField(key, !form[key])}
              className={`w-9 h-5 rounded-full relative transition-colors ${form[key] ? 'bg-cyan-500' : 'bg-slate-700'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form[key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-slate-300">{label}</span>
          </label>
        ))}
      </div>
      <button onClick={save}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 font-semibold text-sm">
        <Check size={16} /> Sauvegarder
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">Serveurs</h1>
          <p className="text-slate-400 mt-1">{servers.length} serveur(s) Usenet</p>
        </div>
        <button onClick={() => { setAdding(true); setEditing(null); setForm(DEFAULT_FORM) }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-sm font-semibold">
          <Plus size={16} /> Ajouter un serveur
        </button>
      </div>

      {(adding || editing) && <ServerFormPanel />}

      <div className="space-y-3">
        {servers.map((srv: any) => {
          const name = srv.displayname ?? srv.host
          const live = getStatus(name)
          const active = live?.serveractive ?? !!srv.enable
          const conns = live?.serveractiveconn ?? 0
          const isExpanded = expanded === name
          const speed = live ? (parseInt(live.serverbps ?? '0') / 1024).toFixed(1) : '0'
          return (
            <div key={name} className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
              <div className="p-5 flex items-center gap-4">
                <div className={`p-2 rounded-xl shrink-0 ${active ? 'bg-emerald-500/10' : 'bg-slate-800'}`}>
                  <Server size={18} className={active ? 'text-emerald-400' : 'text-slate-500'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{name}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                    <span className="font-mono">{srv.host}:{srv.port}</span>
                    {!!srv.ssl && <span className="text-cyan-400">SSL</span>}
                    <span>{srv.connections} conn.</span>
                    {!!srv.optional && <span className="text-amber-400">Backup</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${active && conns > 0 ? 'bg-emerald-500/10 text-emerald-400' : active ? 'bg-slate-800 text-slate-400' : 'bg-red-500/10 text-red-400'}`}>
                    {active && conns > 0 ? <Wifi size={11} /> : <WifiOff size={11} />}
                    {active && conns > 0 ? `${conns} actif(s) - ${speed} KB/s` : active ? 'Inactif' : 'Desactive'}
                  </div>
                  {testResult[name] && (
                    <span className={`text-xs ${testResult[name].includes('OK') ? 'text-emerald-400' : 'text-red-400'}`}>{testResult[name]}</span>
                  )}
                  <button onClick={() => test(name)} title="Tester"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-slate-800">
                    <TestTube size={14} className={testing === name ? 'animate-pulse' : ''} />
                  </button>
                  <button onClick={() => startEdit(srv)} title="Modifier"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800"><Edit2 size={14} /></button>
                  <button onClick={() => remove(name)} title="Supprimer"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800"><Trash2 size={14} /></button>
                  <button onClick={() => setExpanded(isExpanded ? null : name)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800">
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>
              {isExpanded && (
                <div className="border-t border-slate-800 px-5 py-4 grid grid-cols-3 gap-4 text-sm bg-slate-950/50">
                  <div><div className="text-xs text-slate-500 mb-1">Connexions totales</div><div className="font-bold">{srv.connections}</div></div>
                  <div><div className="text-xs text-slate-500 mb-1">Retention</div><div className="font-bold">{srv.retention === 0 ? 'Illimitee' : srv.retention + ' j'}</div></div>
                  <div><div className="text-xs text-slate-500 mb-1">Timeout</div><div className="font-bold">{srv.timeout}s</div></div>
                  <div><div className="text-xs text-slate-500 mb-1">Utilisateur</div><div className="font-mono text-xs">{srv.username || '-'}</div></div>
                  <div><div className="text-xs text-slate-500 mb-1">Priorite</div><div className="font-bold">{srv.priority}</div></div>
                  <div><div className="text-xs text-slate-500 mb-1">IPv6</div><div>{srv.ipv6 ? 'Oui' : 'Non'}</div></div>
                  {live?.serverwarning && <div className="col-span-3 text-amber-400 text-xs">{live.serverwarning}</div>}
                  {live?.servererror  && <div className="col-span-3 text-red-400 text-xs">{live.servererror}</div>}
                </div>
              )}
            </div>
          )
        })}
        {servers.length === 0 && !adding && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-12 text-center text-slate-500">
            Aucun serveur configure. Cliquez sur "Ajouter un serveur".
          </div>
        )}
      </div>
    </div>
  )
}
