import.meta.env.VITE_API_URL import React, { useEffect, useRef, useState } from 'react';
import.meta.env.VITE_API_URL import {
import.meta.env.VITE_API_URL   Bot,
import.meta.env.VITE_API_URL   Send,
import.meta.env.VITE_API_URL   X,
import.meta.env.VITE_API_URL   Minimize2,
import.meta.env.VITE_API_URL   Maximize2,
import.meta.env.VITE_API_URL   Sparkles,
import.meta.env.VITE_API_URL   Loader2,
import.meta.env.VITE_API_URL   Lightbulb,
import.meta.env.VITE_API_URL   History
import.meta.env.VITE_API_URL } from 'lucide-react';
import.meta.env.VITE_API_URL import { motion, AnimatePresence } from 'motion/react';
import.meta.env.VITE_API_URL import { cn } from '../../lib/utils';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.tratatudo.pt';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface Message {
import.meta.env.VITE_API_URL   id: string;
import.meta.env.VITE_API_URL   role: 'user' | 'assistant';
import.meta.env.VITE_API_URL   content: string;
import.meta.env.VITE_API_URL   timestamp: Date;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function HubAI() {
import.meta.env.VITE_API_URL   const [isOpen, setIsOpen] = useState(false);
import.meta.env.VITE_API_URL   const [isMinimized, setIsMinimized] = useState(false);
import.meta.env.VITE_API_URL   const [input, setInput] = useState('');
import.meta.env.VITE_API_URL   const [messages, setMessages] = useState<Message[]>([
import.meta.env.VITE_API_URL     {
import.meta.env.VITE_API_URL       id: '1',
import.meta.env.VITE_API_URL       role: 'assistant',
import.meta.env.VITE_API_URL       content:
import.meta.env.VITE_API_URL         'Olá! Sou o assistente do TrataTudo Hub. Posso ajudar a resumir tickets, sugerir respostas, apoiar vendas e orientar tarefas no portal.',
import.meta.env.VITE_API_URL       timestamp: new Date()
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   ]);
import.meta.env.VITE_API_URL   const [isLoading, setIsLoading] = useState(false);
import.meta.env.VITE_API_URL   const messagesEndRef = useRef<HTMLDivElement>(null);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const scrollToBottom = () => {
import.meta.env.VITE_API_URL     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   useEffect(() => {
import.meta.env.VITE_API_URL     scrollToBottom();
import.meta.env.VITE_API_URL   }, [messages, isLoading]);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const buildAssistantText = (data: any) => {
import.meta.env.VITE_API_URL     return (
import.meta.env.VITE_API_URL       data?.text ||
import.meta.env.VITE_API_URL       data?.message ||
import.meta.env.VITE_API_URL       data?.reply ||
import.meta.env.VITE_API_URL       data?.response ||
import.meta.env.VITE_API_URL       data?.answer ||
import.meta.env.VITE_API_URL       data?.content ||
import.meta.env.VITE_API_URL       data?.data?.text ||
import.meta.env.VITE_API_URL       data?.data?.message ||
import.meta.env.VITE_API_URL       data?.analysis?.summary ||
import.meta.env.VITE_API_URL       'IA temporariamente indisponível. Tente novamente.'
import.meta.env.VITE_API_URL     );
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleSend = async () => {
import.meta.env.VITE_API_URL     const trimmed = input.trim();
import.meta.env.VITE_API_URL     if (!trimmed || isLoading) return;
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     const historyForRequest = messages.map((m) => ({
import.meta.env.VITE_API_URL       role: m.role,
import.meta.env.VITE_API_URL       content: m.content
import.meta.env.VITE_API_URL     }));
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     const userMessage: Message = {
import.meta.env.VITE_API_URL       id: Date.now().toString(),
import.meta.env.VITE_API_URL       role: 'user',
import.meta.env.VITE_API_URL       content: trimmed,
import.meta.env.VITE_API_URL       timestamp: new Date()
import.meta.env.VITE_API_URL     };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     setMessages((prev) => [...prev, userMessage]);
import.meta.env.VITE_API_URL     setInput('');
import.meta.env.VITE_API_URL     setIsLoading(true);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       const response = await fetch(`${BASE_URL}/api/client/ai/chat`, {
import.meta.env.VITE_API_URL         method: 'POST',
import.meta.env.VITE_API_URL         headers: { 'Content-Type': 'application/json' },
import.meta.env.VITE_API_URL         credentials: 'include',
import.meta.env.VITE_API_URL         body: JSON.stringify({
import.meta.env.VITE_API_URL           message: trimmed,
import.meta.env.VITE_API_URL           history: historyForRequest
import.meta.env.VITE_API_URL         })
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       let data: any = null;
import.meta.env.VITE_API_URL       try {
import.meta.env.VITE_API_URL         data = await response.json();
import.meta.env.VITE_API_URL       } catch {
import.meta.env.VITE_API_URL         data = null;
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       if (!response.ok) {
import.meta.env.VITE_API_URL         throw new Error(
import.meta.env.VITE_API_URL           data?.error ||
import.meta.env.VITE_API_URL             data?.message ||
import.meta.env.VITE_API_URL             'IA temporariamente indisponível. Tente novamente.'
import.meta.env.VITE_API_URL         );
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       const assistantMessage: Message = {
import.meta.env.VITE_API_URL         id: `${Date.now()}-assistant`,
import.meta.env.VITE_API_URL         role: 'assistant',
import.meta.env.VITE_API_URL         content: buildAssistantText(data),
import.meta.env.VITE_API_URL         timestamp: new Date()
import.meta.env.VITE_API_URL       };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       setMessages((prev) => [...prev, assistantMessage]);
import.meta.env.VITE_API_URL     } catch (error: any) {
import.meta.env.VITE_API_URL       setMessages((prev) => [
import.meta.env.VITE_API_URL         ...prev,
import.meta.env.VITE_API_URL         {
import.meta.env.VITE_API_URL           id: `${Date.now()}-error`,
import.meta.env.VITE_API_URL           role: 'assistant',
import.meta.env.VITE_API_URL           content:
import.meta.env.VITE_API_URL             error?.message ||
import.meta.env.VITE_API_URL             'IA temporariamente indisponível. Por favor, tente novamente.',
import.meta.env.VITE_API_URL           timestamp: new Date()
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL       ]);
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setIsLoading(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const quickSuggestions = [
import.meta.env.VITE_API_URL     { icon: History, text: 'Resume os tickets em aberto' },
import.meta.env.VITE_API_URL     { icon: Sparkles, text: 'Sugere uma resposta profissional' },
import.meta.env.VITE_API_URL     { icon: Lightbulb, text: 'Dá-me dicas para fechar uma venda' }
import.meta.env.VITE_API_URL   ];
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <>
import.meta.env.VITE_API_URL       {!isOpen && (
import.meta.env.VITE_API_URL         <motion.button
import.meta.env.VITE_API_URL           initial={{ scale: 0, opacity: 0 }}
import.meta.env.VITE_API_URL           animate={{ scale: 1, opacity: 1 }}
import.meta.env.VITE_API_URL           whileHover={{ scale: 1.08 }}
import.meta.env.VITE_API_URL           whileTap={{ scale: 0.96 }}
import.meta.env.VITE_API_URL           onClick={() => setIsOpen(true)}
import.meta.env.VITE_API_URL           className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center z-50 group"
import.meta.env.VITE_API_URL         >
import.meta.env.VITE_API_URL           <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" />
import.meta.env.VITE_API_URL           <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
import.meta.env.VITE_API_URL         </motion.button>
import.meta.env.VITE_API_URL       )}
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       <AnimatePresence>
import.meta.env.VITE_API_URL         {isOpen && (
import.meta.env.VITE_API_URL           <motion.div
import.meta.env.VITE_API_URL             initial={{ opacity: 0, y: 20, scale: 0.95 }}
import.meta.env.VITE_API_URL             animate={{
import.meta.env.VITE_API_URL               opacity: 1,
import.meta.env.VITE_API_URL               y: 0,
import.meta.env.VITE_API_URL               scale: 1,
import.meta.env.VITE_API_URL               height: isMinimized ? '64px' : '600px',
import.meta.env.VITE_API_URL               width: '400px'
import.meta.env.VITE_API_URL             }}
import.meta.env.VITE_API_URL             exit={{ opacity: 0, y: 20, scale: 0.95 }}
import.meta.env.VITE_API_URL             className={cn(
import.meta.env.VITE_API_URL               'fixed bottom-6 right-6 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col transition-all duration-300 max-w-[calc(100vw-24px)]',
import.meta.env.VITE_API_URL               isMinimized && 'rounded-2xl'
import.meta.env.VITE_API_URL             )}
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
import.meta.env.VITE_API_URL               <div className="flex items-center gap-3">
import.meta.env.VITE_API_URL                 <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
import.meta.env.VITE_API_URL                   <Bot className="w-5 h-5 text-white" />
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div>
import.meta.env.VITE_API_URL                   <h3 className="font-bold text-sm">Assistente Hub</h3>
import.meta.env.VITE_API_URL                   <div className="flex items-center gap-1.5">
import.meta.env.VITE_API_URL                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
import.meta.env.VITE_API_URL                     <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
import.meta.env.VITE_API_URL                       IA online
import.meta.env.VITE_API_URL                     </span>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               <div className="flex items-center gap-1">
import.meta.env.VITE_API_URL                 <button
import.meta.env.VITE_API_URL                   onClick={() => setIsMinimized(!isMinimized)}
import.meta.env.VITE_API_URL                   className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   {isMinimized ? (
import.meta.env.VITE_API_URL                     <Maximize2 className="w-4 h-4" />
import.meta.env.VITE_API_URL                   ) : (
import.meta.env.VITE_API_URL                     <Minimize2 className="w-4 h-4" />
import.meta.env.VITE_API_URL                   )}
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL                 <button
import.meta.env.VITE_API_URL                   onClick={() => setIsOpen(false)}
import.meta.env.VITE_API_URL                   className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   <X className="w-4 h-4" />
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL             {!isMinimized && (
import.meta.env.VITE_API_URL               <>
import.meta.env.VITE_API_URL                 <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
import.meta.env.VITE_API_URL                   {messages.map((msg) => (
import.meta.env.VITE_API_URL                     <div
import.meta.env.VITE_API_URL                       key={msg.id}
import.meta.env.VITE_API_URL                       className={cn(
import.meta.env.VITE_API_URL                         'flex flex-col max-w-[85%]',
import.meta.env.VITE_API_URL                         msg.role === 'user' ? 'ml-auto items-end' : 'items-start'
import.meta.env.VITE_API_URL                       )}
import.meta.env.VITE_API_URL                     >
import.meta.env.VITE_API_URL                       <div
import.meta.env.VITE_API_URL                         className={cn(
import.meta.env.VITE_API_URL                           'p-3 rounded-2xl text-sm shadow-sm whitespace-pre-wrap',
import.meta.env.VITE_API_URL                           msg.role === 'user'
import.meta.env.VITE_API_URL                             ? 'bg-primary text-white rounded-tr-none'
import.meta.env.VITE_API_URL                             : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
import.meta.env.VITE_API_URL                         )}
import.meta.env.VITE_API_URL                       >
import.meta.env.VITE_API_URL                         {msg.content}
import.meta.env.VITE_API_URL                       </div>
import.meta.env.VITE_API_URL                       <span className="text-[10px] text-slate-400 mt-1 px-1">
import.meta.env.VITE_API_URL                         {msg.timestamp.toLocaleTimeString([], {
import.meta.env.VITE_API_URL                           hour: '2-digit',
import.meta.env.VITE_API_URL                           minute: '2-digit'
import.meta.env.VITE_API_URL                         })}
import.meta.env.VITE_API_URL                       </span>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                   ))}
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                   {isLoading && (
import.meta.env.VITE_API_URL                     <div className="flex items-start gap-2 max-w-[85%]">
import.meta.env.VITE_API_URL                       <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
import.meta.env.VITE_API_URL                         <Loader2 className="w-4 h-4 animate-spin text-primary" />
import.meta.env.VITE_API_URL                         <span className="text-xs text-slate-500">A pensar...</span>
import.meta.env.VITE_API_URL                       </div>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                   )}
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                   <div ref={messagesEndRef} />
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                 <div className="px-4 py-2 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
import.meta.env.VITE_API_URL                   {quickSuggestions.map((sug, i) => (
import.meta.env.VITE_API_URL                     <button
import.meta.env.VITE_API_URL                       key={i}
import.meta.env.VITE_API_URL                       onClick={() => setInput(sug.text)}
import.meta.env.VITE_API_URL                       className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 whitespace-nowrap transition-all"
import.meta.env.VITE_API_URL                     >
import.meta.env.VITE_API_URL                       <sug.icon className="w-3 h-3" />
import.meta.env.VITE_API_URL                       {sug.text}
import.meta.env.VITE_API_URL                     </button>
import.meta.env.VITE_API_URL                   ))}
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                 <div className="p-4 bg-white border-t border-slate-100 shrink-0">
import.meta.env.VITE_API_URL                   <div className="relative">
import.meta.env.VITE_API_URL                     <input
import.meta.env.VITE_API_URL                       type="text"
import.meta.env.VITE_API_URL                       value={input}
import.meta.env.VITE_API_URL                       onChange={(e) => setInput(e.target.value)}
import.meta.env.VITE_API_URL                       onKeyDown={(e) => {
import.meta.env.VITE_API_URL                         if (e.key === 'Enter' && !e.shiftKey) {
import.meta.env.VITE_API_URL                           e.preventDefault();
import.meta.env.VITE_API_URL                           handleSend();
import.meta.env.VITE_API_URL                         }
import.meta.env.VITE_API_URL                       }}
import.meta.env.VITE_API_URL                       placeholder="Escreva a sua mensagem..."
import.meta.env.VITE_API_URL                       className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
import.meta.env.VITE_API_URL                     />
import.meta.env.VITE_API_URL                     <button
import.meta.env.VITE_API_URL                       onClick={handleSend}
import.meta.env.VITE_API_URL                       disabled={!input.trim() || isLoading}
import.meta.env.VITE_API_URL                       className={cn(
import.meta.env.VITE_API_URL                         'absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl transition-all',
import.meta.env.VITE_API_URL                         input.trim() && !isLoading
import.meta.env.VITE_API_URL                           ? 'bg-primary text-white shadow-lg shadow-primary/20'
import.meta.env.VITE_API_URL                           : 'text-slate-400'
import.meta.env.VITE_API_URL                       )}
import.meta.env.VITE_API_URL                     >
import.meta.env.VITE_API_URL                       <Send className="w-4 h-4" />
import.meta.env.VITE_API_URL                     </button>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <p className="text-[10px] text-center text-slate-400 mt-3">
import.meta.env.VITE_API_URL                     O assistente pode cometer erros. Confirme informação importante.
import.meta.env.VITE_API_URL                   </p>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </>
import.meta.env.VITE_API_URL             )}
import.meta.env.VITE_API_URL           </motion.div>
import.meta.env.VITE_API_URL         )}
import.meta.env.VITE_API_URL       </AnimatePresence>
import.meta.env.VITE_API_URL     </>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }