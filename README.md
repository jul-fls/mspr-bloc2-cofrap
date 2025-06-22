[![Deploy OpenFaaS Functions](https://github.com/jul-fls/mspr-bloc2-cofrap/actions/workflows/deploy.yml/badge.svg)](https://github.com/jul-fls/mspr-bloc2-cofrap/actions/workflows/deploy.yml)

# MSPR Bloc 2 COFRAP — Générateur d'identifiants sécurisés via OpenFaaS

Ce projet propose un système d'authentification simple basé sur [OpenFaaS](https://www.openfaas.com/) pour générer des mots de passe, des secrets TOTP, et gérer l'authentification d’utilisateurs. Il inclut une API backend fonctionnelle déployée en tant que fonctions serverless, ainsi qu’un frontend React minimaliste pour tester l’intégration.

## 🧠 Fonctionnalités et techniques intéressantes

* Utilisation du **[context React](https://react.dev/reference/react/createContext)** pour la gestion d'état d'authentification côté client.
* Génération de mots de passe robustes côté serveur avec [crypto.randomFillSync()](https://nodejs.org/api/crypto.html#cryptorandomfillsyncbuffer-offset-size).
* Hachage sécurisé avec [argon2id](https://github.com/ranisalt/node-argon2).
* Génération de QR Code via [qrcode](https://github.com/soldair/node-qrcode).
* Appels HTTP avec `fetch`, gestion JSON, et réponse formatée avec des headers CORS personnalisés.
* Utilisation de [faas-cli](https://docs.openfaas.com/cli/) pour le build, le push et le déploiement automatisé.
* Infrastructure Kubernetes avec runner GitHub Actions auto-hébergé.

## 📦 Technologies et bibliothèques utilisées

* [React](https://react.dev/)
* [OpenFaaS](https://www.openfaas.com/)
* [Node.js](https://nodejs.org/)
* [argon2 (npm)](https://www.npmjs.com/package/argon2)
* [qrcode (npm)](https://www.npmjs.com/package/qrcode)
* [lucide-react (icônes)](https://lucide.dev/)
* [Tailwind CSS](https://tailwindcss.com/) (via `@shadcn/ui`)
* [PostgreSQL](https://www.postgresql.org/)
* CI/CD avec [GitHub Actions](https://docs.github.com/actions)

## 📁 Structure du projet

```txt
.
├── functions/              # Fonctions OpenFaaS (auth-user, generate-password, generate-2fa, upload-profile-photo)
├── tools/                  # Scripts de déploiement et d'administration (update-function.sh, init-db.sh, etc.)
├── README.md               # Ce fichier
├── LICENSE
├── .github/workflows/      # Déploiement automatique via GitHub Actions
└── front/                  # Application React minimaliste pour tester l'authentification
```

* `functions/` contient les fonctions déployables, chacune avec un `handler.js` et un fichier `.yaml` OpenFaaS.
* `tools/` regroupe les scripts Bash pour l'initialisation de la base PostgreSQL, le déploiement manuel des fonctions, etc.
* `front/` propose une interface basique permettant de se connecter, de générer des mots de passe, un 2FA ou de téléverser une photo de profil.

## 🚀 Utilisation en production

L'instance de production est disponible ici :
➡️ **[https://cofrap.flusin.fr](https://cofrap.flusin.fr)**

Les fonctions OpenFaaS sont exposées sous :
➡️ **[https://openfaas.flusin.fr/function/](https://openfaas.flusin.fr/function/)** (ex: `/generate-password`)

## 🧑‍💻 Bonnes pratiques de développement

* **Branche par fonctionnalité** : créez une branche nommée `feature/<nom>` pour chaque nouvelle fonctionnalité ou amélioration.

* **Validation automatique** : toute fusion dans `master` déclenche automatiquement la CI/CD via GitHub Actions (build, push, déploiement).

* **Développement local** :

  * Cloner le dépôt
  * Installer les dépendances du frontend :

    ```bash
    cd frontend
    npm install
    npm run dev
    ```
  * Pour déployer manuellement une fonction depuis `tools/` :

    ```bash
    ./update-function.sh generate-password
    ```

* **Secrets OpenFaaS** : les identifiants de la base PostgreSQL sont stockés dans des secrets Kubernetes (namespace `openfaas`).

## 🧪 Tests et débogage

* Un script `debug-function.sh` est disponible pour tester manuellement l’exécution des fonctions dans le cluster OpenFaaS.
