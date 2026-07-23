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
  try {
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const body = await request.json();
      email = String(body.email || '').trim().toLowerCase();
    } else {
      const form = await request.formData();
      email = String(form.get('email') || form.get('fields[email]') || '').trim().toLowerCase();
    }
  } catch (_) {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  if (!EMAIL_RE.test(email)) {
    return json({ ok: false, error: 'invalid_email' }, 400);
  }

  try {
    const res = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.MAILERLITE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email,
        groups: [GROUP_ID],
        status: 'active',
      }),
    });

    // 200 = já existia / atualizado · 201 = criado
    if (res.status === 200 || res.status === 201) {
      return json({ ok: true }, 200);
    }
    if (res.status === 422) {
      // e-mail recusado pela validação do MailerLite
      return json({ ok: false, error: 'invalid_email' }, 400);
    }
    return json({ ok: false, error: 'upstream' }, 502);
  } catch (_) {
    return json({ ok: false, error: 'network' }, 502);
  }
}
