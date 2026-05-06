import { useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Upload,
  CreditCard,
  LogOut,
  Menu,
  ChevronRight,
  GraduationCap
} from 'lucide-react'
import { Toast } from '../components/ui'
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
    if (currentPath.startsWith('/fee-structure')) return 'Fee Structure'
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
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 text-white flex flex-col transition-transform duration-250 ease-spring
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
        style={{ background: 'linear-gradient(180deg, #0D2137 0%, #0A1929 100%)' }}
      >
        {/* Sidebar Header */}
        <div className="p-6">
          <div className="flex items-center gap-1.5 font-bold text-[20px] tracking-tight">
            <span className="text-white">Term</span>
            <span style={{ color: '#4CAF50' }}>Pay</span>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            <p className="text-[11px] text-[#94A3B8] font-medium truncate">{mockUser.schoolName}</p>
            <div className="inline-flex items-center w-fit bg-[#63B3ED]/15 text-[#63B3ED] border border-[#63B3ED]/20 rounded-full px-2 py-0.5 text-[10px] font-medium">
              {mockTerm.name} {mockTerm.session}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-[6px] overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item)
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 h-[48px] rounded-lg text-sm transition-colors duration-150 nav-item-active-border
                  ${active
                    ? 'active bg-white/10 text-white font-medium !rounded-l-none'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}
                `}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
              </NavLink>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #1565C0 0%, #0D2137 100%)' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white truncate">{user?.fullName || mockUser.fullName}</p>
              <p className="text-[11px] text-[#64748B] capitalize">{user?.role || mockUser.role}</p>
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
        <header
          className="h-16 bg-white border-b border-[#E2E8F0] sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between"
          style={{ boxShadow: '0 1px 0 #E2E8F0' }}
        >
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-1.5 rounded-lg hover:bg-surface-bg text-text-secondary"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-[16px] font-semibold text-[#0F172A]">{getPageTitle()}</h1>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[13px] text-[#64748B]">
            <span className="w-[6px] h-[6px] rounded-full bg-[#4CAF50]" />
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
