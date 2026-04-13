> ⚙️ Iron Man | 13/04/2026 | v1.0

# PRD — Lead Qualifier + Facebook Pixel

---

## 1. Visão

### Problema
Funis de aula gratuita no Framer enviam 100% dos leads ao Facebook, incluindo leads desqualificados. Isso degrada a inteligência do pixel, aumenta o CPL e reduz a eficiência das campanhas.

### Solução
Plataforma pessoal que age como middleware: recebe dados do form via webhook, aplica regras de qualificação configuráveis, e envia o evento `Lead` ao Facebook apenas para leads que atendem todos os critérios — via Conversions API server-side, garantindo atribuição mesmo com bloqueadores de anúncio.

### Público-alvo
Um único usuário (owner da plataforma). Sem multi-tenancy.

### Métricas de Sucesso (KPIs)
- 100% dos webhooks recebidos são processados sem perda de dados
- Latência webhook→qualificação→CAPI < 2 segundos
- Taxa de entrega ao Facebook CAPI ≥ 99% para leads qualificados
- Zero falsos positivos/negativos nas regras de qualificação

---

## 2. Features

### F1 — Gerenciamento de Pixels [P0]

**Descrição:** CRUD de pixels do Facebook com webhook URL e snippet JS gerados automaticamente.

**User Stories:**
- Como usuário, quero cadastrar um pixel informando um nome, Pixel ID e CAPI Access Token para começar a receber leads.
- Como usuário, quero copiar o webhook URL gerado para colar no Framer.
- Como usuário, quero copiar o snippet JS para capturar UTMs e fbclid no meu site Framer.
- Como usuário, quero editar ou deletar um pixel cadastrado.

**Critérios de Aceitação:**
- [ ] Formulário de criação valida: nome (obrigatório), Pixel ID (numérico, obrigatório), CAPI Access Token (obrigatório)
- [ ] Ao criar, gera `webhook_token` UUID v4 único e imutável
- [ ] Webhook URL exibida: `https://[domínio]/api/webhook/[webhook_token]`
- [ ] Botão "Copiar URL" copia para clipboard com toast de confirmação
- [ ] Snippet JS exibido em code block com botão copiar
- [ ] Delete exige confirmação com AlertDialog
- [ ] Máximo de 10 pixels [INFERIDO]

**Regras de Negócio:**
- `webhook_token` gerado uma única vez, nunca alterado
- Pixel ID deve ser string numérica (Facebook format)
- CAPI Access Token armazenado criptografado [INFERIDO]

---

### F2 — Recepção de Webhooks [P0]

**Descrição:** Endpoint público que recebe submissões do Framer, extrai dados, aplica qualificação e persiste o lead.

**User Stories:**
- Como sistema, quero receber o payload do Framer e persistir todos os campos do formulário.
- Como sistema, quero extrair UTMs e fbclid do payload e armazená-los separadamente.
- Como sistema, quero deduplicar por email: se o mesmo email enviar novamente, atualizo e reavalio.

**Critérios de Aceitação:**
- [ ] `POST /api/webhook/[token]` aceita JSON sem autenticação
- [ ] Retorna 200 em ≤ 500ms (processamento assíncrono se necessário)
- [ ] Retorna 404 se `webhook_token` não existe
- [ ] Persiste `form_data` completo como JSONB
- [ ] Extrai e armazena separadamente: `email`, `fbclid`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
- [ ] Se email já existe para o mesmo pixel: atualiza registro e reavalia qualificação
- [ ] Após salvar, avalia qualificação e atualiza `is_qualified`
- [ ] Se qualificado: dispara CAPI imediatamente
- [ ] Framer retries são idempotentes (mesma submission ID não duplica)

**Regras de Negócio:**
- Chave de deduplicação = `(pixel_id, email)`
- Campo `email` buscado no payload com fallback para chaves comuns: `email`, `e-mail`, `Email`, `EMAIL`
- Se email não encontrado no payload: lead salvo sem deduplicação [INFERIDO]
- `submission_id` do header `Framer-Webhook-Submission-Id` salvo para idempotência

