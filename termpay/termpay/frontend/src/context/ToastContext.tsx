import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => {
      const newToasts = [...prev, { id, message, type }];
      if (newToasts.length > 3) {
        return newToasts.slice(1);
      }
      return newToasts;
    });

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-brand-green" />,
    error: <AlertCircle className="w-5 h-5 text-brand-red" />,
    warning: <AlertTriangle className="w-5 h-5 text-brand-amber" />,
    info: <Info className="w-5 h-5 text-brand-blue" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-100',
    error: 'bg-red-50 border-red-100',
    warning: 'bg-orange-50 border-orange-100',
    info: 'bg-blue-50 border-blue-100',
  };

  return (
    <div className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl border shadow-lg animate-slide-in-right min-w-[300px] ${bgColors[toast.type]}`}>
      {icons[toast.type]}
      <p className="flex-1 text-sm font-medium text-text-primary">{toast.message}</p>
      <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
