# 🤖 M4 - Sponsor AI Microservice

> Microservice d'intelligence artificielle pour recommandations de sponsors en temps réel lors de la CAN 2025.

[![GCP](https://img.shields.io/badge/GCP-Cloud%20Functions-4285F4?logo=google-cloud)](https://cloud.google.com/functions)
[![Python](https://img.shields.io/badge/Python-3.10-3776AB?logo=python)](https://www.python.org/)
[![ML](https://img.shields.io/badge/ML-Random%20Forest-FF6F00?logo=scikit-learn)](https://scikit-learn.org/)
[![Status](https://img.shields.io/badge/Status-Production-success)](https://europe-west1-can2025-fanops.cloudfunctions.net/m4-sponsor-ai)

## 📋 Table des Matières

- [Vue d'Ensemble](#-vue-densemble)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Tests](#-tests)
- [Déploiement](#%EF%B8%8F-déploiement)
- [API Documentation](#-api-documentation)
- [Structure du Projet](#-structure-du-projet)
- [Sponsors Configurés](#-sponsors-configurés)

## 🎯 Vue d'Ensemble

Le microservice M4 utilise un modèle **Random Forest** pour analyser le contexte d'un match (score, événements, météo, zone du stade) et recommander le sponsor le plus pertinent avec un message marketing personnalisé.

### Problématique
Comment maximiser l'impact des publicités en affichant le bon sponsor, au bon moment, dans la bonne zone du stade ?

### Solution
Un système ML serverless qui :
- ✅ Analyse 6 variables contextuelles en temps réel
- ✅ Prédit parmi 12 sponsors configurés
- ✅ Retourne un message marketing personnalisé
- ✅ Répond en <200ms (warm start)
```

### Dépendances Principales
- `functions-framework` : Émule Cloud Functions localement
- `scikit-learn` : Modèle Random Forest
- `pandas` : Manipulation de données
- `google-cloud-storage` : Accès à GCS

## 🧪 Tests

### 1️⃣ Test Rapide (Sans Serveur)
Vérifie la logique du modèle avec des scénarios prédéfinis.

```bash
python verify_local.py
```

**Sortie attendue :**
```
🧪 Test 1: Canicule
   Sponsor: Sidi Ali
   Message: Rafraîchissez-vous avec Sidi Ali !
   ✅ Logique correcte

🧪 Test 2: But Victorieux
   Sponsor: Puma
   Message: Victoire en Puma ! 🦁
   ✅ Logique correcte
```

### 2️⃣ Test avec Serveur Local
Simule une vraie API HTTP.

```bash
# Terminal 1 : Lancer le serveur
python -m functions_framework --target=sponsor_recommendation --debug --port=8080

# Terminal 2 : Envoyer une requête
curl -X POST http://localhost:8080/ \
   -H "Content-Type: application/json" \
   -d '{"temperature": 35, "match_minute": 20, "zone": "North"}'
```

### 3️⃣ Test en Production (Postman)
**URL** : `https://europe-west1-can2025-fanops.cloudfunctions.net/m4-sponsor-ai`

**Exemple de Requête :**
```json
{
  "match_minute": 89,
  "score_diff": 1,
  "event": "Goal",
  "temperature": 24,
  "zone": "VIP",
  "crowd_density": 0.95
}
```

**Réponse Attendue :**
```json
{
  "recommended_sponsor": "Puma",
  "confidence": 0.92,
  "campaign_message": "Victoire en Puma ! 🦁",
  "category": "Sports Equipment",
  "context_used": { ... }
}
```

## ☁️ Déploiement

### Méthode 1 : Script Automatisé
```bash
chmod +x deploy.sh
./deploy.sh
```

### Méthode 2 : Commande Manuelle
```bash
gcloud functions deploy m4-sponsor-ai \
  --gen2 \
  --region=europe-west1 \
  --runtime=python310 \
  --memory=512MB \
  --trigger-http \
  --entry-point=sponsor_recommendation \
  --allow-unauthenticated \
  --set-env-vars GCP_MODEL_BUCKET=fanops-m4-models
```

### Étapes de Déploiement
1. **Upload du Modèle** : `gcloud storage cp model.joblib gs://fanops-m4-models/`
2. **Déploiement** : `./deploy.sh` (2-3 minutes)
3. **Vérification** : Test avec Postman

## 📖 API Documentation

### OpenAPI Specification
Le fichier [`openapi.yaml`](./openapi.yaml) contient la spécification complète.

**Visualiser** : [Swagger Editor](https://editor.swagger.io/)

### Endpoint Principal

**POST** `/`

**Headers :**
```
Content-Type: application/json
```

**Body :**
| Champ | Type | Requis | Description | Exemple |
|-------|------|--------|-------------|---------|
| `match_minute` | int | Non | Minute du match (0-120) | `45` |
| `score_diff` | int | Non | Différence de score | `1` |
| `temperature` | float | Non | Température en °C | `28.5` |
| `crowd_density` | float | Non | Densité foule (0-1) | `0.85` |
| `zone` | string | **Oui** | Zone du stade | `"VIP"` |
| `event` | string | Non | Événement significatif | `"Goal"` |

**Valeurs Possibles :**
- `zone` : `VIP`, `North`, `South`, `East`, `West`
- `event` : `None`, `Goal`, `Card`, `VAR`, `Halftime`, `Kickoff`, `FinalWhistle`

**Réponse (200 OK) :**
```json
{
  "recommended_sponsor": "string",
  "confidence": 0.92,
  "campaign_message": "string",
  "category": "string",
  "context_used": { ... }
}
```

## 📁 Structure du Projet

```
M4-sponsor-gcp/
├── main.py                    # Cloud Function (API)
├── train_model.py             # Entraînement du modèle ML
├── sponsors_config.py         # Configuration des 12 sponsors
├── verify_local.py            # Tests locaux
├── requirements.txt           # Dépendances Python
├── deploy.sh                  # Script de déploiement
├── openapi.yaml               # Spécification API
├── README.md                  # Ce fichier
├── ARCHITECTURE.md            # Documentation architecture
├── PRESENTATION_GUIDE.md      # Guide pour présentation
├── .gitignore                 # Fichiers à ignorer
├── model.joblib               # Modèle ML (ignoré par Git)
└── model_columns.joblib       # Colonnes du modèle (ignoré par Git)
```

## 🏢 Sponsors Configurés

| Sponsor | Catégorie | Déclencheur Principal |
|---------|-----------|----------------------|
| **Sidi Ali** | Beverage | Température > 30°C |
| **Coca-Cola** | Beverage | Mi-temps, Pause |
| **Orange** | Telecom | Zones VIP, Connectivité |
| **Inwi** | Telecom | Zones populaires |
| **Puma** | Sports | Buts, Victoires |
| **Adidas** | Sports | Performance, Compétition |
| **Royal Air Maroc** | Travel | Zones VIP, International |
| **OCP** | Industry | Zones VIP, Prestige |

**Sortie :**
```
✅ Données générées : 10,000 scénarios
✅ Modèle entraîné : Random Forest (100 arbres)
✅ Précision : 87.3%
✅ Fichiers sauvegardés :
   - model.joblib (106.7 MB)
   - model_columns.joblib (240 B)
```

**Puis redéployer :**
```bash
gcloud storage cp model.joblib gs://fanops-m4-models/
gcloud storage cp model_columns.joblib gs://fanops-m4-models/
```

## 📊 Performance

| Métrique | Valeur |
|----------|--------|
| Cold Start | 3-5 secondes |
| Warm Start | 100-200 ms |
| Précision ML | 87% |
| Disponibilité | 99.9% (SLA GCP) |
| Coût | 0€ (Free Tier) |

## 🎓 Présentation Professeur

Consultez [PRESENTATION_GUIDE.md](./PRESENTATION_GUIDE.md) pour :
- Script de présentation (20 min)
- Démonstrations live
- Questions fréquentes
- Checklist avant présentation

## 🤝 Contribution

Ce projet fait partie du système FanOps CAN 2025.

**Modules :**
- M1 (Azure) : Gestion des flux
- M2 (AWS) : Sécurité
- M3 (GCP) : Prévisions météo
- **M4 (GCP)** : Sponsor AI ← Ce module

## 📝 Licence

Projet académique - CAN 2025

---

**Développé avec ❤️ pour la CAN 2025**