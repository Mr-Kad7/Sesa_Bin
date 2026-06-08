const base = process.env.BASE_URL || 'http://localhost:3001';

async function run() {
  try {
    const ts = Date.now();
    const email = `e2e${ts}@example.com`;
    const registerRes = await fetch(`${base}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'E2E Test', email, password: 'password123' }),
    });

    const reg = await registerRes.json();
    if (!registerRes.ok) {
      console.error('Register failed', registerRes.status, reg);
      process.exit(2);
    }

    console.log('Register OK:', reg.user?.email || email);

    const loginRes = await fetch(`${base}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123' }),
    });

    const login = await loginRes.json();
    if (!loginRes.ok || !login.token) {
      console.error('Login failed', loginRes.status, login);
      process.exit(3);
    }

    console.log('Login OK, token length:', login.token.length);
    console.log('E2E auth flows passed');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
