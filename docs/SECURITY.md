# Sécurité

## Mesures incluses

- Hachage mot de passe via `password_hash()`.
- Vérification via `password_verify()`.
- Sessions HTTPOnly, SameSite=Lax.
- CSRF token sur les formulaires POST.
- PDO avec requêtes préparées.
- Échappement HTML via `e()`.
- Middleware Auth et Role.
- Limitation des tentatives de connexion.
- Audit log des actions sensibles.

## Avant production réelle

- Activer HTTPS.
- Mettre `debug=false`.
- Changer tous les mots de passe initiaux.
- Restreindre les permissions des dossiers.
- Sauvegarder automatiquement la base.
- Faire un test d’intrusion.
