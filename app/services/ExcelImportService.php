<?php
/*
 | Commentaire technique
 | Ce fichier contient un service métier : il regroupe des traitements réutilisables afin de garder les contrôleurs plus simples et plus lisibles.
 */
namespace App\Services;

use App\Core\Database;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;
use ZipArchive;

/*
 |--------------------------------------------------------------------------
 | Service d'import Excel
 |--------------------------------------------------------------------------
 | Ce service importe les données depuis un fichier XLSX, XLS ou CSV vers une
 | table autorisée. Il accepte PhpSpreadsheet lorsqu'il est installé, mais il
 | dispose aussi d'un lecteur XLSX/CSV natif pour éviter que l'import soit
 | bloqué sur un poste XAMPP où Composer n'a pas encore été exécuté.
 |
 | La première ligne du fichier reste la ligne d'en-tête. Les noms peuvent être
 | les vrais champs SQL (full_name, phone, operation_date...) ou des libellés
 | simples en français (Nom complet, Téléphone, Date opération...).
 */
final class ExcelImportService
{
    private array $tables = [
        'fideles' => 'Fidèles',
        'finance_entries' => 'Entrées générales',
        'finance_exits' => 'Sorties générales',
        'obligations' => 'Obligations',
        'communion_payments' => 'Entrées communion',
        'communion_exits' => 'Sorties communion',
        'projects' => 'Projets',
    ];

    public function labels(): array
    {
        return $this->tables;
    }

    public function import(string $table, string $filePath, ?string $originalName = null): int
    {
        $this->guard($table);

        $rows = $this->loadRows($filePath, $originalName);
        if (count($rows) < 2) {
            throw new \RuntimeException('Le fichier Excel ne contient aucune donnée à importer.');
        }

        $columnsInfo = $this->columnsInfo($table);
        $allowedColumns = array_keys($columnsInfo);
        $headers = array_map(fn($v) => trim((string)$v), array_values($rows[0]));
        $importColumns = [];

        foreach ($headers as $header) {
            if ($header === '') {
                continue;
            }

            $column = $this->resolveColumn($table, $header, $allowedColumns);
            if ($column === null) {
                throw new \RuntimeException("Colonne inconnue pour {$table} : {$header}. Vérifiez la ligne 1 du fichier Excel.");
            }

            if (in_array($column, $importColumns, true)) {
                throw new \RuntimeException("Colonne répétée dans le fichier Excel : {$column}.");
            }

            $importColumns[] = $column;
        }

        if (!$importColumns) {
            throw new \RuntimeException('Aucune colonne valide trouvée dans la première ligne.');
        }

        $missingRequired = $this->missingRequiredColumns($columnsInfo, $importColumns);
        if ($missingRequired) {
            throw new \RuntimeException('Colonne(s) obligatoire(s) manquante(s) : ' . implode(', ', $missingRequired));
        }

        $db = Database::connection();
        $quotedFields = implode(',', array_map(fn($field) => "`{$field}`", $importColumns));
        $params = ':' . implode(',:', $importColumns);
        $stmt = $db->prepare("INSERT INTO `{$table}` ({$quotedFields}) VALUES ({$params})");

        $count = 0;
        $db->beginTransaction();
        try {
            foreach (array_slice($rows, 1) as $rowIndex => $row) {
                $values = array_values($row);
                $data = [];
                $allEmpty = true;

                foreach ($importColumns as $index => $column) {
                    $value = $values[$index] ?? null;
                    if ($value !== null && trim((string)$value) !== '') {
                        $allEmpty = false;
                    }
                    $data[$column] = $this->normalizeValue($column, $value);
                }

                if ($allEmpty) {
                    continue;
                }

                $stmt->execute($data);
                $count++;
            }
            $db->commit();
        } catch (\Throwable $e) {
            $db->rollBack();
            $line = $count + 2;
            throw new \RuntimeException("Erreur à la ligne Excel {$line} : " . $e->getMessage(), 0, $e);
        }

        return $count;
    }

    private function loadRows(string $filePath, ?string $originalName = null): array
    {
        $extension = strtolower(pathinfo((string)$originalName, PATHINFO_EXTENSION));
        if ($extension === '') {
            $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        }

        if (class_exists(IOFactory::class)) {
            $sheet = IOFactory::load($filePath)->getActiveSheet();
            $rows = $sheet->toArray(null, true, true, false);
            return $this->trimEmptyTrailingRows($rows);
        }

        return match ($extension) {
            'xlsx' => $this->readXlsxNative($filePath),
            'csv' => $this->readCsvNative($filePath),
            'xls' => throw new \RuntimeException('Le format .xls nécessite PhpSpreadsheet. Enregistrez le fichier en .xlsx ou .csv, ou lancez composer install.'),
            default => throw new \RuntimeException('Format non accepté. Utilisez .xlsx, .xls ou .csv.'),
        };
    }

