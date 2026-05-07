
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../lib/auth/AuthContext';
import { 
  Settings, 
  Store, 
  Clock, 
  Bell, 
  Smartphone, 
  Globe, 
  Shield, 
  Save, 
  CheckCircle2, 
  XCircle,
  ChevronRight, 
  MapPin, 
  Phone, 
  Mail, 
  Bot,
  Eye,
  EyeOff,
  Camera,
  LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function RestaurantSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [botActive, setBotActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'general', label: 'Geral', icon: Store },
    { id: 'hours', label: 'Horário', icon: Clock },
    { id: 'bot', label: 'WhatsApp Bot', icon: Bot },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
  ];

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900">Configurações</h1>
          <p className="text-slate-500 font-medium">Personalize o seu portal e as regras do seu restaurante.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2",
            saving && "opacity-70 cursor-not-allowed"
          )}
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? 'A guardar...' : 'Guardar Alterações'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tabs Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full px-4 py-3.5 rounded-2xl flex items-center gap-3 transition-all font-bold text-sm",
                activeTab === tab.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "bg-white text-slate-500 border border-slate-200 hover:border-primary/30 hover:text-primary"
              )}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-slate-200">
            <button className="w-full px-4 py-3.5 rounded-2xl flex items-center gap-3 text-red-500 font-bold text-sm hover:bg-red-50 transition-all">
              <LogOut className="w-5 h-5" />
              Sair da Conta
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 space-y-8">
          {activeTab === 'general' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {/* Profile Image Section */}
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col items-center sm:flex-row sm:items-start gap-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[40px] bg-slate-100 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
                    <Store className="w-12 h-12 text-slate-300" />
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-2xl shadow-lg hover:scale-110 transition-all">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <h3 className="text-xl font-black text-slate-900">Logótipo do Restaurante</h3>
                  <p className="text-sm text-slate-500 font-medium max-w-md">
                    Este logótipo será visível no portal, no menu digital e nas comunicações do WhatsApp.
                  </p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2">
                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">PNG, JPG</span>
                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">Máx 2MB</span>
                  </div>
                </div>
              </div>

              {/* Basic Info Form */}
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl">
                    <Store className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">Informações Básicas</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Restaurante</label>
                    <div className="relative">
                      <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        defaultValue={user?.company_name || "TrataTudo Gourmet"}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone de Contacto</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="tel" 
                        defaultValue="+351 210 000 000"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Morada Completa</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        defaultValue="Avenida da Liberdade, 123, 1250-001 Lisboa"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Público</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="email" 
                        defaultValue="geral@tratatudo.pt"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="url" 
                        defaultValue="https://tratatudo.pt"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'bot' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Estado do Bot</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">WhatsApp Automation</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setBotActive(!botActive)}
                    className={cn(
                      "relative w-16 h-8 rounded-full transition-all duration-300",
                      botActive ? "bg-emerald-500" : "bg-slate-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300",
                      botActive ? "left-9" : "left-1"
                    )}></div>
                  </button>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-4">
                  <div className={cn(
                    "p-3 rounded-2xl",
                    botActive ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-400"
                  )}>
                    {botActive ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900">O Bot está {botActive ? 'Ativo' : 'Inativo'}</h4>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                      {botActive 
                        ? 'O assistente virtual está a responder a todas as mensagens e a gerir pedidos e reservas automaticamente.' 
                        : 'O assistente virtual está desligado. Terá de responder manualmente a todas as mensagens no WhatsApp.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-6 pt-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configurações do Assistente</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Aceitar Pedidos via Bot', active: true },
                      { label: 'Aceitar Reservas via Bot', active: true },
                      { label: 'Enviar Notificações de Pedido', active: true },
                      { label: 'Mostrar Menu Digital', active: true },
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-primary/20 transition-all group">
                        <span className="text-sm font-bold text-slate-700">{item.label}</span>
                        <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-primary transition-all">
                          {item.active && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'hours' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Horário de Funcionamento</h3>
              </div>

              <div className="space-y-4">
                {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((day) => (
                  <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-slate-400 text-[10px]">
                        {day.substring(0, 3).toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-slate-900">{day}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="time" defaultValue="12:00" className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20" />
                      <span className="text-slate-400 font-black text-[10px]">ATÉ</span>
                      <input type="time" defaultValue="23:00" className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20" />
                      <div className="w-px h-6 bg-slate-200 mx-2"></div>
                      <button className="text-[10px] font-black text-red-500 uppercase tracking-widest">Fechar</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
