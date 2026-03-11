/**
 * Configuration principale de la carte Mapbox
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
 */
const SEARCH_CONFIG = {
    types: 'address,poi',
    language: 'fr',
    country: 'FR',
    bbox: [6.374816894531251, 43.51270490464819, 7.487182617187501, 44.11716972942086],
    zoom: 19,
};

/**
 * Fichiers de données hydrants à charger
 */
const HYDRANT_FILES = ['data/nice.json', 'data/bv.json'];

/**
 * Cache des éléments DOM fréquemment utilisés
 */
const elements = {
    map: document.getElementById('map'),
    searchContainer: document.getElementById('search-box-container'),
    mapCanvas: null
};

/**
 * État global de l'application
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

// Initialisation de la carte
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

elements.mapCanvas = map.getCanvas();

// Contrôle de géolocalisation
const geolocateControl = new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserHeading: true
});

map.addControl(geolocateControl);

/**
 * Charge et fusionne les données GeoJSON des hydrants
 */
const loadHydrants = async () => {
    try {
        const responses = await Promise.all(
            HYDRANT_FILES.map(file => fetch(file).then(r => {
                if (!r.ok) throw new Error(`Erreur chargement ${file}: ${r.status}`);
                return r.json();
            }))
        );

        // Fusionner toutes les features dans un seul GeoJSON
        const merged = {
            type: 'FeatureCollection',
            features: responses.flatMap(data => data.features)
        };

        addHydrantMarkers(merged);
    } catch (error) {
        console.error('Erreur lors du chargement des hydrants:', error);
    }
};

/**
 * Ajoute les marqueurs HTML pour les hydrants
 */
const addHydrantMarkers = (geojson) => {
    for (const feature of geojson.features) {
        const el = document.createElement('div');
        el.className = 'marker-bi';

        new mapboxgl.Marker(el)
            .setLngLat(feature.geometry.coordinates)
            .setPopup(
                new mapboxgl.Popup({ offset: 25 })
                    .setHTML(`<h3 class="namebi">${feature.properties.title}${feature.properties.num}</h3>`)
            )
            .addTo(map);
    }
};

// Chargement au démarrage
map.on('load', () => {
    // Géolocalisation
    if (navigator.geolocation) {
        geolocateControl.trigger();
    }

    // Charger les hydrants
    loadHydrants();
});

// Gestion des erreurs de géolocalisation
geolocateControl.on('error', (e) => {
    console.warn('Géolocalisation indisponible:', e.message);
});

/**
 * Initialise la fonctionnalité de recherche
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
 */
const handleSearchResult = (event) => {
    const coordinates = event.detail.features[0].geometry.coordinates;
    state.lastSearchCoordinates = coordinates;
    updateSearchRadiusLayers(coordinates);
};

/**
 * Met à jour les cercles de rayon de recherche
 */
const updateSearchRadiusLayers = (coordinates) => {
    removeSearchRadiusLayers();

    const radiusConfigs = [
        { id: 'search-radius-50', radius: 25, color: '#ff0000' },
        { id: 'search-radius-100', radius: 50, color: '#00ff00' }
    ];

    radiusConfigs.forEach(config => {
        addSearchRadiusLayer(coordinates, config);
    });
};

/**
 * Ajoute une couche de rayon de recherche
 */
const addSearchRadiusLayer = (coordinates, config) => {
    map.addSource(config.id, {
        type: 'geojson',
        data: {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: coordinates
            }
        }
    });

    state.currentLayers.add(config.id);

    map.addLayer({
        id: config.id,
        type: 'circle',
        source: config.id,
        paint: {
            'circle-radius': {
                stops: [
                    [14, config.radius / 4],
                    [15, config.radius / 2],
                    [16, config.radius],
                    [17, config.radius * 2],
                    [18, config.radius * 4],
                    [19, config.radius * 8]
                ],
                base: 2
            },
            'circle-color': config.color,
            'circle-opacity': 0.3,
            'circle-stroke-width': 1,
            'circle-stroke-color': config.color
        }
    });
};

/**
 * Supprime toutes les couches de rayon de recherche
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
 * Ouvre l'interface F.I.R.E
 */
const handleFireClick = () => {
    window.open('fire.html', '_blank', "height=600,width=500");
};

/**
 * Active/désactive le mode mesure
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
 * Ajoute un point de mesure
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
 */
const calculateDistance = () => {
    return turf.distance(
        turf.point([state.measurePoints[0].lng, state.measurePoints[0].lat]),
        turf.point([state.measurePoints[1].lng, state.measurePoints[1].lat]),
        { units: 'meters' }
    );
};

/**
 * Dessine une ligne entre les points de mesure
 */
const drawMeasureLine = () => {
    const lineId = 'measure-line';
    if (map.getSource(lineId)) {
        map.removeLayer(lineId);
        map.removeSource(lineId);
    }

    map.addSource(lineId, {
        type: 'geojson',
        data: {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: state.measurePoints.map(point => [point.lng, point.lat])
            }
        }
    });

    map.addLayer({
        id: lineId,
        type: 'line',
        source: lineId,
        paint: {
            'line-color': '#ff0000',
            'line-width': 2
        }
    });
};

/**
 * Affiche une popup avec la distance mesurée
 */
const showDistancePopup = (lngLat, distance) => {
    new mapboxgl.Popup()
        .setLngLat(lngLat)
        .setHTML(`Distance: ${Math.round(distance)} mètres`)
        .addTo(map);
};

/**
 * Nettoie les éléments de mesure
 */
const cleanupMeasure = () => {
    elements.mapCanvas.style.cursor = '';
    map.off('click', addMeasurePoint);
    state.measurePoints = [];
    state.isMeasuring = false;
};

/**
 * Centre la carte sur la dernière recherche
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

// Initialisation de la recherche
document.getElementById('search-js').addEventListener('load', initSearch);
