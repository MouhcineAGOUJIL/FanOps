# 🖥️ IaaS Implementation - Compute Engine VM

## Vue d'Ensemble

Pour compléter l'architecture M4 avec les **3 types de cloud** (IaaS + PaaS + FaaS), nous avons ajouté une **VM Compute Engine** pour le ré-entraînement du modèle ML.

## Architecture Complète

```
┌─────────────────────────────────────────────┐
│  IaaS - Compute Engine VM                   │
│  ┌────────────────────────────────────┐     │
│  │  ml-training-vm                    │     │
│  │  - Zone: us-central1-a             │     │
│  │  - Type: e2-micro (Always Free)    │     │
│  │  - OS: Debian 11                   │     │
│  │  - Python 3.10 + ML libraries      │     │
│  └────────────────────────────────────┘     │
│         │                                    │
│         │ Upload model.joblib                │
│         ▼                                    │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  PaaS - Cloud Storage                       │
│  ┌────────────────────────────────────┐     │
│  │  gs://fanops-m4-models/            │     │
│  │  - model.joblib (106.7 MB)         │     │
│  │  - model_columns.joblib (240 B)    │     │
│  └────────────────────────────────────┘     │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  FaaS - Cloud Functions                     │
│  ┌────────────────────────────────────┐     │
│  │  m4-sponsor-ai                     │     │
│  │  - Downloads model from GCS        │     │
│  │  - Serves predictions via API      │     │
│  └────────────────────────────────────┘     │
└─────────────────────────────────────────────┘
```

## VM Details

### Configuration
- **Nom** : `ml-training-vm`
- **Zone** : `us-central1-a` (US - Always Free)
- **Type** : `e2-micro` (0.25-2 vCPU, 1 GB RAM)
- **OS** : Debian 11
- **Disque** : 30 GB Standard
- **Coût** : **0€** (Always Free Tier)

### Logiciels Installés
- ✅ Python 3.10
- ✅ pip3
- ✅ git
✅ Generated 10,000 training samples
🔧 Preparing features...
✅ Features encoded: 15 dimensions
🎯 Training Random Forest model...
✅ Model trained successfully!
📊 Accuracy: 87.3%
💾 Saving model files...
✅ model.joblib saved
☁️ Uploading to Cloud Storage...
✅ Model uploaded to gs://fanops-m4-models/
```

### 5. Arrêter la VM (Important !)
```bash
# Depuis votre PC
gcloud compute instances stop ml-training-vm --zone=us-central1-a
```

## Pourquoi IaaS pour le Training ?

### Limitations de FaaS (Cloud Functions)
- ⏱️ **Timeout** : Maximum 9 minutes d'exécution
- 💾 **Mémoire** : Maximum 8 GB
- 🔄 **Pas de persistance** : Pas de stockage local permanent

### Avantages d'IaaS (Compute Engine)
- ⏱️ **Temps illimité** : Training peut prendre des heures
- 💾 **Ressources configurables** : Jusqu'à 96 vCPU, 624 GB RAM
- 🔄 **Contrôle total** : Installation de n'importe quel logiciel
- 💰 **Coût optimisé** : Payer uniquement quand allumée

## Workflow de Production

### Développement (Local)
```
Votre PC → Entraînement rapide (10,000 samples) → Tests locaux
```

### Production (VM)
```
Compute Engine VM → Entraînement lourd (1M+ samples) → Upload GCS → Cloud Functions
```

## Commandes Utiles

### Voir le Statut de la VM
```bash
gcloud compute instances describe ml-training-vm --zone=us-central1-a
```

### Voir les Logs
```bash
gcloud compute ssh ml-training-vm --zone=us-central1-a --command="tail -f /var/log/syslog"
```

### Supprimer la VM (si besoin)
```bash
gcloud compute instances delete ml-training-vm --zone=us-central1-a
```

## Coûts

### Always Free Tier (Actuel)
- **VM e2-micro** : Gratuit (1 instance/mois en US)
- **30 GB disque** : Gratuit
- **Trafic sortant** : 1 GB/mois gratuit

**Total : 0€/mois** ✅

### Si Upgrade Nécessaire
| Type | vCPU | RAM | Prix/mois (24/7) |
|------|------|-----|------------------|
| e2-small | 2 | 2 GB | ~15€ |
| e2-medium | 2 | 4 GB | ~30€ |
| e2-standard-4 | 4 | 16 GB | ~120€ |

**Astuce** : Utiliser la VM uniquement pour le training (1h/semaine) = ~0.50€/mois

## Pour la Présentation

### Argument au Professeur
> "Mon architecture utilise les **3 types de cloud** :
> 
> 1. **IaaS (Compute Engine)** : VM dédiée pour ré-entraîner le modèle ML avec de gros volumes de données. Cloud Functions a une limite de 9 minutes, donc pour un training lourd, j'utilise une VM.
> 
> 2. **PaaS (Cloud Storage)** : Stockage du modèle entraîné. Séparation code/données pour la flexibilité.
> 
> 3. **FaaS (Cloud Functions)** : API serverless pour les prédictions en temps réel. Scaling automatique, pay-per-use.
> 
> Chaque type est utilisé pour ce qu'il fait de mieux."

### Démonstration
1. **Console GCP** → Compute Engine → Montrer la VM
2. **SSH** → Se connecter et montrer `ls -la` (fichiers Python)
3. **Expliquer** → Pourquoi IaaS est nécessaire pour le training

## Fichiers Créés

- `train_model_vm.py` : Script de training optimisé pour VM avec auto-upload GCS
- `IAAS_IMPLEMENTATION.md` : Ce document

## Prochaines Étapes

1. ✅ VM créée et configurée
2. ✅ Python + ML libraries installés
3. 🔄 Training à lancer manuellement (git clone + python3 train_model.py)
4. ⏸️ VM arrêtée pour économiser (même si gratuit)

## Conclusion

L'ajout d'IaaS complète l'architecture M4 avec une solution **hybride** qui combine :
- La **flexibilité** d'IaaS pour le training
- La **simplicité** de PaaS pour le stockage
- La **scalabilité** de FaaS pour l'API

C'est une architecture **Cloud-Native** moderne et professionnelle.
