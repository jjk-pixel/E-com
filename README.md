# Meridien — boutique de café en ligne

Site e-commerce complet : catalogue de produits, panier, comptes utilisateurs,
paiement Stripe et historique de commandes.

**Stack** : React (Vite) + Node/Express + PostgreSQL + Stripe Checkout.

---

## 1. Structure du projet

```
ecommerce-app/
├── render.yaml          # Blueprint Render (service web + base Postgres)
├── package.json         # Orchestre build/start pour Render
├── server/               # API Express
│   ├── index.js
│   ├── db.js
│   ├── schema.sql        # Créé automatiquement au démarrage
│   ├── migrate.js        # Migration + données de démo
│   ├── middleware/auth.js
│   └── routes/{auth,products,orders,stripeWebhook}.js
└── client/               # App React (Vite)
    └── src/{pages,components,context}/...
```

---

## 2. Lancer le projet en local

Prérequis : Node.js 18+, une base PostgreSQL (locale ou distante), un compte Stripe (mode test).

```bash
# 1. Installer les dépendances
npm install --prefix server
npm install --prefix client

# 2. Configurer les variables d'environnement
cp server/.env.example server/.env
# -> renseigner DATABASE_URL, JWT_SECRET, STRIPE_SECRET_KEY

# 3. Lancer le serveur (terminal 1)
npm run dev:server

# 4. Lancer le client (terminal 2)
npm run dev:client
```

Le site est alors accessible sur `http://localhost:5173` (le client redirige les
appels `/api` vers `http://localhost:4000`).

Pour tester les paiements en local, utilise le [Stripe CLI](https://stripe.com/docs/stripe-cli) :

```bash
stripe listen --forward-to localhost:4000/api/stripe/webhook
```

Il t'affichera un `whsec_...` à copier dans `STRIPE_WEBHOOK_SECRET`.

---

## 3. Déployer sur Render

### Option A — Déploiement en un clic avec `render.yaml` (recommandé)

1. Pousse ce dossier sur un dépôt GitHub/GitLab.
2. Sur [render.com](https://render.com) : **New > Blueprint**, sélectionne le dépôt.
   Render lit `render.yaml` et crée automatiquement :
   - un **Web Service** Node (build + start configurés)
   - une **base PostgreSQL** gratuite, déjà reliée via `DATABASE_URL`
3. Render générera aussi un `JWT_SECRET` aléatoire automatiquement.
4. Il te restera à renseigner à la main (Render Dashboard > ton service > Environment) :
   - `STRIPE_SECRET_KEY` (clé secrète Stripe, mode test ou live)
   - `STRIPE_WEBHOOK_SECRET` (voir étape 4 ci-dessous)
   - `CLIENT_URL` : l'URL publique de ton service, ex. `https://meridien-shop.onrender.com`

### Option B — Configuration manuelle

1. **New > PostgreSQL** sur Render, note l'URL de connexion interne.
2. **New > Web Service**, connecte ton dépôt :
   - Build command : `npm run build`
   - Start command : `npm start`
3. Ajoute les variables d'environnement : `DATABASE_URL`, `JWT_SECRET`,
   `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLIENT_URL`, `NODE_ENV=production`.

### 4. Configurer le webhook Stripe (obligatoire pour valider les commandes)

1. Dans le [Dashboard Stripe](https://dashboard.stripe.com/webhooks), ajoute un endpoint :
   `https://<ton-service>.onrender.com/api/stripe/webhook`
2. Sélectionne l'événement `checkout.session.completed`.
3. Copie le "Signing secret" (`whsec_...`) dans la variable `STRIPE_WEBHOOK_SECRET` sur Render.

Au premier démarrage, le serveur crée automatiquement les tables et insère
6 lots de café de démonstration (voir `server/migrate.js`) — remplace-les par
tes propres produits directement en base, ou étends l'API pour un back-office.

---

## 5. Notes importantes

- **Prix côté serveur** : les prix ne sont jamais lus depuis le panier envoyé par
  le navigateur, toujours relus en base avant de créer la session Stripe.
- **Idempotence des commandes** : le webhook Stripe vérifie que la session n'a pas
  déjà été enregistrée avant de créer une commande.
- **Mots de passe** : hashés avec bcrypt, jamais stockés en clair.
- **Sessions** : JWT signé côté serveur, valable 30 jours, stocké dans le
  `localStorage` du navigateur.
- Ce projet n'inclut pas de back-office d'administration des produits ; les lots
  se gèrent aujourd'hui via `server/migrate.js` ou directement en base SQL.
