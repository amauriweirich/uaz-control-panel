#!/bin/sh
set -e

# Substituir placeholders no config.js com variáveis de ambiente
CONFIG_FILE="/usr/share/nginx/html/config.js"

if [ -f "$CONFIG_FILE" ]; then
  # Substituir URL do Supabase
  if [ -n "$SUPABASE_URL" ]; then
    sed -i "s|SUPABASE_URL_PLACEHOLDER|$SUPABASE_URL|g" "$CONFIG_FILE"
  else
    # Se não definido, usar o gateway Kong local
    sed -i "s|SUPABASE_URL_PLACEHOLDER|http://kong:8000|g" "$CONFIG_FILE"
  fi

  # Substituir Anon Key
  if [ -n "$SUPABASE_ANON_KEY" ]; then
    sed -i "s|SUPABASE_ANON_KEY_PLACEHOLDER|$SUPABASE_ANON_KEY|g" "$CONFIG_FILE"
  fi

  echo "Configuração aplicada:"
  cat "$CONFIG_FILE"
fi

# Iniciar nginx
exec nginx -g 'daemon off;'
