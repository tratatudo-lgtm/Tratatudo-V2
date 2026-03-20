import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

function HubMinimal() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 text-center max-w-md w-full">
        <h1 className="text-2xl font-black text-slate-900 mb-2">Hub minimal OK</h1>
        <p className="text-slate-600">A base da aplicação arrancou com sucesso.</p>
      </div>
    </div>
  );
}

function AdminMinimal() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 text-center max-w-md w-full">
        <h1 className="text-2xl font-black text-slate-900 mb-2">Admin minimal OK</h1>
        <p className="text-slate-600">A base da aplicação arrancou com sucesso.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="/login" element={<HubMinimal />} />
          <Route path="/admin/login" element={<AdminMinimal />} />
          <Route path="/app" element={<HubMinimal />} />
          <Route path="/admin" element={<AdminMinimal />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
