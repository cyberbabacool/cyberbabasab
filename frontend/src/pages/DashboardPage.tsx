import { useState } from 'react'
import { Pause, Play, HardDrive, Clock, Download, Maximize, Minimize, GripVertical, RotateCcw, ChevronRight, ChevronLeft, CheckCircle, XCircle } from 'lucide-react'
import { useQueue, useHistory } from '../hooks/useSab'
import { usePrefs } from '../hooks/usePrefs'
import type { Page } from '../App'
import { AddNzbModal } from '../components/AddNzbModal'
import { PageDropZone } from '../components/PageDropZone'
import { useSpeedHistory, SpeedSparkline } from '../components/SpeedHistory'
import { SpeedGauge } from '../components/SpeedGauge'
import { useDashboardLayout, type TileId } from '../hooks/useDashboardLayout'
import { CatBadge } from '../components/useCategoryColors'

interface Props { onNavigate: (p: Page) => void }

function StorageBar({ used, total, label }: { used: string; total: string; label: string }) {
  const { t } = usePrefs()
  const usedN = parseFloat(used) || 0
  const totalN = parseFloat(total) || 1
  const pct = Math.min((usedN / totalN) * 100, 100)
  const free = totalN - usedN
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span>{t.dash_free_space}: {free.toFixed(1)} GB</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function DashboardPage({ onNavigate }: Props) {
  const { data, pause, resume, refresh: refreshQueue } = useQueue()
  const { t, prefs } = usePrefs()
  const { data: historySlots, loading: histLoading } = useHistory(500)
  const [showAdd, setShowAdd] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [histPage, setHistPage] = useState(0)
  const speedPoints = useSpeedHistory(data?.kbpersec ?? '0')
  const { order, dragId, onDragStart, onDragOver, onDrop, onDragEnd, resetLayout } = useDashboardLayout()

  const histLimit = prefs.historyLimit ?? 25
  const histTotalPages = Math.ceil(historySlots.length / histLimit)
  const histPage_ = Math.min(histPage, Math.max(0, histTotalPages - 1))
  const histVisible = historySlots.slice(histPage_ * histLimit, (histPage_ + 1) * histLimit)

  if (!data) return <div className="text-slate-500 p-4">{t.common_loading}</div>

  const isActive = data.noofslots > 0
  const jobs = data.slots ?? []

  const TileWrapper = ({ id, children }: { id: TileId; children: React.ReactNode }) => (
    <div
      draggable
      onDragStart={e => onDragStart(e, id)}
      onDragOver={e => onDragOver(e, id)}
      onDrop={e => onDrop(e)}
      onDragEnd={onDragEnd}
      style={{
        opacity: dragId === id ? 0.4 : 1,
      }}
      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center justify-end mb-1 -mt-1">
        <GripVertical size={14} className="text-slate-700" />
      </div>
      {children}
    </div>
  )

  const tiles: Record<TileId, React.ReactNode> = {
    speed: (
      <>
        <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
          <span className="uppercase tracking-widest">{t.dash_speed}</span>
        </div>
        <SpeedGauge
          kbpersec={data.kbpersec}
          speedlimit={data.speedlimit}
          maxMbps={150}
          gaugeType={(prefs.gaugeType ?? 1) as any}
        />
        <div className="pt-3 border-t border-slate-800 mt-2">
          <SpeedSparkline points={speedPoints} />
        </div>
      </>
    ),
    storage: (
      <>
        <div className="flex items-center gap-2 text-slate-500 text-xs mb-4"><HardDrive size={13} /><span className="uppercase tracking-widest">{t.dash_storage}</span></div>
        <div className="space-y-4">
          <StorageBar used={data.diskspace1} total={data.diskspacetotal1} label={t.dash_download_folder} />
          <StorageBar used={data.diskspace2} total={data.diskspacetotal2} label={t.dash_complete_folder} />
          <div className="text-xs text-slate-500">{t.dash_cache}: {data.cache_size}</div>
        </div>
      </>
    ),
    progress: isActive ? (
      <>
        <div className="flex items-center gap-2 text-slate-500 text-xs mb-3"><Clock size={13} /><span className="uppercase tracking-widest">{t.dash_global_progress}</span></div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>{t.dash_global}</span><span>{data.mbleft} MB {t.dash_remaining}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${Math.min(100 - (parseFloat(data.mbleft) / Math.max(parseFloat(data.mb), 1)) * 100, 100)}%` }} />
            </div>
          </div>
          <div className="text-sm font-semibold">{data.timeleft} {t.dash_remaining}</div>
          <div className="text-xs text-slate-500">ETA: {data.eta}</div>
        </div>
      </>
    ) : (
      <>
        <div className="flex items-center gap-2 text-slate-500 text-xs mb-3"><Clock size={13} /><span className="uppercase tracking-widest">{t.dash_global_progress}</span></div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1"><span>{t.dash_global}</span><span>0%</span></div>
            <div className="h-2 rounded-full bg-slate-800"><div className="h-full bg-slate-700" style={{ width: '0%' }} /></div>
          </div>
          <div className="text-sm font-semibold text-slate-500">{t.dash_inactive}</div>
          <div className="text-xs text-slate-600">{t.dash_no_downloads}</div>
        </div>
      </>
    ),
  }

  return (
    <PageDropZone onUploaded={refreshQueue}>
      <div className={fullscreen ? 'fixed inset-0 z-40 bg-slate-950 overflow-auto p-6' : 'space-y-6'}>
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black">{t.dash_title}</h1>
              <button onClick={() => setFullscreen(!fullscreen)} title={t.dash_fullscreen}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800">
                {fullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </button>
              <button onClick={resetLayout} title={t.dash_reset_layout}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800">
                <RotateCcw size={16} />
              </button>
            </div>
            <p className="text-slate-400 mt-1 text-sm">{data.noofslots} {t.dash_jobs} - {data.sizeleft} {t.dash_remaining}</p>
          </div>
          <div className="flex gap-2">
            {data.paused
              ? <button onClick={resume} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm font-semibold"><Play size={14} /> {t.dash_resume}</button>
              : <button onClick={pause}  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-sm font-semibold"><Pause size={14} /> {t.dash_pause}</button>
            }
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-sm font-semibold"><Download size={14} /> {t.dash_add_nzb}</button>
          </div>
        </div>

        {/* Tuiles draggables */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {order.map(id => <TileWrapper key={id} id={id}>{tiles[id]}</TileWrapper>)}
        </div>

        {/* Queue pleine largeur */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs"><Download size={13} /><span className="uppercase tracking-widest">{t.nav_queue}</span></div>
            <button onClick={() => onNavigate('queue')} className="flex items-center gap-1 text-xs text-[var(--accent)] hover:underline">
              {t.dash_see_all} <ChevronRight size={12} />
            </button>
          </div>
          {jobs.length === 0 ? (
            <div className="text-slate-600 text-sm py-4 text-center">{t.queue_empty}</div>
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 8).map((job, idx) => {
                const pct = parseFloat(job.percentage) || 0
                const isFirst = idx === 0
                return (
                  <div key={job.nzo_id} className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="text-sm text-slate-200 truncate">{job.filename}</div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
                          {isFirst && job.status === 'Downloading' && <span style={{ color: 'var(--accent)' }}>{(parseFloat(data.kbpersec) / 1024).toFixed(1)} MB/s</span>}
                          <span>{job.sizeleft} / {job.size}</span>
                          <span>{job.timeleft}</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: job.status === 'Paused' ? '#64748b' : 'var(--accent)' }} />
                      </div>
                    </div>
                  </div>
                )
              })}
              {jobs.length > 8 && <div className="text-xs text-slate-600 text-center pt-1">{jobs.length - 8} {t.dash_more_jobs}</div>}
            </div>
          )}
        </div>

        {/* Historique pagine */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <span className="uppercase tracking-widest">{t.hist_title}</span>
              <span className="text-slate-600">({historySlots.length} {t.hist_entries})</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setHistPage(p => Math.max(0, p - 1))} disabled={histPage_ === 0}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 disabled:opacity-30">
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs text-slate-500">{histPage_ + 1} / {Math.max(histTotalPages, 1)}</span>
              <button onClick={() => setHistPage(p => Math.min(histTotalPages - 1, p + 1))} disabled={histPage_ >= histTotalPages - 1}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 disabled:opacity-30">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          {histLoading ? (
            <div className="p-8 text-center text-slate-500 text-sm">{t.common_loading}</div>
          ) : histVisible.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">{t.hist_no_result}</div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {histVisible.map(slot => {
                const ok = slot.status === 'Completed'
                const date = new Date(slot.completed * 1000).toLocaleString()
                return (
                  <div key={slot.nzo_id} className="px-5 py-3 flex items-center gap-3">
                    {ok
                      ? <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                      : <XCircle size={14} className="text-red-400 shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-200 truncate">{slot.name}</div>
                      <div className="flex gap-2 mt-0.5">
                        <CatBadge cat={slot.cat} />
                        <span className="text-xs text-slate-500">{slot.size}</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 shrink-0 hidden sm:block">{date}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {showAdd && <AddNzbModal onClose={() => setShowAdd(false)} />}
      </div>
    </PageDropZone>
  )
}
