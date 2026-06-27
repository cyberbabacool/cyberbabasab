import { useState } from 'react'
import { Save, Check, Power, RefreshCw } from 'lucide-react'
import { useConfig } from '../hooks/useSab'
import { usePrefs } from '../hooks/usePrefs'
import axios from 'axios'

type Tab = 'general' | 'folders' | 'switches' | 'postproc' | 'notifications' | 'security' | 'quota' | 'advanced'

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
      style={{ display:'flex', alignItems:'center', width:'44px', height:'24px', borderRadius:'12px', padding:'2px', border:'none', cursor:'pointer', backgroundColor: value ? 'var(--accent)' : '#475569', transition:'background-color 200ms', boxSizing:'border-box', flexShrink:0, outline:'none' }}>
      <span style={{ display:'block', width:'20px', height:'20px', borderRadius:'50%', backgroundColor:'white', boxShadow:'0 1px 3px rgba(0,0,0,0.4)', transition:'transform 200ms ease-in-out', flexShrink:0, transform: value ? 'translateX(20px)' : 'translateX(0px)' }} />
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
  const { data: configData, refresh } = useConfig()

  const { t } = usePrefs()
  const [tab, setTab] = useState<Tab>('general')
  const [saved, setSaved] = useState(false)
  const [speedVal, setSpeedVal] = useState('')

  const TABS: { key: Tab; label: string }[] = [
    { key: 'general',       label: t.set_tab_general   },
    { key: 'folders',       label: t.set_tab_folders   },
    { key: 'switches',      label: t.set_tab_switches  },
    { key: 'postproc',      label: t.set_tab_postproc  },
    { key: 'notifications', label: t.set_tab_notif     },
    { key: 'security',      label: t.set_tab_security  },
    { key: 'quota',         label: t.set_tab_quota     },
    { key: 'advanced',      label: t.set_tab_advanced  },
  ]

  if (!configData) return <div className="text-slate-500 p-4">{t.common_loading}</div>

  const cfg = configData?.config?.misc ?? {}
  const logging = configData?.config?.logging ?? {}

  const M = (key: string) => async (value: string) => {
    await axios.get(`/api/config/save?section=misc&keyword=${key}&value=${encodeURIComponent(value)}`)
    setSaved(true); setTimeout(() => setSaved(false), 2000); refresh()
  }
  const S = (section: string) => (key: string) => async (value: string) => {
    await axios.get(`/api/config/save?section=${section}&keyword=${key}&value=${encodeURIComponent(value)}`)
    setSaved(true); setTimeout(() => setSaved(false), 2000); refresh()
  }
  const B = (key: string) => (v: boolean) => M(key)(v ? '1' : '0')

  const handleSpeed = async () => {
    if (speedVal) { await M('bandwidth_perc')(speedVal); setSpeedVal('') }
  }

  const confirmShutdown = async () => {
    if (confirm(t.set_confirm_shutdown)) await axios.get('/api/shutdown')
  }
  const confirmRestart = async () => {
    if (confirm(t.set_confirm_restart)) await axios.get('/api/restart')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">{t.set_page_title}</h1>
          <p className="text-slate-400 mt-1">{t.set_page_sub}</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs"><Check size={12} /> {t.set_saved}</div>}
          <button onClick={confirmRestart} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold">
            <RefreshCw size={12} /> {t.set_restart}
          </button>
          <button onClick={confirmShutdown} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold">
            <Power size={12} /> {t.set_shutdown}
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-800 overflow-x-auto pb-0">
        {TABS.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${ tab === tb.key ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white' }`}>
            {tb.label}
          </button>
        ))}
      </div>

      <div className="max-w-3xl space-y-1">
        {tab === 'general' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-0">
            <Field label={t.set_gen_speed_limit} help={`${t.set_gen_speed_help}. ${t.dash_limit}: ${cfg.bandwidth_perc ?? 0}%`}>
              <div className="flex gap-2">
                <input type="number" min="0" max="100" value={speedVal} onChange={e => setSpeedVal(e.target.value)}
                  placeholder={cfg.bandwidth_perc?.toString() ?? '100'}
                  className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500" />
                <button onClick={handleSpeed} className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-semibold">OK</button>
              </div>
            </Field>
            <Field label={t.set_gen_bw_max} help={t.set_gen_bw_help}>
              <TextInput value={cfg.bandwidth_max ?? ''} onSave={M('bandwidth_max')} mono placeholder="100M" />
            </Field>
            <Field label={t.set_gen_cache} help={t.set_gen_cache_help}>
              <TextInput value={cfg.cache_limit ?? ''} onSave={M('cache_limit')} mono placeholder="1024M" />
            </Field>
            <Field label={t.set_gen_after_complete}>
              <SelectInput value={cfg.queue_complete ?? ''} onSave={M('queue_complete')}
                options={[{v:'',l:t.opt_none},{v:'shutdown_pc',l:t.opt_shutdown_pc},{v:'hibernate_pc',l:t.opt_hibernate},{v:'standby_pc',l:t.opt_standby},{v:'shutdown_program',l:t.opt_shutdown_sab},{v:'pause_post',l:t.opt_pause_post}]} />
            </Field>
            <Field label={t.set_gen_start_paused}><Toggle value={!!cfg.start_paused} onSave={B('start_paused')} /></Field>
            <Field label={t.set_gen_keep_paused}><Toggle value={!!cfg.preserve_paused_state} onSave={B('preserve_paused_state')} /></Field>
            <Field label={t.set_gen_auto_disc}><Toggle value={!!cfg.auto_disconnect} onSave={B('auto_disconnect')} /></Field>
            <Field label={t.set_gen_check_new}><Toggle value={!!cfg.check_new_rel} onSave={B('check_new_rel')} /></Field>
            <Field label={t.set_gen_language}>
              <SelectInput value={cfg.language ?? 'en'} onSave={M('language')}
                options={[{v:'en',l:'English'},{v:'fr',l:'Francais'},{v:'de',l:'Deutsch'},{v:'nl',l:'Nederlands'},{v:'es',l:'Espanol'}]} />
            </Field>
            <Field label={t.set_gen_refresh}>
              <SelectInput value={cfg.refresh_rate ?? 1} onSave={M('refresh_rate')}
                options={[{v:1,l:'1s'},{v:2,l:'2s'},{v:5,l:'5s'},{v:10,l:'10s'}]} />
            </Field>
            <Field label={t.set_gen_queue_limit}><TextInput value={String(cfg.queue_limit ?? 20)} onSave={M('queue_limit')} /></Field>
            <Field label={t.set_gen_art_tries}><TextInput value={String(cfg.max_art_tries ?? 3)} onSave={M('max_art_tries')} /></Field>
            <Field label={t.set_gen_prop_delay} help={t.set_gen_prop_help}>
              <TextInput value={String(cfg.propagation_delay ?? 0)} onSave={M('propagation_delay')} />
            </Field>
          </div>
        )}

        {tab === 'folders' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-0">
            <Field label={t.set_fol_dl_dir}><TextInput value={cfg.download_dir ?? ''} onSave={M('download_dir')} mono /></Field>
            <Field label={t.set_fol_dl_free} help={t.set_fol_dl_help}><TextInput value={cfg.download_free ?? ''} onSave={M('download_free')} mono placeholder="1G" /></Field>
            <Field label={t.set_fol_co_dir}><TextInput value={cfg.complete_dir ?? ''} onSave={M('complete_dir')} mono /></Field>
            <Field label={t.set_fol_co_free}><TextInput value={cfg.complete_free ?? ''} onSave={M('complete_free')} mono placeholder="1G" /></Field>
            <Field label={t.set_fol_auto_resume}><Toggle value={!!cfg.fulldisk_autoresume} onSave={B('fulldisk_autoresume')} /></Field>
            <Field label={t.set_fol_script_dir}><TextInput value={cfg.script_dir ?? ''} onSave={M('script_dir')} mono /></Field>
            <Field label={t.set_fol_nzb_backup}><TextInput value={cfg.nzb_backup_dir ?? ''} onSave={M('nzb_backup_dir')} mono /></Field>
            <Field label={t.set_fol_dirscan}><TextInput value={cfg.dirscan_dir ?? ''} onSave={M('dirscan_dir')} mono /></Field>
            <Field label={t.set_fol_dirscan_spd}><TextInput value={String(cfg.dirscan_speed ?? 5)} onSave={M('dirscan_speed')} /></Field>
            <Field label={t.set_fol_pw_file}><TextInput value={cfg.password_file ?? ''} onSave={M('password_file')} mono /></Field>
            <Field label={t.set_fol_log_dir}><TextInput value={cfg.log_dir ?? ''} onSave={M('log_dir')} mono /></Field>
            <Field label={t.set_fol_max_folder}><TextInput value={String(cfg.max_foldername_length ?? 246)} onSave={M('max_foldername_length')} /></Field>
            <Field label={t.set_fol_ext_drive} help={t.set_fol_ext_help}><TextInput value={String(cfg.wait_ext_drive ?? 5)} onSave={M('wait_ext_drive')} /></Field>
          </div>
        )}

        {tab === 'switches' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-0">
            <Field label={t.set_swi_direct_unpack} help={t.set_swi_direct_help}><Toggle value={!!cfg.direct_unpack} onSave={B('direct_unpack')} /></Field>
            <Field label={t.set_swi_direct_write}><Toggle value={!!cfg.direct_write} onSave={B('direct_write')} /></Field>
            <Field label={t.set_swi_direct_thr}>
              <SelectInput value={cfg.direct_unpack_threads ?? 3} onSave={M('direct_unpack_threads')} options={[1,2,3,4,6,8].map(v => ({v, l: String(v)}))} />
            </Field>
            <Field label={t.set_swi_sfv}><Toggle value={!!cfg.sfv_check} onSave={B('sfv_check')} /></Field>
            <Field label={t.set_swi_auto_sort}>
              <SelectInput value={cfg.auto_sort ?? ''} onSave={M('auto_sort')}
                options={[{v:'',l:t.opt_none},{v:'avg_age',l:t.opt_age},{v:'name',l:t.queue_sort_name},{v:'size',l:t.queue_sort_size}]} />
            </Field>
            <Field label={t.set_swi_top_only}><Toggle value={!!cfg.top_only} onSave={B('top_only')} /></Field>
            <Field label={t.set_swi_no_dupes} help={t.set_swi_no_dupes_help}>
              <SelectInput value={cfg.no_dupes ?? 0} onSave={M('no_dupes')}
                options={[{v:0,l:t.opt_disabled},{v:1,l:t.opt_warn},{v:2,l:t.opt_delete},{v:4,l:t.opt_ignore}]} />
            </Field>
            <Field label={t.set_swi_no_ser_dup}><Toggle value={!!cfg.no_series_dupes} onSave={B('no_series_dupes')} /></Field>
            <Field label={t.set_swi_smart_dup}>
              <SelectInput value={cfg.no_smart_dupes ?? 0} onSave={M('no_smart_dupes')}
                options={[{v:0,l:t.opt_disabled},{v:1,l:t.opt_warn},{v:2,l:t.opt_delete},{v:4,l:t.opt_ignore}]} />
            </Field>
            <Field label={t.set_swi_proper_dup}><Toggle value={!!cfg.dupes_propercheck} onSave={B('dupes_propercheck')} /></Field>
            <Field label={t.set_swi_warn_dup}><Toggle value={!!cfg.warn_dupl_jobs} onSave={B('warn_dupl_jobs')} /></Field>
            <Field label={t.set_swi_samples}><Toggle value={!!cfg.ignore_samples} onSave={B('ignore_samples')} /></Field>
            <Field label={t.set_swi_deobfusc}><Toggle value={!!cfg.deobfuscate_final_filenames} onSave={B('deobfuscate_final_filenames')} /></Field>
            <Field label={t.set_swi_incomplete}><Toggle value={!!cfg.allow_incomplete_nzb} onSave={B('allow_incomplete_nzb')} /></Field>
            <Field label={t.set_swi_new_on_fail}><Toggle value={!!cfg.new_nzb_on_failure} onSave={B('new_nzb_on_failure')} /></Field>
            <Field label={t.set_swi_hopeless}><Toggle value={!!cfg.fail_hopeless_jobs} onSave={B('fail_hopeless_jobs')} /></Field>
            <Field label={t.set_swi_fast_fail}><Toggle value={!!cfg.fast_fail} onSave={B('fast_fail')} /></Field>
            <Field label={t.set_swi_req_comp}><TextInput value={String(cfg.req_completion_rate ?? 100.2)} onSave={M('req_completion_rate')} /></Field>
            <Field label={t.set_swi_movie_lim}><TextInput value={cfg.movie_rename_limit ?? '100M'} onSave={M('movie_rename_limit')} mono placeholder="100M" /></Field>
            <Field label={t.set_swi_ep_lim}><TextInput value={cfg.episode_rename_limit ?? '20M'} onSave={M('episode_rename_limit')} mono placeholder="20M" /></Field>
            <Field label={t.set_swi_size_lim} help={t.set_swi_size_help}><TextInput value={cfg.size_limit ?? '0'} onSave={M('size_limit')} mono placeholder="0" /></Field>
          </div>
        )}

        {tab === 'postproc' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-0">
            <Field label={t.set_pos_unrar}><Toggle value={!!cfg.enable_unrar} onSave={B('enable_unrar')} /></Field>
            <Field label={t.set_pos_7zip}><Toggle value={!!cfg.enable_7zip} onSave={B('enable_7zip')} /></Field>
            <Field label={t.set_pos_filejoin}><Toggle value={!!cfg.enable_filejoin} onSave={B('enable_filejoin')} /></Field>
            <Field label={t.set_pos_tsjoin}><Toggle value={!!cfg.enable_tsjoin} onSave={B('enable_tsjoin')} /></Field>
            <Field label={t.set_pos_par_clean}><Toggle value={!!cfg.enable_par_cleanup} onSave={B('enable_par_cleanup')} /></Field>
            <Field label={t.set_pos_unpack_par}><Toggle value={!!cfg.process_unpacked_par2} onSave={B('process_unpacked_par2')} /></Field>
            <Field label={t.set_pos_all_par}><Toggle value={!!cfg.enable_all_par} onSave={B('enable_all_par')} /></Field>
            <Field label={t.set_pos_pre_check}><Toggle value={!!cfg.pre_check} onSave={B('pre_check')} /></Field>
            <Field label={t.set_pos_safe}><Toggle value={!!cfg.safe_postproc} onSave={B('safe_postproc')} /></Field>
            <Field label={t.set_pos_pause_pp}><Toggle value={!!cfg.pause_on_post_processing} onSave={B('pause_on_post_processing')} /></Field>
            <Field label={t.set_pos_pause_pw}><Toggle value={!!cfg.pause_on_pwrar} onSave={B('pause_on_pwrar')} /></Field>
            <Field label={t.set_pos_script_fail}><Toggle value={!!cfg.script_can_fail} onSave={B('script_can_fail')} /></Field>
            <Field label={t.set_pos_folder_ren}><Toggle value={!!cfg.folder_rename} onSave={B('folder_rename')} /></Field>
            <Field label={t.set_pos_spaces}><Toggle value={!!cfg.replace_spaces} onSave={B('replace_spaces')} /></Field>
            <Field label={t.set_pos_underscores}><Toggle value={!!cfg.replace_underscores} onSave={B('replace_underscores')} /></Field>
            <Field label={t.set_pos_dots}><Toggle value={!!cfg.replace_dots} onSave={B('replace_dots')} /></Field>
            <Field label={t.set_pos_overwrite}><Toggle value={!!cfg.overwrite_files} onSave={B('overwrite_files')} /></Field>
            <Field label={t.set_pos_rar_dates}><Toggle value={!!cfg.ignore_unrar_dates} onSave={B('ignore_unrar_dates')} /></Field>
            <Field label={t.set_pos_recursive}><Toggle value={!!cfg.enable_recursive} onSave={B('enable_recursive')} /></Field>
            <Field label={t.set_pos_flat}><Toggle value={!!cfg.flat_unpack} onSave={B('flat_unpack')} /></Field>
            <Field label={t.set_pos_season}><Toggle value={!!cfg.enable_season_sorting} onSave={B('enable_season_sorting')} /></Field>
            <Field label={t.set_pos_backup_dup}><Toggle value={!!cfg.backup_for_duplicates} onSave={B('backup_for_duplicates')} /></Field>
            <Field label={t.set_pos_pre_script}><TextInput value={cfg.pre_script ?? ''} onSave={M('pre_script')} mono /></Field>
            <Field label={t.set_pos_end_script}><TextInput value={cfg.end_queue_script ?? ''} onSave={M('end_queue_script')} mono /></Field>
            <Field label={t.set_pos_par2_opts}><TextInput value={cfg.par_option ?? ''} onSave={M('par_option')} mono /></Field>
            <Field label={t.set_pos_unrar_opts}><TextInput value={cfg.unrar_parameters ?? ''} onSave={M('unrar_parameters')} mono /></Field>
          </div>
        )}

        {tab === 'notifications' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-0">
            <div className="text-xs text-slate-500 pb-4">{t.set_not_email_hint}</div>
            <Field label={t.set_not_smtp}><TextInput value={cfg.email_server ?? ''} onSave={M('email_server')} mono /></Field>
            <Field label={t.set_not_from}><TextInput value={cfg.email_from ?? ''} onSave={M('email_from')} /></Field>
            <Field label={t.set_not_to} help={t.set_not_to_help}>
              <TextInput value={Array.isArray(cfg.email_to) ? cfg.email_to.join(',') : (cfg.email_to ?? '')} onSave={M('email_to')} />
            </Field>
            <Field label={t.set_not_account}><TextInput value={cfg.email_account ?? ''} onSave={M('email_account')} /></Field>
            <Field label={t.set_not_pwd}><TextInput value={cfg.email_pwd ?? ''} onSave={M('email_pwd')} /></Field>
            <Field label={t.set_not_endjob}><Toggle value={!!cfg.email_endjob} onSave={B('email_endjob')} /></Field>
            <Field label={t.set_not_full}><Toggle value={!!cfg.email_full} onSave={B('email_full')} /></Field>
            <Field label={t.set_not_rss}><Toggle value={!!cfg.email_rss} onSave={B('email_rss')} /></Field>
          </div>
        )}

        {tab === 'security' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-0">
            <Field label={t.set_sec_api_key}>
              <div className="font-mono text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg">{cfg.api_key ?? '-'}</div>
            </Field>
            <Field label={t.set_sec_nzb_key}>
              <div className="font-mono text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg">{cfg.nzb_key ?? '-'}</div>
            </Field>
            <Field label={t.set_sec_username}><TextInput value={cfg.username ?? ''} onSave={M('username')} /></Field>
            <Field label={t.set_sec_https}><Toggle value={!!cfg.enable_https_verification} onSave={B('enable_https_verification')} /></Field>
            <Field label={t.set_sec_socks}><TextInput value={cfg.socks5_proxy_url ?? ''} onSave={M('socks5_proxy_url')} mono placeholder="socks5://..." /></Field>
            <Field label={t.set_sec_whitelist} help={t.set_sec_white_help}>
              <TextInput value={Array.isArray(cfg.host_whitelist) ? cfg.host_whitelist.join(',') : ''} onSave={M('host_whitelist')} mono />
            </Field>
            <Field label={t.set_sec_ranges} help={t.set_sec_ranges_help}>
              <TextInput value={Array.isArray(cfg.local_ranges) ? cfg.local_ranges.join(',') : ''} onSave={M('local_ranges')} mono />
            </Field>
            <Field label={t.set_sec_xframe}><Toggle value={!!cfg.x_frame_options} onSave={B('x_frame_options')} /></Field>
            <Field label={t.set_sec_old_ssl}><Toggle value={!!cfg.allow_old_ssl_tls} onSave={B('allow_old_ssl_tls')} /></Field>
            <Field label={t.set_sec_api_log}><Toggle value={!!cfg.api_logging} onSave={B('api_logging')} /></Field>
            <Field label={t.set_sec_api_warn}><Toggle value={!!cfg.api_warnings} onSave={B('api_warnings')} /></Field>
            <Field label={t.set_sec_xff}><Toggle value={!!cfg.verify_xff_header} onSave={B('verify_xff_header')} /></Field>
          </div>
        )}

        {tab === 'quota' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-0">
            <Field label={t.set_quo_size} help={t.set_quo_size_help}><TextInput value={cfg.quota_size ?? ''} onSave={M('quota_size')} mono placeholder="100G" /></Field>
            <Field label={t.set_quo_period}>
              <SelectInput value={cfg.quota_period ?? 'm'} onSave={M('quota_period')}
                options={[{v:'d',l:t.opt_daily},{v:'w',l:t.opt_weekly},{v:'m',l:t.opt_monthly}]} />
            </Field>
            <Field label={t.set_quo_day} help={t.set_quo_day_help}><TextInput value={cfg.quota_day ?? ''} onSave={M('quota_day')} placeholder="1" /></Field>
            <Field label={t.set_quo_resume}><Toggle value={!!cfg.quota_resume} onSave={B('quota_resume')} /></Field>
          </div>
        )}

        {tab === 'advanced' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-0">
            <Field label={t.set_adv_log_level}>
              <SelectInput value={logging.log_level ?? 1} onSave={S('logging')('log_level')}
                options={[{v:0,l:t.opt_errors_only},{v:1,l:t.opt_normal},{v:2,l:t.opt_verbose},{v:3,l:t.opt_debug}]} />
            </Field>
            <Field label={t.set_adv_log_size}><TextInput value={String(logging.max_log_size ?? 5242880)} onSave={S('logging')('max_log_size')} /></Field>
            <Field label={t.set_adv_log_back}><TextInput value={String(logging.log_backups ?? 5)} onSave={S('logging')('log_backups')} /></Field>
            <Field label={t.set_adv_recv_thr}><TextInput value={String(cfg.receive_threads ?? 4)} onSave={M('receive_threads')} /></Field>
            <Field label={t.set_adv_asm_queue}><TextInput value={String(cfg.assembler_max_queue_size ?? 30)} onSave={M('assembler_max_queue_size')} /></Field>
            <Field label={t.set_adv_url_retry}><TextInput value={String(cfg.max_url_retries ?? 10)} onSave={M('max_url_retries')} /></Field>
            <Field label={t.set_adv_rss_rate}><TextInput value={String(cfg.rss_rate ?? 60)} onSave={M('rss_rate')} /></Field>
            <Field label={t.set_adv_ipv6}><Toggle value={!!cfg.ipv6_servers} onSave={B('ipv6_servers')} /></Field>
            <Field label={t.set_adv_ipv6_host}><Toggle value={!!cfg.ipv6_hosting} onSave={B('ipv6_hosting')} /></Field>
            <Field label={t.set_adv_no_penal}><Toggle value={!!cfg.no_penalties} onSave={B('no_penalties')} /></Field>
            <Field label={t.set_adv_awake}><Toggle value={!!cfg.keep_awake} onSave={B('keep_awake')} /></Field>
            <Field label={t.set_adv_hist_ret}>
              <SelectInput value={cfg.history_retention_option ?? 'all'} onSave={M('history_retention_option')}
                options={[{v:'all',l:t.opt_keep_all},{v:'days',l:t.opt_by_days},{v:'number',l:t.opt_by_number}]} />
            </Field>
            <Field label={t.set_adv_hist_val}><TextInput value={String(cfg.history_retention_number ?? 1)} onSave={M('history_retention_number')} /></Field>
            <Field label={t.set_adv_nntp_ip}><TextInput value={cfg.outgoing_nntp_ip ?? ''} onSave={M('outgoing_nntp_ip')} mono /></Field>
            <Field label={t.set_adv_selftest}><TextInput value={cfg.selftest_host ?? 'self-test.sabnzbd.org'} onSave={M('selftest_host')} mono /></Field>
            <Field label={t.set_adv_perms}><TextInput value={cfg.permissions ?? '777'} onSave={M('permissions')} mono placeholder="777" /></Field>
          </div>
        )}

      </div>
    </div>
  )
}
