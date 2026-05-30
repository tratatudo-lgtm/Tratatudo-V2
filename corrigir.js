const fs = require("fs");
let c = fs.readFileSync("server.ts", "utf8");

// Substitui o bloco do send-otp
c = c.replace(/const\s+\[\s*\{\s*data:\s*client\s*\}\s*,\s*\{\s*data:\s*clientUser\s*\}\s*\]\s*=\s*await\s+Promise\.all\([\s\S]*?\)\s*\]\s*\);/, `const { data: client } = await supabase.from("clients").select("id").eq("phone_e164", phone_e164).single();\n    const clientUser = null;`);

// Substitui a linha do verify-otp
c = c.replace(/const\s+\{\s*data:\s*clientUser\s*\}\s*=\s*await\s+supabase\.from\(\s*["']client_users["'][\s\S]*?\.single\(\);/, `const clientUser = null;`);

fs.writeFileSync("server.ts", c, "utf8");
console.log("SERVER.TS MODIFICADO!");
