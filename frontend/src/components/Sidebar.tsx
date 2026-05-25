import { Activity, List, History, Server, Tag, Clock, Rss, Settings, Sliders, X } from 'lucide-react'
import type { Page } from '../App'
import { usePrefs } from '../hooks/usePrefs'

interface Props { current: Page; onNavigate: (p: Page) => void; onClose?: () => void }

export function Sidebar({ current, onNavigate, onClose }: Props) {
  const { prefs, t } = usePrefs()

  const items: { label: string; icon: typeof Activity; page: Page }[] = [
    { label: t.nav_dashboard,   icon: Activity, page: 'dashboard'   },
    { label: t.nav_queue,       icon: List,     page: 'queue'       },
    { label: t.nav_history,     icon: History,  page: 'history'     },
    { label: t.nav_servers,     icon: Server,   page: 'servers'     },
    { label: t.nav_categories,  icon: Tag,      page: 'categories'  },
    { label: t.nav_schedule,    icon: Clock,    page: 'schedule'    },
    { label: t.nav_rss,         icon: Rss,      page: 'rss'         },
    { label: t.nav_settings,    icon: Settings, page: 'settings'    },
    { label: t.nav_preferences, icon: Sliders,  page: 'preferences' },
  ]

  return (
    <aside className={`w-64 h-full flex flex-col shrink-0 border-r ${
      prefs.theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
    }`}>
      <div className={`p-5 border-b flex items-center justify-between gap-3 ${
        prefs.theme === 'light' ? 'border-slate-200' : 'border-slate-800'
      }`}>
        <div className="flex items-center gap-3 min-w-0">
          <img src={prefs.logoUrl} alt={prefs.appName}
            className="w-8 h-8 rounded-lg object-contain shrink-0"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <div className="min-w-0">
            <div className="text-base font-black leading-tight truncate" style={{ color: 'var(--accent)' }}>{prefs.appName}</div>
            <div className={`text-xs ${prefs.theme === 'light' ? 'text-slate-400' : 'text-slate-600'}`}>SABnzbd Interface</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 shrink-0">
            <X size={16} />
          </button>
        )}
      </div>
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {items.map(item => {
          const Icon = item.icon
          const active = current === item.page
          return (
            <button key={item.page} onClick={() => onNavigate(item.page)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                active
                  ? 'font-semibold'
                  : prefs.theme === 'light'
                    ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
              style={active ? { backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' } : {}}>
              <Icon size={16} />
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
