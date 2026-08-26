<?php
/*
 | Commentaire technique
 | Ce fichier est le point d'entrée public : il initialise l'application puis transmet la requête au routeur.
 */
declare(strict_types=1);

define('BASE_PATH', dirname(__DIR__));

spl_autoload_register(function (string $class): void {
    $prefix = 'App\\';
    if (str_starts_with($class, $prefix)) {
        $relative = substr($class, strlen($prefix));
        $parts = explode('\\', $relative);
        if (!empty($parts[0])) {
            $parts[0] = strtolower($parts[0]);
        }
        $file = BASE_PATH . '/app/' . implode('/', $parts) . '.php';
        if (file_exists($file)) require $file;
    }
});

if (file_exists(BASE_PATH . '/vendor/autoload.php')) {
    require BASE_PATH . '/vendor/autoload.php';
}

require BASE_PATH . '/app/helpers/url_helper.php';
require BASE_PATH . '/app/helpers/security_helper.php';
require BASE_PATH . '/app/helpers/format_helper.php';

// Chargement des variables d'environnement depuis le fichier .env
load_env();

\App\Core\Session::start();
\App\Core\ErrorHandler::register();
date_default_timezone_set(config_app('timezone'));

$router = new \App\Core\Router();
require BASE_PATH . '/routes/web.php';
require BASE_PATH . '/routes/api.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';
$base = parse_url(config_app('url'), PHP_URL_PATH) ?: '';
if ($base && str_starts_with($uri, $base)) {
    $uri = substr($uri, strlen($base)) ?: '/';
}
$router->dispatch($_SERVER['REQUEST_METHOD'], $uri);
