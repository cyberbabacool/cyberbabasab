import { useState, useEffect, useCallback } from 'react'

export type TileId = 'speed' | 'storage' | 'progress'

const DEFAULT_ORDER: TileId[] = ['speed', 'storage', 'progress']
const STORAGE_KEY = 'cyberbabasab_dashboard_layout'

export function useDashboardLayout() {
  const [order, setOrder] = useState<TileId[]>(DEFAULT_ORDER)
  const [dragId, setDragId] = useState<TileId | null>(null)
  const [overId, setOverId] = useState<TileId | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as TileId[]
        const valid = parsed.filter(id => DEFAULT_ORDER.includes(id))
        const missing = DEFAULT_ORDER.filter(id => !valid.includes(id))
        if (valid.length > 0) setOrder([...valid, ...missing])
      }
    } catch {}
  }, [])

  const persist = useCallback((next: TileId[]) => {
    setOrder(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
  }, [])

  const onDragStart = useCallback((id: TileId) => {
    setDragId(id)
  }, [])

  const onDragOver = useCallback((e: React.DragEvent, id: TileId) => {
    e.preventDefault()
    if (id !== overId) setOverId(id)
  }, [overId])

  const onDrop = useCallback((e: React.DragEvent, dropId: TileId) => {
    e.preventDefault()
    setOrder(current => {
      if (!dragId || dragId === dropId) return current
      const next = [...current]
      const fromIdx = next.indexOf(dragId)
      const toIdx = next.indexOf(dropId)
      if (fromIdx === -1 || toIdx === -1) return current
      next.splice(fromIdx, 1)
      next.splice(toIdx, 0, dragId)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
    setDragId(null)
    setOverId(null)
  }, [dragId])

  const onDragEnd = useCallback(() => {
    setDragId(null)
    setOverId(null)
  }, [])

  const resetLayout = useCallback(() => persist(DEFAULT_ORDER), [persist])

  return { order, dragId, overId, onDragStart, onDragOver, onDrop, onDragEnd, resetLayout }
}
