import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout, AuthLayout } from './layouts';

// UI Components
import { Button, Card, Input } from './components/ui';

// Pages
import Dashboard from './pages/Dashboard/Dashboard';
import Students from './pages/Students/Students';
import UIPreview from './pages/UIPreview';

// Placeholder Pages
const Login = () => (
  <AuthLayout>
    <Card className="p-8">
      <h2 className="text-2xl font-bold text-navy mb-6">Welcome Back</h2>
      <div className="space-y-4">
        <Input label="Email Address" placeholder="admin@school.com" />
        <Input label="Password" type="password" placeholder="••••••••" />
        <Button className="w-full mt-2">Login as Admin</Button>
      </div>
      <div className="mt-6 text-center text-sm text-text-secondary">
        Are you a parent? <Link to="/parent/login" className="text-brand-blue font-semibold hover:underline">Login here</Link>
      </div>
    </Card>
  </AuthLayout>
);

const ParentLogin = () => (
  <AuthLayout>
    <Card className="p-8">
      <h2 className="text-2xl font-bold text-navy mb-6">Parent Portal</h2>
      <p className="text-text-secondary mb-6 leading-relaxed">Enter your phone number to receive a secure login link via WhatsApp.</p>
      <div className="space-y-4">
        <Input label="Phone Number" placeholder="+234..." />
        <Button className="w-full mt-2">Get Login Link</Button>
      </div>
    </Card>
  </AuthLayout>
);

const MockPage = ({ title }: { title: string }) => (
  <div className="p-8 text-center bg-white rounded-xl shadow-premium border border-surface-border">
    <h1 className="text-2xl font-bold text-navy">{title}</h1>
    <p className="text-text-secondary mt-2">Coming soon...</p>
  </div>
);

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/parent/login" element={<ParentLogin />} />
              <Route path="/ui-preview" element={<UIPreview />} />
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

              <Route element={<ProtectedRoute type="admin" />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin/dashboard" element={<Dashboard />} />
                  <Route path="/admin/students" element={<Students />} />
                  <Route path="/admin/bank-matching" element={<MockPage title="Bank Statement Matching" />} />
                  <Route path="/admin/payments" element={<MockPage title="Payments History" />} />
                  <Route path="/admin/classes" element={<MockPage title="Classes Management" />} />
                  <Route path="/admin/fees" element={<MockPage title="Fee Structure" />} />
                  <Route path="/admin/receipts" element={<MockPage title="Receipts Archive" />} />
                  <Route path="/admin/reports" element={<MockPage title="Financial Reports" />} />
                  <Route path="/admin/settings" element={<MockPage title="School Settings" />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute type="parent" />}>
                <Route path="/parent/dashboard" element={<MockPage title="Parent Dashboard" />} />
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </AuthProvider>
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
