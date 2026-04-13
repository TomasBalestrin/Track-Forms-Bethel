> 🔭 Visão | 13/04/2026 | v1.0

# Tech Stack — Lead Qualifier + Facebook Pixel

---

## 1. Visão Geral

```
Browser (Next.js Client)
    └── Next.js 14 App Router (Vercel Edge/Serverless)
            ├── Supabase Auth (SSR cookies)
            ├── Supabase PostgreSQL (dados)
            └── Facebook Conversions API (outbound, server-side)

Framer (site externo)
    └── POST /api/webhook/[token] → Next.js API Route
```

---

## 2. Core Stack

| Tecnologia | Versão | Justificativa |
|-----------|--------|---------------|
| Next.js | 14 (App Router) | Server Components, API Routes, middleware auth — padrão Bethel Systems |
| TypeScript | 5 strict | Segurança de tipos, @/ path alias |
| Tailwind CSS | 3 | Estilização utilitária, sem CSS Modules |
| shadcn/ui | latest | Componentes acessíveis, tema configurável via CSS vars |
| Supabase | latest | Auth + PostgreSQL + RLS — single platform |
| Vercel | — | Deploy contínuo, serverless functions, zero-config |
| Zustand | 4 | Estado de UI leve (filtros, modais) |
| TanStack Query | 5 | Cache e sincronização de dados server |
| React Hook Form | 7 | Forms performáticos |
| Zod | 3 | Validação schema client + server |
| Framer Motion | 11 | Animações de UI (toasts, transitions) |
| Lucide React | latest | Ícones |

---

## 3. Frontend

### Estilização
- Tailwind CSS only — zero CSS Modules, zero styled-components
- shadcn/ui para componentes base
- CSS variables para tokens de cor no `globals.css`
- Fontes: Plus Jakarta Sans (headings) + Inter (body) via `next/font`

### State Management
- **Server state:** TanStack Query (pixels, leads, rules)
- **UI state:** Zustand (filtros ativos, modal aberto, clipboard state)
- **Forms:** React Hook Form + Zod

### Validação
- Zod schemas compartilhados entre client e server (`src/lib/validations/`)
- Client: feedback inline em blur
- Server: re-validação em todo route handler

---

## 4. Pacotes Extras

| Pacote | Versão | Propósito | Justificativa |
|--------|--------|-----------|---------------|
| `crypto` (Node built-in) | — | SHA256 do email para CAPI | Sem dependência extra |
| `@supabase/ssr` | latest | Auth com cookies HTTP-only | Obrigatório para App Router |
| `node-fetch` | — | Não necessário (Next.js usa fetch nativo) | — |

---

## 5. Infra

### Environments
| Env | Branch | Supabase | URL |
|-----|--------|----------|-----|
| dev | local | projeto local ou dev | localhost:3000 |
| preview | PRs | projeto dev | vercel preview URL |
| prod | main | projeto prod | domínio final |

### Variáveis de Ambiente
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=  # Apenas server, nunca expor

# App
NEXT_PUBLIC_APP_URL=https://leadqualifier.vercel.app

# (Facebook tokens são armazenados por pixel no banco, não em env)
```

### CI/CD
- Vercel Git Integration (push to main → deploy automático)
- Preview deployments em PRs
- Build check obrigatório antes de merge

### Monitoramento
- Vercel Function Logs para webhook errors
- Supabase Dashboard para queries lentas

---

## 6. Responsividade

| Breakpoint | Largura | Uso |
|-----------|---------|-----|
| sm | 640px | Mobile landscape |
| md | 768px | Tablet |
| lg | 1024px | Desktop pequeno |
| xl | 1280px | Desktop padrão |

- Sidebar → drawer em mobile
- Tabelas → cards em mobile
- Modais → fullscreen em mobile

---

## 7. ADRs (Architecture Decision Records)

### ADR-001: Facebook CAPI apenas server-side (sem pixel JS no dashboard)
**Contexto:** Precisamos enviar o evento `Lead` ao Facebook apenas para leads qualificados.
**Decisão:** Usar exclusivamente a Conversions API server-side. O pixel JS do Facebook fica somente no site Framer do usuário (page views), não no nosso dashboard.
**Consequência:** Melhor controle sobre quais eventos chegam ao FB. Não há risco de disparar `Lead` no client.

### ADR-002: Webhook endpoint público sem autenticação de signature no MVP
**Contexto:** Framer suporta webhook signature (HMAC SHA256), mas exige configurar um secret.
**Decisão:** MVP aceita qualquer POST no endpoint correto (segurança por obscuridade via UUID token). Validação de signature como feature futura.
**Consequência:** Risco baixo pois o token UUID é impredizível. Adicionar signature validation na Fase 2.

### ADR-003: Processamento síncrono no webhook (sem queue)
**Contexto:** Poderíamos usar uma fila (Redis/BullMQ) para processar qualificação e CAPI de forma assíncrona.
**Decisão:** Processamento síncrono dentro do route handler. Volume esperado (< 100 subs/dia) não justifica complexidade de queue.
**Consequência:** Latência de resposta ao Framer pode ser até 2s em pior caso. Aceitável para o volume.
