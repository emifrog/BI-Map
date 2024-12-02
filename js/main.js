mapboxgl.accessToken = 'pk.eyJ1IjoiZW1pZnJvZyIsImEiOiJjbDU4NGx6ZncxemZpM2VwcHpvbXQ0ZTduIn0.8Rqf1sB2mTRtqQbrgPUy2Q';


const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [7.268376, 43.704481],
    zoom: 14,
});

const searchJS = document.getElementById('search-js');
searchJS.onload = function () {
    const searchBox = new MapboxSearchBox();
    searchBox.accessToken = 'pk.eyJ1IjoiZW1pZnJvZyIsImEiOiJjbDU4NGx6ZncxemZpM2VwcHpvbXQ0ZTduIn0.8Rqf1sB2mTRtqQbrgPUy2Q';
    searchBox.options = {
        types: 'address,poi',
        language: 'fr',
        country: 'FR',
        bbox: [6.374816894531251, 43.51270490464819, 7.487182617187501, 44.11716972942086],
        zoom: 19,
    };

    // Personnaliser le marker
    searchBox.marker = {
        color: '#FF0000',  // Couleur rouge
        scale: 1,          // Taille du marker (1 = normal)
        draggable: false   // Empêcher le déplacement
    };
    searchBox.mapboxgl = mapboxgl;
    map.addControl(searchBox);
    // Bind search box to the map and add to DOM
    searchBox.bindMap(map);
    document.getElementById('search-box-container').appendChild(searchBox);

    // Écouter l'événement de sélection d'un résultat
    searchBox.addEventListener('retrieve', (event) => {
        const coordinates = event.detail.features[0].geometry.coordinates;
        // Sauvegarder les coordonnées
        lastSearchCoordinates = coordinates;
        
        // Supprimer les anciens cercles s'ils existent
        ['search-radius-50', 'search-radius-100'].forEach(id => {
            if (map.getSource(id)) {
                map.removeLayer(id);
                map.removeSource(id);
            }
        });

        // Créer les deux cercles
        ['50', '100'].forEach((radius, index) => {
            const id = `search-radius-${radius}`;
            const color = radius === '50' ? '#ff0000' : '#00ff00';
            const radiusInPixels = radius === '50' ? 25 : 50; // La moitié car c'est un rayon

            
            map.addSource(id, {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': coordinates
                    }
                }
            });

            map.addLayer({
                'id': id,
                'type': 'circle',
                'source': id,
                'paint': {
                    'circle-radius': {
                        'stops': [
                            [14, radiusInPixels / 4], // Zoom niveau 14
                            [15, radiusInPixels / 2], // Zoom niveau 15
                            [16, radiusInPixels],     // Zoom niveau 16
                            [17, radiusInPixels * 2], // Zoom niveau 17
                            [18, radiusInPixels * 4], // Zoom niveau 18
                            [19, radiusInPixels * 8]  // Zoom niveau 19
                        ],
                        'base': 2
                    },
                    'circle-color': color,
                    'circle-opacity': 0.3,
                    'circle-stroke-width': 1,
                    'circle-stroke-color': color
                }
            });
        });
    });
};

function handleFireClick() {
    // Ajoutez ici la logique pour le bouton F.I.R.E
    window.open('fire.html', '_blank', "height=600,width=500");	
}

let isMeasuring = false;
let measurePoints = [];
let measureLine;

function handleMesureClick() {
    isMeasuring = !isMeasuring;
    
    if (isMeasuring) {
        // Changer le curseur pour indiquer le mode mesure
        map.getCanvas().style.cursor = 'crosshair';
        
        // Ajouter l'écouteur de clic
        map.on('click', addMeasurePoint);
    } else {
        // Réinitialiser
        cleanupMeasure();
    }
}

function addMeasurePoint(e) {
    measurePoints.push(e.lngLat);
    
    if (measurePoints.length === 2) {
        // Calculer la distance
        const distance = turf.distance(
            turf.point([measurePoints[0].lng, measurePoints[0].lat]),
            turf.point([measurePoints[1].lng, measurePoints[1].lat]),
            {units: 'meters'}
        );
        
        // Dessiner la ligne
        if (map.getSource('measure-line')) {
            map.removeLayer('measure-line');
            map.removeSource('measure-line');
        }
        
        map.addSource('measure-line', {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'geometry': {
                    'type': 'LineString',
                    'coordinates': [
                        [measurePoints[0].lng, measurePoints[0].lat],
                        [measurePoints[1].lng, measurePoints[1].lat]
                    ]
                }
            }
        });

        map.addLayer({
            'id': 'measure-line',
            'type': 'line',
            'source': 'measure-line',
            'paint': {
                'line-color': '#ff0000',
                'line-width': 2
            }
        });

        // Afficher la distance
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`Distance: ${Math.round(distance)} mètres`)
            .addTo(map);

        // Réinitialiser pour la prochaine mesure
        cleanupMeasure();
    }
}

function cleanupMeasure() {
    map.getCanvas().style.cursor = '';
    map.off('click', addMeasurePoint);
    measurePoints = [];
    isMeasuring = false;
}

// Variable globale pour stocker les dernières coordonnées de recherche
let lastSearchCoordinates = null;

// Fonction pour le bouton centrer
function handleCentrerClick() {
    if (lastSearchCoordinates) {
        map.flyTo({
            center: lastSearchCoordinates,
            zoom: 19,
            essential: true
        });
    } else {
        alert('Aucune recherche effectuée');
    }
}
