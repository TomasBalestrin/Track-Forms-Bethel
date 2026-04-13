export const TRACKED_PARAMS = [
  "fbclid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

/**
 * Gera o snippet JS que:
 * - lê fbclid e UTMs da URL na primeira visita,
 * - guarda em sessionStorage (persistência entre páginas),
 * - injeta nos hidden inputs do formulário do Framer (name="fbclid" etc).
 *
 * Colar no Framer em "Custom Code → Head" ou "Code Component".
 */
export function generateSnippet(): string {
  return `<!-- Lead Qualifier — captura UTMs e fbclid -->
<script>
(function () {
  var params = new URLSearchParams(window.location.search);
  var keys = ${JSON.stringify(TRACKED_PARAMS)};
  keys.forEach(function (k) {
    var v = params.get(k);
    if (v) {
      try { sessionStorage.setItem('lq_' + k, v); } catch (e) {}
    }
  });
  function hydrateHiddenFields() {
    keys.forEach(function (k) {
      var value = '';
      try { value = sessionStorage.getItem('lq_' + k) || ''; } catch (e) {}
      var fields = document.querySelectorAll('[name="' + k + '"]');
      for (var i = 0; i < fields.length; i++) {
        fields[i].value = value;
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrateHiddenFields);
  } else {
    hydrateHiddenFields();
  }
})();
</script>`;
}

/**
 * Monta a URL pública do webhook com base no APP_URL e token do pixel.
 */
export function buildWebhookUrl(webhookToken: string, appUrl?: string): string {
  const base = (appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "").replace(
    /\/$/,
    ""
  );
  return `${base}/api/webhook/${webhookToken}`;
}
