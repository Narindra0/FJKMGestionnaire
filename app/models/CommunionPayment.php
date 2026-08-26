<?php
/*
 | Commentaire technique
 | Ce fichier contient un modèle : il centralise les requêtes SQL et les opérations liées à une table de la base de données.
 | Il contient aussi une petite auto-vérification de structure pour éviter les erreurs après une mise à jour du projet sans réimport complet de la base.
 */
namespace App\Models;

use App\Core\Model;

/* Entrées communion : versements reçus des chrétiens pour les mois de communion. */
final class CommunionPayment extends Model
{
    protected string $table = 'communion_payments';
    private static bool $schemaChecked = false;

    public function __construct()
    {
        parent::__construct();
        $this->ensureSchema();
    }

    /**
     * Vérifie les colonnes utiles au module Communion.
     * Cette protection évite une page « Erreur base de données » lorsque l'utilisateur
     * a remplacé les fichiers PHP/CSS sans réimporter la dernière base SQL.
     * Les ALTER TABLE sont exécutés une seule fois grâce au flag statique $schemaChecked.
     */
    private function ensureSchema(): void
    {
        if (self::$schemaChecked) return;
        self::$schemaChecked = true;

        try {
            $table = $this->db->query("SHOW TABLES LIKE 'communion_payments'")->fetchColumn();
            if (!$table) return;

            $columns = $this->columns();
            $alterStatements = [];

            if (!isset($columns['period_type'])) {
                $alterStatements[] = "ADD COLUMN period_type ENUM('monthly','annual') NOT NULL DEFAULT 'monthly' AFTER fidel_id";
            }
            if (!isset($columns['paid_year'])) {
                $alterStatements[] = "ADD COLUMN paid_year INT NOT NULL DEFAULT YEAR(CURDATE()) AFTER period_type";
            }
            if (!isset($columns['paid_month'])) {
                $alterStatements[] = "ADD COLUMN paid_month TINYINT UNSIGNED NOT NULL DEFAULT MONTH(CURDATE()) AFTER paid_year";
            }
            if (!isset($columns['payment_method'])) {
                $alterStatements[] = "ADD COLUMN payment_method VARCHAR(60) NOT NULL DEFAULT 'Espèces' AFTER payment_date";
            }
            if (!isset($columns['reference'])) {
                $alterStatements[] = "ADD COLUMN reference VARCHAR(120) NOT NULL DEFAULT '' AFTER payment_method";
            }
            if (!isset($columns['created_by'])) {
                $alterStatements[] = "ADD COLUMN created_by INT UNSIGNED NULL AFTER reference";
            }
            if (!isset($columns['created_at'])) {
                $alterStatements[] = "ADD COLUMN created_at DATETIME NULL AFTER created_by";
            }

            if ($alterStatements) {
                $sql = "ALTER TABLE communion_payments " . implode(', ', $alterStatements);
                $this->db->exec($sql);
            }

            $this->ensureIndex('idx_communion_date', "CREATE INDEX idx_communion_date ON communion_payments(payment_date)");
            $this->ensureIndex('idx_communion_paid_period', "CREATE INDEX idx_communion_paid_period ON communion_payments(paid_year, paid_month)");
            $this->ensureIndex('idx_communion_fidel', "CREATE INDEX idx_communion_fidel ON communion_payments(fidel_id)");
            $this->ensureIndex('idx_communion_period', "CREATE INDEX idx_communion_period ON communion_payments(period_type)");
            $this->ensureIndex('uniq_communion_reference', "CREATE UNIQUE INDEX uniq_communion_reference ON communion_payments(reference)");
            $this->ensureIndex('uniq_communion_fidel_period', "CREATE UNIQUE INDEX uniq_communion_fidel_period ON communion_payments(fidel_id, paid_year, paid_month)");
        } catch (\Throwable $e) {
            \App\Core\Logger::error('Auto-migration communion_payments', ['error' => $e->getMessage()]);
        }
    }

    /** Retourne les colonnes disponibles dans la table. */
    private function columns(): array
    {
        $columns = [];
        foreach ($this->db->query("SHOW COLUMNS FROM communion_payments")->fetchAll() as $column) {
            $columns[(string)$column['Field']] = true;
        }
        return $columns;
    }

    /** Crée un index uniquement s'il n'existe pas déjà. */
    private function ensureIndex(string $name, string $sql): void
    {
        try {
            $stmt = $this->db->prepare("SHOW INDEX FROM communion_payments WHERE Key_name = :name");
            $stmt->execute(['name' => $name]);
            if (!$stmt->fetch()) {
                $this->db->exec($sql);
            }
        } catch (\Throwable $e) {
            // En cas d'anciens doublons, l'index unique peut être refusé ; l'application continue grâce aux contrôles PHP.
        }
    }

