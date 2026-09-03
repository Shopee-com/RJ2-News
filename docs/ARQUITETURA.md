# Arquitetura SPX Reversa — ponta a ponta

Documentação técnica do portal da Logística Reversa (Shopee).
Do navegador do operador até a linha no banco: tecnologia, camadas de código,
modelo de dados e como as informações se relacionam.

- **URL de produção:** https://jornada-reversa.vercel.app
- **Backend (Supabase):** projeto `pjhzbefheinbjcdywuma` — `https://pjhzbefheinbjcdywuma.supabase.co`

---

## 1. Visão geral

O **SPX Reversa** é um portal corporativo interno (estilo "jornal + central de
conhecimento") da Logística Reversa: procedimentos (POPs), notícias, dashboards,
ferramentas, vagas, time, projetos e um quiz semanal. Tudo protegido por login e
aprovação — **quem não tem acesso não enxerga nada** do conteúdo.

A mesma aplicação tem duas faces:
- **Portal** — o que o operador aprovado vê.
- **Painel admin** — onde o administrador cria/edita/publica conteúdo, controla
  acessos, abas e o quiz.

Três camadas:

| Camada | Tecnologia | Papel |
|---|---|---|
| Cliente | React (SPA) no navegador | Renderiza as telas, fala com o backend por HTTPS |
| Entrega | Vercel (CDN) | Hospeda e distribui os arquivos estáticos; deploy automático |
| Dados | Supabase | Postgres + Auth + Storage; guarda tudo e decide quem vê o quê |

---

## 2. Arquitetura (o caminho da informação)

```
NAVEGADOR (React SPA)                         SUPABASE
  ├─ pages/ + components/  ── carrega ──►  Vercel CDN (só o app)
  ├─ src/data/*.ts  ───────── dados (HTTPS) ─────────►  🔒 RLS
  ├─ src/lib/supabase.ts (1 conexão, token JWT)          ├─ Postgres (19 tabelas + funções)
  └─ auth.tsx (sessão)   ◄──── devolve só o permitido ───┤─ Auth (e-mail+senha / OpsID)
                                                         ├─ Storage (avatars, media)
                                                         └─ Triggers (novo usuário → perfil)
```

- O navegador baixa o app pela **Vercel**, mas os **dados vão e voltam direto do
  Supabase**.
- O Postgres aplica o **RLS** (Row-Level Security) antes de devolver qualquer linha.

---

## 3. Tecnologia

| Camada | Tecnologia | Para que serve |
|---|---|---|
| Linguagem | TypeScript | JavaScript com tipos |
| Interface | React 18 | Telas em componentes |
| Build | Vite 5 | Empacota/otimiza para produção |
| Estilo | Tailwind CSS | Design system por classes; tokens em `tailwind.config.js` |
| Rotas | React Router 6 | URLs e navegação SPA |
| Ícones | lucide-react | Ícones |
| Backend | Supabase (`@supabase/supabase-js`) | Postgres + Auth + Storage |
| Hospedagem | Vercel | Publica e distribui o site |

> **Não há um servidor de backend próprio para manter.** O React fala direto com o
> Supabase; toda a segurança mora no banco (RLS + funções).

---

## 4. Camadas de código (como um dado viaja)

Exemplo: abrir a lista de POPs.

1. **Tela** — `src/pages/Pop.tsx` chama `useAsync(getPops)`.
2. **Camada de dados** — `src/data/content.ts → getPops()` faz
   `supabase.from('pops').select()` e mapeia snake_case → camelCase.
3. **Cliente Supabase** — `src/lib/supabase.ts` envia a requisição com o token da
   sessão.
4. **Banco + RLS** — o Postgres aplica as regras (aprovado? admin?) e devolve só o
   permitido.
5. **De volta à tela** — o React renderiza. Escrita (admin) segue o mesmo caminho
   via `src/data/admin.ts`.

Arquivos-chave da camada de dados:

- `src/data/content.ts` — leitura pública (`getNews`, `getPops`, `getJobs`, …).
- `src/data/admin.ts` — CRUD genérico dirigido por `COLLECTIONS`.
- `src/data/access.ts`, `quiz.ts` — acessos e quiz (correção no servidor).
- `src/data/settings.ts`, `navSettings.ts` — configuração e abas.
- `src/lib/supabase.ts` — a única conexão; `src/lib/auth.tsx` — sessão/`isAdmin`/`isApproved`.

---

## 5. Modelo de dados (22 tabelas, todas com RLS)

### Acesso
| Tabela | Guarda |
|---|---|
| `profiles` | Perfil: nome, foto, papel (admin/viewer), status (pendente/aprovado), operação, localidade + controle de bloqueio por tentativas (`failed_attempts`, `locked`, `locked_at`) |
| `admin_emails` | E-mails que recebem papel de admin |
| `operations` | Operações (REG 1, REG 2, FULL…) |
| `localities` | Localidades, ligadas a uma operação |

### Conteúdo
| Tabela | Guarda |
|---|---|
| `news` | Notícias / matérias |
| `editions` | Edições do jornal "Jornada Reversa" |
| `pops` | Procedimentos (etapas, status, `download_url`) |
| `dashboards` | Painéis externos (Looker, Power BI…) |
| `tools` | Ferramentas |
| `jobs` | Vagas (link de candidatura) |
| `people` | Time (cargo/nível, região, depoimento) |
| `projects` | Projetos (progresso, prazo) |

### Quiz
| Tabela | Guarda |
|---|---|
| `quizzes` | O quiz da semana |
| `quiz_questions` | Perguntas e opções — **a resposta certa nunca vai ao navegador** |
| `quiz_attempts` | Cada tentativa (quem, nota, quando) |
| `quiz_answers` | Cada resposta marcada, por questão |

### Configuração da interface
| Tabela | Guarda |
|---|---|
| `nav_settings` | Abas: visibilidade, ordem, nome |
| `app_settings` | Links globais (SPX Reverser, Vagas…) |
| `reversa_now` | Itens do painel "Reversa Agora" na home |

### Segurança
| Tabela | Guarda |
|---|---|
| `security_events` | Alertas de tentativa de invasão: registra quando uma conta é bloqueada por senha incorreta (para o admin liberar) |
| `login_approvals` | Pedidos de aprovação do 2FA por SeaTalk (token, validade 2 min, status) — lido só pela Edge Function |
| `integrations` | Credenciais da integração SeaTalk (App ID/Secret), gravadas pelo admin, lidas só pela Edge Function |

---

## 6. Como as informações se relacionam

O **perfil do usuário é o eixo central**: liga login → permissões → operação. O RLS
lê esse perfil para decidir, em cada tabela, o que a pessoa vê.

- **Login → Perfil:** um trigger cria a linha em `profiles` com o mesmo id do
  usuário do Auth ao cadastrar. Perfil e login são a mesma pessoa.
- **Perfil → Permissão:** e-mail em `admin_emails` → **admin**; senão **viewer**, que
  precisa ser **aprovado** para ver conteúdo.
- **Operação → Localidade:** cada localidade pertence a uma operação; ambas ficam no
  perfil (usadas nos relatórios do quiz por operação).
- **Quiz encadeado:** `quizzes` → `quiz_questions`; cada `quiz_attempt` → várias
  `quiz_answers`. Correção no banco (`submit_quiz`), nunca no navegador.
- **Config → Interface:** `nav_settings` (abas), `app_settings` (links), `reversa_now`
  (home). Mexer nessas tabelas muda o portal na hora.
- **RLS é o tradutor:** toda leitura passa por `is_approved()` / `is_admin()`, que
  consultam `profiles`. É assim que a informação certa chega na pessoa certa.
- **Perfil → Segurança:** tentativas de login erradas contam no `profiles`; ao
  travar, geram um registro em `security_events` que o admin vê e resolve ao liberar
  a conta.
- **Perfil → 2FA:** o `employee_code` do SeaTalk fica no `profiles`; o login com 2FA
  cria um `login_approvals` e só abre o portal após a aprovação no bot.

---

## 7. Segurança

- **RLS** ligado nas 22 tabelas — sem regra que permita, a linha não sai do banco
  (nem por API direta).
- **Funções** `is_approved()` (leitura), `is_admin()` (escrita), `submit_quiz`
  (correção no servidor), `update_my_profile` (edição de perfil com colunas
  restritas — o usuário não consegue se auto-promover), `increment_news_views`,
  `record_login_failure` / `login_reset_on_success` / `admin_unlock_user`
  (trava de acesso), `set_seatalk_config` / `seatalk_config_status` (integração
  SeaTalk) e a Edge Function `seatalk-2fa` (2FA, ver abaixo).
- **Storage** `avatars` e `media` — só imagem, até 6 MB.
- **Cabeçalhos HTTP** na Vercel (`vercel.json`): CSP, HSTS, X-Frame-Options,
  X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- **Chaves:** a *publishable key* é pública por design (só permite tentar; o RLS
  libera); a `service_role` nunca vai ao navegador; nenhum segredo é versionado
  (`.env` está no `.gitignore`).

### Trava de acesso por tentativas (anti-invasão)

Depois de **5 tentativas** de senha incorreta, a conta é **bloqueada** e só um
administrador consegue liberar. A trava é ancorada no banco:

1. Cada erro chama `record_login_failure()`, que soma a tentativa no perfil.
2. Ao chegar em 5, marca `locked = true`. **Administradores nunca são travados**
   (para nunca prender todos os admins).
3. `is_approved()` passa a exigir conta **não bloqueada**: uma conta travada não lê
   **nada**, mesmo por API direta com a senha certa.
4. O bloqueio registra um evento em `security_events`, exibido como **alerta de
   segurança** no painel de Acessos.
5. `admin_unlock_user()` desbloqueia e resolve o alerta — só então o usuário volta a
   ver o portal.

Camadas: o **rate-limit nativo do Supabase Auth** barra a força-bruta crua no
endpoint de login; a trava de conta é a regra de negócio "bloqueia e só o admin
libera". O **e-mail de alerta ao admin** no bloqueio já está previsto (gancho
pronto) — falta apenas plugar um serviço de envio (ex.: Resend).

