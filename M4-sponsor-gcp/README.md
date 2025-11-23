# 🤖 M4 - Sponsor AI Microservice (GCP)

Ce microservice utilise le Machine Learning pour recommander des sponsors en temps réel selon le contexte du match (score, météo, zone, etc.).

## 📂 Structure

- `main.py` : Le code de la Cloud Function (API).
- `train_model.py` : Script pour générer les données et entraîner l'IA.
- `sponsors_config.py` : Configuration des sponsors et règles métier.
- `verify_local.py` : Script de test rapide (sans serveur).
- `requirements.txt` : Dépendances Python.

## 🚀 Installation

```bash
cd M4-sponsor-gcp
python -m pip install -r requirements.txt
```

## 🧪 Comment tester ?

Il y a 3 façons de tester ce microservice :

### 1. Test Rapide (Script Python)
C'est la méthode la plus simple pour vérifier que la logique fonctionne.

```bash
python verify_local.py
```
*Cela va simuler des requêtes (Canicule, But, VIP...) et afficher les résultats dans le terminal.*

### 2. Lancer le Serveur Local (Simulation Cloud Function)
Pour tester comme une vraie API HTTP (avec Postman ou curl).

```bash
# Lancer le serveur sur le port 8080
functions-framework --target=sponsor_recommendation --debug --port=8080
```

Ensuite, dans un autre terminal (ou Postman), envoyez une requête POST :

```bash
curl -X POST http://localhost:8080/ \
   -H "Content-Type: application/json" \
   -d '{"temperature": 35, "match_minute": 20, "zone": "North"}'
```

### 3. Ré-entraîner le modèle
Si vous modifiez `sponsors_config.py` ou voulez générer de nouvelles données :
# 🤖 M4 - Sponsor AI Microservice (GCP)

Ce microservice utilise le Machine Learning pour recommander des sponsors en temps réel selon le contexte du match (score, météo, zone, etc.).

## 📂 Structure

- `main.py` : Le code de la Cloud Function (API).
- `train_model.py` : Script pour générer les données et entraîner l'IA.
- `sponsors_config.py` : Configuration des sponsors et règles métier.
- `verify_local.py` : Script de test rapide (sans serveur).
- `requirements.txt` : Dépendances Python.

## 🚀 Installation

```bash
cd M4-sponsor-gcp
python -m pip install -r requirements.txt
```

## 🧪 Comment tester ?

Il y a 3 façons de tester ce microservice :

### 1. Test Rapide (Script Python)
C'est la méthode la plus simple pour vérifier que la logique fonctionne.

```bash
python verify_local.py
```
*Cela va simuler des requêtes (Canicule, But, VIP...) et afficher les résultats dans le terminal.*

### 2. Lancer le Serveur Local (Simulation Cloud Function)
Pour tester comme une vraie API HTTP (avec Postman ou curl).

```bash
# Lancer le serveur sur le port 8080
functions-framework --target=sponsor_recommendation --debug --port=8080
```

Ensuite, dans un autre terminal (ou Postman), envoyez une requête POST :

```bash
curl -X POST http://localhost:8080/ \
   -H "Content-Type: application/json" \
   -d '{"temperature": 35, "match_minute": 20, "zone": "North"}'
```

### 3. Ré-entraîner le modèle
Si vous modifiez `sponsors_config.py` ou voulez générer de nouvelles données :

```bash
python train_model.py
```
*Cela va créer un nouveau fichier `model.joblib`.*

## 📖 Documentation API

Le fichier `openapi.yaml` contient la spécification complète de l'API.
Vous pouvez l'importer dans [Swagger Editor](https://editor.swagger.io/) ou Postman pour voir les détails des requêtes/réponses.

## ☁️ Déploiement (Google Cloud)

Un script d'automatisation est fourni :

```bash
# Rendre le script exécutable (si besoin)
chmod +x deploy.sh

# Déployer
./deploy.sh
```

*Note : Assurez-vous d'avoir le Google Cloud CLI installé et configuré.*