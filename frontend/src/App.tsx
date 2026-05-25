import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Sidebar } from './components/Sidebar'
import { DashboardPage } from './pages/DashboardPage'
import { QueuePage } from './pages/QueuePage'
import { HistoryPage } from './pages/HistoryPage'
import { ServersPage } from './pages/ServersPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { SchedulePage } from './pages/SchedulePage'
import { RssPage } from './pages/RssPage'
import { SettingsPage } from './pages/SettingsPage'
import { PreferencesPage } from './pages/PreferencesPage'
import { PrefsContext, usePrefsStore } from './hooks/usePrefs'

export type Page = 'dashboard' | 'queue' | 'history' | 'servers' | 'categories' | 'schedule' | 'rss' | 'settings' | 'preferences'

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const prefsStore = usePrefsStore()
  const { prefs } = prefsStore

  const navigate = (p: Page) => { setPage(p); setSidebarOpen(false) }

  return (
    <PrefsContext.Provider value={prefsStore}>
      <div className={`flex min-h-screen text-white ${prefs.theme === 'light' ? 'bg-slate-100' : 'bg-slate-950'}`}>
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <div className={`fixed top-0 left-0 h-full z-30 transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar current={page} onNavigate={navigate} onClose={() => setSidebarOpen(false)} />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <div className={`lg:hidden flex items-center gap-3 px-4 py-3 border-b ${prefs.theme === 'light' ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-950'}`}>
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <img src={prefs.logoUrl} alt={prefs.appName} className="w-6 h-6 rounded object-contain" />
              <div className="text-base font-black" style={{ color: 'var(--accent)' }}>{prefs.appName}</div>
            </div>
          </div>
          <main className={`flex-1 p-4 lg:p-8 overflow-auto ${prefs.theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            {page === 'dashboard'   && <DashboardPage onNavigate={navigate} />}
            {page === 'queue'       && <QueuePage />}
            {page === 'history'     && <HistoryPage />}
            {page === 'servers'     && <ServersPage />}
            {page === 'categories'  && <CategoriesPage />}
            {page === 'schedule'    && <SchedulePage />}
            {page === 'rss'         && <RssPage />}
            {page === 'settings'    && <SettingsPage />}
            {page === 'preferences' && <PreferencesPage />}
          </main>
        </div>
      </div>
    </PrefsContext.Provider>
  )
}
