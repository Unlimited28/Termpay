import { createContext, useContext, useReducer, type ReactNode, useCallback } from 'react'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  variant: ToastVariant
  message: string
}

interface ToastState { toasts: Toast[] }
type ToastAction =
  | { type: 'ADD'; payload: Toast }
  | { type: 'REMOVE'; payload: string }

function reducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'ADD':
      const toasts = state.toasts.length >= 3
        ? [...state.toasts.slice(1), action.payload]
        : [...state.toasts, action.payload]
      return { toasts }
    case 'REMOVE':
      return { toasts: state.toasts.filter(t => t.id !== action.payload) }
    default:
      return state
  }
}

interface ToastContextType {
  toasts: Toast[]
  toast: {
    success: (msg: string) => void
    error: (msg: string) => void
    warning: (msg: string) => void
    info: (msg: string) => void
  }
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { toasts: [] })

  const addToast = useCallback((variant: ToastVariant, message: string) => {
    const id = Math.random().toString(36).slice(2)
    dispatch({ type: 'ADD', payload: { id, variant, message } })
  }, [])

  const dismiss = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', payload: id })
  }, [])

  const toast = {
    success: (msg: string) => addToast('success', msg),
    error: (msg: string) => addToast('error', msg),
    warning: (msg: string) => addToast('warning', msg),
    info: (msg: string) => addToast('info', msg),
  }

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
