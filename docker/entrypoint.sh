#!/bin/bash
set -e

DB_PATH="/var/www/html/backend/database/database.db"
INIT_SQL="/var/www/html/database/init.sql"
FRONTEND_DIR="/var/www/html/frontend"
BACKEND_DIR="/var/www/html/backend"

echo "Starting container initialization..."

mkdir -p "$(dirname "$DB_PATH")"

if [ ! -f "$DB_PATH" ]; then
    echo "Initializing database..."
    sqlite3 "$DB_PATH" < "$INIT_SQL"
    chmod 0666 "$DB_PATH"
fi

if [ -f "$BACKEND_DIR/composer.json" ]; then
    echo "Installing Composer dependencies..."
    cd "$BACKEND_DIR"
    composer install --no-interaction --prefer-dist --optimize-autoloader
    echo "Composer dependencies installed successfully"
fi

if [ -f "$FRONTEND_DIR/package.json" ]; then
    echo "Installing npm dependencies..."
    cd "$FRONTEND_DIR"
    npm install
    echo "npm dependencies installed successfully"
    
    echo "Building frontend..."
    npm run build
    echo "Frontend build completed successfully"
fi

echo "Initialization complete. Starting services..."
exec "$@"

