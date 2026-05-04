import { useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Upload,
  CreditCard,
  LogOut,
  Menu,
  ChevronRight
} from 'lucide-react'
import { Logo, Badge, Toast } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { mockUser, mockTerm } from '../mock/mockData'

interface AdminLayoutProps {
  children: ReactNode
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, exact: true },
    { label: 'Students', path: '/students', icon: Users },
    { label: 'Bank Statements', path: '/bank-statements', icon: Upload },
    { label: 'Payments', path: '/payments', icon: CreditCard },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getPageTitle = () => {
    const currentPath = location.pathname
    if (currentPath === '/dashboard') return 'Dashboard'
    if (currentPath.startsWith('/students')) return 'Students'
    if (currentPath.startsWith('/bank-statements')) return 'Bank Statements'
    if (currentPath.startsWith('/payments')) return 'Payments'
    return 'TermPay'
  }

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return location.pathname === item.path
    return location.pathname.startsWith(item.path)
  }

  const initials = (user?.fullName || mockUser.fullName)
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen bg-surface-bg flex">
      <Toast />

      {/* Sidebar Backdrop - Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-navy text-white flex flex-col transition-transform duration-250 ease-spring
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10">
          <Logo variant="white" />
          <div className="mt-4">
            <p className="text-xs text-slate-400 font-medium truncate">{mockUser.schoolName}</p>
            <Badge variant="info" className="mt-2 bg-blue-900/50 text-blue-200 border-none px-2 py-0.5">
              {mockTerm.name} {mockTerm.session}
            </Badge>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item)
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150
                  ${active
                    ? 'bg-blue-900/40 text-white font-medium'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}
                `}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
              </NavLink>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-xs font-bold text-white ring-2 ring-white/10">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.fullName || mockUser.fullName}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role || mockUser.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm w-full px-1 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* TopBar */}
        <header className="h-14 bg-white border-b border-surface-border sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-1.5 rounded-lg hover:bg-surface-bg text-text-secondary"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-semibold text-text-primary">{getPageTitle()}</h2>
          </div>

          <div className="hidden md:flex items-center gap-2 text-sm text-text-secondary">
            <span className="w-2 h-2 rounded-full bg-brand-green" />
            {mockUser.schoolName}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