    public function list(): array
    {
        return $this->db->query("SELECT cp.*, f.matricule, f.full_name
            FROM communion_payments cp
            JOIN fideles f ON f.id=cp.fidel_id
            ORDER BY cp.payment_date DESC, cp.id DESC")->fetchAll();
    }

    public function paidByMonth(int $year, int $month): array
    {
        $stmt = $this->db->prepare("SELECT f.id, f.matricule, f.full_name, COALESCE(SUM(cp.amount),0) AS total_paid, MAX(cp.payment_date) AS last_payment_date
            FROM communion_payments cp
            JOIN fideles f ON f.id=cp.fidel_id
            WHERE cp.paid_year = :year AND cp.paid_month = :month
            GROUP BY f.id, f.matricule, f.full_name
            ORDER BY f.full_name ASC");
        $stmt->execute(['year' => $year, 'month' => $month]);
        return $stmt->fetchAll();
    }

    public function unpaidByMonth(int $year, int $month): array
    {
        $stmt = $this->db->prepare("SELECT f.id, f.matricule, f.full_name, f.phone
            FROM fideles f
            WHERE f.status='active'
              AND NOT EXISTS (
                SELECT 1 FROM communion_payments cp
                WHERE cp.fidel_id=f.id AND cp.paid_year = :year AND cp.paid_month = :month
              )
            ORDER BY f.full_name ASC");
        $stmt->execute(['year' => $year, 'month' => $month]);
        return $stmt->fetchAll();
    }

    public function historyForFidel(int $fidelId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM communion_payments WHERE fidel_id=:id ORDER BY paid_year DESC, paid_month DESC, payment_date DESC, id DESC LIMIT 36");
        $stmt->execute(['id' => $fidelId]);
        return $stmt->fetchAll();
    }

    public function maxPaidYearForFidel(int $fidelId): ?int
    {
        $stmt = $this->db->prepare("SELECT MAX(paid_year) FROM communion_payments WHERE fidel_id=:id");
        $stmt->execute(['id' => $fidelId]);
        $value = $stmt->fetchColumn();
        return $value ? (int)$value : null;
    }

    public function existsForPeriod(int $fidelId, int $year, int $month, ?int $excludeId = null): bool
    {
        $sql = "SELECT id FROM communion_payments WHERE fidel_id=:fidel_id AND paid_year=:year AND paid_month=:month";
        $params = ['fidel_id' => $fidelId, 'year' => $year, 'month' => $month];
        if ($excludeId !== null) {
            $sql .= " AND id <> :exclude_id";
            $params['exclude_id'] = $excludeId;
        }
        $sql .= " LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (bool)$stmt->fetchColumn();
    }

    public function referenceExists(string $reference): bool
    {
        $stmt = $this->db->prepare("SELECT id FROM communion_payments WHERE reference = :reference LIMIT 1");
        $stmt->execute(['reference' => $reference]);
        return (bool)$stmt->fetchColumn();
    }

    /**
     * Génère une référence réellement unique, même si l'utilisateur a conservé
     * une ancienne page ouverte avec une référence déjà utilisée.
     */
    public function uniqueReference(string $baseRef, int $year, int $month, int $fidelId): string
    {
        $base = strtoupper(trim($baseRef));
        $base = preg_replace('/[^A-Z0-9\-]/', '-', $base) ?: 'COM-ENT';
        $base = preg_replace('/-+/', '-', trim($base, '-')) ?: 'COM-ENT';
        $base = preg_replace('/-\d{4}-\d{2}(?:-F?\d+)?$/', '', $base) ?: 'COM-ENT';

        $suffix = $year . '-' . str_pad((string)$month, 2, '0', STR_PAD_LEFT) . '-F' . str_pad((string)$fidelId, 5, '0', STR_PAD_LEFT);
        $maxBaseLength = 118 - strlen($suffix);
        $base = substr($base, 0, max(7, $maxBaseLength));
        $candidate = $base . '-' . $suffix;

        $attempt = 2;
        while ($this->referenceExists($candidate)) {
            $extra = '-' . $attempt;
            $candidate = substr($base . '-' . $suffix, 0, 120 - strlen($extra)) . $extra;
            $attempt++;
            if ($attempt > 99) {
                $candidate = 'COM-ENT-' . date('YmdHis') . '-' . $month . '-' . random_int(100, 999);
                if (!$this->referenceExists($candidate)) break;
            }
        }
        return $candidate;
    }
}
