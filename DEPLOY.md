# Guide de Deploiement — Render.com + TiDB Cloud (100% Gratuit)

## Vue d'ensemble

| Composant | Service | Gratuit |
|-----------|---------|---------|
| **Application PHP** | Render.com | ✅ (750h/mois) |
| **Base MySQL** | TiDB Cloud | ✅ (25 GiB) |
| **Domaine** | Render (sous-domaine) | ✅ |

---

## Etape 1 : Creer la base MySQL sur TiDB Cloud

### 1.1 Creer un compte
1. Va sur **https://tidbcloud.com**
2. Clique **Sign Up** (gratuit, pas de carte bancaire)
3. Connecte avec Google/GitHub ou cree un compte

### 1.2 Creer un cluster
1. Dashboard → **Create Cluster**
2. Choisis **Serverless** (gratuit)
3. **Region** : Choisis la plus proche (Singapore ou Tokyo)
4. **Cluster Name** : `fjkm-db`
5. Clique **Create**
6. Attends 1-2 minutes que le cluster soit pret

### 1.3 Recuperer les credentials
1. Clique sur ton cluster **fjkm-db**
2. Va dans **Connect** → **Connect with SSL**
3. Copie ces informations :
   - **Host** (ex: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`)
   - **Port** : `4000`
   - **Username** : `your_user.root`
   - **Password** : `your_password`

### 1.4 Creer la base de donnees
1. Clique **Launch SQL Shell** (ou utilise un client MySQL)
2. Execute :
   ```sql
   CREATE DATABASE fjkm_obligation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

---

## Etape 2 : Deployer sur Render.com

### 2.1 Creer un compte Render
1. Va sur **https://render.com**
2. **Get Started for Free** → Connecte GitHub

### 2.2 Creer le Web Service
1. **New +** → **Web Service**
2. Selectionne **Narindra0/FJKMGestionnaire**
3. Configure :
   - **Name** : `fjkm-gestionnaire`
   - **Runtime** : `Docker`
   - **Dockerfile Path** : `Dockerfile`
   - **Instance Type** : `Free`

### 2.3 Variables d'environnement
Ajoute ces variables dans la section **Environment Variables** :

```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://fjkm-gestionnaire.onrender.com
APP_NAME=GESTION D'OBLIGATION AU SEIN D'EGLISE FJKM MALAZA GILEADA
APP_SHORT_NAME=FJKM Obligations
APP_TIMEZONE=Indian/Antananarivo
APP_LOCALE=fr_MG

DB_DRIVER=mysql
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_DATABASE=fjkm_obligation
DB_USERNAME=ton_user.root
DB_PASSWORD=ton_mot_de_passe
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

> ⚠️ Remplace les valeurs DB_HOST, DB_USERNAME, DB_PASSWORD par celles de TiDB Cloud

### 2.4 Deployer
1. Clique **Create Web Service**
2. Attends 2-5 minutes
3. Le build Docker demarre automatiquement

### 2.5 Initialiser la base de donnees
Une fois le service en ligne :
1. Va dans **Shell** (onglet dans Render Dashboard)
2. Execute :
   ```bash
   php /var/www/html/scripts/setup-db.php
   ```
   OU
3. Importe le fichier `Database/fjkm_obligation.sql` via TiDB Cloud SQL Shell

---

## Etape 3 : Tester l'application

### Connexion par defaut
- **URL** : `https://fjkm-gestionnaire.onrender.com`
- **Email** : `admin@fjkm.mg`
- **Mot de passe** : `admin123`

> ⚠️ Change ce mot de passe des la premiere connexion !

---

## Notes importantes

### Free Tier Render.com
- **Spin down** : Le service se met en veille apres 15 min d'inactivite
- **Spin up** : Au prochain acces, redemarrage (1-2 min)
- **750 heures** gratuites par mois

### Free Tier TiDB Cloud
- **25 GiB** de stockage gratuit
- **100 connexions** simultanees
- **Pas de limite de temps**
- **Compatible MySQL** (meme driver PDO)

### Variables DB a copier depuis TiDB Cloud
| Variable | Valeur TiDB |
|----------|-------------|
| `DB_HOST` | `gateway01.ap-southeast-1.prod.aws.tidbcloud.com` |
| `DB_PORT` | `4000` |
| `DB_DATABASE` | `fjkm_obligation` |
| `DB_USERNAME` | `ton_user.root` |
| `DB_PASSWORD` | `ton_mot_de_passe` |

---

## Depannage

### CSS ne charge pas
- Verifie que APP_URL est correct (https://...)
- Verifie les logs Render → Logs

### Erreur de connexion DB
- Verifie les credentials TiDB Cloud
- Assure-toi que le port est `4000` (pas 3306)
- Verifie que la base `fjkm_obligation` existe

### Erreur 500
- Verifie les logs Render → Logs
- Assure-toi que APP_DEBUG=false

### Tables manquantes
- Execute le script de setup : `php scripts/setup-db.php`
- Ou importe `Database/fjkm_obligation.sql` dans TiDB
