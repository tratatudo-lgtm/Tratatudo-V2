import.meta.env.VITE_API_URL import {StrictMode} from 'react';
import.meta.env.VITE_API_URL import {createRoot} from 'react-dom/client';
import.meta.env.VITE_API_URL import App from './App.tsx';
import.meta.env.VITE_API_URL import './index.css';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL // 1. BOOT START
import.meta.env.VITE_API_URL console.log("BOOT START - Initializing application...");
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL // 2. Environment Variable Validation
import.meta.env.VITE_API_URL const API_URL = import.meta.env.VITE_API_URL;
import.meta.env.VITE_API_URL const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
import.meta.env.VITE_API_URL const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL console.log("API URL:", API_URL);
import.meta.env.VITE_API_URL console.log("SUPABASE URL:", SUPABASE_URL);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL function showFatalError(message: string) {
import.meta.env.VITE_API_URL   const root = document.getElementById('root');
import.meta.env.VITE_API_URL   if (root) {
import.meta.env.VITE_API_URL     root.innerHTML = `
import.meta.env.VITE_API_URL       <div style="padding: 40px; font-family: sans-serif; color: #dc2626; background: #fef2f2; border: 2px solid #fee2e2; border-radius: 16px; margin: 20px;">
import.meta.env.VITE_API_URL         <h1 style="margin-top: 0;">Fatal Configuration Error</h1>
import.meta.env.VITE_API_URL         <p style="font-size: 18px; font-weight: bold;">${message}</p>
import.meta.env.VITE_API_URL         <p>Please check your .env file or environment variables in the dashboard.</p>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     `;
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL if (!API_URL) {
import.meta.env.VITE_API_URL   showFatalError("Missing VITE_API_URL environment variable.");
import.meta.env.VITE_API_URL   throw new Error("Missing VITE_API_URL");
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
import.meta.env.VITE_API_URL   showFatalError("Missing Supabase configuration (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY).");
import.meta.env.VITE_API_URL   throw new Error("Missing Supabase config");
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL // 3. Initial Render with Error Handling
import.meta.env.VITE_API_URL try {
import.meta.env.VITE_API_URL   const rootElement = document.getElementById('root');
import.meta.env.VITE_API_URL   if (!rootElement) throw new Error("Root element not found");
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const root = createRoot(rootElement);
import.meta.env.VITE_API_URL   
import.meta.env.VITE_API_URL   // Render a minimal "Boot OK" or the full app
import.meta.env.VITE_API_URL   // For now, let's render the full app but wrapped in a try/catch
import.meta.env.VITE_API_URL   root.render(
import.meta.env.VITE_API_URL     <StrictMode>
import.meta.env.VITE_API_URL       <App />
import.meta.env.VITE_API_URL     </StrictMode>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL   
import.meta.env.VITE_API_URL   console.log("BOOT SUCCESS - React tree mounted.");
import.meta.env.VITE_API_URL } catch (error: any) {
import.meta.env.VITE_API_URL   console.error("BOOT FAILED:", error);
import.meta.env.VITE_API_URL   showFatalError(`React Mount Failed: ${error.message}`);
import.meta.env.VITE_API_URL }
