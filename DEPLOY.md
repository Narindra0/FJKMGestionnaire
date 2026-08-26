# 🚀 Guide de Déploiement - Render.com (100% Gratuit)

## Prérequis
- Un compte GitHub (déjà créé)
- Un compte Render.com (gratuit, pas de carte bancaire)

## Étapes de déploiement

### 1. Créer un compte Render.com
1. Va sur https://render.com
2. Clique **Get Started for Free**
3. Connecte ton compte GitHub

### 2. Créer un nouveau Web Service
1. Clique **New +** → **Web Service**
2. Sélectionne le dépôt `Narindra0/FJKMGestionnaire`
3. Configure :
   - **Name**: `fjkm-gestionnaire`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `Dockerfile`
   - **Instance Type**: `Free`

### 3. Configurer les variables d'environnement
Dans la section **Environment Variables**, ajoute :

| Variable | Valeur |
|----------|--------|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_URL` | `https://fjkm-gestionnaire.onrender.com` |
| `DB_DRIVER` | `mysql` |
| `SESSION_NAME` | `FJKM_SESSION_PROD` |
| `CSRF_KEY` | `fjkm_csrf_prod_2026` |

> ⚠️ Les variables DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD
> seront automatiquement configurées par Render (base de données intégrée).

### 4. Créer la base de données
1. Clique **New +** → **PostgreSQL** (ou MySQL si disponible)
2. **Name**: `fjkm-db`
3. **Plan**: `Free`
4. Une fois créée, Render ajoutera automatiquement les variables DB_*

### 5. Déployer
1. Clique **Create Web Service**
2. Le déploiement commence automatiquement (2-5 minutes)
3. Une fois terminé, tu auras une URL comme : `https://fjkm-gestionnaire.onrender.com`

### 6. Connexion par défaut
- **Email**: `admin@fjkm.mg`
- **Mot de passe**: `admin123`
- ⚠️ Change ce mot de passe dès la première connexion !

---

## 📋 Notes importantes

### Free Tier - Limites
- **Spin down**: Le service se met en veille après 15 min d'inactivité
- **Spin up**: Au prochain accès, le service redémarre (1-2 min)
- **Base de données**: 90 jours gratuits, puis supprimée
- **Heures**: 750 heures gratuites par mois

### Pour éviter le spin down
Le service se relance automatiquement quand quelqu'un y accède. C'est normal sur le free tier.

### Variables d'environnement complètes
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://fjkm-gestionnaire.onrender.com
APP_NAME=GESTION D'OBLIGATION AU SEIN D'EGLISE FJKM MALAZA GILEADA
APP_SHORT_NAME=FJKM Obligations
APP_TIMEZONE=Indian/Antananarivo
APP_LOCALE=fr_MG
DB_DRIVER=mysql
DB_HOST=<automatique>
DB_PORT=<automatique>
DB_DATABASE=<automatique>
DB_USERNAME=<automatique>
DB_PASSWORD=<automatique>
DB_CHARSET=utf8mb4
DB_COLLATION=utf8mb4_unicode_ci
SESSION_NAME=FJKM_SESSION_PROD
REMEMBER_COOKIE=fjkm_remember_token
CSRF_KEY=fjkm_csrf_prod_2026
LOGIN_MAX_ATTEMPTS=5
LOGIN_DECAY_MINUTES=15
UPLOAD_MAX_SIZE=2097152
ALLOWED_IMAGES=jpg,jpeg,png,webp
```

---

## 🔧 Dépannage

### Erreur de connexion DB
- Vérifie que la base de données est bien créée sur Render
- Les variables DB_* doivent être automatiquement liées au service

### Erreur 500
- Vérifie les logs dans Render Dashboard → Logs
- Assure-toi que APP_DEBUG=false en production

### Service ne démarre pas
- Vérifie que le Dockerfile est correct
- Regarde les logs de build dans Render Dashboard
