> 🐜 Homem-Formiga | 13/04/2026 | v1.0

# TASKS — Lead Qualifier + Facebook Pixel

---

## BLOCO A — Setup Inicial

### A1 ⬜ 🟢Low — Inicializar projeto Next.js
CRIAR: projeto via create-next-app, tsconfig.json
EDITAR: tsconfig.json (adicionar @/ alias)
LER: docs/tech-stack.md (seção Core Stack)
NÃO TOCAR: N/A
Steps:
1. `npx create-next-app@latest lead-qualifier --typescript --tailwind --eslint --app --src-dir`
2. Configurar `@/` no `tsconfig.json` paths
3. `npm i @supabase/ssr @supabase/supabase-js zustand @tanstack/react-query @tanstack/react-query-devtools react-hook-form zod framer-motion lucide-react`
4. `npm run dev` — verificar localhost:3000
5. `npm run build`
Critério: Build passa sem erros, localhost:3000 responde

---

### A2 ⬜ 🟢Low — Configurar Tailwind + shadcn/ui
CRIAR: nenhum (shadcn via CLI)
EDITAR: `tailwind.config.ts`, `src/app/globals.css`, `src/app/layout.tsx`
LER: docs/tech-stack.md (seção Frontend), docs/ux-flows.md (seção Acessibilidade)
NÃO TOCAR: tsconfig.json, package.json
Steps:
1. `npx shadcn@latest init` — escolher tema "zinc", dark mode "class"
2. `npx shadcn@latest add button input label card dialog drawer alert-dialog toast badge separator skeleton table`
3. Configurar CSS variables no `globals.css` — fundo escuro não, light mode
4. Configurar `Plus Jakarta Sans` + `Inter` via `next/font` no `layout.tsx`
5. `npm run build`
Critério: Componentes shadcn importam sem erro, fontes carregam

---

