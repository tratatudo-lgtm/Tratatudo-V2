import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Bot, 
  MessageSquareText, 
  Languages, 
  Volume2, 
  Bell, 
  ShieldCheck, 
  LogOut, 
  Save, 
  RotateCcw, 
  Headphones,
  Check,
  Clock,
  Smartphone,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface ClientSettings {
  client_id: string;
  company_name: string;
  phone_e164: string;
  email: string;
  bot_instructions: string;
  status: string;
  responsible_name?: string; // Added for UI consistency if available
}

export function Settings() {
  const [settings, setSettings] = useState<ClientSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    bot_instructions: '',
    responsible_name: ''
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/client/settings`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Falha ao carregar definições');
      const data = await res.json();
      setSettings(data);
      setFormData({
        company_name: data.company_name || '',
        email: data.email || '',
        bot_instructions: data.bot_instructions || '',
        responsible_name: data.responsible_name || 'João Duarte' // Mock fallback
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/client/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: formData.company_name,
          email: formData.email,
          bot_instructions: formData.bot_instructions
        }),
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Falha ao guardar alterações');
      
      const updated = await res.json();
      setSettings(updated);
      setSuccess(true);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      setFormData({
        company_name: settings.company_name || '',
        email: settings.email || '',
        bot_instructions: settings.bot_instructions || '',
        responsible_name: settings.responsible_name || 'João Duarte'
      });
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">A carregar definições...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Definições</h1>
          <p className="text-slate-500 text-sm">Gira as configurações da tua conta e personaliza o comportamento do teu bot.</p>
        </div>
        
        {success && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2 text-sm font-bold"
          >
            <Check className="w-4 h-4" /> Guardado com sucesso
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 text-red-600 px-4 py-2 rounded-xl border border-red-100 flex items-center gap-2 text-sm font-bold"
          >
            <AlertCircle className="w-4 h-4" /> {error}
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Dados da Conta */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" /> Dados da Conta
              </h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nome da Empresa</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Responsável</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={formData.responsible_name}
                    onChange={(e) => setFormData({ ...formData, responsible_name: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email de Contacto</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">WhatsApp Associado</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={settings?.phone_e164 || ''}
                    readOnly
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-500 outline-none text-sm font-medium cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </motion.section>

          {/* 2. Configuração do Bot */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" /> Configuração do Bot
              </h3>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                  settings?.status === 'active' ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-slate-600 bg-slate-50 border-slate-100"
                )}>
                  {settings?.status === 'active' ? 'Ativo' : settings?.status}
                </span>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nome do Bot</label>
                <input 
                  type="text" 
                  defaultValue="TrataBot Lisboa"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-medium"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Instruções do Bot (Prompt)</label>
                <textarea 
                  rows={6}
                  value={formData.bot_instructions}
                  onChange={(e) => setFormData({ ...formData, bot_instructions: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-medium resize-none"
                  placeholder="Descreva como o bot deve se comportar..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Volume2 className="w-3 h-3" /> Tom de Comunicação
                  </label>
                  <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-medium bg-white appearance-none">
                    <option>Profissional e Cordial</option>
                    <option>Amigável e Descontraído</option>
                    <option>Direto e Técnico</option>
                    <option>Entusiasta</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Languages className="w-3 h-3" /> Idioma Principal
                  </label>
                  <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-medium bg-white appearance-none">
                    <option>Português (Portugal)</option>
                    <option>Português (Brasil)</option>
                    <option>Inglês</option>
                    <option>Espanhol</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.section>

          {/* 3. Preferências */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" /> Preferências de Notificação
              </h3>
            </div>
            <div className="p-8 space-y-4">
              {[
                { id: 'email', label: 'Notificações por Email', desc: 'Recebe alertas de novos pedidos no teu email principal.', active: true },
                { id: 'portal', label: 'Notificações no Portal', desc: 'Alertas visuais dentro do dashboard do TrataTudo.', active: true },
                { id: 'urgent', label: 'Alertas de Pedidos Urgentes', desc: 'Notificações prioritárias para reclamações críticas.', active: true },
                { id: 'weekly', label: 'Relatórios Semanais', desc: 'Resumo de performance enviado todas as segundas-feiras.', active: false },
              ].map((pref) => (
                <div key={pref.id} className="flex items-start justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">{pref.label}</p>
                    <p className="text-xs text-slate-500">{pref.desc}</p>
                  </div>
                  <button className={cn(
                    "w-12 h-6 rounded-full relative transition-all duration-300",
                    pref.active ? "bg-primary" : "bg-slate-200"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300",
                      pref.active ? "left-7" : "left-1"
                    )}></div>
                  </button>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        <div className="space-y-8">
          {/* 4. Segurança */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" /> Segurança
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Método de Acesso</p>
                  <p className="text-sm font-bold text-slate-900">WhatsApp OTP</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Última sessão: <span className="font-bold text-slate-700">Hoje, 09:42</span></span>
                </div>
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-100 text-red-600 font-bold text-sm hover:bg-red-50 transition-all">
                  <LogOut className="w-4 h-4" /> Terminar Sessão
                </button>
              </div>
            </div>
          </motion.section>

          {/* 5. Ações Rápidas */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative space-y-6">
              <h3 className="text-xl font-bold">Ações da Conta</h3>
              <div className="space-y-3">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'A guardar...' : 'Guardar Alterações'}
                </button>
                <button 
                  onClick={handleReset}
                  className="w-full bg-white/10 text-white py-4 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Restaurar Definições
                </button>
                <button className="w-full bg-white/5 text-slate-400 py-4 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2 border border-white/10">
                  <Headphones className="w-4 h-4" /> Contactar Suporte
                </button>
              </div>
            </div>
          </motion.section>

          {/* Help Info */}
          <div className="px-6 text-center">
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Algumas alterações podem demorar até 5 minutos a ser propagadas para o bot WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
