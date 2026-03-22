import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { HubAI } from './HubAI';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}>
        <Topbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* AI Assistant */}
      <HubAI />
    </div>
  );
}
