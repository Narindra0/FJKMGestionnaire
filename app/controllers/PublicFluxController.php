<?php
/*
 | Commentaire technique
 | Ce fichier contient un contrôleur MVC : il reçoit les requêtes, appelle les services ou modèles nécessaires, puis renvoie la vue ou la réponse adaptée.
 | API publique de consultation en lecture seule : agrégats financiers destinés à la landing page.
 */
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Database;

/*
 |--------------------------------------------------------------------------
 | Espace public de visualisation des flux (lecture seule, sans session)
 |--------------------------------------------------------------------------
 | Volonté produit : exposer uniquement des informations clés et agrégées
 | (entrées, sorties, solde, catégories, derniers mouvements) sans aucune
 | donnée sensible : ni nom de fidèle, ni bénéficiaire, ni libellé, ni
 | référence, ni utilisateur. Les totaux suivent la même logique que le
 | tableau de bord (FinanceService) : la communion est intégrée aux recettes.
 */
final class PublicFluxController extends Controller
{
    private const MIN_YEAR = 2020;

    /* Sources d'entrées : [table, colonne de date] — liste fermée, jamais saisie. */
    private const ENTRY_SOURCES = [
        ['finance_entries', 'operation_date'],
        ['communion_payments', 'payment_date'],
        ['obligation_payments', 'payment_date'],
        ['project_payments', 'payment_date'],
    ];

    public function overview(): void
    {
        // Court cache public : les agrégats n'ont pas besoin d'être temps réel
        // et cela protège la base des rafraîchissements répétés de la page.
        header('Cache-Control: public, max-age=60');

        $currentYear = (int)date('Y');
        $requested = (int)($_GET['year'] ?? $currentYear);
        $year = ($requested >= self::MIN_YEAR && $requested <= $currentYear + 1) ? $requested : $currentYear;

        $months = $this->monthlyFlows($year);
        $entries = array_sum(array_column($months, 'entries'));
        $exits = array_sum(array_column($months, 'exits'));

        $this->json([
            'success' => true,
            'year' => $year,
            'years' => $this->availableYears($currentYear),
            'totals' => [
                'entries' => round($entries, 2),
                'exits' => round($exits, 2),
                'balance' => round($entries - $exits, 2),
            ],
            'months' => $months,
            'categories' => [
                'entries' => $this->categoryBreakdown('finance_entries', 'operation_date', $year),
                'exits' => $this->categoryBreakdown('finance_exits', 'operation_date', $year),
            ],
            'movements' => $this->recentMovements($year),
            'generated_at' => date('c'),
        ]);
    }

    /* Série mensuelle complète (toutes sources confondues) via des GROUP BY uniques. */
    private function monthlyFlows(int $year): array
    {
        $entries = array_fill(1, 12, 0.0);
        $exits = array_fill(1, 12, 0.0);
        $db = Database::connection();

        foreach (self::ENTRY_SOURCES as [$table, $column]) {
            foreach ($this->groupedMonthlySum($db, $table, $column, $year) as $month => $sum) {
                $entries[$month] += $sum;
            }
        }
        foreach ($this->groupedMonthlySum($db, 'finance_exits', 'operation_date', $year) as $month => $sum) {
            $exits[$month] += $sum;
        }

        $months = [];
        foreach (range(1, 12) as $m) {
            $months[] = [
                'month' => $m,
                'label' => date('M', mktime(0, 0, 0, $m, 1, $year)),
                'entries' => round($entries[$m], 2),
                'exits' => round($exits[$m], 2),
                'balance' => round($entries[$m] - $exits[$m], 2),
            ];
        }
        return $months;
    }

    private function groupedMonthlySum(\PDO $db, string $table, string $column, int $year): array
    {
        $stmt = $db->prepare("SELECT MONTH({$column}) AS m, COALESCE(SUM(amount), 0) AS total
            FROM {$table} WHERE YEAR({$column}) = :year GROUP BY m");
        $stmt->execute(['year' => $year]);
        $result = [];
        foreach ($stmt->fetchAll() as $row) {
            $month = (int)$row['m'];
            if ($month >= 1 && $month <= 12) {
                $result[$month] = (float)$row['total'];
            }
        }
        return $result;
    }

    /* Répartition par catégorie : date + catégorie + montant, rien d'autre. */
    private function categoryBreakdown(string $table, string $column, int $year): array
    {
        $allowed = ['finance_entries', 'finance_exits'];
        if (!in_array($table, $allowed, true)) {
            return [];
        }
        $db = Database::connection();
        $stmt = $db->prepare("SELECT category, COALESCE(SUM(amount), 0) AS total, COUNT(*) AS operations
            FROM {$table} WHERE YEAR({$column}) = :year
            GROUP BY category ORDER BY total DESC LIMIT 8");
        $stmt->execute(['year' => $year]);
        return array_map(static function (array $row): array {
            return [
                'category' => (string)$row['category'],
                'total' => round((float)$row['total'], 2),
                'operations' => (int)$row['operations'],
            ];
        }, $stmt->fetchAll());
    }

    /* Derniers mouvements de caisse, agrégés volontairement : jamais de libellé,
       bénéficiaire, référence ou auteur. */
    private function recentMovements(int $year): array
    {
        $db = Database::connection();
        $stmt = $db->prepare("SELECT operation_date, category, amount, type FROM (
                SELECT operation_date, category, amount, 'entree' AS type, id FROM finance_entries WHERE YEAR(operation_date) = :year_e
                UNION ALL
                SELECT operation_date, category, amount, 'sortie' AS type, id FROM finance_exits WHERE YEAR(operation_date) = :year_x
            ) AS flows
            ORDER BY operation_date DESC, id DESC LIMIT 12");
        $stmt->execute(['year_e' => $year, 'year_x' => $year]);
        return array_map(static function (array $row): array {
            return [
                'date' => (string)$row['operation_date'],
                'type' => (string)$row['type'],
                'category' => (string)$row['category'],
                'amount' => round((float)$row['amount'], 2),
            ];
        }, $stmt->fetchAll());
    }

    /* Années réellement présentes en base (bornées), pour le sélecteur public. */
    private function availableYears(int $currentYear): array
    {
        $db = Database::connection();
        $years = [];
        foreach ([['finance_entries', 'operation_date'], ['finance_exits', 'operation_date'],
                  ['communion_payments', 'payment_date'], ['obligation_payments', 'payment_date'],
                  ['project_payments', 'payment_date']] as [$table, $column]) {
            $stmt = $db->prepare("SELECT DISTINCT YEAR({$column}) AS y FROM {$table}
                WHERE YEAR({$column}) BETWEEN :min AND :max ORDER BY y DESC");
            $stmt->execute(['min' => self::MIN_YEAR, 'max' => $currentYear]);
            foreach ($stmt->fetchAll() as $row) {
                $years[(int)$row['y']] = true;
            }
        }
        $years[$currentYear] = true;
        $list = array_keys($years);
        rsort($list);
        return $list;
    }
}
