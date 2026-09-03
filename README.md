# SPX Reversa — Portal

**Informação que transforma. Resultados que conectam.**

Portal corporativo interno da operação de **Logística Reversa** — jornal interno,
central de conhecimento, biblioteca de POPs, central de dados/dashboards, ferramentas,
jornada operacional, pessoas e vagas em uma única experiência editorial premium.

## Stack

- **React 18** + **TypeScript**
- **Vite 5**
- **Tailwind CSS 3** (design system próprio)
- **React Router 6**
- **Lucide Icons**

Arquitetura preparada para integrar futuramente Supabase, Google Sheets, Looker Studio,
Power BI e autenticação — hoje roda 100% com **dados mockados** (`src/data/`).

**No ar:** hospedado na **Vercel** (config em `vercel.json`). Cada push na branch de
produção gera um novo deploy automático.

## Como rodar

```bash
npm install
npm run dev        # ambiente de desenvolvimento (http://localhost:5173)
npm run build      # type-check + build de produção (dist/)
npm run preview    # serve o build de produção
npm run lint       # apenas type-check (tsc --noEmit)
```

## Design System

Definido em `tailwind.config.js` e `src/index.css`.

| Token | Valor |
| --- | --- |
| Primary Orange | `#EE4D2D` |
| Orange Hover | `#D93D1E` |
| Orange Light | `#FFF1EC` |
| Dark / Header | `#080C12` |
| Navy | `#071D35` |
| Background | `#F5F6F8` |
| Cards | `#FFFFFF` |
| Bordas | `#E5E7EB` |
| Texto | `#111827` / `#4B5563` / `#8A94A6` |
| Status | success `#16A34A` · warn `#F59E0B` · danger `#DC2626` · info `#2563EB` |

Tipografia **Inter**. Grid `max-width: 1600px`, cards com raio 12px, sombras sutis e
header escuro com laranja como cor de destaque.

## Páginas

| Rota | Página |
| --- | --- |
| `/` | Início (home completa) |
| `/pop` · `/pop/:id` | Biblioteca de POPs + detalhe |
| `/dados` · `/projetos/:id` | Central de indicadores/dashboards + projeto |
| `/reverser` | SPX Reverser (ferramentas) |
| `/jornada` · `/jornada/:etapa` | Jornada Reversa + detalhe da etapa |
| `/novidades` · `/novidades/:slug` | Jornal + matéria |
| `/time` · `/pessoas/:id` | Organograma + perfil |
| `/vagas` · `/vagas/:id` | Oportunidades + detalhe da vaga |
| `/busca` | Busca global |

Busca global e central de notificações funcionam em todo o portal. Layout
**Desktop First** com experiência mobile específica (bottom navigation + drawer).

## Estrutura

```
src/
  components/
    layout/   Header, MobileHeader, MobileMenu, BottomNavigation,
              Footer, SearchModal, NotificationPanel, Layout, UIContext
    home/     seções da home (Hero, ReversaNow, QuickAccess, ...)
    ui/       cards e primitivos reutilizáveis
  pages/      uma por rota
  data/       dados mockados centralizados
  lib/        helpers (media, format, nav, search)
  types/      tipos de domínio
```

## Backend futuro

Esquema sugerido em [`docs/supabase-schema.sql`](docs/supabase-schema.sql).
Os tipos em `src/types/` já refletem as tabelas planejadas, e a camada `src/data/`
isola os mocks — basta trocar por chamadas ao Supabase mantendo as mesmas assinaturas.
