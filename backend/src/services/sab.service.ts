import axios from 'axios'
import FormData from 'form-data'

const SAB_URL = process.env.SAB_URL
const API_KEY = process.env.SAB_API_KEY

async function sabGet(params: Record<string, any>) {
  const r = await axios.get(`${SAB_URL}/api`, {
    params: { ...params, apikey: API_KEY, output: 'json' }
  })
  return r.data
}

export const getQueue    = () => sabGet({ mode: 'queue', limit: 100 })
export const getHistory  = (limit = 100) => sabGet({ mode: 'history', limit })
export const getConfig   = () => sabGet({ mode: 'get_config' })
export const getStatus   = () => sabGet({ mode: 'fullstatus' })

export const pauseQueue  = () => sabGet({ mode: 'pause' })
export const resumeQueue = () => sabGet({ mode: 'resume' })
export const setSpeedLimit = (value: number) => sabGet({ mode: 'config', name: 'speedlimit', value })
export const setCompleteAction = (value: string) => sabGet({ mode: 'change_complete_action', value })

export const pauseJob    = (nzo_id: string) => sabGet({ mode: 'queue', name: 'pause',  value: nzo_id })
export const resumeJob   = (nzo_id: string) => sabGet({ mode: 'queue', name: 'resume', value: nzo_id })
export const deleteJob   = (nzo_ids: string, del_files = 0) => sabGet({ mode: 'queue', name: 'delete', nzo_ids, del_files })
export const purgeQueue  = () => sabGet({ mode: 'purge' })
export const moveJob     = (nzo_id: string, position: number) => sabGet({ mode: 'switch', value: nzo_id, value2: position })
export const changeCat   = (nzo_id: string, value: string) => sabGet({ mode: 'change_cat', value: nzo_id, value2: value })
export const changePrio  = (nzo_id: string, value: number) => sabGet({ mode: 'queue', name: 'priority', nzo_ids: nzo_id, value })
export const renameJob   = (nzo_id: string, name: string, password = '') => sabGet({ mode: 'queue', name: 'rename', value: nzo_id, value2: name, value3: password })
export const getFiles    = (nzo_id: string) => sabGet({ mode: 'get_files', value: nzo_id })

export const deleteHistory = (nzo_ids: string) => sabGet({ mode: 'history', name: 'delete', value: nzo_ids })
export const retryJob    = (nzo_id: string, password = '') => sabGet({ mode: 'retry', value: nzo_id, password })

export const addUrl   = (url: string, cat = '', priority = -100) => sabGet({ mode: 'addurl', name: url, cat, priority })
export const addLocal = (name: string, cat = '') => sabGet({ mode: 'addlocalfile', name, cat })

export async function addNzb(fileBuffer: Buffer, filename: string, category = '') {
  const form = new FormData()
  form.append('mode', 'addfile')
  form.append('apikey', API_KEY!)
  form.append('output', 'json')
  if (category) form.append('cat', category)
  form.append('nzbfile', fileBuffer, { filename, contentType: 'application/x-nzb' })
  const r = await axios.post(`${SAB_URL}/api`, form, { headers: form.getHeaders() })
  return r.data
}

export const saveConfig = (section: string, keyword: string, value: string) =>
  sabGet({ mode: 'set_config', section, keyword, value })

export const saveConfigBool = (section: string, keyword: string, value: boolean) =>
  sabGet({ mode: 'set_config', section, keyword, value: value ? '1' : '0' })

export const deleteConfig = (section: string, keyword: string) =>
  sabGet({ mode: 'del_config', section, keyword })

// Servers CRUD
export const addServer = (params: Record<string, any>) =>
  sabGet({ mode: 'set_config', section: 'servers', ...params })

export const deleteServer = (servername: string) =>
  sabGet({ mode: 'del_config', section: 'servers', keyword: servername })

export const testServer = (servername: string) =>
  sabGet({ mode: 'test_server', server: servername })

// Categories CRUD
export const addCategory = (params: Record<string, any>) =>
  sabGet({ mode: 'set_config', section: 'categories', ...params })

export const deleteCategory = (name: string) =>
  sabGet({ mode: 'del_config', section: 'categories', keyword: name })

// RSS
export const getRssFeeds  = () => sabGet({ mode: 'get_rss_feed' })
export const readRssFeed  = (feed: string) => sabGet({ mode: 'rss_now', feed })
export const addRssFeed   = (params: Record<string, any>) =>
  sabGet({ mode: 'set_config', section: 'rss', ...params })
export const deleteRssFeed = (name: string) =>
  sabGet({ mode: 'del_config', section: 'rss', keyword: name })

// Notifications
export const testNotif = (params: Record<string, any>) =>
  sabGet({ mode: 'test_notif', ...params })

// Misc actions
export const shutdown  = () => sabGet({ mode: 'shutdown' })
export const restart   = () => sabGet({ mode: 'restart' })
export const pausePostProcessing = () => sabGet({ mode: 'pause_pp' })
export const resumePostProcessing = () => sabGet({ mode: 'resume_pp' })
