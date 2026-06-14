# SalesTrack

Application web de pilotage commercial terrain 

SalesTrack centralise la gestion des clients, visites commerciales, commandes/devis et indicateurs de performance pour un distributeur agro-alimentaire. Chaque rôle (Admin, Manager, Commercial) accède uniquement à son périmètre de données.

## Stack technique

| Composant | Choix | Justification |
|-----------|-------|---------------|
| Frontend | Next.js 16 (App Router) + React 19 | Full-stack en un repo, SSR, routing simple |
| UI | Tailwind CSS 4 | Responsive mobile-first, rapide à itérer |
| Auth | NextAuth v5 (Credentials) | Session JWT, intégration Next.js native |
| Base de données | SQLite + Prisma ORM | Zéro config serveur, persistance relationnelle, facile à lancer localement |
| Hachage mots de passe | bcryptjs | Standard pour les credentials |

## Prérequis

- Node.js 20+
- npm (ou pnpm / yarn)

## Installation et lancement

```bash
# 1. Cloner le dépôt et installer les dépendances
npm install


# 2. Créer la base et appliquer le schéma
npx prisma migrate dev

# 3. Insérer les données de démonstration
npm run seed

# 4. Lancer l'application
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Scripts utiles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run start` | Serveur production (après build) |
| `npm run seed` | Réinitialiser les données de démo |
| `npm run db:setup` | Migration + seed en une commande |
| `npm test` | Tests unitaires (Vitest) |
| `npm run test:smoke` | Tests smoke base de données + rôles |

## Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | admin@salestrack.com | admin123 |
| **Manager** | manager@salestrack.com | manager123 |
| **Commercial 1** | commercial1@salestrack.com | commercial123 |
| **Commercial 2** | commercial2@salestrack.com | commercial123 |

L'inscription publique (`/register`) crée un compte **Commercial** rattaché au manager par défaut. Les comptes Admin et Manager sont créés via `/admin/users` (Admin uniquement).

## Données de démonstration

Le seed crée :
- 4 utilisateurs (1 admin, 1 manager, 2 commerciaux)
- 4 clients répartis entre les commerciaux
- 4 visites (commande / non-commande)
- 2 commandes/devis avec lignes produits

## Fonctionnalités

### Implémenté

- [x] Page d'accueil présentant le projet
- [x] Authentification email/mot de passe + inscription commercial
- [x] Séparation des rôles et filtrage des données (Admin / Manager / Commercial)
- [x] CRUD clients (création + modification admin, consultation fiche)
- [x] Liste clients avec recherche et filtres (statut, ville, canal)
- [x] Visites (création rapide mobile, statut commande/non-commande)
- [x] Commandes/devis avec lignes produits
- [x] Tableau de bord (KPIs, taux de transformation, activité par commercial)
- [x] Gestion utilisateurs (Admin)
- [x] Interface responsive (mobile + desktop)
- [x] Middleware de protection des routes
- [x] Tests automatisés (unitaires + smoke DB)
- [x] Sécurité API : un commercial ne peut pas créer visite/commande sur le client d'un autre

### Non implémenté / limites connues

- [ ] Docker Compose — non livré (incompatibilité Docker Desktop / Windows sur la machine de développement ; le projet se lance via les commandes npm ci-dessus)
- [ ] Déploiement en ligne (bonus)
- [ ] Upload photos visite (bonus)
- [ ] Import/export CSV (bonus)
- [ ] Géolocalisation GPS (bonus)
- [ ] Récupération mot de passe par email
- [ ] Recherche/filtres sur visites et commandes

## Structure du projet

```
src/
├── app/                  # Pages et routes API (App Router)
│   ├── api/              # Endpoints REST (clients, visits, orders, auth)
│   ├── admin/users/      # Gestion utilisateurs (Admin)
│   ├── clients/          # Liste et fiches clients
│   ├── dashboard/        # Tableau de bord
│   ├── login/ register/  # Authentification
│   ├── visits/ orders/   # Visites et commandes
│   └── page.tsx          # Landing page
├── components/           # Navbar, filtres, etc.
├── lib/                  # Utilitaires (rôles)
└── auth.ts               # Configuration NextAuth
prisma/
├── schema.prisma         # Modèle de données
└── seed.ts               # Données de démonstration
```

## Modèle de données

```
User (ADMIN | MANAGER | COMMERCIAL)
  └── managerId → User (manager)
  └── clients, visits, orders

Client → commercial (User)
Visit  → client, commercial
Order  → client, commercial, lines (OrderLine)
```

## Tests

```bash
npm test           # 6 tests unitaires (rôles, KPIs, filtres)
npm run test:smoke # 11 tests smoke (seed, auth, scoping par rôle)
npm run build      # build production (webpack, compatible Windows)
```

Résultats vérifiés localement : **6/6 unitaires OK**, **11/11 smoke OK**, **build OK**.



## Hypothèses prises

- SQLite suffit pour un test technique local (pas de PostgreSQL requis)
- L'inscription ouvre uniquement des comptes Commercial (Admin crée les autres rôles)
- Les commerciaux nouvellement inscrits sont rattachés au premier Manager trouvé en base
- Pas de service email externe (pas de reset password)


