// UAZAPI Service - WhatsApp API v2.0

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

const getConfig = (): ApiConfig => {
  const stored = localStorage.getItem('uazapi_config');
  if (stored) {
    return JSON.parse(stored);
  }
  return { baseUrl: 'https://free.uazapi.com', adminToken: '' };
};

// Headers para endpoints administrativos (criar/listar instâncias)
const getAdminHeaders = () => {
  const config = getConfig();
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
  
  saveConfig: (config: ApiConfig) => {
    localStorage.setItem('uazapi_config', JSON.stringify(config));
  },

  // ==================== ADMINISTRAÇÃO ====================
  // Requer: admintoken header

  getAllInstances: async (): Promise<Instance[]> => {
    const config = getConfig();
    const response = await fetch(`${config.baseUrl}/instance/all`, {
      method: 'GET',
      headers: getAdminHeaders(),
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
    const config = getConfig();
    const response = await fetch(`${config.baseUrl}/instance/init`, {
      method: 'POST',
      headers: getAdminHeaders(),
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
    const config = getConfig();
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
    const config = getConfig();
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
    const config = getConfig();
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
    const config = getConfig();
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
