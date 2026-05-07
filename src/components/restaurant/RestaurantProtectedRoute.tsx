import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext';

interface RestaurantProtectedRouteProps {
  children: React.ReactNode;
}

export function RestaurantProtectedRoute({ children }: RestaurantProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 1. No session -> Redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Has session but NO restaurant access -> Redirect to Hub Dashboard
  // We choose to redirect to /app/dashboard because the user is already authenticated in the Hub
  // but simply doesn't have the specific permission for the Restaurant Portal.
  if (!user.can_access_restaurant_portal) {
    return <Navigate to="/app/dashboard" replace />;
  }

  // 3. Has session and restaurant access -> Allow
  return <>{children}</>;
}
