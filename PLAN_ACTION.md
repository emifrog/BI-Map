# Plan d'action - BI Map

## P0 - Bugs critiques

- [x] **Corriger `font-style: 25px` -> `font-size: 25px`** dans `style.css:59`
- [x] **Remplir les URLs manquantes dans `fires.json`** - 435 URLs generees vers le bucket Supabase

## P1 - Performance et securite

- [x] **Remplacer les marqueurs DOM par un symbol layer Mapbox** dans `js/main.js`
- [x] **Ajouter un `.gitignore`**
- [x] **Corriger `lang="en"` -> `lang="fr"`** dans `fire.html` et `contact.html`
- [x] **Supprimer le doublon `<meta name="viewport">`** dans `contact.html`
- [x] **Corriger le chemin du Service Worker** - `register('./sw.js')`

## P2 - Optimisation

- [x] **Reduire les variantes Google Fonts** - Poids 400, 600, 700 uniquement
- [x] **Remplacer Turf.js par un calcul Haversine**
- [x] **Supprimer `js/casernes.js`** et **`assembly.min.css`**

## P3 - Qualite et accessibilite

- [x] **Protection XSS** via `escapeHTML()` dans `fire.js` et `main.js`
- [x] **Ajouter des `aria-label`** sur les boutons du FAB
- [x] **Remplacer les `onclick` inline** par des `addEventListener`
- [x] **Remplacer `alert()`** par un toast non-bloquant
- [x] **Corriger l'icone Centrer** - `fa-crosshairs`
- [x] **Supprimer `preserveDrawingBuffer: true`**

## P4 - Migration des hydrants vers Supabase

- [x] **Creer la table `BI`** dans Supabase (title, num, lng, lat)
- [x] **Generer et importer le CSV** - 2 657 hydrants
- [x] **Modifier `loadHydrants()`** - API REST Supabase avec pagination
- [x] **Supprimer les fichiers statiques** `nice.json` et `bv.json`
- [x] **Mettre a jour le Service Worker**

## P5 - Authentification

- [ ] **Creer une page de login** avec Supabase Auth
- [ ] **Proteger l'acces a la carte** - Rediriger vers login si non connecte
- [ ] **Ajouter un bouton deconnexion**

## P6 - Nouvelles fonctionnalites

- [ ] **Recherche de BI par numero** - Champ de recherche pour zoomer sur une BI specifique
- [ ] **BI la plus proche** - Bouton pour trouver les bouches les plus proches de la position GPS
- [ ] **Filtrage par type** - Afficher/masquer par type (BI, PA, CITERNE)
- [ ] **Couleurs par type** - Icones differentes selon le type de BI
- [ ] **Navigation GPS** - Bouton dans la popup pour ouvrir l'itineraire Google Maps / Waze
- [ ] **Compteur de BI dans le rayon** - Nombre de BI dans les cercles 50m/100m apres recherche
- [ ] **Casernes sur la carte** - Afficher les casernes avec `casque.png` depuis Supabase
- [ ] **Mode PWA** - `manifest.json` pour installation sur telephone + cache offline des donnees

# Bilan performance

## Optimisations implementees
- Symbol layer GPU pour les 2 657 BI (au lieu de div DOM)
- Tous les scripts en `defer` (mapbox-gl.js, search-js, main.js)
- Requetes Supabase en parallele (1 + 2 simultanees)
- Font Awesome remplace par SVG inline sur index.html (~300 KB economises)
- Google Fonts en `<link>` non-bloquant + `preconnect`
- `meta theme-color` pour mobile
- Preload des ressources critiques
- Service Worker avec strategies de cache differenciees
- Google Fonts reduit a 3 poids
- Pas de framework lourd - vanilla JS

## Limite incompressible
- `mapbox-gl.js` (370 KB, 6.3s CPU) : moteur WebGL necessaire pour la carte, aucune alternative plus legere a fonctionnalite equivalente