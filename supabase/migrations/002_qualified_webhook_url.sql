-- ============================================================
-- Migration 002 — Qualified webhook URL
-- Campo opcional para despachar leads qualificados a um
-- webhook externo, além do Facebook CAPI.
-- ============================================================

ALTER TABLE pixels
  ADD COLUMN IF NOT EXISTS qualified_webhook_url TEXT;
