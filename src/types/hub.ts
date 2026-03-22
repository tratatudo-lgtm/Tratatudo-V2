import.meta.env.VITE_API_URL export type OperationalArea = 'pedidos' | 'reclamacoes' | 'vendas';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export interface HubTicket {
import.meta.env.VITE_API_URL   id: string;
import.meta.env.VITE_API_URL   tracking_code: string;
import.meta.env.VITE_API_URL   type: OperationalArea;
import.meta.env.VITE_API_URL   subject: string;
import.meta.env.VITE_API_URL   description: string;
import.meta.env.VITE_API_URL   status: string;
import.meta.env.VITE_API_URL   priority: 'baixa' | 'média' | 'alta' | 'urgente';
import.meta.env.VITE_API_URL   created_at: string;
import.meta.env.VITE_API_URL   updated_at?: string;
import.meta.env.VITE_API_URL   category?: string;
import.meta.env.VITE_API_URL   ai_analysis?: string;
import.meta.env.VITE_API_URL   client_name?: string;
import.meta.env.VITE_API_URL   client_phone?: string;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export const AREA_CONFIG: Record<OperationalArea, {
import.meta.env.VITE_API_URL   label: string;
import.meta.env.VITE_API_URL   bgLight: string;
import.meta.env.VITE_API_URL   bgMain: string;
import.meta.env.VITE_API_URL   bgHover: string;
import.meta.env.VITE_API_URL   borderLight: string;
import.meta.env.VITE_API_URL   textMain: string;
import.meta.env.VITE_API_URL   shadowMain: string;
import.meta.env.VITE_API_URL   statuses: string[];
import.meta.env.VITE_API_URL }> = {
import.meta.env.VITE_API_URL   pedidos: {
import.meta.env.VITE_API_URL     label: 'Pedidos',
import.meta.env.VITE_API_URL     bgLight: 'bg-blue-50',
import.meta.env.VITE_API_URL     bgMain: 'bg-blue-600',
import.meta.env.VITE_API_URL     bgHover: 'hover:bg-blue-700',
import.meta.env.VITE_API_URL     borderLight: 'border-blue-100',
import.meta.env.VITE_API_URL     textMain: 'text-blue-600',
import.meta.env.VITE_API_URL     shadowMain: 'shadow-blue-200',
import.meta.env.VITE_API_URL     statuses: [
import.meta.env.VITE_API_URL       'novo',
import.meta.env.VITE_API_URL       'em análise',
import.meta.env.VITE_API_URL       'a aguardar cliente',
import.meta.env.VITE_API_URL       'em execução',
import.meta.env.VITE_API_URL       'concluído',
import.meta.env.VITE_API_URL       'cancelado'
import.meta.env.VITE_API_URL     ]
import.meta.env.VITE_API_URL   },
import.meta.env.VITE_API_URL   reclamacoes: {
import.meta.env.VITE_API_URL     label: 'Reclamações',
import.meta.env.VITE_API_URL     bgLight: 'bg-red-50',
import.meta.env.VITE_API_URL     bgMain: 'bg-red-600',
import.meta.env.VITE_API_URL     bgHover: 'hover:bg-red-700',
import.meta.env.VITE_API_URL     borderLight: 'border-red-100',
import.meta.env.VITE_API_URL     textMain: 'text-red-600',
import.meta.env.VITE_API_URL     shadowMain: 'shadow-red-200',
import.meta.env.VITE_API_URL     statuses: [
import.meta.env.VITE_API_URL       'nova',
import.meta.env.VITE_API_URL       'em investigação',
import.meta.env.VITE_API_URL       'a aguardar resposta',
import.meta.env.VITE_API_URL       'resolvida',
import.meta.env.VITE_API_URL       'encerrada'
import.meta.env.VITE_API_URL     ]
import.meta.env.VITE_API_URL   },
import.meta.env.VITE_API_URL   vendas: {
import.meta.env.VITE_API_URL     label: 'Vendas',
import.meta.env.VITE_API_URL     bgLight: 'bg-emerald-50',
import.meta.env.VITE_API_URL     bgMain: 'bg-emerald-600',
import.meta.env.VITE_API_URL     bgHover: 'hover:bg-emerald-700',
import.meta.env.VITE_API_URL     borderLight: 'border-emerald-100',
import.meta.env.VITE_API_URL     textMain: 'text-emerald-600',
import.meta.env.VITE_API_URL     shadowMain: 'shadow-emerald-200',
import.meta.env.VITE_API_URL     statuses: [
import.meta.env.VITE_API_URL       'novo lead',
import.meta.env.VITE_API_URL       'contactado',
import.meta.env.VITE_API_URL       'proposta enviada',
import.meta.env.VITE_API_URL       'negociação',
import.meta.env.VITE_API_URL       'fechado ganho',
import.meta.env.VITE_API_URL       'fechado perdido'
import.meta.env.VITE_API_URL     ]
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL };
