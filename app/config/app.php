<?php
/*
 | Commentaire technique
 | Ce fichier contient la configuration principale de l'application.
 | Les valeurs sont chargées depuis le fichier .env via la fonction env().
 | Si le fichier .env n'existe pas, les valeurs par défaut sont utilisées.
 */
return [
    "name" => env('APP_NAME', "GESTION D'OBLIGATION AU SEIN D'EGLISE FJKM MALAZA GILEADA"),
    'short_name' => env('APP_SHORT_NAME', 'FJKM Obligations'),
    'env' => env('APP_ENV', 'local'),
    'debug' => env('APP_DEBUG', false),
    'url' => trim((string)env('APP_URL', 'http://localhost/gestion-obligation-fjkm-malaza-gileada')),
    'timezone' => env('APP_TIMEZONE', 'Indian/Antananarivo'),
    'locale' => env('APP_LOCALE', 'fr_MG'),
    'session_name' => env('SESSION_NAME', 'FJKM_OBLIGATION_SESSION'),
    'remember_cookie' => env('REMEMBER_COOKIE', 'fjkm_remember_token'),
    'csrf_key' => env('CSRF_KEY', '_csrf_token'),
    'login_max_attempts' => (int)env('LOGIN_MAX_ATTEMPTS', 5),
    'login_decay_minutes' => (int)env('LOGIN_DECAY_MINUTES', 15),
    'upload_max_size' => (int)env('UPLOAD_MAX_SIZE', 2097152),
    'allowed_images' => array_map('trim', explode(',', env('ALLOWED_IMAGES', 'jpg,jpeg,png,webp'))),
];
