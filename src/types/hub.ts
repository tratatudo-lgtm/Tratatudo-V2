export type OperationalArea = 'pedidos' | 'reclamacoes' | 'vendas';

export interface HubTicket {
  id: string;
  tracking_code: string;
  type: OperationalArea;
  subject: string;
  description: string;
  status: string;
  priority: 'baixa' | 'média' | 'alta' | 'urgente';
  created_at: string;
  updated_at?: string;
  category?: string;
  ai_analysis?: string;
  client_name?: string;
  client_phone?: string;
}

export const AREA_CONFIG: Record<OperationalArea, {
  label: string;
  bgLight: string;
  bgMain: string;
  bgHover: string;
  borderLight: string;
  textMain: string;
  shadowMain: string;
  statuses: string[];
}> = {
  pedidos: {
    label: 'Pedidos',
    bgLight: 'bg-blue-50',
    bgMain: 'bg-blue-600',
    bgHover: 'hover:bg-blue-700',
    borderLight: 'border-blue-100',
    textMain: 'text-blue-600',
    shadowMain: 'shadow-blue-200',
    statuses: [
      'novo',
      'em análise',
      'a aguardar cliente',
      'em execução',
      'concluído',
      'cancelado'
    ]
  },
  reclamacoes: {
    label: 'Reclamações',
    bgLight: 'bg-red-50',
    bgMain: 'bg-red-600',
    bgHover: 'hover:bg-red-700',
    borderLight: 'border-red-100',
    textMain: 'text-red-600',
    shadowMain: 'shadow-red-200',
    statuses: [
      'nova',
      'em investigação',
      'a aguardar resposta',
      'resolvida',
      'encerrada'
    ]
  },
  vendas: {
    label: 'Vendas',
    bgLight: 'bg-emerald-50',
    bgMain: 'bg-emerald-600',
    bgHover: 'hover:bg-emerald-700',
    borderLight: 'border-emerald-100',
    textMain: 'text-emerald-600',
    shadowMain: 'shadow-emerald-200',
    statuses: [
      'novo lead',
      'contactado',
      'proposta enviada',
      'negociação',
      'fechado ganho',
      'fechado perdido'
    ]
  }
};
