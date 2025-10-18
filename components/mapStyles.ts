// Custom styles for Google Maps to match the Where's Up? brand identity.
// Theme: Dark with neon green highlights.
// FIX: Added to resolve "Cannot find namespace 'google'" error when using Google Maps API types.
declare var google: any;
// Fix for error on line 5: Changed google.maps.MapTypeStyle[] to any[] to resolve "Cannot find namespace 'google'" error.
export const mapStyles: any[] = [
    {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [
            { "color": "#aaaaaa" }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [
            { "visibility": "off" }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.icon",
        "stylers": [
            { "visibility": "off" }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.fill",
        "stylers": [
            { "color": "#1A1A1A" }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
            { "color": "#2A2A2A" },
            { "weight": 1.2 }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [
            { "color": "#1A1A1A" }
        ]
    },
    {
        "featureType": "landscape.natural",
        "elementType": "geometry.fill",
        "stylers": [
            { "color": "#1c2b1c" } // Very subtle dark green for natural landscapes
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            { "color": "#2A2A2A" }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels",
        "stylers": [
            { "visibility": "off" }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry.fill",
        "stylers": [
            { "color": "#1c331c" } // Slightly more noticeable but still dark green for parks
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [
            { "color": "#2c522c" } // Muted neon green for smaller roads
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry.stroke",
        "stylers": [
            { "visibility": "off" }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            { "color": "#2a6b2c" } // Brighter green for highways
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            { "color": "#1A1A1A" }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [
            { "color": "#2A2A2A" }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            { "color": "#000000" }
        ]
    }
];