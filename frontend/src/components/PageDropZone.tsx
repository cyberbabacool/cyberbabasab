import { useState, useRef, useCallback, type ReactNode } from 'react'
import { UploadCloud } from 'lucide-react'
import axios from 'axios'
import { useToast } from '../hooks/useToast'

interface Props {
  children: ReactNode
  onUploaded?: () => void
}

export function PageDropZone({ children, onUploaded }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const dragCounter = useRef(0)
  const { toast } = useToast()

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
    if (e.dataTransfer.types.includes('Files')) setIsDragging(true)
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
    const files = Array.from(e.dataTransfer.files).filter(f => f.name.toLowerCase().endsWith('.nzb'))
    if (files.length === 0) {
      toast('Seuls les fichiers .nzb sont acceptes', 'warning')
      return
    }
    setUploading(true)
    let success = 0
    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('nzbfile', file)
        await axios.post('/api/addnzb', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        success++
      } catch {
        toast(`Erreur lors de l'ajout de ${file.name}`, 'error')
      }
    }
    if (success > 0) {
      toast(`${success} fichier(s) ajoute(s) a la queue`, 'success')
      onUploaded?.()
    }
    setUploading(false)
  }, [toast, onUploaded])

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
            <div className="text-xl font-bold text-white">Deposez vos fichiers .nzb ici</div>
          </div>
        </div>
      )}
      {uploading && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">
          Envoi en cours...
        </div>
      )}
    </div>
  )
}
