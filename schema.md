> 💚 Hulk | 13/04/2026 | v1.0

# Schema — Lead Qualifier + Facebook Pixel

---

## 1. Diagrama de Relacionamentos

```
auth.users 1──N pixels
pixels     1──N lead_submissions
pixels     1──N qualification_rules
```

---

## 2. Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 3. Enums

```sql
-- Sem enums necessários na v1
```

---

## 4. Tabelas

```sql
-- ============================================================
-- FUNCTION: update_updated_at (reutilizável)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE: pixels
-- ============================================================
CREATE TABLE pixels (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  pixel_id        TEXT NOT NULL,
  capi_token      TEXT NOT NULL,
  webhook_token   UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER pixels_updated_at
  BEFORE UPDATE ON pixels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLE: lead_submissions
-- ============================================================
CREATE TABLE lead_submissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pixel_id        UUID NOT NULL REFERENCES pixels(id) ON DELETE CASCADE,
  email           TEXT,
  form_data       JSONB NOT NULL DEFAULT '{}',
  fbclid          TEXT,
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,
  utm_content     TEXT,
  utm_term        TEXT,
  submission_id   TEXT UNIQUE,  -- Framer-Webhook-Submission-Id
  is_qualified    BOOLEAN NOT NULL DEFAULT FALSE,
  fb_sent_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER lead_submissions_updated_at
  BEFORE UPDATE ON lead_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLE: qualification_rules
-- ============================================================
CREATE TABLE qualification_rules (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pixel_id          UUID NOT NULL REFERENCES pixels(id) ON DELETE CASCADE,
  field_name        TEXT NOT NULL,
  qualified_values  TEXT[] NOT NULL DEFAULT '{}',
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(pixel_id, field_name)
);

CREATE TRIGGER qualification_rules_updated_at
  BEFORE UPDATE ON qualification_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 5. Indexes

```sql
-- pixels: busca por webhook_token (endpoint público mais chamado)
CREATE INDEX idx_pixels_webhook_token ON pixels(webhook_token);

-- pixels: listagem por user
CREATE INDEX idx_pixels_user_id ON pixels(user_id);

-- lead_submissions: listagem por pixel + ordenação por data
CREATE INDEX idx_leads_pixel_id ON lead_submissions(pixel_id);
CREATE INDEX idx_leads_pixel_created ON lead_submissions(pixel_id, created_at DESC);

-- lead_submissions: deduplicação por email + pixel
CREATE INDEX idx_leads_pixel_email ON lead_submissions(pixel_id, email);

-- lead_submissions: filtro por qualificação
CREATE INDEX idx_leads_is_qualified ON lead_submissions(pixel_id, is_qualified);

-- lead_submissions: busca por submission_id (idempotência)
CREATE INDEX idx_leads_submission_id ON lead_submissions(submission_id);

-- qualification_rules: busca por pixel
CREATE INDEX idx_rules_pixel_id ON qualification_rules(pixel_id);
```

---

## 6. RLS

```sql
-- ============================================================
-- RLS: pixels
-- ============================================================
ALTER TABLE pixels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pixels_select_own"
  ON pixels FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "pixels_insert_own"
  ON pixels FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "pixels_update_own"
  ON pixels FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "pixels_delete_own"
  ON pixels FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- RLS: lead_submissions
-- Acesso via pixel → verifica user_id do pixel pai
-- ============================================================
ALTER TABLE lead_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_select_via_pixel"
  ON lead_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pixels
      WHERE pixels.id = lead_submissions.pixel_id
        AND pixels.user_id = auth.uid()
    )
  );

CREATE POLICY "leads_insert_service"
  ON lead_submissions FOR INSERT
  WITH CHECK (TRUE);
-- OBS: INSERT feito via service_role no webhook (server-side), RLS bypassed.
-- Produção: usar service_role key apenas no server. Nunca no client.

CREATE POLICY "leads_update_via_pixel"
  ON lead_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM pixels
      WHERE pixels.id = lead_submissions.pixel_id
        AND pixels.user_id = auth.uid()
    )
  );

-- ============================================================
-- RLS: qualification_rules
-- ============================================================
ALTER TABLE qualification_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rules_select_via_pixel"
  ON qualification_rules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pixels
      WHERE pixels.id = qualification_rules.pixel_id
        AND pixels.user_id = auth.uid()
    )
  );

CREATE POLICY "rules_insert_via_pixel"
  ON qualification_rules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pixels
      WHERE pixels.id = qualification_rules.pixel_id
        AND pixels.user_id = auth.uid()
    )
  );

CREATE POLICY "rules_update_via_pixel"
  ON qualification_rules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM pixels
      WHERE pixels.id = qualification_rules.pixel_id
        AND pixels.user_id = auth.uid()
    )
  );

CREATE POLICY "rules_delete_via_pixel"
  ON qualification_rules FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM pixels
      WHERE pixels.id = qualification_rules.pixel_id
        AND pixels.user_id = auth.uid()
    )
  );
```

---

## 7. Views

```sql
-- View: pixels com contagem de leads e taxa de qualificação
CREATE OR REPLACE VIEW pixel_stats AS
SELECT
  p.id,
  p.user_id,
  p.name,
  p.pixel_id,
  p.webhook_token,
  p.created_at,
  COUNT(ls.id) AS total_leads,
  COUNT(ls.id) FILTER (WHERE ls.is_qualified = TRUE) AS qualified_leads,
  COUNT(ls.id) FILTER (WHERE ls.fb_sent_at IS NOT NULL) AS fb_sent_count,
  CASE
    WHEN COUNT(ls.id) > 0
    THEN ROUND(COUNT(ls.id) FILTER (WHERE ls.is_qualified = TRUE)::numeric / COUNT(ls.id) * 100, 1)
    ELSE 0
  END AS qualification_rate
FROM pixels p
LEFT JOIN lead_submissions ls ON ls.pixel_id = p.id
GROUP BY p.id;
```

---

## 8. Seed (dev)

```sql
-- Criar usuário admin manualmente no Supabase Auth Dashboard
-- Inserir pixel de teste após criar usuário:

-- INSERT INTO pixels (user_id, name, pixel_id, capi_token)
-- VALUES (
--   '<USER_ID_DO_SUPABASE_AUTH>',
--   'Pixel Teste',
--   '1234567890',
--   'EAAG...'
-- );
```

---

## 9. Migration Order

1. Extensions (`uuid-ossp`)
2. Function `update_updated_at`
3. Table `pixels` + trigger + indexes
4. Table `lead_submissions` + trigger + indexes
5. Table `qualification_rules` + trigger + indexes
6. RLS policies (todas)
7. View `pixel_stats`
8. Seed (somente dev)
