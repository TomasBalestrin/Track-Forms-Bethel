# Lead Qualifier — CLAUDE.md

Plataforma pessoal para qualificar leads do Framer e enviar apenas leads qualificados ao Facebook via Conversions API server-side. Stack: Next.js 14 App Router + TypeScript strict + Tailwind + shadcn/ui + Supabase + Vercel.

---

## Comandos

```bash
npm run dev          # localhost:3000
npm run build        # verificar antes de qualquer commit
npm run lint         # ESLint
npx supabase start   # Supabase local (opcional)
```

---

## Estrutura src/

```
app/
  (auth)/login/page.tsx
  (dashboard)/layout.tsx + pixels/ (page, new, [id], [id]/config)
  api/webhook/[token]/route.ts
  api/pixels/route.ts + [id]/(route, leads, leads/requalify, rules)
components/
  ui/ | layout/ | pixels/ | leads/ | qualification/
hooks/          usePixels, useLeads, useRules, useClipboard
lib/
  supabase/     client.ts (browser) | server.ts (server+cookies)
  facebook/     capi.ts | hash.ts
  qualification/engine.ts
  webhook/      parser.ts
  snippet/      generator.ts
  validations/  pixel.ts | lead.ts | rules.ts
services/       pixelService | leadService | ruleService | capiService
stores/         leadsFilterStore | uiStore
types/          pixel.ts | lead.ts | rule.ts
supabase/migrations/001_initial_schema.sql
```

---

## Protocolo de Execução

**§1 PESQUISAR ANTES:** Ler arquivos similares no projeto → copiar padrões existentes → nunca inventar.

**§2 ESCOPO FECHADO:** Listar CRIAR/EDITAR antes de executar. Não tocar em arquivos fora da lista.

**§3 ISOLAMENTO:** 1 componente = 1 arquivo ≤ 200 linhas. Lógica de negócio em `services/`. Lógica de algoritmo em `lib/`.

**§4 THIN CLIENT FAT SERVER:** Frontend só captura intenção. Qualificação, CAPI, deduplicação = sempre server-side.

**§5 NÃO QUEBRAR:** `npm run build` obrigatório ao final. Verificar consumidores de types/interfaces editados.

---

## Regras por Camada

**TypeScript:** strict ativado, `@/` alias para src/, sem `any`.

**React:** App Router sempre. Server Component default. `"use client"` só se usar hooks/events. Named export (exceto page.tsx).

**Supabase:** `client.ts` → browser only. `server.ts` → API routes e Server Components. `SUPABASE_SERVICE_ROLE_KEY` → apenas no webhook handler server-side. **RLS sempre ativo.**

**API Routes:**
```
Auth check → Zod validate → Service call → Response { data } ou { error }
Try/catch em tudo. console.error('[ROTA]', error).
```

**Webhook `/api/webhook/[token]`:** Público (sem auth). Processar: buscar pixel → idempotência → parse → upsert lead → qualificar → CAPI se qualificado. Retornar 200 sempre (mesmo em erros internos, para não trigger Framer retry).

**Qualification Engine:** `lib/qualification/engine.ts` → `evaluateQualification(formData, rules)`. AND entre regras ativas, OR entre values de cada regra. Case-insensitive.

**Facebook CAPI:** `services/capiService.ts`. Email SHA256 em `lib/facebook/hash.ts`. `event_id` = lead UUID (deduplicação). Nunca reenviar se `fb_sent_at` preenchido.

**Estilo:** Tailwind only. shadcn/ui para componentes. Zero CSS Modules. Dark mode não.

**State:** TanStack Query = server state. Zustand = UI state. RHF = forms.

---

## NÃO FAZER

- `any` no TypeScript
- `useEffect` para fetch de dados
- Arquivo > 200 linhas (extrair)
- Commitar `.env.local`
- `innerHTML` (XSS)
- `console.log` em produção
- Editar arquivos fora do escopo declarado
- Refatorar sem pedir
- Inventar padrão não documentado
- Lógica de qualificação/CAPI no client
- `SUPABASE_SERVICE_ROLE_KEY` em `NEXT_PUBLIC_*`

---

## Docs Disponíveis

- `docs/PRD.md` — Features, regras de negócio, API routes
- `docs/tech-stack.md` — Stack, ADRs, variáveis de ambiente
- `docs/architecture.md` — Estrutura, padrões, fluxo do webhook
- `docs/schema.md` — SQL completo, RLS, indexes
- `docs/security.md` — Auth, validação, checklist deploy
- `docs/ux-flows.md` — Rotas, fluxos, componentes por tela
- `docs/TASKS.md` — Tasks de implementação com prompts
