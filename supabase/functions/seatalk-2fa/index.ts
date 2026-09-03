// ============================================================================
// SeaTalk 2FA — aprovação de login com botões (Aprovar / Não fui eu) no bot.
// ----------------------------------------------------------------------------
//   POST ?cb=1        -> Event Callback: verificação, clique de botão e
//                        auto-captura do employee_code por e-mail.
//   POST (auth)       -> "request": cria pedido e envia a mensagem com botões.
//   GET/POST ?token=  -> status / confirma aprovação (fallback via /aprovar).
// ============================================================================
import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const APP_ID = Deno.env.get('SEATALK_APP_ID') ?? ''
const APP_SECRET = Deno.env.get('SEATALK_APP_SECRET') ?? ''

const PORTAL = 'https://jornada-reversa.vercel.app'
const SEATALK_TOKEN_URL = 'https://openapi.seatalk.io/auth/app_access_token'
const SEATALK_SEND_URL = 'https://openapi.seatalk.io/messaging/v2/single_chat'
const APPROVAL_TTL_MIN = 2
const TRUST_WINDOW_HOURS = 12

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}

async function getCreds(): Promise<{ id: string; secret: string }> {
  const { data } = await admin.from('integrations').select('key, value').in('key', ['seatalk_app_id', 'seatalk_app_secret'])
  const map = Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]))
  return { id: (map['seatalk_app_id'] ?? APP_ID ?? '').trim(), secret: (map['seatalk_app_secret'] ?? APP_SECRET ?? '').trim() }
}

async function getSeaTalkToken(): Promise<string> {
  const { id, secret } = await getCreds()
  const r = await fetch(SEATALK_TOKEN_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ app_id: id, app_secret: secret }) })
  const raw = await r.text()
  let j: Record<string, unknown>
  try { j = JSON.parse(raw) } catch { throw new Error(`token nao-JSON (HTTP ${r.status}): ${raw.slice(0, 300)}`) }
  if (!j.app_access_token) throw new Error('token sem app_access_token: ' + JSON.stringify(j))
  return j.app_access_token as string
}

async function post(u: string, token: string, body: unknown) {
  const r = await fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) })
  const raw = await r.text()
  let j: Record<string, unknown> = {}
  try { j = JSON.parse(raw) } catch { /* */ }
  return { status: r.status, j, raw }
}

// Envia a mensagem interativa com botões; se o formato falhar, cai para texto+link.
async function sendSeaTalk(employeeCode: string, tk: string, approveUrl: string): Promise<void> {
  const token = await getSeaTalkToken()
  const emp = employeeCode.trim()

  const interactive = {
    tag: 'interactive_message',
    interactive_message: {
      elements: [
        { element_type: 'title', title: { text: '🔐 Jornada Reversa — verificação de acesso' } },
        { element_type: 'description', description: { text: 'Clique em Aprovar para autorizar seu acesso ao portal Jornada Reversa. Se esta solicitação não foi iniciada por você, rejeite.\n\nObservação: este 2FA funciona no app SeaTalk (mobile/web).' } },
        { element_type: 'button', button: { button_type: 'callback', text: '✅ Aprovar', value: 'approve:' + tk } },
        { element_type: 'button', button: { button_type: 'callback', text: '❌ Não fui eu', value: 'reject:' + tk } },
      ],
    },
  }
  const textFallback = {
    tag: 'text',
    text: { content: `🔐 Jornada Reversa — verificação de acesso\nAlguém está entrando com a sua conta agora.\nSe foi você, aprove em até ${APPROVAL_TTL_MIN} minutos:\n${approveUrl}\n\nSe NÃO foi você, ignore e troque sua senha.` },
  }

  // 1) tenta interativo
  let res = await post(SEATALK_SEND_URL, token, { employee_code: emp, message: interactive })
  console.log('SeaTalk send [interactive] status', res.status, 'body:', res.raw)
  if (res.j.code === 0 || res.j.code === undefined) return

  // 2) fallback: texto + link
  res = await post(SEATALK_SEND_URL, token, { employee_code: emp, message: textFallback })
  console.log('SeaTalk send [text-fallback] status', res.status, 'body:', res.raw)
  if (res.j.code === 0 || res.j.code === undefined) return

  throw new Error('SeaTalk send falhou: ' + JSON.stringify(res.j))
}

