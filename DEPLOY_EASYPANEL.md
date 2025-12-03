# 🚀 Deploy no Easypanel - Guia Completo

## Pré-requisitos
- VPS com Ubuntu 20.04+ (mínimo 1GB RAM, 20GB disco)
- Acesso root à VPS via SSH
- Conta no GitHub
- Conta no Supabase (gratuita): https://supabase.com

---

## PARTE 1: Criar Banco no Supabase

### Passo 1.1 - Criar Projeto no Supabase
1. Acesse https://supabase.com/dashboard
2. Clique em **New Project**
3. Configure:
   - **Name**: unidash
   - **Database Password**: crie uma senha forte
   - **Region**: escolha o mais próximo
4. Aguarde a criação (1-2 min)

### Passo 1.2 - Executar o SQL do Schema
1. No Supabase, vá em **SQL Editor** → **New Query**
2. Cole o SQL completo (será mostrado no setup da aplicação)
3. Clique em **Run**

### Passo 1.3 - Copiar Credenciais
1. Vá em **Settings** → **API**
2. Anote:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOi...`

---

## PARTE 2: Preparar o Código no GitHub

### Passo 2.1 - Conectar Lovable ao GitHub
1. No Lovable, clique no botão **GitHub** (canto superior direito)
2. Clique em **Connect to GitHub**
3. Autorize o acesso à sua conta GitHub
4. Clique em **Create Repository**
5. Dê um nome ao repositório (ex: `unidash`)
6. Aguarde o repositório ser criado

---

## PARTE 3: Instalar o Easypanel na VPS

### Passo 3.1 - Conectar na VPS
```bash
ssh root@SEU_IP_DA_VPS
```

### Passo 3.2 - Instalar o Easypanel
```bash
curl -sSL https://get.easypanel.io | sh
```
⏱️ Aguarde 5-10 minutos para instalação completa.

### Passo 3.3 - Acessar o Painel
No navegador, acesse:
```
http://SEU_IP_DA_VPS:3000
```

Crie sua conta de administrador.

---

## PARTE 4: Criar o Projeto no Easypanel

### Passo 4.1 - Criar Projeto
1. Clique em **+ Create Project**
2. Nome: `unidash` 
3. Clique em **Create**

### Passo 4.2 - Adicionar Serviço
1. Dentro do projeto, clique em **+ Service**
2. Escolha **App**
3. Nome do serviço: `dashboard`

### Passo 4.3 - Configurar Source
1. Selecione **GitHub**
2. Conecte sua conta GitHub
3. Selecione o repositório criado
4. Branch: `main`

### Passo 4.4 - Configurar Build
| Campo | Valor |
|-------|-------|
| Build Type | `Dockerfile` |
| Dockerfile Path | `Dockerfile` |

### Passo 4.5 - Configurar Domínio
1. Em **Domains**, clique em **+ Add Domain**
2. Use um subdomínio automático: `unidash.SEU_IP.sslip.io`
3. Marque **HTTPS**

### Passo 4.6 - Deploy
1. Clique em **Deploy**
2. Aguarde o build (3-5 min)

---

## PARTE 5: Configurar a Aplicação

### Passo 5.1 - Acessar o Unidash
1. Acesse a URL configurada: `https://unidash.SEU_IP.sslip.io`
2. Você verá a **Tela de Configuração Inicial**

### Passo 5.2 - Conectar ao Supabase
1. Na aba **"1. Criar Banco"**, copie o SQL e execute no Supabase (se ainda não fez)
2. Na aba **"2. Conectar"**, preencha:
   - **URL do Supabase**: `https://xxxxx.supabase.co`
   - **Anon Key**: sua chave anon public
3. Clique em **Testar e Salvar**

### Passo 5.3 - Criar Primeiro Usuário
1. Após conectar, crie uma conta na tela de login
2. No Supabase, vá em **SQL Editor** e execute:
   ```sql
   SELECT make_user_admin('seu-email@exemplo.com');
   ```

✅ **Pronto!** Sua aplicação está configurada!

---

## PARTE 6: Configurar a API UAZAPI

1. Faça login no Unidash
2. Vá em **Configurações**
3. Preencha:
   - **URL Base da API**: sua URL UAZAPI
   - **Admin Token**: token da API
4. Clique em **Salvar**

---

## Deploy Automático (Opcional)

Para atualizar automaticamente quando houver mudanças:

1. No Easypanel, vá em **Source** → copie o **Webhook URL**
2. No GitHub, vá em **Settings** → **Webhooks** → **Add webhook**
3. Cole a URL e selecione **push events**

---

## Solução de Problemas

| Problema | Solução |
|----------|---------|
| Página em branco | Verifique se o domínio está configurado no Easypanel |
| Erro 502 | Aguarde 1-2 min após deploy ou clique em Restart |
| Erro de conexão | Verifique URL e chave do Supabase |
| SQL não executou | Execute novamente no SQL Editor do Supabase |

---

## Resumo

| Etapa | Tempo |
|-------|-------|
| Criar projeto Supabase | 3 min |
| Conectar GitHub | 2 min |
| Instalar Easypanel | 10 min |
| Configurar e Deploy | 5 min |
| Configurar credenciais no app | 2 min |

**Tempo total**: ~20 minutos

---

✅ **Vantagem**: Todas as credenciais são configuradas **diretamente na aplicação**, sem mexer em variáveis de ambiente!
