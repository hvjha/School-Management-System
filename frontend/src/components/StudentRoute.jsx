import React from 'react';
import ProtectedRoute from './ProtectedRoute';
export default function StudentRoute({children}) {
  return <ProtectedRoute role="student">{children}</ProtectedRoute>;
}

