<?php
/*
 | Commentaire technique
 | Ce fichier contient un modèle : il centralise les requêtes SQL et les opérations liées à une table de la base de données.
 | Le journal d'audit ne doit jamais bloquer l'enregistrement principal : une erreur de log est donc ignorée proprement.
 */
namespace App\Models;

use App\Core\Model;

final class AuditLog extends Model
{
    protected string $table = 'audit_logs';

    public function record(?int $userId, string $action, string $entity, ?int $entityId = null, array $payload = []): void
    {
        try {
            $this->create([
                'user_id' => $userId,
                'action' => $action,
                'entity' => $entity,
                'entity_id' => $entityId,
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
                'user_agent' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 250),
                'payload' => json_encode($payload, JSON_UNESCAPED_UNICODE),
                'created_at' => date('Y-m-d H:i:s'),
            ]);
        } catch (\Throwable $e) {
            // Le journal d'audit est utile pour le suivi, mais il ne doit pas provoquer une erreur utilisateur pendant une saisie.
            \App\Core\Logger::error('AuditLog record failed', ['action' => $action, 'error' => $e->getMessage()]);
        }
    }

    /**
     * Retourne les logs filtrés avec pagination pour la page Journal d'activité.
     */
    public function getFiltered(array $filters = [], int $page = 1, int $perPage = 30): array
    {
        $page = max(1, $page);
        $where = '1=1';
        $params = [];

        if (!empty($filters['from'])) {
            $where .= ' AND a.created_at >= :from';
            $params['from'] = $filters['from'] . ' 00:00:00';
        }
        if (!empty($filters['to'])) {
            $where .= ' AND a.created_at <= :to';
            $params['to'] = $filters['to'] . ' 23:59:59';
        }
        if (!empty($filters['user_id'])) {
            $where .= ' AND a.user_id = :user_id';
            $params['user_id'] = (int)$filters['user_id'];
        }
        if (!empty($filters['action'])) {
            $where .= ' AND a.action = :action';
            $params['action'] = $filters['action'];
        }
        if (!empty($filters['entity'])) {
            $where .= ' AND a.entity = :entity';
            $params['entity'] = $filters['entity'];
        }
        if (!empty($filters['search'])) {
            $where .= ' AND (a.payload LIKE :search OR u.name LIKE :search_name)';
            $params['search'] = '%' . $filters['search'] . '%';
            $params['search_name'] = '%' . $filters['search'] . '%';
        }

        // Total pour pagination
        $countStmt = $this->db->prepare("SELECT COUNT(*) FROM audit_logs a LEFT JOIN users u ON u.id=a.user_id WHERE {$where}");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        $offset = ($page - 1) * $perPage;
        $totalPages = max(1, (int)ceil($total / $perPage));

        $stmt = $this->db->prepare("
            SELECT a.*, u.name AS user_name, u.email AS user_email
            FROM audit_logs a
            LEFT JOIN users u ON u.id = a.user_id
            WHERE {$where}
            ORDER BY a.id DESC
            LIMIT :limit OFFSET :offset
        ");
        $stmt->bindValue('limit', $perPage, \PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, \PDO::PARAM_INT);
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->execute();

        return [
            'items' => $stmt->fetchAll(),
            'total' => $total,
            'page' => $page,
            'perPage' => $perPage,
            'totalPages' => $totalPages,
        ];
    }

    /**
     * Retourne la liste des types d'actions distincts pour le filtre.
     */
    public function distinctActions(): array
    {
        $stmt = $this->db->query("SELECT DISTINCT action FROM audit_logs ORDER BY action");
        return $stmt->fetchAll(\PDO::FETCH_COLUMN);
    }

    /**
     * Retourne la liste des entités distinctes pour le filtre.
     */
    public function distinctEntities(): array
    {
        $stmt = $this->db->query("SELECT DISTINCT entity FROM audit_logs ORDER BY entity");
        return $stmt->fetchAll(\PDO::FETCH_COLUMN);
    }

    /**
     * Libellé humain pour une action.
     */
    public static function actionLabel(string $action): string
    {
        $labels = [
            // Authentification
            'LOGIN_SUCCESS' => 'Connexion réussie',
            'LOGIN_FAILED' => 'Tentative de connexion échouée',
            'LOGOUT' => 'Déconnexion',
            // Utilisateurs
            'CREATE_USER' => 'Création d\'utilisateur',
            'UPDATE_USER_STATUS' => 'Modification du statut utilisateur',
            'UPDATE_USER_PROFILE' => 'Modification du profil utilisateur',
            'CHANGE_USER_PASSWORD' => 'Changement de mot de passe',
            'CHANGE_USER_ROLE' => 'Changement de rôle utilisateur',
            'DELETE_USER' => 'Suppression d\'utilisateur',
            // Chrétien
            'CREATE_CHRISTIANE' => 'Enregistrement d\'un chrétien',
            'UPDATE_CHRISTIANE' => 'Modification d\'un chrétien',
            'DELETE_CHRISTIANE' => 'Suppression d\'un chrétien',
            // Finances - Entrées
            'CREATE_ENTRY' => 'Ajout d\'une entrée financière',
            'UPDATE_ENTRY' => 'Modification d\'une entrée financière',
            'DELETE_ENTRY' => 'Suppression d\'une entrée financière',
            // Finances - Sorties
            'CREATE_EXIT' => 'Ajout d\'une sortie financière',
            'UPDATE_EXIT' => 'Modification d\'une sortie financière',
            'DELETE_EXIT' => 'Suppression d\'une sortie financière',
            // Obligations
            'CREATE_OBLIGATION' => 'Création d\'obligation',
            'UPDATE_OBLIGATION' => 'Modification d\'obligation',
            'DELETE_OBLIGATION' => 'Suppression d\'obligation',
            'UPDATE_OBLIGATION_PAYMENT' => 'Mise à jour de paiement d\'obligation',
            'UPDATE_OBLIGATION_SETTING' => 'Modification du paramètre obligation',
            // Communion
            'CREATE_COMMUNION_ENTRY' => 'Ajout d\'une entrée communion',
            'UPDATE_COMMUNION_ENTRY' => 'Modification d\'une entrée communion',
            'DELETE_COMMUNION_ENTRY' => 'Suppression d\'une entrée communion',
            // Projets
            'CREATE_PROJECT_PARAMETER' => 'Paramétrage d\'un projet',
            'UPDATE_PROJECT_PARAMETER' => 'Modification du paramètre projet',
            'DELETE_PROJECT' => 'Suppression d\'un projet',
            'PAY_PROJECT' => 'Paiement sur projet',
        ];
        return $labels[$action] ?? $action;
    }

    /**
     * Icône Bootstrap pour une action.
     */
    public static function actionIcon(string $action): string
    {
        $icons = [
            'LOGIN_SUCCESS' => 'bi-box-arrow-in-right text-success',
            'LOGIN_FAILED' => 'bi-x-octagon text-danger',
            'LOGOUT' => 'bi-box-arrow-right text-warning',
            'CREATE_USER' => 'bi-person-plus text-primary',
            'UPDATE_USER_STATUS' => 'bi-toggle-on text-info',
            'UPDATE_USER_PROFILE' => 'bi-pencil-square text-info',
            'CHANGE_USER_PASSWORD' => 'bi-key text-warning',
            'CHANGE_USER_ROLE' => 'bi-person-badge text-warning',
            'DELETE_USER' => 'bi-person-x text-danger',
            'CREATE_CHRISTIANE' => 'bi-person-plus-fill text-success',
            'UPDATE_CHRISTIANE' => 'bi-pencil-square text-info',
            'DELETE_CHRISTIANE' => 'bi-person-dash text-danger',
            'CREATE_ENTRY' => 'bi-cash-coin text-success',
            'UPDATE_ENTRY' => 'bi-pencil-square text-info',
            'DELETE_ENTRY' => 'bi-trash text-danger',
            'CREATE_EXIT' => 'bi-cash-stack text-danger',
            'UPDATE_EXIT' => 'bi-pencil-square text-info',
            'DELETE_EXIT' => 'bi-trash text-danger',
            'CREATE_OBLIGATION' => 'bi-file-earmark-plus text-primary',
            'UPDATE_OBLIGATION' => 'bi-file-earmark-text text-info',
            'DELETE_OBLIGATION' => 'bi-file-earmark-x text-danger',
            'UPDATE_OBLIGATION_PAYMENT' => 'bi-wallet2 text-success',
            'UPDATE_OBLIGATION_SETTING' => 'bi-gear text-secondary',
            'CREATE_COMMUNION_ENTRY' => 'bi-people-fill text-success',
            'UPDATE_COMMUNION_ENTRY' => 'bi-pencil-square text-info',
            'DELETE_COMMUNION_ENTRY' => 'bi-people text-danger',
            'CREATE_PROJECT_PARAMETER' => 'bi-building-add text-primary',
            'UPDATE_PROJECT_PARAMETER' => 'bi-building-gear text-info',
            'DELETE_PROJECT' => 'bi-building-x text-danger',
            'PAY_PROJECT' => 'bi-cash text-success',
        ];
        return $icons[$action] ?? 'bi-record-circle text-muted';
    }
}
