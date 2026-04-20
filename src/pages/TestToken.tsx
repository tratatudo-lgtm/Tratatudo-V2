import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

export const TestToken = () => {
  const [tokenInfo, setTokenInfo] = useState('A verificar...');
  const [apiResult, setApiResult] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setTokenInfo('❌ Nenhum token encontrado no localStorage.');
      return;
    }
    setTokenInfo(`✅ Token presente (${token.length} caracteres).`);

    // Testar uma rota autenticada (usando o token existente)
    apiFetch('/api/client/dashboard')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => setApiResult(`✅ API respondeu: ${JSON.stringify(data).slice(0, 100)}`))
      .catch(err => setApiResult(`❌ Erro na API: ${err.message}`));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Diagnóstico do Token</h2>
      <p>{tokenInfo}</p>
      <p>{apiResult}</p>
    </div>
  );
};