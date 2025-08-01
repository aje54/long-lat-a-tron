import React from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

interface Coordinate {
  id: number;
  lat: number;
  lng: number;
  plotted: boolean;
  original: any;
}

interface MapComponentProps {
  coordinates: Coordinate[];
  apiKey: string;
  selectedCoordinate: number | null;
  onMarkerClick: (id: number) => void;
  centerCoordinate: number | null;
  mapType: string;
  onMapReady: (map: google.maps.Map) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  coordinates, 
  apiKey, 
  selectedCoordinate, 
  onMarkerClick,
  centerCoordinate,
  mapType,
  onMapReady
}) => {
  const render = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return <div className="flex items-center justify-center h-full">Loading map...</div>;
      case Status.FAILURE:
        return <div className="flex items-center justify-center h-full text-red-600">Error loading map</div>;
      case Status.SUCCESS:
        return (
          <MapDisplay 
            coordinates={coordinates} 
            selectedCoordinate={selectedCoordinate}
            onMarkerClick={onMarkerClick}
            centerCoordinate={centerCoordinate}
            mapType={mapType}
            onMapReady={onMapReady}
          />
        );
    }
  };

  return (
    <Wrapper apiKey={apiKey} render={render} />
  );
};




interface MapDisplayProps {
  coordinates: Coordinate[];
  selectedCoordinate: number | null;
  onMarkerClick: (id: number) => void;
  centerCoordinate: number | null;
  mapType: string;
  onMapReady: (map: google.maps.Map) => void;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ 
  coordinates, 
  selectedCoordinate, 
  onMarkerClick,
  centerCoordinate,
  mapType,
  onMapReady
}) => {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<google.maps.Map | null>(null);
  const markers = React.useRef<google.maps.Marker[]>([]);
  const polygon = React.useRef<google.maps.Polygon | null>(null);

// In the MapDisplay component, update the map initialization:
React.useEffect(() => {
    if (mapRef.current && !map.current) {
      console.log('Initializing Google Map');
      map.current = new google.maps.Map(mapRef.current, {
        center: { lat: 0, lng: 0 },
        zoom: 10,
        mapTypeId: mapType as google.maps.MapTypeId,
        // Disable all built-in controls
        mapTypeControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER,
        },
        streetViewControl: false,
        fullscreenControl: true,
        fullscreenControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP,
        },
        // Remove the gestureHandling if it causes issues
        gestureHandling: 'cooperative',
      });
      
      // Call onMapReady to provide map instance to parent
      onMapReady(map.current);
    }
  }, [onMapReady, mapType]);

  // Update map type when changed
  React.useEffect(() => {
    if (map.current) {
      map.current.setMapTypeId(mapType as google.maps.MapTypeId);
    }
  }, [mapType]);

  // Update markers and polygon when coordinates or selection changes
  React.useEffect(() => {
    if (!map.current || coordinates.length === 0) return;

    console.log('Updating markers, selectedCoordinate:', selectedCoordinate);

    // Clear existing markers and polygon
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];
    if (polygon.current) {
      polygon.current.setMap(null);
      polygon.current = null;
    }

    // Create markers for each coordinate
    const newMarkers = coordinates.map((coord, index) => {
      const isSelected = selectedCoordinate === coord.id;
      
      console.log(`Creating marker ${index + 1}, id: ${coord.id}, selected: ${isSelected}`);
      
      const marker = new google.maps.Marker({
        position: { lat: coord.lat, lng: coord.lng },
        map: map.current,
        title: `Point ${index + 1}`,
        label: {
          text: (index + 1).toString(),
          color: isSelected ? 'white' : 'black',
          fontWeight: 'bold'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 15 : 10,
          fillColor: isSelected ? '#3B82F6' : coord.plotted ? '#10B981' : '#6B7280',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2,
        }
      });

      // Add click listener to marker
      marker.addListener('click', () => {
        console.log('Marker clicked, coord.id:', coord.id);
        onMarkerClick(coord.id);
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

    // Fit map to show all coordinates (only on initial load)
    if (selectedCoordinate === null && centerCoordinate === null) {
      const bounds = new google.maps.LatLngBounds();
      coordinates.forEach(coord => {
        bounds.extend({ lat: coord.lat, lng: coord.lng });
      });
      map.current.fitBounds(bounds);
      
      // Add padding to the bounds
      const padding = { top: 50, right: 50, bottom: 50, left: 50 };
      map.current.fitBounds(bounds, padding);
    }

  }, [coordinates, selectedCoordinate]);

  // Handle centering on specific coordinate
  React.useEffect(() => {
    if (!map.current || centerCoordinate === null) return;
    
    console.log('Centering map on coordinate:', centerCoordinate);
    const coord = coordinates.find(c => c.id === centerCoordinate);
    if (coord) {
      map.current.panTo({ lat: coord.lat, lng: coord.lng });
      map.current.setZoom(18); // Close zoom for centering
    }
  }, [centerCoordinate, coordinates]);

  return <div ref={mapRef} className="w-full h-full" />;
};

export default MapComponent;