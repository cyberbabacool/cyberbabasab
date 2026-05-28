import { useState } from 'react'
import { Save, Check, Power, RefreshCw } from 'lucide-react'
import { useConfig } from '../hooks/useSab'
import { useQueue } from '../hooks/useSab'
import axios from 'axios'

type Tab = 'general' | 'folders' | 'servers' | 'categories_cfg' | 'switches' | 'postproc' | 'notifications' | 'security' | 'quota' | 'advanced'

const TABS: { key: Tab; label: string }[] = [
  { key: 'general',         label: 'General'        },
  { key: 'folders',         label: 'Dossiers'       },
  { key: 'switches',        label: 'Comportement'   },
  { key: 'postproc',        label: 'Post-traitement'},
  { key: 'notifications',   label: 'Notifications'  },
  { key: 'security',        label: 'Securite'       },
  { key: 'quota',           label: 'Quota'          },
  { key: 'advanced',        label: 'Avance'         },
]

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-3 border-b border-slate-800/50 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="text-sm text-slate-200">{label}</div>
        {help && <div className="text-xs text-slate-500 mt-0.5">{help}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function TextInput({ value, onSave, mono = false, placeholder = '' }: { value: string; onSave: (v: string) => void; mono?: boolean; placeholder?: string }) {
  const [v, setV] = useState(value)
  return (
    <div className="flex gap-2">
      <input value={v} onChange={e => setV(e.target.value)} placeholder={placeholder}
        className={`w-48 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500 ${mono ? 'font-mono' : ''}`} />
      <button onClick={() => onSave(v)} className="px-2 py-1.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 text-xs"><Save size={12} /></button>
    </div>
  )
}

function Toggle({ value, onSave }: { value: boolean; onSave: (v: boolean) => void }) {
  return (
    <button onClick={() => onSave(!value)}
      style={{
        display: 'flex', alignItems: 'center', width: '44px', height: '24px',
        borderRadius: '12px', padding: '2px', border: 'none', cursor: 'pointer',
        backgroundColor: value ? 'var(--accent)' : '#475569',
        transition: 'background-color 200ms', boxSizing: 'border-box', flexShrink: 0, outline: 'none',
      }}>
      <span style={{
        display: 'block', width: '20px', height: '20px', borderRadius: '50%',
        backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        transition: 'transform 200ms ease-in-out', flexShrink: 0,
        transform: value ? 'translateX(20px)' : 'translateX(0px)',
      }} />
    </button>
  )
}

function SelectInput({ value, options, onSave }: { value: string | number; options: { v: string | number; l: string }[]; onSave: (v: string) => void }) {
  return (
    <select value={String(value)} onChange={e => onSave(e.target.value)}
      className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500">
      {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  )
}

export function SettingsPage() {
  const { data: configData, save } = useConfig()
  const { setSpeed } = useQueue(0)
  const [tab, setTab] = useState<Tab>('general')
  const [saved, setSaved] = useState(false)
  const [speedVal, setSpeedVal] = useState('')

  const cfg = configData?.config?.misc ?? {}
  const logging = configData?.config?.logging ?? {}

  const S = (section: string) => (keyword: string) => (value: string) => {
    save(section, keyword, value).then(() => { setSaved(true); setTimeout(() => setSaved(false), 2000) })
  }
  const M = S('misc')
  const B = (keyword: string) => (value: boolean) => M(keyword)(value ? '1' : '0')

  const handleSpeed = () => {
    const v = parseInt(speedVal)
    if (!isNaN(v)) { setSpeed(v); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  }

  const confirmShutdown = async () => {
    if (confirm('Eteindre SABnzbd ?')) await axios.get('/api/shutdown')
  }
  const confirmRestart = async () => {
    if (confirm('Redemarrer SABnzbd ?')) await axios.get('/api/restart')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">Parametres</h1>
          <p className="text-slate-400 mt-1">Configuration complete SABnzbd</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs"><Check size={12} /> Sauvegarde</div>}
          <button onClick={confirmRestart} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold">
            <RefreshCw size={12} /> Redemarrer
          </button>
          <button onClick={confirmShutdown} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold">
            <Power size={12} /> Eteindre
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-800 overflow-x-auto pb-0">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
              tab === t.key ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}>{t.label}</button>
        ))}
      </div>

      <div className="max-w-3xl space-y-1">

        {tab === 'general' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-0">
            <Field label="Limite de vitesse (%)" help="0 = illimitee. Valeur actuelle: " >
              <div className="flex gap-2">
                <input type="number" min="0" max="100" value={speedVal} onChange={e => setSpeedVal(e.target.value)}
                  placeholder={cfg.bandwidth_perc?.toString() ?? '100'}
                  className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500" />
                <button onClick={handleSpeed} className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-semibold">OK</button>
              </div>
            </Field>
            <Field label="Bande passante max" help="Ex: 100M, 1G. Laisser vide pour illimite.">
              <TextInput value={cfg.bandwidth_max ?? ''} onSave={M('bandwidth_max')} mono placeholder="100M" />
            </Field>
            <Field label="Taille du cache" help="RAM allouee au cache de telechargement">
              <TextInput value={cfg.cache_limit ?? ''} onSave={M('cache_limit')} mono placeholder="1024M" />
            </Field>
            <Field label="Action apres completion">
              <SelectInput value={cfg.queue_complete ?? ''} onSave={M('queue_complete')}
                options={[{v:'',l:'Aucune'},{v:'shutdown_pc',l:'Eteindre PC'},{v:'hibernate_pc',l:'Hibernation'},{v:'standby_pc',l:'Veille'},{v:'shutdown_program',l:'Arreter SABnzbd'},{v:'pause_post',l:'Pause post-traitement'}]} />
            </Field>
            <Field label="Demarrer en pause">
              <Toggle value={!!cfg.start_paused} onSave={B('start_paused')} />
            </Field>
            <Field label="Conserver etat pause">
              <Toggle value={!!cfg.preserve_paused_state} onSave={B('preserve_paused_state')} />
            </Field>
            <Field label="Deconnexion auto si inactive">
              <Toggle value={!!cfg.auto_disconnect} onSave={B('auto_disconnect')} />
            </Field>
            <Field label="Verifier nouvelles versions">
              <Toggle value={!!cfg.check_new_rel} onSave={B('check_new_rel')} />
            </Field>
            <Field label="Langue">
              <SelectInput value={cfg.language ?? 'en'} onSave={M('language')}
                options={[{v:'en',l:'English'},{v:'fr',l:'Francais'},{v:'de',l:'Deutsch'},{v:'nl',l:'Nederlands'},{v:'es',l:'Espanol'}]} />
            </Field>
            <Field label="Taux de rafraichissement (s)">
              <SelectInput value={cfg.refresh_rate ?? 1} onSave={M('refresh_rate')}
                options={[{v:1,l:'1s'},{v:2,l:'2s'},{v:5,l:'5s'},{v:10,l:'10s'}]} />
            </Field>
            <Field label="Limite de la queue affichee">
              <TextInput value={String(cfg.queue_limit ?? 20)} onSave={M('queue_limit')} />
            </Field>
            <Field label="Nb max tentatives article">
              <TextInput value={String(cfg.max_art_tries ?? 3)} onSave={M('max_art_tries')} />
            </Field>
            <Field label="Delai de propagation (min)" help="Attendre avant de telecharger les nouveaux NZB">
              <TextInput value={String(cfg.propagation_delay ?? 0)} onSave={M('propagation_delay')} />
            </Field>
          </div>
        )}

        {tab === 'folders' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-0">
            <Field label="Dossier telechargement incomplet">
              <TextInput value={cfg.download_dir ?? ''} onSave={M('download_dir')} mono />
            </Field>
            <Field label="Espace libre min (incomplet)" help="Ex: 1G, 500M. Pause si inferieur.">
              <TextInput value={cfg.download_free ?? ''} onSave={M('download_free')} mono placeholder="1G" />
            </Field>
            <Field label="Dossier telechargement complet">
              <TextInput value={cfg.complete_dir ?? ''} onSave={M('complete_dir')} mono />
            </Field>
            <Field label="Espace libre min (complet)">
              <TextInput value={cfg.complete_free ?? ''} onSave={M('complete_free')} mono placeholder="1G" />
            </Field>
            <Field label="Reprise auto si disque plein">
              <Toggle value={!!cfg.fulldisk_autoresume} onSave={B('fulldisk_autoresume')} />
            </Field>
            <Field label="Dossier scripts">
              <TextInput value={cfg.script_dir ?? ''} onSave={M('script_dir')} mono />
            </Field>
            <Field label="Sauvegarde NZB">
              <TextInput value={cfg.nzb_backup_dir ?? ''} onSave={M('nzb_backup_dir')} mono />
            </Field>
            <Field label="Dossier surveille (dirscan)">
              <TextInput value={cfg.dirscan_dir ?? ''} onSave={M('dirscan_dir')} mono />
            </Field>
            <Field label="Vitesse scan dossier (s)">
              <TextInput value={String(cfg.dirscan_speed ?? 5)} onSave={M('dirscan_speed')} />
            </Field>
            <Field label="Fichier mots de passe">
              <TextInput value={cfg.password_file ?? ''} onSave={M('password_file')} mono />
            </Field>
            <Field label="Dossier logs">
              <TextInput value={cfg.log_dir ?? ''} onSave={M('log_dir')} mono />
            </Field>
            <Field label="Longueur max nom dossier">
              <TextInput value={String(cfg.max_foldername_length ?? 246)} onSave={M('max_foldername_length')} />
            </Field>
            <Field label="Attendre lecteur externe (s)" help="Attendre le montage avant completion">
              <TextInput value={String(cfg.wait_ext_drive ?? 5)} onSave={M('wait_ext_drive')} />
            </Field>
          </div>
        )}

        {tab === 'switches' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-0">
            <Field label="Telechargement direct (direct download)" help="Ecriture directe sans fichiers temporaires">
              <Toggle value={!!cfg.direct_unpack} onSave={B('direct_unpack')} />
            </Field>
            <Field label="Ecriture directe disque">
              <Toggle value={!!cfg.direct_write} onSave={B('direct_write')} />
            </Field>
            <Field label="Threads decompression directe">
              <SelectInput value={cfg.direct_unpack_threads ?? 3} onSave={M('direct_unpack_threads')}
                options={[1,2,3,4,6,8].map(v => ({v, l: String(v)}))} />
            </Field>
            <Field label="Verification SFV">
              <Toggle value={!!cfg.sfv_check} onSave={B('sfv_check')} />
            </Field>
            <Field label="Tri automatique">
              <SelectInput value={cfg.auto_sort ?? ''} onSave={M('auto_sort')}
                options={[{v:'',l:'Aucun'},{v:'avg_age',l:'Age moyen'},{v:'name',l:'Nom'},{v:'size',l:'Taille'}]} />
            </Field>
            <Field label="Top only (priorite haute en premier)">
              <Toggle value={!!cfg.top_only} onSave={B('top_only')} />
            </Field>
            <Field label="Pas de doublons" help="Detection des doublons">
              <SelectInput value={cfg.no_dupes ?? 0} onSave={M('no_dupes')}
                options={[{v:0,l:'Desactive'},{v:1,l:'Avertir'},{v:2,l:'Effacer'},{v:4,l:'Ignorer'}]} />
            </Field>
            <Field label="Pas de doublons serie">
              <Toggle value={!!cfg.no_series_dupes} onSave={B('no_series_dupes')} />
            </Field>
            <Field label="Verification doublons intelligente">
              <SelectInput value={cfg.no_smart_dupes ?? 0} onSave={M('no_smart_dupes')}
                options={[{v:0,l:'Desactive'},{v:1,l:'Avertir'},{v:2,l:'Effacer'},{v:4,l:'Ignorer'}]} />
            </Field>
            <Field label="Verif proper pour doublons">
              <Toggle value={!!cfg.dupes_propercheck} onSave={B('dupes_propercheck')} />
            </Field>
            <Field label="Avertir doublons">
              <Toggle value={!!cfg.warn_dupl_jobs} onSave={B('warn_dupl_jobs')} />
            </Field>
            <Field label="Ignorer samples">
              <Toggle value={!!cfg.ignore_samples} onSave={B('ignore_samples')} />
            </Field>
            <Field label="Deobfusquer noms de fichiers finaux">
              <Toggle value={!!cfg.deobfuscate_final_filenames} onSave={B('deobfuscate_final_filenames')} />
            </Field>
            <Field label="Permettre NZB incomplets">
              <Toggle value={!!cfg.allow_incomplete_nzb} onSave={B('allow_incomplete_nzb')} />
            </Field>
            <Field label="Nouveau NZB si echec">
              <Toggle value={!!cfg.new_nzb_on_failure} onSave={B('new_nzb_on_failure')} />
            </Field>
            <Field label="Echec job sans espoir">
              <Toggle value={!!cfg.fail_hopeless_jobs} onSave={B('fail_hopeless_jobs')} />
            </Field>
            <Field label="Echec rapide">
              <Toggle value={!!cfg.fast_fail} onSave={B('fast_fail')} />
            </Field>
            <Field label="Taux completion requis (%)">
              <TextInput value={String(cfg.req_completion_rate ?? 100.2)} onSave={M('req_completion_rate')} />
            </Field>
            <Field label="Limite taille film (renommage)">
              <TextInput value={cfg.movie_rename_limit ?? '100M'} onSave={M('movie_rename_limit')} mono placeholder="100M" />
            </Field>
            <Field label="Limite taille episode (renommage)">
              <TextInput value={cfg.episode_rename_limit ?? '20M'} onSave={M('episode_rename_limit')} mono placeholder="20M" />
            </Field>
            <Field label="Limite taille telechargement" help="0 = illimitee">
              <TextInput value={cfg.size_limit ?? '0'} onSave={M('size_limit')} mono placeholder="0" />
            </Field>
          </div>
        )}

        {tab === 'postproc' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-0">
            <Field label="Activer extraction RAR">
              <Toggle value={!!cfg.enable_unrar} onSave={B('enable_unrar')} />
            </Field>
            <Field label="Activer 7-Zip">
              <Toggle value={!!cfg.enable_7zip} onSave={B('enable_7zip')} />
            </Field>
            <Field label="Activer jonction fichiers">
              <Toggle value={!!cfg.enable_filejoin} onSave={B('enable_filejoin')} />
            </Field>
            <Field label="Activer jonction TS">
              <Toggle value={!!cfg.enable_tsjoin} onSave={B('enable_tsjoin')} />
            </Field>
            <Field label="Activer nettoyage PAR2">
              <Toggle value={!!cfg.enable_par_cleanup} onSave={B('enable_par_cleanup')} />
            </Field>
            <Field label="Traiter PAR2 non-emballes">
              <Toggle value={!!cfg.process_unpacked_par2} onSave={B('process_unpacked_par2')} />
            </Field>
            <Field label="Activer tous PAR2">
              <Toggle value={!!cfg.enable_all_par} onSave={B('enable_all_par')} />
            </Field>
            <Field label="Pre-check">
              <Toggle value={!!cfg.pre_check} onSave={B('pre_check')} />
            </Field>
            <Field label="Post-traitement securise">
              <Toggle value={!!cfg.safe_postproc} onSave={B('safe_postproc')} />
            </Field>
            <Field label="Pause pendant post-traitement">
              <Toggle value={!!cfg.pause_on_post_processing} onSave={B('pause_on_post_processing')} />
            </Field>
            <Field label="Pause si archive avec mot de passe">
              <Toggle value={!!cfg.pause_on_pwrar} onSave={B('pause_on_pwrar')} />
            </Field>
            <Field label="Script peut echouer">
              <Toggle value={!!cfg.script_can_fail} onSave={B('script_can_fail')} />
            </Field>
            <Field label="Renommer dossier">
              <Toggle value={!!cfg.folder_rename} onSave={B('folder_rename')} />
            </Field>
            <Field label="Remplacer espaces par underscore">
              <Toggle value={!!cfg.replace_spaces} onSave={B('replace_spaces')} />
            </Field>
            <Field label="Remplacer underscores par espaces">
              <Toggle value={!!cfg.replace_underscores} onSave={B('replace_underscores')} />
            </Field>
            <Field label="Remplacer points par espaces">
              <Toggle value={!!cfg.replace_dots} onSave={B('replace_dots')} />
            </Field>
            <Field label="Ecraser fichiers existants">
              <Toggle value={!!cfg.overwrite_files} onSave={B('overwrite_files')} />
            </Field>
            <Field label="Ignorer dates RAR">
              <Toggle value={!!cfg.ignore_unrar_dates} onSave={B('ignore_unrar_dates')} />
            </Field>
            <Field label="Desassemblage recursif">
              <Toggle value={!!cfg.enable_recursive} onSave={B('enable_recursive')} />
            </Field>
            <Field label="Desassemblage plat">
              <Toggle value={!!cfg.flat_unpack} onSave={B('flat_unpack')} />
            </Field>
            <Field label="Tri saison">
              <Toggle value={!!cfg.enable_season_sorting} onSave={B('enable_season_sorting')} />
            </Field>
            <Field label="Sauvegarde avant doublon">
              <Toggle value={!!cfg.backup_for_duplicates} onSave={B('backup_for_duplicates')} />
            </Field>
            <Field label="Script pre-traitement">
              <TextInput value={cfg.pre_script ?? ''} onSave={M('pre_script')} mono />
            </Field>
            <Field label="Script fin de queue">
              <TextInput value={cfg.end_queue_script ?? ''} onSave={M('end_queue_script')} mono />
            </Field>
            <Field label="Parametres PAR2 custom">
              <TextInput value={cfg.par_option ?? ''} onSave={M('par_option')} mono />
            </Field>
            <Field label="Parametres UnRAR custom">
              <TextInput value={cfg.unrar_parameters ?? ''} onSave={M('unrar_parameters')} mono />
            </Field>
          </div>
        )}

        {tab === 'notifications' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-0">
            <div className="text-xs text-slate-500 pb-4">Configuration des notifications par email</div>
            <Field label="Serveur SMTP">
              <TextInput value={cfg.email_server ?? ''} onSave={M('email_server')} mono />
            </Field>
            <Field label="Expediteur">
              <TextInput value={cfg.email_from ?? ''} onSave={M('email_from')} />
            </Field>
            <Field label="Destinataire(s)" help="Separees par virgule">
              <TextInput value={Array.isArray(cfg.email_to) ? cfg.email_to.join(',') : (cfg.email_to ?? '')} onSave={M('email_to')} />
            </Field>
            <Field label="Compte SMTP">
              <TextInput value={cfg.email_account ?? ''} onSave={M('email_account')} />
            </Field>
            <Field label="Mot de passe SMTP">
              <TextInput value={cfg.email_pwd ?? ''} onSave={M('email_pwd')} />
            </Field>
            <Field label="Email fin de job">
              <Toggle value={!!cfg.email_endjob} onSave={B('email_endjob')} />
            </Field>
            <Field label="Email complet (avec log)">
              <Toggle value={!!cfg.email_full} onSave={B('email_full')} />
            </Field>
            <Field label="Email flux RSS">
              <Toggle value={!!cfg.email_rss} onSave={B('email_rss')} />
            </Field>
          </div>
        )}

        {tab === 'security' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-0">
            <Field label="Cle API">
              <div className="font-mono text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg">{cfg.api_key ?? '-'}</div>
            </Field>
            <Field label="Cle NZB">
              <div className="font-mono text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg">{cfg.nzb_key ?? '-'}</div>
            </Field>
            <Field label="Nom d'utilisateur">
              <TextInput value={cfg.username ?? ''} onSave={M('username')} />
            </Field>
            <Field label="Verification HTTPS">
              <Toggle value={!!cfg.enable_https_verification} onSave={B('enable_https_verification')} />
            </Field>
            <Field label="Proxy SOCKS5">
              <TextInput value={cfg.socks5_proxy_url ?? ''} onSave={M('socks5_proxy_url')} mono placeholder="socks5://..." />
            </Field>
            <Field label="Hotes autorises (whitelist)" help="Un par ligne">
              <TextInput value={Array.isArray(cfg.host_whitelist) ? cfg.host_whitelist.join(',') : ''} onSave={M('host_whitelist')} mono />
            </Field>
            <Field label="Plages IP locales" help="Ex: 192.168.0.0/24">
              <TextInput value={Array.isArray(cfg.local_ranges) ? cfg.local_ranges.join(',') : ''} onSave={M('local_ranges')} mono />
            </Field>
            <Field label="Options X-Frame">
              <Toggle value={!!cfg.x_frame_options} onSave={B('x_frame_options')} />
            </Field>
            <Field label="Autoriser ancien SSL/TLS">
              <Toggle value={!!cfg.allow_old_ssl_tls} onSave={B('allow_old_ssl_tls')} />
            </Field>
            <Field label="Logging API">
              <Toggle value={!!cfg.api_logging} onSave={B('api_logging')} />
            </Field>
            <Field label="Avertissements API">
              <Toggle value={!!cfg.api_warnings} onSave={B('api_warnings')} />
            </Field>
            <Field label="Verifier header XFF">
              <Toggle value={!!cfg.verify_xff_header} onSave={B('verify_xff_header')} />
            </Field>
          </div>
        )}

        {tab === 'quota' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-0">
            <Field label="Taille du quota" help="Ex: 100G, 2T. Vide = pas de quota.">
              <TextInput value={cfg.quota_size ?? ''} onSave={M('quota_size')} mono placeholder="100G" />
            </Field>
            <Field label="Periode du quota">
              <SelectInput value={cfg.quota_period ?? 'm'} onSave={M('quota_period')}
                options={[{v:'d',l:'Journalier'},{v:'w',l:'Hebdomadaire'},{v:'m',l:'Mensuel'}]} />
            </Field>
            <Field label="Jour de reinitialisation" help="Jour du mois (1-31) ou semaine (1=lundi)">
              <TextInput value={cfg.quota_day ?? ''} onSave={M('quota_day')} placeholder="1" />
            </Field>
            <Field label="Reprise auto apres quota">
              <Toggle value={!!cfg.quota_resume} onSave={B('quota_resume')} />
            </Field>
          </div>
        )}

        {tab === 'advanced' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-0">
            <Field label="Niveau de log">
              <SelectInput value={logging.log_level ?? 1} onSave={S('logging')('log_level')}
                options={[{v:0,l:'Erreurs seulement'},{v:1,l:'Normal'},{v:2,l:'Verbeux'},{v:3,l:'Debug'}]} />
            </Field>
            <Field label="Taille max log (octets)">
              <TextInput value={String(logging.max_log_size ?? 5242880)} onSave={S('logging')('max_log_size')} />
            </Field>
            <Field label="Sauvegardes de logs">
              <TextInput value={String(logging.log_backups ?? 5)} onSave={S('logging')('log_backups')} />
            </Field>
            <Field label="Threads recepteur">
              <TextInput value={String(cfg.receive_threads ?? 4)} onSave={M('receive_threads')} />
            </Field>
            <Field label="Taille max queue assembleur">
              <TextInput value={String(cfg.assembler_max_queue_size ?? 30)} onSave={M('assembler_max_queue_size')} />
            </Field>
            <Field label="Retries URL max">
              <TextInput value={String(cfg.max_url_retries ?? 10)} onSave={M('max_url_retries')} />
            </Field>
            <Field label="Taux frequence RSS (min)">
              <TextInput value={String(cfg.rss_rate ?? 60)} onSave={M('rss_rate')} />
            </Field>
            <Field label="Serveurs IPv6">
              <Toggle value={!!cfg.ipv6_servers} onSave={B('ipv6_servers')} />
            </Field>
            <Field label="Hebergement IPv6">
              <Toggle value={!!cfg.ipv6_hosting} onSave={B('ipv6_hosting')} />
            </Field>
            <Field label="Pas de penalites">
              <Toggle value={!!cfg.no_penalties} onSave={B('no_penalties')} />
            </Field>
            <Field label="Garder systeme eveille">
              <Toggle value={!!cfg.keep_awake} onSave={B('keep_awake')} />
            </Field>
            <Field label="Retention historique">
              <SelectInput value={cfg.history_retention_option ?? 'all'} onSave={M('history_retention_option')}
                options={[{v:'all',l:'Tout garder'},{v:'days',l:'Par jours'},{v:'number',l:'Par nombre'}]} />
            </Field>
            <Field label="Valeur retention historique">
              <TextInput value={String(cfg.history_retention_number ?? 1)} onSave={M('history_retention_number')} />
            </Field>
            <Field label="IP sortante NNTP">
              <TextInput value={cfg.outgoing_nntp_ip ?? ''} onSave={M('outgoing_nntp_ip')} mono />
            </Field>
            <Field label="Hote self-test">
              <TextInput value={cfg.selftest_host ?? 'self-test.sabnzbd.org'} onSave={M('selftest_host')} mono />
            </Field>
            <Field label="Permissions fichiers">
              <TextInput value={cfg.permissions ?? '777'} onSave={M('permissions')} mono placeholder="777" />
            </Field>
          </div>
        )}

      </div>
    </div>
  )
}
