import { useState } from 'react';
import { Coordinate } from './useFileUpload';

export const useMapControls = () => {
  const [mapType, setMapType] = useState<string>('hybrid');
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  const handleMapTypeChange = (type: string) => {
    console.log('🔄 Changing map type from', mapType, 'to', type);
    setMapType(type);
  };

  const handleZoomIn = () => {
    if (mapInstance) {
      mapInstance.setZoom(mapInstance.getZoom()! + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstance) {
      mapInstance.setZoom(mapInstance.getZoom()! - 1);
    }
  };

  const handleResetView = (coordinates: Coordinate[]) => {
    if (mapInstance && coordinates.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      coordinates.forEach(coord => {
        bounds.extend({ lat: coord.lat, lng: coord.lng });
      });
      mapInstance.fitBounds(bounds);
    }
  };

  const handleToggleFullscreen = () => {
    if (mapInstance) {
      alert('Use the fullscreen button on the map, or implement custom fullscreen logic');
    }
  };

  const handleMapReady = (map: google.maps.Map) => {
    console.log('📍 Map ready, setting map instance');
    setMapInstance(map);
  };

  return {
    mapType,
    mapInstance,
    handleMapTypeChange,
    handleZoomIn,
    handleZoomOut,
    handleResetView,
    handleToggleFullscreen,
    handleMapReady,
  };
};