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
  userLocation?: { lat: number; lng: number; accuracy: number } | null;
  isManualMode?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
}

interface MapDisplayProps {
  coordinates: Coordinate[];
  selectedCoordinate: number | null;
  onMarkerClick: (id: number) => void;
  centerCoordinate: number | null;
  mapType: string;
  onMapReady: (map: google.maps.Map) => void;
  userLocation?: { lat: number; lng: number; accuracy: number } | null;
  isManualMode?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  coordinates, 
  apiKey, 
  selectedCoordinate, 
  onMarkerClick,
  centerCoordinate,
  mapType,
  onMapReady,
  userLocation,
  isManualMode,
  onMapClick
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
            userLocation={userLocation}
            isManualMode={isManualMode}
            onMapClick={onMapClick}
          />
        );
    }
  };

  return (
    <Wrapper apiKey={apiKey} render={render} />
  );
};

const MapDisplay: React.FC<MapDisplayProps> = ({ 
  coordinates, 
  selectedCoordinate, 
  onMarkerClick,
  centerCoordinate,
  mapType,
  onMapReady,
  userLocation,
  isManualMode,
  onMapClick
}) => {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<google.maps.Map | null>(null);
  const markers = React.useRef<google.maps.Marker[]>([]);
  const polygon = React.useRef<google.maps.Polygon | null>(null);
  const userMarker = React.useRef<google.maps.Marker | null>(null);
  const userAccuracyCircle = React.useRef<google.maps.Circle | null>(null);

  // Initialize map
  React.useEffect(() => {
    if (mapRef.current && !map.current) {
      console.log('Initializing Google Map');
      map.current = new google.maps.Map(mapRef.current, {
        center: { lat: 0, lng: 0 },
        zoom: 10,
        mapTypeId: mapType as google.maps.MapTypeId,
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
        gestureHandling: 'cooperative',
      });
      
      onMapReady(map.current);

      // Map click listener for manual plotting
      if (onMapClick) {
        map.current.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (isManualMode && event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            onMapClick(lat, lng);
            console.log('📍 Manual point added:', lat.toFixed(6), lng.toFixed(6));
          }
        });
      }
    }
  }, [onMapReady, mapType, onMapClick, isManualMode]);

  // Update map type when changed
  React.useEffect(() => {
    if (map.current) {
      map.current.setMapTypeId(mapType as google.maps.MapTypeId);
    }
  }, [mapType]);

  // Update user location marker
  React.useEffect(() => {
    if (!map.current) return;

    // Clear existing user marker and accuracy circle
    if (userMarker.current) {
      userMarker.current.setMap(null);
      userMarker.current = null;
    }
    if (userAccuracyCircle.current) {
      userAccuracyCircle.current.setMap(null);
      userAccuracyCircle.current = null;
    }

    if (userLocation) {
      // Create user location marker
      userMarker.current = new google.maps.Marker({
        position: { lat: userLocation.lat, lng: userLocation.lng },
        map: map.current,
        title: 'Your Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2,
        },
        zIndex: 1000,
      });

      // Create accuracy circle
      userAccuracyCircle.current = new google.maps.Circle({
        strokeColor: '#4285F4',
        strokeOpacity: 0.4,
        strokeWeight: 1,
        fillColor: '#4285F4',
        fillOpacity: 0.1,
        map: map.current,
        center: { lat: userLocation.lat, lng: userLocation.lng },
        radius: userLocation.accuracy,
      });

      console.log('👤 User location marker updated');
    }
  }, [userLocation]);

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
      
      // Use different colors for manual vs uploaded coordinates
      const isManual = coord.original?.manually_created;
      
      const marker = new google.maps.Marker({
        position: { lat: coord.lat, lng: coord.lng },
        map: map.current,
        title: `Point ${index + 1}${isManual ? ' (Manual)' : ''}`,
        label: {
          text: (index + 1).toString(),
          color: isSelected ? 'white' : 'black',
          fontWeight: 'bold'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 15 : 10,
          fillColor: isSelected 
            ? '#3B82F6' 
            : isManual 
              ? '#8B5CF6' // Purple for manual points
              : coord.plotted 
                ? '#10B981' 
                : '#6B7280',
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