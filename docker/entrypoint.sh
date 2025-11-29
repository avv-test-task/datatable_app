#!/bin/bash
set -e

DB_PATH="/var/www/html/backend/database/database.db"
INIT_SQL="/var/www/html/database/init.sql"
FRONTEND_DIR="/var/www/html/frontend"

mkdir -p "$(dirname "$DB_PATH")"

if [ ! -f "$DB_PATH" ]; then
    sqlite3 "$DB_PATH" < "$INIT_SQL"
    chmod 0666 "$DB_PATH"
fi

if [ -f "$FRONTEND_DIR/package.json" ] && [ ! -d "$FRONTEND_DIR/dist" ]; then
    cd "$FRONTEND_DIR" && npm install && npm run build || true
fi

exec "$@"

