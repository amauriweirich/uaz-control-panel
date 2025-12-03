# 🚀 Deploy Self-Hosted (VPS)

Deploy completo com banco de dados na sua VPS.

## Requisitos

- VPS com **Ubuntu 20.04+** ou **Debian 11+**
- Mínimo **2GB RAM** (recomendado 4GB)
- **Docker** e **Docker Compose** instalados

## 1. Instalar Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Saia e reconecte via SSH para aplicar
```

## 2. Baixar e Configurar

```bash
# Clonar ou extrair o projeto
cd /opt
git clone https://github.com/SEU_USUARIO/SEU_REPO.git unidash
cd unidash

# Configurar variáveis
cp .env.example .env
nano .env
```

### Gerar chaves de segurança:

```bash
# Cole no terminal para gerar todas as chaves
echo "POSTGRES_PASSWORD=$(openssl rand -base64 24)"
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "SECRET_KEY_BASE=$(openssl rand -base64 48)"
```

### Exemplo de .env configurado:

```env
HOST_IP=meu-servidor.com
POSTGRES_PASSWORD=abc123XYZ...
JWT_SECRET=meu-jwt-secret-32-chars...
SECRET_KEY_BASE=meu-secret-key-base...
ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

## 3. Iniciar

```bash
docker compose up -d
```

Aguarde ~1 minuto para todos os serviços iniciarem.

## 4. Acessar

- **Painel**: `http://seu-ip` (porta 80)
- **API**: `http://seu-ip:8000`

O **primeiro usuário** cadastrado será automaticamente **administrador**.

## Comandos Úteis

```bash
# Ver status
docker compose ps

# Ver logs
docker compose logs -f

# Reiniciar
docker compose restart

# Parar
docker compose down

# Atualizar
git pull && docker compose up -d --build
```

## Backup do Banco

```bash
# Fazer backup
docker compose exec db pg_dump -U postgres postgres > backup.sql

# Restaurar backup
cat backup.sql | docker compose exec -T db psql -U postgres postgres
```

## HTTPS (Opcional)

Para habilitar HTTPS, use um proxy reverso como Nginx ou Traefik na frente.

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Gerar certificado
sudo certbot --nginx -d seu-dominio.com
```

## Solução de Problemas

| Problema | Solução |
|----------|---------|
| Não conecta | Verifique se todas as portas estão abertas (80, 8000, 5432) |
| Erro 500 | Veja logs: `docker compose logs auth` |
| Banco não inicia | Verifique senha: `docker compose logs db` |
| Resetar tudo | `docker compose down -v && docker compose up -d` |