### A3 ⬜ 🟢Low — Configurar Supabase clients + middleware
CRIAR: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/middleware.ts`, `.env.local.example`
EDITAR: nenhum
LER: docs/security.md (seções Auth, Env vars)
NÃO TOCAR: arquivos A1 e A2
Steps:
1. Ler docs/security.md seção Auth
2. Criar `client.ts` com `createBrowserClient`
3. Criar `server.ts` com `createServerClient` + cookies do Next.js
4. Criar `src/middleware.ts` — protege `/(dashboard)`, redireciona `/login`
5. Criar `.env.local.example` com todas as vars necessárias
6. `npm run build`
Critério: Middleware criado, clients exportados sem erro de tipo

---

### A4 ⬜ 🟡Medium — Aplicar schema no Supabase ⚙️ MANUAL
CRIAR: `supabase/migrations/001_initial_schema.sql` (copiar de docs/schema.md)
EDITAR: nenhum
LER: docs/schema.md (completo)
NÃO TOCAR: código da aplicação
Steps:
1. Abrir docs/schema.md
2. Criar arquivo `supabase/migrations/001_initial_schema.sql` com o SQL completo
3. Abrir Supabase Dashboard → SQL Editor
4. Executar o SQL na ordem da seção "Migration Order"
5. Verificar: tabelas criadas, RLS ativo em todas, indexes criados, view `pixel_stats` existe
6. Criar usuário admin em Supabase Auth → Authentication → Users → "Add user"
Critério: Tabelas `pixels`, `lead_submissions`, `qualification_rules` existem com RLS ativo

---

## BLOCO B — Auth

### B1 ⬜ 🟢Low — Página de Login
CRIAR: `src/app/(auth)/login/page.tsx`, `src/components/layout/AuthCard.tsx`
EDITAR: `src/app/layout.tsx` (adicionar QueryProvider se necessário)
LER: docs/ux-flows.md (seção 3.1 Login), docs/security.md (seção Auth)
NÃO TOCAR: middleware.ts, lib/supabase/
Steps:
1. Ler ux-flows.md seção Login
2. Criar `AuthCard.tsx` — card centralizado com logo + título
3. Criar `login/page.tsx` — form com email/senha usando RHF + Zod
4. Implementar `signInWithPassword` do Supabase Auth
5. Erro → toast/mensagem inline. Sucesso → redirect `/pixels`
6. `npm run build`
Critério: Login funciona com credenciais válidas, redireciona para /pixels

---

### B2 ⬜ 🟢Low — Layout do Dashboard + Sidebar
CRIAR: `src/app/(dashboard)/layout.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/Header.tsx`, `src/components/layout/MobileDrawer.tsx`
EDITAR: nenhum
LER: docs/ux-flows.md (seção 2 Navegação), docs/architecture.md (seção Componentes)
NÃO TOCAR: (auth)/login/
Steps:
1. Ler ux-flows.md seção Navegação
2. Criar `Sidebar.tsx` — links para /pixels, botão Sair, responsivo
3. Criar `Header.tsx` — logo + hamburger mobile
4. Criar `MobileDrawer.tsx` — drawer com mesmo conteúdo da sidebar
5. Criar `(dashboard)/layout.tsx` — compõe sidebar + header + main
6. Implementar logout com `supabase.auth.signOut()` → redirect /login
7. `npm run build`
Critério: Layout renderiza, sidebar visível em desktop, drawer funciona em mobile

---

## BLOCO C — Feature: Pixels

### C1 ⬜ 🟡Medium — CRUD Pixels (Backend)
CRIAR: `src/types/pixel.ts`, `src/lib/validations/pixel.ts`, `src/services/pixelService.ts`, `src/app/api/pixels/route.ts`, `src/app/api/pixels/[id]/route.ts`
EDITAR: nenhum
LER: docs/PRD.md (seção API Routes + Modelo de dados), docs/architecture.md (seção API Pattern), docs/schema.md (tabela pixels)
NÃO TOCAR: lib/supabase/, middleware.ts
Steps:
1. Ler PRD.md seções API Routes e Modelo de dados
2. Criar `types/pixel.ts` — interfaces `Pixel`, `CreatePixelInput`, `UpdatePixelInput`
3. Criar `validations/pixel.ts` — schemas Zod para create e update
4. Criar `pixelService.ts` — `list(userId)`, `create(userId, data)`, `getById(id, userId)`, `update(id, userId, data)`, `delete(id, userId)`
5. Criar `api/pixels/route.ts` — GET (list) + POST (create)
6. Criar `api/pixels/[id]/route.ts` — GET + PATCH + DELETE
7. `npm run build`
Critério: GET /api/pixels retorna 200, POST cria pixel com webhook_token gerado automaticamente

---

### C2 ⬜ 🟡Medium — UI Lista e Criação de Pixels
CRIAR: `src/app/(dashboard)/pixels/page.tsx`, `src/app/(dashboard)/pixels/new/page.tsx`, `src/components/pixels/PixelCard.tsx`, `src/components/pixels/PixelForm.tsx`, `src/components/pixels/PixelDeleteDialog.tsx`, `src/hooks/usePixels.ts`
EDITAR: nenhum
LER: docs/ux-flows.md (seções 3.2, 3.3), src/app/api/pixels/route.ts
NÃO TOCAR: api/, services/
Steps:
1. Ler ux-flows.md seções 3.2 e 3.3
2. Criar `usePixels.ts` — TanStack Query para list + create + delete
3. Criar `PixelCard.tsx` — card com nome, pixel_id, stats, btns
4. Criar `PixelForm.tsx` — form RHF+Zod para criar pixel
5. Criar `pixels/page.tsx` — grid de cards + empty state + btn novo
6. Criar `pixels/new/page.tsx` — form de criação
7. Criar `PixelDeleteDialog.tsx` — AlertDialog de confirmação
8. `npm run build`
Critério: Criar pixel via UI, ver na lista, deletar com confirmação

---

## BLOCO D — Feature: Webhook + Qualificação

### D1 ⬜ 🔴High — Engine de Qualificação + Services
CRIAR: `src/lib/qualification/engine.ts`, `src/lib/webhook/parser.ts`, `src/lib/facebook/hash.ts`, `src/types/lead.ts`, `src/types/rule.ts`, `src/lib/validations/rules.ts`, `src/services/leadService.ts`, `src/services/ruleService.ts`
EDITAR: nenhum
LER: docs/architecture.md (seções Qualification Engine, Fluxo do Webhook), docs/PRD.md (Features F2, F4), docs/schema.md (tabelas lead_submissions, qualification_rules)
NÃO TOCAR: lib/supabase/, types/pixel.ts
Steps:
1. Ler architecture.md seções Qualification Engine e Fluxo do Webhook
2. Criar `types/lead.ts` e `types/rule.ts` com interfaces completas
3. Criar `lib/facebook/hash.ts` — `hashEmail(email: string): string` (SHA256 hex lowercase)
4. Criar `lib/webhook/parser.ts` — `parseWebhookPayload(body)` → extrai email, fbclid, utms, form_data
5. Criar `lib/qualification/engine.ts` — `evaluateQualification(formData, rules)` → boolean. AND entre rules ativas, OR entre values. Case-insensitive.
6. Criar `services/leadService.ts` — `upsertLead()`, `requalifyAll(pixelId)`, `getSampleLeads(pixelId, limit=5)`, `listLeads(pixelId, filter, page)`
7. Criar `services/ruleService.ts` — `getRules(pixelId)`, `saveRules(pixelId, rules)`
8. Criar `validations/rules.ts` — Zod schema para array de rules
9. `npm run build`
Critério: `evaluateQualification` testável mentalmente: 2 regras ativas, lead com ambas → true; lead faltando uma → false

---

### D2 ⬜ 🔴High — Webhook Endpoint
CRIAR: `src/app/api/webhook/[token]/route.ts`, `src/services/capiService.ts`, `src/lib/snippet/generator.ts`
EDITAR: nenhum
LER: docs/architecture.md (Fluxo do Webhook completo), docs/PRD.md (F2 e F5), src/services/leadService.ts, src/lib/qualification/engine.ts
NÃO TOCAR: lib/supabase/client.ts, outros services
Steps:
1. Ler architecture.md Fluxo do Webhook e PRD.md F5
2. Criar `capiService.ts` — `sendLeadEvent(pixel, lead)`:
   - POST `https://graph.facebook.com/v18.0/{pixel_id}/events`
   - Payload: `event_name: "Lead"`, `event_time`, `event_id: lead.id`, `user_data: { em: hashEmail(email), fbc: buildFbc(fbclid) }`
   - Custom data: utms disponíveis
   - Retry 3x com backoff 1s/2s/4s
   - Retorna `{ success, error? }`
