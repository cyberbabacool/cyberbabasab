import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import type { QueueData } from './useSab'

let globalSocket: Socket | null = null

export function useSocketQueue(onUpdate: (data: QueueData) => void, enabled = true) {
  const cbRef = useRef(onUpdate)
  cbRef.current = onUpdate

  useEffect(() => {
    if (!enabled) return
    if (!globalSocket) {
      globalSocket = io('/', { path: '/socket.io', transports: ['websocket', 'polling'] })
    }
    const socket = globalSocket
    const handler = (data: QueueData) => cbRef.current(data)
    socket.on('queue-update', handler)
    return () => { socket.off('queue-update', handler) }
  }, [enabled])
}
