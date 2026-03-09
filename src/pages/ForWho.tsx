import React from 'react';
import { motion } from 'motion/react';
import { Building2, Store, Users, HeartHandshake, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const sectors = [
  {
    icon: <Building2 />,
    title: "Câmaras e Juntas",
    desc: "Aproxime a governação dos cidadãos. Permita o reporte de ocorrências, agendamento de serviços e consulta de processos via WhatsApp.",
    features: ["Reporte de Ocorrências", "Agendamento de Atendimento", "Informações de Freguesia"]
  },
  {
    icon: <Store />,
    title: "Comércio e Retalho",
    desc: "Automatize pedidos, envie atualizações de stock e ofereça um suporte pós-venda rápido que fideliza os seus clientes.",
    features: ["Catálogo Automático", "Status de Encomenda", "Suporte Pós-Venda"]
  },
  {
    icon: <HeartHandshake />,
    title: "Serviços e Clínicas",
    desc: "Gira marcações, envie lembretes automáticos e responda a dúvidas sobre serviços de forma organizada.",
    features: ["Lembretes de Marcação", "Esclarecimento de Serviços", "Gestão de Agenda"]
  },
  {
    icon: <Users />,
    title: "Associações e Clubes",
    desc: "Mantenha os seus sócios informados, gira quotas e automatize a inscrição em eventos ou atividades.",
    features: ["Comunicação com Sócios", "Inscrição em Eventos", "Gestão de Quotas"]
  }
];

export function ForWho() {
  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h1 className="text-4xl lg:text-6xl font-display font-bold text-slate-900">Para quem é o TrataTudo?</h1>
          <p className="text-xl text-slate-600">Soluções versáteis que se adaptam a qualquer tipo de organização que valorize a comunicação.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {sectors.map((sector, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-10 rounded-[2.5rem] border border-slate-200 hover:border-primary/30 hover:shadow-2xl transition-all group"
            >
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all">
                {React.cloneElement(sector.icon as React.ReactElement, { className: "w-8 h-8" } as any)}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{sector.title}</h3>
              <p className="text-slate-600 mb-8 leading-relaxed">{sector.desc}</p>
              <div className="space-y-3">
                {sector.features.map((feat, j) => (
                  <div key={j} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {feat}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-32 bg-primary/5 rounded-[3rem] p-12 lg:p-24 text-center">
          <h2 className="text-3xl lg:text-5xl font-display font-bold text-slate-900 mb-8">Não encontrou o seu setor?</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12">
            O TrataTudo é altamente flexível. Fale connosco para percebermos como podemos adaptar a plataforma às suas necessidades específicas.
          </p>
          <Link
            to="/contacto"
            className="inline-flex items-center gap-2 bg-primary text-white px-10 py-5 rounded-full text-xl font-bold hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
          >
            Falar com um Especialista <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </div>
  );
}
