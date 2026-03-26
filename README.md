# BI-Map 🗺️

> Cartographie interactive des bouches d'incendie des Alpes-Maritimes (06)

## 📋 Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Structure du projet](#structure-du-projet)
- [Configuration](#configuration)
- [Contribution](#contribution)
- [Licence](#licence)

## 🎯 Aperçu

BI-Map est une application web cartographique permettant de visualiser et gérer les bouches d'incendie du département des Alpes-Maritimes. Elle offre des outils de recherche, de mesure et d'analyse pour les Sapeurs-Pompiers.

## ✨ Fonctionnalités

### Carte Interactive
- Visualisation centrée sur Nice (7.268376, 43.704481)
- Navigation fluide avec zoom adaptatif (niveau 10-19)
- Affichage des bouches d'incendie sur la carte
- Zone limitée aux Alpes-Maritimes

### Recherche Avancée
- Recherche d'adresses et points d'intérêt
- Affichage des périmètres (50m et 100m)
- Filtrage géographique intelligent
- Suggestions automatiques

### Outils Professionnels
- Interface F.I.R.E pour analyse détaillée
- Outil de mesure de distance
- Fonction de recentrage rapide
- Formulaire de contact intégré

### Performance et Accessibilité
- Service Worker pour le mode hors connexion
- Mise en cache intelligente des ressources
- Chargement optimisé des ressources critiques
- Compatibilité mobile et tablette

## 🛠️ Technologies

- **Frontend**:
  - HTML5 / CSS3
  - JavaScript (ES6+)
  - [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) v3.7.0
  - [Turf.js](https://turfjs.org/) pour les calculs géographiques
  - [Font Awesome](https://fontawesome.com/) pour l'interface
  - Service Worker pour le support hors ligne

## 🚀 Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/emifrog/BI-Map.git
```

2. Naviguez vers le dossier du projet :
```bash
cd BI-Map
```

3. Ouvrez `index.html` dans votre navigateur ou utilisez un serveur local

## 💡 Utilisation

1. **Recherche** : Utilisez la barre en haut à droite
2. **Mesure** : Cliquez sur l'icône règle dans le menu flottant
3. **F.I.R.E** : Accédez à l'interface d'analyse via le menu
4. **Contact** : Formulaire disponible via le menu flottant

## 📁 Structure du projet

```
BI-Map/
├── css/                # Styles
├── js/                 # Scripts JavaScript
│   ├── hydrants/      # Données des bouches
│   └── main.js        # Script principal
├── images/            # Ressources images
├── data/              # Données JSON
├── index.html         # Page principale
├── fire.html          # Interface F.I.R.E
└── contact.html       # Formulaire de contact
```

## ⚙️ Configuration

### Limites géographiques
```javascript
maxBounds: [
  [6.374816894531251, 43.51270490464819], // Sud-Ouest
  [7.487182617187501, 44.11716972942086]  // Nord-Est
]
```

### Niveaux de zoom
- Minimum : 10
- Maximum : 19
- Défaut : 14

## 📄 Licence

Ce projet est sous licence [MIT](https://opensource.org/licenses/MIT).