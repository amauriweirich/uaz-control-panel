import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface CreateInstanceModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateInstanceModal({ open, onClose, onCreated }: CreateInstanceModalProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [systemName, setSystemName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await api.createInstance({ 
        name: name.trim(), 
        systemName: systemName.trim() || undefined 
      });
      toast({ title: 'Sucesso', description: 'Instância criada com sucesso' });
      setName('');
      setSystemName('');
      onCreated();
      onClose();
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao criar instância', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Plus className="w-5 h-5 text-primary" />
            Nova Instância
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Instância *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="minha-instancia"
              className="bg-secondary/50 border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="systemName">Nome do Sistema (opcional)</Label>
            <Input
              id="systemName"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              placeholder="api-local"
              className="bg-secondary/50 border-border"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? <Loader2 className="animate-spin" /> : <Plus className="w-4 h-4" />}
              Criar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
