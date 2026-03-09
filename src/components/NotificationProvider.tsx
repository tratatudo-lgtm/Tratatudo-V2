import React, { createContext, useContext, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { MessageCircle, Ticket, AlertTriangle } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/lib/auth/AuthContext';

interface NotificationContextType {
  // We can add methods here if needed, like manual notification triggers
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const clientId = user?.client_id;

  useEffect(() => {
    if (!clientId) return;

    console.log(`[NOTIFICATIONS] Subscribing to realtime events for client: ${clientId}`);

    // 1. Listen for new messages
    const messageChannel = supabase
      .channel('global_messages_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wa_messages',
          filter: `client_id=eq.${clientId}`,
        },
        (payload: any) => {
          if (payload.new.direction === 'received') {
            toast.info('Nova Mensagem', {
              description: payload.new.text.substring(0, 50) + (payload.new.text.length > 50 ? '...' : ''),
              icon: <MessageCircle className="w-4 h-4" />,
            });
          }
        }
      )
      .subscribe();

    // 2. Listen for new tickets
    const ticketChannel = supabase
      .channel('global_tickets_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tickets',
          filter: `client_id=eq.${clientId}`,
        },
        (payload: any) => {
          toast.success('Novo Ticket Criado', {
            description: payload.new.subject,
            icon: <Ticket className="w-4 h-4" />,
          });
        }
      )
      .subscribe();

    return () => {
      console.log("[NOTIFICATIONS] Unsubscribing from realtime events.");
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(ticketChannel);
    };
  }, [clientId]);

  return (
    <NotificationContext.Provider value={{}}>
      {children}
      <Toaster 
        position="top-right" 
        expand={true} 
        richColors 
        closeButton
        theme="light"
      />
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
