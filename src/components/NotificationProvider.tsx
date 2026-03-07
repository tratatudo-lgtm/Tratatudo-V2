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
        (payload) => {
          const newMessage = payload.new;
          // Only notify if it's an incoming message
          if (newMessage.direction === 'inbound') {
            const messageText = newMessage.text || newMessage.content || 'Verifique o painel de mensagens.';
            toast('Nova mensagem recebida', {
              description: messageText.length > 60 ? messageText.substring(0, 60) + '...' : messageText,
              icon: <MessageCircle className="w-5 h-5 text-emerald-500" />,
              duration: 5000,
              action: {
                label: 'Ver',
                onClick: () => window.location.href = '/app/mensagens'
              }
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
        (payload) => {
          const newTicket = payload.new;
          const isComplaint = newTicket.type === 'reclamação';
          const ticketSubject = newTicket.subject || 'Novo ticket registrado.';
          
          if (isComplaint) {
            toast('Nova reclamação criada', {
              description: ticketSubject,
              icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
              duration: 6000,
              action: {
                label: 'Ver',
                onClick: () => window.location.href = '/app/pedidos'
              }
            });
          } else {
            toast('Novo pedido criado', {
              description: ticketSubject,
              icon: <Ticket className="w-5 h-5 text-blue-500" />,
              duration: 5000,
              action: {
                label: 'Ver',
                onClick: () => window.location.href = '/app/pedidos'
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
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
