<?php
/*
 | Commentaire technique
 | Ce fichier fait partie du noyau de l'application : il gère les mécanismes communs comme le routage, la session, la sécurité ou l'accès aux vues.
 */
namespace App\Core;

final class Logger
{
    private static ?string $logDir = null;

    public static function info(string $message, array $context = []): void
    {
        self::write('INFO', $message, $context);
    }

    public static function error(string $message, array $context = []): void
    {
        self::write('ERROR', $message, $context);
    }

    private static function write(string $level, string $message, array $context = []): void
    {
        if (self::$logDir === null) {
            self::$logDir = BASE_PATH . '/storage/logs';
            if (!is_dir(self::$logDir)) {
                mkdir(self::$logDir, 0775, true);
            }
        }
        $line = sprintf("[%s] %s %s %s\n", date('Y-m-d H:i:s'), $level, $message, json_encode($context, JSON_UNESCAPED_UNICODE));
        file_put_contents(self::$logDir . '/app-' . date('Y-m-d') . '.log', $line, FILE_APPEND | LOCK_EX);
    }
}
