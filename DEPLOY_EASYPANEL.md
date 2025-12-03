# 🚀 Deploy no Easypanel - Guia Completo para Iniciantes

## Pré-requisitos
- VPS com Ubuntu 20.04+ (mínimo 1GB RAM, 20GB disco)
- Acesso root à VPS via SSH
- Domínio (opcional, mas recomendado)

---

## PARTE 1: Instalar o Easypanel na VPS

### Passo 1.1 - Conectar na VPS
Abra o terminal e conecte via SSH:
```bash
ssh root@SEU_IP_DA_VPS
```

### Passo 1.2 - Instalar o Easypanel
Execute este comando (apenas uma linha):
```bash
curl -sSL https://get.easypanel.io | sh
```

Aguarde a instalação (pode levar 5-10 minutos).

### Passo 1.3 - Acessar o Easypanel
Após a instalação, acesse no navegador:
```
http://SEU_IP_DA_VPS:3000
```

Na primeira vez, você vai criar:
- **Email**: seu email
- **Senha**: crie uma senha forte

---

## PARTE 2: Conectar o GitHub ao Lovable

### Passo 2.1 - No Lovable
1. Clique no botão **GitHub** (canto superior direito)
2. Clique em **Connect to GitHub**
3. Autorize o acesso
4. Clique em **Create Repository**
5. Dê um nome (ex: `unidash`)
6. Aguarde criar o repositório

### Passo 2.2 - Copiar URL do Repositório
1. Acesse https://github.com
2. Entre no repositório criado
3. Clique no botão verde **Code**
4. Copie a URL HTTPS (ex: `https://github.com/seu-usuario/unidash.git`)

---

## PARTE 3: Criar o Projeto no Easypanel

### Passo 3.1 - Criar Projeto
1. No Easypanel, clique em **+ Create Project**
2. Nome: `unidash` (ou o nome que preferir)
3. Clique em **Create**

### Passo 3.2 - Adicionar Serviço
1. Dentro do projeto, clique em **+ Service**
2. Escolha **App**

### Passo 3.3 - Configurar o Serviço
Na aba **General**:
- **Service Name**: `dashboard`

Na aba **Source**:
1. Selecione **GitHub**
2. Se for a primeira vez:
   - Clique em **Connect GitHub Account**
   - Autorize o Easypanel no GitHub
3. Selecione seu repositório (`unidash`)
4. Branch: `main`

Na aba **Build**:
- **Build Type**: Dockerfile
- **Dockerfile Path**: `Dockerfile`

Na aba **Domains**:
1. Clique em **+ Add Domain**
2. Opções:
   - **Usar subdomínio do Easypanel**: dashboard-unidash.SEU_IP.sslip.io
   - **Usar seu domínio**: dashboard.seudominio.com.br

### Passo 3.4 - Deploy
1. Clique em **Deploy** (botão azul no topo)
2. Aguarde o build (primeira vez pode levar 3-5 minutos)
3. Quando aparecer ✅ **Running**, está pronto!

---

## PARTE 4: Acessar o Dashboard

Após o deploy, acesse pela URL configurada:
- `https://dashboard-unidash.SEU_IP.sslip.io`
- ou `https://dashboard.seudominio.com.br`

**Login padrão:**
- Usuário: `admin`
- Senha: `admin123`

⚠️ **IMPORTANTE**: Após o primeiro login, vá em **Configurações** e altere a senha!

---

## PARTE 5: Configurar Domínio Próprio (Opcional)

### Se você tem um domínio:

1. Acesse o painel DNS do seu domínio (GoDaddy, Cloudflare, Registro.br, etc.)

2. Adicione um registro:
   - **Tipo**: A
   - **Nome**: dashboard (ou @ para domínio raiz)
   - **Valor**: IP da sua VPS

3. No Easypanel:
   - Vá no serviço `dashboard`
   - Aba **Domains**
   - Adicione: `dashboard.seudominio.com.br`
   - Marque **HTTPS** (SSL automático)

4. Aguarde 5-10 minutos para propagação DNS

---

## PARTE 6: Atualizar o Dashboard

Quando fizer alterações no Lovable, o código vai automaticamente pro GitHub.

Para atualizar na VPS:
1. Acesse o Easypanel
2. Vá no serviço `dashboard`
3. Clique em **Redeploy**

### Deploy Automático (Webhook):
1. No serviço, vá em **Source**
2. Copie o **Webhook URL**
3. No GitHub, vá em Settings → Webhooks → Add webhook
4. Cole a URL
5. Content type: `application/json`
6. Evento: `Just the push event`
7. Salve

Agora, toda alteração no Lovable atualiza automaticamente! 🎉

---

## Solução de Problemas

### Build falhou?
1. Clique em **Deployments** no serviço
2. Clique no deploy com erro
3. Veja o log para identificar o problema

### Página não carrega?
- Verifique se o status é **Running**
- Confira se o domínio está correto
- Teste acessar via IP: `http://SEU_IP:PORTA`

### Erro 502 Bad Gateway?
- Aguarde 1-2 minutos após o deploy
- Clique em **Restart** no serviço

### Precisa de ajuda?
- Documentação Easypanel: https://easypanel.io/docs
- Discord Easypanel: https://discord.gg/easypanel

---

## Resumo Rápido

| Passo | Ação |
|-------|------|
| 1 | Instalar Easypanel na VPS |
| 2 | Conectar GitHub no Lovable |
| 3 | Criar projeto no Easypanel |
| 4 | Configurar serviço com GitHub |
| 5 | Fazer Deploy |
| 6 | Acessar e configurar dashboard |

**Tempo estimado**: 15-30 minutos

---

✅ **Pronto!** Seu dashboard está rodando na sua VPS!
