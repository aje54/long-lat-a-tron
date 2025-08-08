import React from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';

interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp?: number;
}

interface Coordinate {
  id: number;
  lat: number;
  lng: number;
  plotted?: boolean;
  original?: any;
}

interface SurveyMode {
  isActive: boolean;
  currentTarget: {
    id: number;
    lat: number;
    lng: number;
    index: number;
    number: number;
    isFound: boolean;
  } | null;
  foundCoordinates: Set<number>;
  isNearTarget: boolean;
}

interface MapComponentProps {
  coordinates: Coordinate[];
  apiKey: string;
  selectedCoordinate: number | null;
  onMarkerClick: (id: number) => void;
  centerCoordinate: number | null;
  mapType: string;
  onMapReady: (map: google.maps.Map) => void;
  userLocation: UserLocation | null;
  surveyMode?: SurveyMode;
}

const Map: React.FC<MapComponentProps> = ({
  coordinates,
  selectedCoordinate,
  onMarkerClick,
  centerCoordinate,
  mapType,
  onMapReady,
  userLocation,
  surveyMode,
}) => {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<google.maps.Map | null>(null);
  const markers = React.useRef<google.maps.Marker[]>([]);
  const polygon = React.useRef<google.maps.Polygon | null>(null);
  const userMarker = React.useRef<google.maps.Marker | null>(null);
  const userAccuracyCircle = React.useRef<google.maps.Circle | null>(null);

  // Initialize map
  React.useEffect(() => {
    if (!mapRef.current || !window.google || coordinates.length === 0) return;

    if (!map.current) {
      const bounds = new google.maps.LatLngBounds();
      coordinates.forEach(coord => {
        bounds.extend({ lat: coord.lat, lng: coord.lng });
      });

      map.current = new google.maps.Map(mapRef.current, {
        center: bounds.getCenter(),
        zoom: 18,
        mapTypeId: mapType as google.maps.MapTypeId,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER,
        },
        scaleControl: true,
      });

      map.current.fitBounds(bounds);

      // Add click listener for map
      map.current.addListener('click', (event: google.maps.MapMouseEvent) => {
        console.log('Map clicked at:', event.latLng?.lat(), event.latLng?.lng());
      });

      onMapReady(map.current);
    }
  }, [coordinates, mapType, onMapReady]);

  // Update map type
  React.useEffect(() => {
    if (!map.current) return;
    map.current.setMapTypeId(mapType as google.maps.MapTypeId);
  }, [mapType]);

  // Update user location marker
  React.useEffect(() => {
    if (!map.current || !window.google) return;

    // Remove existing user markers
    if (userMarker.current) {
      userMarker.current.setMap(null);
      userMarker.current = null;
    }
    if (userAccuracyCircle.current) {
      userAccuracyCircle.current.setMap(null);
      userAccuracyCircle.current = null;
    }

    if (userLocation) {
      // Create user position marker
      userMarker.current = new google.maps.Marker({
        position: { lat: userLocation.lat, lng: userLocation.lng },
        map: map.current,
        title: `Your Location (±${userLocation.accuracy.toFixed(0)}m)`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeWeight: 3,
          strokeColor: '#FFFFFF',
        },
        zIndex: 1001,
      });

      // Create accuracy circle
      userAccuracyCircle.current = new google.maps.Circle({
        strokeColor: '#4285F4',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#4285F4',
        fillOpacity: 0.15,
        map: map.current,
        center: { lat: userLocation.lat, lng: userLocation.lng },
        radius: userLocation.accuracy,
      });
    }
  }, [userLocation]);

  // Update markers with survey mode support
  React.useEffect(() => {
    if (!map.current || !window.google) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    // Create markers for each coordinate
    coordinates.forEach((coord, index) => {
      const isCurrentTarget = Boolean(surveyMode?.isActive && surveyMode.currentTarget?.index === index);
      const isFound = Boolean(surveyMode?.foundCoordinates?.has(index));
      const isSelected = selectedCoordinate === coord.id;
      
      const marker = new google.maps.Marker({
        position: { lat: coord.lat, lng: coord.lng },
        map: map.current,
        title: `Point ${index + 1}${isFound ? ' (Found)' : ''}${isCurrentTarget ? ' (Target)' : ''}${coord.plotted ? ' (Plotted)' : ''}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isCurrentTarget ? 14 : isSelected ? 12 : 10,
          fillColor: getMarkerColor(coord, isCurrentTarget, isFound),
          fillOpacity: 0.9,
          strokeWeight: isCurrentTarget ? 4 : isSelected ? 3 : 2,
          strokeColor: isCurrentTarget ? '#D97706' : isSelected ? '#1D4ED8' : '#FFFFFF',
        },
        zIndex: isCurrentTarget ? 1000 : isSelected ? 500 : isFound ? 100 : 10,
      });

      marker.addListener('click', () => {
        onMarkerClick(coord.id);
      });

      markers.current.push(marker);

      // Add pulsing animation for current target when near
      if (isCurrentTarget && surveyMode?.isNearTarget) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => {
          if (marker) marker.setAnimation(null);
        }, 2000);
      }
    });
  }, [coordinates, selectedCoordinate, onMarkerClick, surveyMode?.isActive, surveyMode?.currentTarget, surveyMode?.foundCoordinates, surveyMode?.isNearTarget]);

  // Helper function to determine marker color
  const getMarkerColor = (coord: Coordinate, isCurrentTarget: boolean, isFound: boolean): string => {
    if (isCurrentTarget) return '#F59E0B'; // Orange for current target
    if (isFound) return '#10B981'; // Green for found points
    if (coord.plotted) return '#3B82F6'; // Blue for plotted points
    return '#EF4444'; // Red for unvisited points
  };

  // Update polygon
  React.useEffect(() => {
    if (!map.current || !window.google || coordinates.length < 3) {
      if (polygon.current) {
        polygon.current.setMap(null);
        polygon.current = null;
      }
      return;
    }

    const path = coordinates.map(coord => ({ lat: coord.lat, lng: coord.lng }));
    const isSurveyActive = Boolean(surveyMode?.isActive);

    if (polygon.current) {
      polygon.current.setPath(path);
    } else {
      polygon.current = new google.maps.Polygon({
        paths: path,
        geodesic: true,
        strokeColor: isSurveyActive ? '#F59E0B' : '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: isSurveyActive ? 3 : 2,
        fillColor: isSurveyActive ? '#FEF3C7' : '#FF0000',
        fillOpacity: 0.15,
        map: map.current,
      });
    }
  }, [coordinates, surveyMode?.isActive]);

  // Center on coordinate
  React.useEffect(() => {
    if (!map.current || centerCoordinate === null) return;

    const coord = coordinates.find(c => c.id === centerCoordinate);
    if (coord) {
      const position = { lat: coord.lat, lng: coord.lng };
      map.current.setCenter(position);
      map.current.setZoom(20);
    }
  }, [centerCoordinate, coordinates]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

const MapComponent: React.FC<MapComponentProps> = (props) => {
  const render = (status: any) => {
    if (status === 'LOADING') return <div>Loading map...</div>;
    if (status === 'FAILURE') return <div>Error loading map</div>;
    return <Map {...props} />;
  };

  return (
    <Wrapper apiKey={props.apiKey} render={render}>
      <Map {...props} />
    </Wrapper>
  );
};

export default MapComponent;