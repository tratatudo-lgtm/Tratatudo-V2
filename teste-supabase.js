import { createClient } from '@supabase/supabase-js';

const url = "https://lghsbjgjrogkadczikou.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnaHNiamdqcm9na2FkY3ppa291Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI4NjY0MiwiZXhwIjoyMDg3ODYyNjQyfQ.lQ-zhvDHpY0P7r6bL127fmpRY7uUZlZ3un-rPKiWIh4";

const supabase = createClient(url, key);

async function testar() {
  console.log("A consultar a tabela 'clients' para o número 351937230116...");
  
  // 1. Teste de busca exata
  const { data: exato, error: err1 } = await supabase
    .from('clients')
    .select('*')
    .eq('phone_e164', '351937230116');
    
  console.log("\n[Resultado Busca Exata]:", exato);
  if (err1) console.error("Erro 1:", err1);

  // 2. Teste de listagem geral para ver o que existe
  const { data: todos, error: err2 } = await supabase
    .from('clients')
    .select('id, phone_e164, status, company_name');

  console.log("\n[Todos os Clientes na Tabela]:", todos);
  if (err2) console.error("Erro 2:", err2);
}

testar();
