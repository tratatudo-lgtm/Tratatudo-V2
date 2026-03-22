export type HubArea = 
  | 'dashboard' 
  | 'mensagens' 
  | 'pedidos' 
  | 'reclamacoes' 
  | 'vendas' 
  | 'clientes'
  | 'agenda'
  | 'tarefas'
  | 'documentos'
  | 'email'
  | 'faturas'
  | 'instancia' 
  | 'subscricao' 
  | 'definicoes'
  | 'equipa'
  | 'relatorios'
  | 'ia';

export type HubAction = 
  | 'ver' 
  | 'ver_detalhe'
  | 'criar' 
  | 'editar' 
  | 'alterar_estado' 
  | 'responder' 
  | 'eliminar'
  | 'gerir';

export type UserPermissions = Partial<Record<HubArea, HubAction[]>>;

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  permissions: UserPermissions;
  status: 'active' | 'invited' | 'suspended';
  created_at: string;
  last_login?: string;
  avatar_url?: string;
}

export const TEAM_AREAS: { id: HubArea; label: string; description: string }[] = [
  { id: 'dashboard', label: 'Dashboard', description: 'Visão geral e métricas' },
  { id: 'mensagens', label: 'Mensagens', description: 'Chat e comunicações' },
  { id: 'pedidos', label: 'Pedidos', description: 'Gestão de solicitações' },
  { id: 'reclamacoes', label: 'Reclamações', description: 'Gestão de incidências' },
  { id: 'vendas', label: 'Vendas', description: 'Pipeline e leads' },
  { id: 'clientes', label: 'Clientes', description: 'Gestão de CRM' },
  { id: 'agenda', label: 'Agenda', description: 'Calendário e eventos' },
  { id: 'tarefas', label: 'Tarefas', description: 'Gestão de afazeres' },
  { id: 'documentos', label: 'Documentos', description: 'Gestão de ficheiros' },
  { id: 'email', label: 'Email', description: 'Comunicações por email' },
  { id: 'faturas', label: 'Financeiro', description: 'Documentos financeiros e pagamentos' },
  { id: 'instancia', label: 'Instância', description: 'Configuração do WhatsApp' },
  { id: 'equipa', label: 'Equipa', description: 'Gestão de utilizadores' },
  { id: 'relatorios', label: 'Relatórios', description: 'Análise de dados' },
  { id: 'ia', label: 'IA', description: 'Assistente inteligente' },
  { id: 'subscricao', label: 'Subscrição', description: 'Planos e faturação' },
  { id: 'definicoes', label: 'Definições', description: 'Configurações da conta' },
];

export const TEAM_ACTIONS: { id: HubAction; label: string }[] = [
  { id: 'ver', label: 'Ver' },
  { id: 'ver_detalhe', label: 'Ver Detalhe' },
  { id: 'criar', label: 'Criar' },
  { id: 'editar', label: 'Editar' },
  { id: 'alterar_estado', label: 'Estado' },
  { id: 'responder', label: 'Responder' },
  { id: 'eliminar', label: 'Eliminar' },
  { id: 'gerir', label: 'Gerir' },
];
