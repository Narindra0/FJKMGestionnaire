<?php
/*
 | Commentaire technique
 | Ce fichier contient la configuration de la base de données.
 | Les valeurs sont chargées depuis le fichier .env via la fonction env().
 | Si le fichier .env n'existe pas, les valeurs par défaut sont utilisées.
 */
return [
    'driver' => env('DB_DRIVER', 'mysql'),
    'host' => env('DB_HOST', '127.0.0.1'),
    'port' => env('DB_PORT', '3306'),
    'database' => env('DB_DATABASE', 'fjkm_obligation'),
    'username' => env('DB_USERNAME', 'root'),
    'password' => env('DB_PASSWORD', ''),
    'charset' => env('DB_CHARSET', 'utf8mb4'),
    'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
];
