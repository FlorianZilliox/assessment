# Pod Assessment Tool - CSV Configuration Guide

## 📄 Configuration Overview

L'outil d'évaluation Pod utilise maintenant un fichier CSV externe (`questions.csv`) pour configurer toutes les questions et options. Cela permet de modifier facilement les questions sans toucher au code.

## 🔧 Fonctionnement

L'outil tente d'abord de charger le fichier `questions.csv`. Si le fichier n'est pas accessible (navigation locale), il utilise automatiquement les données intégrées dans le code comme fallback.

## 📋 Format du fichier CSV

### Structure des colonnes

| Colonne | Description | Requis | Exemples |
|---------|-------------|---------|----------|
| `dimension_id` | Identifiant unique de la dimension | ✅ | workflow, rituals, visibility |
| `dimension_name` | Nom affiché de la dimension | ✅ | WORKFLOW MASTERY |
| `dimension_description` | Description de la dimension | ✅ | How well does the pod control... |
| `question_id` | Numéro unique de la question | ✅ | 1, 2, 3... |
| `question_text` | Texte de la question | ✅ | The pod tracks workflow KPIs... |
| `question_type` | Type de question (A, B, ou C) | ✅ | A, B, C |
| `option_1_label` à `option_6_label` | Libellés des options | Type B/C | 0 demos, No DoD exists |
| `option_1_value` à `option_6_value` | Scores correspondants | Type B/C | 1, 2, 3, 4, 5, 6 |

### Types de questions

**Type A - Échelle de maturité (1-6)**
- Questions évaluées sur une échelle classique 1-6
- Pas d'options supplémentaires nécessaires
- Exemple : "La communication informe les parties prenantes"

**Type B - Fréquence/Comptage**
- Questions avec options spécifiques qui mappent vers des scores
- Nécessite des paires `option_X_label` et `option_X_value`
- Exemple : "Nombre de démos ce trimestre" → 0→1, 1→3, 2→5, 3+→6

**Type C - Binaire avec niveaux de maturité**
- Questions binaires avec plusieurs niveaux de qualité
- Nécessite des paires `option_X_label` et `option_X_value`
- Exemple : "DoD existe et est utilisée" → 6 niveaux de "Pas de DoD" à "DoD affinée régulièrement"

## ✏️ Comment modifier les questions

### 1. Modifier une question existante
```csv
workflow,WORKFLOW MASTERY,Description...,1,NOUVEAU TEXTE DE QUESTION,A,,,,,,...
```

### 2. Ajouter une nouvelle dimension
```csv
nouveauxid,NOUVELLE DIMENSION,Description de la nouvelle dimension,37,Première question,A,,,,,,...
nouveauxid,NOUVELLE DIMENSION,Description de la nouvelle dimension,38,Deuxième question,B,Option 1,1,Option 2,3,...
```

### 3. Modifier les options d'une question Type B/C
```csv
rituals,RITUALS & CADENCE,Description...,10,Question demos,B,0 démos,1,1-2 démos,2,3+ démos,5,Plus de 5 démos,6,,
```

### 4. Changer le type d'une question
Pour passer d'un Type A vers Type C :
```csv
# Avant (Type A)
workflow,WORKFLOW MASTERY,Description...,2,Question sur WIP limits,A,,,,,,...

# Après (Type C avec options)
workflow,WORKFLOW MASTERY,Description...,2,Question sur WIP limits,C,Pas de WIP,1,WIP non respectées,2,WIP parfois,3,WIP toujours,5,,
```

## 🔧 Règles de validation

### Champs obligatoires
- Toutes les questions doivent avoir : `dimension_id`, `dimension_name`, `question_id`, `question_text`, `question_type`
- Les questions Type B/C doivent avoir au moins une paire `option_label`/`option_value`

### Types de questions valides
- Seuls A, B, et C sont acceptés
- Type A : pas d'options nécessaires
- Types B/C : au moins 1 option, maximum 6 options

### Scores valides
- Les valeurs d'options doivent être des entiers de 1 à 6
- Les scores servent à la normalisation pour le graphique radar

## 📝 Exemples pratiques

### Question Type A (Échelle 1-6)
```csv
workflow,WORKFLOW MASTERY,Description...,1,Les bottlenecks sont identifiés et résolus,A,,,,,,...
```

### Question Type B (Fréquence)
```csv
rituals,RITUALS & CADENCE,Description...,10,Démos produit ce trimestre,B,0 démos,1,1 démo,3,2 démos,5,3+ démos,6,,
```

### Question Type C (Binaire + Qualité)
```csv
execution,EXECUTION QUALITY,Description...,24,Definition of Ready,C,Pas de DoR,1,DoR rarement utilisée,2,DoR parfois utilisée,3,DoR généralement suivie,4,DoR toujours suivie,5,DoR affinée régulièrement,6
```

## 🚨 Dépannage

### Erreurs communes

1. **"Invalid CSV data"** : Vérifiez que toutes les colonnes obligatoires sont remplies
2. **"Invalid question type"** : Seuls A, B, C sont acceptés
3. **"Type B/C questions require options"** : Ajoutez au moins une paire label/value
4. **Fichier non trouvé** : Assurez-vous que `questions.csv` est dans le même dossier que `index.html`

### Test de votre configuration

1. Ouvrez l'outil dans le navigateur
2. Si erreur, ouvrez la console (F12) pour voir les détails
3. Vérifiez le format CSV avec un éditeur de texte
4. Actualisez la page après modifications

## 📊 Structure recommandée

```
assessment/
├── index.html
├── questions.csv          ← Votre configuration
├── styles/
│   └── main.css
└── js/
    ├── csv-loader.js
    ├── assessment-data.js
    └── main.js
```

## 💡 Conseils

- **Sauvegardez** toujours votre fichier CSV avant modifications importantes
- **Testez** chaque modification en rechargeant l'application
- **Numérotez** les questions de manière séquentielle (1, 2, 3...)
- **Groupez** les questions par dimension pour plus de clarté
- **Utilisez** des guillemets si votre texte contient des virgules

---

Avec ce système, vous pouvez maintenant personnaliser entièrement votre évaluation sans toucher au code JavaScript !