function randomToken(): string {
  return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
}

// Descobre o employee_code a partir do e-mail (API "Get Employee Code with Email",
// que é "No Limit" — não depende de Service Scope, funciona para qualquer
// funcionário da organização sem precisar de "oi" no bot).
//   POST /contacts/v2/get_employee_code_with_email  body { emails: [...] }
//   resp { code, employees: [{ code, email, employee_code, employee_status }] }
//   employee_status: 1 pendente | 2 ativo | 3 saindo | 4 desligado
const SEATALK_EMP_CODE_URL = 'https://openapi.seatalk.io/contacts/v2/get_employee_code_with_email'
async function lookupEmployeeCode(token: string, email: string): Promise<{ code: string | null; diag: unknown[] }> {
  const e = email.trim().toLowerCase()
  const res = await post(SEATALK_EMP_CODE_URL, token, { emails: [e] })
  console.log('LOOKUP', res.status, res.raw)
  const j = res.j as Record<string, any>
  const emps: any[] = Array.isArray(j?.employees) ? j.employees : []
  const matches = emps.filter((x) => (x?.email ?? '').toLowerCase() === e && x?.employee_code)
  // prefere o vínculo ativo (status 2); senão o primeiro com código válido
  const chosen = matches.find((x) => x?.employee_status === 2) ?? matches[0] ?? null
  const code = chosen?.employee_code ?? null
  return { code: code ? String(code) : null, diag: [{ status: res.status, resp: res.raw.slice(0, 500) }] }
}

// Substitui a mensagem interativa (após clicar num botão) por um aviso final.
// Tenta os endpoints candidatos da API "Update Message" e loga o resultado.
async function updateMessage(token: string, messageId: string, message: unknown) {
  const candidates = [
    'https://openapi.seatalk.io/messaging/v2/single_chat/update',
    'https://openapi.seatalk.io/messaging/v2/update',
    'https://openapi.seatalk.io/messaging/v2/interactive_message/update',
    'https://openapi.seatalk.io/messaging/v2/message/update',
  ]
  for (const u of candidates) {
    const res = await post(u, token, { message_id: messageId, message })
    console.log('UPDATE try', u, res.status, res.raw)
    if (res.status !== 404 && (res.j.code === 0 || res.j.code === undefined)) return true
  }
  return false
}

function noticeMsg(title: string, text: string) {
  return {
    tag: 'interactive_message',
    interactive_message: {
      elements: [
        { element_type: 'title', title: { text: title } },
        { element_type: 'description', description: { text } },
      ],
    },
  }
}

async function approveLogin(tk: string) {
  const { data: appr } = await admin.from('login_approvals').select('*').eq('token', tk).maybeSingle()
  if (!appr || appr.status !== 'pending') return
  if (new Date(appr.expires_at).getTime() < Date.now()) {
    await admin.from('login_approvals').update({ status: 'expired' }).eq('id', appr.id)
    return
  }
  const until = new Date(Date.now() + TRUST_WINDOW_HOURS * 3600 * 1000).toISOString()
  await admin.from('login_approvals').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', appr.id)
  await admin.from('profiles').update({ two_factor_ok_until: until }).eq('id', appr.user_id)
}

