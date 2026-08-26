<?php
/*
 | Commentaire technique
 | Ce fichier fait partie du noyau de l'application : il gère les mécanismes communs comme le routage, la session, la sécurité ou l'accès aux vues.
 */
namespace App\Core;

use PDO;
use PDOException;

final class Database
{
    private static ?PDO $pdo = null;

    public static function connection(): PDO
    {
        if (self::$pdo !== null) {
            return self::$pdo;
        }

        $config = require BASE_PATH . '/app/config/database.php';
        $dsn = sprintf('%s:host=%s;port=%s;dbname=%s;charset=%s',
            $config['driver'], $config['host'], $config['port'], $config['database'], $config['charset']
        );

        try {
            self::$pdo = new PDO($dsn, $config['username'], $config['password'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
            self::$pdo->exec("SET NAMES {$config['charset']} COLLATE {$config['collation']}");
            return self::$pdo;
        } catch (PDOException $e) {
            throw new \RuntimeException('Connexion base de données impossible : ' . $e->getMessage());
        }
    }
}
