import React, { useState } from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText,
  CreditCard, 
  Menu, 
  X,
  Bell,
  Search,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { signOut, user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Students', path: '/admin/students', icon: <Users className="w-5 h-5" /> },
    { label: 'Bank Statements', path: '/admin/bank-matching', icon: <FileText className="w-5 h-5" /> },
    { label: 'Payments', path: '/admin/payments', icon: <CreditCard className="w-5 h-5" /> },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-surface-bg flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-navy text-white transition-transform duration-300 transform
        lg:translate-x-0 lg:static lg:inset-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center font-bold">T</div>
            <span className="text-xl font-bold tracking-tight">TermPay</span>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive
                    ? 'bg-blue-900/40 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="pt-6 border-t border-white/10 mt-auto space-y-2">
            <div className="flex items-center gap-3 px-4 py-3 text-slate-400">
              <User className="w-5 h-5" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-slate-200 truncate">
                  {user?.email?.split('@')[0]}
                </span>
                <span className="text-xs text-slate-500 truncate">Admin</span>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-brand-red transition-all duration-200 w-full text-left"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-surface-border sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
          <button 
            className="lg:hidden p-2 -ml-2 text-text-secondary hover:bg-slate-50 rounded-lg transition-colors"
            onClick={toggleSidebar}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-surface-border rounded-lg px-3 py-1.5 w-64">
            <Search className="w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none focus:outline-none text-sm w-full"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-text-secondary hover:bg-slate-50 rounded-lg relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-red rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 bg-slate-100 rounded-full border border-surface-border flex items-center justify-center text-text-secondary">
              <User className="w-5 h-5" />
            </div>
          </div>
        </header>

        {/* Main View */}
        <main className="flex-1 p-4 sm:p-8 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
