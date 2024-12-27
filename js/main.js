/**
 * Configuration et initialisation de l'application cartographique BI-Map
 * Cette application permet de visualiser et gérer les bouches d'incendie dans la région de Nice
 * Elle utilise Mapbox GL JS pour le rendu cartographique et diverses fonctionnalités
 * de mesure et de recherche.
 */

// Enregistrement du Service Worker pour le cache
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/js/sw.js')
            .then(registration => {
                console.log('ServiceWorker enregistré avec succès:', registration.scope);
            })
            .catch(error => {
                console.log('Échec de l\'enregistrement du ServiceWorker:', error);
            });
    });
}

// Configuration du cache local pour MapBox
mapboxgl.prewarm();

/**
 * Configuration globale de la carte et des paramètres de l'application
 * @constant {Object} MAP_CONFIG - Configuration principale de la carte Mapbox
 * @property {string} accessToken - Token d'authentification Mapbox
 * @property {Array<number>} defaultCenter - Coordonnées par défaut [longitude, latitude]
 * @property {number} defaultZoom - Niveau de zoom initial
 * @property {Array<Array<number>>} maxBounds - Limites géographiques de la carte [[ouest, sud], [est, nord]]
 * @property {number} minZoom - Niveau de zoom minimum autorisé
 * @property {number} maxZoom - Niveau de zoom maximum autorisé
 */
const MAP_CONFIG = {
    accessToken: 'pk.eyJ1IjoiZW1pZnJvZyIsImEiOiJjbDU4NGx6ZncxemZpM2VwcHpvbXQ0ZTduIn0.8Rqf1sB2mTRtqQbrgPUy2Q',
    defaultCenter: [7.268376, 43.704481],
    defaultZoom: 14,
    maxBounds: [[6.374816894531251, 43.51270490464819], [7.487182617187501, 44.11716972942086]],
    minZoom: 10,
    maxZoom: 19
};

/**
 * Configuration de la barre de recherche
 * @constant {Object} SEARCH_CONFIG - Paramètres pour le composant de recherche Mapbox
 * @property {string} types - Types d'éléments recherchables (adresses et points d'intérêt)
 * @property {string} language - Langue des résultats de recherche
 * @property {string} country - Pays limité pour la recherche
 * @property {Array<number>} bbox - Zone géographique de recherche [ouest, sud, est, nord]
 * @property {number} zoom - Niveau de zoom appliqué après une recherche
 */
const SEARCH_CONFIG = {
    types: 'address,poi',
    language: 'fr',
    country: 'FR',
    bbox: [6.374816894531251, 43.51270490464819, 7.487182617187501, 44.11716972942086],
    zoom: 19
};

/**
 * Cache des éléments DOM fréquemment utilisés
 * Optimise les performances en évitant les requêtes DOM répétées
 * @constant {Object} elements
 */
const elements = {
    map: document.getElementById('map'),
    searchContainer: document.getElementById('search-box-container'),
    mapCanvas: null // Initialisé après la création de la carte
};

/**
 * État global de l'application
 * Gère l'état des différentes fonctionnalités et composants
 * @constant {Object} state
 * @property {boolean} isMeasuring - Indique si l'outil de mesure est actif
 * @property {Array} measurePoints - Points utilisés pour les mesures
 * @property {Array|null} lastSearchCoordinates - Dernières coordonnées recherchées
 * @property {Object|null} searchBox - Instance de la barre de recherche
 * @property {Set} currentLayers - Ensemble des couches cartographiques actives
 */
const state = {
    isMeasuring: false,
    measurePoints: [],
    lastSearchCoordinates: null,
    searchBox: null,
    currentLayers: new Set()
};

// Configuration de Mapbox
mapboxgl.accessToken = MAP_CONFIG.accessToken;

/**
 * Initialise la carte avec mise en cache des tuiles
 * @function initMap
 */
