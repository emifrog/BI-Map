mapboxgl.accessToken = 'pk.eyJ1IjoiZW1pZnJvZyIsImEiOiJjbDU4NGx6ZncxemZpM2VwcHpvbXQ0ZTduIn0.8Rqf1sB2mTRtqQbrgPUy2Q';

// Obtenir la position géographique de l'utilisateur avec une haute précision
navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
    enableHighAccuracy: true,
    timeout: 10000,  // Délai pour récupérer la localisation (10 secondes)
    maximumAge: 0    // Ne pas utiliser une localisation en cache
});

// Si la position est obtenue avec succès
function successLocation(position) {
    setupMap([position.coords.longitude, position.coords.latitude]);
}

// En cas d'erreur lors de la récupération de la position
function errorLocation() {
    // Position par défaut si l'accès à la position échoue
    setupMap([7.268376, 43.704481]);
}

// Initialiser la carte avec des coordonnées
function setupMap(center) {
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: center,
        zoom: 18, // Zoom augmenté pour plus de précision visuelle
    });



    // Charger et configurer la boîte de recherche après le chargement
    const searchJS = document.getElementById('search-js');
    searchJS.onload = function () {
        const searchBox = new MapboxSearchBox();
        searchBox.accessToken = 'pk.eyJ1IjoiZW1pZnJvZyIsImEiOiJjbDU4NGx6ZncxemZpM2VwcHpvbXQ0ZTduIn0.8Rqf1sB2mTRtqQbrgPUy2Q';
        searchBox.options = {
            types: 'address,poi',
            language: 'fr',
            country: 'FR',
            bbox: [6.374816894531251, 43.51270490464819, 7.487182617187501, 44.11716972942086],
        };
        searchBox.marker = true;
        searchBox.mapboxgl = mapboxgl;
        map.addControl(searchBox);
    };
}
