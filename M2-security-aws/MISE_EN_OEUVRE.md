# 🛡️ Mise en Œuvre Détaillée du Service de Sécurité M2 (Secure Gates)

Ce document détaille l'implémentation technique, la configuration et le guide de démonstration du module **M2 - Secure Gates** pour le projet FanOps CAN 2025.

---

## 1. 🏗️ Architecture et Choix Technologiques

Le service M2 repose sur une architecture **Serverless Multi-Cloud** pour garantir une sécurité maximale, une mise à l'échelle automatique et une observabilité complète.

*   **Compute (FaaS)** : AWS Lambda (Node.js 20.x) pour la logique métier.
*   **API Management (PaaS)** : AWS API Gateway pour exposer les endpoints REST sécurisés.
*   **Base de Données (PaaS)** : Amazon DynamoDB pour le stockage ultra-rapide des billets et des logs d'audit.
*   **Sécurité (IaaS/PaaS)** :
    *   **AWS KMS** : Chiffrement des secrets (clés JWT).
    *   **AWS EC2 (Ubuntu)** : Instance dédiée aux scans de vulnérabilité (OWASP ZAP).
*   **SIEM & Observabilité** : Microsoft Azure Sentinel pour la détection des menaces.

---

## 2. ⚙️ Configuration Détaillée des Services

### A. Backend Serverless (Le Cœur du Système)

Tout le backend est défini en **Infrastructure as Code (IaC)** via le framework `Serverless` (`serverless.yml`).

1.  **Fonctions Lambda** :
    *   `login` : Authentifie les utilisateurs (Gatekeepers/Admins) et génère un **JWT signé**.
    *   `verifyTicket` : Vérifie la signature du billet, son existence en base, et **empêche le rejeu** (Anti-Replay) en vérifiant si le `jti` (ID unique du token) a déjà été utilisé.
    *   `sentinelShipper` : Une fonction spéciale qui s'abonne aux logs CloudWatch et les transfère en temps réel vers Azure Sentinel via l'API HTTP Data Collector.

2.  **DynamoDB (Stockage)** :
    *   Nous avons configuré 4 tables avec **On-Demand Capacity** (Pay-per-request) :
        *   `Users` : Stocke les hashs de mots de passe (bcrypt).
        *   `SoldTickets` : La source de vérité des billets vendus.
        *   `UsedJTI` : Table critique pour la sécurité avec un **TTL (Time To Live)** de 24h pour purger automatiquement les tokens déjà scannés.
        *   `Audit` : Historique immuable de toutes les tentatives d'accès.

### B. Gestion des Secrets (KMS & SSM)

Pour ne jamais stocker de secrets en clair dans le code :
1.  Nous avons créé une **Clé Client (CMK)** dans **AWS KMS**.
2.  Le secret de signature JWT a été chiffré et stocké dans **AWS Systems Manager (SSM) Parameter Store**.
3.  Au démarrage, les Lambdas décryptent ce secret à la volée. Cela garantit que même si le code source fuite, les clés de sécurité restent protégées.

### C. Infrastructure de Test de Sécurité Automatisé (EC2 & ZAP)

C'est une composante majeure de notre posture de sécurité proactive.

1.  **Instance EC2** : Une machine virtuelle **Ubuntu 22.04** est provisionnée automatiquement via CloudFormation dans le `serverless.yml`.
2.  **Rôle IAM** : L'instance possède un rôle spécifique (`SecurityInstanceRole`) lui donnant le droit d'écrire uniquement dans le bucket S3 des rapports.
3.  **Script d'Automatisation (OWASP ZAP)** :
    *   Nous avons déployé un script Bash qui installe **Java** et **OWASP ZAP** (Zed Attack Proxy).
    *   Une tâche **Cron** est configurée pour s'exécuter tous les jours à **02:00 AM**.
    *   **Le Flux** :
        1.  Le script lance un scan de vulnérabilités sur l'URL de l'API Gateway.
        2.  Il génère un rapport HTML détaillé.
        3.  Il upload ce rapport automatiquement vers un bucket S3 sécurisé (`can2025-secure-gates-security-reports-dev`).

### D. Intégration SIEM (Azure Sentinel)

Nous avons unifié la surveillance dans le cloud de Microsoft.

1.  **Frontend** : Le SDK `Application Insights` est intégré à l'application React. Il envoie les événements "Login Success", "Login Failure" et les performances API.
2.  **Backend** : La Lambda `sentinelShipper` capture les logs d'exécution AWS et les envoie à l'espace de travail Log Analytics.
3.  **Règles de Détection** : Des requêtes KQL (Kusto Query Language) sont configurées pour alerter en cas de comportement suspect (ex: "Brute Force" détecté si > 5 échecs en 1 minute).

---

## 3. 🎬 Guide de Démonstration (Comment montrer le projet)

Voici le scénario idéal pour présenter le projet lors de la soutenance.

### Étape 1 : Authentification & Sécurité JWT
*   **Action** : Connectez-vous sur le Frontend avec un utilisateur valide.
*   **Montrer** : Ouvrez les "Outils de développement" (F12) -> Application -> Local Storage. Montrez le **Token JWT**.
*   **Expliquer** : "Ce token est signé par notre KMS AWS. Le frontend ne peut pas le falsifier."

### Étape 2 : Le Contrôle d'Accès (Anti-Replay)
*   **Action 1** : Scannez un billet valide (utilisez un des JWT valides générés par le script).
    *   *Résultat* : Accès Autorisé (Vert).
*   **Action 2** : Réessayez de scanner le **MÊME** billet immédiatement.
    *   *Résultat* : **Accès Refusé (Rouge) - "Déjà utilisé"**.
*   **Expliquer** : "Le système a enregistré l'ID unique du token (JTI) dans DynamoDB. Toute tentative de réutilisation est bloquée instantanément."

### Étape 3 : L'Audit de Sécurité Automatisé (La "Killer Feature")
*   **Contexte** : "Nous ne nous contentons pas de coder, nous testons notre sécurité tous les jours."
*   **Action** :
    1.  Allez dans la console **AWS S3**.
    2.  Ouvrez le bucket `security-reports`.
    3.  Téléchargez et ouvrez le dernier rapport HTML généré par ZAP.
*   **Montrer** : Le rapport affichant les vulnérabilités testées sur l'API.

### Étape 4 : La Surveillance SIEM (Azure Sentinel)
*   **Action** :
    1.  Tentez de vous connecter 5 fois avec un mauvais mot de passe sur le frontend.
    2.  Ouvrez le portail **Microsoft Defender (Sentinel)**.
    3.  Allez dans "Logs" et lancez la requête :
        ```kusto
        AppEvents | where Name == "Login_Failure"
        ```
*   **Montrer** : Les logs apparaissent en quasi temps réel, montrant l'IP de l'attaquant et le nom d'utilisateur tenté.

---

## 4. 📝 Conclusion

Ce module M2 démontre une maîtrise complète de la chaîne de sécurité Cloud :
1.  **Protection** (JWT, KMS, IAM).
2.  **Détection** (Sentinel, Logs centralisés).
3.  **Vérification** (Scans ZAP automatisés).
4.  **Résilience** (Architecture Serverless).
