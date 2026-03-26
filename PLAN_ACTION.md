# Plan d'action - BI Map

## P0 - Bugs critiques

- [x] **Corriger `font-style: 25px` -> `font-size: 25px`** dans `style.css:59` - Les icones du FAB n'ont aucun dimensionnement
- [ ] **Remplir les URLs manquantes dans `fires.json`** - 434 fiches sur 435 ont une URL vide, la feature F.I.R.E est quasi inutile

## P1 - Performance et securite

- [x] **Remplacer les marqueurs DOM par un symbol layer Mapbox avec clustering** dans `js/main.js` - 2 657 `<div>` remplaces par un rendu GPU natif + regroupement automatique des points proches
- [x] **Ajouter un `.gitignore`** - Protection contre les commits accidentels
- [x] **Corriger `lang="en"` -> `lang="fr"`** dans `fire.html` et `contact.html`
- [x] **Supprimer le doublon `<meta name="viewport">`** dans `contact.html`
- [x] **Corriger le chemin du Service Worker** dans `index.html` - `register('/sw.js')` -> `register('./sw.js')` pour compatibilite hors racine

## P2 - Optimisation

- [x] **Reduire les variantes Google Fonts** - Chargement uniquement des poids 400, 600, 700 au lieu des 18 variantes (~500 KB economises)
- [x] **Remplacer Turf.js par un calcul Haversine** - Le bundle complet (~500 KB) remplace par une fonction de 8 lignes
- [x] **Supprimer `js/casernes.js`** - Fichier orphelin supprime
- [x] **Supprimer le chargement de `assembly.min.css`** dans `index.html` - Jamais utilise

## P3 - Qualite et accessibilite

- [x] **Echapper les donnees dans `js/fire.js` et `js/main.js`** - Protection XSS via `escapeHTML()` et `encodeURI()`
- [x] **Ajouter des `aria-label`** sur les boutons du FAB dans `index.html`
- [x] **Remplacer les `onclick` inline** par des `addEventListener` dans `index.html`
- [x] **Remplacer `alert()`** par une notification toast non-bloquante dans `js/main.js`
- [x] **Corriger l'icone du bouton Centrer** - `fa-plus` -> `fa-crosshairs` dans `index.html`
- [x] **Supprimer `preserveDrawingBuffer: true`** dans `js/main.js`
