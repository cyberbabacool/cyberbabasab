import { useState, useEffect, useCallback } from 'react'

export type TileId = 'speed' | 'storage' | 'progress' | 'queue'

const DEFAULT_ORDER: TileId[] = ['speed', 'storage', 'progress', 'queue']
const STORAGE_KEY = 'cyberbabasab_dashboard_layout'

export function useDashboardLayout() {
  const [order, setOrder] = useState<TileId[]>(DEFAULT_ORDER)
  const [dragId, setDragId] = useState<TileId | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as TileId[]
        const valid = parsed.filter(id => DEFAULT_ORDER.includes(id))
        const missing = DEFAULT_ORDER.filter(id => !valid.includes(id))
        setOrder([...valid, ...missing])
      }
    } catch {}
  }, [])

  const persist = useCallback((next: TileId[]) => {
    setOrder(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
  }, [])

  const onDragStart = (id: TileId) => setDragId(id)

  const onDragOver = (e: React.DragEvent, overId: TileId) => {
    e.preventDefault()
    if (!dragId || dragId === overId) return
    const next = [...order]
    const fromIdx = next.indexOf(dragId)
    const toIdx = next.indexOf(overId)
    if (fromIdx === -1 || toIdx === -1) return
    next.splice(fromIdx, 1)
    next.splice(toIdx, 0, dragId)
    setOrder(next)
  }

  const onDragEnd = () => {
    if (dragId) persist(order)
    setDragId(null)
  }

  const resetLayout = () => persist(DEFAULT_ORDER)

  return { order, dragId, onDragStart, onDragOver, onDragEnd, resetLayout }
}
