import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export function Contact() {
  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl lg:text-6xl font-display font-bold text-slate-900">Entre em contacto</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Estamos aqui para ajudar a sua organização a dar o próximo passo na comunicação digital.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 space-y-8">
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Informações de Contacto</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Email</p>
                      <p className="text-slate-600">info@tratatudo.pt</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Telefone</p>
                      <p className="text-slate-600">+351 210 000 000</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Escritório</p>
                      <p className="text-slate-600">Avenida da Liberdade, Lisboa</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-primary text-white">
                <h3 className="text-xl font-bold mb-4">Suporte 24/7</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Os nossos clientes têm acesso a uma linha de suporte prioritária via WhatsApp para qualquer emergência.
                </p>
              </div>
            </div>

            <div className="lg:col-span-2">
              <form className="bg-white p-8 lg:p-12 rounded-3xl border border-slate-200 shadow-xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">Nome Completo</label>
                    <input 
                      type="text" 
                      placeholder="Ex: João Silva"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">Email Profissional</label>
                    <input 
                      type="email" 
                      placeholder="joao@empresa.pt"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Organização / Empresa</label>
                  <input 
                    type="text" 
                    placeholder="Nome da sua organização"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Assunto</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none bg-white">
                    <option>Pedido de Demonstração</option>
                    <option>Dúvida Técnica</option>
                    <option>Parceria</option>
                    <option>Outro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Mensagem</label>
                  <textarea 
                    rows={5}
                    placeholder="Como podemos ajudar?"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  ></textarea>
                </div>
                <button className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                  Enviar Mensagem <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
