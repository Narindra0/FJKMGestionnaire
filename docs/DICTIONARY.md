# Dictionnaire de données

| Table | Champ | Type | Description |
|---|---|---|---|
| users | role_id | INT FK | Rôle utilisateur : ADMIN, USER, VISITEUR |
| users | password | VARCHAR | Hash sécurisé du mot de passe |
| fideles | matricule | VARCHAR | Identifiant unique du fidèle |
| fideles | photo | VARCHAR | Chemin photo du fidèle |
| finance_entries | amount | DECIMAL | Montant d’une entrée financière |
| finance_exits | amount | DECIMAL | Montant d’une sortie financière |
| obligations | amount_due | DECIMAL | Montant exigible |
| obligations | amount_paid | DECIMAL | Montant déjà payé |
| obligations | status | ENUM | unpaid, partial, paid |
| communion_payments | payment_date | DATE | Date paiement communion |
| audit_logs | payload | JSON | Données liées à l’action auditée |
| login_attempts | success | TINYINT | 1 si connexion réussie, 0 sinon |
