import React, { useRef, useEffect, useState } from 'react';
import { mapStyles } from './mapStyles';

// FIX: Added to resolve "Cannot find namespace 'google'" error when using Google Maps API types.
declare var google: any;

// Add a declaration for our global callback queue on the window object.
declare global {
    interface Window {
        googleMapsCallbacks?: (() => void)[];
    }
}

interface MapMarker {
  id: string;
  position: { lat: number; lng: number };
}

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom: number;
  markers?: MapMarker[];
  focusedMarkerId?: string | null;
  onMarkerClick?: (markerId: string) => void;
}

let scriptLoaded = false;
const pulseAnimationName = 'markerPulse';
let pulseStyleSheet: HTMLStyleElement | null = null;

// Helper to ensure the CSS animation for the focused marker is injected only once.
const ensurePulseAnimation = () => {
    if (pulseStyleSheet || document.getElementById('marker-pulse-style')) return;
    pulseStyleSheet = document.createElement("style");
    pulseStyleSheet.id = 'marker-pulse-style';
    pulseStyleSheet.type = "text/css";
    pulseStyleSheet.innerText = `
        @keyframes ${pulseAnimationName} {
            0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.3; }
            70% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.1; }
            100% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.3; }
        }
    `;
    document.head.appendChild(pulseStyleSheet);
};

// Helper to create the DOM element for a marker.
const createMarkerElement = (isFocused: boolean): HTMLDivElement => {
    ensurePulseAnimation();
    const size = isFocused ? 50 : 30;
    const color = '#39FF14';

    const element = document.createElement('div');
    element.style.width = `${size}px`;
    element.style.height = `${size}px`;
    element.style.position = 'relative';
    element.style.cursor = 'pointer';

    // The pulsing outer circle for focused markers
    if (isFocused) {
        const pulse = document.createElement('div');
        pulse.style.position = 'absolute';
        pulse.style.top = '50%';
        pulse.style.left = '50%';
        pulse.style.width = `${size}px`;
        pulse.style.height = `${size}px`;
        pulse.style.borderRadius = '50%';
        pulse.style.background = color;
        pulse.style.animation = `${pulseAnimationName} 1.5s infinite ease-out`;
        element.appendChild(pulse);
    }
    
    // The inner solid dot
    const dot = document.createElement('div');
    dot.style.position = 'absolute';
    dot.style.top = '50%';
    dot.style.left = '50%';
    const dotSize = size * 0.4;
    dot.style.width = `${dotSize}px`;
    dot.style.height = `${dotSize}px`;
    dot.style.transform = 'translate(-50%, -50%)';
    dot.style.background = color;
    dot.style.borderRadius = '50%';
    dot.style.border = '2px solid rgba(0,0,0,0.5)';
    element.appendChild(dot);
    
    return element;
};


const loadGoogleMapsScript = (apiKey: string, callback: () => void) => {
    // If the script is already loaded and the API is available, execute the callback immediately.
    if (scriptLoaded && window.google && window.google.maps) {
        callback();
        return;
    }

    if (!window.googleMapsCallbacks) {
        window.googleMapsCallbacks = [];
    }
    window.googleMapsCallbacks.push(callback);

    const scriptId = 'googleMapsScript';
    if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        // Updated to include the 'marker' library for AdvancedMarkerElement
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=maps,marker`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            scriptLoaded = true;
            window.googleMapsCallbacks?.forEach(cb => cb());
            window.googleMapsCallbacks = [];
        };
        document.head.appendChild(script);
    }
};

const GoogleMap: React.FC<GoogleMapProps> = ({ center, zoom, markers = [], focusedMarkerId, onMarkerClick }) => {
    const ref = useRef<HTMLDivElement>(null);
    // Fix for error on line 122: Changed google.maps.Map to any to resolve "Cannot find namespace 'google'" error.
    const [map, setMap] = useState<any | null>(null);
    // Updated ref to store AdvancedMarkerElement instances
    const markersRef = useRef<{ [key: string]: any }>({});
    const [isApiLoaded, setIsApiLoaded] = useState(false);

    const apiKey = process.env.API_KEY;
    const mapId = process.env.MAP_ID;

    useEffect(() => {
        if (apiKey) {
            loadGoogleMapsScript(apiKey, () => {
                setIsApiLoaded(true);
            });
        }
    }, [apiKey]);

    useEffect(() => {
        if (ref.current && isApiLoaded && !map && mapId) {
            const newMap = new window.google.maps.Map(ref.current, {
                center,
                zoom,
                styles: mapStyles,
                disableDefaultUI: true,
                zoomControl: true,
                // mapId is required for AdvancedMarkerElement and should come from env
                mapId: mapId,
            });
            setMap(newMap);
        }
    }, [ref, isApiLoaded, map, center, zoom, mapId]);

    useEffect(() => {
        if (map) {
            map.panTo(center);
            map.setZoom(zoom);
        }
    }, [center, zoom, map]);

    useEffect(() => {
        if (map && isApiLoaded) {
            const currentMarkerIds = new Set(markers.map(m => m.id));

            // Remove old markers that are no longer in the props
            Object.keys(markersRef.current).forEach(markerId => {
                if (!currentMarkerIds.has(markerId)) {
                    markersRef.current[markerId].map = null;
                    delete markersRef.current[markerId];
                }
            });
            
            // Add new markers or update existing ones
            markers.forEach(markerData => {
                const isFocused = markerData.id === focusedMarkerId;
                
                if (!markersRef.current[markerData.id]) {
                    // Create a new AdvancedMarkerElement
                    const marker = new window.google.maps.marker.AdvancedMarkerElement({
                        position: markerData.position,
                        map: map,
                        content: createMarkerElement(isFocused),
                    });

                    if (onMarkerClick) {
                        // Use 'gmp-click' for AdvancedMarkerElement
                        marker.addListener('gmp-click', () => onMarkerClick(markerData.id));
                    }
                    markersRef.current[markerData.id] = marker;
                } else {
                    // Marker already exists, just update its content for focus changes
                    const existingMarker = markersRef.current[markerData.id];
                    existingMarker.content = createMarkerElement(isFocused);
                }
            });
        }
    }, [map, markers, focusedMarkerId, isApiLoaded, onMarkerClick]);


    if (!apiKey || !mapId) {
        return <div className="w-full h-full bg-brand-tertiary flex items-center justify-center text-brand-text-secondary p-4 text-center">Map requires an API Key and a Map ID. Please check your environment variables.</div>;
    }

    if (!isApiLoaded) {
        return <div className="w-full h-full bg-brand-primary flex items-center justify-center text-brand-text-secondary">Loading Map...</div>;
    }

    return <div ref={ref} className="w-full h-full" />;
};

export default GoogleMap;