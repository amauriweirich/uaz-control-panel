import { supabase } from '@/lib/supabase';

export interface AppSettings {
  api_base_url: string;
  api_admin_token: string;
  app_name: string;
  company_name: string;
  logo_url?: string;
}

// Helper to mask sensitive values
export const maskSensitiveValue = (value: string, visibleChars: number = 4): string => {
  if (!value || value.length <= visibleChars) return '****';
  return '*'.repeat(value.length - visibleChars) + value.slice(-visibleChars);
};

// Check if value is masked (contains only asterisks at start)
export const isMaskedValue = (value: string): boolean => {
  return value.startsWith('*');
};

export const settingsService = {
  // Get all settings
  getSettings: async (): Promise<AppSettings> => {
    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_key, setting_value, is_sensitive');
    
    if (error) {
      console.error('Error fetching settings:', error);
      return getDefaultSettings();
    }

    const settings: AppSettings = getDefaultSettings();
    
    data?.forEach((item) => {
      const key = item.setting_key as keyof AppSettings;
      if (key in settings) {
        // Mask sensitive values when reading
        const value = item.is_sensitive && item.setting_value 
          ? maskSensitiveValue(item.setting_value)
          : item.setting_value;
        
        if (key === 'logo_url') {
          settings[key] = value || undefined;
        } else {
          settings[key] = value;
        }
      }
    });

    return settings;
  },

  // Get raw settings (unmasked) - for internal use only
  getRawSettings: async (): Promise<AppSettings> => {
    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_key, setting_value');
    
    if (error) {
      console.error('Error fetching raw settings:', error);
      return getDefaultSettings();
    }

    const settings: AppSettings = getDefaultSettings();
    
    data?.forEach((item) => {
      const key = item.setting_key as keyof AppSettings;
      if (key in settings) {
        if (key === 'logo_url') {
          settings[key] = item.setting_value || undefined;
        } else {
          settings[key] = item.setting_value;
        }
      }
    });

    return settings;
  },

  // Save a single setting
  saveSetting: async (key: string, value: string, isSensitive: boolean = false): Promise<boolean> => {
    // Don't save masked values
    if (isMaskedValue(value)) {
      return true;
    }

    const { error } = await supabase
      .from('app_settings')
      .upsert({
        setting_key: key,
        setting_value: value,
        is_sensitive: isSensitive,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'setting_key'
      });

    if (error) {
      console.error('Error saving setting:', error);
      return false;
    }

    return true;
  },

  // Save multiple settings
  saveSettings: async (settings: Partial<AppSettings>): Promise<boolean> => {
    const sensitiveKeys = ['api_admin_token'];
    const entries = Object.entries(settings);
    
    for (const [key, value] of entries) {
      if (value !== undefined && !isMaskedValue(value)) {
        const isSensitive = sensitiveKeys.includes(key);
        const success = await settingsService.saveSetting(key, value, isSensitive);
        if (!success) return false;
      }
    }

    return true;
  },

  // Save API configuration
  saveApiConfig: async (baseUrl: string, adminToken: string): Promise<boolean> => {
    const results = await Promise.all([
      settingsService.saveSetting('api_base_url', baseUrl, false),
      isMaskedValue(adminToken) 
        ? Promise.resolve(true) 
        : settingsService.saveSetting('api_admin_token', adminToken, true)
    ]);
    return results.every(r => r);
  },

  // Save branding configuration  
  saveBranding: async (appName: string, companyName: string, logoUrl?: string): Promise<boolean> => {
    const results = await Promise.all([
      settingsService.saveSetting('app_name', appName, false),
      settingsService.saveSetting('company_name', companyName, false),
      logoUrl !== undefined 
        ? settingsService.saveSetting('logo_url', logoUrl || '', false)
        : Promise.resolve(true)
    ]);
    return results.every(r => r);
  }
};

function getDefaultSettings(): AppSettings {
  return {
    api_base_url: 'https://free.uazapi.com',
    api_admin_token: '',
    app_name: 'Unidash',
    company_name: 'Unicapital',
    logo_url: undefined
  };
}