const initMap = () => {
    const map = new mapboxgl.Map({
        container: elements.map,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: MAP_CONFIG.defaultCenter,
        zoom: MAP_CONFIG.defaultZoom,
        maxBounds: MAP_CONFIG.maxBounds,
        minZoom: MAP_CONFIG.minZoom,
        maxZoom: MAP_CONFIG.maxZoom,
        attributionControl: false,
        preserveDrawingBuffer: true,
        localIdeographFontFamily: "'Noto Sans', 'Noto Sans CJK SC', sans-serif",
        maxParallelImageRequests: 6,
        transformRequest: (url, resourceType) => {
            if (resourceType === 'Tile') {
                return {
                    url: url,
                    headers: {
                        'Cache-Control': 'max-age=86400' // Cache pendant 24h
                    }
                };
            }
        }
    });

    // Préchargement des tuiles visibles
    map.on('load', () => {
        const bounds = map.getBounds();
        const zoom = map.getZoom();
        map.setMaxBounds(bounds.extend(MAP_CONFIG.maxBounds));
        
        // Préchargement des tuiles pour les niveaux de zoom adjacents
        for (let z = Math.floor(zoom - 1); z <= Math.ceil(zoom + 1); z++) {
            if (z >= MAP_CONFIG.minZoom && z <= MAP_CONFIG.maxZoom) {
                map.getSource('mapbox').loadTile({
                    zoom: z,
                    tileID: { x: 0, y: 0, z: z }
                });
            }
        }
    });

    return map;
};

// Initialisation de la carte avec cache
const map = initMap();

// Cache de l'élément canvas après l'initialisation de la carte
elements.mapCanvas = map.getCanvas();

/**
 * Initialise la barre de recherche avec Mapbox Search Box
 * Configure les options de recherche et lie les événements
 * @function initSearch
 */
const initSearch = () => {
    state.searchBox = new MapboxSearchBox();
    state.searchBox.accessToken = MAP_CONFIG.accessToken;
    state.searchBox.options = SEARCH_CONFIG;
    state.searchBox.marker = {
        color: '#FF0000',
        scale: 1,
        draggable: false
    };
    
    state.searchBox.mapboxgl = mapboxgl;
    map.addControl(state.searchBox);
    state.searchBox.bindMap(map);
    elements.searchContainer.appendChild(state.searchBox);

    state.searchBox.addEventListener('retrieve', handleSearchResult);
};

/**
 * Gère les résultats de recherche
 * Affiche les cercles de distance autour du point recherché
 * @function handleSearchResult
 * @param {Event} event - Événement contenant les résultats de recherche
 */
const handleSearchResult = (event) => {
    const coordinates = event.detail.features[0].geometry.coordinates;
    state.lastSearchCoordinates = coordinates;
    
    updateSearchRadiusLayers(coordinates);
};

/**
 * Met à jour les cercles de distance autour du point recherché
 * Supprime les anciens cercles et crée de nouveaux
 * @function updateSearchRadiusLayers
 * @param {Array<number>} coordinates - Coordonnées du point recherché
 */
const updateSearchRadiusLayers = (coordinates) => {
    // Supprimer les anciens cercles en une seule fois
    removeSearchRadiusLayers();
    
    // Créer les nouveaux cercles
    const radiusConfigs = [
        { id: 'search-radius-50', radius: 25, color: '#ff0000' },
        { id: 'search-radius-100', radius: 50, color: '#00ff00' }
    ];

    radiusConfigs.forEach(config => {
        addSearchRadiusLayer(coordinates, config);
    });
};

/**
 * Ajoute un cercle de distance autour du point recherché
 * Configure les options du cercle et l'ajoute à la carte
 * @function addSearchRadiusLayer
 * @param {Array<number>} coordinates - Coordonnées du point recherché
 * @param {Object} config - Configuration du cercle
 */
const addSearchRadiusLayer = (coordinates, config) => {
    const source = {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': coordinates
            }
        }
    };

    map.addSource(config.id, source);
    state.currentLayers.add(config.id);

    map.addLayer({
        'id': config.id,
        'type': 'circle',
        'source': config.id,
        'paint': {
            'circle-radius': {
                'stops': [
                    [14, config.radius / 4],
                    [15, config.radius / 2],
                    [16, config.radius],
                    [17, config.radius * 2],
                    [18, config.radius * 4],
                    [19, config.radius * 8]
                ],
                'base': 2
            },
            'circle-color': config.color,
            'circle-opacity': 0.3,
            'circle-stroke-width': 1,
            'circle-stroke-color': config.color
        }
    });
};