async function rejectLogin(tk: string) {
  const { data: appr } = await admin.from('login_approvals').select('*').eq('token', tk).maybeSingle()
  if (!appr || appr.status !== 'pending') return
  await admin.from('login_approvals').update({ status: 'rejected' }).eq('id', appr.id)
  const { data: p } = await admin.from('profiles').select('name, email, opsid').eq('id', appr.user_id).maybeSingle()
  const label = p?.name || p?.opsid || p?.email || 'conta'
  await admin.from('security_events').insert({ user_id: appr.user_id, kind: 'login_rejected', label, detail: 'Login recusado pelo usuário no 2FA (possível tentativa de invasão)' })
  // Alerta em tempo real: avisa os administradores no SeaTalk.
  try {
    const { data: admins } = await admin.from('profiles').select('seatalk_code').eq('role', 'admin').not('seatalk_code', 'is', null)
    if (admins && admins.length) {
      const t = await getSeaTalkToken()
      const alert = { tag: 'text', text: { content: `🚨 Jornada Reversa — alerta de segurança\nUm acesso foi RECUSADO no 2FA (possível tentativa de invasão).\nConta: ${label}\nConfira em Admin → Acessos.` } }
      for (const a of admins) { if (a.seatalk_code) await post(SEATALK_SEND_URL, t, { employee_code: a.seatalk_code, message: alert }) }
    }
  } catch (e) { console.error('alerta admin erro:', String(e)) }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  const url = new URL(req.url)
  const token = url.searchParams.get('token')

  // ---------- Redefinição de senha via SeaTalk ----------
  // ?reset=request  { identifier }  -> envia link no SeaTalk
  if (url.searchParams.get('reset') === 'request' && req.method === 'POST') {
    let identifier = ''
    try { identifier = (await req.json())?.identifier ?? '' } catch { /* */ }
    const id = identifier.trim().toLowerCase()
    const email = id.includes('@') ? id : `${id}@opsid.reversa`
    if (email && email !== '@opsid.reversa') {
      const { data: prof } = await admin.from('profiles').select('id, seatalk_code').ilike('email', email).maybeSingle()
      if (prof?.id && prof.seatalk_code) {
        const tk = randomToken()
        await admin.from('password_resets').insert({ user_id: prof.id, token: tk, expires_at: new Date(Date.now() + 15 * 60000).toISOString() })
        const link = `${PORTAL}/redefinir?token=${tk}`
        try {
          const t = await getSeaTalkToken()
          await post(SEATALK_SEND_URL, t, { employee_code: prof.seatalk_code, message: { tag: 'text', text: { content: `🔑 Jornada Reversa — redefinição de senha\nVocê pediu para redefinir sua senha. Toque no link abaixo (válido 15 min):\n${link}\n\nSe NÃO foi você, ignore esta mensagem.` } } })
        } catch (e) { console.error('reset envio erro:', String(e)) }
      }
    }
    return json({ ok: true }) // resposta neutra (não revela se a conta existe)
  }

  // ?reset=confirm  { token, password }  -> troca a senha
  if (url.searchParams.get('reset') === 'confirm' && req.method === 'POST') {
    let rtoken = ''
    let password = ''
    try { const b = await req.json(); rtoken = b?.token ?? ''; password = b?.password ?? '' } catch { /* */ }
    if (!password || password.length < 6) return json({ status: 'weak' })
    const { data: pr } = await admin.from('password_resets').select('*').eq('token', rtoken).maybeSingle()
    if (!pr || pr.status !== 'pending') return json({ status: 'invalid' })
    if (new Date(pr.expires_at).getTime() < Date.now()) {
      await admin.from('password_resets').update({ status: 'expired' }).eq('id', pr.id)
      return json({ status: 'expired' })
    }
    const { error } = await admin.auth.admin.updateUserById(pr.user_id, { password })
    if (error) return json({ status: 'error', detail: error.message })
    await admin.from('password_resets').update({ status: 'used', used_at: new Date().toISOString() }).eq('id', pr.id)
    return json({ status: 'done' })
  }

  // ---------- Login SEM SENHA (magic) via aprovação no SeaTalk ----------
  // Regra: se o bot CONSEGUE alcançar a pessoa no SeaTalk (está no subteam/
  // Service Scope), o login é sem senha. Se não conseguir, responde { fallback:
  // true } e o portal mostra o campo de senha. O token de sessão (OTP do magic
  // link) é gerado no pedido, mas só entregue ao navegador DEPOIS da aprovação.
  //   POST ?magic=request { email }      -> { token } (sem senha) ou { fallback }
  //   GET  ?magic=poll&token=...         -> status; devolve o OTP só se aprovado
  if (url.searchParams.get('magic') === 'request' && req.method === 'POST') {
    let email = ''
    try { email = ((await req.json())?.email ?? '').trim().toLowerCase() } catch { /* */ }
    if (!email || !email.includes('@')) return json({ fallback: 'admin' })
    const { data: prof } = await admin.from('profiles').select('id, seatalk_code').ilike('email', email).maybeSingle()
    // Sem conta cadastrada → manda para o cadastro
    if (!prof?.id) return json({ fallback: 'signup' })
    const t = await getSeaTalkToken()
    let empCode = prof.seatalk_code as string | null
    if (!empCode) { const r = await lookupEmployeeCode(t, email); if (r.code) { empCode = r.code; await admin.from('profiles').update({ seatalk_code: r.code }).eq('id', prof.id) } }
    // Tem conta, mas o bot não alcança → precisa de liberação do admin
    if (!empCode) return json({ fallback: 'admin' })
    // Rate-limit anti-spam: no máximo 3 pedidos por conta a cada 2 minutos
    // (evita disparar aprovações repetidas no SeaTalk de um colega).
    const since = new Date(Date.now() - 2 * 60 * 1000).toISOString()
    const { count: recent } = await admin.from('login_approvals')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', prof.id).eq('kind', 'magic').gte('created_at', since)
    if ((recent ?? 0) >= 3) return json({ rate_limited: true })
    const { data: link, error: linkErr } = await admin.auth.admin.generateLink({ type: 'magiclink', email })
    const props = (link as Record<string, any>)?.properties ?? {}
    const otp = props?.email_otp ?? ''
    const hash = props?.hashed_token ?? ''
    if (linkErr || !otp) return json({ fallback: 'admin' })
    const tk = randomToken()
    const expiresAt = new Date(Date.now() + APPROVAL_TTL_MIN * 60 * 1000).toISOString()
    const { data: ins, error: insErr } = await admin.from('login_approvals')
      .insert({ user_id: prof.id, token: tk, expires_at: expiresAt, kind: 'magic', magic_otp: otp, magic_hash: hash })
      .select('id').single()
    if (insErr) return json({ fallback: 'admin' })
    try {
      await sendSeaTalk(empCode, tk, `${PORTAL}/aprovar?token=${tk}`)
    } catch (e) {
      // Não alcançou no SeaTalk (fora do subteam) → precisa de liberação do admin
      console.error('magic envio erro:', String(e))
      if (ins?.id) await admin.from('login_approvals').delete().eq('id', ins.id)
      return json({ fallback: 'admin' })
    }
    // Está no subteam (o bot alcançou) → acesso liberado automaticamente,
    // sem depender de aprovação do admin (a autorização é o próprio subteam).
    await admin.from('profiles').update({ status: 'approved' }).eq('id', prof.id).neq('status', 'approved')
    return json({ ok: true, token: tk, expires_at: expiresAt })
  }

  if (url.searchParams.get('magic') === 'poll' && req.method === 'GET') {
    const tk = url.searchParams.get('token') ?? ''
    const { data: appr } = await admin.from('login_approvals').select('*').eq('token', tk).eq('kind', 'magic').maybeSingle()
    if (!appr) return json({ status: 'invalid' })
    if (appr.status === 'rejected') return json({ status: 'rejected' })
    if (new Date(appr.expires_at).getTime() < Date.now()) return json({ status: 'expired' })
    if (appr.status !== 'approved') return json({ status: 'pending' })
    // aprovado → entrega o OTP uma única vez e o invalida na tabela
    await admin.from('login_approvals').update({ magic_otp: null }).eq('id', appr.id)
    return json({ status: 'approved', otp: appr.magic_otp, token_hash: appr.magic_hash })
  }

  // ---------- Auto-aprovação no cadastro (quem está no subteam) ----------
  // Chamado após o cadastro. Se o bot alcança a pessoa (está no subteam),
  // libera o acesso na hora com uma mensagem de boas-vindas. Se não alcança
  // (ou é OpsID sem e-mail real), fica PENDENTE para o admin decidir.
  //   POST ?enroll=1 { email }  -> { approved: true | false }
  if (url.searchParams.get('enroll') === '1' && req.method === 'POST') {
    let email = ''
    try { email = ((await req.json())?.email ?? '').trim().toLowerCase() } catch { /* */ }
    if (!email || !email.includes('@') || email.endsWith('@opsid.reversa')) return json({ approved: false })
    const { data: prof } = await admin.from('profiles').select('id, seatalk_code, status').ilike('email', email).maybeSingle()
    if (!prof?.id) return json({ approved: false })
    if (prof.status === 'approved') return json({ approved: true })
    const t = await getSeaTalkToken()
    let empCode = prof.seatalk_code as string | null
    if (!empCode) { const r = await lookupEmployeeCode(t, email); if (r.code) { empCode = r.code; await admin.from('profiles').update({ seatalk_code: r.code }).eq('id', prof.id) } }
    if (!empCode) return json({ approved: false })
    // Testa o alcance no subteam com uma mensagem de boas-vindas.
    const welcome = { tag: 'text', text: { content: `✅ Bem-vindo(a) à Jornada Reversa!\nSeu acesso foi liberado. Entre no portal (${PORTAL}) com o seu e-mail — a aprovação chega aqui no SeaTalk.` } }
    const res = await post(SEATALK_SEND_URL, t, { employee_code: empCode, message: welcome })
    if (res.j.code === 0 || res.j.code === undefined) {
      await admin.from('profiles').update({ status: 'approved' }).eq('id', prof.id).neq('status', 'approved')
      return json({ approved: true })
    }
    return json({ approved: false }) // fora do subteam → pendente para o admin
  }

  // ---------- Event Callback do SeaTalk ----------
  if (url.searchParams.get('cb') === '1' && req.method === 'POST') {
    const rawBody = await req.text()
    console.log('SEATALK CALLBACK raw:', rawBody.slice(0, 1500))
    let body: Record<string, any> = {}
    try { body = JSON.parse(rawBody) } catch { /* */ }

    // 1) handshake de verificação da URL
    const challenge = body?.event?.seatalk_challenge ?? body?.seatalk_challenge
    if (body?.event_type === 'event_verification' || challenge) return json({ seatalk_challenge: challenge })

    const ev = body?.event ?? {}

    // 2) clique de botão (aprovar / recusar)
    const bv: string =
      ev?.value ?? ev?.button_value ?? ev?.button?.value ?? ev?.interactive_message?.value ?? body?.value ?? ''
    if (typeof bv === 'string' && bv.includes(':')) {
      const [action, tk] = bv.split(':')
      try {
        if (action === 'approve') await approveLogin(tk)
        else if (action === 'reject') await rejectLogin(tk)
        console.log('BOTAO 2FA:', action, tk)
        // Atualiza a mensagem com o resultado (estilo "Login Aprovado")
        const messageId = ev?.message_id ?? ev?.interactive_message?.message_id ?? ''
        if (messageId) {
          const t = await getSeaTalkToken()
          const notice = action === 'approve'
            ? noticeMsg('✅ Acesso aprovado', 'Você aprovou o acesso ao portal Jornada Reversa. Pode voltar — o acesso já foi liberado.')
            : noticeMsg('🚫 Acesso recusado', 'Você recusou este acesso. Se não foi você tentando entrar, troque sua senha — a equipe foi avisada.')
          await updateMessage(t, messageId, notice)
        }
      } catch (e) { console.error('botao erro:', String(e)) }
      return json({ ok: true })
    }

    // 3) mensagem de texto do usuário → auto-captura do employee_code por e-mail
    try {
      const empCode: string = ev?.employee_code ?? ev?.sender?.employee_code ?? ev?.seatalk_id ?? ''
      const email: string = (ev?.email ?? ev?.sender?.email ?? '').toLowerCase()
      if (empCode && email) {
        const { data: prof } = await admin.from('profiles').select('id').ilike('email', email).maybeSingle()
        if (prof?.id) {
          await admin.from('profiles').update({ seatalk_code: String(empCode) }).eq('id', prof.id)
          console.log('AUTO-CAPTURE OK:', email, '->', empCode)
        }
      }
    } catch (e) { console.error('callback erro:', String(e)) }
    return json({ ok: true })
  }

  // ---------- Aprovação via página /aprovar (fallback do link) ----------
  if (token && (req.method === 'POST' || req.method === 'GET')) {
    const { data: appr } = await admin.from('login_approvals').select('*').eq('token', token).maybeSingle()
    if (!appr) return json({ status: 'invalid' }, 404)
    if (appr.status === 'approved') return json({ status: 'already' })
    if (appr.status === 'rejected') return json({ status: 'rejected' })
    if (new Date(appr.expires_at).getTime() < Date.now()) {
      await admin.from('login_approvals').update({ status: 'expired' }).eq('id', appr.id)
      return json({ status: 'expired' })
    }
    if (req.method === 'GET') return json({ status: 'pending' })
    await approveLogin(token)
    return json({ status: 'approved' })
  }

  // ---------- Pedido de aprovação (portal autenticado) ----------
  if (req.method === 'POST') {
    const authHeader = req.headers.get('Authorization') ?? ''
    const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } })
    const { data: userData } = await userClient.auth.getUser()
    const user = userData?.user
    if (!user) return json({ error: 'nao_autenticado' }, 401)
    const { data: prof } = await admin.from('profiles').select('seatalk_code, two_factor_enabled, email').eq('id', user.id).maybeSingle()
    if (!prof?.two_factor_enabled) return json({ skip: true })
    // Sem código salvo? Descobre pelo e-mail corporativo (sem precisar de "oi" no bot).
    let empCode = prof.seatalk_code as string | null
    if (!empCode && prof.email && !String(prof.email).endsWith('@opsid.reversa')) {
      try {
        const t = await getSeaTalkToken()
        const r = await lookupEmployeeCode(t, String(prof.email))
        if (r.code) {
          empCode = r.code
          await admin.from('profiles').update({ seatalk_code: r.code }).eq('id', user.id)
          console.log('LOOKUP OK no request:', prof.email, '->', r.code)
        }
      } catch (e) { console.error('lookup no request erro:', String(e)) }
    }
    if (!empCode) return json({ error: 'sem_seatalk_code' }, 400)
    const tk = randomToken()
    const expiresAt = new Date(Date.now() + APPROVAL_TTL_MIN * 60 * 1000).toISOString()
    const { error: insErr } = await admin.from('login_approvals').insert({ user_id: user.id, token: tk, expires_at: expiresAt })
    if (insErr) return json({ error: insErr.message }, 500)
    const approveUrl = `${PORTAL}/aprovar?token=${tk}`
    try { await sendSeaTalk(empCode, tk, approveUrl) } catch (e) { console.error('ERRO envio:', String(e)); return json({ error: 'falha_envio_seatalk', detail: String(e) }, 502) }
    return json({ ok: true, expires_at: expiresAt })
  }

  return json({ error: 'rota_invalida' }, 404)
})
