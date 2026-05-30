const fs = require("fs");
let code = fs.readFileSync("server.ts", "utf8");

// 1. Corrigir a função normalizePhone
const regexNormalize = /function normalizePhone[\s\S]*?return[\s\S]*?\}/;
code = code.replace(regexNormalize, `function normalizePhone(phone: string): string {\n  if (!phone) return "";\n  return phone.replace(/[^0-9]/g, "");\n}`);

// 2. Localizar o início e o fim do Promise.all que junta as duas tabelas
const idxStart = code.indexOf("const [client, clientUser]");
const idxEnd = code.indexOf("]);", idxStart);

if (idxStart !== -1 && idxEnd !== -1) {
    const blocoAntigo = code.substring(idxStart, idxEnd + 3);
    const blocoNovo = `const { data: client } = await supabase.from("clients").select("id").eq("phone_e164", phone_e164).single();\n    const clientUser = null;`;
    code = code.replace(blocoAntigo, blocoNovo);
    console.log("SUCESSO: O ficheiro server.ts foi corrigido!");
} else {
    console.log("ERRO: Não foi possível mapear as linhas do Promise.all.");
}

fs.writeFileSync("server.ts", code, "utf8");
