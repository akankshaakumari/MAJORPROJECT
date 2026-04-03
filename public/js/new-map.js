let initialCoordinates = [77.2090, 28.6139]; // Default baseline (Delhi)

if (typeof existingCoords !== 'undefined' && existingCoords.length === 2 && !isNaN(existingCoords[0])) {
    initialCoordinates = existingCoords;
}

const map = new maplibregl.Map({
    container: 'interactive-map',
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
    center: initialCoordinates,
    zoom: typeof existingCoords !== 'undefined' ? 11 : 4 // Zoom out for new listing, zoom in for edit
});

// Add map controls
map.addControl(new maplibregl.NavigationControl());

let marker;

// If we are editing, drop a marker initially
if (typeof existingCoords !== 'undefined' && existingCoords.length === 2 && !isNaN(existingCoords[0])) {
    marker = new maplibregl.Marker({ color: "red", draggable: true })
        .setLngLat(initialCoordinates)
        .addTo(map);

    document.getElementById('lat').value = initialCoordinates[1];
    document.getElementById('lng').value = initialCoordinates[0];

    marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        document.getElementById('lat').value = lngLat.lat;
        document.getElementById('lng').value = lngLat.lng;
    });
}

map.on('click', (e) => {
    const coords = e.lngLat;
    
    // Update hidden inputs
    document.getElementById('lat').value = coords.lat.toFixed(6);
    document.getElementById('lng').value = coords.lng.toFixed(6);
    
    if (marker) {
        marker.setLngLat(coords);
    } else {
        marker = new maplibregl.Marker({ color: "red", draggable: true })
            .setLngLat(coords)
            .addTo(map);
            
        marker.on('dragend', () => {
             const lngLat = marker.getLngLat();
             document.getElementById('lat').value = lngLat.lat.toFixed(6);
             document.getElementById('lng').value = lngLat.lng.toFixed(6);
        });
    }
});
