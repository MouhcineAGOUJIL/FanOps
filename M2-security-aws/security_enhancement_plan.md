# Plan d'Amélioration de la Sécurité (M2 - Secure Gates)

Ce document détaille comment transformer le service `M2-security-aws` en un véritable contrôleur de sécurité centralisé, comme demandé.

## 1. IAM Centralisé (Identity & Access Management)

Actuellement, le service vérifie uniquement les billets (JWT). Pour devenir un IAM central, il doit gérer les utilisateurs, les rôles et les permissions.

### Architecture Suggérée : AWS Cognito (Recommandé) ou Custom (DynamoDB)

**Option A : AWS Cognito (Recommandé pour la robustesse)**
C'est la solution standard sur AWS. Elle gère nativement le Multi-Tenant (User Pools), les tokens (Access/Refresh/ID), et l'expiration.
*   **Mise en place** :
    1.  Créer un **User Pool** Cognito pour gérer les utilisateurs.
    2.  Créer des **Groupes** Cognito pour les rôles (Admin, Staff, GateKeeper).
    3.  Utiliser un **Lambda Authorizer** dans API Gateway pour valider les tokens Cognito avant qu'ils n'atteignent vos Lambdas.

**Option B : Solution Custom (Ce que vous semblez vouloir)**
Si vous voulez tout coder vous-même dans M2 :

1.  **Base de données (DynamoDB)** :
    *   Table `Users` : `userId`, `username`, `passwordHash`, `role`, `organizationId` (pour Multi-Tenant).
    *   Table `Roles` : `roleName`, `permissions` (ex: `['gate:read', 'gate:write']`).
    *   Table `Sessions` : `sessionId`, `userId`, `refreshToken`, `expiresAt`.

2.  **Nouveaux Endpoints Lambda** :
    *   `POST /auth/login` : Vérifie user/pass, génère Access Token (JWT court) + Refresh Token (long).
    *   `POST /auth/refresh` : Échange un Refresh Token valide contre un nouveau Access Token.
    *   `POST /auth/logout` : Invalide le Refresh Token.

3.  **Middleware de Sécurité (Authorizer)** :
    *   Créer une fonction Lambda `authorizer` qui intercepte toutes les requêtes.
    *   Elle vérifie le JWT, extrait le rôle, et compare avec les ACL requises pour la route.

### Exemple de structure de données (DynamoDB)
```json
// Table Users
{
  "userId": "u-123",
  "orgId": "org-A",
  "role": "supervisor",
  "permissions": ["view_logs", "manage_gates"] // Surcharge possible
}
```

---

## 2. Analyse des logs + Détection d’anomalies

### Centralisation
Actuellement, vos logs vont dans CloudWatch Logs.
*   **Action** : Configurer un **Subscription Filter** sur vos Log Groups CloudWatch.
*   **Destination** :
    *   **AWS OpenSearch** (Elasticsearch managé) pour une analyse en temps réel.
    *   **Kinesis Firehose** -> **S3** (pour archivage) -> **Azure Sentinel** (via connecteur S3).

### Détection d'anomalies (Implémentation dans M2)
Vous pouvez ajouter une Lambda `LogAnalyzer` déclenchée par un stream DynamoDB (sur `AuditTable`) ou par CloudWatch Logs.

**Règles à implémenter :**
1.  **Brute Force** :
    *   Compter les échecs de login par IP dans une fenêtre de 5 min (utiliser Redis ou DynamoDB avec TTL).
    *   *Seuil* : > 5 échecs -> Bloquer IP temporairement.
2.  **Impossible Travel** :
    *   Si un user se connecte de Paris à 10h00 et de New York à 10h05.
    *   Nécessite de stocker la dernière IP + GeoIP.
3.  **Injection** :
    *   Scanner les payloads entrants pour des motifs SQLi/XSS (ex: `' OR 1=1`).
    *   *Note* : AWS WAF fait ça automatiquement en amont d'API Gateway (Recommandé).

---

## 3. Gestion des clés et secrets (KMS)

Ne stockez jamais de secrets en clair dans les variables d'environnement (`serverless.yml`).

### Intégration AWS KMS & SSM Parameter Store
1.  **Créer une clé CMK (Customer Master Key)** dans AWS KMS.
2.  **Stocker les secrets** dans AWS Systems Manager (SSM) Parameter Store, chiffrés avec cette clé.
    *   Ex: `/can2025/prod/jwt-secret`
3.  **Mise à jour `serverless.yml`** :
    ```yaml
    provider:
      environment:
        JWT_SECRET: ${ssm:/can2025/${opt:stage}/jwt-secret, 'default-dev-secret'}
      iamRoleStatements:
        - Effect: Allow
          Action:
            - kms:Decrypt
          Resource: arn:aws:kms:region:account:key/your-key-id
    ```

### Rotation automatique
*   Pour les secrets de base de données (si RDS), AWS Secrets Manager gère la rotation.
*   Pour votre clé JWT privée : Vous devez créer une Lambda `RotateKey` déclenchée par EventBridge (Cron) qui :
    1.  Génère une nouvelle paire de clés.
    2.  Met à jour SSM.
    3.  (Important) Garde l'ancienne clé valide pendant une période de grâce pour ne pas déconnecter les utilisateurs actifs.

---

## 4. Security Testing automatisé

Intégrez ces outils dans votre pipeline CI/CD (GitHub Actions ou GitLab CI).

### Pipeline Suggéré
1.  **SCA (Software Composition Analysis)** :
    *   Outil : `npm audit` ou **Snyk**.
    *   *Action* : Vérifie les vulnérabilités dans `node_modules`.
    *   `npm audit --audit-level=high`
2.  **SAST (Static Application Security Testing)** :
    *   Outil : **SonarQube** ou **ESLint** avec plugin sécurité (`eslint-plugin-security`).
    *   *Action* : Analyse le code source pour trouver des failles (ex: `eval()`, regex ReDoS).
3.  **DAST (Dynamic Application Security Testing)** :
    *   Outil : **OWASP ZAP** (Zed Attack Proxy).
    *   *Action* : Lance un scan contre votre API déployée en staging.
    *   Utiliser l'action GitHub `zaproxy/action-full-scan`.

### Exemple GitHub Action (`.github/workflows/security.yml`)
```yaml
name: Security Scan
on: [push]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Dependency Check
        run: npm audit --audit-level=high
      - name: SAST Scan
        run: npx eslint .
      - name: DAST Scan (OWASP ZAP)
        uses: zaproxy/action-baseline@v0.9.0
        with:
          target: 'https://api-staging.votre-domaine.com'
```
