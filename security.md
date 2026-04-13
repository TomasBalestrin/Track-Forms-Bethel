> 🏹 Gavião Arqueiro | 13/04/2026 | v1.0

# Security — Lead Qualifier + Facebook Pixel

---

## 1. Auth

**Método:** Supabase Auth com email/senha.
**Tokens:** Armazenados em HTTP-only cookies via `@supabase/ssr`. **NUNCA** localStorage.

**Fluxo:**
```
Login (email/senha)
    → Supabase Auth → JWT (access_token + refresh_token)
    → Cookies HTTP-only via @supabase/ssr
    → Middleware (src/middleware.ts) verifica e renova token em cada request
    → getUser() em route handlers confirma identidade
```

**Proteção de Rotas:**
- `middleware.ts` protege `/(dashboard)/**`
- Redirect para `/login` se sem sessão
- `/api/webhook/[token]` é **pública** (não requer auth — segurança por UUID token)

---

## 2. Autorização — 3 Camadas

| Camada | Mecanismo | O que protege |
|--------|-----------|---------------|
| Middleware | `getUser()` + redirect | Rotas de página |
| RLS (Supabase) | `auth.uid()` nas policies | Dados no banco |
| Route Handler | Verificar `user_id` do recurso | APIs REST |

**Tabela de permissões:**
| Recurso | SELECT | INSERT | UPDATE | DELETE |
|---------|--------|--------|--------|--------|
| pixels | próprios | próprios | próprios | próprios |
| lead_submissions | via pixel próprio | service_role (webhook) | via pixel próprio | — |
| qualification_rules | via pixel próprio | via pixel próprio | via pixel próprio | via pixel próprio |

---

## 3. Validação

- **Zod em tudo:** schemas em `src/lib/validations/` usados tanto no client (feedback UX) quanto no server (segurança)
- **Sanitização:** form_data do webhook armazenado como JSONB sem execução — sem risco de injection
- **Limites de string:** name ≤ 100 chars, pixel_id ≤ 20 chars, capi_token ≤ 500 chars

---

## 4. API Security

### CORS
- Em produção: aceitar apenas domínio do app para APIs autenticadas
- Webhook `/api/webhook/[token]`: aceitar qualquer origem (Framer precisa POST de domínio externo)

### Rate Limiting
| Endpoint | Limite |
|----------|--------|
| `POST /login` | 5 req/min por IP |
| `GET /api/pixels` | 60 req/min |
| `POST /api/webhook/[token]` | 100 req/min por token (Framer retries) |

Implementar via Vercel Edge Config ou middleware simples com contador em memória.

### Security Headers (next.config.js)
```javascript
{
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=()',
}
```

---

## 5. Variáveis de Ambiente

```
# CLIENT (NEXT_PUBLIC_*) — expostos ao browser
NEXT_PUBLIC_SUPABASE_URL         ✅ seguro expor
NEXT_PUBLIC_SUPABASE_ANON_KEY    ✅ seguro expor (protegido por RLS)
NEXT_PUBLIC_APP_URL              ✅ seguro expor

# SERVER ONLY — NUNCA no client
SUPABASE_SERVICE_ROLE_KEY        ❌ apenas server/webhook handler
```

- `.env.local` no `.gitignore`
- Configurar vars no Vercel Dashboard (não commitar)
- CAPI tokens armazenados **no banco** (criptografados em produção [INFERIDO])

---

## 6. Dados & PII

**PII identificado:**
- `email` em `lead_submissions` — dado sensível
- `fbclid` — identificador de clique (não PII direto, mas rastreável)
- `capi_token` em `pixels` — credencial sensível

**Práticas:**
- Email hasheado com SHA256 antes de enviar ao Facebook (exigência da CAPI)
- `capi_token` nunca exposto em responses da API para o client
- Sem armazenamento de cartão ou senha (auth via Supabase)
- Soft delete não necessário (dados de campanha, retenção por pixel)

**LGPD:**
- Dados de leads são dados de terceiros coletados pelo usuário — responsabilidade do operador
- Plataforma provê DELETE em cascata ao deletar pixel

---

## 7. Webhook Security

O endpoint `POST /api/webhook/[token]` é público por design. Segurança por:

1. **Token UUID v4** — 2¹²² combinações, impredizível
2. **Idempotência** — `submission_id` previne replay attacks
3. **Rate limiting** — 100 req/min por token
4. **Sem execução de payload** — form_data salvo como JSONB raw

**Fase 2 (pós-MVP):** Validar `Framer-Signature` header (HMAC SHA256).

---

## 8. Checklist Pré-Deploy

- [ ] RLS ativo em todas as tabelas
- [ ] `SUPABASE_SERVICE_ROLE_KEY` apenas em server, nunca em `NEXT_PUBLIC_*`
- [ ] Zod validando todos os inputs de API routes
- [ ] Env vars configuradas no Vercel (não commitadas)
- [ ] CORS headers configurados
- [ ] Security headers no `next.config.js`
- [ ] Rate limiting no webhook endpoint
- [ ] Middleware protegendo rotas do dashboard
- [ ] Nenhum `console.log` com dados sensíveis em produção
- [ ] `.env.local` no `.gitignore`
- [ ] Errors retornam mensagens genéricas ao client (sem stack trace)
