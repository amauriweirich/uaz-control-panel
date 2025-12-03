# Deploy Self-Hosted (VPS com Supabase Completo)

Este guia explica como fazer o deploy do painel na sua VPS com Supabase self-hosted.

## Requisitos

- VPS com Ubuntu 20.04+ ou Debian 11+
- Mínimo 4GB RAM (recomendado 8GB)
- Docker e Docker Compose instalados
- Domínio apontando para a VPS (opcional, mas recomendado)

## 1. Instalar Docker e Docker Compose

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose-plugin -y

# Reiniciar sessão para aplicar grupo docker
exit
# Reconecte via SSH
```

## 2. Clonar o Repositório

```bash
# Clonar repositório
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
cd SEU_REPOSITORIO
```

## 3. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar configurações
nano .env
```

### Gerar Chaves de Segurança

```bash
# Gerar POSTGRES_PASSWORD
openssl rand -base64 32

# Gerar JWT_SECRET (mínimo 32 caracteres)
openssl rand -base64 32

# Gerar SECRET_KEY_BASE
openssl rand -base64 64
```

### Gerar ANON_KEY e SERVICE_ROLE_KEY

Use o site [supabase.com/docs/guides/self-hosting#api-keys](https://supabase.com/docs/guides/self-hosting#api-keys) ou gere manualmente:

```bash
# Instalar ferramenta de geração
npm install -g @supabase/cli

# Gerar chaves (use o mesmo JWT_SECRET do .env)
supabase gen keys --jwt-secret SEU_JWT_SECRET
```

### Exemplo de .env Configurado

```env
POSTGRES_PASSWORD=SuaSenhaSegura123!@#
JWT_SECRET=seu-jwt-secret-com-pelo-menos-32-caracteres-aqui
ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
API_EXTERNAL_URL=http://seu-dominio.com:8000
SITE_URL=http://seu-dominio.com
```

## 4. Iniciar os Serviços

```bash
# Subir todos os serviços
docker compose up -d

# Verificar status
docker compose ps

# Ver logs (em tempo real)
docker compose logs -f
```

## 5. Acessar o Painel

- **Frontend**: http://seu-dominio.com (porta 80)
- **API Supabase**: http://seu-dominio.com:8000

## 6. Criar Primeiro Usuário Admin

1. Acesse http://seu-dominio.com
2. Clique em "Cadastrar"
3. Preencha email e senha
4. O primeiro usuário será automaticamente admin

## Comandos Úteis

```bash
# Parar serviços
docker compose down

# Reiniciar serviços
docker compose restart

# Ver logs de um serviço específico
docker compose logs -f frontend
docker compose logs -f db
docker compose logs -f auth

# Acessar banco de dados
docker compose exec db psql -U postgres

# Backup do banco
docker compose exec db pg_dump -U postgres postgres > backup.sql

# Restaurar backup
cat backup.sql | docker compose exec -T db psql -U postgres postgres

# Atualizar para nova versão
git pull
docker compose build frontend
docker compose up -d
```

## Configurar HTTPS com Nginx (Recomendado)

### Instalar Nginx e Certbot

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

### Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/unidash
```

Conteúdo:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/unidash /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Gerar certificado SSL
sudo certbot --nginx -d seu-dominio.com
```

## Solução de Problemas

### Erro de conexão com banco
```bash
# Verificar se o banco está rodando
docker compose ps db

# Ver logs do banco
docker compose logs db

# Reiniciar banco
docker compose restart db
```

### Erro de autenticação
```bash
# Verificar se o auth está rodando
docker compose logs auth

# Verificar JWT_SECRET está igual em todos os serviços
grep JWT_SECRET .env
```

### Frontend não carrega
```bash
# Verificar build do frontend
docker compose logs frontend

# Rebuild do frontend
docker compose build frontend --no-cache
docker compose up -d frontend
```

### Resetar tudo e começar do zero
```bash
# CUIDADO: Isso apaga todos os dados!
docker compose down -v
docker compose up -d
```

## Arquitetura dos Serviços

```
┌─────────────────────────────────────────────────────────────┐
│                        VPS                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────┐     ┌─────────────┐                       │
│   │  Frontend   │────▶│    Kong     │                       │
│   │  (Nginx)    │     │  (Gateway)  │                       │
│   │   :80       │     │   :8000     │                       │
│   └─────────────┘     └──────┬──────┘                       │
│                              │                               │
│          ┌───────────────────┼───────────────────┐          │
│          │                   │                   │          │
│          ▼                   ▼                   ▼          │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐   │
│   │    Auth     │     │    REST     │     │  Realtime   │   │
│   │  (GoTrue)   │     │ (PostgREST) │     │ (WebSocket) │   │
│   └──────┬──────┘     └──────┬──────┘     └──────┬──────┘   │
│          │                   │                   │          │
│          └───────────────────┼───────────────────┘          │
│                              │                               │
│                              ▼                               │
│                       ┌─────────────┐                       │
│                       │ PostgreSQL  │                       │
│                       │   :5432     │                       │
│                       └─────────────┘                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```
