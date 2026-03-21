
export type HubArea = 'pedidos' | 'reclamacoes' | 'vendas';

export type PedidoStatus = 'novo' | 'em análise' | 'a aguardar cliente' | 'em execução' | 'concluído' | 'cancelado';
export type ReclamacaoStatus = 'nova' | 'em investigação' | 'a aguardar resposta' | 'resolvida' | 'encerrada';
export type VendaStatus = 'novo lead' | 'contactado' | 'proposta enviada' | 'negociação' | 'fechado ganho' | 'fechado perdido';

export interface HubTicket {
  id: string;
  tracking_code: string;
  type: HubArea;
  subject: string;
  description: string;
  status: string; // Will be cast based on type
  priority: 'baixa' | 'média' | 'alta' | 'urgente';
  created_at: string;
  updated_at?: string;
  category?: string;
  ai_analysis?: string;
  client_name?: string;
  client_phone?: string;
}

export const AREA_CONFIG = {
  pedidos: {
    label: 'Pedidos',
    icon: 'ClipboardList',
    color: 'blue',
    bgLight: 'bg-blue-50',
    bgMain: 'bg-blue-600',
    bgHover: 'hover:bg-blue-700',
    borderLight: 'border-blue-200',
    textMain: 'text-blue-600',
    shadowMain: 'shadow-blue-600/20',
    statuses: ['novo', 'em análise', 'a aguardar cliente', 'em execução', 'concluído', 'cancelado']
  },
  reclamacoes: {
    label: 'Reclamações',
    icon: 'AlertCircle',
    color: 'red',
    bgLight: 'bg-red-50',
    bgMain: 'bg-red-600',
    bgHover: 'hover:bg-red-700',
    borderLight: 'border-red-200',
    textMain: 'text-red-600',
    shadowMain: 'shadow-red-600/20',
    statuses: ['nova', 'em investigação', 'a aguardar resposta', 'resolvida', 'encerrada']
  },
  vendas: {
    label: 'Vendas',
    icon: 'TrendingUp',
    color: 'emerald',
    bgLight: 'bg-emerald-50',
    bgMain: 'bg-emerald-600',
    bgHover: 'hover:bg-emerald-700',
    borderLight: 'border-emerald-200',
    textMain: 'text-emerald-600',
    shadowMain: 'shadow-emerald-600/20',
    statuses: ['novo lead', 'contactado', 'proposta enviada', 'negociação', 'fechado ganho', 'fechado perdido']
  }
};
