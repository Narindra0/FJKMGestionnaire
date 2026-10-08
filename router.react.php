<?php
/**
 * Routeur pour le serveur intégré PHP avec support React
 *
 * Ce routeur sert le frontend React build statique sur / et les routes API sur /api
 */
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/');

$publicPath = __DIR__ . '/public';

// Normaliser le chemin base
if (!defined('BASE_PATH')) define('BASE_PATH', __DIR__);
require_once __DIR__ . '/app/helpers/url_helper.php';
load_env();
$base = parse_url(trim((string)(config_app('url') ?? ''), " \t\n\r\0\x0B"), PHP_URL_PATH) ?: '';
if ($base !== '' && $base !== '/' && str_starts_with($uri, $base)) {
  $uri = substr($uri, strlen($base)) ?: '/';
}

// Servir l'API REST
if (str_starts_with($uri, '/api/')) {
  // Retirer /api/ et router vers index.php
  $apiUri = substr($uri, 5);
  $_SERVER['REQUEST_URI'] = $apiUri;
  chdir($publicPath);
  require $publicPath . '/index.php';
  return;
}

// Servir le frontend React build
if ($uri === '/' || $uri === '/index.html') {
  $reactIndex = $publicPath . '/react/index.html';
  if (file_exists($reactIndex)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($reactIndex);
    return;
  }
}

// Servir les assets statiques React (JS, CSS, etc.)
if (preg_match('/\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2)$/i', $uri)) {
  $reactAsset = $publicPath . '/react' . $uri;
  if (file_exists($reactAsset)) {
    $ext = strtolower(pathinfo($reactAsset, PATHINFO_EXTENSION));
    $mime = match ($ext) {
      'js' => 'application/javascript; charset=utf-8',
      'css' => 'text/css; charset=utf-8',
      'png' => 'image/png',
      'jpg', 'jpeg' => 'image/jpeg',
      'svg' => 'image/svg+xml',
      'ico' => 'image/x-icon',
      'woff' => 'font/woff',
      'woff2' => 'font/woff2',
      default => 'application/octet-stream',
    };
    header('Content-Type: ' . $mime);
    readfile($reactAsset);
    return;
  }
}

// Fallback : servir l'ancienne interface PHP si React build n'existe pas
chdir($publicPath);
require $publicPath . '/index.php';
