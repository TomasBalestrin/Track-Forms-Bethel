> 🕷️ Viúva Negra | 13/04/2026 | v1.0

# UX Flows — Lead Qualifier + Facebook Pixel

---

## 1. Mapa de Rotas

```
/ (público)
└── /login                          # Público — form email/senha

/(dashboard) (privado — requer auth)
├── /                               # Redirect → /pixels
└── /pixels
    ├── /                           # Lista de pixels (home do app)
    ├── /new                        # Criar novo pixel
    └── /[id]
        ├── /                       # Leads do pixel + webhook URL + snippet
        └── /config                 # Configurar regras de qualificação
```

**API Routes (não têm UI):**
```
/api/webhook/[token]    — público
/api/pixels/**          — privado
```

---

## 2. Navegação

### Sidebar (desktop — fixa 240px)
```
📡 Lead Qualifier
─────────────────
▣  Pixels
   ├── Pixel Aula Gratuita ●
   ├── Pixel Evento Ao Vivo
   └── + Novo Pixel
─────────────────
[Avatar] Sair
```

### Header
- Logo + nome do app (mobile)
- Botão hamburger → drawer (mobile)
- Botão "Sair" (desktop: no sidebar; mobile: no header)

### Mobile
- Sidebar vira drawer deslizante pela esquerda
- Overlay escuro ao abrir

---

## 3. Fluxos por Feature

### 3.1 — Login

```
[/login]
  │
  ├─ Usuário preenche email + senha → clica "Entrar"
  │    ├─ Loading no botão
  │    ├─ Erro → toast vermelho inline "Email ou senha incorretos"
  │    └─ Sucesso → redirect → [/pixels]
  │
  └─ Empty state: sem link de "Criar conta" (single-user)
```

**Elementos da tela:**
- Card centralizado, vertically + horizontally
- Logo + título "Lead Qualifier"
- Input: Email (type=email, required)
- Input: Senha (type=password, required)
- Botão "Entrar" (disabled até válido, loading state)
- Sem forgot password no MVP

---

### 3.2 — Lista de Pixels

```
[/pixels]
  │
  ├─ Carregando → skeleton 3 cards
  │
  ├─ Com pixels → grid de PixelCards
  │    └─ Cada card: nome, pixel_id, total leads, taxa qualificação, btn Ver Leads
  │
  ├─ Empty state → "Nenhum pixel cadastrado" + btn "Criar primeiro pixel"
  │
  └─ Botão "+ Novo Pixel" (fixo no header da página)
```

---

### 3.3 — Criar Pixel

```
[/pixels/new]
  │
  ├─ Formulário
  │    ├─ Nome (text, required)
  │    ├─ Pixel ID (text, required, placeholder "Ex: 1234567890123")
  │    ├─ CAPI Access Token (textarea, required, placeholder "EAAG...")
  │    └─ Btn "Criar Pixel"
  │
  ├─ Validação blur em cada campo
  ├─ Submit → loading no botão
  ├─ Erro → toast "Erro ao criar pixel"
  └─ Sucesso → redirect → [/pixels/[id]] com toast "Pixel criado!"
```

---

### 3.4 — Tela de Leads (principal)

```
[/pixels/[id]]
  │
  ├─ Header da página:
  │    ├─ Nome do pixel + Pixel ID (badge)
  │    ├─ Btn "Configurar Qualificação"
  │    └─ Btn "Editar" (nome/token)
  │
  ├─ Section: Webhook URL
  │    └─ Input readonly com URL + Btn "Copiar"
  │
  ├─ Section: Snippet JS
  │    └─ Code block colapsável + Btn "Copiar Snippet"
  │         + Link "Como instalar no Framer →"
  │
  ├─ Section: Leads
  │    ├─ Stats: Total / Qualificados / Enviados ao FB
  │    ├─ Filtro: [Todos] [Qualificados] [Não Qualificados]
  │    ├─ Tabela de leads (ver 3.4.1)
  │    └─ Paginação (50/página)
  │
  └─ Empty state leads: "Aguardando primeiras submissões"
       + instrução de colar webhook URL no Framer
```

**3.4.1 — Tabela de Leads:**
| Coluna | Descrição |
|--------|-----------|
| Data | Relativa ("há 2h") com tooltip absoluto |
| Email | Texto, truncado com ellipsis |
| Status | Badge: 🟢 Qualificado / 🔴 Não Qualificado / ⚪ Sem regras |
| FB | Badge: ✅ Enviado / — Não enviado |
| Campanha | utm_campaign truncado |
| ▼ | Expand row |

