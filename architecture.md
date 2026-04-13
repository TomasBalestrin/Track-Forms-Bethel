> 🔮 Doutor Estranho | 13/04/2026 | v1.0

# Architecture — Lead Qualifier + Facebook Pixel

---

## 1. Estrutura de Diretórios

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx               # Sidebar + header
│   │   ├── page.tsx                 # Redirect → /pixels
│   │   └── pixels/
│   │       ├── page.tsx             # Lista de pixels
│   │       ├── new/
│   │       │   └── page.tsx         # Criar pixel
│   │       └── [id]/
│   │           ├── page.tsx         # Leads do pixel
│   │           └── config/
│   │               └── page.tsx     # Configurar qualificação
│   ├── api/
│   │   ├── webhook/
│   │   │   └── [token]/
│   │   │       └── route.ts         # POST — recebe Framer webhook
│   │   └── pixels/
│   │       ├── route.ts             # GET list, POST create
│   │       └── [id]/
│   │           ├── route.ts         # GET, PATCH, DELETE
│   │           ├── leads/
│   │           │   ├── route.ts     # GET leads paginado
│   │           │   └── requalify/
│   │           │       └── route.ts # POST requalify all
│   │           └── rules/
│   │               └── route.ts     # GET rules, POST save rules
│   ├── globals.css
│   └── layout.tsx                   # Root layout (fonts, providers)
│
├── components/
│   ├── ui/                          # shadcn/ui re-exports
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MobileDrawer.tsx
│   ├── pixels/
│   │   ├── PixelCard.tsx
│   │   ├── PixelForm.tsx
│   │   ├── PixelDeleteDialog.tsx
│   │   ├── WebhookUrlCopy.tsx
│   │   └── SnippetCopy.tsx
│   ├── leads/
│   │   ├── LeadsTable.tsx
│   │   ├── LeadsFilter.tsx
│   │   ├── LeadRow.tsx
│   │   └── LeadExpandedData.tsx
│   └── qualification/
│       ├── QualificationDrawer.tsx
│       ├── QuestionRuleCard.tsx
│       └── AnswerCheckbox.tsx
│
├── hooks/
│   ├── usePixels.ts
│   ├── useLeads.ts
│   ├── useRules.ts
│   └── useClipboard.ts
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # createBrowserClient
│   │   └── server.ts                # createServerClient + cookies
│   ├── facebook/
│   │   ├── capi.ts                  # sendLeadEvent()
│   │   └── hash.ts                  # hashEmail() SHA256
│   ├── qualification/
│   │   └── engine.ts                # evaluateQualification()
│   ├── webhook/
│   │   └── parser.ts                # parseWebhookPayload()
│   ├── snippet/
│   │   └── generator.ts             # generateSnippet()
│   └── validations/
│       ├── pixel.ts                 # Zod schemas pixels
│       ├── lead.ts                  # Zod schemas leads
│       └── rules.ts                 # Zod schemas rules
│
├── services/
│   ├── pixelService.ts              # CRUD pixels
│   ├── leadService.ts               # CRUD + qualificação leads
│   ├── ruleService.ts               # CRUD rules
│   └── capiService.ts               # Envio ao Facebook CAPI
│
├── stores/
│   ├── leadsFilterStore.ts          # Filtro ativo na tabela
│   └── uiStore.ts                   # Drawer/modal state
│
└── types/
    ├── pixel.ts
    ├── lead.ts
    └── rule.ts

supabase/
└── migrations/
    └── 001_initial_schema.sql
