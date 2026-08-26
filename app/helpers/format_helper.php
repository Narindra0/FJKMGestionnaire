<?php
/*
 | Commentaire technique
 | Ce fichier contient des fonctions d'aide réutilisables dans les vues et dans les traitements applicatifs.
 */
/* Helpers d'affichage et de normalisation : montants, dates, statuts et libellés. */

/**
 * Convertit un montant saisi comme « 30.000.000 », « 30 000 000 » ou « 30000000 ».
 * Le résultat est conservé sous forme numérique pour MySQL.
 */
function money_to_float(mixed $value): ?float {
    if ($value === null || $value === '') return null;
    if (is_int($value) || is_float($value)) return round((float)$value, 2);

    $raw = trim((string)$value);
    if ($raw === '') return null;
    $raw = str_ireplace(['Ar', 'MGA'], '', $raw);
    $raw = str_replace(["\xC2\xA0", ' '], '', $raw);
    if (!preg_match('/^-?[0-9.,]+$/', $raw)) return null;

    $sign = '';
    if (str_starts_with($raw, '-')) {
        $sign = '-';
        $raw = substr($raw, 1);
    }
    if ($raw === '' || !preg_match('/^[0-9.,]+$/', $raw)) return null;

    $dotCount = substr_count($raw, '.');
    $commaCount = substr_count($raw, ',');
    $lastDot = strrpos($raw, '.');
    $lastComma = strrpos($raw, ',');

    if ($dotCount > 0 && $commaCount > 0) {
        // Le dernier séparateur est considéré comme séparateur décimal.
        if ($lastComma > $lastDot) {
            $raw = str_replace('.', '', $raw);
            $raw = str_replace(',', '.', $raw);
        } else {
            $raw = str_replace(',', '', $raw);
        }
    } elseif ($dotCount > 0) {
        $after = strlen($raw) - (int)$lastDot - 1;
        // 30.000 et 30.000.000 sont des montants avec séparateur de milliers.
        if ($dotCount > 1 || ($after === 3 && strlen($raw) > 4)) {
            $raw = str_replace('.', '', $raw);
        }
    } elseif ($commaCount > 0) {
        $after = strlen($raw) - (int)$lastComma - 1;
        if ($commaCount > 1 || ($after === 3 && strlen($raw) > 4)) {
            $raw = str_replace(',', '', $raw);
        } else {
            $raw = str_replace(',', '.', $raw);
        }
    }

    $raw = $sign . $raw;
    if (!is_numeric($raw)) return null;
    return round((float)$raw, 2);
}

function money_number_mga(float|int|null $amount): string {
    return number_format((float)$amount, 0, '', '.');
}

function money_mga(float|int|null $amount): string {
    return money_number_mga($amount) . ' Ar';
}

/**
 * Accepte les formats ISO et saisie manuelle jj/mm/aaaa (ou jj-mm-aaaa).
 */
function normalize_date(?string $value): ?string {
    $value = trim((string)$value);
    if ($value === '') return null;
    foreach (['!Y-m-d', '!d/m/Y', '!d-m-Y', '!d.m.Y', '!Y/m/d'] as $format) {
        $date = \DateTime::createFromFormat($format, $value);
        $errors = \DateTime::getLastErrors();
        $valid = $date instanceof \DateTime && ($errors === false || (($errors['warning_count'] ?? 0) === 0 && ($errors['error_count'] ?? 0) === 0));
        if ($valid) return $date->format('Y-m-d');
    }
    return null;
}

function date_mg(?string $date): string {
    $normalized = normalize_date($date);
    if (!$normalized) return '-';
    return date('d/m/Y', strtotime($normalized));
}

function status_badge(string $status): string {
    $map = [
        'paid' => 'success', 'partial' => 'warning', 'unpaid' => 'danger',
        'active' => 'success', 'inactive' => 'secondary', 'draft' => 'secondary',
        'validated' => 'primary', 'planned' => 'info', 'ongoing' => 'primary',
        'completed' => 'success', 'almost_completed' => 'warning', 'cancelled' => 'danger'
    ];
    $class = $map[$status] ?? 'info';
    $labels = ['planned'=>'PRÉVU','ongoing'=>'EN COURS','almost_completed'=>'PRESQUE TERMINÉ','completed'=>'TERMINÉ','cancelled'=>'ANNULÉ','paid'=>'PAYÉ','partial'=>'PARTIEL','unpaid'=>'NON PAYÉ','active'=>'ACTIF','inactive'=>'INACTIF'];
    return '<span class="badge text-bg-' . $class . '">' . e($labels[$status] ?? strtoupper($status)) . '</span>';
}

function period_label(string $period): string {
    return $period === 'annual' ? 'Annuel' : 'Mois';
}

/**
 * Retourne le tableau des noms de mois en français (indexé de 1 à 12).
 */
function month_names(): array
{
    return [
        1 => 'Janvier', 2 => 'Février', 3 => 'Mars', 4 => 'Avril', 5 => 'Mai', 6 => 'Juin',
        7 => 'Juillet', 8 => 'Août', 9 => 'Septembre', 10 => 'Octobre', 11 => 'Novembre', 12 => 'Décembre'
    ];
}

/**
 * Retourne le nom d'un mois en français à partir de son numéro (1-12).
 */
function month_name(int $month): string
{
    return month_names()[$month] ?? 'Mois ' . $month;
}

/**
 * Formate une période mois/année en français (ex: "Janvier 2026").
 */
function period_name(int $month, int $year): string
{
    return month_name($month) . ' ' . $year;
}
