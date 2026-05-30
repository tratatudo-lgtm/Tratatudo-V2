const { createClient } = require('@supabase/supabase-js');

const url = "https://lghsbjgjrogkadczikou.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnaHNiamdqcm9na2FkY3ppa291Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI4NjY0MiwiZXhwIjoyMDg3ODYyNjQyfQ.lQ-zhvDHpY0P7r6bL127fmpRY7uUZlZ3un-rPKiWIh4";
const supabase = createClient(url, key);

async function test() {
  // Vamos tentar puxar os 5 primeiros registos das tabelas prováveis
  let { data: users } = await supabase.from('users').select('phone, id').limit(5);
  if (!users) {
    let { data: profiles } = await supabase.from('profiles').select('phone, id').limit(5);
    users = profiles;
  }
  if (!users) {
    let { data: restaurants } = await supabase.from('restaurants').select('phone, id').limit(5);
    users = restaurants;
  }
  
  console.log("Exemplo de números na DB:", users);
}
test();
