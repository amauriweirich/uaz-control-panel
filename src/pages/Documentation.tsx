import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Server,
  Github,
  Rocket,
  Settings,
  Globe,
  RefreshCw,
  CheckCircle2,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Terminal,
  FileCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface StepProps {
  number: number;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Step({ number, title, children, defaultOpen = false }: StepProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="glass rounded-xl overflow-hidden animate-fade-in">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors"
      >
        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-bold">{number}</span>
        </div>
        <span className="font-semibold text-foreground flex-1 text-left">{title}</span>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pl-[4.5rem]">
          {children}
        </div>
      )}
    </div>
  );
}

function CodeBlock({ code, language = 'bash' }: { code: string; language?: string }) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Copiado!', description: 'Comando copiado para a área de transferência' });
  };

  return (
    <div className="relative group">
      <pre className="bg-background/80 border border-border rounded-lg p-4 overflow-x-auto text-sm font-mono">
        <code className="text-foreground">{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={copyToClipboard}
      >
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  );
}

function InfoBox({ children, variant = 'info' }: { children: React.ReactNode; variant?: 'info' | 'warning' | 'success' }) {
  const styles = {
    info: 'bg-primary/10 border-primary/30 text-primary',
    warning: 'bg-warning/10 border-warning/30 text-warning',
    success: 'bg-success/10 border-success/30 text-success'
  };

  return (
    <div className={`rounded-lg border p-4 ${styles[variant]}`}>
      {children}
    </div>
  );
}

