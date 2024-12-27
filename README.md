# BI Map

Cartographie des bouches d'incendie du 06

1.Structure du Projet :
Une application web cartographique utilisant Mapbox GL JS
Organisation en plusieurs dossiers : css, js, images, data
Fichiers principaux : index.html, style.css, et plusieurs fichiers JavaScript dans le dossier js/

2.Technologies utilisées :
Mapbox GL JS v3.7.0 pour la cartographie
Mapbox Search JS pour la recherche d'adresses
Turf.js pour les calculs géographiques
Font Awesome pour les icônes
HTML5/CSS3 pour la structure et le style

3.Fonctionnalités principales :

a) Carte interactive :
Centrée sur Nice (coordonnées : 7.268376, 43.704481)
Style de carte "streets-v12"
Zoom initial de niveau 14

b) Barre de recherche :
Recherche d'adresses et points d'intérêt
Limitée à la France
Zone de recherche restreinte (bbox) autour de Nice
Affichage de cercles de 50m et 100m autour du point recherché

c) Menu flottant (FAB - Floating Action Button) avec 4 options :
F.I.R.E : Ouvre une nouvelle fenêtre (fire.html)
Mesure : Outil de mesure de distance
Centrer : Recentre la carte sur un point spécifique
Contact : Redirige vers contact.html

d) Fonctionnalités de mesure :
Possibilité de mesurer des distances sur la carte
Système de points et de lignes pour les mesures