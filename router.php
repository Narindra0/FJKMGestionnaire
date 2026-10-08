<?php
/**
 * Routeur pour le serveur intégré PHP avec support React
 *
 * Utilisation : php -S localhost:8000 router.php
 *
 * Ce script route :
 * - /api/* vers l'API PHP (public/index.php)
 * - Les fichiers statiques React (JS, CSS, etc.) depuis public/react/dist/
 * - La racine (/) vers le frontend React
 * - L'ancienne interface PHP sur /php/ (optionnel)
 */
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/');

$publicPath = __DIR__ . '/public';
$reactDistPath = $publicPath . '/react/dist';

// Retirer le sous-dossier d'installation (chemin de APP_URL)
if (!defined('BASE_PATH')) define('BASE_PATH', __DIR__);
require_once __DIR__ . '/app/helpers/url_helper.php';
load_env();
$base = parse_url(trim((string)(config_app('url') ?? ''), " \t\n\r\0\x0B"), PHP_URL_PATH) ?: '';
if ($base !== '' && $base !== '/' && str_starts_with($uri, $base)) {
  $uri = substr($uri, strlen($base)) ?: '/';
}

// Routeur API REST
if (str_starts_with($uri, '/api/')) {
  $apiUri = substr($uri, 5);
  $_SERVER['REQUEST_URI'] = $apiUri;
  chdir($publicPath);
  require $publicPath . '/index.php';
  return;
}

// Routeur ancienne interface PHP (optionnel, pour compatibilité)
if (str_starts_with($uri, '/php/')) {
  $phpUri = substr($uri, 4);
  $_SERVER['REQUEST_URI'] = $phpUri;
  chdir($publicPath);
  require $publicPath . '/index.php';
  return;
}

// Servir les fichiers statiques React
if (file_exists($reactDistPath . $uri) && is_file($reactDistPath . $uri)) {
  $file = $reactDistPath . $uri;
  $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
  $mime = match ($ext) {
    'js' => 'application/javascript; charset=utf-8',
    'css' => 'text/css; charset=utf-8',
    'json' => 'application/json',
    'svg' => 'image/svg+xml',
    'jpg', 'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'gif' => 'image/gif',
    'webp' => 'image/webp',
    'ico' => 'image/x-icon',
    'woff' => 'font/woff',
    'woff2' => 'font/woff2',
    'ttf' => 'font/ttf',
    default => null,
  };

  if ($mime !== null) {
    header('Content-Type: ' . $mime);
    header('Content-Length: ' . (string)filesize($file));
    readfile($file);
    return true;
  }
}

// Servir l'index.html React pour toutes les autres routes (SPA)
if ($uri === '/' || $uri === '/index.html') {
  $reactIndex = $reactDistPath . '/index.html';
  if (file_exists($reactIndex)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($reactIndex);
    return true;
  }
}

// Fallback : router vers PHP (ancienne interface)
chdir($publicPath);
require $publicPath . '/index.php';