### Verificação em duas etapas (2FA) por aprovação no SeaTalk

Opcional por usuário (`profiles.two_factor_enabled`). Com 2FA ligado, além da
senha o login exige uma **aprovação no bot do SeaTalk** em até 2 minutos.

1. Com 2FA ligado, `is_approved()` exige uma aprovação recente
   (`two_factor_ok_until` no futuro); sem ela, o portal mostra "Aguardando
   aprovação no SeaTalk".
2. A Edge Function `seatalk-2fa` pede um token do app SeaTalk e envia ao usuário
   uma mensagem com o link de aprovação (registro em `login_approvals`, 2 min).
3. O usuário toca no link → página `/aprovar` do portal → confirma. Libera o
   acesso por 12h.
4. O `employee_code` de cada pessoa é **capturado automaticamente**: ao mandar
   "oi" ao bot, o Event Callback (`?cb=1`) casa o e-mail com o perfil e salva o
   código — sem digitação manual.

Segredos do SeaTalk (App ID/Secret) ficam na tabela `integrations` (RLS: só a
Edge Function lê). O navegador nunca fala direto com o SeaTalk; tudo passa pela
função no servidor. Requisito: o e-mail do perfil precisa ser igual ao e-mail do
SeaTalk (para a captura automática casar).

> Ação pendente no painel Supabase (não é código): ativar **Leaked Password
> Protection** em Authentication.

