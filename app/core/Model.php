<?php
/*
 | Commentaire technique
 | Ce fichier fait partie du noyau de l'application : il gère les mécanismes communs comme le routage, la session, la sécurité ou l'accès aux vues.
 */
namespace App\Core;

use PDO;

/*
 |--------------------------------------------------------------------------
 | Modèle de base MVC
 |--------------------------------------------------------------------------
 | Toutes les classes Model héritent de cette classe pour éviter la répétition
 | du code CRUD simple : lecture, création, modification, suppression.
 */
abstract class Model
{
    protected PDO $db;
    protected string $table = '';
    protected string $primaryKey = 'id';

    public function __construct()
    {
        // Connexion PDO unique et sécurisée, centralisée dans Database.
        $this->db = Database::connection();
    }

    public function all(string $orderBy = 'id DESC'): array
    {
        // $orderBy est contrôlé côté code, jamais directement depuis un champ utilisateur.
        $stmt = $this->db->query("SELECT * FROM {$this->table} ORDER BY {$orderBy}");
        return $stmt->fetchAll();
    }

    public function find(int $id): ?array
    {
        // Requête préparée pour empêcher l'injection SQL.
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE {$this->primaryKey} = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function create(array $data): int
    {
        // Construction dynamique des colonnes, puis exécution préparée.
        $columns = array_keys($data);
        $fields = implode(',', $columns);
        $params = ':' . implode(',:', $columns);
        $sql = "INSERT INTO {$this->table} ({$fields}) VALUES ({$params})";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($data);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        // Seules les colonnes fournies dans $data sont modifiées.
        $sets = implode(',', array_map(fn($c) => "{$c} = :{$c}", array_keys($data)));
        $data[$this->primaryKey] = $id;
        $sql = "UPDATE {$this->table} SET {$sets} WHERE {$this->primaryKey} = :{$this->primaryKey}";
        return $this->db->prepare($sql)->execute($data);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE {$this->primaryKey} = :id");
        return $stmt->execute(['id' => $id]);
    }

    public function count(): int
    {
        return (int)$this->db->query("SELECT COUNT(*) FROM {$this->table}")->fetchColumn();
    }
}
