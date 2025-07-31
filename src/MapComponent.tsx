import React from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

interface Coordinate {
  id: number;
  lat: number;
  lng: number;
  plotted: boolean;
}

interface MapComponentProps {
  coordinates: Coordinate[];
  apiKey: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ coordinates, apiKey }) => {
  const render = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return <div className="flex items-center justify-center h-full">Loading map...</div>;
      case Status.FAILURE:
        return <div className="flex items-center justify-center h-full text-red-600">Error loading map</div>;
      case Status.SUCCESS:
        return <Map coordinates={coordinates} />;
    }
  };

  return (
    <Wrapper apiKey={apiKey} render={render} />
  );
};

export default MapComponent;

interface MapProps {
    coordinates: Coordinate[];
  }
  
  const Map: React.FC<MapProps> = ({ coordinates }) => {
    const mapRef = React.useRef<HTMLDivElement>(null);
    const map = React.useRef<google.maps.Map | null>(null);
    const markers = React.useRef<google.maps.Marker[]>([]);
    const polygon = React.useRef<google.maps.Polygon | null>(null);
  
    React.useEffect(() => {
        if (mapRef.current && !map.current) {
          // Initialize map
          map.current = new google.maps.Map(mapRef.current, {
            center: { lat: 0, lng: 0 },
            zoom: 10,
            mapTypeId: 'hybrid', // Show satellite with labels
          });
        }
      }, []);
  
    React.useEffect(() => {
      if (!map.current || coordinates.length === 0) return;
  
      // Clear existing markers and polygon
      markers.current.forEach(marker => marker.setMap(null));
      markers.current = [];
      if (polygon.current) {
        polygon.current.setMap(null);
      }
  
      // Create markers for each coordinate
      const newMarkers = coordinates.map((coord, index) => {
        const marker = new google.maps.Marker({
          position: { lat: coord.lat, lng: coord.lng },
          map: map.current,
          title: `Point ${index + 1}`,
          label: (index + 1).toString(),
        });
        return marker;
      });
      markers.current = newMarkers;
  
      // Create polygon connecting all points
      if (coordinates.length > 2) {
        const polygonPath = coordinates.map(coord => ({
          lat: coord.lat,
          lng: coord.lng
        }));
  
        polygon.current = new google.maps.Polygon({
          paths: polygonPath,
          strokeColor: '#3B82F6',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#3B82F6',
          fillOpacity: 0.2,
        });
        polygon.current.setMap(map.current);
      }
  
      // Fit map to show all coordinates
      const bounds = new google.maps.LatLngBounds();
      coordinates.forEach(coord => {
        bounds.extend({ lat: coord.lat, lng: coord.lng });
      });
      map.current.fitBounds(bounds);
  
      // Add some padding to the bounds
      const padding = { top: 50, right: 50, bottom: 50, left: 50 };
      map.current.fitBounds(bounds, padding);
  
    }, [coordinates]);
  
    return <div ref={mapRef} className="w-full h-full" />;
  };