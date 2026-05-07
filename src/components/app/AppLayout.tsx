import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { HubAI } from './HubAI';
import { cn } from '../../lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 min-w-0",
        isSidebarOpen ? "lg:pl-64" : "lg:pl-20"
      )}>
        <Topbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="flex-1 p-4 lg:p-8 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* AI Assistant */}
      <HubAI />
    </div>
  );
}
