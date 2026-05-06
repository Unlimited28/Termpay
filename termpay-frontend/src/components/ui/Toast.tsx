import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToast, type ToastVariant } from '../../context/ToastContext'

const ToastItem = ({ id, variant, message, dismiss }: { id: string; variant: ToastVariant; message: string; dismiss: (id: string) => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      dismiss(id)
    }, 4000)
    return () => clearTimeout(timer)
  }, [id, dismiss])

  const variants = {
    success: {
      border: 'border-l-[#10B981]',
      icon: <CheckCircle className="text-emerald" size={20} />,
    },
    error: {
      border: 'border-l-[#EF4444]',
      icon: <XCircle className="text-danger" size={20} />,
    },
    warning: {
      border: 'border-l-[#F59E0B]',
      icon: <AlertTriangle className="text-warning" size={20} />,
    },
    info: {
      border: 'border-l-[#3B82F6]',
      icon: <Info className="text-info" size={20} />,
    },
  }

  const { border, icon } = variants[variant]

  return (
    <div className={`
      bg-elevated rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10 border-l-4 p-4 w-80 flex items-start gap-3
      animate-toast-in ${border} pointer-events-auto
    `}>
      <div className="mt-0.5">{icon}</div>
      <p className="text-sm text-ink-primary flex-1 font-medium leading-tight">{message}</p>
      <button
        onClick={() => dismiss(id)}
        className="text-ink-muted hover:text-ink-secondary transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  )
}

const Toast = () => {
  const { toasts, dismiss } = useToast()

  return createPortal(
    <div className="fixed top-4 right-4 z-[100] space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} dismiss={dismiss} />
      ))}
    </div>,
    document.getElementById('portal-root')!
  )
}

export default Toast
