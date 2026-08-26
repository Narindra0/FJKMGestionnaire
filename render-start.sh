#!/bin/bash
# Script de démarrage Render.com
# Initialise la base de données puis démarre Apache

echo "🚀 Démarrage de FJKM Gestionnaire..."

# Initialiser la base de données
php /var/www/html/scripts/setup-db.php

# Démarrer Apache
exec apache2-foreground
