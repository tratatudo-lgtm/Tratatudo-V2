import.meta.env.VITE_API_URL import React, { useState } from 'react';
import.meta.env.VITE_API_URL import { Sidebar } from './Sidebar';
import.meta.env.VITE_API_URL import { Topbar } from './Topbar';
import.meta.env.VITE_API_URL import { HubAI } from './HubAI';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface AppLayoutProps {
import.meta.env.VITE_API_URL   children: React.ReactNode;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function AppLayout({ children }: AppLayoutProps) {
import.meta.env.VITE_API_URL   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <div className="min-h-screen bg-slate-50 flex">
import.meta.env.VITE_API_URL       <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}>
import.meta.env.VITE_API_URL         <Topbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
import.meta.env.VITE_API_URL         
import.meta.env.VITE_API_URL         <main className="flex-1 p-4 lg:p-8">
import.meta.env.VITE_API_URL           {children}
import.meta.env.VITE_API_URL         </main>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* AI Assistant */}
import.meta.env.VITE_API_URL       <HubAI />
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
