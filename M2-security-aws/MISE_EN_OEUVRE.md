# 🛡️ Mise en Œuvre Détaillée du Service de Sécurité M2 (Secure Gates)

Ce document est le guide technique de référence pour le module **M2 - Secure Gates**. Il détaille l'architecture complète, la configuration pas-à-pas, le déploiement et le fonctionnement opérationnel du système de sécurité de la CAN 2025.

---

## 1. 🏗️ Architecture Complète et Flux de Données

Le système repose sur une architecture **Serverless Hybride (AWS + Azure)** conçue pour la résilience et la sécurité.

### Diagramme d'Architecture Détaillé

```mermaid
graph TD
    subgraph Client ["Frontend (React/Vite)"]
        App[Application Web FanOps]
        SDK[Azure App Insights SDK]
    end

    subgraph AWS ["AWS Cloud (Backend & Compute)"]
        APIGW[API Gateway (REST API)]
        
        subgraph Compute ["Lambda Functions (Node.js 20.x)"]
            Auth[Auth Service]
            Verify[Ticket Verification]
            Shipper[Sentinel Log Shipper]
        end
        
        subgraph Storage ["DynamoDB (On-Demand)"]
            Users[Users Table]
            Tickets[Sold Tickets]
            JTI[Used JTI (Anti-Replay)]
            Audit[Audit Logs]
        end
        
        subgraph Security ["Security Services"]
            KMS[AWS KMS (Encryption)]
            SSM[SSM Parameter Store]
        end

        subgraph Testing ["Security Audit"]
            EC2[EC2 Instance (Ubuntu)]
            ZAP[OWASP ZAP Scanner]
            S3[S3 Reports Bucket]
        end
    end

    subgraph Azure ["Azure Cloud (SIEM & Observability)"]
        Sentinel[Microsoft Sentinel]
        LAW[Log Analytics Workspace]
    end

    %% Flux Applicatifs
    App -->|1. HTTPS POST /login| APIGW
    App -->|2. HTTPS POST /verifyTicket| APIGW
    APIGW -->|3. Trigger| Auth & Verify
    
    %% Flux de Données
    Auth -->|Read Hash| Users
    Verify -->|Read Ticket| Tickets
    Verify -->|Check/Write| JTI
    Verify -->|Decrypt Secret| KMS
    
    %% Flux de Sécurité Offensive
    EC2 -->|Cron Daily| ZAP
    ZAP -->|Attack/Scan| APIGW
    ZAP -->|Upload Report| S3
    
    %% Flux de Surveillance (SIEM)
    SDK -->|Telemetry| LAW
    Shipper -->|Forward Logs| Sentinel
    Audit -->|Stream| Shipper
```

---

## 2. ⚙️ Mise en Œuvre : De la Configuration au Déploiement

Cette section explique comment chaque composant a été configuré et assemblé.

### A. Configuration de l'Infrastructure (Serverless Framework)

Tout est défini dans `serverless.yml`. C'est la source de vérité.

1.  **Provider & IAM** :
    *   Nous avons configuré le provider sur `aws` en région `eu-west-1`.
    *   **Sécurité** : Les rôles IAM sont définis avec le principe de moindre privilège. Par exemple, la fonction `verifyTicket` a le droit `dynamodb:PutItem` sur la table `UsedJTI` mais aucun accès à la table `Users`.
    *   **Variables d'Environnement** : Les noms de tables sont dynamiques (`${self:service}-users-${opt:stage}`) pour permettre de déployer plusieurs environnements (dev, staging, prod) sans conflit.

2.  **Ressources DynamoDB** :
    *   Les tables sont créées avec `BillingMode: PAY_PER_REQUEST` pour éviter de payer pour la capacité inutilisée.
    *   **TTL (Time To Live)** : Activé sur la table `UsedJTI`. Les tokens utilisés sont automatiquement supprimés après 24h, ce qui nettoie la base sans code supplémentaire.
    *   **Streams** : Activés sur la table `Audit` pour permettre le traitement en temps réel des événements de sécurité.

3.  **Instance d'Audit (EC2)** :
    *   Définie comme ressource CloudFormation `AWS::EC2::Instance`.
    *   **UserData** : Un script de démarrage installe automatiquement les dépendances (Java, AWS CLI) au premier lancement.
    *   **Security Group** : Restreint l'accès SSH (Port 22) uniquement à notre IP d'administration.

### B. Gestion des Secrets (KMS & SSM)

Pour sécuriser la signature des billets :
1.  **Création** : Une clé symétrique a été générée dans AWS KMS.
2.  **Stockage** : Le secret de signature JWT n'est **JAMAIS** dans le code. Il est stocké chiffré dans le **Parameter Store** (`/can2025/dev/jwt-secret`).
3.  **Utilisation** : Au démarrage, la Lambda appelle KMS pour déchiffrer ce secret et le garde en cache mémoire pour la performance.
4.  **Rotation** : Une fonction Lambda `rotateKey` est prête à être déclenchée pour changer le secret périodiquement sans interruption de service.

