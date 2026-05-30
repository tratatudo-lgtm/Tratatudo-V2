const fs = require("fs");

// 1. Restaurar o backup original para garantir que temos o Promise.all e as linhas no sítio certo
try {
    fs.copyFileSync("server.ts.bak", "server.ts");
    console.log("-> Backup restaurado com sucesso para garantir integridade.");
} catch (e) {
    console.log("Aviso: Não encontrei o server.ts.bak, a continuar com o ficheiro atual.");
}

let code = fs.readFileSync("server.ts", "utf8");

// 2. Substituir a linha da função normalizePhone (linha 135)
// Procura a linha antiga exata e troca pela correta
const linhaFuncaoAntiga = 'const normalizePhone = (p: string) => p?.replace(/\\D/g, "") || "";';
const linhaFuncaoNova = 'const normalizePhone = (p: string) => p ? p.replace(/[^0-9]/g, "") : "";';

if (code.includes("const normalizePhone")) {
    // Vamos usar uma substituição mais genérica baseada no replace(/\D/g)
    code = code.replace(/const\s+normalizePhone\s*=\s*\(\s*p:\s*string\s*\)\s*=>[\s\S]*?;\s*/, "const normalizePhone = (p: string) => p ? p.replace(/[^0-9]/g, \"\") : \"\";\n");
    console.log("-> Função normalizePhone atualizada.");
}

// 3. Substituição cirúrgica do Promise.all usando referências de texto fixas
// Vamos localizar o comentário que está logo acima do Promise.all
const comentarioAlvo = "// Validate if user exists (client OR client_user)";
const pontoInicio = code.indexOf(comentarioAlvo);

if (pontoInicio !== -1) {
    // Encontramos onde fecha o Promise.all (]);) logo a seguir ao comentário
    const pontoFim = code.indexOf("]);", pontoInicio);
    
    if (pontoFim !== -1) {
        // Capturamos todo o bloco desde o Promise.all até ao seu fecho
        const blocoAntigo = code.substring(code.indexOf("const", pontoInicio), pontoFim + 3);
        
        const blocoNovo = `const { data: client } = await supabase.from("clients").select("id").eq("phone_e164", phone_e164).single();\n    const clientUser = null;`;
        
        code = code.replace(blocoAntigo, blocoNovo);
        console.log("-> Bloco Promise.all do send-otp substituído com sucesso.");
    }
}

// 4. Substituição do verify-otp (onde ele tenta ler a tabela client_users)
const queryVerifyAntiga = `const { data: clientUser } = await supabase.from("client_users").select("*").or("phone_e164.eq." + phone_e164 + ",phone_e164.eq.+" + phone_e164).single();`;

if (code.includes('from("client_users")')) {
    // Procura o select que apanha a tabela client_users e anula-o
    code = code.replace(/const\s+\{\s*data:\s*clientUser\s*\}\s*=\s*await\s+supabase\.from\(\s*["']client_users["']\s*\)[\s\S]*?\.single\(\);/, "const clientUser = null;");
    console.log("-> Consulta à tabela client_users no verify-otp anulada com sucesso.");
}

fs.writeFileSync("server.ts", code, "utf8");
console.log("FIM: Ficheiro server.ts atualizado e gravado!");