3. Criar `generator.ts` — `generateSnippet()` → string do JS snippet para Framer
4. Criar `api/webhook/[token]/route.ts`:
   - Buscar pixel por webhook_token (usar service_role para bypass RLS no INSERT)
   - Checar idempotência via submission_id
   - `parseWebhookPayload(body)`
   - `leadService.upsertLead(pixelId, parsed)`
   - `ruleService.getRules(pixelId)`
   - `evaluateQualification(formData, rules)` → atualizar is_qualified
   - Se qualificado + fb_sent_at null → `capiService.sendLeadEvent()` → atualizar fb_sent_at
   - Retornar 200 `{ success: true }` sempre
5. `npm run build`
Critério: POST para /api/webhook/[token-válido] com payload JSON salva lead no Supabase

---

### D3 ⬜ 🟡Medium — API Routes: Leads e Rules
CRIAR: `src/app/api/pixels/[id]/leads/route.ts`, `src/app/api/pixels/[id]/leads/requalify/route.ts`, `src/app/api/pixels/[id]/rules/route.ts`
EDITAR: nenhum
LER: docs/PRD.md (API Routes leads e rules), src/services/leadService.ts, src/services/ruleService.ts
NÃO TOCAR: api/webhook/, outros services
Steps:
1. Criar `leads/route.ts` — GET com query params `?page=1&filter=all|qualified|unqualified`
2. Criar `leads/requalify/route.ts` — POST: roda requalificação de todos os leads + dispara CAPI para novos qualificados
3. Criar `rules/route.ts` — GET (rules + sample_leads) + POST (save rules → requalify → retorna stats)
4. Todos os routes: auth check → zod → service → response
5. `npm run build`
Critério: GET /api/pixels/[id]/leads retorna paginação correta, POST /rules salva e retorna contagens

