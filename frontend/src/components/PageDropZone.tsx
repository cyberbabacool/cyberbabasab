import { useState, useRef, useCallback, type ReactNode } from 'react'
import { UploadCloud } from 'lucide-react'
import axios from 'axios'
import { useToast } from '../hooks/useToast'
import { usePrefs } from '../hooks/usePrefs'

interface Props {
  children: ReactNode
  onUploaded?: () => void
}

export function PageDropZone({ children, onUploaded }: Props) {
  const { t } = usePrefs()
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const dragCounter = useRef(0)
  const { toast } = useToast()

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
    // Ignorer les drags internes (tuiles, texte, etc.)
    if (e.dataTransfer.types.includes('Files') && !e.dataTransfer.types.includes('text/plain')) setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current <= 0) {
      dragCounter.current = 0
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragging(false)
    // Ne traiter que les vrais drops de fichiers (pas les drags de tuiles)
    if (!e.dataTransfer.types.includes('Files')) return
    const files = Array.from(e.dataTransfer.files).filter(f => f.name.toLowerCase().endsWith('.nzb'))
    if (files.length === 0 && e.dataTransfer.files.length > 0) {
      toast(t.drop_only_nzb, 'warning')
      return
    }
    if (files.length === 0) return
    setUploading(true)
    let success = 0
    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('nzbfile', file)
        await axios.post('/api/addnzb', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        success++
      } catch {
        toast(`${t.drop_error_prefix} ${file.name}`, 'error')
      }
    }
    if (success > 0) {
      toast(`${success} ${t.drop_success_suffix}`, 'success')
      onUploaded?.()
    }
    setUploading(false)
  }, [toast, onUploaded, t])

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative min-h-full"
    >
      {children}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="border-2 border-dashed rounded-3xl px-16 py-12 flex flex-col items-center gap-4" style={{ borderColor: 'var(--accent)' }}>
            <UploadCloud size={48} style={{ color: 'var(--accent)' }} />
            <div className="text-xl font-bold text-white">{t.drop_here}</div>
          </div>
        </div>
      )}
      {uploading && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">
          {t.drop_uploading}
        </div>
      )}
    </div>
  )
}
