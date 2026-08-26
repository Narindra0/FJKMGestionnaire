# MCD professionnel — Gestion d’obligation FJKM Malaza Gileada

## Entités principales

- **Rôle** possède plusieurs **Utilisateurs**.
- **Utilisateur** crée des **Fidèles**, **Entrées**, **Sorties**, **Obligations**, **Paiements communion** et **Logs audit**.
- **Fidèle** possède plusieurs **Obligations** et plusieurs **Paiements communion**.
- **Période** regroupe plusieurs **Obligations**.
- **Entrée financière** et **Sortie financière** alimentent le calcul global : `TOTAL = ENTREES - SORTIES`.
- **AuditLog** trace les actions sensibles.
- **LoginAttempt** sécurise la connexion contre les attaques par force brute.

## Cardinalités

```text
ROLE (1,1) ---- (0,n) USER
USER (0,1) ---- (0,n) FIDEL
USER (0,1) ---- (0,n) FINANCE_ENTRY
USER (0,1) ---- (0,n) FINANCE_EXIT
FIDEL (1,1) ---- (0,n) OBLIGATION
PERIOD (0,1) ---- (0,n) OBLIGATION
FIDEL (1,1) ---- (0,n) COMMUNION_PAYMENT
USER (0,1) ---- (0,n) AUDIT_LOG
```
