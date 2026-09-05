<?php
/**
 * Routeur pour le serveur intégré PHP
 *
 * Utilisation : php -S localhost:8000 router.php
 * (compatible aussi avec : php -S localhost:8000 -t public router.php)
 *
 * Ce script route toutes les requêtes vers public/index.php.
 * Les fichiers statiques (CSS, JS, images) sont servis directement depuis public/.
 */
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/');

$publicPath = __DIR__ . '/public';

// Retirer le sous-dossier d'installation (chemin de APP_URL) comme le fait index.php,
// ex: /gestion-obligation-fjkm-malaza-gileada/assets/css/app.css -> /assets/css/app.css
if (!defined('BASE_PATH')) define('BASE_PATH', __DIR__);
require_once __DIR__ . '/app/helpers/url_helper.php';
load_env();
$base = parse_url(trim((string)(config_app('url') ?? ''), " \t\n\r\0\x0B"), PHP_URL_PATH) ?: '';
if ($base !== '' && $base !== '/' && str_starts_with($uri, $base)) {
    $uri = substr($uri, strlen($base)) ?: '/';
}

// Protection contre le path traversal : le fichier doit être dans public/
$file = realpath($publicPath . $uri);
if ($file === false || !str_starts_with($file, realpath($publicPath) . DIRECTORY_SEPARATOR)) {
    $file = null;
}

// Servir les fichiers statiques directement depuis public/
if ($uri !== '/' && $file !== null && is_file($file)) {
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $mime = match ($ext) {
        'css'   => 'text/css; charset=utf-8',
        'js'    => 'application/javascript; charset=utf-8',
        'json'  => 'application/json',
        'svg'   => 'image/svg+xml',
        'jpg', 'jpeg' => 'image/jpeg',
        'png'   => 'image/png',
        'gif'   => 'image/gif',
        'webp'  => 'image/webp',
        'ico'   => 'image/x-icon',
        'woff'  => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf'   => 'font/ttf',
        'csv'   => 'text/csv',
        'xlsx'  => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        default => null,
    };

    if ($ext === 'php') {
        // Ne jamais exposer les fichiers PHP sources
        require $file;
        return true;
    }

    if ($mime !== null) {
        header('Content-Type: ' . $mime);
        header('Content-Length: ' . (string)filesize($file));
        header('Cache-Control: no-cache'); // en dev, pas de cache agressif
        readfile($file);
        return true;
    }
}

// Tout le reste est routé via l'application
chdir($publicPath);
require $publicPath . '/index.php';
