<?php
/*
 | Commentaire technique
 | Ce fichier contient des fonctions d'aide réutilisables dans les vues et dans les traitements applicatifs.
 */
function config_app(?string $key = null): mixed {
    static $config = null;
    $config ??= require BASE_PATH . '/app/config/app.php';
    return $key ? ($config[$key] ?? null) : $config;
}

function url(string $path = ''): string {
    $base = rtrim(config_app('url'), '/');
    return $base . '/' . ltrim($path, '/');
}

function asset(string $path): string {
    $cleanPath = ltrim($path, '/');

    // En mode production (debug=false), utiliser les fichiers minifiés avec hash
    $debug = config_app('debug');
    if (!$debug) {
        static $manifest = null;
        if ($manifest === null) {
            $manifestFile = BASE_PATH . '/public/assets/manifest.json';
            $manifest = is_file($manifestFile)
                ? json_decode(file_get_contents($manifestFile), true) ?? []
                : [];
        }
        $relativePath = 'assets/' . $cleanPath;
        if (isset($manifest[$relativePath])) {
            return url($manifest[$relativePath]);
        }
    }

    // En mode debug ou si pas de minification disponible, servir l'original
    $absolute = BASE_PATH . '/public/assets/' . $cleanPath;
    $version = is_file($absolute) ? ('?v=' . filemtime($absolute)) : '';
    return url('assets/' . $cleanPath) . $version;
}

/**
 * Charge les variables depuis le fichier .env à la racine du projet.
 * Format supporté : KEY=VALUE (une par ligne, # pour les commentaires)
 * Les guillemets simples et doubles autour des valeurs sont supprimés.
 */
function load_env(string $path = ''): void
{
    $file = $path ?: BASE_PATH . '/.env';
    if (!is_file($file)) return;

    $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) return;

    foreach ($lines as $line) {
        $line = trim($line);
        // Ignorer les commentaires et les lignes vides
        if ($line === '' || str_starts_with($line, '#')) continue;

        // Ne traiter que les lignes KEY=VALUE
        if (!str_contains($line, '=')) continue;

        $parts = explode('=', $line, 2);
        $key = trim($parts[0]);
        $value = trim($parts[1] ?? '');

        // Supprimer les guillemets si présents
        if (strlen($value) >= 2) {
            $first = $value[0];
            $last = $value[-1];
            if (($first === '"' && $last === '"') || ($first === "'" && $last === "'")) {
                $value = substr($value, 1, -1);
            }
        }

        // Remplacer les références à d'autres variables (${VAR} ou $VAR)
        $value = preg_replace_callback('/\$\{?([A-Z_][A-Z0-9_]*)\}?/i', function ($m) {
            return env($m[1], '');
        }, $value);

        putenv("{$key}={$value}");
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}

/**
 * Récupère une variable d'environnement avec valeur par défaut.
 */
function env(string $key, mixed $default = null): mixed
{
    $value = getenv($key);
    if ($value !== false) {
        // Convertir les booléens textuels
        return match (strtolower((string)$value)) {
            'true', '(true)' => true,
            'false', '(false)' => false,
            'null', '(null)' => null,
            default => $value,
        };
    }
    return $default;
}
