import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowLeft, Smartphone, Key, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/auth/AuthContext';

export function Login() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const navigate = useNavigate();
  const { refreshSession } = useAuth();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setMessage({ type: 'error', text: 'Por favor, insira um número válido.' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    const API_BASE = "https://api.tratatudo.pt";
    const url = `${API_BASE}/api/auth/send-otp`;
    const payload = { phone };
    console.log(`[OTP] Requesting code: ${url}`, payload);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      console.log(`[OTP] Request code status: ${response.status}`);
      const data = await response.json();
      console.log(`[OTP] Request code response:`, data);
      
      if (response.ok) {
        setStep('otp');
        setMessage({ type: 'success', text: data.message || 'Código enviado com sucesso para o seu WhatsApp!' });
      } else {
        setMessage({ type: 'error', text: data.message || data.error || 'Erro ao enviar código.' });
      }
    } catch (error: any) {
      console.error('[OTP] Request code failed:', error);
      setMessage({ type: 'error', text: `Erro de ligação ao servidor: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setMessage({ type: 'error', text: 'O código deve ter exatamente 6 dígitos.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

        const API_BASE = "https://api.tratatudo.pt";
    const url = `${API_BASE}/api/auth/verify-otp`;
    const payload = { phone, code: otp };
    console.log(`[OTP] Verifying code: ${url}`, payload);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      console.log(`[OTP] Verify code status: ${response.status}`);
      const data = await response.json();
      console.log(`[OTP] Verify code response:`, data);
      
      if (response.ok) {
        const sessionEstablished = await refreshSession();
        
        if (sessionEstablished) {
          setMessage({ type: 'success', text: data.message || 'Login efetuado com sucesso! A redirecionar...' });
          setTimeout(() => navigate('/app'), 1000);
        } else {
          console.error('[OTP] Session not found after successful verification');
          setMessage({ 
            type: 'error', 
            text: 'Sessão não estabelecida. Verifique se o seu navegador aceita cookies de terceiros.' 
          });
        }
      } else {
        setMessage({ type: 'error', text: data.message || data.error || 'Código inválido.' });
      }
    } catch (error: any) {
      console.error('[OTP] Verify code failed:', error);
      setMessage({ type: 'error', text: `Erro de ligação ao servidor: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="lg:w-1/2 bg-slate-900 p-8 lg:p-24 flex flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="bg-primary p-2 rounded-lg">
            <MessageSquare className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-display font-bold">
            Trata<span className="text-primary">Tudo</span>
          </span>
        </Link>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl lg:text-6xl font-display font-bold leading-tight">A sua central de atendimento segura.</h1>
          <p className="text-xl text-slate-400 max-w-md">
            Entre de forma rápida e segura utilizando a autenticação por WhatsApp. Sem palavras-passe para memorizar.
          </p>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
          © 2024 TrataTudo. Todos os direitos reservados.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="lg:w-1/2 bg-white p-8 lg:p-24 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-display font-bold text-slate-900">Aceda ao seu painel</h2>
            <p className="text-slate-600">Entre de forma segura utilizando o seu número de WhatsApp.</p>
          </div>

          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                  message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}
              >
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative overflow-hidden min-h-[300px]">
            <AnimatePresence mode="wait">
              {step === 'phone' ? (
                <motion.form
                  key="phone-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSendCode}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">Número de WhatsApp</label>
                    <div className="relative">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+351 912 345 678"
                        disabled={isLoading}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">Insira o número associado à sua conta TrataTudo.</p>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Receber código'}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="otp-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleLogin}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-slate-900">Código de Verificação</label>
                      <button 
                        type="button"
                        onClick={() => setStep('phone')}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Alterar número
                      </button>
                    </div>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" 
                        value={otp}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 6) setOtp(val);
                        }}
                        placeholder="Insira o código de 6 dígitos"
                        maxLength={6}
                        disabled={isLoading}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all tracking-[0.5em] font-mono text-center text-xl disabled:bg-slate-50 disabled:text-slate-400"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">Enviámos um código de 6 dígitos para o seu WhatsApp.</p>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
                  </button>

                  <div className="text-center">
                    <button 
                      type="button"
                      onClick={handleSendCode}
                      className="text-sm text-slate-500 hover:text-primary transition-colors"
                    >
                      Não recebeu o código? <span className="font-bold">Reenviar</span>
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-8 border-t border-slate-100">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Voltar para a página inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
