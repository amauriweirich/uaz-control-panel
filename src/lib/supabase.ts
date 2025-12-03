// Cliente Supabase unificado - funciona com Lovable Cloud, Self-Hosted e User-Configured
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

// Check for user-configured Supabase (localStorage)
const getStoredConfig = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('supabase_config');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
  }
  return null;
};

// Detectar configuração disponível
const getConfig = () => {
  // 1. Configuração do usuário via localStorage (prioridade máxima)
  const storedConfig = getStoredConfig();
  if (storedConfig?.url && storedConfig?.anonKey) {
    return { url: storedConfig.url, anonKey: storedConfig.anonKey };
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

  // 3. Variáveis de ambiente Vite (Lovable Cloud ou build com env vars)
  const viteUrl = import.meta.env.VITE_SUPABASE_URL;
  const viteKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (viteUrl && viteKey) {
    return { url: viteUrl, anonKey: viteKey };
  }

  return null;
};

// Verifica se o Supabase está configurado
export const isConfigured = (): boolean => {
  return getConfig() !== null;
};

// Reseta a instância (útil após reconfiguração)
export const resetSupabaseClient = () => {
  supabaseInstance = null;
};

export const getSupabaseClient = (): SupabaseClient => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const config = getConfig();
  
  if (!config) {
    throw new Error(
      'Supabase não configurado. Configure na página de setup.'
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

// Export para uso direto (lazy initialization)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabaseClient() as any)[prop];
  },
});
