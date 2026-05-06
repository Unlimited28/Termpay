import { useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Upload,
  CreditCard,
  LogOut,
  Menu,
  GraduationCap,
  BarChart2
} from 'lucide-react'
import { Toast, Logo } from '../components/ui'
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
    { label: 'Fee Structure', path: '/fee-structure', icon: GraduationCap },
  ]

  if (user?.role === 'proprietor') {
    navItems.push({ label: 'Reports', path: '/reports', icon: BarChart2 })
  } else {
    navItems.push(
      { label: 'Bank Statements', path: '/bank-statements', icon: Upload },
      { label: 'Payments', path: '/payments', icon: CreditCard }
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getPageTitle = () => {
    const currentPath = location.pathname
    if (currentPath === '/dashboard') return 'Dashboard'
    if (currentPath.startsWith('/students')) return 'Students'
    if (currentPath.startsWith('/fee-structure')) return 'Fee Structure'
    if (currentPath.startsWith('/bank-statements')) return 'Bank Statements'
    if (currentPath.startsWith('/payments')) return 'Payments'
    if (currentPath.startsWith('/reports')) return 'Reports'
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
    <div className="min-h-screen bg-base flex">
      <Toast />

      {/* Sidebar Backdrop - Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[256px] bg-base border-right border-white/6 flex flex-col transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
        style={{ borderRight: '1px solid rgba(255, 255, 255, 0.06)' }}
      >
        {/* Sidebar Header */}
        <div className="p-6">
          <Logo showDot className="text-[20px]" />
          <div className="mt-1">
            <p className="text-[11px] text-ink-muted truncate uppercase tracking-wider font-medium">
              {user?.schoolName || mockUser.schoolName}
            </p>
            <div className="inline-flex items-center mt-2 bg-emerald/8 border border-emerald/20 text-emerald rounded-full px-2 py-0.5 text-xs font-medium">
              {mockTerm.name} {mockTerm.session}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item)
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 h-[44px] rounded-xl text-sm transition-all duration-200
                  ${active
                    ? 'bg-emerald/8 border border-emerald/15 text-emerald border-l-[3px] border-l-emerald font-semibold'
                    : 'text-ink-muted hover:bg-white/4 hover:text-ink-secondary'}
                `}
              >
                <item.icon size={18} className={active ? 'text-emerald' : ''} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/6 mt-auto">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-ink-primary truncate">{user?.fullName || mockUser.fullName}</p>
              <p className="text-[11px] text-ink-muted capitalize">{user?.role || mockUser.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-ink-muted hover:text-danger text-sm w-full px-1 transition-colors group"
          >
            <LogOut size={18} className="group-hover:text-danger" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* TopBar */}
        <header
          className="h-16 bg-base/80 backdrop-blur-[12px] border-b border-white/6 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/5 text-ink-secondary"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-[16px] font-semibold text-ink-primary">{getPageTitle()}</h1>
          </div>

          <div className="hidden md:flex items-center gap-2 text-ink-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-glow-pulse" />
            {user?.schoolName || mockUser.schoolName}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-8 flex-1 min-h-screen bg-base">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
