<?php
/*
 | Commentaire technique
 | Ce fichier fait partie du noyau de l'application : il gère les mécanismes communs comme le routage, la session, la sécurité ou l'accès aux vues.
 */
namespace App\Core;

final class Validator
{
    private array $errors = [];

    public function required(array $data, array $fields): self
    {
        foreach ($fields as $field) {
            if (!isset($data[$field]) || trim((string)$data[$field]) === '') {
                $this->errors[$field][] = 'Ce champ est obligatoire.';
            }
        }
        return $this;
    }

    public function email(array $data, string $field): self
    {
        if (!empty($data[$field]) && !filter_var($data[$field], FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field][] = 'Email invalide.';
        }
        return $this;
    }

    public function numeric(array $data, array $fields): self
    {
        foreach ($fields as $field) {
            if (isset($data[$field]) && $data[$field] !== '' && money_to_float($data[$field]) === null) {
                $this->errors[$field][] = 'La valeur doit être numérique.';
            }
        }
        return $this;
    }

    public function errors(): array
    {
        return $this->errors;
    }

    public function fails(): bool
    {
        return !empty($this->errors);
    }
}
