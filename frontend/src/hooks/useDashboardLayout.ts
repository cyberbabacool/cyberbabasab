import { useState, useEffect, useCallback, useRef } from 'react'

export type TileId = 'speed' | 'info' | 'queue'

const DEFAULT_ORDER: TileId[] = ['speed', 'info', 'queue']
const STORAGE_KEY = 'cyberbabasab_dashboard_layout'

export function useDashboardLayout() {
  const [order, setOrder] = useState<TileId[]>(DEFAULT_ORDER)
  const [dragId, setDragId] = useState<TileId | null>(null)
  const dragIdRef = useRef<TileId | null>(null)
  const orderRef  = useRef<TileId[]>(DEFAULT_ORDER)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as TileId[]
        const valid = parsed.filter(id => DEFAULT_ORDER.includes(id))
        const missing = DEFAULT_ORDER.filter(id => !valid.includes(id))
        if (valid.length > 0) {
          const initial = [...valid, ...missing]
          setOrder(initial)
          orderRef.current = initial
        }
      }
    } catch {}
  }, [])

  const onDragStart = useCallback((e: React.DragEvent, id: TileId) => {
    dragIdRef.current = id
    setDragId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }, [])

  const onDragOver = useCallback((e: React.DragEvent, overId: TileId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const fromId = dragIdRef.current
    if (!fromId || fromId === overId) return
    setOrder(current => {
      const fromIdx = current.indexOf(fromId)
      const toIdx   = current.indexOf(overId)
      if (fromIdx === -1 || toIdx === -1) return current
      const next = [...current]
      next.splice(fromIdx, 1)
      next.splice(toIdx, 0, fromId)
      orderRef.current = next
      return next
    })
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault() }, [])

  const onDragEnd = useCallback(() => {
    dragIdRef.current = null
    setDragId(null)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(orderRef.current)) } catch {}
  }, [])

  const resetLayout = useCallback(() => {
    setOrder(DEFAULT_ORDER)
    orderRef.current = DEFAULT_ORDER
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ORDER)) } catch {}
  }, [])

  return { order, dragId, onDragStart, onDragOver, onDrop, onDragEnd, resetLayout }
}