---

## BLOCO E — Feature: UI Leads + Qualificação

### E1 ⬜ 🔴High — Tela de Leads
CRIAR: `src/app/(dashboard)/pixels/[id]/page.tsx`, `src/components/leads/LeadsTable.tsx`, `src/components/leads/LeadsFilter.tsx`, `src/components/leads/LeadRow.tsx`, `src/components/leads/LeadExpandedData.tsx`, `src/components/pixels/WebhookUrlCopy.tsx`, `src/components/pixels/SnippetCopy.tsx`, `src/hooks/useLeads.ts`, `src/stores/leadsFilterStore.ts`
EDITAR: nenhum
LER: docs/ux-flows.md (seção 3.4 completa), src/app/api/pixels/[id]/leads/route.ts
NÃO TOCAR: api/, services/
Steps:
1. Ler ux-flows.md seção 3.4 completa
2. Criar `leadsFilterStore.ts` — Zustand com filtro ativo e página atual
3. Criar `useLeads.ts` — TanStack Query com paginação e filtro
4. Criar `WebhookUrlCopy.tsx` — input readonly + botão copiar com feedback
5. Criar `SnippetCopy.tsx` — code block colapsável + botão copiar snippet
6. Criar `LeadsFilter.tsx` — badges clicáveis Todos/Qualificados/Não Qualificados com contagens
7. Criar `LeadRow.tsx` — linha da tabela com badges de status
8. Criar `LeadExpandedData.tsx` — painel expandido com form_data + atribuição
9. Criar `LeadsTable.tsx` — compõe filter + table + rows + paginação + skeleton + empty state
10. Criar `pixels/[id]/page.tsx` — compõe tudo: header, webhook URL, snippet, stats, tabela
11. `npm run build`
Critério: Tela exibe leads com paginação, filtros funcionam, row expande mostrando form_data

---

### E2 ⬜ 🔴High — Configuração de Qualificação
CRIAR: `src/app/(dashboard)/pixels/[id]/config/page.tsx`, `src/components/qualification/QualificationDrawer.tsx`, `src/components/qualification/QuestionRuleCard.tsx`, `src/components/qualification/AnswerCheckbox.tsx`, `src/hooks/useRules.ts`
EDITAR: `src/app/(dashboard)/pixels/[id]/page.tsx` (adicionar botão que abre drawer)
LER: docs/ux-flows.md (seção 3.5), docs/PRD.md (Feature F4), src/lib/qualification/engine.ts
NÃO TOCAR: api/, services/, lib/qualification/engine.ts
Steps:
1. Ler ux-flows.md seção 3.5 e PRD.md Feature F4
2. Criar `useRules.ts` — TanStack Query para GET rules+sampleLeads e POST saveRules
3. Criar `AnswerCheckbox.tsx` — checkbox com label da resposta
4. Criar `QuestionRuleCard.tsx` — card por pergunta: toggle ativo + lista de AnswerCheckboxes
5. Criar `QualificationDrawer.tsx` — drawer completo: título, lista de QuestionRuleCards, btn salvar sticky, loading state, toast ao salvar
6. Criar `config/page.tsx` — página de config (alternativa ao drawer para mobile)
7. Editar `[id]/page.tsx` — adicionar btn "Configurar Qualificação" que abre QualificationDrawer
8. Após salvar regras: invalidar query de leads para atualizar badges
9. `npm run build`
Critério: Drawer abre com perguntas dos 5 primeiros leads, marcar respostas, salvar atualiza leads na tabela

