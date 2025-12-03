import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Smartphone } from 'lucide-react';

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  qrCode: string | null;
  instanceName: string;
}

export function QRCodeModal({ open, onClose, qrCode, instanceName }: QRCodeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Smartphone className="w-5 h-5 text-primary" />
            Conectar {instanceName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-6">
          {qrCode ? (
            <>
              <div className="bg-background p-4 rounded-xl border border-border mb-4">
                <img 
                  src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                  alt="QR Code"
                  className="w-64 h-64 object-contain"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Abra o WhatsApp no seu celular, vá em <strong>Configurações → Aparelhos conectados</strong> e escaneie este código.
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground">Gerando QR Code...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
