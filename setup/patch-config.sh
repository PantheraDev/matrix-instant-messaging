#!/bin/bash

CONFIG_FILE="/data/homeserver.yaml"

echo "🔧 Corrigiendo sección 'database:' en $CONFIG_FILE..."

# Elimina la sección actual de base de datos (desde 'database:' hasta la próxima línea que no esté indentada)
awk '
  BEGIN {skip=0}
  /^database:/ {print "# Reemplazado por configuración PostgreSQL"; skip=1; next}
  /^[^[:space:]]/ {skip=0}
  skip==0 {print}
' "$CONFIG_FILE" > "$CONFIG_FILE.tmp"

# Agrega la configuración PostgreSQL al final
cat <<EOF >> "$CONFIG_FILE.tmp"

database:
  name: psycopg2
  args:
    user: synapse_user
    password: synapse_pass
    database: synapse
    host: postgres
    port: 5432
    cp_min: 5
    cp_max: 10
EOF

# Reemplaza el archivo original
mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"

echo "✅ Sección 'database:' parchada correctamente."
