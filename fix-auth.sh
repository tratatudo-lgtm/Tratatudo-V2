#!/bin/bash
# Script para corrigir o server.ts e recompilar

cd /home/ubuntu/tratatudo/tratatudo-v2/Tratatudo-V2

# Backup
cp server.ts server.ts.bak2

# Criar versão corrigida
cat server.ts | python3 -c "
import sys, re

content = sys.stdin.read()

# Função auxiliar para procurar em ambas as tabelas
old_query = '''supabase.from(\"clients\").select(\"id\").eq(\"phone_e164\", phone_e164).single()'''
new_query = '''supabase.from(\"clients\").select(\"id\").or(\"phone_e164.eq.\" + phone_e164 + \",phone_e164.eq.+\" + phone_e164).single()'''

content = content.replace(old_query, new_query)

old_query2 = '''supabase.from(\"client_users\").select(\"id\").eq(\"phone_e164\", phone_e164).single()'''
new_query2 = '''supabase.from(\"client_users\").select(\"id\").or(\"phone_e164.eq.\" + phone_e164 + \",phone_e164.eq.+\" + phone_e164).single()'''

content = content.replace(old_query2, new_query2)

# Também corrigir as queries no verify-otp
old_verify1 = '''supabase.from(\"client_users\").select(\"*\").eq(\"phone_e164\", phone_e164).single()'''
new_verify1 = '''supabase.from(\"client_users\").select(\"*\").or(\"phone_e164.eq.\" + phone_e164 + \",phone_e164.eq.+\" + phone_e164).single()'''

content = content.replace(old_verify1, new_verify1)

old_verify2 = '''supabase.from(\"clients\").select(\"*\").eq(\"phone_e164\", phone_e164).single()'''
new_verify2 = '''supabase.from(\"clients\").select(\"*\").or(\"phone_e164.eq.\" + phone_e164 + \",phone_e164.eq.+\" + phone_e164).single()'''

content = content.replace(old_verify2, new_verify2)

with open('server.ts', 'w') as f:
    f.write(content)

print('✅ server.ts corrigido')
"

# Recompilar
npm run build 2>&1 | tail -5

