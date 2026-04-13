# Claude Design System — Blue & Gold
> v2.1 · Azul primário · Dourado como detalhe · Dark mode cinza quente · Sidebar P&B

---

## Sumário

1. [Paleta de Cores](#paleta-de-cores)
   - [Azul — Primário](#azul--primário)
   - [Dourado — Detalhe Premium](#dourado--detalhe-premium)
   - [Cinza Quente — Dark Mode](#cinza-quente--dark-mode)
   - [Status](#status)
2. [Fundamentos](#fundamentos)
   - [Tipografia](#tipografia)
   - [Espaçamento](#espaçamento)
   - [Border Radius](#border-radius)
   - [Sombras](#sombras)
3. [Tokens CSS](#tokens-css)
4. [Componentes](#componentes)
   - [Botões](#botões)
   - [Inputs](#inputs)
   - [Badges & Tags](#badges--tags)
   - [Avatares](#avatares)
   - [Cards](#cards)
   - [Alertas](#alertas)

---

## Paleta de Cores

### Azul — Primário
> Uso: CTAs, links, foco, estados interativos

| Token | Hex | Descrição |
|-------|-----|-----------|
| `blue-50` | `#EEF3FB` | Fundo sutil |
| `blue-100` | `#D5E3F5` | |
| `blue-200` | `#ADC7EB` | Borda sutil |
| `blue-300` | `#7EAADF` | |
| `blue-400` | `#5A8DD4` | Dark mode primary |
| `blue-500` ★ | `#3D6EBF` | **Primário — uso principal** |
| `blue-600` | `#2F5A9E` | Hover |
| `blue-700` | `#24487E` | Texto em fundo claro |
| `blue-800` | `#1A365E` | |
| `blue-900` | `#112440` | |
| `blue-950` | `#0A1628` | |

---

### Dourado — Detalhe Premium
> Uso: premium, upgrade, detalhe especial — usar com moderação

| Token | Hex | Descrição |
|-------|-----|-----------|
| `gold-50` | `#FAF6EF` | Fundo sutil |
| `gold-100` | `#F2E8D4` | |
| `gold-200` | `#E4CFA6` | Borda sutil |
| `gold-300` | `#D4B478` | |
| `gold-400` | `#C4A068` | Dark mode gold |
| `gold-500` ★ | `#B19365` | **Principal** |
| `gold-600` | `#957A50` | Hover |
| `gold-700` | `#78613D` | Texto em fundo claro |
| `gold-800` | `#5A472C` | |
| `gold-900` | `#3C2E1B` | |

---

### Cinza Quente — Dark Mode
> Paleta original do Claude: Pampas, Cloudy e escala warm — base do dark mode

| Token | Hex | Descrição |
|-------|-----|-----------|
| `warm-50` | `#faf9f5` | |
| `warm-100` ★ | `#f4f3ee` | **Pampas** |
| `warm-200` | `#ece9e0` | |
| `warm-300` | `#d1ccc4` | |
| `warm-400` ★ | `#b1ada1` | **Cloudy** |
| `warm-500` | `#918d84` | |
| `warm-600` | `#726e67` | |
| `warm-700` | `#57534d` | |
| `warm-800` | `#3d3a35` | |
| `warm-900` | `#2a2723` | |
| `warm-950` ★ | `#1a1815` | **Base dark mode** |

---

### Status

| Variante | Cor de fundo | Borda | Texto | Uso |
|----------|-------------|-------|-------|-----|
| Sucesso | `#dcfce7` | `rgba(34,197,94,.3)` | `#15803d` | Ação concluída |
| Aviso | `#fef9c3` | `rgba(234,179,8,.3)` | `#a16207` | Requer atenção |
| Erro | `#fee2e2` | `rgba(239,68,68,.3)` | `#b91c1c` | Ação falhou |
| Info | `var(--pri-bg)` | `var(--pri-bd)` | `var(--pri-tx)` | Informação |

> **Dark mode:** todas as cores de status usam `rgba` com opacidade reduzida (~10%) e textos mais claros (`#86efac`, `#fde047`, `#fca5a5`).

---

## Fundamentos

### Tipografia
> Fontes: **Plus Jakarta Sans** (display e corpo) + **JetBrains Mono** (código)

| Variante | Tamanho | Peso | Uso |
|----------|---------|------|-----|
| `display` | 52px | 800 | Hero, destaque máximo |
| `h1` | 36px | 700 | Título da página |
| `h2` | 24px | 700 | Título de seção |
| `h3` | 18px | 600 | Subtítulo de card |
| `body` | 16px | 400 | Corpo de texto, `line-height: 1.65` |
| `body sm` | 14px | 400 | Textos secundários, metadados |
| `label` | 11px | 700 | Labels de seção, `uppercase`, `letter-spacing: .08em` |
| `mono` | 13px | 400 | Código, tokens — JetBrains Mono |

---

### Espaçamento
> Base: **4px**

| Token | Valor |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |
| `--space-16` | 64px |
| `--space-24` | 96px |
| `--space-32` | 128px |

---

### Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `none` | 0 | |
| `sm` | 4px | |
| `md` | 6px | |
| `base` | 8px | Inputs, botões pequenos |
| `lg` | 12px | Cards, modais |
| `xl` | 16px | |
| `2xl` | 20px | |
| `full` | 9999px | Badges, avatares, pills |

---

### Sombras

| Nome | Valor | Uso |
|------|-------|-----|
| `--sh-sm` | `0 1px 3px rgba(0,0,0,.07), 0 1px 2px rgba(0,0,0,.04)` | Cards, elementos sutis |
| `--sh-md` | `0 4px 8px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.04)` | Dropdowns |
| `--sh-lg` | `0 12px 28px rgba(0,0,0,.09), 0 4px 8px rgba(0,0,0,.05)` | Modais, overlays |
| `--sh-bl` | `0 3px 14px rgba(61,110,191,.20), 0 1px 3px rgba(61,110,191,.11)` | **Glow azul** — botão primário |
| `--sh-gl` | `0 3px 14px rgba(177,147,101,.26), 0 1px 3px rgba(177,147,101,.13)` | **Glow dourado** — botão premium |
| `--focus` | `0 0 0 2px #fff, 0 0 0 4px var(--blue-400)` | Focus ring acessível |

---

## Tokens CSS

> Variáveis semânticas — adaptam automaticamente ao tema ativo (`light` / `dark`).

### Superfícies & Backgrounds

| Token | Light | Dark | Descrição |
|-------|-------|------|-----------|
| `--bg` | `#F2F4F8` | `#1a1815` | Fundo da página |
| `--bg-s` | `#E8EBF2` | `warm-900` | Fundo secundário |
| `--bg-m` | `#DDE1EA` | `warm-800` | Fundo terciário |
| `--surf` | `#FFFFFF` | `#252320` | Cards e painéis |
| `--surf-low` | `#F4F5F8` | `#1f1d1a` | Inputs, code blocks |

### Bordas

| Token | Light | Dark | Descrição |
|-------|-------|------|-----------|
| `--bdr` | `#CDD0D8` | `#3d3a35` | Borda padrão |
| `--bdr-s` | `#E4E6EC` | `#2e2b27` | Borda sutil |
| `--bdr-h` | `#9CA3AF` | `#524e48` | Borda hover |

### Texto

| Token | Light | Dark | Descrição |
|-------|-------|------|-----------|
| `--tx` | `#0D1117` | `#f4f3ee` | Texto primário |
| `--tx2` | `#374151` | `warm-300` | Texto secundário |
| `--tx3` | `#6B7280` | `warm-500` | Texto terciário |
| `--tx4` | `#9CA3AF` | `warm-600` | Placeholder / muted |

### Cor Primária (Azul)

| Token | Light | Dark |
|-------|-------|------|
| `--pri` | `blue-500` | `blue-400` |
| `--pri-h` | `blue-600` | `blue-300` |
| `--pri-bg` | `blue-50` | `rgba(61,110,191,.13)` |
| `--pri-mu` | `blue-100` | `rgba(61,110,191,.20)` |
| `--pri-tx` | `blue-700` | `blue-300` |
| `--pri-bd` | `blue-200` | `rgba(61,110,191,.30)` |

### Cor Dourada (Gold)

| Token | Light | Dark |
|-------|-------|------|
| `--gld` | `gold-500` | `gold-400` |
| `--gld-h` | `gold-600` | `gold-300` |
| `--gld-bg` | `gold-50` | `rgba(177,147,101,.11)` |
| `--gld-mu` | `gold-100` | `rgba(177,147,101,.18)` |
| `--gld-tx` | `gold-700` | `gold-300` |
| `--gld-bd` | `gold-200` | `rgba(177,147,101,.28)` |

### Exemplo de uso

```css
/* Azul — ação principal */
.btn-primary { background: var(--pri); box-shadow: var(--sh-bl); }

/* Dourado — somente para premium/detalhe */
.badge-pro    { background: var(--gld-mu); color: var(--gld-tx); }
.card-premium { border-top: 3px solid var(--gld); }

/* Dark mode: cinza quente original do Claude */
[data-theme="dark"] { --bg: #1a1815; --surf: #252320; }
```

---

## Componentes

### Botões

> Azul para ações principais · Dourado apenas para upgrade/premium

#### Variantes

| Classe | Descrição | Background | Cor | Borda |
|--------|-----------|-----------|-----|-------|
| `.b-pri` | **Primário** | `blue-500` | `#fff` | `blue-500` + `--sh-bl` |
| `.b-sec` | Secundário | `--surf` | `--tx` | `--bdr` |
| `.b-gho` | Ghost | `transparent` | `--tx2` | nenhuma |
| `.b-gld` | **Premium** | `gold-500` | `#fff` | `gold-500` + `--sh-gl` |
| `.b-out` | Outline dourado | `transparent` | `--gld` | `--gld-bd` |
| `.b-dan` | Destrutivo | `#dc2626` | `#fff` | `#dc2626` |

#### Tamanhos

| Classe | Altura | Padding | Font-size | Radius |
|--------|--------|---------|-----------|--------|
| `.btn-sm` | 30px | 0 12px | 12px | 7px |
| `.btn` (base) | 38px | 0 16px | 13.5px | 9px |
| `.btn-lg` | 46px | 0 22px | 15px | 11px |

---

### Inputs

> Focus ring azul padrão: `border-color: blue-500 + box-shadow: 0 0 0 3px rgba(61,110,191,.13)`

**Tipos suportados:**
- Input texto padrão (`width: 220px`)
- Input email
- Input com ícone prefixado (search)
- Input + botão inline (URL)
- Textarea com `resize: vertical`

**Estilo base:**
```css
.inp {
  height: 38px;
  padding: 0 12px;
  border-radius: 8px;
  background: var(--inp-bg);
  border: 1px solid var(--inp-bd);
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  color: var(--tx);
}
.inp:focus {
  border-color: var(--blue-500);
  box-shadow: 0 0 0 3px rgba(61,110,191,.13);
}
```

---

### Badges & Tags

> Dourado **somente** para Pro/premium

#### Badges

| Classe | Background | Texto | Uso |
|--------|-----------|-------|-----|
| `.bdg-bl` | `--pri-mu` | `--pri-tx` | Primário |
| `.bdg-gr` | `#dcfce7` | `#15803d` | Ativo |
| `.bdg-ye` | `#fef9c3` | `#a16207` | Pendente |
| `.bdg-re` | `#fee2e2` | `#b91c1c` | Inativo |
| `.bdg-gy` | `--bg-s` | `--tx3` | Rascunho |
| `.bdg-gd` | `--gld-mu` | `--gld-tx` | ★ Pro/Premium |

**Estilo base:** `height: 21px`, `padding: 0 8px`, `border-radius: 99px`, `font-size: 11px`, `font-weight: 700`

#### Tags (removíveis)

```html
<span class="tag">Design<span class="tx">×</span></span>
```

Estilo base: `height: 26px`, `border-radius: 6px`, `font-size: 12px`

---

### Avatares

| Classe | Tamanho | Font |
|--------|---------|------|
| `.av-sm` | 28×28px | 11px |
| `.av-md` | 38×38px | 14px |
| `.av-lg` | 48×48px | 17px |

#### Variantes de cor

| Classe | Background | Texto |
|--------|-----------|-------|
| `.av-bl` | `--pri-mu` | `--pri-tx` |
| `.av-gl` | `--gld-mu` | `--gld-tx` |
| `.av-gy` | `--bg-m` | `--tx3` |

**Avatar stack (sobreposição):**
```html
<div class="av av-md av-bl" style="border: 2px solid var(--bg); margin-right: -10px; z-index: 3">BS</div>
<div class="av av-md av-gl" style="border: 2px solid var(--bg); margin-right: -10px; z-index: 2">JO</div>
<div class="av av-md av-gy" style="border: 2px solid var(--bg); z-index: 1; font-size: 11px">+4</div>
```

---

### Cards

> Linha de topo azul (padrão) ou dourada (premium)

```css
.card {
  background: var(--surf);
  border: 1px solid var(--bdr);
  border-radius: 13px;
  box-shadow: var(--sh-sm);
}

/* Linha de topo colorida */
.card-tl::before { content: ''; display: block; height: 3px; }
.ctl-bl::before  { background: var(--blue-500); }  /* padrão */
.ctl-gl::before  { background: var(--gold-500); }  /* premium */
```

---

### Alertas

| Classe | Background | Borda | Texto | Ícone |
|--------|-----------|-------|-------|-------|
| `.al-gr` | `#dcfce7` | `rgba(34,197,94,.3)` | `#15803d` | ✓ Sucesso |
| `.al-ye` | `#fef9c3` | `rgba(234,179,8,.3)` | `#a16207` | ⚠ Aviso |
| `.al-re` | `#fee2e2` | `rgba(239,68,68,.3)` | `#b91c1c` | ✕ Erro |
| `.al-bl` | `--pri-bg` | `--pri-bd` | `--pri-tx` | ℹ Info |

---

## Regras Gerais

- **Azul** é a cor de ação padrão — CTAs, foco, links, estados interativos.
- **Dourado** é reservado exclusivamente para upgrade, premium e destaques especiais. Nunca usar como cor primária de ação.
- **Dark mode** usa a paleta **cinza quente** original do Claude (`warm-*`) — nunca cinza frio.
- O **focus ring** sempre usa double border: `0 0 0 2px #fff, 0 0 0 4px var(--blue-400)`.
- Todas as superfícies utilizam tokens semânticos (`--surf`, `--bg`, `--bdr`) para suporte automático ao tema.