**Payload esperado (Framer):**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "faturamento": "10k",
  "segmento": "E-commerce",
  "fbclid": "IwAR...",
  "utm_source": "facebook",
  "utm_medium": "paid",
  "utm_campaign": "aula-gratuita-abril",
  "utm_content": "video-1",
  "utm_term": ""
}
```

---

### F3 — Lista de Leads [P0]

**Descrição:** Tela com todas as submissões de um pixel, com status de qualificação e dados de atribuição.

**User Stories:**
- Como usuário, quero ver todos os leads recebidos em um pixel, com data, email, status de qualificação e se foi enviado ao Facebook.
- Como usuário, quero filtrar por qualificados/não qualificados.
- Como usuário, quero expandir um lead para ver todas as respostas do formulário.

**Critérios de Aceitação:**
- [ ] Tabela com colunas: Data, Email, Qualificado (badge), FB Enviado (badge), UTM Campaign, FBclid (truncado)
- [ ] Badge verde = qualificado, vermelho = não qualificado, cinza = aguardando regras
- [ ] Paginação: 50 leads por página
- [ ] Filtro: Todos / Qualificados / Não Qualificados
- [ ] Row expandível mostrando `form_data` completo como key-value pairs
- [ ] Empty state quando não há leads

**Regras de Negócio:**
- Leads ordenados por `created_at DESC`
- "Aguardando regras" = pixel sem nenhuma regra de qualificação configurada

---

### F4 — Configuração de Qualificação [P0]

**Descrição:** Interface para definir quais respostas qualificam um lead, baseada nos 5 primeiros leads recebidos como referência visual.

**User Stories:**
- Como usuário, quero clicar em "Configurar Qualificação" na tela de leads e ver as perguntas e respostas dos meus primeiros leads.
- Como usuário, quero marcar com checkbox quais respostas qualificam um lead em cada pergunta.
- Como usuário, quero salvar as regras e ver os leads sendo requalificados imediatamente.

**Critérios de Aceitação:**
- [ ] Botão "Configurar Qualificação" na tela de leads
- [ ] Abre drawer/modal com as perguntas extraídas dos 5 primeiros leads
- [ ] Para cada campo do `form_data` (exceto campos de tracking: fbclid, utms): exibe o nome da pergunta
- [ ] Para cada pergunta: exibe as respostas únicas encontradas nos 5 primeiros leads como checkboxes
- [ ] Usuário marca quais respostas são qualificadas
- [ ] "Incluir esta pergunta nos critérios" toggle por pergunta — se desligado, a pergunta não é critério
- [ ] Ao salvar: persiste regras + roda requalificação de todos os leads do pixel
- [ ] Toast: "Regras salvas. X leads requalificados."
- [ ] Após requalificação, leads recém-qualificados são enviados ao Facebook CAPI

**Regras de Negócio:**
- AND entre perguntas ativas: lead deve passar em TODAS
- OR entre respostas de uma pergunta: basta uma resposta qualificada
- Respostas são case-insensitive na comparação
- Campos excluídos dos critérios: `fbclid`, `utm_*`, `email`, `submission_id`
- Se pixel tem 0 leads: tela de config mostra mensagem "Aguardando primeiras submissões"

---

### F5 — Integração Facebook CAPI [P0]

**Descrição:** Envio server-side do evento `Lead` para o Facebook via Conversions API.

**User Stories:**
- Como sistema, quero enviar evento `Lead` ao Facebook para cada lead qualificado, usando o Pixel ID e CAPI Token cadastrados.
- Como sistema, quero incluir dados de atribuição (fbclid, UTMs, email hashed) no evento.

**Critérios de Aceitação:**
- [ ] Evento enviado para `https://graph.facebook.com/v18.0/{pixel_id}/events`
- [ ] Payload inclui: `event_name: "Lead"`, `event_time`, `event_id` (para deduplicação), `user_data` com email hashed SHA256, `fbclid` se disponível
- [ ] Custom data inclui UTMs disponíveis
- [ ] `fb_sent_at` atualizado após envio bem-sucedido
- [ ] Falha no CAPI não derruba o webhook (erro logado, lead salvo mesmo assim)
- [ ] Retry automático em falha: 3 tentativas com backoff [INFERIDO]

**Regras de Negócio:**
- Email hasheado em SHA256 antes de enviar (exigência do Facebook)
- `event_id` = `lead_submission.id` (prevenção de duplicatas no FB)
- Não reenviar ao FB se `fb_sent_at` já preenchido (idempotência)
- Enviar fbclid no campo `fbc` quando disponível (formato: `fb.1.{timestamp}.{fbclid}`)

