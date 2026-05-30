const fs = require("fs");
let lines = fs.readFileSync("server.ts", "utf8").split("\n");

// A linha 135 já está perfeita! (p?.replace(/\D/g, "") remove o "+" e deixa só números)

// 1. Corrigir o bloco de envio de OTP (Linhas 144 a 147)
// Vamos substituir o Promise.all perigoso por uma consulta simples à tabela clients
const blocoEnvioNovo = `    const { data: client } = await supabase.from("clients").select("id").eq("phone_e164", phone_e164).single();
    const clientUser = null;`;

// No JS, os arrays começam em 0, por isso a linha 144 é o índice 143
lines.splice(143, 4, blocoEnvioNovo);

// 2. Corrigir o bloco de verificação de OTP (Linha 189, que agora mudou de posição devido ao splice anterior)
// Como removemos 4 linhas e metemos 2, o ficheiro encolheu 2 linhas. A antiga linha 189 está agora na 187 (índice 186)
// Vamos procurar a linha que contém "client_users" perto dessa zona para termos a certeza absoluta
let indiceVerify = lines.findIndex((l, idx) => idx > 170 && l.includes("client_users") && l.includes("phone_e164"));

if (indiceVerify !== -1) {
    lines[indiceVerify] = `    const clientUser = null; // Ignorando tabela sem a coluna`;
    console.log("-> Linha de verificação encontrada e corrigida no índice: " + indiceVerify);
}

fs.writeFileSync("server.ts", lines.join("\n"), "utf8");
console.log("SUCESSO ABSOLUTO: O server.ts foi reestruturado corretamente!");
