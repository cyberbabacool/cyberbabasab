import { useState } from 'react'
import { Tag, Plus, Trash2, Edit2, X, Check } from 'lucide-react'
import { useConfig } from '../hooks/useSab'
import axios from 'axios'

interface CatForm { keyword: string; dir: string; script: string; priority: string; pp: string }
const DEFAULT: CatForm = { keyword: '', dir: '', script: 'Default', priority: '-100', pp: '-1' }

const PP_OPTIONS = [{v:'-1',l:'Default'},{v:'0',l:'Aucun'},{v:'1',l:'Repair'},{v:'2',l:'Repair+Unpack'},{v:'3',l:'Repair+Unpack+Del'}]
const PRIO_OPTIONS = [{v:'-100',l:'Default'},{v:'-2',l:'Pause'},{v:'-1',l:'Bas'},{v:'0',l:'Normal'},{v:'1',l:'Haut'},{v:'2',l:'Force'}]

export function CategoriesPage() {
  const { data, refresh } = useConfig()
  const [editing, setEditing] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<CatForm>(DEFAULT)

  const cats: any[] = data?.config?.categories ?? []
  const setField = (k: keyof CatForm, v: string) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    await axios.post(adding ? '/api/categories/add' : '/api/categories/edit', form)
    setAdding(false); setEditing(null); setForm(DEFAULT); refresh()
  }

  const remove = async (name: string) => {
    if (!confirm('Supprimer la categorie ' + name + ' ?')) return
    await axios.get(`/api/categories/delete?name=${encodeURIComponent(name)}`)
    refresh()
  }

  const startEdit = (cat: any) => {
    setForm({ keyword: cat.name, dir: cat.dir ?? '', script: cat.script ?? 'Default', priority: String(cat.priority ?? -100), pp: String(cat.pp ?? -1) })
    setEditing(cat.name); setAdding(false)
  }

  const FormPanel = () => (
    <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/90 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-cyan-400">{adding ? 'Nouvelle categorie' : 'Modifier categorie'}</div>
        <button onClick={() => { setAdding(false); setEditing(null); setForm(DEFAULT) }} className="text-slate-500 hover:text-white"><X size={18} /></button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Nom</label>
          <input value={form.keyword} onChange={e => setField('keyword', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Dossier (relatif ou absolu)</label>
          <input value={form.dir} onChange={e => setField('dir', e.target.value)} placeholder="sous-dossier ou /chemin/absolu"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-cyan-500" />
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Script</label>
          <input value={form.script} onChange={e => setField('script', e.target.value)} placeholder="Default"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Priorite</label>
          <select value={form.priority} onChange={e => setField('priority', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500">
            {PRIO_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Post-traitement</label>
          <select value={form.pp} onChange={e => setField('pp', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500">
            {PP_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </div>
      </div>
      <button onClick={save} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 font-semibold text-sm">
        <Check size={16} /> Sauvegarder
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">Categories</h1>
          <p className="text-slate-400 mt-1">{cats.length} categorie(s)</p>
        </div>
        <button onClick={() => { setAdding(true); setEditing(null); setForm(DEFAULT) }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-sm font-semibold">
          <Plus size={16} /> Nouvelle categorie
        </button>
      </div>

      {(adding || editing) && <FormPanel />}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        {cats.length === 0 && !adding
          ? <div className="p-8 text-center text-slate-500">Aucune categorie. Cliquez sur "Nouvelle categorie".</div>
          : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">Nom</th>
                  <th className="px-5 py-3 text-left">Dossier</th>
                  <th className="px-5 py-3 text-left">Script</th>
                  <th className="px-5 py-3 text-left">Priorite</th>
                  <th className="px-5 py-3 text-left">Post-proc</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {cats.map((cat: any) => {
                  const prioLabel = PRIO_OPTIONS.find(o => o.v === String(cat.priority))?.l ?? String(cat.priority)
                  const ppLabel   = PP_OPTIONS.find(o => o.v === String(cat.pp))?.l ?? String(cat.pp)
                  return (
                    <tr key={cat.name} className={`hover:bg-slate-800/30 ${editing === cat.name ? 'bg-cyan-500/5' : ''}`}>
                      <td className="px-5 py-3 font-medium flex items-center gap-2"><Tag size={14} className="text-cyan-400" />{cat.name}</td>
                      <td className="px-5 py-3 text-slate-400 font-mono text-xs">{cat.dir || '-'}</td>
                      <td className="px-5 py-3 text-slate-400">{cat.script || 'Default'}</td>
                      <td className="px-5 py-3 text-slate-400">{prioLabel}</td>
                      <td className="px-5 py-3 text-slate-400">{ppLabel}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => startEdit(cat)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800"><Edit2 size={14} /></button>
                          <button onClick={() => remove(cat.name)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
        }
      </div>
    </div>
  )
}
