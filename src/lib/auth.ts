// Simple auth for dashboard access

export interface AuthCredentials {
  username: string;
  password: string;
}

const DEFAULT_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};

export const auth = {
  getCredentials: (): AuthCredentials => {
    const stored = localStorage.getItem('uazapi_credentials');
    if (stored) {
      return JSON.parse(stored);
    }
    return DEFAULT_CREDENTIALS;
  },

  saveCredentials: (credentials: AuthCredentials) => {
    localStorage.setItem('uazapi_credentials', JSON.stringify(credentials));
  },

  login: (username: string, password: string): boolean => {
    const credentials = auth.getCredentials();
    if (username === credentials.username && password === credentials.password) {
      localStorage.setItem('uazapi_session', 'true');
      return true;
    }
    return false;
  },

  logout: () => {
    localStorage.removeItem('uazapi_session');
  },

  isAuthenticated: (): boolean => {
    return localStorage.getItem('uazapi_session') === 'true';
  },
};