    private function readCsvNative(string $filePath): array
    {
        $content = file_get_contents($filePath);
        if ($content === false) {
            throw new \RuntimeException('Lecture du fichier CSV impossible.');
        }

        $firstLine = strtok($content, "\n") ?: '';
        $delimiter = substr_count($firstLine, ';') >= substr_count($firstLine, ',') ? ';' : ',';
        $handle = fopen($filePath, 'rb');
        if (!$handle) {
            throw new \RuntimeException('Ouverture du fichier CSV impossible.');
        }

        $rows = [];
        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            $rows[] = array_map(fn($value) => $this->removeBom(trim((string)$value)), $row);
        }
        fclose($handle);

        return $this->trimEmptyTrailingRows($rows);
    }

    private function readXlsxNative(string $filePath): array
    {
        if (!class_exists(ZipArchive::class)) {
            throw new \RuntimeException('Extension PHP ZipArchive introuvable. Activez extension=zip dans php.ini, ou installez PhpSpreadsheet avec composer install.');
        }

        $zip = new ZipArchive();
        if ($zip->open($filePath) !== true) {
            throw new \RuntimeException('Ouverture du fichier XLSX impossible. Le fichier est peut-être corrompu.');
        }

        $sharedStrings = $this->readSharedStrings($zip);
        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        if ($sheetXml === false) {
            $zip->close();
            throw new \RuntimeException('Le classeur XLSX ne contient pas de première feuille exploitable.');
        }
        $zip->close();

        $xml = simplexml_load_string($sheetXml);
        if (!$xml || !isset($xml->sheetData)) {
            throw new \RuntimeException('Structure XLSX invalide : données de feuille introuvables.');
        }

        $rows = [];
        foreach ($xml->sheetData->row as $xmlRow) {
            $line = [];
            foreach ($xmlRow->c as $cell) {
                $cellRef = (string)$cell['r'];
                $columnIndex = $this->cellColumnIndex($cellRef);
                $line[$columnIndex] = $this->extractCellValue($cell, $sharedStrings);
            }

            if ($line) {
                ksort($line);
                $max = max(array_keys($line));
                $complete = [];
                for ($i = 0; $i <= $max; $i++) {
                    $complete[] = $line[$i] ?? null;
                }
                $rows[] = $complete;
            }
        }

        return $this->trimEmptyTrailingRows($rows);
    }

    private function readSharedStrings(ZipArchive $zip): array
    {
        $xmlText = $zip->getFromName('xl/sharedStrings.xml');
        if ($xmlText === false) {
            return [];
        }

        $xml = simplexml_load_string($xmlText);
        if (!$xml) {
            return [];
        }

        $strings = [];
        foreach ($xml->si as $item) {
            if (isset($item->t)) {
                $strings[] = (string)$item->t;
                continue;
            }

            $text = '';
            foreach ($item->r as $run) {
                $text .= (string)$run->t;
            }
            $strings[] = $text;
        }

        return $strings;
    }

    private function extractCellValue(\SimpleXMLElement $cell, array $sharedStrings): mixed
    {
        $type = (string)$cell['t'];
        if ($type === 'inlineStr') {
            return isset($cell->is->t) ? (string)$cell->is->t : '';
        }

        $value = isset($cell->v) ? (string)$cell->v : '';
        return match ($type) {
            's' => $sharedStrings[(int)$value] ?? '',
            'b' => $value === '1' ? 1 : 0,
            default => $value,
        };
    }

    private function cellColumnIndex(string $cellReference): int
    {
        $letters = preg_replace('/[^A-Z]/', '', strtoupper($cellReference));
        $index = 0;
        for ($i = 0; $i < strlen($letters); $i++) {
            $index = ($index * 26) + (ord($letters[$i]) - 64);
        }
        return max(0, $index - 1);
    }

    private function trimEmptyTrailingRows(array $rows): array
    {
        return array_values(array_filter($rows, function ($row) {
            foreach ((array)$row as $value) {
                if ($value !== null && trim((string)$value) !== '') {
                    return true;
                }
            }
            return false;
        }));
    }

    private function columnsInfo(string $table): array
    {
        $stmt = Database::connection()->query("SHOW COLUMNS FROM `{$table}`");
        $columns = [];
        foreach ($stmt->fetchAll() as $column) {
            if (($column['Extra'] ?? '') === 'auto_increment') {
                continue;
            }
            $columns[$column['Field']] = $column;
        }
        return $columns;
    }

    private function missingRequiredColumns(array $columnsInfo, array $importColumns): array
    {
        $missing = [];
        foreach ($columnsInfo as $field => $info) {
            $isNullable = strtoupper((string)($info['Null'] ?? '')) === 'YES';
            $hasDefault = array_key_exists('Default', $info) && $info['Default'] !== null;
            $isTimestampDefault = str_contains(strtoupper((string)($info['Extra'] ?? '')), 'DEFAULT_GENERATED');

            if (!$isNullable && !$hasDefault && !$isTimestampDefault && !in_array($field, $importColumns, true)) {
                $missing[] = $field;
            }
        }
        return $missing;
    }

    private function resolveColumn(string $table, string $header, array $allowedColumns): ?string
    {
        $normalized = $this->normalizeHeader($header);
        foreach ($allowedColumns as $column) {
            if ($normalized === $this->normalizeHeader($column)) {
                return $column;
            }
        }

        $aliases = $this->aliases($table);
        return $aliases[$normalized] ?? null;
    }

    private function aliases(string $table): array
    {
        $common = [
            'telephone' => 'phone',
            'tel' => 'phone',
            'contact' => 'phone',
            'adresse' => 'address',
            'statut' => 'status',
            'etat' => 'status',
            'libelle' => 'label',
            'categorie' => 'category',
            'montant' => 'amount',
            'reference' => 'reference',
            'date_operation' => 'operation_date',
            'date' => 'operation_date',
            'description' => 'description',
            'beneficiaire' => 'beneficiary',
            'mode_paiement' => 'payment_method',
            'methode_paiement' => 'payment_method',
        ];

        $byTable = [
            'fideles' => [
                'nom' => 'full_name',
                'nom_complet' => 'full_name',
                'nom_et_prenom' => 'full_name',
                'noms_et_prenoms' => 'full_name',
                'sexe' => 'gender',
                'genre' => 'gender',
                'date_naissance' => 'birth_date',
                'groupe' => 'group_name',
                'sampana' => 'group_name',
                'date_bapteme' => 'baptized_at',
                'date_sainte_cene' => 'communion_at',
                'date_communion' => 'communion_at',
                'photo' => 'photo',
            ],
            'finance_entries' => [],
            'finance_exits' => [],
            'obligations' => [
                'id_fidele' => 'fidel_id',
                'fidele_id' => 'fidel_id',
                'mois' => 'period_month',
                'annee' => 'period_year',
                'montant_du' => 'amount_due',
                'montant_paye' => 'amount_paid',
                'date_echeance' => 'due_date',
            ],
            'communion_payments' => [
                'id_fidele' => 'fidel_id',
                'fidele_id' => 'fidel_id',
                'type_periode' => 'period_type',
                'annee_payee' => 'paid_year',
                'mois_paye' => 'paid_month',
                'date_paiement' => 'payment_date',
            ],
            'communion_exits' => [
                'type_periode' => 'period_type',
            ],
            'projects' => [
                'nom' => 'name',
                'nom_projet' => 'name',
                'budget_prevu' => 'budget',
                'montant_collecte' => 'collected_amount',
                'date_debut' => 'start_date',
                'date_fin' => 'end_date',
            ],
        ];

        return array_merge($common, $byTable[$table] ?? []);
    }

    private function normalizeValue(string $column, mixed $value): mixed
    {
        if ($value === null || trim((string)$value) === '') {
            return null;
        }

        $value = trim((string)$value);

        if (str_contains($column, 'date') || str_ends_with($column, '_at')) {
            return $this->normalizeDate($column, $value);
        }

        if (in_array($column, ['amount', 'amount_due', 'amount_paid', 'budget', 'collected_amount'], true)) {
            $numeric = str_replace([' ', "\xc2\xa0"], '', $value);
            $numeric = str_replace(',', '.', $numeric);
            return is_numeric($numeric) ? $numeric : $value;
        }

        if ($column === 'gender') {
            return strtoupper(substr($value, 0, 1));
        }

        if (in_array($column, ['status', 'period_type'], true)) {
            return strtolower($value);
        }

        return $value;
    }

    private function normalizeDate(string $column, string $value): string
    {
        $format = str_ends_with($column, '_at') ? 'Y-m-d H:i:s' : 'Y-m-d';

        if (is_numeric($value)) {
            if (class_exists(ExcelDate::class)) {
                return ExcelDate::excelToDateTimeObject((float)$value)->format($format);
            }
            return $this->excelSerialToDate((float)$value)->format($format);
        }

        $value = str_replace('/', '-', $value);
        $timestamp = strtotime($value);
        if ($timestamp === false) {
            throw new \RuntimeException("Date invalide pour {$column} : {$value}");
        }

        return date($format, $timestamp);
    }

    private function excelSerialToDate(float $serial): \DateTimeImmutable
    {
        $base = new \DateTimeImmutable('1899-12-30');
        return $base->modify('+' . (int)$serial . ' days');
    }

    private function normalizeHeader(string $header): string
    {
        $header = $this->removeBom(trim($header));
        $converted = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $header);
        $header = $converted !== false ? $converted : $header;
        $header = strtolower($header);
        $header = preg_replace('/[^a-z0-9]+/', '_', $header) ?? $header;
        return trim($header, '_');
    }

    private function removeBom(string $value): string
    {
        return preg_replace('/^\xEF\xBB\xBF/', '', $value) ?? $value;
    }

    private function guard(string $table): void
    {
        if (!array_key_exists($table, $this->tables)) {
            throw new \InvalidArgumentException('Table non autorisée pour import Excel.');
        }
    }
}
