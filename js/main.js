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
 * Configuration Supabase
 */
const SUPABASE_URL = 'https://ugkgingplyskgjgpqpue.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVna2dpbmdwbHlza2dqZ3BxcHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1Mjk5MzcsImV4cCI6MjA5MDEwNTkzN30.chrGTi9wT4rAABqeM2UtHrq7Td2T8_zLQAnoTHbVeus';

/**
 * Cache des elements DOM frequemment utilises
 */
const elements = {
    map: document.getElementById('map'),
    searchContainer: document.getElementById('search-box-container'),
    mapCanvas: null
};

/**
 * Etat global de l'application
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
    attributionControl: false
});

elements.mapCanvas = map.getCanvas();

// Controle de geolocalisation
const geolocateControl = new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserHeading: true
});

map.addControl(geolocateControl);

/**
 * Calcule la distance entre deux points GPS (formule Haversine)
 * @param {number} lat1 - Latitude du point 1
 * @param {number} lon1 - Longitude du point 1
 * @param {number} lat2 - Latitude du point 2
 * @param {number} lon2 - Longitude du point 2
 * @returns {number} Distance en metres
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const toRad = (deg) => deg * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Charge les hydrants depuis Supabase et les convertit en GeoJSON
 */
const loadHydrants = async () => {
    try {
        const response = await fetch(SUPABASE_URL + '/rest/v1/BI?select=title,num,lng,lat', {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': 'Bearer ' + SUPABASE_KEY
            }
        });

        if (!response.ok) throw new Error('Erreur Supabase: ' + response.status);

        const data = await response.json();
        console.log('Hydrants charges depuis Supabase:', data.length);

        const geojson = {
            type: 'FeatureCollection',
            features: data.map(row => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [row.lng, row.lat]
                },
                properties: {
                    title: row.title,
                    num: row.num
                }
            }))
        };

        addHydrantLayer(geojson);
    } catch (error) {
        console.error('Erreur lors du chargement des hydrants:', error);
    }
};

/**
 * Ajoute les hydrants via un symbol layer Mapbox
 */
const addHydrantLayer = (geojson) => {
    map.loadImage('images/bi.png', (error, image) => {
        if (error) {
            console.error('Erreur chargement icone BI:', error);
            return;
        }

        map.addImage('bi-icon', image);

        map.addSource('hydrants', {
            type: 'geojson',
            data: geojson
        });

        map.addLayer({
            id: 'hydrants-layer',
            type: 'symbol',
            source: 'hydrants',
            layout: {
                'icon-image': 'bi-icon',
                'icon-size': 0.1,
                'icon-allow-overlap': true
            }
        });

        // Clic sur un point -> popup
        map.on('click', 'hydrants-layer', (e) => {
            const feature = e.features[0];
            const coordinates = feature.geometry.coordinates.slice();
            const title = feature.properties.title || '';
            const num = feature.properties.num || '';

            new mapboxgl.Popup({ offset: 15 })
                .setLngLat(coordinates)
                .setHTML('<h3 class="namebi">' + escapeHTML(title) + escapeHTML(num) + '</h3>')
                .addTo(map);
        });

        map.on('mouseenter', 'hydrants-layer', () => {
            elements.mapCanvas.style.cursor = 'pointer';
        });
        map.on('mouseleave', 'hydrants-layer', () => {
            elements.mapCanvas.style.cursor = '';
        });
    });
};

/**
 * Echappe les caracteres HTML pour prevenir les injections XSS
 */
const escapeHTML = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

// Chargement au demarrage
map.on('load', () => {
    if (navigator.geolocation) {
        geolocateControl.trigger();
    }
    loadHydrants();
});

geolocateControl.on('error', (e) => {
    console.warn('Geolocalisation indisponible:', e.message);
});

/**
 * Initialise la fonctionnalite de recherche
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
 * Gere le resultat d'une recherche
 */
const handleSearchResult = (event) => {
    const features = event.detail.features;
    if (!features || !features.length) return;
    const coordinates = features[0].geometry.coordinates;
    state.lastSearchCoordinates = coordinates;
    updateSearchRadiusLayers(coordinates);
};

/**
 * Met a jour les cercles de rayon de recherche
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
 * Active/desactive le mode mesure
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
        const p1 = state.measurePoints[0];
        const p2 = state.measurePoints[1];
        const distance = haversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
        drawMeasureLine();
        showDistancePopup(e.lngLat, distance);
        cleanupMeasure();
    }
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
 * Affiche une popup avec la distance mesuree
 */
const showDistancePopup = (lngLat, distance) => {
    new mapboxgl.Popup()
        .setLngLat(lngLat)
        .setHTML('Distance: ' + Math.round(distance) + ' m\u00e8tres')
        .addTo(map);
};

/**
 * Nettoie les elements de mesure
 */
const cleanupMeasure = () => {
    elements.mapCanvas.style.cursor = '';
    map.off('click', addMeasurePoint);
    state.measurePoints = [];
    state.isMeasuring = false;
};

/**
 * Centre la carte sur la derniere recherche
 */
const handleCentrerClick = () => {
    if (state.lastSearchCoordinates) {
        map.flyTo({
            center: state.lastSearchCoordinates,
            zoom: SEARCH_CONFIG.zoom,
            essential: true
        });
    } else {
        showToast('Aucune recherche effectu\u00e9e');
    }
};

/**
 * Affiche une notification non-bloquante (toast)
 */
const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

// Initialisation de la recherche
document.getElementById('search-js').addEventListener('load', initSearch);
