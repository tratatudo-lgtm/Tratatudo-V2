import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

export const TestAPI = () => {
  const [result, setResult] = useState('A testar...');

  useEffect(() => {
    apiFetch('/api/health')
      .then(res => res.json())
      .then(data => setResult(`✅ Sucesso! ${JSON.stringify(data)}`))
      .catch(err => setResult(`❌ Erro: ${err.message}`));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Teste de API</h2>
      <p>Resultado: {result}</p>
    </div>
  );
};