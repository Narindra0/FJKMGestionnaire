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
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];

            // SSL pour TiDB Cloud serverless (Connections using insecure transport are prohibited)
            if (!empty($config['ssl_ca'])) {
                $options[PDO::MYSQL_ATTR_SSL_CA] = $config['ssl_ca'];
            } elseif ($config['driver'] === 'mysql' && str_contains($config['host'], 'tidbcloud.com')) {
                // Auto-détecter TiDB Cloud : utiliser le bundle CA système
                $caPaths = [
                    '/etc/ssl/certs/ca-certificates.crt', // Debian/Ubuntu
                    '/etc/pki/tls/certs/ca-bundle.crt',   // RHEL/CentOS
                    '/etc/ssl/ca-bundle.pem',              // OpenSUSE
                ];
                foreach ($caPaths as $caPath) {
                    if (is_file($caPath)) {
                        $options[PDO::MYSQL_ATTR_SSL_CA] = $caPath;
                        break;
                    }
                }
            }

            self::$pdo = new PDO($dsn, $config['username'], $config['password'], $options);
            self::$pdo->exec("SET NAMES {$config['charset']} COLLATE {$config['collation']}");
            return self::$pdo;
        } catch (PDOException $e) {
            throw new \RuntimeException('Connexion base de données impossible : ' . $e->getMessage());
        }
    }
}
