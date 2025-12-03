# 🚀 Deploy no Easypanel - Guia Completo

## Pré-requisitos
- VPS com Ubuntu 20.04+ (mínimo 1GB RAM, 20GB disco)
- Acesso root à VPS via SSH
- Conta no GitHub

---

## PARTE 1: Preparar o Código no GitHub

### Passo 1.1 - Conectar Lovable ao GitHub
1. No Lovable, clique no botão **GitHub** (canto superior direito)
2. Clique em **Connect to GitHub**
3. Autorize o acesso à sua conta GitHub
4. Clique em **Create Repository**
5. Dê um nome ao repositório (ex: `unidash-whatsapp`)
6. Aguarde o repositório ser criado

### Passo 1.2 - Verificar Repositório
1. Acesse https://github.com
2. Confirme que o repositório foi criado
3. Verifique se contém os arquivos: `Dockerfile`, `nginx.conf`

---

## PARTE 2: Instalar o Easypanel na VPS

### Passo 2.1 - Conectar na VPS
```bash
ssh root@SEU_IP_DA_VPS
```

### Passo 2.2 - Instalar o Easypanel
```bash
curl -sSL https://get.easypanel.io | sh
```
⏱️ Aguarde 5-10 minutos para instalação completa.

### Passo 2.3 - Acessar o Painel
No navegador, acesse:
```
http://SEU_IP_DA_VPS:3000
```

Crie sua conta de administrador:
- **Email**: seu email
- **Senha**: crie uma senha forte

---

## PARTE 3: Criar o Projeto no Easypanel

### Passo 3.1 - Criar Projeto
1. Clique em **+ Create Project**
2. Nome: `unidash` 
3. Clique em **Create**

### Passo 3.2 - Adicionar Serviço
1. Dentro do projeto, clique em **+ Service**
2. Escolha **App**
3. Nome do serviço: `dashboard`

---

## PARTE 4: Configurar o Serviço

### Passo 4.1 - Aba "Source" (Código Fonte)
1. Selecione **GitHub**
2. Clique em **Connect GitHub Account** (primeira vez)
3. Autorize o Easypanel no GitHub
4. Selecione o repositório: `unidash-whatsapp`
5. Branch: `main`

### Passo 4.2 - Aba "Build" (Compilação)
| Campo | Valor |
|-------|-------|
| Build Type | `Dockerfile` |
| Dockerfile Path | `Dockerfile` |

### Passo 4.3 - Aba "Domains" (Domínios)
1. Clique em **+ Add Domain**
2. Escolha uma opção:

**Opção A - Subdomínio automático (sem domínio próprio):**
```
dashboard.SEU_IP.sslip.io
```

**Opção B - Domínio próprio:**
```
painel.seudominio.com.br
```
*(Requer configuração DNS - ver Parte 6)*

3. Marque a opção **HTTPS** para SSL automático

---

## PARTE 5: Fazer o Deploy

### Passo 5.1 - Iniciar Deploy
1. Clique no botão azul **Deploy** (canto superior)
2. Aguarde o build (3-5 minutos na primeira vez)

### Passo 5.2 - Acompanhar o Processo
1. Vá em **Deployments** para ver os logs
2. Quando aparecer ✅ **Running**, está pronto!

### Passo 5.3 - Acessar o Dashboard
Acesse a URL configurada:
```
https://dashboard.SEU_IP.sslip.io
```

**Credenciais padrão:**
| Campo | Valor |
|-------|-------|
| Usuário | `admin` |
| Senha | `admin123` |

⚠️ **IMPORTANTE**: Altere a senha imediatamente em **Configurações**!

---

## PARTE 6: Configurar Domínio Próprio (Opcional)

### Passo 6.1 - No Painel DNS do seu Domínio
Crie um registro A:

| Tipo | Nome | Valor |
|------|------|-------|
| A | painel | IP_DA_VPS |

### Passo 6.2 - No Easypanel
1. Vá no serviço `dashboard`
2. Aba **Domains**
3. Adicione: `painel.seudominio.com.br`
4. Marque **HTTPS**
5. Clique em **Save**

⏱️ Aguarde 5-10 minutos para propagação DNS.

---

## PARTE 7: Configurar a API UAZAPI

Após acessar o dashboard:

1. Vá em **Configurações** (menu lateral)
2. Preencha:
   - **URL Base da API**: `https://sua-api-uazapi.com`
   - **Admin Token**: Token de administrador da UAZAPI
3. Clique em **Salvar Configurações**
4. Clique em **Testar Conexão** para verificar

---

## PARTE 8: Deploy Automático (Webhook)

Para atualizar automaticamente quando houver mudanças no Lovable:

### Passo 8.1 - Copiar Webhook do Easypanel
1. No serviço, vá em **Source**
2. Copie o **Webhook URL**

### Passo 8.2 - Configurar no GitHub
1. No repositório GitHub, vá em **Settings** → **Webhooks**
2. Clique em **Add webhook**
3. Preencha:
   | Campo | Valor |
   |-------|-------|
   | Payload URL | URL copiada do Easypanel |
   | Content type | `application/json` |
   | Events | `Just the push event` |
4. Clique em **Add webhook**

✅ Agora toda alteração no Lovable atualiza automaticamente na VPS!

---

## Solução de Problemas

### ❌ Build falhou
1. Vá em **Deployments**
2. Clique no deploy com erro
3. Leia os logs para identificar o problema

### ❌ Erro 502 Bad Gateway
- Aguarde 1-2 minutos após o deploy
- Clique em **Restart** no serviço

### ❌ Página em branco
- Verifique se o status é **Running**
- Confira os logs em **Deployments**

### ❌ SSL não funciona
- Verifique se o DNS está propagado: `nslookup seudominio.com`
- Aguarde até 24h para propagação completa

### ❌ API não conecta
- Verifique se a URL da API está correta
- Confirme que o Admin Token é válido
- Teste a API diretamente no navegador

---

## Comandos Úteis

### Ver logs em tempo real (na VPS)
```bash
docker logs -f $(docker ps -q --filter name=dashboard)
```

### Reiniciar container
```bash
docker restart $(docker ps -q --filter name=dashboard)
```

### Ver uso de recursos
```bash
docker stats
```

---

## Resumo Rápido

| Etapa | Ação | Tempo |
|-------|------|-------|
| 1 | Conectar GitHub no Lovable | 2 min |
| 2 | Instalar Easypanel na VPS | 10 min |
| 3 | Criar projeto e serviço | 3 min |
| 4 | Configurar GitHub + Build | 5 min |
| 5 | Deploy | 5 min |
| 6 | Configurar API | 2 min |
| 7 | Webhook (opcional) | 3 min |

**Tempo total estimado**: 20-30 minutos

---

## Links Úteis

- 📚 Documentação Easypanel: https://easypanel.io/docs
- 💬 Discord Easypanel: https://discord.gg/easypanel
- 📖 Documentação UAZAPI: https://docs.uazapi.com

---

✅ **Pronto!** Seu Unidash está rodando na VPS com deploy automático!
