/**
 * Configuration principale de la carte Mapbox
 * @typedef {Object} MapConfig
 * @property {string} accessToken - Token d'accès Mapbox
 * @property {[number, number]} defaultCenter - Coordonnées du centre par défaut [longitude, latitude]
 * @property {number} defaultZoom - Niveau de zoom par défaut
 * @property {[[number, number], [number, number]]} maxBounds - Limites de la carte [[SO], [NE]]
 * @property {number} minZoom - Niveau de zoom minimum
 * @property {number} maxZoom - Niveau de zoom maximum
 */
const MAP_CONFIG = {
    accessToken: 'pk.eyJ1IjoiZW1pZnJvZyIsImEiOiJjbDU4NGx6ZncxemZpM2VwcHpvbXQ0ZTduIn0.8Rqf1sB2mTRtqQbrgPUy2Q',
    defaultCenter: [7.268376, 43.704481],
    defaultZoom: 14,
    maxBounds: [[6.374816894531251, 43.51270490464819], [7.487182617187501, 44.11716972942086]],
    minZoom: 10,
    maxZoom: 19,
};

/**
 * Configuration de la recherche
 * @typedef {Object} SearchConfig
 * @property {string} types - Types d'éléments recherchables
 * @property {string} language - Code de langue pour les résultats
 * @property {string} country - Code pays pour limiter la recherche
 * @property {[number, number, number, number]} bbox - Boîte englobante pour la recherche [O, S, E, N]
 * @property {number} zoom - Niveau de zoom après la recherche
 */
const SEARCH_CONFIG = {
    types: 'address,poi',
    language: 'fr',
    country: 'FR',
    bbox: [6.374816894531251, 43.51270490464819, 7.487182617187501, 44.11716972942086],
    zoom: 19,
};

/**
 * Cache des éléments DOM fréquemment utilisés
 * @typedef {Object} DOMElements
 * @property {HTMLElement} map - Conteneur de la carte
 * @property {HTMLElement} searchContainer - Conteneur de la barre de recherche
 * @property {HTMLCanvasElement} mapCanvas - Canvas de la carte Mapbox
 */
const elements = {
    map: document.getElementById('map'),
    searchContainer: document.getElementById('search-box-container'),
    mapCanvas: null // Sera initialisé après la création de la carte
};

/**
 * État global de l'application
 * @typedef {Object} AppState
 * @property {boolean} isMeasuring - Indique si le mode mesure est actif
 * @property {Array<LngLat>} measurePoints - Points de mesure
 * @property {?[number, number]} lastSearchCoordinates - Dernières coordonnées recherchées
 * @property {?MapboxSearchBox} searchBox - Instance de la boîte de recherche
 * @property {Set<string>} currentLayers - Ensemble des couches actuellement affichées
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

const map = new mapboxgl.Map({
    container: elements.map,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: MAP_CONFIG.defaultCenter,
    zoom: MAP_CONFIG.defaultZoom,
    maxBounds: MAP_CONFIG.maxBounds,
    minZoom: MAP_CONFIG.minZoom,
    maxZoom: MAP_CONFIG.maxZoom,
    attributionControl: false,
    preserveDrawingBuffer: true
});

// Cache de l'élément canvas après l'initialisation de la carte
elements.mapCanvas = map.getCanvas();

/**
 * Initialise la fonctionnalité de recherche avec Mapbox Search Box
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
 * Gère le résultat d'une recherche
 * @function handleSearchResult
 * @param {CustomEvent} event - Événement contenant les résultats de recherche
 */
const handleSearchResult = (event) => {
    const coordinates = event.detail.features[0].geometry.coordinates;
    state.lastSearchCoordinates = coordinates;
    
    updateSearchRadiusLayers(coordinates);
};

/**
 * Met à jour les cercles de rayon de recherche sur la carte
 * @function updateSearchRadiusLayers
 * @param {[number, number]} coordinates - Coordonnées [longitude, latitude]
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
 * Ajoute une couche de rayon de recherche à la carte
 * @function addSearchRadiusLayer
 * @param {[number, number]} coordinates - Coordonnées [longitude, latitude]
 * @param {Object} config - Configuration du cercle
 * @param {string} config.id - Identifiant unique de la couche
 * @param {number} config.radius - Rayon du cercle en mètres
 * @param {string} config.color - Couleur du cercle en format hexadécimal
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
 * Supprime toutes les couches de rayon de recherche de la carte
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
 * Gère le clic sur le bouton Fire
 * @function handleFireClick
 * Ouvre une nouvelle fenêtre avec l'interface Fire
 */
const handleFireClick = () => {
    window.open('fire.html', '_blank', "height=600,width=500");
};

/**
 * Gère le clic sur le bouton de mesure
 * @function handleMesureClick
 * Active/désactive le mode mesure et configure les événements associés
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
 * Ajoute un point de mesure sur la carte
 * @function addMeasurePoint
 * @param {MapMouseEvent} e - Événement de clic sur la carte
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
 * @function calculateDistance
 * @returns {number} Distance en mètres
 */
const calculateDistance = () => {
    return turf.distance(
        turf.point([state.measurePoints[0].lng, state.measurePoints[0].lat]),
        turf.point([state.measurePoints[1].lng, state.measurePoints[1].lat]),
        {units: 'meters'}
    );
};

/**
 * Dessine une ligne entre les points de mesure
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
 * Affiche une popup avec la distance mesurée
 * @function showDistancePopup
 * @param {LngLat} lngLat - Coordonnées où afficher la popup
 * @param {number} distance - Distance à afficher en mètres
 */
const showDistancePopup = (lngLat, distance) => {
    new mapboxgl.Popup()
        .setLngLat(lngLat)
        .setHTML(`Distance: ${Math.round(distance)} mètres`)
        .addTo(map);
};

/**
 * Nettoie les éléments de mesure (points, ligne, popup)
 * @function cleanupMeasure
 */
const cleanupMeasure = () => {
    elements.mapCanvas.style.cursor = '';
    map.off('click', addMeasurePoint);
    state.measurePoints = [];
    state.isMeasuring = false;
};

/**
 * Centre la carte sur les coordonnées par défaut
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