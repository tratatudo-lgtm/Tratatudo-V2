import React from 'react';
import { motion } from 'motion/react';

export function Cookies() {
  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto prose prose-slate lg:prose-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <h1 className="text-4xl lg:text-6xl font-display font-bold text-slate-900">Política de Cookies</h1>
            <p className="text-slate-600">Última atualização: 13 de Março de 2026</p>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">1. O que são Cookies?</h2>
              <p>
                Cookies são pequenos ficheiros de texto que são armazenados no seu dispositivo quando visita um website. Eles ajudam o website a reconhecer o seu dispositivo e a lembrar-se de informações sobre a sua visita.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">2. Como utilizamos os Cookies?</h2>
              <p>
                Utilizamos cookies para melhorar a sua experiência na plataforma, entender como os nossos serviços são utilizados e personalizar o conteúdo. Alguns cookies são essenciais para o funcionamento do site, enquanto outros são utilizados para fins analíticos ou de marketing.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">3. Tipos de Cookies que utilizamos</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Cookies Essenciais:</strong> Necessários para o funcionamento básico do site e segurança.</li>
                <li><strong>Cookies de Desempenho:</strong> Ajudam-nos a entender como os visitantes interagem com o site, recolhendo informações anonimamente.</li>
                <li><strong>Cookies de Funcionalidade:</strong> Permitem que o site se lembre de escolhas que fez (como o seu nome de utilizador ou idioma).</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">4. Gestão de Cookies</h2>
              <p>
                Pode controlar e/ou eliminar cookies conforme desejar através das definições do seu navegador. No entanto, desativar certos cookies pode afetar a funcionalidade da plataforma.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">5. Alterações à Política</h2>
              <p>
                Podemos atualizar esta Política de Cookies periodicamente para refletir alterações nas nossas práticas ou por razões operacionais, legais ou regulamentares.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">6. Contacto</h2>
              <p>
                Para mais informações sobre o uso de cookies, contacte-nos através do email geral@tratatudo.pt.
              </p>
            </section>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
