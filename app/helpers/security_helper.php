<?php
/*
 | Commentaire technique
 | Ce fichier contient des fonctions d'aide réutilisables dans les vues et dans les traitements applicatifs.
 */
use App\Core\Csrf;

function e(mixed $value): string {
    return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}

function csrf_field(): string {
    return '<input type="hidden" name="_csrf" value="' . e(Csrf::token()) . '">';
}

function csrf_token(): string {
    return Csrf::token();
}
