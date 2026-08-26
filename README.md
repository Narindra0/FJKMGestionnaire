# GESTION D’OBLIGATION FJKM MALAZA GILEADA

Application web MVC PHP 8.2 pour la gestion professionnelle des obligations financières, entrées/sorties, fidèles, paiements communion, tableaux de bord, statistiques, rapports, exports, audit et rôles utilisateurs.

## Stack

- PHP 8.2+ orienté objet
- MySQL / MariaDB
- MVC maison structuré
- Bootstrap 5, Tailwind CSS, CSS personnalisé
- JavaScript, jQuery, AJAX
- Chart.js, DataTables, SweetAlert2, Toasts
- PWA, API REST, QR Code

## Installation XAMPP

1. Copier le dossier `gestion-obligation-fjkm-malaza-gileada` dans `htdocs`.
2. Créer une base MySQL nommée `fjkm_obligation`.
3. Importer le fichier :

```sql
database/sql/schema.sql
```

4. Modifier les accès dans :

```php
app/config/database.php
app/config/app.php
```

5. Activer Apache et MySQL dans XAMPP.
6. Ouvrir :

```text
http://localhost/gestion-obligation-fjkm-malaza-gileada
```

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| ADMIN | admin@fjkm.mg | Admin@12345 |
| USER | user@fjkm.mg | User@12345 |
| VISITEUR | visiteur@fjkm.mg | Visiteur@12345 |

Changez ces mots de passe dès la première utilisation.

## Exports PDF / Excel

Le projet fonctionne sans Composer pour les fonctions de base. Pour des PDF et fichiers Excel avancés, installer Composer puis lancer :

```bash
composer install
```

Sans Composer, l’application fournit :

- PDF imprimable via HTML optimisé impression ;
- export CSV compatible Excel.

## Sécurité incluse

- `password_hash()` / `password_verify()`
- Sessions sécurisées
- Protection CSRF
- Validation serveur et client
- Limitation des tentatives de connexion
- Journalisation des connexions
- Middleware Auth et rôles
- PDO préparé contre SQL Injection
- Échappement XSS
- Audit log
- Remember me par token haché

## Point critique

Ce projet est une base commerciale complète et exécutable. Avant une vraie mise en production internet, il faut obligatoirement :

- configurer HTTPS ;
- changer les mots de passe par défaut ;
- déplacer les logs hors du webroot ;
- ajouter une sauvegarde automatisée MySQL ;
- faire un audit sécurité réel ;
- tester les règles financières exactes de l’église avec les responsables.


## Corrections finales intégrées

- Barre de recherche nettoyée : plus de mention technique AJAX.
- Rôles corrigés : ADMIN contrôle, USER enregistre, VISITEUR consulte.
- Références automatiques et non modifiables pour les opérations.
- Communion séparée : entrées, sorties, finance, période Mois/Annuel, dashboard et rapports.
- Gestion des utilisateurs limitée à activation/désactivation et changement de mot de passe.
- Import Excel ajouté avec contrôle strict des colonnes.
- Projets ajoutés avec modification et suppression.
- Design modernisé : login, boutons, tableaux, formulaires, responsive.
- Logo et visuel FJKM Malaza intégrés dans `public/assets/img/`.

Voir aussi `docs/COMMENTAIRES_TECHNIQUES.md`.


## Dernière correction

- Suppression de la petite recette affichée automatiquement en haut de tous les menus.
- Ajout d'une synthèse et d'un graphique recette uniquement dans la page Entrées / Sorties.
