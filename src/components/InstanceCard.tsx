import { useState } from 'react';
import { Smartphone, Wifi, WifiOff, QrCode, Power, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Instance, api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { QRCodeModal } from './QRCodeModal';

interface InstanceCardProps {
  instance: Instance;
  onRefresh: () => void;
}

export function InstanceCard({ instance, onRefresh }: InstanceCardProps) {
  const [loading, setLoading] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const statusConfig = {
    connected: { 
      label: 'Conectado', 
      color: 'bg-success', 
      glow: 'glow-success',
      icon: Wifi 
    },
    disconnected: { 
      label: 'Desconectado', 
      color: 'bg-destructive', 
      glow: 'glow-destructive',
      icon: WifiOff 
    },
    connecting: { 
      label: 'Conectando...', 
      color: 'bg-warning', 
      glow: 'glow-warning',
      icon: Loader2 
    },
    qr_code: { 
      label: 'Aguardando QR', 
      color: 'bg-warning', 
      glow: 'glow-warning',
      icon: QrCode 
    },
  };

  const status = statusConfig[instance.status] || statusConfig.disconnected;
  const StatusIcon = status.icon;

  const handleConnect = async () => {
    if (!instance.token) {
      toast({ title: 'Erro', description: 'Token da instância não encontrado', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const result = await api.connectInstance(instance.token);
      if (result.instance?.qrcode) {
        setQrCode(result.instance.qrcode);
        setQrModalOpen(true);
      } else if (result.instance?.paircode) {
        toast({ 
          title: 'Código de pareamento', 
          description: `Use o código: ${result.instance.paircode}` 
        });
      }
      toast({ title: 'Conexão iniciada', description: 'Aguardando autenticação no WhatsApp' });
      onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao conectar instância';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!instance.token) {
      toast({ title: 'Erro', description: 'Token da instância não encontrado', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await api.disconnectInstance(instance.token);
      toast({ title: 'Desconectado', description: 'Instância desconectada com sucesso' });
      onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao desconectar instância';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleGetQR = async () => {
    if (!instance.token) {
      toast({ title: 'Erro', description: 'Token da instância não encontrado', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const result = await api.getInstanceStatus(instance.token);
      const qr = result.instance?.qrcode;
      if (qr) {
        setQrCode(qr);
        setQrModalOpen(true);
      } else {
        toast({ title: 'QR Code', description: 'QR Code não disponível. Tente conectar primeiro.' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao obter QR Code';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="glass rounded-xl p-5 animate-fade-in hover:border-primary/30 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{instance.name}</h3>
              {instance.phone && (
                <p className="text-sm text-muted-foreground font-mono">{instance.phone}</p>
              )}
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.color}/20`}>
            <div className={`w-2 h-2 rounded-full ${status.color} ${status.glow}`} />
            <span className="text-xs font-medium">{status.label}</span>
          </div>
        </div>

        {instance.profileName && (
          <p className="text-sm text-muted-foreground mb-2">
            <span className="font-medium">Perfil:</span> {instance.profileName}
          </p>
        )}
        
        {instance.systemName && (
          <p className="text-xs text-muted-foreground mb-4">
            Sistema: {instance.systemName}
          </p>
        )}

        <div className="flex gap-2 flex-wrap">
          {instance.status === 'connected' ? (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDisconnect}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Power className="w-4 h-4" />}
              Desconectar
            </Button>
          ) : (
            <>
              <Button 
                variant="success" 
                size="sm" 
                onClick={handleConnect}
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" /> : <Wifi className="w-4 h-4" />}
                Conectar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGetQR}
                disabled={loading}
              >
                <QrCode className="w-4 h-4" />
                QR Code
              </Button>
            </>
          )}
        </div>
      </div>

      <QRCodeModal 
        open={qrModalOpen} 
        onClose={() => setQrModalOpen(false)} 
        qrCode={qrCode}
        instanceName={instance.name}
      />
    </>
  );
}
