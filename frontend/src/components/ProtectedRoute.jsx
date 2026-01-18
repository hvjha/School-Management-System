import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user } = useContext(AuthContext);

  // If not logged in, redirect to home page
  if (!user) return <Navigate to="/" replace />;

  // If logged in but wrong role, redirect to home page
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
}
