/**
 * Charge les casernes depuis Supabase
 */
const loadCasernes = async () => {
    try {
        const response = await fetch(SUPABASE_URL + '/rest/v1/casernes?select=name,lng,lat', {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': 'Bearer ' + SUPABASE_KEY
            }
        });

        if (!response.ok) throw new Error('Erreur Supabase casernes: ' + response.status);

        const data = await response.json();
        console.log('Casernes chargees depuis Supabase:', data.length);
        addCasernesLayer(data);
    } catch (error) {
        console.error('Erreur lors du chargement des casernes:', error);
    }
};

/**
 * Ajoute les casernes via un symbol layer Mapbox
 */
const addCasernesLayer = (data) => {
    map.loadImage('images/casque.png', (error, image) => {
        if (error) {
            console.error('Erreur chargement icone caserne:', error);
            return;
        }

        map.addImage('caserne-icon', image);

        const geojson = {
            type: 'FeatureCollection',
            features: data.map(row => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [row.lng, row.lat]
                },
                properties: {
                    name: row.name
                }
            }))
        };

        map.addSource('casernes', {
            type: 'geojson',
            data: geojson
        });

        map.addLayer({
            id: 'casernes-layer',
            type: 'symbol',
            source: 'casernes',
            layout: {
                'icon-image': 'caserne-icon',
                'icon-size': 0.12,
                'icon-allow-overlap': true
            }
        });

        map.on('click', 'casernes-layer', (e) => {
            const feature = e.features[0];
            const coordinates = feature.geometry.coordinates.slice();
            const name = feature.properties.name || '';

            new mapboxgl.Popup({ offset: 15 })
                .setLngLat(coordinates)
                .setHTML('<h3 class="namebi">' + escapeHTML(name) + '</h3>')
                .addTo(map);
        });

        map.on('mouseenter', 'casernes-layer', () => {
            elements.mapCanvas.style.cursor = 'pointer';
        });
        map.on('mouseleave', 'casernes-layer', () => {
            elements.mapCanvas.style.cursor = '';
        });
    });
};
