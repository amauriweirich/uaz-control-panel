import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Server, 
  Key, 
  Save,
  Loader2,
  CheckCircle,
  Palette,
  Upload,
  X,
  Image,
  ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { settingsService, AppSettings, isMaskedValue } from '@/lib/settingsService';
import { toast } from '@/hooks/use-toast';

export default function Settings() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<AppSettings>({
    api_base_url: '',
    api_admin_token: '',
    app_name: '',
    company_name: '',
    logo_url: undefined
  });
  const [saving, setSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      return;
    }
    if (!authLoading && !isAdmin) {
      toast({ title: 'Acesso negado', description: 'Você precisa ser admin para acessar', variant: 'destructive' });
      navigate('/dashboard');
      return;
    }
    if (user && isAdmin) {
      loadSettings();
    }
  }, [user, authLoading, isAdmin, navigate]);

  const loadSettings = async () => {
    setLoadingSettings(true);
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({ title: 'Erro', description: 'Falha ao carregar configurações', variant: 'destructive' });
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSaveApi = async () => {
    if (!settings.api_base_url) {
      toast({ title: 'Erro', description: 'URL Base é obrigatória', variant: 'destructive' });
      return;
    }
    if (!settings.api_admin_token && !isMaskedValue(settings.api_admin_token)) {
      toast({ title: 'Erro', description: 'Admin Token é obrigatório', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const success = await settingsService.saveApiConfig(settings.api_base_url, settings.api_admin_token);
      if (success) {
        toast({ title: 'Configuração salva', description: 'Conexão com a API configurada com sucesso' });
        // Reload to get masked values
        await loadSettings();
      } else {
        toast({ title: 'Erro', description: 'Falha ao salvar configuração', variant: 'destructive' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBranding = async () => {
    setSaving(true);
    try {
      const success = await settingsService.saveBranding(
        settings.app_name, 
        settings.company_name, 
        settings.logo_url
      );
      if (success) {
        toast({ title: 'Personalização salva', description: 'As alterações foram aplicadas' });
      } else {
        toast({ title: 'Erro', description: 'Falha ao salvar personalização', variant: 'destructive' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Erro', description: 'Selecione uma imagem válida', variant: 'destructive' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Erro', description: 'A imagem deve ter no máximo 2MB', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSettings({ ...settings, logo_url: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setSettings({ ...settings, logo_url: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (authLoading || loadingSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-dark">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-dark">
      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-foreground">Configurações</h1>
              <p className="text-xs text-muted-foreground">Ajuste sua conexão e personalização</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Admin Notice */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
          <ShieldAlert className="w-5 h-5 text-primary" />
          <p className="text-sm text-foreground">
            Você está logado como <strong>administrador</strong>. As configurações são compartilhadas com todos os usuários.
          </p>
        </div>

        {/* Branding Configuration */}
        <div className="glass rounded-xl p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-accent/10">
              <Palette className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Personalização</h2>
              <p className="text-sm text-muted-foreground">Logo e nome do aplicativo</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Logo do Aplicativo</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-secondary/50 border border-border flex items-center justify-center overflow-hidden">
                  {settings.logo_url ? (
                    <img 
                      src={settings.logo_url} 
                      alt="Logo" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Image className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Enviar Logo
                  </Button>
                  {settings.logo_url && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleRemoveLogo}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                      Remover
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                PNG ou JPG, máximo 2MB. Recomendado: 200x200px
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appName">Nome do Aplicativo</Label>
              <Input
                id="appName"
                value={settings.app_name}
                onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
                placeholder="Unidash"
                className="bg-secondary/50 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input
                id="companyName"
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                placeholder="Unicapital"
                className="bg-secondary/50 border-border"
              />
            </div>

            <Button onClick={handleSaveBranding} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Salvar Personalização
            </Button>
          </div>
        </div>

        {/* API Configuration */}
        <div className="glass rounded-xl p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Server className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Configuração da API UAZAPI</h2>
              <p className="text-sm text-muted-foreground">Conecte ao seu servidor WhatsApp</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 mb-4">
              <p className="text-xs text-accent">
                <strong>Segurança:</strong> O Admin Token é armazenado de forma segura e mascarado na exibição.
                Para alterar, digite um novo valor.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseUrl">URL Base da API</Label>
              <Input
                id="baseUrl"
                value={settings.api_base_url}
                onChange={(e) => setSettings({ ...settings, api_base_url: e.target.value })}
                placeholder="https://free.uazapi.com"
                className="bg-secondary/50 border-border font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Ex: https://seu-subdominio.uazapi.com
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminToken">Admin Token *</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="adminToken"
                  type="password"
                  value={settings.api_admin_token}
                  onChange={(e) => setSettings({ ...settings, api_admin_token: e.target.value })}
                  placeholder={isMaskedValue(settings.api_admin_token) ? "••••••••" : "Seu token de administrador"}
                  className="pl-10 bg-secondary/50 border-border"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {isMaskedValue(settings.api_admin_token) 
                  ? "Token já configurado. Digite um novo valor para alterar."
                  : "Token obrigatório para criar e listar instâncias."}
              </p>
            </div>

            <Button onClick={handleSaveApi} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Configuração
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