---

### F6 — Snippet JS para Framer [P1]

**Descrição:** Snippet JavaScript gerado por pixel para colar no Framer, capturando fbclid e UTMs em hidden fields.

**User Stories:**
- Como usuário, quero copiar um snippet pronto para colar no Framer que captura automaticamente fbclid e todos os UTMs.

**Critérios de Aceitação:**
- [ ] Snippet exibido na tela de detalhes do pixel em code block
- [ ] Snippet captura da URL: `fbclid`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
- [ ] Armazena em `sessionStorage` para persistência entre páginas
- [ ] Injeta valores em hidden inputs com os nomes correspondentes
- [ ] Instruções inline: quais hidden fields criar no Framer

**Snippet gerado (template):**
```javascript
// Lead Qualifier — Captura UTMs e FBclid
(function() {
  var p = new URLSearchParams(window.location.search);
  var keys = ['fbclid','utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
  keys.forEach(function(k) {
    var v = p.get(k);
    if (v) sessionStorage.setItem('lq_' + k, v);
  });
  document.addEventListener('DOMContentLoaded', function() {
    keys.forEach(function(k) {
      var el = document.querySelector('[name="' + k + '"]');
      if (el) el.value = sessionStorage.getItem('lq_' + k) || '';
    });
  });
})();
```

---

### F7 — Autenticação [P0]

**Descrição:** Login simples com email/senha via Supabase Auth.

**Critérios de Aceitação:**
- [ ] Tela de login com email e senha
- [ ] Rota `/dashboard` protegida por middleware
- [ ] Logout disponível no header
- [ ] Sem registro público (usuário criado manualmente no Supabase)

---

## 3. Modelo de Dados

### Entidades

**pixels**
| Campo | Tipo | Required | Descrição |
|-------|------|----------|-----------|
| id | UUID PK | ✓ | |
| user_id | UUID FK(auth.users) | ✓ | |
| name | TEXT | ✓ | Nome amigável |
| pixel_id | TEXT | ✓ | ID numérico do FB Pixel |
| capi_token | TEXT | ✓ | Facebook CAPI Access Token |
| webhook_token | UUID UNIQUE | ✓ | Token para URL do webhook |
| created_at | TIMESTAMPTZ | ✓ | |
| updated_at | TIMESTAMPTZ | ✓ | |

**lead_submissions**
| Campo | Tipo | Required | Descrição |
|-------|------|----------|-----------|
| id | UUID PK | ✓ | |
| pixel_id | UUID FK(pixels) | ✓ | |
| email | TEXT | | Email extraído do form |
| form_data | JSONB | ✓ | Payload completo do form |
| fbclid | TEXT | | Facebook click ID |
| utm_source | TEXT | | |
| utm_medium | TEXT | | |
| utm_campaign | TEXT | | |
| utm_content | TEXT | | |
| utm_term | TEXT | | |
| submission_id | TEXT UNIQUE | | Framer-Webhook-Submission-Id |
| is_qualified | BOOLEAN | ✓ | Default false |
| fb_sent_at | TIMESTAMPTZ | | Quando enviado ao CAPI |
| created_at | TIMESTAMPTZ | ✓ | |
| updated_at | TIMESTAMPTZ | ✓ | |

**qualification_rules**
| Campo | Tipo | Required | Descrição |
|-------|------|----------|-----------|
| id | UUID PK | ✓ | |
| pixel_id | UUID FK(pixels) | ✓ | |
| field_name | TEXT | ✓ | Nome do campo no form_data |
| qualified_values | TEXT[] | ✓ | Respostas que qualificam |
| is_active | BOOLEAN | ✓ | Default true |
| created_at | TIMESTAMPTZ | ✓ | |
| updated_at | TIMESTAMPTZ | ✓ | |

### Relacionamentos
```
auth.users 1──N pixels
pixels 1──N lead_submissions
pixels 1──N qualification_rules
```

---

## 4. API Routes

### POST /api/webhook/[token]
- **Auth:** Nenhuma (público)
- **Request:** JSON com campos do formulário Framer
- **Headers:** `Framer-Webhook-Submission-Id` (opcional)
- **Response 200:** `{ "success": true }`
- **Response 404:** `{ "error": "Pixel not found" }`
- **Response 422:** `{ "error": "Invalid payload" }`