---

## BLOCO F — Polish + Deploy

### F1 ⬜ 🟡Medium — Responsividade Mobile
CRIAR: nenhum
EDITAR: `src/components/layout/Sidebar.tsx`, `src/components/layout/Header.tsx`, `src/app/(dashboard)/pixels/[id]/page.tsx`, `src/components/leads/LeadsTable.tsx`
LER: docs/ux-flows.md (seção 7 Responsividade), docs/tech-stack.md (seção Responsividade)
NÃO TOCAR: api/, services/, lib/
Steps:
1. Sidebar → esconder em mobile, mostrar hamburger no Header
2. Header → mostrar botão hamburguer que abre MobileDrawer
3. LeadsTable → em mobile mostrar só Email, Status e expand
4. Stats cards → grid 2x2 em mobile
5. QualificationDrawer → fullscreen em mobile
6. `npm run build`
Critério: App usável em viewport 375px (iPhone SE)

---

### F2 ⬜ 🟢Low — Error Boundaries + Loading States
CRIAR: `src/app/(dashboard)/error.tsx`, `src/app/(dashboard)/loading.tsx`
EDITAR: `src/components/leads/LeadsTable.tsx` (skeleton loading), `src/components/pixels/PixelCard.tsx` (skeleton)
LER: docs/architecture.md (seção Error Handling), src/app/(dashboard)/layout.tsx
NÃO TOCAR: api/, services/
Steps:
1. Criar `error.tsx` — boundary com mensagem amigável + btn "Tentar novamente"
2. Criar `loading.tsx` — skeleton da página de pixels
3. Adicionar Suspense + Skeleton em LeadsTable enquanto dados carregam
4. Adicionar Skeleton em PixelCard durante loading da lista
5. `npm run build`
Critério: Navegação mostra skeletons antes dos dados, erros capturados pelo boundary

---

### F3 ⬜ 🟡Medium — Deploy Vercel ⚙️ MANUAL
CRIAR: nenhum
EDITAR: nenhum (configuração no Vercel Dashboard)
LER: docs/tech-stack.md (seção Infra), docs/security.md (Checklist Pré-Deploy), CLAUDE.md
NÃO TOCAR: código
Steps:
1. Revisar checklist completo de docs/security.md seção 8
2. Criar repositório no GitHub e fazer push
3. Conectar no Vercel Dashboard → "Import Git Repository"
4. Configurar Environment Variables no Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (URL do Vercel gerada)
5. Deploy automático → verificar build logs
6. Testar webhook com Postman/curl: `POST https://[dominio]/api/webhook/[token]`
7. Testar login na URL de produção
Critério: App acessível em URL Vercel, webhook recebe POST e salva lead, login funciona

---

## Tabela Resumo

| Bloco | Tasks | Complexidade | Depende de |
|-------|-------|-------------|------------|
| A — Setup | A1, A2, A3, A4 | Low, Low, Low, Medium | — |
| B — Auth | B1, B2 | Low, Low | A |
| C — Pixels | C1, C2 | Medium, Medium | B |
| D — Webhook + Engine | D1, D2, D3 | High, High, Medium | C |
| E — UI Leads + Config | E1, E2 | High, High | D |
| F — Polish + Deploy | F1, F2, F3 | Medium, Low, Medium | E |

**Total:** 15 tasks | 4 manuais (A4, F3) | Estimativa: ~20-25h de Claude Code
