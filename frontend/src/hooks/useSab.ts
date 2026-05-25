import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'

const API = '/api'

export interface QueueSlot {
  nzo_id: string; filename: string; cat: string; size: string; sizeleft: string
  percentage: string; status: string; timeleft: string; priority: string; script: string; avg_age: string
}
export interface QueueData {
  paused: boolean; kbpersec: string; speed: string; mbleft: string; mb: string
  sizeleft: string; size: string; noofslots: number; diskspace1_norm: string; diskspace2_norm: string
  diskspace1: string; diskspace2: string; diskspacetotal1: string; diskspacetotal2: string
  cache_size: string; speedlimit: string; speedlimit_abs: string; status: string; timeleft: string; eta: string; slots: QueueSlot[]
}
export interface HistorySlot {
  nzo_id: string; name: string; cat: string; size: string; status: string
  completed: number; fail_message: string; download_time: number; storage: string; script: string; url: string
}

export function useQueue(interval = 2000) {
  const [data, setData] = useState<QueueData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<any>(null)

  const fetch = useCallback(async () => {
    try { const r = await axios.get(`${API}/queue`); setData(r.data.queue); setError(null) }
    catch { setError('Impossible de joindre le backend') }
  }, [])

  useEffect(() => {
    fetch()
    if (interval > 0) { timerRef.current = setInterval(fetch, interval); return () => clearInterval(timerRef.current) }
  }, [fetch, interval])

  const pause      = () => axios.get(`${API}/pause`).then(fetch)
  const resume     = () => axios.get(`${API}/resume`).then(fetch)
  const pauseJob   = (id: string) => axios.get(`${API}/job/pause?nzo_id=${id}`).then(fetch)
  const resumeJob  = (id: string) => axios.get(`${API}/job/resume?nzo_id=${id}`).then(fetch)
  const deleteJob  = (id: string, files = 0) => axios.get(`${API}/job/delete?nzo_ids=${id}&del_files=${files}`).then(fetch)
  const moveJob    = (id: string, pos: number) => axios.get(`${API}/job/move?nzo_id=${id}&position=${pos}`).then(fetch)
  const renameJob  = (id: string, name: string, pw = '') => axios.get(`${API}/job/rename?nzo_id=${id}&name=${encodeURIComponent(name)}&password=${encodeURIComponent(pw)}`).then(fetch)
  const purge      = () => axios.get(`${API}/purge`).then(fetch)
  const setSpeed   = (v: number) => axios.get(`${API}/speedlimit?value=${v}`).then(fetch)
  const addUrl     = (url: string, cat = '') => axios.get(`${API}/addurl?url=${encodeURIComponent(url)}&cat=${encodeURIComponent(cat)}`).then(fetch)
  const addLocal   = (name: string, cat = '') => axios.get(`${API}/addlocal?name=${encodeURIComponent(name)}&cat=${encodeURIComponent(cat)}`).then(fetch)
  const getFiles   = (id: string) => axios.get(`${API}/job/files?nzo_id=${id}`).then(r => r.data)
  const retryJob   = (id: string) => axios.get(`${API}/job/retry?nzo_id=${id}`).then(fetch)

  return { data, error, refresh: fetch, pause, resume, pauseJob, resumeJob, deleteJob, moveJob, renameJob, purge, setSpeed, addUrl, addLocal, getFiles, retryJob }
}

export function useHistory(limit = 200) {
  const [data, setData] = useState<HistorySlot[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const fetch = useCallback(async () => {
    setLoading(true)
    try { const r = await axios.get(`${API}/history?limit=${limit}`); setData(r.data.history?.slots ?? []) }
    catch { setError('Erreur chargement historique') }
    finally { setLoading(false) }
  }, [limit])
  useEffect(() => { fetch() }, [fetch])
  const deleteItem = (id: string) => axios.get(`${API}/history/delete?nzo_ids=${id}`).then(fetch)
  const retryItem  = (id: string) => axios.get(`${API}/job/retry?nzo_id=${id}`).then(fetch)
  return { data, error, loading, refresh: fetch, deleteItem, retryItem }
}

export function useConfig() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const fetch = useCallback(async () => {
    try { const r = await axios.get(`${API}/config`); setData(r.data) }
    catch { setError('Erreur config') }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  const save = (section: string, keyword: string, value: string) =>
    axios.get(`${API}/config/save?section=${section}&keyword=${encodeURIComponent(keyword)}&value=${encodeURIComponent(value)}`).then(fetch)
  return { data, error, refresh: fetch, save }
}

export function useStatus() {
  const [data, setData] = useState<any>(null)
  useEffect(() => {
    axios.get(`${API}/status`).then(r => setData(r.data)).catch(() => {})
    const t = setInterval(() => axios.get(`${API}/status`).then(r => setData(r.data)).catch(() => {}), 5000)
    return () => clearInterval(t)
  }, [])
  return { data }
}
