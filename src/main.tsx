import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 1. BOOT START
console.log("BOOT START - Initializing application...");

// 2. Environment Variable Validation
const API_URL = 'https://api.tratatudo.pt/client-api';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("API URL:", API_URL);
console.log("SUPABASE URL:", SUPABASE_URL);

function showFatalError(message: string) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 40px; font-family: sans-serif; color: #dc2626; background: #fef2f2; border: 2px solid #fee2e2; border-radius: 16px; margin: 20px;">
        <h1 style="margin-top: 0;">Fatal Configuration Error</h1>
        <p style="font-size: 18px; font-weight: bold;">${message}</p>
        <p>Please check your .env file or environment variables in the dashboard.</p>
      </div>
    `;
  }
}

if (!API_URL) {
  showFatalError("Missing VITE_API_URL environment variable.");
  throw new Error("Missing VITE_API_URL");
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  showFatalError("Missing Supabase configuration (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY).");
  throw new Error("Missing Supabase config");
}

// 3. Initial Render with Error Handling
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error("Root element not found");

  const root = createRoot(rootElement);
  
  // Render a minimal "Boot OK" or the full app
  // For now, let's render the full app but wrapped in a try/catch
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  console.log("BOOT SUCCESS - React tree mounted.");
} catch (error: any) {
  console.error("BOOT FAILED:", error);
  showFatalError(`React Mount Failed: ${error.message}`);
}