```

---

## 2. Nomenclatura

| Artefato | Padrão | Exemplo |
|----------|--------|---------|
| Componentes | PascalCase.tsx | `LeadsTable.tsx` |
| Utils/libs | camelCase.ts | `hashEmail.ts` |
| Hooks | use*.ts | `useLeads.ts` |
| Stores | *Store.ts | `leadsFilterStore.ts` |
| Pastas | kebab-case | `leads-filter/` |
| Variáveis | camelCase | `webhookToken` |
| Types/Interfaces | PascalCase | `LeadSubmission` |
| Constantes | UPPER_SNAKE | `TRACKING_FIELDS` |
| Env vars | NEXT_PUBLIC_* | `NEXT_PUBLIC_SUPABASE_URL` |

---

## 3. Componentes

- **Function declaration** (não arrow function) para componentes
- **Named export** em todos, exceto `page.tsx` (default)
- `"use client"` **somente quando necessário** (event handlers, hooks de estado)
- Props tipadas com **interface** no mesmo arquivo
- **Server Component por default** — client só quando inevitável

---

## 4. API Pattern

```typescript
// Padrão de todo route handler
export async function POST(request: Request) {
  try {
    // 1. Auth check (exceto webhook público)
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. Zod validate
    const body = await request.json()
    const parsed = CreatePixelSchema.safeParse(body)
    if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 })

    // 3. Business logic (via service)
    const result = await pixelService.create(user.id, parsed.data)

    // 4. Response
    return Response.json({ data: result }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/pixels]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## 5. Supabase

- `client.ts` → `createBrowserClient` — uso em Client Components
- `server.ts` → `createServerClient` com cookies — uso em Server Components e API Routes
- **Nunca** usar `service_role` key no client
- **RLS sempre ativo** em todas as tabelas
- Queries complexas em `services/`, nunca diretamente em componentes

---

## 6. Data Fetching

- **Server Component** → Supabase direto (`await supabase.from(...)`)
- **Client Component** → TanStack Query com hooks customizados (`useLeads`, `usePixels`)
- **Nunca** `useEffect` para fetch de dados

---

## 7. Error Handling

| HTTP | Causa | Onde |
|------|-------|------|
| 400 | Zod validation fail | Route handler |
| 401 | Sem sessão | Middleware + route handler |
| 403 | RLS / recurso de outro user | Route handler |
| 404 | Recurso não encontrado | Route handler |
| 422 | Regra de negócio violada | Route handler |
| 500 | Erro inesperado | Route handler (genérico) |

- `error.tsx` em `(dashboard)/` para boundary de UI
- Erros de CAPI: logados mas não propagados (lead salvo mesmo com falha no FB)

---

## 8. Performance

- `next/image` para qualquer imagem
- `next/font` para Plus Jakarta Sans + Inter
- `next/dynamic` para QualificationDrawer (carregado sob demanda)
- `Suspense` com skeleton em LeadsTable (dados paginados)
- Parallel fetch em Server Components quando independentes

---

## 9. Fluxo do Webhook (Crítico)

```
POST /api/webhook/[token]
    │
    ├─ Busca pixel por webhook_token → 404 se não existe
    │
    ├─ Verifica submission_id (idempotência) → 200 se já processado
    │
    ├─ parseWebhookPayload() → extrai email, utms, fbclid, form_data
    │
    ├─ Upsert em lead_submissions (chave: pixel_id + email)
    │
    ├─ evaluateQualification(lead, rules) → is_qualified boolean
    │
    ├─ Atualiza is_qualified no banco
    │
    ├─ Se qualificado AND fb_sent_at IS NULL:
    │       └─ capiService.sendLeadEvent(pixel, lead) → atualiza fb_sent_at
    │
    └─ Return 200 { success: true }
```

---

## 10. Qualification Engine

```typescript
// src/lib/qualification/engine.ts
export function evaluateQualification(
  formData: Record<string, string>,
  rules: QualificationRule[]
): boolean {
  const activeRules = rules.filter(r => r.is_active)
  if (activeRules.length === 0) return false

  // AND entre regras
  return activeRules.every(rule => {
    const answer = formData[rule.field_name]?.toLowerCase().trim()
    // OR entre valores qualificados
    return rule.qualified_values.some(v => v.toLowerCase().trim() === answer)
  })
}
```
