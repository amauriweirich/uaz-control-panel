// Branding configuration

export interface BrandingConfig {
  appName: string;
  companyName: string;
  logoUrl?: string;
}

const DEFAULT_BRANDING: BrandingConfig = {
  appName: 'Unidash',
  companyName: 'Unicapital',
  logoUrl: undefined,
};

export const branding = {
  get: (): BrandingConfig => {
    const stored = localStorage.getItem('app_branding');
    if (stored) {
      return { ...DEFAULT_BRANDING, ...JSON.parse(stored) };
    }
    return DEFAULT_BRANDING;
  },

  save: (config: Partial<BrandingConfig>) => {
    const current = branding.get();
    const updated = { ...current, ...config };
    localStorage.setItem('app_branding', JSON.stringify(updated));
    return updated;
  },

  reset: () => {
    localStorage.removeItem('app_branding');
    return DEFAULT_BRANDING;
  },
};
