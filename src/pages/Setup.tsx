import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Database, Key, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';

const SQL_SCHEMA = `-- ==========================================
-- UNIDASH - Schema do Banco de Dados
-- Execute este SQL no SQL Editor do Supabase
-- ==========================================

-- 1. Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Criar tabela de perfis
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Criar tabela de roles
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- 4. Criar tabela de configurações
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  is_sensitive BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 6. Função para verificar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 7. Função para verificar se existe admin
CREATE OR REPLACE FUNCTION public.has_any_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  )
$$;

-- 8. Função para criar admin
CREATE OR REPLACE FUNCTION public.make_user_admin(target_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
  IF target_user_id IS NULL THEN RETURN FALSE; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN TRUE;
END;
$$;

-- 9. Trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (new.id, new.email);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 11. Políticas RLS para user_roles
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- 12. Políticas RLS para app_settings
CREATE POLICY "Admins can view settings" ON public.app_settings
  FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert settings" ON public.app_settings
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update settings" ON public.app_settings
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete settings" ON public.app_settings
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- ==========================================
-- PRONTO! Agora volte ao Unidash e teste a conexão
-- ==========================================`;

const Setup = () => {
  const navigate = useNavigate();
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);

  const copySQL = async () => {
    await navigator.clipboard.writeText(SQL_SCHEMA);
    setCopied(true);
    toast.success('SQL copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 3000);
  };

  const testConnection = async () => {
    if (!supabaseUrl || !supabaseKey) {
      toast.error('Preencha a URL e a chave do Supabase');
      return;
    }

    // Validate URL format
    if (!supabaseUrl.includes('supabase.co') && !supabaseUrl.startsWith('http')) {
      toast.error('URL inválida. Use o formato: https://xxxxx.supabase.co');
      return;
    }

    setTesting(true);

    try {
      // Test connection by making a simple request
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      });

      if (response.ok || response.status === 200) {
        // Save config
        const config = { url: supabaseUrl, anonKey: supabaseKey };
        localStorage.setItem('supabase_config', JSON.stringify(config));
        
        toast.success('Conexão estabelecida! Redirecionando...');
        
        // Reload to apply new config
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        toast.error('Falha na conexão. Verifique as credenciais.');
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Erro ao conectar. Verifique a URL e tente novamente.');
    } finally {
      setTesting(false);
    }
  };

  const skipSetup = () => {
    // Use default Lovable Cloud config
    localStorage.removeItem('supabase_config');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Database className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Configuração Inicial</CardTitle>
          <CardDescription>
            Configure a conexão com seu banco de dados Supabase
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="setup">1. Criar Banco</TabsTrigger>
              <TabsTrigger value="connect">2. Conectar</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-4 mt-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                  Crie um projeto no Supabase (gratuito)
                </h3>
                <Button variant="outline" className="w-full" asChild>
                  <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir Supabase Dashboard
                  </a>
                </Button>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                  Execute o SQL no Editor
                </h3>
                <p className="text-sm text-muted-foreground">
                  No Supabase, vá em <strong>SQL Editor</strong> → <strong>New Query</strong> e cole o SQL abaixo:
                </p>
                <div className="relative">
                  <pre className="bg-background border rounded-lg p-3 text-xs overflow-auto max-h-48">
                    {SQL_SCHEMA.substring(0, 500)}...
                  </pre>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="absolute top-2 right-2"
                    onClick={copySQL}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copiar SQL
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                  Copie as credenciais
                </h3>
                <p className="text-sm text-muted-foreground">
                  Vá em <strong>Settings</strong> → <strong>API</strong> e copie:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li><strong>Project URL</strong> (ex: https://xxxxx.supabase.co)</li>
                  <li><strong>anon public</strong> key</li>
                </ul>
              </div>

              <p className="text-center text-sm text-muted-foreground pt-2">
                Após criar o banco e executar o SQL, vá para a aba "Conectar"
              </p>
            </TabsContent>

            <TabsContent value="connect" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="supabaseUrl" className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    URL do Supabase
                  </Label>
                  <Input
                    id="supabaseUrl"
                    placeholder="https://xxxxx.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supabaseKey" className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Anon Key (public)
                  </Label>
                  <Input
                    id="supabaseKey"
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Encontre em: Settings → API → anon public
                  </p>
                </div>

                <Button 
                  className="w-full" 
                  onClick={testConnection}
                  disabled={testing || !supabaseUrl || !supabaseKey}
                >
                  {testing ? 'Testando conexão...' : 'Testar e Salvar'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">ou</span>
                  </div>
                </div>

                <Button variant="ghost" className="w-full" onClick={skipSetup}>
                  Usar configuração padrão (Lovable Cloud)
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Setup;
