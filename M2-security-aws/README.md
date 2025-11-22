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
- 🛡️ **Protection** : Rate Limiting (Anti-DDoS)
- 📊 **Auditabilité** : 100% des tentatives loggées
- 🚀 **Scalabilité** : 10,000 req/min au pic

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────┐
│         API Gateway (AWS)                 │
│  • Rate Limit: 100 req/sec               │
│  • Burst: 200 req                        │
│  • POST /security/verifyTicket           │
│  • POST /security/reportGate             │
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

┌──────────────────────────────────────────┐
│         Infrastructure (IaaS)             │
│  • EC2 Instance (t2.micro)               │
│    (Pour tests de charge / attaques)     │
└──────────────────────────────────────────┘
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

### 🚦 Rate Limiting (Nouveau)
- Protection au niveau API Gateway
- **Limite** : 100 requêtes/seconde
- **Quota** : 5000 requêtes/mois (configurable)
- **Burst** : 200 requêtes simultanées

### 📊 Audit Complet
- Table DynamoDB `audit` pour toutes les tentatives
- Index sur timestamp pour requêtes rapides
- Retention 14 jours

### 🚨 Alertes Sécurité
- Queue SQS pour événements critiques
- CloudWatch Alarms :
  - Taux d'erreur > 5%
  - > 5 tentatives de rejeu en 5 min

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
```

### 3️⃣ Déploiement sur AWS
```bash
# Dev (Déploie Lambda, DynamoDB, SQS et EC2 de test)
npm run deploy:dev
```

**Output attendu :**
```
✔ Service deployed to stack can2025-secure-gates-dev
endpoints:
  POST - https://xxxxx.execute-api.eu-west-1.amazonaws.com/dev/security/verifyTicket
  POST - https://xxxxx.execute-api.eu-west-1.amazonaws.com/dev/security/reportGate
```

### 4️⃣ Nettoyage (Suppression des ressources)
Pour supprimer toutes les ressources (Lambda, DynamoDB, API Gateway, EC2) et arrêter les coûts :
```bash
serverless remove --stage dev
```

---

## 🧪 Tests

### Générer un JWT de test
```bash
npm run generate-jwt
```
*Utilisez ce token pour tester l'API.*

### Tester l'API (verifyTicket)
```bash
curl -X POST https://YOUR-API-URL/dev/security/verifyTicket \
  -H "Content-Type: application/json" \
  -d '{
    "jwt": "PASTE_YOUR_JWT_HERE",
    "gateId": "G1",
    "deviceId": "test-scanner"
  }'
```

### Tester le Reporting (reportGate)
*Note : Actuellement supporté uniquement côté Backend (pas d'UI Frontend).*
```bash
curl -X POST https://YOUR-API-URL/dev/security/reportGate \
  -H "Content-Type: application/json" \
  -d '{
    "gateId": "G1",
    "deviceId": "scanner-01",
    "reportType": "stats",
    "validTickets": 150,
    "invalidTickets": 3,
    "message": "Gate operating normally"
  }'
```

---

## 💰 Coûts AWS (Estimation)

### Free Tier (Premier an)
- Lambda : 1M requêtes/mois GRATUIT
- DynamoDB : 25 GB stockage GRATUIT
- EC2 (t2.micro) : 750 heures/mois GRATUIT

### Au-delà du Free Tier
- Lambda : $0.20 par 1M requêtes
- DynamoDB : $0.25 par GB/mois
- API Gateway : $3.50 par 1M requêtes
- EC2 (t2.micro) : ~$9.00/mois (si allumé 24/7)

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
│   └── generateProperTestJWT.js  🛠️ Générateur de JWT
├── serverless.yml                ⚙️ Infrastructure as Code (Lambda, DynamoDB, SQS, EC2)
├── package.json                  
├── .env.example                  
└── README.md                     📖 Ce fichier
```

---

## 👥 Équipe

**Développeur M2 :** [Ton Nom]
**Projet :** CAN 2025 FanOps Platform
**Cloud :** Amazon Web Services (AWS)

---

<div align="center">

**Made with 🔐 for CAN 2025**

[⬆ Retour en haut](#m2---secure-gates-aws)

</div>