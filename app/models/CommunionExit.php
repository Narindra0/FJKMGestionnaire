<?php
/*
 | Commentaire technique
 | Ce fichier contient un modèle : il centralise les requêtes SQL et les opérations liées à une table de la base de données.
 */
namespace App\Models;

use App\Core\Model;

/*
 |--------------------------------------------------------------------------
 | Sorties communion : dépenses liées uniquement à la communion.
 |--------------------------------------------------------------------------
 | Note : Ce modèle est conservé pour compatibilité avec d'éventuelles anciennes
 | procédures. Les sorties communion passent désormais par finance_exits
 | avec la catégorie "Communion".
 */
final class CommunionExit extends Model
{
    protected string $table = 'communion_exits';

    public function recent(int $limit = 100): array
    {
        $stmt = $this->db->prepare("SELECT ce.*, u.name AS created_by_name
            FROM communion_exits ce
            LEFT JOIN users u ON u.id=ce.created_by
            ORDER BY ce.operation_date DESC, ce.id DESC
            LIMIT :limit");
        $stmt->bindValue('limit', $limit, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
