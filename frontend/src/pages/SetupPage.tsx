import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff, Lock, User } from 'lucide-react'

export function SetupPage() {
  const { setup } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!username.trim()) { setError('Nom utilisateur requis'); return }
    if (password.length < 8) { setError('Mot de passe : 8 caracteres minimum'); return }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    setLoading(true)
    const err = await setup(username, password)
    if (err) setError(err)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-cyan-400" />
          </div>
          <h1 className="text-3xl font-black text-white">Premier lancement</h1>
          <p className="text-slate-400 mt-2">Configurez votre compte administrateur</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-5">
          <div>
            <label className="text-xs uppercase tracking-widest text-slate-500 block mb-2">Nom utilisateur</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={username} onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500" />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-slate-500 block mb-2">Mot de passe (8 min)</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={password} onChange={e => setPassword(e.target.value)}
                type={showPw ? 'text' : 'password'} placeholder="" 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-10 py-3 text-white text-sm focus:outline-none focus:border-cyan-500" />
              <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-slate-500 block mb-2">Confirmer le mot de passe</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={confirm} onChange={e => setConfirm(e.target.value)}
                type={showPw ? 'text' : 'password'} placeholder=""
                onKeyDown={e => e.key === 'Enter' && submit()}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500" />
            </div>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

          <button onClick={submit} disabled={loading}
            className="w-full py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 font-semibold text-sm transition-colors disabled:opacity-50">
            {loading ? 'Configuration...' : 'Configurer et continuer'}
          </button>
        </div>
      </div>
    </div>
  )
}
