// Cliente de Supabase, usando la librería vía CDN (cargada en index.html como `supabase`).
let _client = null;
let _configurado = false;

function getSupabaseClient() {
  if (_client) return _client;

  const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.ROPERO_CONFIG || {};
  const faltaConfig =
    !SUPABASE_URL ||
    !SUPABASE_ANON_KEY ||
    SUPABASE_URL.includes("PEGA_ACA") ||
    SUPABASE_ANON_KEY.includes("PEGA_ACA");

  if (faltaConfig) {
    _configurado = false;
    return null;
  }

  _client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  _configurado = true;
  return _client;
}

function supabaseConfigurado() {
  getSupabaseClient();
  return _configurado;
}
