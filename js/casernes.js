const geojsoncaserne = {
    type: "FeatureCollection",
    features: [
       {
          "type": "Feature",
          "geometry": {
             "type": "Point",
             "coordinates": [
                7.268545,
                43.704549
             ]
          },
       },
    ]
};

// add markers to map
for (const feature of geojsoncaserne.features) {

   // create a HTML element for each feature
   const el = document.createElement('div');
   el.className = 'marker-caserne';

   // make a marker for each feature and add to the map
   
   
   new mapboxgl.Marker(el)
      .setLngLat(feature.geometry.coordinates)
      .setPopup(
         new mapboxgl.Popup({
            offset: 25
         }) // add popups

      )
   .addTo(map);
}