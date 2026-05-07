import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  ArrowLeft, 
  Smartphone, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Globe,
  Languages
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/auth/AuthContext';
import { apiPost } from '../lib/api';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

type Language = 'pt' | 'en' | 'es';

export function Login() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState<string | undefined>('');
  const [otp, setOtp] = useState('');
  const [clientId, setClientId] = useState('');
  const [showClientId, setShowClientId] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [language, setLanguage] = useState<Language>('pt');
  const navigate = useNavigate();
  const { refreshSession } = useAuth();

  const t = {
    pt: {
      title: 'Aceda ao seu painel',
      subtitle: 'Entre de forma segura utilizando o seu número de WhatsApp.',
      brandingTitle: 'A sua central de atendimento segura.',
      brandingSubtitle: 'Entre de forma rápida e segura utilizando a autenticação por WhatsApp. Sem palavras-passe para memorizar.',
      phoneLabel: 'Número de WhatsApp',
      phoneHint: 'Insira o número associado à sua conta TrataTudo.',
      sendCode: 'Receber código',
      otpTitle: 'Código de Verificação',
      otpHint: 'Enviámos um código de 6 dígitos para o seu WhatsApp.',
      otpPlaceholder: 'Insira o código',
      verify: 'Entrar',
      changePhone: 'Alterar número',
      resend: 'Não recebeu o código? Reenviar',
      back: 'Voltar para a página inicial',
      errorPhone: 'Por favor, insira um número válido.',
      errorOtp: 'O código deve ter exatamente 6 dígitos.',
      errorSession: 'Sessão não estabelecida. Verifique se o seu navegador aceita cookies de terceiros.',
      successLogin: 'Login efetuado com sucesso! A redirecionar...',
      successCode: 'Código enviado com sucesso para o seu WhatsApp!'
    },
    en: {
      title: 'Access your dashboard',
      subtitle: 'Log in securely using your WhatsApp number.',
      brandingTitle: 'Your secure service center.',
      brandingSubtitle: 'Log in quickly and securely using WhatsApp authentication. No passwords to remember.',
      phoneLabel: 'WhatsApp Number',
      phoneHint: 'Enter the number associated with your TrataTudo account.',
      sendCode: 'Receive code',
      otpTitle: 'Verification Code',
      otpHint: 'We sent a 6-digit code to your WhatsApp.',
      otpPlaceholder: 'Enter code',
      verify: 'Enter',
      changePhone: 'Change number',
      resend: "Didn't receive the code? Resend",
      back: 'Back to home page',
      errorPhone: 'Please enter a valid number.',
      errorOtp: 'The code must be exactly 6 digits.',
      errorSession: 'Session not established. Check if your browser accepts third-party cookies.',
      successLogin: 'Login successful! Redirecting...',
      successCode: 'Code sent successfully to your WhatsApp!'
    },
    es: {
      title: 'Acceda a su panel',
      subtitle: 'Inicie sesión de forma segura con su número de WhatsApp.',
      brandingTitle: 'Su centro de atención seguro.',
      brandingSubtitle: 'Inicie sesión de forma rápida y segura mediante la autenticación de WhatsApp. Sin contraseñas que recordar.',
      phoneLabel: 'Número de WhatsApp',
      phoneHint: 'Introduzca el número asociado a su cuenta TrataTudo.',
      sendCode: 'Recibir código',
      otpTitle: 'Código de Verificación',
      otpHint: 'Hemos enviado un código de 6 dígitos a tu WhatsApp.',
      otpPlaceholder: 'Introduzca el código',
      verify: 'Entrar',
      changePhone: 'Cambiar número',
      resend: '¿No has recibido el código? Reenviar',
      back: 'Volver a la página de inicio',
      errorPhone: 'Por favor, introduzca un número válido.',
      errorOtp: 'El código debe tener exactamente 6 dígitos.',
      errorSession: 'Sesión no establecida. Compruebe si su navegador acepta cookies de terceros.',
      successLogin: '¡Inicio de sesión con éxito! Redirigiendo...',
      successCode: '¡Código enviado con éxito a tu WhatsApp!'
    }
  }[language];

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setMessage({ type: 'error', text: t.errorPhone });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      await apiPost('/api/auth/send-otp', { phone_e164: phone });
      setStep('otp');
      setMessage({ type: 'success', text: t.successCode });
    } catch (error: any) {
      console.error('[OTP] Request code failed:', error);
      setMessage({ type: 'error', text: error.message || 'Erro ao enviar código.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setMessage({ type: 'error', text: t.errorOtp });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const data = await apiPost('/api/auth/verify-otp', { 
        phone_e164: phone, 
        code: otp, 
        clientId: clientId || undefined 
      });
      
      const sessionEstablished = await refreshSession();
      
      if (sessionEstablished) {
        setMessage({ type: 'success', text: t.successLogin });
        setTimeout(() => navigate('/app'), 1000);
      } else {
        setMessage({ type: 'error', text: t.errorSession });
      }
    } catch (error: any) {
      console.error('[OTP] Verify code failed:', error);
      if (error.message && error.message.includes('clientId')) {
        setShowClientId(true);
      }
      setMessage({ type: 'error', text: error.message || 'Código inválido.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="lg:w-1/2 bg-slate-900 p-8 lg:p-24 flex flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex items-center justify-between relative z-10">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <MessageSquare className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-display font-bold">
              Trata<span className="text-primary">Tudo</span>
            </span>
          </Link>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md rounded-xl p-1 border border-white/10">
            {(['pt', 'en', 'es'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  language === lang 
                    ? 'bg-white text-slate-900 shadow-lg' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl lg:text-6xl font-display font-bold leading-tight">{t.brandingTitle}</h1>
          <p className="text-xl text-slate-400 max-w-md">{t.brandingSubtitle}</p>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
          © 2024 TrataTudo. Todos os direitos reservados.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="lg:w-1/2 bg-white p-8 lg:p-24 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-display font-bold text-slate-900">{t.title}</h2>
            <p className="text-slate-600">{t.subtitle}</p>
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

          <div className="relative overflow-hidden min-h-[320px]">
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
                    <label className="text-sm font-bold text-slate-900">{t.phoneLabel}</label>
                    <div className="relative login-phone-input">
                      <PhoneInput
                        international
                        defaultCountry="PT"
                        value={phone}
                        onChange={setPhone}
                        disabled={isLoading}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 outline-none transition-all disabled:bg-slate-50"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">{t.phoneHint}</p>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.sendCode}
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
                      <label className="text-sm font-bold text-slate-900">{t.otpTitle}</label>
                      <button 
                        type="button"
                        onClick={() => setStep('phone')}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        {t.changePhone}
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
                        placeholder={t.otpPlaceholder}
                        maxLength={6}
                        disabled={isLoading}
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all tracking-[0.5em] font-mono text-center text-2xl disabled:bg-slate-50 disabled:text-slate-400"
                        autoFocus
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">{t.otpHint}</p>
                  </div>

                  {showClientId && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                    >
                      <label className="text-sm font-bold text-slate-900">ID do Cliente (Tenant)</label>
                      <input 
                        type="text" 
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="Ex: 1"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                      <p className="text-[10px] text-slate-400">Como admin global, deve indicar o ID do cliente onde pretende entrar.</p>
                    </motion.div>
                  )}

                  <button 
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.verify}
                  </button>

                  <div className="text-center">
                    <button 
                      type="button"
                      onClick={handleSendCode}
                      className="text-sm text-slate-500 hover:text-primary transition-colors"
                    >
                      {t.resend}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-8 border-t border-slate-100">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-4 h-4" /> {t.back}
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .login-phone-input .PhoneInput {
          display: flex;
          align-items: center;
        }
        .login-phone-input .PhoneInputInput {
          border: none;
          outline: none;
          width: 100%;
          font-size: 1.125rem;
          font-weight: 500;
          color: #1e293b;
          padding-left: 0.75rem;
          background: transparent;
        }
        .login-phone-input .PhoneInputCountry {
          display: flex;
          align-items: center;
          padding-right: 0.75rem;
          border-right: 1px solid #e2e8f0;
        }
        .login-phone-input .PhoneInputCountrySelect {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
