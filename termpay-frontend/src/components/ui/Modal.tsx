import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-navy/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className={`w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl overflow-hidden z-[70] animate-modal-in`}>
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface-bg text-text-disabled hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 bg-surface-bg border-t border-surface-border flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.getElementById('portal-root')!
  )
}

export default Modal
