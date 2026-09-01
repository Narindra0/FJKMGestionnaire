<?php
/**
 * Script d'initialisation de la base de données
 * Usage : php scripts/setup-db.php
 * 
 * Ce script importe le fichier SQL et vérifie la connexion.
 */

define('BASE_PATH', dirname(__DIR__));

// Autoloader Composer (classe App\Core\Database, etc.)
require BASE_PATH . '/vendor/autoload.php';

// Autoloader personnalisé pour les namespaces PSR-4 avec casse lowercase
// Les dossiers app/ utilisent des noms lowercase (core, controllers, etc.)
// tandis que les namespaces PSR-4 utilisent PascalCase (App\Core, App\Controllers, etc.)
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

// Charger les helpers
require BASE_PATH . '/app/helpers/url_helper.php';
require BASE_PATH . '/app/helpers/security_helper.php';
require BASE_PATH . '/app/helpers/format_helper.php';
load_env();

use App\Core\Database;

echo "=== FJKM Gestionnaire - Setup Database ===\n\n";

// Diagnostic : afficher les paramètres de connexion (sans le mot de passe)
$config = require BASE_PATH . '/app/config/database.php';
echo "📋 Paramètres de connexion :\n";
echo "   Driver   : {$config['driver']}\n";
echo "   Host     : {$config['host']}\n";
echo "   Port     : {$config['port']}\n";
echo "   Database : {$config['database']}\n";
echo "   Username : {$config['username']}\n";
echo "   Password : " . (strlen($config['password']) > 0 ? '***(' . strlen($config['password']) . ' chars)' : '(vide)') . "\n";
echo "   SSL CA   : " . ($config['ssl_ca'] ?: '(auto-detect)') . "\n\n";

try {
    $db = Database::connection();
    echo "✅ Connexion à la base de données réussie\n\n";
    
    // Vérifier si les tables existent
    $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    $expectedTables = ['users', 'roles', 'fideles', 'obligations', 'obligation_payments', 
                       'finance_entries', 'finance_exits', 'communion_payments', 'projects', 
                       'project_payments', 'settings', 'audit_logs', 'login_attempts'];
    
    $missingTables = array_diff($expectedTables, $tables);
    
    if (!empty($missingTables)) {
        echo "⚠️  Tables manquantes détectées : " . implode(', ', $missingTables) . "\n";
        echo "📄 Importation du fichier SQL...\n";
        
        $sqlFile = BASE_PATH . '/Database/fjkm_obligation.sql';
        if (is_file($sqlFile)) {
            $sql = file_get_contents($sqlFile);
            
            // Séparer les requêtes et nettoyer les commentaires SQL
            $chunks = explode(';', $sql);
            $queries = [];
            foreach ($chunks as $chunk) {
                // Supprimer les lignes de commentaires (-- et #)
                $lines = explode("\n", $chunk);
                $lines = array_filter($lines, fn($line) => !preg_match('/^\s*(--|#)/', $line));
                $cleaned = trim(implode("\n", $lines));
                if (!empty($cleaned)) {
                    $queries[] = $cleaned;
                }
            }
            
            $imported = 0;
            foreach ($queries as $query) {
                try {
                    $db->exec($query);
                    $imported++;
                } catch (PDOException $e) {
                    // Ignorer les erreurs de doublons (table/collection existe déjà)
                    if ($e->getCode() != '42S01') {
                        echo "⚠️  Erreur : " . $e->getMessage() . "\n";
                    }
                }
            }
            
            echo "✅ $imported requêtes importées avec succès\n\n";
        } else {
            echo "❌ Fichier SQL introuvable : $sqlFile\n";
            exit(1);
        }
    } else {
        echo "✅ Toutes les tables existent\n\n";
    }
    
    // Vérifier les utilisateurs
    $userCount = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();
    echo "👥 Nombre d'utilisateurs : $userCount\n";
    
    if ($userCount == 0) {
        echo "⚠️  Aucun utilisateur trouvé. Création d'un administrateur par défaut...\n";
        
        $hash = password_hash('admin123', PASSWORD_DEFAULT);
        $db->exec("INSERT INTO users (role_id, name, email, password, status, created_at) 
                    VALUES (1, 'Administrateur', 'admin@fjkm.mg', '$hash', 'active', NOW())");
        
        echo "✅ Administrateur créé :\n";
        echo "   Email : admin@fjkm.mg\n";
        echo "   Mot de passe : admin123\n";
        echo "   ⚠️  Changez ce mot de passe après la première connexion !\n\n";
    }
    
    echo "=== Setup terminé avec succès ===\n";
    
} catch (PDOException $e) {
    echo "❌ Erreur de connexion : " . $e->getMessage() . "\n";
    echo "\nVérifiez vos variables d'environnement dans le fichier .env\n";
    exit(1);
}