---

## 8. Publicação (deploy)

1. Alteração feita e validada com `npm run build`.
2. Commit + push na branch de trabalho (GitHub).
3. Merge na `main` (branch de produção).
4. A Vercel detecta o push, faz o build e publica em ~1 min.

O banco é **separado do deploy**: publicar o site não altera dados. Conteúdo é
gerenciado pelo painel admin em tempo real; mudanças de *estrutura* do banco são
feitas à parte, direto no Supabase.

---

## 9. Desempenho (teste de velocidade)

Medição via **Google Lighthouse (mobile)** — linha de base.

### Índices de qualidade
| Índice | Score |
|---|---|
| Desempenho | 89 |
| Acessibilidade | 89 |
| Melhores práticas | 100 |
| SEO | 91 |

### Core Web Vitals (tempos de abertura)
| Métrica | Valor | Status |
|---|---|---|
| FCP — primeiro conteúdo | 2,7 s | ✓ bom |
| LCP — maior elemento | 2,7 s | ✓ bom |
| TBT — bloqueio total | 0 ms | ✓ ótimo |
| CLS — estabilidade visual | 0 | ✓ ótimo |
| Speed Index | 4,3 s | ✓ bom |

> **Melhorias aplicadas depois desta medição:** SEO (robots.txt, sitemap.xml, Open
> Graph, JSON-LD) e Acessibilidade (contraste do texto secundário → WCAG AA), então
> esses dois índices tendem a estar mais altos hoje. TBT 0 ms e CLS 0 indicam uma
> página que abre sem travar e sem "pular" o layout.
>
> Referência: FCP/LCP até ~2,5 s = ótimo e até ~4 s = bom · TBT até 200 ms = bom ·
> CLS até 0,1 = bom.
