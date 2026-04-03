// MapLibre is a drop-in replacement for MapBox that doesn't enforce strict API tokens
// so it won't blank out the map after 2 seconds.

let coordinates = [77.2090, 28.6139]; // Default baseline
if (listingParams.geometry && listingParams.geometry.coordinates && listingParams.geometry.coordinates.length === 2) {
    coordinates = listingParams.geometry.coordinates;
}

const map = new maplibregl.Map({
    container: 'map',
    style: {
        'version': 8,
        'sources': {
            'google-hybrid': {
                'type': 'raster',
                'tiles': [
                    'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
                ],
                'tileSize': 256
            }
        },
        'layers': [
            {
                'id': 'google-hybrid-layer',
                'type': 'raster',
                'source': 'google-hybrid',
                'minzoom': 0,
                'maxzoom': 22
            }
        ]
    },
    center: coordinates,
    zoom: 11
});

const popup = new maplibregl.Popup({ offset: 25 })
    .setHTML(`<h4>${listingParams.title}</h4><p>Exact location will be provided after booking</p>`);

new maplibregl.Marker({ color: "red" })
    .setLngLat(coordinates)
    .setPopup(popup)
    .addTo(map);
