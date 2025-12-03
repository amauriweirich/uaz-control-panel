import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Server, 
  Key, 
  User, 
  Lock, 
  Save,
  Loader2,
  CheckCircle,
  Palette,
  Upload,
  X,
  Image
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, ApiConfig } from '@/lib/api';
import { auth, AuthCredentials } from '@/lib/auth';
import { branding, BrandingConfig } from '@/lib/branding';
import { toast } from '@/hooks/use-toast';

export default function Settings() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [apiConfig, setApiConfig] = useState<ApiConfig>({ baseUrl: '', adminToken: '' });
  const [credentials, setCredentials] = useState<AuthCredentials>({ username: '', password: '' });
  const [brandingConfig, setBrandingConfig] = useState<BrandingConfig>({ appName: '', companyName: '' });
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      navigate('/');
      return;
    }
    setApiConfig(api.getConfig());
    setCredentials(auth.getCredentials());
    setBrandingConfig(branding.get());
  }, [navigate]);

  const handleSaveApi = () => {
    if (!apiConfig.baseUrl) {
      toast({ title: 'Erro', description: 'URL Base é obrigatória', variant: 'destructive' });
      return;
    }
    if (!apiConfig.adminToken) {
      toast({ title: 'Erro', description: 'Admin Token é obrigatório', variant: 'destructive' });
      return;
    }
    setSaving(true);
    setTimeout(() => {
      api.saveConfig(apiConfig);
      toast({ 
        title: 'Configuração salva', 
        description: 'Conexão com a API configurada com sucesso' 
      });
      setSaving(false);
    }, 500);
  };

  const handleSaveCredentials = () => {
    if (!credentials.username) {
      toast({ title: 'Erro', description: 'Usuário é obrigatório', variant: 'destructive' });
      return;
    }
    
    setSaving(true);
    setTimeout(() => {
      const updatedCredentials = {
        username: credentials.username,
        password: newPassword || credentials.password,
      };
      auth.saveCredentials(updatedCredentials);
      setCredentials(updatedCredentials);
      setNewPassword('');
      toast({ 
        title: 'Credenciais atualizadas', 
        description: 'Suas credenciais foram salvas' 
      });
      setSaving(false);
    }, 500);
  };

  const handleSaveBranding = () => {
    setSaving(true);
    setTimeout(() => {
      branding.save(brandingConfig);
      toast({ 
        title: 'Personalização salva', 
        description: 'As alterações serão aplicadas ao recarregar' 
      });
      setSaving(false);
    }, 500);
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
      setBrandingConfig({ ...brandingConfig, logoUrl: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setBrandingConfig({ ...brandingConfig, logoUrl: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
              <p className="text-xs text-muted-foreground">Ajuste sua conexão e credenciais</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
                  {brandingConfig.logoUrl ? (
                    <img 
                      src={brandingConfig.logoUrl} 
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
                  {brandingConfig.logoUrl && (
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
                value={brandingConfig.appName}
                onChange={(e) => setBrandingConfig({ ...brandingConfig, appName: e.target.value })}
                placeholder="Unidash"
                className="bg-secondary/50 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input
                id="companyName"
                value={brandingConfig.companyName}
                onChange={(e) => setBrandingConfig({ ...brandingConfig, companyName: e.target.value })}
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
                <strong>Autenticação:</strong> O Admin Token é obrigatório para criar e gerenciar instâncias. 
                Cada instância criada recebe seu próprio token para operações específicas.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseUrl">URL Base da API</Label>
              <Input
                id="baseUrl"
                value={apiConfig.baseUrl}
                onChange={(e) => setApiConfig({ ...apiConfig, baseUrl: e.target.value })}
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
                  value={apiConfig.adminToken}
                  onChange={(e) => setApiConfig({ ...apiConfig, adminToken: e.target.value })}
                  placeholder="Seu token de administrador"
                  className="pl-10 bg-secondary/50 border-border"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Token obrigatório para criar e listar instâncias. Enviado no header "admintoken".
              </p>
            </div>

            <Button onClick={handleSaveApi} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Salvar Configuração
            </Button>
          </div>
        </div>

        {/* Credentials */}
        <div className="glass rounded-xl p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-warning/10">
              <Lock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Credenciais de Acesso</h2>
              <p className="text-sm text-muted-foreground">Altere seu usuário e senha</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  placeholder="admin"
                  className="pl-10 bg-secondary/50 border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha (deixe vazio para manter)</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 bg-secondary/50 border-border"
                />
              </div>
            </div>

            <Button onClick={handleSaveCredentials} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Credenciais
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
