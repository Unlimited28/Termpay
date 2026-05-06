import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { ToastProvider } from './context/ToastContext'
import LoginPage from './pages/admin/LoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import StudentsPage from './pages/admin/StudentsPage'
import StudentProfilePage from './pages/admin/StudentProfilePage'
import BankStatementsPage from './pages/admin/BankStatementsPage'
import BankStatementReviewPage from './pages/admin/BankStatementReviewPage'
import FeeStructurePage from './pages/admin/FeeStructurePage'
import PaymentsPage from './pages/admin/PaymentsPage'
import ParentLoginPage from './pages/parent/ParentLoginPage'
import ParentDashboardPage from './pages/parent/ParentDashboardPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function ParentProtectedRoute({ children }: { children: React.ReactNode }) {
  const parentAuth = localStorage.getItem('parentAuth')
  return parentAuth ? <>{children}</> : <Navigate to="/parent/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/parent/login" element={<ParentLoginPage />} />
            <Route path="/parent/dashboard" element={
              <ParentProtectedRoute><ParentDashboardPage /></ParentProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/students" element={
              <ProtectedRoute><StudentsPage /></ProtectedRoute>
            } />
            <Route path="/students/:id" element={
              <ProtectedRoute><StudentProfilePage /></ProtectedRoute>
            } />
            <Route path="/fee-structure" element={
              <ProtectedRoute><FeeStructurePage /></ProtectedRoute>
            } />
            <Route path="/bank-statements" element={
              <ProtectedRoute><BankStatementsPage /></ProtectedRoute>
            } />
            <Route path="/bank-statements/:id" element={
              <ProtectedRoute><BankStatementReviewPage /></ProtectedRoute>
            } />
            <Route path="/payments" element={
              <ProtectedRoute><PaymentsPage /></ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
