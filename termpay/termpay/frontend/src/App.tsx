import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Login from './pages/Login/Login';
import ParentLogin from './pages/Login/ParentLogin';
import Dashboard from './pages/Dashboard/Dashboard';
import Students from './pages/Students/Students';

// Temporary Mock Pages
const Classes = () => <div className="p-8 text-center bg-white rounded-xl shadow-premium"><h1 className="text-2xl font-bold text-primary-navy">Classes Management</h1><p className="text-text-secondary mt-2">Coming soon...</p></div>;
const Fees = () => <div className="p-8 text-center bg-white rounded-xl shadow-premium"><h1 className="text-2xl font-bold text-primary-navy">Fee Structure</h1><p className="text-text-secondary mt-2">Coming soon...</p></div>;
const BankMatching = () => <div className="p-8 text-center bg-white rounded-xl shadow-premium"><h1 className="text-2xl font-bold text-primary-navy">Bank Statement Matching</h1><p className="text-text-secondary mt-2">Coming soon...</p></div>;
const Payments = () => <div className="p-8 text-center bg-white rounded-xl shadow-premium"><h1 className="text-2xl font-bold text-primary-navy">Payments History</h1><p className="text-text-secondary mt-2">Coming soon...</p></div>;
const Receipts = () => <div className="p-8 text-center bg-white rounded-xl shadow-premium"><h1 className="text-2xl font-bold text-primary-navy">Receipts Archive</h1><p className="text-text-secondary mt-2">Coming soon...</p></div>;
const Reports = () => <div className="p-8 text-center bg-white rounded-xl shadow-premium"><h1 className="text-2xl font-bold text-primary-navy">Financial Reports</h1><p className="text-text-secondary mt-2">Coming soon...</p></div>;
const Settings = () => <div className="p-8 text-center bg-white rounded-xl shadow-premium"><h1 className="text-2xl font-bold text-primary-navy">School Settings</h1><p className="text-text-secondary mt-2">Coming soon...</p></div>;

const ParentDashboard = () => <div className="p-8 text-center bg-white rounded-xl shadow-premium"><h1 className="text-2xl font-bold text-primary-navy">Parent Dashboard</h1><p className="text-text-secondary mt-2">Welcome to your child's portal.</p></div>;
const NotFound = () => (
  <div className="p-12 text-center bg-white rounded-xl shadow-premium max-w-md mx-auto mt-20">
    <h1 className="text-4xl font-bold text-danger-red">404</h1>
    <p className="text-xl font-semibold text-text-primary mt-4">Page Not Found</p>
    <p className="text-text-secondary mt-2">The page you are looking for doesn't exist.</p>
    <Link to="/" className="btn-primary mt-6 inline-flex">Go Home</Link>
  </div>
);

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/parent/login" element={<ParentLogin />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route element={<ProtectedRoute type="admin" />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/students" element={<Students />} />
                <Route path="/admin/classes" element={<Classes />} />
                <Route path="/admin/fees" element={<Fees />} />
                <Route path="/admin/bank-matching" element={<BankMatching />} />
                <Route path="/admin/payments" element={<Payments />} />
                <Route path="/admin/receipts" element={<Receipts />} />
                <Route path="/admin/reports" element={<Reports />} />
                <Route path="/admin/settings" element={<Settings />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute type="parent" />}>
              <Route path="/parent/dashboard" element={<ParentDashboard />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
