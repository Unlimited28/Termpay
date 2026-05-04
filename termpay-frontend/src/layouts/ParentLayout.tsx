import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Logo, Toast } from '../components/ui'

interface ParentLayoutProps {
  children: ReactNode
}

const ParentLayout = ({ children }: ParentLayoutProps) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('parentAuth')
    navigate('/parent/login')
  }

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col">
      <Toast />

      <header className="h-16 bg-white border-b border-surface-border px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="hidden sm:block h-5 w-px bg-surface-border" />
          <span className="hidden sm:block text-sm font-medium text-text-secondary uppercase tracking-wider">Parent Portal</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}

export default ParentLayout
