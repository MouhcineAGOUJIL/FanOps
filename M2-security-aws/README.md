# 🔐 M2 - Secure-Gates (AWS)

## Validation Sécurisée de Billets pour CAN 2025

[![AWS Lambda](https://img.shields.io/badge/AWS-Lambda-FF9900?style=for-the-badge&logo=aws-lambda&logoColor=white)](https://aws.amazon.com/lambda/)
[![DynamoDB](https://img.shields.io/badge/AWS-DynamoDB-4053D6?style=for-the-badge&logo=amazon-dynamodb&logoColor=white)](https://aws.amazon.com/dynamodb/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Serverless](https://img.shields.io/badge/Serverless-Framework-FD5750?style=for-the-badge&logo=serverless&logoColor=white)](https://www.serverless.com/)

---

## 🎯 Mission

Microservice de **sécurité critique** qui gère la validation des billets JWT pour les 45,000+ supporters de la CAN 2025.

### Objectifs
- ⚡ **Performance** : < 200ms par validation
- 🔒 **Sécurité** : Anti-fraude + Anti-rejeu
- 📊 **Auditabilité** : 100% des tentatives loggées
- 🚀 **Scalabilité** : 10,000 req/min au pic

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────┐
│         API Gateway (AWS)                 │
│  POST /security/verifyTicket             │
│  POST /security/reportGate               │
└─────────────┬────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────┐
│         Lambda Functions                  │
│  • verifyTicket()   (256 MB, 10s)        │
│  • reportGate()     (128 MB, 10s)        │
└─────────────┬────────────────────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
┌─────────┐ ┌───────┐ ┌──────────┐
│DynamoDB │ │  SQS  │ │CloudWatch│
│used_jti │ │events │ │  Logs    │
│audit    │ │       │ │  Alarms  │
└─────────┘ └───────┘ └──────────┘
```

---

## 📋 Fonctionnalités

### ✅ Validation JWT
- Vérification signature JWT
- Validation des claims (jti, ticketId, matchId, exp)
- Check expiration

### 🛡️ Anti-Rejeu (Replay Attack Prevention)
- Table DynamoDB `used_jti` pour tracker les tokens utilisés
- TTL automatique (24h)
- Alerte en temps réel via SQS

### 📊 Audit Complet
- Table DynamoDB `audit` pour toutes les tentatives
- Index sur timestamp pour requêtes rapides
- Retention 14 jours

### 🚨 Alertes Sécurité
- Queue SQS pour événements critiques
- CloudWatch Alarms :
  - Taux d'erreur > 5%
  - > 5 tentatives de rejeu en 5 min

### 📈 Monitoring
- CloudWatch Logs pour debug
- Métriques Lambda (invocations, durée, erreurs)
- Dashboard CloudWatch (optionnel)

---

## 🚀 Installation

### Prérequis
```bash
Node.js >= 18.0.0
npm >= 9.0.0
AWS CLI configuré
Compte AWS (Free Tier OK)
```

### 1️⃣ Cloner & Installer
```bash
git clone https://github.com/ton-username/m2-security-aws.git
cd m2-security-aws
npm install
```

### 2️⃣ Configuration
Créer `.env` :
```bash
cp .env.example .env
```

**`.env`**
```env
# JWT Secret (CHANGER EN PRODUCTION!)
JWT_SECRET=can2025-super-secret-key-change-me-in-production

# AWS Configuration
AWS_REGION=eu-west-1
AWS_STAGE=dev

# Optionnel (pour tests locaux)
USED_JTI_TABLE=can2025-secure-gates-dev-used-jti
AUDIT_TABLE=can2025-secure-gates-dev-audit
```

### 3️⃣ Déploiement sur AWS
```bash
# Dev
npm run deploy:dev

# Production (attention!)
npm run deploy:prod
```

**Output attendu :**
```
✔ Service deployed to stack can2025-secure-gates-dev
endpoints:
  POST - https://xxxxx.execute-api.eu-west-1.amazonaws.com/dev/security/verifyTicket
  POST - https://xxxxx.execute-api.eu-west-1.amazonaws.com/dev/security/reportGate
functions:
  verifyTicket: can2025-secure-gates-dev-verifyTicket
  reportGate: can2025-secure-gates-dev-reportGate
```

---

## 🧪 Tests

### Tests Unitaires
```bash
npm test
```

### Coverage
```bash
npm run test:coverage
```

### Tests d'Intégration
```bash
# Lancer en local d'abord
npm run offline

# Dans un autre terminal
API_URL=http://localhost:3000/dev npm run test
```

---

## 📡 API Documentation

### POST /security/verifyTicket

Valide un billet JWT.

**Request:**
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "gateId": "G1",
  "deviceId": "scanner-01"
}
```

**Response (Succès):**
```json
{
  "ok": true,
  "reason": "valid",
  "ticketId": "TICKET-12345",
  "matchId": "CAN2025-MAR-G1",
  "seatNumber": "A-123",
  "message": "Billet valide, accès autorisé"
}
```

**Response (Échec):**
```json
{
  "ok": false,
  "reason": "replay",
  "message": "Ce billet a déjà été utilisé"
}
```

**Raisons d'échec possibles:**
- `missing_parameters` (400)
- `invalid_jwt` (signature invalide)
- `invalid_claims` (claims manquants)
- `expired` (token expiré)
- `replay` (déjà utilisé)
- `internal_error` (500)

---

### POST /security/reportGate

Rapport de statut d'un portique (pour monitoring).

**Request:**
```json
{
  "gateId": "G1",
  "deviceId": "scanner-01",
  "reportType": "stats",
  "validTickets": 247,
  "invalidTickets": 3,
  "replayAttempts": 1,
  "avgScanTime": 1.8
}
```

**Response:**
```json
{
  "success": true,
  "reportId": "uuid-xxx-yyy",
  "message": "Rapport enregistré avec succès"
}
```

---

## 🛠️ Utilitaires

### Générer un JWT de test
```bash
npm run generate-jwt
```

**Script `scripts/generateTestJWT.js`:**
```javascript
const { generateTicketJWT } = require('../src/utils/jwt');

const testJWT = generateTicketJWT({
  ticketId: 'TEST-001',
  matchId: 'CAN2025-MAR-G1',
  seatNumber: 'VIP-42',
  fanName: 'Mohammed Test'
});

console.log('\n🎫 Test JWT Generated:\n');
console.log(testJWT);
console.log('\n✅ Use this JWT for testing the API\n');
```

### Tester l'API
```bash
# Avec curl
curl -X POST https://YOUR-API-URL/dev/security/verifyTicket \
  -H "Content-Type: application/json" \
  -d '{
    "jwt": "YOUR-JWT-HERE",
    "gateId": "G1",
    "deviceId": "test-scanner"
  }'
```

---

## 📊 Monitoring & Debug

### Voir les logs en temps réel
```bash
npm run logs
```

### Dashboard CloudWatch
1. AWS Console → CloudWatch
2. Dashboards → Create Dashboard
3. Ajouter widgets :
   - Lambda Invocations
   - Lambda Errors
   - Lambda Duration
   - DynamoDB Read/Write Units

### Alarmes importantes
- **HighErrorRate** : > 10 erreurs en 5 min
- **ReplayAttackAlarm** : > 5 tentatives de rejeu

---

## 🚨 Gestion des Incidents

### Problème : Taux d'erreur élevé
```bash
# 1. Vérifier les logs
npm run logs

# 2. Vérifier CloudWatch Metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Errors \
  --dimensions Name=FunctionName,Value=can2025-secure-gates-dev-verifyTicket \
  --start-time 2025-01-01T00:00:00Z \
  --end-time 2025-01-01T23:59:59Z \
  --period 300 \
  --statistics Sum

# 3. Rollback si nécessaire
serverless rollback --timestamp PREVIOUS-TIMESTAMP
```

### Problème : Attaque de rejeu massive
```bash
# 1. Analyser la queue SQS
aws sqs receive-message \
  --queue-url https://sqs.eu-west-1.amazonaws.com/YOUR-ACCOUNT/security-events

# 2. Vérifier la table used_jti
aws dynamodb scan \
  --table-name can2025-secure-gates-dev-used-jti \
  --limit 10
```

---

## 💰 Coûts AWS (Estimation)

### Free Tier (Premier an)
- Lambda : 1M requêtes/mois GRATUIT
- DynamoDB : 25 GB stockage GRATUIT
- CloudWatch : 10 métriques custom GRATUITES

### Au-delà du Free Tier
- Lambda : $0.20 par 1M requêtes
- DynamoDB : $0.25 par GB/mois
- API Gateway : $3.50 par 1M requêtes

**Coût estimé pour un match (45,000 validations) :** < $0.50

---

## 📁 Structure du Projet

```
m2-security-aws/
├── src/
│   ├── handlers/
│   │   ├── verifyTicket.js       ⭐ Main Lambda
│   │   └── reportGate.js         
│   ├── utils/
│   │   ├── jwt.js                🔑 JWT utilities
│   │   ├── dynamodb.js           
│   │   └── sqs.js                
│   └── config/
│       └── constants.js          
├── tests/
│   ├── verifyTicket.test.js      🧪 Unit tests
│   └── integration.test.js       🧪 Integration tests
├── scripts/
│   └── generateTestJWT.js        🛠️ Dev tools
├── serverless.yml                ⚙️ Infrastructure as Code
├── package.json                  
├── .env.example                  
├── .gitignore                    
└── README.md                     📖 Ce fichier
```

---

## 🔄 Workflow de Développement

```bash
# 1. Créer une branche
git checkout -b feature/rate-limiting

# 2. Développer localement
npm run offline

# 3. Tester
npm test

# 4. Déployer en dev
npm run deploy:dev

# 5. Tester en dev
curl https://DEV-URL/security/verifyTicket ...

# 6. Merge & déployer en prod
git checkout main
git merge feature/rate-limiting
npm run deploy:prod
```

---

## 🚀 Améliorations Futures

- [ ] Rate limiting par IP
- [ ] Blacklist de JTI compromis
- [ ] Dashboard temps réel (React)
- [ ] Export audit vers S3
- [ ] ML pour détection d'anomalies
- [ ] Support multi-région
- [ ] Cache Redis pour JTI (ElastiCache)

---

## 👥 Équipe

**Développeur M2 :** [Ton Nom]
**Projet :** CAN 2025 FanOps Platform
**Cloud :** Amazon Web Services (AWS)

---

## 📝 License

MIT License - Projet académique CAN 2025

---

## 🙏 Ressources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Serverless Framework](https://www.serverless.com/framework/docs/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [JWT.io](https://jwt.io/) - Debugger JWT

---

<div align="center">

**Made with 🔐 for CAN 2025**

[⬆ Retour en haut](#m2---secure-gates-aws)

</div>