<?php
/*
 | Commentaire technique
 | Ce fichier contient un modèle : il centralise les requêtes SQL et les opérations liées à une table de la base de données.
 */
namespace App\Models;

use App\Core\Model;

/* Fidèles : base des membres, utilisée par les obligations et la communion. */
final class Fidel extends Model
{
    protected string $table = 'fideles';
    private static bool $groupColumnChecked = false;

    public function __construct()
    {
        parent::__construct();
        $this->ensureGroupColumn();
    }

    private function ensureGroupColumn(): void
    {
        if (self::$groupColumnChecked) return;
        self::$groupColumnChecked = true;
        try {
            $stmt = $this->db->query("SHOW COLUMNS FROM fideles LIKE 'group_name'");
            if (!$stmt->fetch()) {
                $this->db->exec("ALTER TABLE fideles ADD COLUMN group_name VARCHAR(120) NULL AFTER phone");
                $this->db->exec("CREATE INDEX idx_fideles_group ON fideles(group_name)");
            }
        } catch (\Throwable $e) {
            \App\Core\Logger::error('Auto-migration fideles', ['error' => $e->getMessage()]);
        }
    }

    public function search(string $q = ''): array
    {
        $sql = "SELECT * FROM fideles WHERE full_name LIKE :q_name OR matricule LIKE :q_matricule OR phone LIKE :q_phone OR group_name LIKE :q_group ORDER BY id DESC LIMIT 50";
        $stmt = $this->db->prepare($sql);
        $like = '%' . $q . '%';
        $stmt->execute(['q_name' => $like, 'q_matricule' => $like, 'q_phone' => $like, 'q_group' => $like]);
        return $stmt->fetchAll();
    }

    public function findByMatricule(string $matricule): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM fideles WHERE matricule = :matricule LIMIT 1");
        $stmt->execute(['matricule' => trim($matricule)]);
        return $stmt->fetch() ?: null;
    }

    public function findByLookup(string $lookup): ?array
    {
        $lookup = trim($lookup);
        if ($lookup === '') return null;

        // Les champs tapables acceptent les anciens matricules (FJKM-2026-00002)
        // ainsi que le nouveau format simplifié (FJKM-00002).
        if (preg_match('/(FJKM-(?:\d{4}-)?\d{5})/i', $lookup, $m)) {
            return $this->findByMatricule(strtoupper($m[1]));
        }

        $stmt = $this->db->prepare("SELECT * FROM fideles WHERE matricule = :matricule_exact OR full_name = :name_exact OR matricule LIKE :matricule_like OR full_name LIKE :name_like OR group_name LIKE :group_like ORDER BY full_name ASC LIMIT 1");
        $like = '%' . $lookup . '%';
        $stmt->execute([
            'matricule_exact' => $lookup,
            'name_exact' => $lookup,
            'matricule_like' => $like,
            'name_like' => $like,
            'group_like' => $like,
        ]);
        return $stmt->fetch() ?: null;
    }

    public function withFinancialStatus(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT f.*, COALESCE(SUM(o.amount_due),0) AS total_due, COALESCE(SUM(o.amount_paid),0) AS total_paid,
            COALESCE(SUM(o.amount_due-o.amount_paid),0) AS total_rest
            FROM fideles f LEFT JOIN obligations o ON o.fidel_id=f.id WHERE f.id=:id GROUP BY f.id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch() ?: null;
    }

    public function obligations(int $id): array
    {
        $stmt = $this->db->prepare("SELECT o.*,
                CONCAT(CASE o.period_month
                    WHEN 1 THEN 'Janvier' WHEN 2 THEN 'Février' WHEN 3 THEN 'Mars'
                    WHEN 4 THEN 'Avril' WHEN 5 THEN 'Mai' WHEN 6 THEN 'Juin'
                    WHEN 7 THEN 'Juillet' WHEN 8 THEN 'Août' WHEN 9 THEN 'Septembre'
                    WHEN 10 THEN 'Octobre' WHEN 11 THEN 'Novembre' WHEN 12 THEN 'Décembre'
                    ELSE 'Mois' END, ' ', o.period_year) AS period_name,
                MAX(op.payment_date) AS last_payment_date
            FROM obligations o
            LEFT JOIN obligation_payments op ON op.obligation_id = o.id
            WHERE o.fidel_id=:id
            GROUP BY o.id
            ORDER BY COALESCE(MAX(op.payment_date), DATE(o.created_at)) DESC, o.id DESC");
        $stmt->execute(['id' => $id]);
        return $stmt->fetchAll();
    }

    public function communionHistory(int $id): array
    {
        $stmt = $this->db->prepare("SELECT cp.*,
                CASE cp.paid_month
                    WHEN 1 THEN 'Janvier' WHEN 2 THEN 'Février' WHEN 3 THEN 'Mars'
                    WHEN 4 THEN 'Avril' WHEN 5 THEN 'Mai' WHEN 6 THEN 'Juin'
                    WHEN 7 THEN 'Juillet' WHEN 8 THEN 'Août' WHEN 9 THEN 'Septembre'
                    WHEN 10 THEN 'Octobre' WHEN 11 THEN 'Novembre' WHEN 12 THEN 'Décembre'
                    ELSE 'Mois' END AS month_name
            FROM communion_payments cp
            WHERE cp.fidel_id=:id
            ORDER BY cp.payment_date DESC, cp.paid_year DESC, cp.paid_month DESC, cp.id DESC");
        $stmt->execute(['id' => $id]);
        return $stmt->fetchAll();
    }

    public function nextMatricule(): string
    {
        // Le nouveau format est volontairement indépendant de l'année : FJKM-00001.
        // Les anciens matricules FJKM-AAAA-00001 restent acceptés et participent au calcul
        // afin que la numérotation continue sans doublon après la migration.
        $stmt = $this->db->prepare("SELECT matricule FROM fideles WHERE matricule LIKE 'FJKM-%'");
        $stmt->execute();
        $lastNumber = 0;
        foreach ($stmt->fetchAll(\PDO::FETCH_COLUMN) as $matricule) {
            if (preg_match('/^FJKM-(?:\d{4}-)?(\d{5})$/i', trim((string)$matricule), $m)) {
                $lastNumber = max($lastNumber, (int)$m[1]);
            }
        }
        return 'FJKM-' . str_pad((string)($lastNumber + 1), 5, '0', STR_PAD_LEFT);
    }
}
