const { createClient } = require('@supabase/supabase-js');

const url = "https://lghsbjgjrogkadczikou.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnaHNiamdqcm9na2FkY3ppa291Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI4NjY0MiwiZXhwIjoyMDg3ODYyNjQyfQ.lQ-zhvDHpY0P7r6bL127fmpRY7uUZlZ3un-rPKiWIh4";
const supabase = createClient(url, key);

async function test() {
  const { data: clients, error: err1 } = await supabase.from('clients').select('id, phone_e164').limit(5);
  const { data: clientUsers, error: err2 } = await supabase.from('client_users').select('id, phone_e164').limit(5);
  
  console.log("=== TABELA CLIENTS ===");
  console.log(err1 ? "Erro na tabela clients: " + err1.message : clients);
  
  console.log("\n=== TABELA CLIENT_USERS ===");
  console.log(err2 ? "Erro na tabela client_users: " + err2.message : clientUsers);
}
test();
