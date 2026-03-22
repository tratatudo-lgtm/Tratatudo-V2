import.meta.env.VITE_API_URL import React, { createContext, useContext, useEffect } from 'react';
import.meta.env.VITE_API_URL import { Toaster, toast } from 'sonner';
import.meta.env.VITE_API_URL import { MessageCircle, Ticket, AlertTriangle } from 'lucide-react';
import.meta.env.VITE_API_URL import { supabase } from '@/src/lib/supabase';
import.meta.env.VITE_API_URL import { useAuth } from '@/src/lib/auth/AuthContext';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface NotificationContextType {
import.meta.env.VITE_API_URL   // We can add methods here if needed, like manual notification triggers
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function NotificationProvider({ children }: { children: React.ReactNode }) {
import.meta.env.VITE_API_URL   const { user } = useAuth();
import.meta.env.VITE_API_URL   const clientId = user?.client_id;
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   useEffect(() => {
import.meta.env.VITE_API_URL     if (!clientId) return;
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     console.log(`[NOTIFICATIONS] Subscribing to realtime events for client: ${clientId}`);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     // 1. Listen for new messages
import.meta.env.VITE_API_URL     const messageChannel = supabase
import.meta.env.VITE_API_URL       .channel('global_messages_notifications')
import.meta.env.VITE_API_URL       .on(
import.meta.env.VITE_API_URL         'postgres_changes',
import.meta.env.VITE_API_URL         {
import.meta.env.VITE_API_URL           event: 'INSERT',
import.meta.env.VITE_API_URL           schema: 'public',
import.meta.env.VITE_API_URL           table: 'wa_messages',
import.meta.env.VITE_API_URL           filter: `client_id=eq.${clientId}`,
import.meta.env.VITE_API_URL         },
import.meta.env.VITE_API_URL         (payload: any) => {
import.meta.env.VITE_API_URL           if (payload.new.direction === 'received') {
import.meta.env.VITE_API_URL             toast.info('Nova Mensagem', {
import.meta.env.VITE_API_URL               description: payload.new.text.substring(0, 50) + (payload.new.text.length > 50 ? '...' : ''),
import.meta.env.VITE_API_URL               icon: <MessageCircle className="w-4 h-4" />,
import.meta.env.VITE_API_URL             });
import.meta.env.VITE_API_URL           }
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL       )
import.meta.env.VITE_API_URL       .subscribe();
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     // 2. Listen for new tickets
import.meta.env.VITE_API_URL     const ticketChannel = supabase
import.meta.env.VITE_API_URL       .channel('global_tickets_notifications')
import.meta.env.VITE_API_URL       .on(
import.meta.env.VITE_API_URL         'postgres_changes',
import.meta.env.VITE_API_URL         {
import.meta.env.VITE_API_URL           event: 'INSERT',
import.meta.env.VITE_API_URL           schema: 'public',
import.meta.env.VITE_API_URL           table: 'tickets',
import.meta.env.VITE_API_URL           filter: `client_id=eq.${clientId}`,
import.meta.env.VITE_API_URL         },
import.meta.env.VITE_API_URL         (payload: any) => {
import.meta.env.VITE_API_URL           toast.success('Novo Ticket Criado', {
import.meta.env.VITE_API_URL             description: payload.new.subject,
import.meta.env.VITE_API_URL             icon: <Ticket className="w-4 h-4" />,
import.meta.env.VITE_API_URL           });
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL       )
import.meta.env.VITE_API_URL       .subscribe();
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     return () => {
import.meta.env.VITE_API_URL       console.log("[NOTIFICATIONS] Unsubscribing from realtime events.");
import.meta.env.VITE_API_URL       supabase.removeChannel(messageChannel);
import.meta.env.VITE_API_URL       supabase.removeChannel(ticketChannel);
import.meta.env.VITE_API_URL     };
import.meta.env.VITE_API_URL   }, [clientId]);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <NotificationContext.Provider value={{}}>
import.meta.env.VITE_API_URL       {children}
import.meta.env.VITE_API_URL       <Toaster 
import.meta.env.VITE_API_URL         position="top-right" 
import.meta.env.VITE_API_URL         expand={true} 
import.meta.env.VITE_API_URL         richColors 
import.meta.env.VITE_API_URL         closeButton
import.meta.env.VITE_API_URL         theme="light"
import.meta.env.VITE_API_URL       />
import.meta.env.VITE_API_URL     </NotificationContext.Provider>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export const useNotifications = () => {
import.meta.env.VITE_API_URL   const context = useContext(NotificationContext);
import.meta.env.VITE_API_URL   if (context === undefined) {
import.meta.env.VITE_API_URL     throw new Error('useNotifications must be used within a NotificationProvider');
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL   return context;
import.meta.env.VITE_API_URL };
