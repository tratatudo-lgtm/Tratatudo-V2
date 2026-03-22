export type OperationalArea = 'pedidos' | 'reclamacoes' | 'vendas' | 'clientes' | 'equipa' | 'agenda' | 'tarefas' | 'documentos' | 'email' | 'faturas';

export interface HubTicket {
  id: string;
  client_id: string;
  client_profile_id?: number;
  assigned_user_id?: string;
  tracking_code: string;
  type: OperationalArea;
  subject: string;
  description: string;
  status: string;
  priority: 'baixa' | 'média' | 'alta' | 'urgente';
  source?: string;
  sla_status?: string;
  due_at?: string;
  ai_priority?: string;
  ai_summary?: string;
  ai_suggested_reply?: string;
  created_at: string;
  updated_at?: string;
  category?: string;
  ai_analysis?: string;
  client_name?: string;
  client_phone?: string;
}

export interface ClientProfile {
  id: number;
  client_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone_e164: string;
  nif?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  notes?: string;
  customer_score?: number;
  customer_type?: string;
  last_interaction_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientUser {
  id: string;
  client_id: string;
  owner_id?: string;
  name: string;
  email: string;
  role: 'admin' | 'gestor' | 'operador' | 'comercial' | 'técnico' | 'financeiro';
  status: 'active' | 'inactive' | 'invited';
  invited_by?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  event_type: string;
  status: string;
  start_at: string;
  end_at: string;
  location?: string;
  notes?: string;
  client_profile_id?: number;
  ticket_id?: string;
  assigned_user_id?: string;
  created_at: string;
}

export interface Task {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  priority: 'baixa' | 'média' | 'alta' | 'urgente';
  status: 'pendente' | 'em_progresso' | 'concluída' | 'cancelada';
  due_at?: string;
  assigned_user_id?: string;
  client_profile_id?: number;
  ticket_id?: string;
  created_at: string;
}

export interface Document {
  id: string;
  client_id: string;
  document_type: string;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  tags?: string[];
  status: string;
  extracted_text?: string;
  client_profile_id?: number;
  ticket_id?: string;
  created_at: string;
}

export interface Email {
  id: string;
  client_id: string;
  from_name?: string;
  from_email: string;
  to_emails: string[];
  cc_emails?: string[];
  bcc_emails?: string[];
  subject: string;
  body_text?: string;
  body_html?: string;
  status: string;
  category?: string;
  ai_summary?: string;
  ai_suggested_reply?: string;
  client_profile_id?: number;
  ticket_id?: string;
  created_at: string;
}

export interface FinancialDocument {
  id: string;
  client_id: string;
  doc_type: 'fatura' | 'orçamento' | 'recibo';
  doc_number: string;
  status: string;
  issue_date: string;
  due_date?: string;
  currency: string;
  subtotal: number;
  tax_total: number;
  total: number;
  notes?: string;
  pdf_path?: string;
  client_profile_id?: number;
  ticket_id?: string;
  created_at: string;
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
    statuses: ['novo', 'em análise', 'a aguardar cliente', 'em execução', 'concluído', 'cancelado']
  },
  reclamacoes: {
    label: 'Reclamações',
    bgLight: 'bg-red-50',
    bgMain: 'bg-red-600',
    bgHover: 'hover:bg-red-700',
    borderLight: 'border-red-100',
    textMain: 'text-red-600',
    shadowMain: 'shadow-red-200',
    statuses: ['nova', 'em investigação', 'a aguardar resposta', 'resolvida', 'encerrada']
  },
  vendas: {
    label: 'Vendas',
    bgLight: 'bg-emerald-50',
    bgMain: 'bg-emerald-600',
    bgHover: 'hover:bg-emerald-700',
    borderLight: 'border-emerald-100',
    textMain: 'text-emerald-600',
    shadowMain: 'shadow-emerald-200',
    statuses: ['novo lead', 'contactado', 'proposta enviada', 'negociação', 'fechado ganho', 'fechado perdido']
  },
  clientes: {
    label: 'Clientes',
    bgLight: 'bg-indigo-50',
    bgMain: 'bg-indigo-600',
    bgHover: 'hover:bg-indigo-700',
    borderLight: 'border-indigo-100',
    textMain: 'text-indigo-600',
    shadowMain: 'shadow-indigo-200',
    statuses: ['Ativo', 'Inativo', 'Lead', 'VIP']
  },
  equipa: {
    label: 'Equipa',
    bgLight: 'bg-slate-50',
    bgMain: 'bg-slate-600',
    bgHover: 'hover:bg-slate-700',
    borderLight: 'border-slate-100',
    textMain: 'text-slate-600',
    shadowMain: 'shadow-slate-200',
    statuses: ['active', 'inactive', 'invited']
  },
  agenda: {
    label: 'Agenda',
    bgLight: 'bg-amber-50',
    bgMain: 'bg-amber-600',
    bgHover: 'hover:bg-amber-700',
    borderLight: 'border-amber-100',
    textMain: 'text-amber-600',
    shadowMain: 'shadow-amber-200',
    statuses: ['confirmado', 'pendente', 'cancelado']
  },
  tarefas: {
    label: 'Tarefas',
    bgLight: 'bg-purple-50',
    bgMain: 'bg-purple-600',
    bgHover: 'hover:bg-purple-700',
    borderLight: 'border-purple-100',
    textMain: 'text-purple-600',
    shadowMain: 'shadow-purple-200',
    statuses: ['pendente', 'em_progresso', 'concluída', 'cancelada']
  },
  documentos: {
    label: 'Documentos',
    bgLight: 'bg-cyan-50',
    bgMain: 'bg-cyan-600',
    bgHover: 'hover:bg-cyan-700',
    borderLight: 'border-cyan-100',
    textMain: 'text-cyan-600',
    shadowMain: 'shadow-cyan-200',
    statuses: ['válido', 'expirado', 'pendente']
  },
  email: {
    label: 'Email',
    bgLight: 'bg-sky-50',
    bgMain: 'bg-sky-600',
    bgHover: 'hover:bg-sky-700',
    borderLight: 'border-sky-100',
    textMain: 'text-sky-600',
    shadowMain: 'shadow-sky-200',
    statuses: ['inbox', 'sent', 'draft', 'archived']
  },
  faturas: {
    label: 'Faturas',
    bgLight: 'bg-rose-50',
    bgMain: 'bg-rose-600',
    bgHover: 'hover:bg-rose-700',
    borderLight: 'border-rose-100',
    textMain: 'text-rose-600',
    shadowMain: 'shadow-rose-200',
    statuses: ['pago', 'pendente', 'atrasado', 'cancelado']
  }
};
