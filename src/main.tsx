import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Startup logs and validation
console.log("API URL:", import.meta.env.VITE_API_URL);
console.log("SUPABASE URL:", import.meta.env.VITE_SUPABASE_URL);

if (!import.meta.env.VITE_API_URL) {
  console.error("CRITICAL ERROR: Missing VITE_API_URL environment variable.");
  // We don't throw here to let the ErrorBoundary in App.tsx handle it if possible, 
  // or at least show the logs. But the user asked to throw.
  throw new Error("Missing VITE_API_URL");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
