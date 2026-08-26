<?php
/*
 | Commentaire technique
 | Ce fichier contient un modèle : il centralise les requêtes SQL et les opérations liées à une table de la base de données.
 */
namespace App\Models;

use App\Core\Model;

final class Setting extends Model
{
    protected string $table = 'settings';

    public function get(string $key, mixed $default = null): mixed
    {
        $stmt = $this->db->prepare("SELECT value FROM settings WHERE `key`=:key LIMIT 1");
        $stmt->execute(['key' => $key]);
        $value = $stmt->fetchColumn();
        return $value !== false ? $value : $default;
    }

    public function set(string $key, mixed $value): void
    {
        $stmt = $this->db->prepare("INSERT INTO settings(`key`,`value`) VALUES(:k,:v_insert) ON DUPLICATE KEY UPDATE `value`=:v_update");
        $stmt->execute(['k' => $key, 'v_insert' => (string)$value, 'v_update' => (string)$value]);
    }
}
