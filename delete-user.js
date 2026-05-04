const SUPABASE_URL = 'https://iirrdgohvwnkpflnxvny.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcnJkZ29odndua3BmbG54dm55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NTU0ODcsImV4cCI6MjA5MzIzMTQ4N30.ozuzley4uHObAajdjc3qLDRtJ8nQXE-xPlw-TiCycho';

// Create a test user directly via API
async function createTestUser() {
  const testEmail = 'testecidadao@ac.gov.br';
  const testPassword = 'Teste123456!';

  console.log('=== Criando usuário de teste (cidadao) ===');

  // 1. Criar no Auth (sem confirmação de email para teste)
  const signUpRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'apikey': SUPABASE_KEY
    },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        nome: 'Cidadão Teste',
        tipo: 'cidadao'
      }
    })
  });

  const signUpData = await signUpRes.json();
  console.log('Auth response:', signUpData);

  if (signUpData.id) {
    // 2. Inserir na tabela usuarios com perfil cidadao
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        auth_uid: signUpData.id,
        nome: 'Cidadão Teste',
        email: testEmail,
        perfil: 'cidadao',
        ativo: true,
        espaco_id: null
      })
    });

    console.log('Insert into usuarios:', insertRes.ok);

    console.log('\n✅ === CREDENCIAIS DE TESTE ===');
    console.log('Email:', testEmail);
    console.log('Senha:', testPassword);
    console.log('Perfil: cidadao');
    console.log('==============================\n');
  } else {
    console.log('Erro ao criar usuário no auth:', signUpData);
  }
}

// Check users in the system
async function listUsers() {
  console.log('\n=== Buscando TODOS os usuários da tabela usuarios ===');
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/usuarios?select=*&limit=50`,
    {
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY
      }
    }
  );
  const users = await res.json();
  console.log('Total de usuários:', users.length);
  console.log('Usuários encontrados:');
  users.forEach(u => console.log(`  - ${u.email || 'N/A'} | perfil: ${u.perfil || 'N/A'} | id: ${u.id} | auth_uid: ${u.auth_uid || 'N/A'}`));
}

async function main() {
  const cmd = process.argv[2];
  if (cmd === 'list') {
    await listUsers();
  } else if (cmd === 'create') {
    await createTestUser();
  } else {
    console.log('Usage: node delete-user.js [list|create]');
  }
}

main().catch(console.error);