### C. Automatisation des Tests de Sécurité (ZAP)

Nous avons transformé une instance Ubuntu standard en un scanner de sécurité autonome.

*   **Installation** : Un script (`install_zap_manual.sh`) télécharge OWASP ZAP.
*   **Planification** : Une tâche **Cron** est configurée : `0 2 * * * /home/ubuntu/daily_scan.sh`.
*   **Exécution** :
    1.  À 02h00, le script se réveille.
    2.  Il lance ZAP en mode "Headless" (sans interface) contre l'URL de l'API Gateway.
    3.  Il génère un rapport HTML.
    4.  Il utilise l'identité IAM de l'instance pour uploader le rapport sur S3.
*   **Rôle IAM** : L'instance utilise un profil d'instance (`SecurityInstanceProfile`) qui lui donne uniquement le droit `s3:PutObject` sur le bucket de rapports. Elle ne peut rien faire d'autre sur le compte AWS.

### D. Pipeline de Logs vers Azure Sentinel

Pour unifier la surveillance :
1.  **Capture** : CloudWatch collecte tous les logs des Lambdas.
2.  **Transport** : La fonction `sentinelShipper` est abonnée aux groupes de logs CloudWatch.
3.  **Ingestion** : Elle transforme les logs au format JSON et les envoie à l'API HTTP Data Collector d'Azure Monitor.
4.  **Visualisation** : Dans Azure Sentinel, les logs apparaissent dans la table `AppEvents_CL`.
5.  **Corrélation** : Sentinel relie ces logs backend aux logs frontend (Application Insights) pour tracer le parcours complet d'un utilisateur.

---

## 3. 🚀 Fonctionnement Opérationnel (Runtime)

Voici ce qui se passe concrètement lorsqu'un agent scanne un billet au stade.

### Scénario : Validation d'un Billet

1.  **Scan du QR Code** : Le Gatekeeper scanne le billet avec l'application React.
2.  **Requête API** : Le frontend envoie le JWT brut à `POST /security/verifyTicket`.
3.  **API Gateway** :
    *   Vérifie que la requête vient bien de notre domaine (CORS).
    *   Vérifie que le quota de requêtes n'est pas dépassé (Throttling).
4.  **Lambda `verifyTicket`** :
    *   **Étape 1 (Crypto)** : Vérifie la signature du JWT avec la clé KMS. Si invalide -> Rejet immédiat.
    *   **Étape 2 (Anti-Replay)** : Cherche l'ID du token (`jti`) dans la table `UsedJTI`. Si présent -> **ALERTE ROUGE (Fraude)**.
    *   **Étape 3 (Validation)** : Vérifie que le billet existe dans `SoldTickets`.
    *   **Étape 4 (Commit)** : Inscrit le `jti` dans `UsedJTI` pour le "brûler".
5.  **Réponse** : Renvoie `Access Granted` (Vert) ou `Access Denied` (Rouge).
6.  **Audit** : L'événement est logué dans DynamoDB `AuditTable` et envoyé asynchronement à Azure Sentinel pour analyse.

---

## 4. 🛡️ Démonstration de la Sécurité

Pour prouver l'efficacité du système :

1.  **Test Anti-Replay** :
    *   Scannez un billet valide -> **Succès**.
    *   Re-scannez le même billet 1 seconde plus tard -> **Échec (Déjà utilisé)**.
2.  **Test d'Intégrité** :
    *   Modifiez un caractère du JWT dans le frontend.
    *   Envoyez la requête -> **Échec (Signature Invalide)**.
3.  **Visibilité SIEM** :
    *   Ouvrez Azure Sentinel.
    *   Montrez les logs d'échec de connexion et les tentatives de fraude en temps réel.
4.  **Rapports ZAP** :
    *   Ouvrez le bucket S3 et montrez le rapport HTML généré la nuit précédente, prouvant que l'infrastructure est auditée quotidiennement.

---

## 5. 💰 Analyse FinOps (Coûts)

L'architecture Serverless permet une optimisation drastique des coûts.

| Service | Métrique | Coût Est. / Mois |
| :--- | :--- | :--- |
| **AWS Lambda** | 1M requêtes (128MB) | \$0.20 |
| **API Gateway** | 1M requêtes | \$3.50 |
| **DynamoDB** | 1M écritures | \$1.25 |
| **EC2 (t3.micro)** | Instance Réservée | \$4.00 |
| **Azure Sentinel** | 5 GB logs/mois | \$12.00 |
| **Total** | | **~ \$21.00** |

Cette architecture coûte moins cher qu'un abonnement Netflix, tout en étant capable de gérer la sécurité d'un événement international.
