import React from 'react';
import { motion } from 'motion/react';

export function Privacy() {
  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto prose prose-slate lg:prose-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <h1 className="text-4xl lg:text-6xl font-display font-bold text-slate-900">Política de Privacidade</h1>
            <p className="text-slate-600">Última atualização: 13 de Março de 2026</p>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">1. Introdução</h2>
              <p>
                No TrataTudo, a sua privacidade é uma prioridade. Esta Política de Privacidade descreve como recolhemos, utilizamos e protegemos as suas informações pessoais ao utilizar a nossa plataforma.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">2. Informações que Recolhemos</h2>
              <p>
                Recolhemos informações que nos fornece diretamente, como nome, email, número de telefone e dados da organização, bem como informações sobre o uso da plataforma e interações via WhatsApp processadas pelo nosso sistema.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">3. Uso das Informações</h2>
              <p>
                Utilizamos as informações recolhidas para fornecer, manter e melhorar os nossos serviços, processar transações, enviar comunicações importantes e garantir a segurança da plataforma.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">4. Proteção de Dados (RGPD)</h2>
              <p>
                Estamos totalmente em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD). Implementamos medidas técnicas e organizacionais rigorosas para proteger os seus dados contra acesso não autorizado, perda ou alteração.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">5. Partilha de Informações</h2>
              <p>
                Não vendemos nem alugamos as suas informações pessoais a terceiros. Podemos partilhar dados com fornecedores de serviços que nos ajudam a operar a plataforma, sob estritos acordos de confidencialidade.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">6. Os Seus Direitos</h2>
              <p>
                Tem o direito de aceder, retificar ou eliminar os seus dados pessoais, bem como o direito de limitar ou opor-se ao processamento dos mesmos. Para exercer estes direitos, entre em contacto connosco.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">7. Contacto</h2>
              <p>
                Se tiver dúvidas sobre esta Política de Privacidade, contacte-nos através do email geral@tratatudo.pt.
              </p>
            </section>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
