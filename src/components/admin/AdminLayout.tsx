import React from 'react';
import { Outlet } from 'react-router-dom';

export function AdminLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="admin-layout-v2 min-h-screen bg-slate-950 text-slate-100">
      {children || <Outlet />}
    </div>
  );
}
