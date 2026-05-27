import { useState } from 'react'
import { Check, RefreshCw } from 'lucide-react'
import { usePrefs, ACCENT_VARS } from '../hooks/usePrefs'
import { useAuth } from '../hooks/useAuth'
import type { AccentColor, ThemeMode, SpeedUnit } from '../hooks/usePrefs'
import { LANG_LABELS } from '../i18n'
import type { Lang } from '../i18n'

const ACCENTS: { key: AccentColor; label: string }[] = [
  { key: 'cyan',   label: 'Cyan'   },
  { key: 'violet', label: 'Violet' },
  { key: 'green',  label: 'Green'  },
  { key: 'orange', label: 'Orange' },
  { key: 'rose',   label: 'Rose'   },
]

const REFRESH_OPTIONS = [
  { v: 1000, l: '1s' }, { v: 2000, l: '2s' }, { v: 5000, l: '5s' }, { v: 10000, l: '10s' }
]

const DASH_JOBS_OPTIONS = [3, 5, 6, 8, 10]

export function PreferencesPage() {
  const { prefs, update, reset, t } = usePrefs()
  const [saved, setSaved] = useState(false)
  const [logoPreview, setLogoPreview] = useState(prefs.logoUrl)
  const { changePassword, username } = useAuth()
  const [curPw, setCurPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwOk, setPwOk] = useState(false)

  const save = () => {
    update({ logoUrl: logoPreview })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleChangePassword = async () => {
    setPwError('')
    setPwOk(false)
    if (!curPw) { setPwError('Mot de passe actuel requis'); return }
    if (newPw.length < 8) { setPwError('Nouveau mot de passe : 8 caracteres minimum'); return }
    if (newPw !== confirmPw) { setPwError('Les mots de passe ne correspondent pas'); return }
    const err = await changePassword(curPw, newPw)
    if (err) { setPwError(err); return }
    setPwOk(true)
    setCurPw(''); setNewPw(''); setConfirmPw('')
    setTimeout(() => setPwOk(false), 3000)
  }

  const requestNotifPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission()
      if (perm === 'granted') update({ notifComplete: true })
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">{t.pref_title}</h1>
          <p className="text-slate-400 mt-1 text-sm">Interface et affichage</p>
        </div>
        <div className="flex gap-2">
          {saved && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs">
              <Check size={12} /> {t.common_saved}
            </div>
          )}
          <button onClick={reset} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs">
            <RefreshCw size={12} /> {t.pref_reset}
          </button>
        </div>
      </div>

      {/* Apparence */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-5">
        <div className="text-xs uppercase tracking-widest text-slate-500">{t.pref_appearance}</div>

        {/* Theme */}
        <div>
          <div className="text-sm text-slate-300 mb-3">{t.pref_theme}</div>
          <div className="flex gap-3">
            {(['dark', 'light'] as ThemeMode[]).map(th => (
              <button key={th} onClick={() => update({ theme: th })}
                className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                  prefs.theme === th
                    ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-bg)]'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500'
                }`}>
                {th === 'dark' ? t.pref_dark : t.pref_light}
              </button>
            ))}
          </div>
        </div>

        {/* Accent */}
        <div>
          <div className="text-sm text-slate-300 mb-3">{t.pref_accent}</div>
          <div className="flex gap-3 flex-wrap">
            {ACCENTS.map(a => {
              const vars = ACCENT_VARS[a.key]
              const active = prefs.accent === a.key
              return (
                <button key={a.key} onClick={() => update({ accent: a.key })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all ${
                    active ? 'border-[var(--accent)] scale-105' : 'border-slate-700 hover:border-slate-500'
                  }`}>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: vars.primary }} />
                  <span style={active ? { color: vars.primary } : { color: '#94a3b8' }}>{a.label}</span>
                  {active && <Check size={12} style={{ color: vars.primary }} />}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Langue */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-5">
        <div className="text-xs uppercase tracking-widest text-slate-500">{t.pref_language}</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(Object.keys(LANG_LABELS) as Lang[]).map(lang => (
            <button key={lang} onClick={() => update({ lang })}
              className={`py-3 rounded-xl border text-sm font-semibold transition-colors ${
                prefs.lang === lang
                  ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-bg)]'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500'
              }`}>
              {LANG_LABELS[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Identite */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-5">
        <div className="text-xs uppercase tracking-widest text-slate-500">{t.pref_branding}</div>
        <div>
          <label className="text-sm text-slate-300 block mb-2">{t.pref_app_name}</label>
          <input value={prefs.appName} onChange={e => update({ appName: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[var(--accent)]" />
        </div>
        <div>
          <label className="text-sm text-slate-300 block mb-2">{t.pref_logo_url}</label>
          <div className="flex gap-3">
            <input value={logoPreview} onChange={e => setLogoPreview(e.target.value)}
              placeholder="/logo.png"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-[var(--accent)]" />
            {logoPreview && (
              <img src={logoPreview} alt="preview" className="w-10 h-10 rounded-lg object-contain bg-slate-800 border border-slate-700" />
            )}
          </div>
          <p className="text-xs text-slate-600 mt-1">URL relative (/logo.png) ou absolue (https://...)</p>
        </div>
      </div>

      {/* Interface */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-5">
        <div className="text-xs uppercase tracking-widest text-slate-500">{t.pref_interface}</div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-300">{t.pref_refresh}</div>
            <div className="text-xs text-slate-500 mt-0.5">Intervalle de mise a jour de la queue</div>
          </div>
          <div className="flex gap-2">
            {REFRESH_OPTIONS.map(o => (
              <button key={o.v} onClick={() => update({ refreshInterval: o.v })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  prefs.refreshInterval === o.v
                    ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-bg)]'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500'
                }`}>{o.l}</button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-300">{t.pref_dash_jobs}</div>
            <div className="text-xs text-slate-500 mt-0.5">Nombre de jobs visibles sur le dashboard</div>
          </div>
          <div className="flex gap-2">
            {DASH_JOBS_OPTIONS.map(n => (
              <button key={n} onClick={() => update({ dashJobs: n })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  prefs.dashJobs === n
                    ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-bg)]'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500'
                }`}>{n}</button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-300">{t.pref_compact}</div>
          <button onClick={() => update({ compact: !prefs.compact })}
            className={`w-10 h-5 rounded-full relative transition-colors ${prefs.compact ? 'bg-[var(--accent)]' : 'bg-slate-700'}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${prefs.compact ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-300">{t.pref_speed_unit}</div>
          <div className="flex gap-2">
            {(['MB/s', 'KB/s'] as SpeedUnit[]).map(u => (
              <button key={u} onClick={() => update({ speedUnit: u })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  prefs.speedUnit === u
                    ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-bg)]'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500'
                }`}>{u}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
        <div className="text-xs uppercase tracking-widest text-slate-500">{t.pref_notifications}</div>
        {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && (
          <button onClick={requestNotifPermission}
            className="w-full py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:border-[var(--accent)] hover:text-[var(--accent)] text-sm transition-colors">
            Autoriser les notifications navigateur
          </button>
        )}
        {[
          { key: 'notifComplete' as const, label: t.pref_notif_complete },
          { key: 'notifFail'    as const, label: t.pref_notif_fail     },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between">
            <div className="text-sm text-slate-300">{item.label}</div>
            <button onClick={() => update({ [item.key]: !prefs[item.key] })}
              className={`w-10 h-5 rounded-full relative transition-colors ${prefs[item.key] ? 'bg-[var(--accent)]' : 'bg-slate-700'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${prefs[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}
      </div>


      {/* Mot de passe */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
        <div className="text-xs uppercase tracking-widest text-slate-500">Securite</div>
        <div className="text-sm text-slate-400">Connecte en tant que <span className="text-white font-semibold">{username}</span></div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Mot de passe actuel</label>
            <input type="password" value={curPw} onChange={e => setCurPw(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[var(--accent)]" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Nouveau mot de passe (8 min)</label>
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[var(--accent)]" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Confirmer le nouveau mot de passe</label>
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChangePassword()}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[var(--accent)]" />
          </div>
          {pwError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-2.5 rounded-xl">{pwError}</div>}
          {pwOk && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-2.5 rounded-xl">Mot de passe modifie !</div>}
          <button onClick={handleChangePassword}
            className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-semibold transition-colors">
            Modifier le mot de passe
          </button>
        </div>
      </div>

      <button onClick={save}
        className="w-full py-3 rounded-2xl bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border)] font-semibold hover:opacity-90 transition-opacity">
        {t.pref_save}
      </button>
    </div>
  )
}
