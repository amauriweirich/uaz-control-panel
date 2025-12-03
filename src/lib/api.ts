// UAZAPI Service

export interface Instance {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'qr_code';
  phone?: string;
  systemName?: string;
  adminField01?: string;
  adminField02?: string;
  qrCode?: string;
}

export interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
}

const getConfig = (): ApiConfig => {
  const stored = localStorage.getItem('uazapi_config');
  if (stored) {
    return JSON.parse(stored);
  }
  return { baseUrl: 'https://free.uazapi.com' };
};

const getHeaders = () => {
  const config = getConfig();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }
  return headers;
};

export const api = {
  getConfig,
  
  saveConfig: (config: ApiConfig) => {
    localStorage.setItem('uazapi_config', JSON.stringify(config));
  },

  getAllInstances: async (): Promise<Instance[]> => {
    const config = getConfig();
    const response = await fetch(`${config.baseUrl}/instance/all`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Falha ao listar instâncias');
    return response.json();
  },

  createInstance: async (data: { name: string; systemName?: string; adminField01?: string; adminField02?: string }) => {
    const config = getConfig();
    const response = await fetch(`${config.baseUrl}/instance/init`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Falha ao criar instância');
    return response.json();
  },

  connectInstance: async (instanceId: string, phone?: string) => {
    const config = getConfig();
    const response = await fetch(`${config.baseUrl}/instance/connect`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'instance-id': instanceId,
      },
      body: JSON.stringify({ phone }),
    });
    if (!response.ok) throw new Error('Falha ao conectar instância');
    return response.json();
  },

  disconnectInstance: async (instanceId: string) => {
    const config = getConfig();
    const response = await fetch(`${config.baseUrl}/instance/disconnect`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'instance-id': instanceId,
      },
    });
    if (!response.ok) throw new Error('Falha ao desconectar instância');
    return response.json();
  },

  getInstanceStatus: async (instanceId: string) => {
    const config = getConfig();
    const response = await fetch(`${config.baseUrl}/instance/status`, {
      method: 'GET',
      headers: {
        ...getHeaders(),
        'instance-id': instanceId,
      },
    });
    if (!response.ok) throw new Error('Falha ao verificar status');
    return response.json();
  },

  getQRCode: async (instanceId: string) => {
    const config = getConfig();
    const response = await fetch(`${config.baseUrl}/instance/qrcode`, {
      method: 'GET',
      headers: {
        ...getHeaders(),
        'instance-id': instanceId,
      },
    });
    if (!response.ok) throw new Error('Falha ao obter QR Code');
    return response.json();
  },
};
