// Cloudflare Pages Function — inscrição no Clipping Trabalhista
// Rota: POST /api/subscribe
// Recebe { email } e cadastra o assinante no MailerLite via API.
// A chave da API fica na variável de ambiente MAILERLITE_API_KEY (Cloudflare Pages).

const GROUP_ID = '193758837440775949'; // Grupo "Clipping Trabalhista"
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.MAILERLITE_API_KEY) {
    return json({ ok: false, error: 'config' }, 500);
  }

  // Aceita JSON ou form-urlencoded
  let email = '';
  let rawName = '';
  try {
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const body = await request.json();
      email = String(body.email || '').trim().toLowerCase();
      rawName = String(body.name || body.nome || '').trim();
    } else {
      const form = await request.formData();
      email = String(form.get('email') || form.get('fields[email]') || '').trim().toLowerCase();
      rawName = String(form.get('nome') || form.get('name') || '').trim();
    }
  } catch (_) {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  if (!EMAIL_RE.test(email)) {
    return json({ ok: false, error: 'invalid_email' }, 400);
  }

  // Primeiro nome -> campo "name" · restante -> "last_name"
  const fields = {};
  if (rawName) {
    const parts = rawName.replace(/\s+/g, ' ').split(' ').filter(Boolean);
    const first = parts.shift() || '';
    const last = parts.join(' ');
    if (first) fields.name = first.charAt(0).toUpperCase() + first.slice(1);
    if (last) fields.last_name = last;
  }

  const API = 'https://connect.mailerlite.com/api/subscribers';
  const headers = {
    'Authorization': `Bearer ${env.MAILERLITE_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  try {
    // 1) Cria/atualiza o assinante SEM grupo — para depois adicioná-lo
    //    explicitamente e disparar a automação de boas-vindas ("entrou no grupo").
    const up = await fetch(API, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email,
        status: 'active',
        ...(Object.keys(fields).length ? { fields } : {}),
      }),
    });

    if (up.status === 422) return json({ ok: false, error: 'invalid_email' }, 400);
    if (up.status !== 200 && up.status !== 201) return json({ ok: false, error: 'upstream' }, 502);

    const data = await up.json().catch(() => ({}));
    const id = (data && data.data && data.data.id) ? data.data.id : (data && data.id);

    // 2) Adiciona ao grupo explicitamente — dispara o gatilho de boas-vindas
    let grouped = false;
    if (id) {
      const g = await fetch(`${API}/${id}/groups/${GROUP_ID}`, { method: 'POST', headers });
      grouped = (g.status === 200 || g.status === 201);
    }

    // 3) Garantia: se o passo 2 falhar, assegura a inscrição no grupo
    if (!grouped) {
      await fetch(API, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, groups: [GROUP_ID], status: 'active' }),
      });
    }

    return json({ ok: true }, 200);
  } catch (_) {
    return json({ ok: false, error: 'network' }, 502);
  }
}
