import React from 'react';
import ProtectedRoute from './ProtectedRoute';
export default function TrainerRoute({children}) {
  return <ProtectedRoute role="trainer">{children}</ProtectedRoute>;
}

