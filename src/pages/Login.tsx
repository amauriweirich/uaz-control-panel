import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Lock, User, LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth } from '@/lib/auth';
import { branding, BrandingConfig } from '@/lib/branding';
import { toast } from '@/hooks/use-toast';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [brand, setBrand] = useState<BrandingConfig>(branding.get());

  useEffect(() => {
    setBrand(branding.get());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (auth.login(username, password)) {
        toast({ title: 'Bem-vindo!', description: 'Login realizado com sucesso' });
        navigate('/dashboard');
      } else {
        toast({ 
          title: 'Erro', 
          description: 'Usuário ou senha inválidos', 
          variant: 'destructive' 
        });
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen gradient-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl p-8 animate-fade-in">
          <div className="flex flex-col items-center mb-8">
            {brand.logoUrl ? (
              <div className="w-20 h-20 rounded-2xl overflow-hidden mb-4 glow-primary">
                <img 
                  src={brand.logoUrl} 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 glow-primary">
                <MessageCircle className="w-8 h-8 text-primary-foreground" />
              </div>
            )}
            <h1 className="text-2xl font-bold text-foreground">{brand.appName}</h1>
            <p className="text-muted-foreground mt-1">{brand.companyName} • Gestão WhatsApp</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Usuário
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border focus:border-primary"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border focus:border-primary"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Entrar
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            {brand.companyName} © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
