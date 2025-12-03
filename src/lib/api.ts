// UAZAPI Service - WhatsApp API v2.0
import { supabase } from '@/integrations/supabase/client';

export interface Instance {
  id: string;
  name: string;
  token: string;
  status: 'connected' | 'disconnected' | 'connecting';
  phone?: string;
  paircode?: string;
  qrcode?: string;
  profileName?: string;
  profilePicUrl?: string;
  isBusiness?: boolean;
  plataform?: string;
  systemName?: string;
  owner?: string;
  lastDisconnect?: string;
  lastDisconnectReason?: string;
  adminField01?: string;
  adminField02?: string;
  created?: string;
  updated?: string;
}

export interface ApiConfig {
  baseUrl: string;
  adminToken: string;
}

export interface InstanceStatus {
  instance: Instance;
  status: {
    connected: boolean;
    loggedIn: boolean;
    jid?: {
      user: string;
      server: string;
    };
  };
}

// Cache for API config to avoid multiple DB calls
let configCache: ApiConfig | null = null;
let configCacheTime = 0;
const CACHE_TTL = 30000; // 30 seconds

const getConfig = async (): Promise<ApiConfig> => {
  // Check cache
  if (configCache && Date.now() - configCacheTime < CACHE_TTL) {
    return configCache;
  }

  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['api_base_url', 'api_admin_token']);

    if (error || !data) {
      console.error('Error fetching API config:', error);
      return { baseUrl: 'https://free.uazapi.com', adminToken: '' };
    }

    const config: ApiConfig = {
      baseUrl: 'https://free.uazapi.com',
      adminToken: ''
    };

    data.forEach((item) => {
      if (item.setting_key === 'api_base_url') {
        config.baseUrl = item.setting_value;
      } else if (item.setting_key === 'api_admin_token') {
        config.adminToken = item.setting_value;
      }
    });

    // Update cache
    configCache = config;
    configCacheTime = Date.now();

    return config;
  } catch (error) {
    console.error('Error fetching API config:', error);
    return { baseUrl: 'https://free.uazapi.com', adminToken: '' };
  }
};

// Invalidate cache when settings are updated
export const invalidateConfigCache = () => {
  configCache = null;
  configCacheTime = 0;
};

// Headers para endpoints administrativos (criar/listar instâncias)
const getAdminHeaders = async () => {
  const config = await getConfig();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  if (config.adminToken) {
    headers['admintoken'] = config.adminToken;
  }
  return headers;
};

// Headers para endpoints de instância específica
const getInstanceHeaders = (instanceToken: string) => {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'token': instanceToken,
  };
};

export const api = {
  getConfig,
  invalidateConfigCache,

  // ==================== ADMINISTRAÇÃO ====================
  // Requer: admintoken header

  getAllInstances: async (): Promise<Instance[]> => {
    const config = await getConfig();
    const headers = await getAdminHeaders();
    const response = await fetch(`${config.baseUrl}/instance/all`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Falha ao listar instâncias');
    }
    return response.json();
  },

  createInstance: async (data: { 
    name: string; 
    systemName?: string; 
    adminField01?: string; 
    adminField02?: string;
  }): Promise<{ instance: Instance; token: string }> => {
    const config = await getConfig();
    const headers = await getAdminHeaders();
    const response = await fetch(`${config.baseUrl}/instance/init`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Falha ao criar instância');
    }
    return response.json();
  },

  // ==================== INSTÂNCIA ====================
  // Requer: token header (token da instância)

  connectInstance: async (instanceToken: string, phone?: string) => {
    const config = await getConfig();
    const response = await fetch(`${config.baseUrl}/instance/connect`, {
      method: 'POST',
      headers: getInstanceHeaders(instanceToken),
      body: JSON.stringify({ phone }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Falha ao conectar instância');
    }
    return response.json();
  },

  disconnectInstance: async (instanceToken: string) => {
    const config = await getConfig();
    const response = await fetch(`${config.baseUrl}/instance/disconnect`, {
      method: 'POST',
      headers: getInstanceHeaders(instanceToken),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Falha ao desconectar instância');
    }
    return response.json();
  },

  getInstanceStatus: async (instanceToken: string): Promise<InstanceStatus> => {
    const config = await getConfig();
    const response = await fetch(`${config.baseUrl}/instance/status`, {
      method: 'GET',
      headers: getInstanceHeaders(instanceToken),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Falha ao verificar status');
    }
    return response.json();
  },

  getQRCode: async (instanceToken: string) => {
    const config = await getConfig();
    const response = await fetch(`${config.baseUrl}/instance/qrcode`, {
      method: 'GET',
      headers: getInstanceHeaders(instanceToken),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Falha ao obter QR Code');
    }
    return response.json();
  },
};
