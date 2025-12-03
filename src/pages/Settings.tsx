import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Server, 
  Key, 
  User, 
  Lock, 
  Save,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, ApiConfig } from '@/lib/api';
import { auth, AuthCredentials } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

export default function Settings() {
  const navigate = useNavigate();
  const [apiConfig, setApiConfig] = useState<ApiConfig>({ baseUrl: '' });
  const [credentials, setCredentials] = useState<AuthCredentials>({ username: '', password: '' });
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      navigate('/');
      return;
    }
    setApiConfig(api.getConfig());
    setCredentials(auth.getCredentials());
  }, [navigate]);

  const handleSaveApi = () => {
    setSaving(true);
    setTimeout(() => {
      api.saveConfig(apiConfig);
      toast({ 
        title: 'Configuração salva', 
        description: 'URL da API atualizada com sucesso' 
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
        {/* API Configuration */}
        <div className="glass rounded-xl p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Server className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Configuração da API</h2>
              <p className="text-sm text-muted-foreground">Configure a URL da UAZAPI</p>
            </div>
          </div>

          <div className="space-y-4">
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
                Ex: https://sua-instancia.uazapi.com
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key (opcional)</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="apiKey"
                  type="password"
                  value={apiConfig.apiKey || ''}
                  onChange={(e) => setApiConfig({ ...apiConfig, apiKey: e.target.value })}
                  placeholder="Sua chave de API"
                  className="pl-10 bg-secondary/50 border-border"
                />
              </div>
            </div>

            <Button onClick={handleSaveApi} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Salvar Configuração
            </Button>
          </div>
        </div>

        {/* Credentials */}
        <div className="glass rounded-xl p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
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
