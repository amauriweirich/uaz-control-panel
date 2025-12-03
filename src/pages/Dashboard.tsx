import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  Plus, 
  RefreshCw, 
  Settings, 
  LogOut, 
  Smartphone,
  Wifi,
  WifiOff,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InstanceCard } from '@/components/InstanceCard';
import { CreateInstanceModal } from '@/components/CreateInstanceModal';
import { Instance, api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      navigate('/');
      return;
    }
    fetchInstances();
  }, [navigate]);

  const fetchInstances = async () => {
    setLoading(true);
    try {
      const data = await api.getAllInstances();
      setInstances(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({ 
        title: 'Erro ao carregar', 
        description: 'Verifique a configuração da API', 
        variant: 'destructive' 
      });
      setInstances([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    auth.logout();
    navigate('/');
  };

  const connectedCount = instances.filter(i => i.status === 'connected').length;
  const disconnectedCount = instances.filter(i => i.status !== 'connected').length;

  return (
    <div className="min-h-screen gradient-dark">
      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-foreground">UAZAPI Manager</h1>
                <p className="text-xs text-muted-foreground">Controle de Instâncias</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/settings')}
                title="Configurações"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass rounded-xl p-5 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{instances.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-success/10">
                <Wifi className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{connectedCount}</p>
                <p className="text-sm text-muted-foreground">Conectadas</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-5 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-destructive/10">
                <WifiOff className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{disconnectedCount}</p>
                <p className="text-sm text-muted-foreground">Desconectadas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Instâncias</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchInstances}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Atualizar
            </Button>
            <Button size="sm" onClick={() => setCreateModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Nova Instância
            </Button>
          </div>
        </div>

        {/* Instances Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Carregando instâncias...</p>
          </div>
        ) : instances.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-secondary mx-auto mb-4 flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma instância encontrada
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Crie sua primeira instância para começar a gerenciar suas conexões WhatsApp.
            </p>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Criar Instância
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {instances.map((instance, index) => (
              <div key={instance.id || index} style={{ animationDelay: `${index * 0.05}s` }}>
                <InstanceCard instance={instance} onRefresh={fetchInstances} />
              </div>
            ))}
          </div>
        )}
      </main>

      <CreateInstanceModal 
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={fetchInstances}
      />
    </div>
  );
}
