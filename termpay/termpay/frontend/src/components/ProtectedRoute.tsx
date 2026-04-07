import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ type: 'admin' | 'parent' }> = ({ type }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user || user.type !== type) {
    return <Navigate to={type === 'admin' ? '/login' : '/parent/login'} replace />;
  }

  return <Outlet />;
};
