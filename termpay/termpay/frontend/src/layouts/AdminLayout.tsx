import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CreditCard, 
  FileBarChart, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Upload,
  Receipt,
  GraduationCap
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Students', icon: Users, path: '/admin/students' },
    { label: 'Classes', icon: GraduationCap, path: '/admin/classes' },
    { label: 'Fee Structure', icon: BookOpen, path: '/admin/fees' },
    { label: 'Bank Matching', icon: Upload, path: '/admin/bank-matching' },
    { label: 'Payments', icon: CreditCard, path: '/admin/payments' },
    { label: 'Receipts', icon: Receipt, path: '/admin/receipts' },
    { label: 'Reports', icon: FileBarChart, path: '/admin/reports' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden lg:flex w-64 bg-primary-navy flex-col fixed inset-y-0 z-50">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">TermPay</h1>
              <p className="text-slate-400 text-xs font-medium">Yomfield Nursery...</p>
            </div>
          </div>
          <div className="mt-6">
            <span className="badge bg-blue-800/50 text-blue-200 text-[10px]">Second Term 2025/2026</span>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive 
                  ? "bg-blue-800/40 text-white" 
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.full_name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
            <button 
              onClick={logout}
              className="text-slate-400 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-primary-navy/60 backdrop-blur-sm z-[60] lg:hidden animate-fade-in"
          onClick={toggleMobileMenu}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-primary-navy z-[70] transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <h1 className="text-white font-bold text-lg">TermPay</h1>
          </div>
          <button onClick={toggleMobileMenu} className="text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={toggleMobileMenu}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium",
                isActive 
                  ? "bg-blue-800 text-white" 
                  : "text-slate-300"
              )}
            >
              <item.icon size={22} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-6 border-t border-white/10">
          <button 
            onClick={logout}
            className="flex items-center gap-3 text-slate-300 w-full px-4 py-3"
          >
            <LogOut size={22} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="lg:hidden h-16 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-navy rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-bold text-primary-navy">TermPay</span>
          </div>
          <button onClick={toggleMobileMenu} className="text-primary-navy p-1">
            <Menu size={28} />
          </button>
        </header>

        <div className="flex-1 p-6 lg:p-10 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
