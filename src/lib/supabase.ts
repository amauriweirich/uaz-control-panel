// Cliente Supabase unificado - funciona com Lovable Cloud e Self-Hosted
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

// Detectar configuração disponível
const getConfig = () => {
  // 1. Variáveis de ambiente Vite (Lovable Cloud ou build com env vars)
  const viteUrl = import.meta.env.VITE_SUPABASE_URL;
  const viteKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (viteUrl && viteKey) {
    return { url: viteUrl, anonKey: viteKey };
  }

  // 2. Configuração runtime via window (Self-Hosted com docker-entrypoint)
  if (typeof window !== 'undefined') {
    const windowConfig = (window as any).__SUPABASE_CONFIG__;
    if (windowConfig?.url && windowConfig?.anonKey && 
        !windowConfig.url.includes('PLACEHOLDER') && 
        !windowConfig.anonKey.includes('PLACEHOLDER')) {
      return { url: windowConfig.url, anonKey: windowConfig.anonKey };
    }
  }

  return null;
};

export const getSupabaseClient = (): SupabaseClient => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const config = getConfig();
  
  if (!config) {
    throw new Error(
      'Supabase não configurado. Para self-hosting, configure SUPABASE_URL e SUPABASE_ANON_KEY no .env'
    );
  }

  supabaseInstance = createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storage: typeof window !== 'undefined' ? localStorage : undefined,
    },
  });

  return supabaseInstance;
};

// Export para uso direto
export const supabase = getSupabaseClient();