/**
 * Supprime les cercles de distance autour du point recherché
 * Supprime les sources et les couches associées
 * @function removeSearchRadiusLayers
 */
const removeSearchRadiusLayers = () => {
    state.currentLayers.forEach(id => {
        if (map.getSource(id)) {
            map.removeLayer(id);
            map.removeSource(id);
        }
    });
    state.currentLayers.clear();
};

/**
 * Gestionnaire d'événement pour le clic sur le bouton "Feu"
 * Ouvre une nouvelle fenêtre avec les informations sur les feux
 * @function handleFireClick
 */
const handleFireClick = () => {
    window.open('fire.html', '_blank', "height=600,width=500");
};

/**
 * Gestionnaire d'événement pour le clic sur le bouton "Mesure"
 * Active ou désactive l'outil de mesure
 * @function handleMesureClick
 */
const handleMesureClick = () => {
    state.isMeasuring = !state.isMeasuring;
    
    if (state.isMeasuring) {
        elements.mapCanvas.style.cursor = 'crosshair';
        map.on('click', addMeasurePoint);
    } else {
        cleanupMeasure();
    }
};

/**
 * Ajoute un point de mesure à la carte
 * Crée un nouveau point de mesure et l'ajoute à la liste des points
 * @function addMeasurePoint
 * @param {Object} e - Événement de clic sur la carte
 */
const addMeasurePoint = (e) => {
    state.measurePoints.push(e.lngLat);
    
    if (state.measurePoints.length === 2) {
        const distance = calculateDistance();
        drawMeasureLine();
        showDistancePopup(e.lngLat, distance);
        cleanupMeasure();
    }
};

/**
 * Calcule la distance entre deux points de mesure
 * Utilise la bibliothèque Turf.js pour calculer la distance
 * @function calculateDistance
 * @return {number} Distance entre les deux points de mesure
 */
const calculateDistance = () => {
    return turf.distance(
        turf.point([state.measurePoints[0].lng, state.measurePoints[0].lat]),
        turf.point([state.measurePoints[1].lng, state.measurePoints[1].lat]),
        {units: 'meters'}
    );
};

/**
 * Dessine la ligne de mesure entre les deux points de mesure
 * Crée une nouvelle couche de ligne et l'ajoute à la carte
 * @function drawMeasureLine
 */
const drawMeasureLine = () => {
    const lineId = 'measure-line';
    if (map.getSource(lineId)) {
        map.removeLayer(lineId);
        map.removeSource(lineId);
    }
    
    map.addSource(lineId, {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'geometry': {
                'type': 'LineString',
                'coordinates': state.measurePoints.map(point => [point.lng, point.lat])
            }
        }
    });

    map.addLayer({
        'id': lineId,
        'type': 'line',
        'source': lineId,
        'paint': {
            'line-color': '#ff0000',
            'line-width': 2
        }
    });
};

/**
 * Affiche une popup avec la distance entre les deux points de mesure
 * Crée une nouvelle popup et l'ajoute à la carte
 * @function showDistancePopup
 * @param {Object} lngLat - Coordonnées du point de mesure
 * @param {number} distance - Distance entre les deux points de mesure
 */
const showDistancePopup = (lngLat, distance) => {
    new mapboxgl.Popup()
        .setLngLat(lngLat)
        .setHTML(`Distance: ${Math.round(distance)} mètres`)
        .addTo(map);
};

/**
 * Nettoie les points de mesure et désactive l'outil de mesure
 * @function cleanupMeasure
 */
const cleanupMeasure = () => {
    elements.mapCanvas.style.cursor = '';
    map.off('click', addMeasurePoint);
    state.measurePoints = [];
    state.isMeasuring = false;
};

/**
 * Gestionnaire d'événement pour le clic sur le bouton "Centrer"
 * Centre la carte sur les dernières coordonnées recherchées
 * @function handleCentrerClick
 */
const handleCentrerClick = () => {
    if (state.lastSearchCoordinates) {
        map.flyTo({
            center: state.lastSearchCoordinates,
            zoom: SEARCH_CONFIG.zoom,
            essential: true
        });
    } else {
        alert('Aucune recherche effectuée');
    }
};

// Initialisation
document.getElementById('search-js').addEventListener('load', initSearch);
