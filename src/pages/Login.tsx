import.meta.env.VITE_API_URL import React, { useState } from 'react';
import.meta.env.VITE_API_URL import { Link, useNavigate } from 'react-router-dom';
import.meta.env.VITE_API_URL import { MessageSquare, ArrowLeft, Smartphone, Key, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import.meta.env.VITE_API_URL import { motion, AnimatePresence } from 'motion/react';
import.meta.env.VITE_API_URL import { useAuth } from '../lib/auth/AuthContext';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function Login() {
import.meta.env.VITE_API_URL   const [step, setStep] = useState<'phone' | 'otp'>('phone');
import.meta.env.VITE_API_URL   const [phone, setPhone] = useState('');
import.meta.env.VITE_API_URL   const [otp, setOtp] = useState('');
import.meta.env.VITE_API_URL   const [isLoading, setIsLoading] = useState(false);
import.meta.env.VITE_API_URL   const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
import.meta.env.VITE_API_URL   const navigate = useNavigate();
import.meta.env.VITE_API_URL   const { refreshSession } = useAuth();
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleSendCode = async (e: React.FormEvent) => {
import.meta.env.VITE_API_URL     e.preventDefault();
import.meta.env.VITE_API_URL     if (!phone) {
import.meta.env.VITE_API_URL       setMessage({ type: 'error', text: 'Por favor, insira um número válido.' });
import.meta.env.VITE_API_URL       return;
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     setIsLoading(true);
import.meta.env.VITE_API_URL     setMessage(null);
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     const url = `${import.meta.env.VITE_API_URL}/api/auth/send-otp`;
import.meta.env.VITE_API_URL     const payload = { phone_e164: phone };
import.meta.env.VITE_API_URL     console.log(`[OTP] Requesting code: ${url}`, payload);
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       const response = await fetch(url, {
import.meta.env.VITE_API_URL         method: 'POST',
import.meta.env.VITE_API_URL         headers: { 'Content-Type': 'application/json' },
import.meta.env.VITE_API_URL         credentials: 'include',
import.meta.env.VITE_API_URL         body: JSON.stringify(payload),
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       console.log(`[OTP] Request code status: ${response.status}`);
import.meta.env.VITE_API_URL       const data = await response.json();
import.meta.env.VITE_API_URL       console.log(`[OTP] Request code response:`, data);
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       if (response.ok) {
import.meta.env.VITE_API_URL         setStep('otp');
import.meta.env.VITE_API_URL         setMessage({ type: 'success', text: data.message || 'Código enviado com sucesso para o seu WhatsApp!' });
import.meta.env.VITE_API_URL       } else {
import.meta.env.VITE_API_URL         setMessage({ type: 'error', text: data.message || data.error || 'Erro ao enviar código.' });
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL     } catch (error: any) {
import.meta.env.VITE_API_URL       console.error('[OTP] Request code failed:', error);
import.meta.env.VITE_API_URL       setMessage({ type: 'error', text: `Erro de ligação ao servidor: ${error.message}` });
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setIsLoading(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleLogin = async (e: React.FormEvent) => {
import.meta.env.VITE_API_URL     e.preventDefault();
import.meta.env.VITE_API_URL     if (otp.length !== 6) {
import.meta.env.VITE_API_URL       setMessage({ type: 'error', text: 'O código deve ter exatamente 6 dígitos.' });
import.meta.env.VITE_API_URL       return;
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     setIsLoading(true);
import.meta.env.VITE_API_URL     setMessage(null);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     const url = `${import.meta.env.VITE_API_URL}/api/auth/verify-otp`;
import.meta.env.VITE_API_URL     const payload = { phone_e164: phone, code: otp };
import.meta.env.VITE_API_URL     console.log(`[OTP] Verifying code: ${url}`, payload);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       const response = await fetch(url, {
import.meta.env.VITE_API_URL         method: 'POST',
import.meta.env.VITE_API_URL         headers: { 'Content-Type': 'application/json' },
import.meta.env.VITE_API_URL         credentials: 'include',
import.meta.env.VITE_API_URL         body: JSON.stringify(payload),
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       console.log(`[OTP] Verify code status: ${response.status}`);
import.meta.env.VITE_API_URL       const data = await response.json();
import.meta.env.VITE_API_URL       console.log(`[OTP] Verify code response:`, data);
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       if (response.ok) {
import.meta.env.VITE_API_URL         const sessionEstablished = await refreshSession();
import.meta.env.VITE_API_URL         
import.meta.env.VITE_API_URL         if (sessionEstablished) {
import.meta.env.VITE_API_URL           setMessage({ type: 'success', text: data.message || 'Login efetuado com sucesso! A redirecionar...' });
import.meta.env.VITE_API_URL           setTimeout(() => navigate('/app'), 1000);
import.meta.env.VITE_API_URL         } else {
import.meta.env.VITE_API_URL           console.error('[OTP] Session not found after successful verification');
import.meta.env.VITE_API_URL           setMessage({ 
import.meta.env.VITE_API_URL             type: 'error', 
import.meta.env.VITE_API_URL             text: 'Sessão não estabelecida. Verifique se o seu navegador aceita cookies de terceiros.' 
import.meta.env.VITE_API_URL           });
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL       } else {
import.meta.env.VITE_API_URL         setMessage({ type: 'error', text: data.message || data.error || 'Código inválido.' });
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL     } catch (error: any) {
import.meta.env.VITE_API_URL       console.error('[OTP] Verify code failed:', error);
import.meta.env.VITE_API_URL       setMessage({ type: 'error', text: `Erro de ligação ao servidor: ${error.message}` });
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setIsLoading(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <div className="min-h-screen flex flex-col lg:flex-row">
import.meta.env.VITE_API_URL       {/* Left Side - Branding */}
import.meta.env.VITE_API_URL       <div className="lg:w-1/2 bg-slate-900 p-8 lg:p-24 flex flex-col justify-between text-white relative overflow-hidden">
import.meta.env.VITE_API_URL         <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
import.meta.env.VITE_API_URL         
import.meta.env.VITE_API_URL         <Link to="/" className="flex items-center gap-2 relative z-10">
import.meta.env.VITE_API_URL           <div className="bg-primary p-2 rounded-lg">
import.meta.env.VITE_API_URL             <MessageSquare className="text-white w-6 h-6" />
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL           <span className="text-2xl font-display font-bold">
import.meta.env.VITE_API_URL             Trata<span className="text-primary">Tudo</span>
import.meta.env.VITE_API_URL           </span>
import.meta.env.VITE_API_URL         </Link>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         <div className="relative z-10 space-y-6">
import.meta.env.VITE_API_URL           <h1 className="text-4xl lg:text-6xl font-display font-bold leading-tight">A sua central de atendimento segura.</h1>
import.meta.env.VITE_API_URL           <p className="text-xl text-slate-400 max-w-md">
import.meta.env.VITE_API_URL             Entre de forma rápida e segura utilizando a autenticação por WhatsApp. Sem palavras-passe para memorizar.
import.meta.env.VITE_API_URL           </p>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         <div className="relative z-10 text-sm text-slate-500">
import.meta.env.VITE_API_URL           © 2024 TrataTudo. Todos os direitos reservados.
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* Right Side - Login Form */}
import.meta.env.VITE_API_URL       <div className="lg:w-1/2 bg-white p-8 lg:p-24 flex items-center justify-center">
import.meta.env.VITE_API_URL         <div className="w-full max-w-md space-y-8">
import.meta.env.VITE_API_URL           <div className="space-y-2">
import.meta.env.VITE_API_URL             <h2 className="text-3xl font-display font-bold text-slate-900">Aceda ao seu painel</h2>
import.meta.env.VITE_API_URL             <p className="text-slate-600">Entre de forma segura utilizando o seu número de WhatsApp.</p>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           <AnimatePresence mode="wait">
import.meta.env.VITE_API_URL             {message && (
import.meta.env.VITE_API_URL               <motion.div
import.meta.env.VITE_API_URL                 initial={{ opacity: 0, y: -10 }}
import.meta.env.VITE_API_URL                 animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL                 exit={{ opacity: 0, y: -10 }}
import.meta.env.VITE_API_URL                 className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
import.meta.env.VITE_API_URL                   message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
import.meta.env.VITE_API_URL                 }`}
import.meta.env.VITE_API_URL               >
import.meta.env.VITE_API_URL                 {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
import.meta.env.VITE_API_URL                 {message.text}
import.meta.env.VITE_API_URL               </motion.div>
import.meta.env.VITE_API_URL             )}
import.meta.env.VITE_API_URL           </AnimatePresence>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           <div className="relative overflow-hidden min-h-[300px]">
import.meta.env.VITE_API_URL             <AnimatePresence mode="wait">
import.meta.env.VITE_API_URL               {step === 'phone' ? (
import.meta.env.VITE_API_URL                 <motion.form
import.meta.env.VITE_API_URL                   key="phone-step"
import.meta.env.VITE_API_URL                   initial={{ opacity: 0, x: 20 }}
import.meta.env.VITE_API_URL                   animate={{ opacity: 1, x: 0 }}
import.meta.env.VITE_API_URL                   exit={{ opacity: 0, x: -20 }}
import.meta.env.VITE_API_URL                   onSubmit={handleSendCode}
import.meta.env.VITE_API_URL                   className="space-y-6"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   <div className="space-y-2">
import.meta.env.VITE_API_URL                     <label className="text-sm font-bold text-slate-900">Número de WhatsApp</label>
import.meta.env.VITE_API_URL                     <div className="relative">
import.meta.env.VITE_API_URL                       <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
import.meta.env.VITE_API_URL                       <input 
import.meta.env.VITE_API_URL                         type="tel" 
import.meta.env.VITE_API_URL                         value={phone}
import.meta.env.VITE_API_URL                         onChange={(e) => setPhone(e.target.value)}
import.meta.env.VITE_API_URL                         placeholder="+351 912 345 678"
import.meta.env.VITE_API_URL                         disabled={isLoading}
import.meta.env.VITE_API_URL                         className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
import.meta.env.VITE_API_URL                       />
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                     <p className="text-[10px] text-slate-400">Insira o número associado à sua conta TrataTudo.</p>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                   <button 
import.meta.env.VITE_API_URL                     type="submit"
import.meta.env.VITE_API_URL                     disabled={isLoading}
import.meta.env.VITE_API_URL                     className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
import.meta.env.VITE_API_URL                   >
import.meta.env.VITE_API_URL                     {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Receber código'}
import.meta.env.VITE_API_URL                   </button>
import.meta.env.VITE_API_URL                 </motion.form>
import.meta.env.VITE_API_URL               ) : (
import.meta.env.VITE_API_URL                 <motion.form
import.meta.env.VITE_API_URL                   key="otp-step"
import.meta.env.VITE_API_URL                   initial={{ opacity: 0, x: 20 }}
import.meta.env.VITE_API_URL                   animate={{ opacity: 1, x: 0 }}
import.meta.env.VITE_API_URL                   exit={{ opacity: 0, x: -20 }}
import.meta.env.VITE_API_URL                   onSubmit={handleLogin}
import.meta.env.VITE_API_URL                   className="space-y-6"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   <div className="space-y-2">
import.meta.env.VITE_API_URL                     <div className="flex justify-between items-center">
import.meta.env.VITE_API_URL                       <label className="text-sm font-bold text-slate-900">Código de Verificação</label>
import.meta.env.VITE_API_URL                       <button 
import.meta.env.VITE_API_URL                         type="button"
import.meta.env.VITE_API_URL                         onClick={() => setStep('phone')}
import.meta.env.VITE_API_URL                         className="text-xs font-bold text-primary hover:underline"
import.meta.env.VITE_API_URL                       >
import.meta.env.VITE_API_URL                         Alterar número
import.meta.env.VITE_API_URL                       </button>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                     <div className="relative">
import.meta.env.VITE_API_URL                       <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
import.meta.env.VITE_API_URL                       <input 
import.meta.env.VITE_API_URL                         type="text" 
import.meta.env.VITE_API_URL                         value={otp}
import.meta.env.VITE_API_URL                         onChange={(e) => {
import.meta.env.VITE_API_URL                           const val = e.target.value.replace(/\D/g, '');
import.meta.env.VITE_API_URL                           if (val.length <= 6) setOtp(val);
import.meta.env.VITE_API_URL                         }}
import.meta.env.VITE_API_URL                         placeholder="Insira o código de 6 dígitos"
import.meta.env.VITE_API_URL                         maxLength={6}
import.meta.env.VITE_API_URL                         disabled={isLoading}
import.meta.env.VITE_API_URL                         className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all tracking-[0.5em] font-mono text-center text-xl disabled:bg-slate-50 disabled:text-slate-400"
import.meta.env.VITE_API_URL                       />
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                     <p className="text-[10px] text-slate-400">Enviámos um código de 6 dígitos para o seu WhatsApp.</p>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                   <button 
import.meta.env.VITE_API_URL                     type="submit"
import.meta.env.VITE_API_URL                     disabled={isLoading}
import.meta.env.VITE_API_URL                     className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
import.meta.env.VITE_API_URL                   >
import.meta.env.VITE_API_URL                     {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
import.meta.env.VITE_API_URL                   </button>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                   <div className="text-center">
import.meta.env.VITE_API_URL                     <button 
import.meta.env.VITE_API_URL                       type="button"
import.meta.env.VITE_API_URL                       onClick={handleSendCode}
import.meta.env.VITE_API_URL                       className="text-sm text-slate-500 hover:text-primary transition-colors"
import.meta.env.VITE_API_URL                     >
import.meta.env.VITE_API_URL                       Não recebeu o código? <span className="font-bold">Reenviar</span>
import.meta.env.VITE_API_URL                     </button>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </motion.form>
import.meta.env.VITE_API_URL               )}
import.meta.env.VITE_API_URL             </AnimatePresence>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           <div className="pt-8 border-t border-slate-100">
import.meta.env.VITE_API_URL             <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
import.meta.env.VITE_API_URL               <ArrowLeft className="w-4 h-4" /> Voltar para a página inicial
import.meta.env.VITE_API_URL             </Link>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