### GET /api/pixels
- **Auth:** Supabase session
- **Response 200:** `{ "data": Pixel[] }`

### POST /api/pixels
- **Auth:** Supabase session
- **Request:** `{ name, pixel_id, capi_token }`
- **Response 201:** `{ "data": Pixel }`
- **Errors:** 400 (validation), 409 (pixel_id duplicado)

### GET /api/pixels/[id]
- **Auth:** Supabase session
- **Response 200:** `{ "data": Pixel }`
- **Response 404:** `{ "error": "Not found" }`

### PATCH /api/pixels/[id]
- **Auth:** Supabase session
- **Request:** `{ name?, capi_token? }` (pixel_id e webhook_token imutáveis)
- **Response 200:** `{ "data": Pixel }`

### DELETE /api/pixels/[id]
- **Auth:** Supabase session
- **Response 204:** sem body
- **Comportamento:** cascade delete em leads e rules

### GET /api/pixels/[id]/leads
- **Auth:** Supabase session
- **Query:** `?page=1&filter=all|qualified|unqualified`
- **Response 200:** `{ "data": LeadSubmission[], "total": number, "page": number }`

### GET /api/pixels/[id]/rules
- **Auth:** Supabase session
- **Response 200:** `{ "data": QualificationRule[], "sample_leads": LeadSubmission[] }`
- OBS: `sample_leads` = primeiros 5 leads do pixel

### POST /api/pixels/[id]/rules
- **Auth:** Supabase session
- **Request:** `{ rules: { field_name: string, qualified_values: string[], is_active: boolean }[] }`
- **Response 200:** `{ "data": { rules_saved: number, leads_requalified: number, newly_qualified: number } }`
- **Comportamento:** substitui todas as regras + roda requalificação + dispara CAPI para novos qualificados

### POST /api/pixels/[id]/leads/requalify
- **Auth:** Supabase session
- **Response 200:** `{ "data": { requalified: number, newly_qualified: number } }`

---

## 5. Integrações

### Framer Webhook
- **Tipo:** Inbound webhook (HTTP POST)
- **Formato:** JSON flat object com campos do form
- **Headers úteis:** `Framer-Webhook-Submission-Id`, `Framer-Signature`
- **Fallback:** Retornar 200 sempre para evitar retries desnecessários

### Facebook Conversions API
- **Tipo:** REST outbound
- **Endpoint:** `POST https://graph.facebook.com/v18.0/{pixel_id}/events`
- **Auth:** `access_token` no body
- **Dados enviados:** event_name, event_time, event_id, user_data (email SHA256, fbc), custom_data (UTMs)
- **Fallback:** Log de erro, marcar `fb_error` no lead, retry 3x com backoff exponencial

---

## 6. Auth & Roles

### Método
Supabase Auth com email/senha. Sessão em HTTP-only cookies via `@supabase/ssr`.

### Roles
Single user. RLS garante que o usuário só acessa seus próprios pixels e leads.

### Onboarding
Sem registro público. Admin cria usuário manualmente no Supabase Dashboard. Primeiro acesso → login direto.

---

## 7. Não-Funcionais

- **Webhook latency:** < 500ms para resposta ao Framer (processamento pode ser assíncrono)
- **CAPI latency:** < 2s após qualificação
- **Disponibilidade:** Vercel serverless (99.9% SLA)
- **SEO:** Não aplicável (app autenticado)
- **Escalabilidade:** Single-user, até ~10k leads/mês sem problemas [INFERIDO]

---

## 8. Roadmap

### Fase 1 — MVP (atual)
- Setup, Auth, Pixel CRUD, Webhook receiver, Lead list, Qualification config, CAPI integration, Snippet JS

### Fase 2 — Melhorias [INFERIDO]
- Dashboard com métricas (total leads, taxa de qualificação por pixel, custo implícito)
- Histórico de eventos CAPI (log de envios)
- Notificação email ao receber lead qualificado

---

## 9. Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| CAPI token expirado | Média | Alto | Alertar na UI se último envio falhou |
| Framer mudar formato do webhook | Baixa | Médio | Parser flexível (aceita qualquer JSON) |
| Email não presente no payload | Média | Baixo | Salvar lead sem deduplicação, exibir aviso |
| Duplicação de eventos no FB | Baixa | Médio | event_id único + checar fb_sent_at antes de enviar |
