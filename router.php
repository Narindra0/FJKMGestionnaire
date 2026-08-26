<?php
/**
 * Routeur pour le serveur intégré PHP
 *
 * Utilisation : php -S localhost:8000 router.php
 *
 * Ce script redirige toutes les requêtes vers public/index.php
 * Les fichiers statiques (CSS, JS, images) sont servis directement depuis public/
 */
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Servir les fichiers statiques directement depuis public/
$publicPath = __DIR__ . '/public' . $uri;
if ($uri !== '/' && file_exists($publicPath) && !is_dir($publicPath)) {
    chdir(__DIR__ . '/public');
    return false;
}

// Tout le reste est routé via l'application
chdir(__DIR__ . '/public');
require __DIR__ . '/public/index.php';
