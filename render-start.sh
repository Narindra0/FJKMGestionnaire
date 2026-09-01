#!/bin/bash
# Script de démarrage Render.com
# Initialise la base de données puis démarre Apache

echo "🚀 Démarrage de FJKM Gestionnaire..."

# S'assurer que l'autoloader Composer est présent et optimisé
cd /var/www/html
if [ ! -f vendor/autoload.php ]; then
    echo "📦 Installation des dépendances Composer..."
    composer install --no-dev --optimize-autoloader --no-scripts
else
    echo "🔄 Régénération de l'autoloader Composer..."
    composer dump-autoload --optimize --no-dev
fi

# Initialiser la base de données
php /var/www/html/scripts/setup-db.php

# Démarrer Apache
exec apache2-foreground