export default function Documentation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-dark">
      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <h1 className="font-bold text-foreground">Documentação</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="glass rounded-2xl p-8 mb-8 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-4 flex items-center justify-center">
            <Rocket className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Guia de Instalação no Easypanel
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Aprenda a fazer deploy do Unidash na sua própria VPS usando Easypanel.
            Tempo estimado: 20-30 minutos.
          </p>
        </div>

        {/* Prerequisites */}
        <div className="glass rounded-xl p-6 mb-8 animate-fade-in">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            Pré-requisitos
          </h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              VPS com Ubuntu 20.04+ (mínimo 1GB RAM, 20GB disco)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Acesso root à VPS via SSH
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Conta no GitHub
            </li>
          </ul>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          <Step number={1} title="Preparar o Código no GitHub" defaultOpen={true}>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Github className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-muted-foreground mb-3">
                    Conecte seu projeto Lovable ao GitHub:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>No Lovable, clique no botão <strong className="text-foreground">GitHub</strong> (canto superior direito)</li>
                    <li>Clique em <strong className="text-foreground">Connect to GitHub</strong></li>
                    <li>Autorize o acesso à sua conta GitHub</li>
                    <li>Clique em <strong className="text-foreground">Create Repository</strong></li>
                    <li>Dê um nome ao repositório (ex: unidash-whatsapp)</li>
                  </ol>
                </div>
              </div>
              <InfoBox variant="success">
                ✓ Verifique se o repositório contém os arquivos: <code className="bg-background px-1 rounded">Dockerfile</code> e <code className="bg-background px-1 rounded">nginx.conf</code>
              </InfoBox>
            </div>
          </Step>

          <Step number={2} title="Instalar o Easypanel na VPS">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Terminal className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-muted-foreground mb-3">
                    Conecte na sua VPS via SSH:
                  </p>
                  <CodeBlock code="ssh root@SEU_IP_DA_VPS" />
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Server className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-muted-foreground mb-3">
                    Execute o comando de instalação:
                  </p>
                  <CodeBlock code="curl -sSL https://get.easypanel.io | sh" />
                  <p className="text-sm text-muted-foreground mt-2">
                    ⏱️ Aguarde 5-10 minutos para instalação completa.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-muted-foreground mb-3">
                    Acesse o painel no navegador:
                  </p>
                  <CodeBlock code="http://SEU_IP_DA_VPS:3000" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Crie sua conta de administrador com email e senha forte.
                  </p>
                </div>
              </div>
            </div>
          </Step>

          <Step number={3} title="Criar Projeto no Easypanel">
            <div className="space-y-4 text-muted-foreground">
              <ol className="list-decimal list-inside space-y-3">
                <li>Clique em <strong className="text-foreground">+ Create Project</strong></li>
                <li>Nome: <code className="bg-background px-2 py-0.5 rounded text-foreground">unidash</code></li>
                <li>Clique em <strong className="text-foreground">Create</strong></li>
                <li>Dentro do projeto, clique em <strong className="text-foreground">+ Service</strong></li>
                <li>Escolha <strong className="text-foreground">App</strong></li>
                <li>Nome do serviço: <code className="bg-background px-2 py-0.5 rounded text-foreground">dashboard</code></li>
              </ol>
            </div>
          </Step>

          <Step number={4} title="Configurar o Serviço">
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <FileCode className="w-4 h-4" />
                  Aba "Source" (Código Fonte)
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Selecione <strong className="text-foreground">GitHub</strong></li>
                  <li>Clique em <strong className="text-foreground">Connect GitHub Account</strong> (primeira vez)</li>
                  <li>Autorize o Easypanel no GitHub</li>
                  <li>Selecione o repositório: <code className="bg-background px-2 py-0.5 rounded text-foreground">unidash-whatsapp</code></li>
                  <li>Branch: <code className="bg-background px-2 py-0.5 rounded text-foreground">main</code></li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-3">Aba "Build" (Compilação)</h4>
                <div className="bg-background/50 rounded-lg p-4 border border-border">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <td className="py-1 text-muted-foreground">Build Type</td>
                        <td className="py-1 text-foreground font-mono">Dockerfile</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-muted-foreground">Dockerfile Path</td>
                        <td className="py-1 text-foreground font-mono">Dockerfile</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-3">Aba "Domains" (Domínios)</h4>
                <div className="space-y-3 text-muted-foreground">
                  <p>Clique em <strong className="text-foreground">+ Add Domain</strong> e escolha:</p>
                  <div className="grid gap-3">
                    <div className="bg-background/50 rounded-lg p-4 border border-border">
                      <p className="text-sm font-medium text-foreground mb-1">Opção A - Subdomínio automático:</p>
                      <code className="text-primary">dashboard.SEU_IP.sslip.io</code>
                    </div>
                    <div className="bg-background/50 rounded-lg p-4 border border-border">
                      <p className="text-sm font-medium text-foreground mb-1">Opção B - Domínio próprio:</p>
                      <code className="text-primary">painel.seudominio.com.br</code>
                    </div>
                  </div>
                  <p className="text-sm">Marque a opção <strong className="text-foreground">HTTPS</strong> para SSL automático.</p>
                </div>
              </div>
            </div>
          </Step>

          <Step number={5} title="Fazer o Deploy">
            <div className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Clique no botão azul <strong className="text-foreground">Deploy</strong> (canto superior)</li>
                <li>Aguarde o build (3-5 minutos na primeira vez)</li>
                <li>Quando aparecer ✅ <strong className="text-success">Running</strong>, está pronto!</li>
              </ol>

              <InfoBox variant="info">
                <p className="font-medium mb-2">Credenciais padrão:</p>
                <p>Usuário: <code className="bg-background px-2 py-0.5 rounded">admin</code></p>
                <p>Senha: <code className="bg-background px-2 py-0.5 rounded">admin123</code></p>
              </InfoBox>

              <InfoBox variant="warning">
                ⚠️ <strong>IMPORTANTE:</strong> Altere a senha imediatamente em Configurações após o primeiro login!
              </InfoBox>
            </div>
          </Step>

          <Step number={6} title="Configurar a API UAZAPI">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Settings className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-muted-foreground mb-3">
                    Após acessar o dashboard:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Vá em <strong className="text-foreground">Configurações</strong> (menu lateral)</li>
                    <li>Preencha a <strong className="text-foreground">URL Base da API</strong></li>
                    <li>Preencha o <strong className="text-foreground">Admin Token</strong></li>
                    <li>Clique em <strong className="text-foreground">Salvar Configurações</strong></li>
                    <li>Clique em <strong className="text-foreground">Testar Conexão</strong> para verificar</li>
                  </ol>
                </div>
              </div>
            </div>
          </Step>

          <Step number={7} title="Deploy Automático (Webhook)">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Configure para atualizar automaticamente quando houver mudanças no Lovable:
              </p>
              
              <div>
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  No Easypanel
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>No serviço, vá em <strong className="text-foreground">Source</strong></li>
                  <li>Copie o <strong className="text-foreground">Webhook URL</strong></li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  No GitHub
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>No repositório, vá em <strong className="text-foreground">Settings → Webhooks</strong></li>
                  <li>Clique em <strong className="text-foreground">Add webhook</strong></li>
                  <li>Cole a URL do Easypanel em <strong className="text-foreground">Payload URL</strong></li>
                  <li>Content type: <code className="bg-background px-2 py-0.5 rounded text-foreground">application/json</code></li>
                  <li>Evento: <strong className="text-foreground">Just the push event</strong></li>
                  <li>Clique em <strong className="text-foreground">Add webhook</strong></li>
                </ol>
              </div>

              <InfoBox variant="success">
                ✓ Agora toda alteração no Lovable atualiza automaticamente na VPS!
              </InfoBox>
            </div>
          </Step>
        </div>

        {/* Troubleshooting */}
        <div className="glass rounded-xl p-6 mt-8 animate-fade-in">
          <h2 className="font-semibold text-foreground mb-4">🔧 Solução de Problemas</h2>
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-destructive font-medium">❌ Build falhou?</span>
              <p className="text-muted-foreground">Vá em Deployments, clique no deploy com erro e leia os logs.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-destructive font-medium">❌ Erro 502?</span>
              <p className="text-muted-foreground">Aguarde 1-2 minutos após o deploy ou clique em Restart.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-destructive font-medium">❌ API não conecta?</span>
              <p className="text-muted-foreground">Verifique URL da API e Admin Token nas Configurações.</p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-3 mt-8 justify-center">
          <Button variant="outline" asChild>
            <a href="https://easypanel.io/docs" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Docs Easypanel
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://docs.uazapi.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Docs UAZAPI
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
}
