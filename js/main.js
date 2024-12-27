// Cache des éléments DOM et constantes
const MAP_CONFIG = {
    accessToken: 'pk.eyJ1IjoiZW1pZnJvZyIsImEiOiJjbDU4NGx6ZncxemZpM2VwcHpvbXQ0ZTduIn0.8Rqf1sB2mTRtqQbrgPUy2Q',
    defaultCenter: [7.268376, 43.704481],
    defaultZoom: 14,
    maxBounds: [[6.374816894531251, 43.51270490464819], [7.487182617187501, 44.11716972942086]],
    minZoom: 10,
    maxZoom: 19
};

const SEARCH_CONFIG = {
    types: 'address,poi',
    language: 'fr',
    country: 'FR',
    bbox: [6.374816894531251, 43.51270490464819, 7.487182617187501, 44.11716972942086],
    zoom: 19
};

// Cache des éléments DOM
const elements = {
    map: document.getElementById('map'),
    searchContainer: document.getElementById('search-box-container'),
    mapCanvas: null // Sera initialisé après la création de la carte
};

// État global de l'application
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

// Initialisation de la recherche
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

// Gestionnaire optimisé pour les résultats de recherche
const handleSearchResult = (event) => {
    const coordinates = event.detail.features[0].geometry.coordinates;
    state.lastSearchCoordinates = coordinates;
    
    updateSearchRadiusLayers(coordinates);
};

// Fonction optimisée pour mettre à jour les cercles de recherche
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

// Fonction optimisée pour ajouter une couche de rayon de recherche
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

// Fonction optimisée pour supprimer les couches de rayon de recherche
const removeSearchRadiusLayers = () => {
    state.currentLayers.forEach(id => {
        if (map.getSource(id)) {
            map.removeLayer(id);
            map.removeSource(id);
        }
    });
    state.currentLayers.clear();
};

// Gestionnaires d'événements optimisés
const handleFireClick = () => {
    window.open('fire.html', '_blank', "height=600,width=500");
};

const handleMesureClick = () => {
    state.isMeasuring = !state.isMeasuring;
    
    if (state.isMeasuring) {
        elements.mapCanvas.style.cursor = 'crosshair';
        map.on('click', addMeasurePoint);
    } else {
        cleanupMeasure();
    }
};

const addMeasurePoint = (e) => {
    state.measurePoints.push(e.lngLat);
    
    if (state.measurePoints.length === 2) {
        const distance = calculateDistance();
        drawMeasureLine();
        showDistancePopup(e.lngLat, distance);
        cleanupMeasure();
    }
};

// Fonctions utilitaires optimisées
const calculateDistance = () => {
    return turf.distance(
        turf.point([state.measurePoints[0].lng, state.measurePoints[0].lat]),
        turf.point([state.measurePoints[1].lng, state.measurePoints[1].lat]),
        {units: 'meters'}
    );
};

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

const showDistancePopup = (lngLat, distance) => {
    new mapboxgl.Popup()
        .setLngLat(lngLat)
        .setHTML(`Distance: ${Math.round(distance)} mètres`)
        .addTo(map);
};

const cleanupMeasure = () => {
    elements.mapCanvas.style.cursor = '';
    map.off('click', addMeasurePoint);
    state.measurePoints = [];
    state.isMeasuring = false;
};

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
