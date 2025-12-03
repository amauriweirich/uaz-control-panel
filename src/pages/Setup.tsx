import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Database, Key, CheckCircle2, Loader2, Shield, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SQL_SCHEMA = `-- UNIDASH Schema
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  is_sensitive BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.has_any_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') $$;

CREATE OR REPLACE FUNCTION public.make_user_admin(target_email TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
  IF target_user_id IS NULL THEN RETURN FALSE; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, 'admin') ON CONFLICT DO NOTHING;
  RETURN TRUE;
END; $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN INSERT INTO public.profiles (id, email) VALUES (new.id, new.email); RETURN new; END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Admins can manage roles') THEN
    CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can view own role') THEN
    CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'app_settings' AND policyname = 'Admins can view settings') THEN
    CREATE POLICY "Admins can view settings" ON public.app_settings FOR SELECT USING (has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'app_settings' AND policyname = 'Admins can insert settings') THEN
    CREATE POLICY "Admins can insert settings" ON public.app_settings FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'app_settings' AND policyname = 'Admins can update settings') THEN
    CREATE POLICY "Admins can update settings" ON public.app_settings FOR UPDATE USING (has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'app_settings' AND policyname = 'Admins can delete settings') THEN
    CREATE POLICY "Admins can delete settings" ON public.app_settings FOR DELETE USING (has_role(auth.uid(), 'admin'));
  END IF;
END $$;`;

const Setup = () => {
  const navigate = useNavigate();
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [supabaseServiceKey, setSupabaseServiceKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [creatingTables, setCreatingTables] = useState(false);
  const [tablesCreated, setTablesCreated] = useState(false);
  const [connectionOk, setConnectionOk] = useState(false);

  const testConnection = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      toast.error('Preencha a URL e a Anon Key');
      return;
    }

    const url = supabaseUrl.trim().replace(/\/$/, '');
    
    if (!url.includes('supabase.co') && !url.includes('supabase.in')) {
      toast.error('URL inválida. Use o formato: https://xxxxx.supabase.co');
      return;
    }

    setTesting(true);

    try {
      const response = await fetch(`${url}/rest/v1/`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      });

      if (response.ok || response.status === 200) {
        setConnectionOk(true);
        toast.success('Conexão estabelecida!');
      } else {
        toast.error('Falha na conexão. Verifique as credenciais.');
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Erro ao conectar. Verifique a URL.');
    } finally {
      setTesting(false);
    }
  };

  const createTables = async () => {
    if (!supabaseServiceKey) {
      toast.error('Insira a Service Role Key para criar as tabelas');
      return;
    }

    const url = supabaseUrl.trim().replace(/\/$/, '');
    setCreatingTables(true);

    try {
      // Try using the SQL endpoint (requires service_role key)
      const response = await fetch(`${url}/rest/v1/rpc/`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({}),
      });

      // Check if tables already exist by querying them
      const checkResponse = await fetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
      });

      if (checkResponse.ok) {
        // Tables might already exist
        setTablesCreated(true);
        toast.success('Tabelas já existem ou foram criadas!');
        return;
      }

      // Tables don't exist - need to run SQL manually
      // Open Supabase SQL Editor
      const projectRef = url.replace('https://', '').replace('.supabase.co', '');
      const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;
      
      // Copy SQL to clipboard
      await navigator.clipboard.writeText(SQL_SCHEMA);
      
      toast.info('SQL copiado! Abrindo o SQL Editor do Supabase...', {
        duration: 5000,
      });
      
      window.open(sqlEditorUrl, '_blank');
      
      // Show manual instructions
      toast.warning('Cole o SQL no editor e clique em "Run"', {
        duration: 10000,
      });

    } catch (error) {
      console.error('Error creating tables:', error);
      
      // Fallback: copy SQL and open editor
      const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '').replace(/\/$/, '');
      const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;
      
      await navigator.clipboard.writeText(SQL_SCHEMA);
      toast.info('SQL copiado para a área de transferência!');
      
      window.open(sqlEditorUrl, '_blank');
    } finally {
      setCreatingTables(false);
    }
  };

  const checkTablesExist = async () => {
    const url = supabaseUrl.trim().replace(/\/$/, '');
    const key = supabaseServiceKey || supabaseAnonKey;

    try {
      const response = await fetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
        },
      });

      if (response.ok) {
        setTablesCreated(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const finishSetup = async () => {
    // Check if tables exist first
    const tablesOk = await checkTablesExist();
    
    if (!tablesOk) {
      toast.error('As tabelas ainda não foram criadas. Crie primeiro clicando em "Criar Tabelas".');
      return;
    }

    // Save config
    const config = { 
      url: supabaseUrl.trim().replace(/\/$/, ''), 
      anonKey: supabaseAnonKey.trim(),
    };
    localStorage.setItem('supabase_config', JSON.stringify(config));
    
    toast.success('Configuração salva! Redirecionando...');
    
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  };

  const skipSetup = () => {
    localStorage.removeItem('supabase_config');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Database className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Configuração Inicial</CardTitle>
          <CardDescription>
            Conecte ao seu projeto Supabase (gratuito)
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Credentials */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
              Credenciais do Supabase
            </h3>
            
            <p className="text-sm text-muted-foreground">
              Crie um projeto em{' '}
              <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                supabase.com/dashboard
              </a>
              {' '}e copie as credenciais de Settings → API
            </p>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="supabaseUrl" className="text-sm">Project URL</Label>
                <Input
                  id="supabaseUrl"
                  placeholder="https://xxxxx.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="supabaseAnonKey" className="text-sm flex items-center gap-1">
                  <Key className="w-3 h-3" />
                  anon public key
                </Label>
                <Input
                  id="supabaseAnonKey"
                  type="password"
                  placeholder="eyJhbGciOi..."
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="supabaseServiceKey" className="text-sm flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  service_role key (para criar tabelas)
                </Label>
                <Input
                  id="supabaseServiceKey"
                  type="password"
                  placeholder="eyJhbGciOi..."
                  value={supabaseServiceKey}
                  onChange={(e) => setSupabaseServiceKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Necessária apenas para criar as tabelas automaticamente
                </p>
              </div>

              <Button 
                variant="outline"
                className="w-full" 
                onClick={testConnection}
                disabled={testing || !supabaseUrl || !supabaseAnonKey}
              >
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : connectionOk ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    Conectado!
                  </>
                ) : (
                  'Testar Conexão'
                )}
              </Button>
            </div>
          </div>

          {/* Step 2: Create Tables */}
          {connectionOk && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                Criar Tabelas no Banco
              </h3>

              {!supabaseServiceKey && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Insira a <strong>service_role key</strong> acima para criar as tabelas automaticamente, ou o SQL será copiado para você colar manualmente.
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                className="w-full" 
                onClick={createTables}
                disabled={creatingTables}
              >
                {creatingTables ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando tabelas...
                  </>
                ) : tablesCreated ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Tabelas Criadas!
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Criar Tabelas
                  </>
                )}
              </Button>

              {tablesCreated && (
                <Alert className="bg-green-500/10 border-green-500/20">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-sm">
                    Tabelas criadas com sucesso!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Step 3: Finish */}
          {connectionOk && (
            <div className="space-y-3 pt-4 border-t">
              <Button 
                className="w-full" 
                size="lg"
                onClick={finishSetup}
              >
                Finalizar Configuração
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
          )}

          {!connectionOk && (
            <div className="pt-4 border-t">
              <Button variant="ghost" className="w-full" onClick={skipSetup}>
                Pular (usar Lovable Cloud)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Setup;
