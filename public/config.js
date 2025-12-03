// Configuração runtime para Self-Hosted
// Este arquivo é substituído pelo docker-entrypoint no deploy
window.__SUPABASE_CONFIG__ = {
  // URL do Supabase (Kong API Gateway)
  url: 'SUPABASE_URL_PLACEHOLDER',
  // Chave anônima do Supabase
  anonKey: 'SUPABASE_ANON_KEY_PLACEHOLDER',
};
