# 🏗️ Architecture M4 - Sponsor AI

## Vue d'Ensemble

Le microservice M4 utilise une architecture **serverless multi-couche** sur Google Cloud Platform pour fournir des recommandations de sponsors en temps réel basées sur l'intelligence artificielle.


### 1. **Cloud Functions (Gen 2)** 🔧
**Rôle** : Héberge le code Python qui traite les requêtes.

**Pourquoi ?**
- **Serverless** : Pas de serveur à gérer, Google s'occupe de tout.
- **Auto-scaling** : S'adapte automatiquement au nombre de requêtes.
- **Pay-per-use** : Vous ne payez que quand la fonction est appelée.

**Configuration** :
- **Runtime** : Python 3.10
- **Mémoire** : 512 MB (suffisant pour charger le modèle ML)
- **Région** : europe-west1 (Belgique, proche du Maroc)
- **Trigger** : HTTP (accessible via URL publique)

**URL de Production** :
```
https://europe-west1-can2025-fanops.cloudfunctions.net/m4-sponsor-ai
```

### 2. **Cloud Storage (GCS)** 💾
**Rôle** : Stocke le modèle ML entraîné.

**Pourquoi ?**
- **Séparation** : Le modèle (106 MB) est trop gros pour être dans le code.
- **Flexibilité** : On peut mettre à jour le modèle sans redéployer le code.
- **Performance** : Téléchargement rapide au premier démarrage (cold start).

**Configuration** :
- **Bucket** : `fanops-m4-models`
- **Région** : europe-west1
- **Fichiers** :
  - `model.joblib` : Le modèle Random Forest entraîné
  - `model_columns.joblib` : L'ordre des colonnes pour la prédiction

### 3. **Cloud Build** 🏗️
**Rôle** : Compile et déploie automatiquement votre code.

**Pourquoi ?**
- Vérifie que toutes les dépendances (`requirements.txt`) sont installées.
- Crée une image Docker de votre fonction.
- Déploie sur Cloud Run (infrastructure sous-jacente de Gen 2).

### 4. **Artifact Registry** 📦
**Rôle** : Stocke les images Docker de votre fonction.

**Pourquoi ?**
- Cloud Functions Gen 2 utilise des conteneurs Docker en interne.
- Permet le versioning des déploiements.

### 5. **Cloud Run** 🏃
**Rôle** : Infrastructure sous-jacente qui exécute réellement votre fonction.

**Pourquoi ?**
- Cloud Functions Gen 2 est construit sur Cloud Run.
- Gère le scaling, le load balancing, et les requêtes HTTPS.

## Flux de Données

### Requête Entrante
```json
POST https://europe-west1-can2025-fanops.cloudfunctions.net/m4-sponsor-ai
Content-Type: application/json

{
  "match_minute": 89,
  "score_diff": 1,
  "event": "Goal",
  "temperature": 24,
  "zone": "South",
  "crowd_density": 0.95
}
```

### Traitement Interne
1. **Réception** : Cloud Run reçoit la requête HTTPS
2. **Validation** : Vérification du JSON
3. **Chargement Modèle** : 
   - Si premier appel (cold start) : télécharge depuis GCS
   - Sinon : utilise le modèle en mémoire
4. **Prétraitement** :
   - One-Hot Encoding des variables catégorielles (`zone`, `event`)
   - Alignement des colonnes avec le modèle d'entraînement
5. **Prédiction** : Random Forest prédit le sponsor optimal
6. **Enrichissement** : Récupère le message marketing depuis `sponsors_config.py`

### Réponse Sortante
```json
{
  "recommended_sponsor": "Puma",
  "confidence": 0.92,
  "campaign_message": "Victoire en Puma ! 🦁",
  "category": "Sports Equipment",
  "context_used": {
    "match_minute": 89,
    "score_diff": 1,
    "event": "Goal",
    "temperature": 24,
    "zone": "South",
    "crowd_density": 0.95
  }
}
```

## Modèle Machine Learning

### Algorithme
**Random Forest Classifier** (scikit-learn)

**Pourquoi ce choix ?**
- ✅ Robuste aux données bruitées
- ✅ Gère bien les variables catégorielles
- ✅ Pas de sur-apprentissage (overfitting)
- ✅ Rapide en prédiction (~10ms)

### Features (Entrées)
| Feature | Type | Exemple | Description |
|---------|------|---------|-------------|
| `match_minute` | Numérique | 45 | Minute du match (0-120) |
| `score_diff` | Numérique | 1 | Différence de score (Home - Away) |
| `temperature` | Numérique | 28.5 | Température en °C |
| `crowd_density` | Numérique | 0.85 | Densité de la foule (0-1) |
| `zone` | Catégoriel | "VIP" | Zone du stade |
| `event` | Catégoriel | "Goal" | Événement significatif |

### Target (Sortie)
**Sponsor recommandé** parmi 12 sponsors :
- Sidi Ali, Coca-Cola, Orange, Inwi, Puma, Adidas, Royal Air Maroc, OCP, Koutoubia, CDG, Hyundai, Visa

### Entraînement
- **Données** : 10,000 scénarios synthétiques générés
- **Précision** : >85% sur données de test
- **Fichier** : `model.joblib` (106.7 MB)

## Sécurité & Performance

### Sécurité
- ✅ **HTTPS** : Toutes les communications chiffrées
- ✅ **CORS** : Autorise les requêtes cross-origin pour le frontend
- ✅ **Authentification** : `--allow-unauthenticated` (public pour démo)
- ⚠️ **Production** : Ajouter une clé API ou OAuth pour limiter l'accès

### Performance
- **Cold Start** : ~3-5 secondes (première requête, télécharge le modèle)
- **Warm Start** : ~100-200ms (modèle en mémoire)
- **Scaling** : Jusqu'à 1000 instances simultanées (par défaut)

### Coûts (Gratuit pour ce projet)
- **Cloud Functions** : 2M appels/mois gratuits ✅
- **Cloud Storage** : 5 GB gratuits (on utilise 0.1 GB) ✅
- **Cloud Build** : 120 minutes/jour gratuites ✅

## Déploiement

### Commande Complète
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

### Variables d'Environnement
- `GCP_MODEL_BUCKET` : Nom du bucket Cloud Storage contenant le modèle

## Monitoring & Logs

### Voir les Logs
```bash
gcloud functions logs read m4-sponsor-ai --region=europe-west1 --limit=50
```

### Console GCP
- **Cloud Functions** : https://console.cloud.google.com/functions
- **Cloud Storage** : https://console.cloud.google.com/storage
- **Logs** : https://console.cloud.google.com/logs

## Évolutions Futures

### Court Terme
- [ ] Ajouter une clé API pour sécuriser l'accès
- [ ] Implémenter un cache Redis pour les prédictions fréquentes
- [ ] Ajouter des métriques Prometheus

### Long Terme
- [ ] Ré-entraîner le modèle avec des données réelles
- [ ] Passer à un modèle plus sophistiqué (XGBoost, Neural Network)
- [ ] Implémenter A/B testing pour comparer les recommandations