**Row expandida:**
```
┌──────────────────────────────────────┐
│ Respostas do Formulário              │
│ ─────────────────────────────────── │
│ Faturamento:     10k                 │
│ Segmento:        E-commerce          │
│ Tempo no mercado: 2 anos             │
│                                      │
│ Atribuição                           │
│ ─────────────────────────────────── │
│ fbclid:          IwAR... (truncado)  │
│ utm_source:      facebook            │
│ utm_medium:      paid                │
│ utm_campaign:    aula-gratuita-abr   │
│ utm_content:     video-1             │
└──────────────────────────────────────┘
```

---

### 3.5 — Configurar Qualificação

```
[Btn "Configurar Qualificação"] → abre Drawer lateral direito
  │
  ├─ Se 0 leads: "Aguardando primeiras submissões para configurar"
  │
  └─ Com leads:
       ├─ Título: "Configurar Qualificação — [nome do pixel]"
       ├─ Subtítulo: "Baseado nos primeiros 5 leads recebidos"
       │
       ├─ Para cada campo do form (exceto utms/fbclid/email):
       │    ┌────────────────────────────────────────┐
       │    │ Pergunta: "Faturamento"        [toggle ativo] │
       │    │ Marque as respostas qualificadas:              │
       │    │  ☐ 5k                                         │
       │    │  ☑ 10k                                        │
       │    │  ☑ 20k ou mais                                │
       │    └────────────────────────────────────────┘
       │
       ├─ Btn "Salvar Regras" (footer do drawer, sticky)
       ├─ Loading → "Salvando e requalificando..."
       └─ Sucesso → drawer fecha + toast "Regras salvas. 12 leads requalificados. 5 enviados ao Facebook."
```

---

## 4. Auth Flow

```
Acesso a qualquer rota /dashboard/**
    └─ Middleware verifica sessão
         ├─ Sessão válida → continua
         └─ Sem sessão → redirect /login?redirect=[rota]

Login bem-sucedido
    └─ redirect → /pixels (ou rota original via ?redirect=)

Logout
    └─ Supabase signOut → redirect /login
```

---

## 5. Onboarding (pós primeiro login)

Sem onboarding especial. Primeira tela = `/pixels` com empty state + botão "Criar primeiro pixel" que guia o fluxo naturalmente.

---

## 6. Padrões de Interação

### Forms
- Label acima do input
- Validação em `onBlur`
- Submit disabled até form válido
- Botão com loading state (spinner) durante submit
- Erro inline abaixo do campo (Zod message)

### Tabelas
- Busca debounce 300ms (futura feature)
- Filtros por badge clicável
- Sort por `created_at` (default DESC)
- Paginação com `Previous / Next` + indicador "Página 1 de 5"
- Row action: expand

### Modais vs Drawers
- **Modal:** confirmação de delete (< 3 elementos)
- **Drawer:** configuração de qualificação (formulário complexo)

### Feedback
- Toast sucesso: verde, 3 segundos, auto-dismiss
- Toast erro: vermelho, persistente, fechar manual
- Delete: `AlertDialog` com confirmação explícita ("Deletar pixel e todos os leads?")
- Copy to clipboard: botão muda para "Copiado ✓" por 2s

---

## 7. Responsividade

| Elemento | Desktop | Mobile |
|---------|---------|--------|
| Sidebar | Fixa lateral esquerda | Drawer hamburger |
| Tabela de leads | Todas colunas | Colunas: Email, Status, ▼ |
| Drawer qualificação | 480px lateral direito | Fullscreen |
| Stats cards | Linha horizontal | Grid 2x2 |

---

## 8. Acessibilidade

- Navegação por teclado em todos os elementos interativos
- ARIA labels em botões icon-only (ex: "Copiar webhook URL")
- Focus visible com ring (Tailwind `focus-visible:ring-2`)
- Skip to content link
- Contraste mínimo 4.5:1 para texto normal
- Loading states anunciados com `aria-live`

---

## 9. Empty States

| Tela | Empty State |
|------|------------|
| Lista de pixels | "Nenhum pixel ainda. Crie seu primeiro pixel para começar a receber leads." + btn |
| Lista de leads | "Nenhum lead recebido ainda. Cole o webhook URL no seu formulário Framer." + URL copiável |
| Lista filtrada (qualificados) | "Nenhum lead qualificado ainda. Configure as regras de qualificação." + btn config |
| Config qualificação sem leads | "Aguardando primeiras submissões para exibir as perguntas do formulário." |
