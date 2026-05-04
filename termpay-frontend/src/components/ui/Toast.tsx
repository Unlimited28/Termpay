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
      border: 'border-brand-green',
      icon: <CheckCircle className="text-brand-green" size={20} />,
    },
    error: {
      border: 'border-brand-red',
      icon: <XCircle className="text-brand-red" size={20} />,
    },
    warning: {
      border: 'border-brand-amber',
      icon: <AlertTriangle className="text-brand-amber" size={20} />,
    },
    info: {
      border: 'border-brand-blue',
      icon: <Info className="text-brand-blue" size={20} />,
    },
  }

  const { border, icon } = variants[variant]

  return (
    <div className={`
      bg-white rounded-lg shadow-lg border-l-4 p-4 w-80 flex items-start gap-3
      animate-toast-in ${border} pointer-events-auto
    `}>
      <div className="mt-0.5">{icon}</div>
      <p className="text-sm text-text-primary flex-1 font-medium">{message}</p>
      <button
        onClick={() => dismiss(id)}
        className="text-text-disabled hover:text-text-primary transition-colors"
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
