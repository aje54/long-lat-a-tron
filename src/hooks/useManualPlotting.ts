import { useState } from 'react';
import { Coordinate } from './useFileUpload';

export const useManualPlotting = () => {
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualCoordinates, setManualCoordinates] = useState<Coordinate[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const addCurrentLocationAsCoordinate = (userLocation: { lat: number; lng: number; accuracy: number } | null) => {
    if (!userLocation) {
      alert('GPS location not available. Please enable GPS tracking first.');
      return null;
    }

    const newCoord: Coordinate = {
      id: manualCoordinates.length,
      lat: userLocation.lat,
      lng: userLocation.lng,
      plotted: true, // Mark as plotted since we're physically here
      original: { 
        lat: userLocation.lat, 
        lng: userLocation.lng, 
        manually_created: true,
        accuracy: userLocation.accuracy,
        timestamp: Date.now()
      }
    };
    
    setManualCoordinates(prev => [...prev, newCoord]);
    console.log(`📍 Plotted point ${manualCoordinates.length + 1}:`, userLocation.lat.toFixed(6), userLocation.lng.toFixed(6), `±${userLocation.accuracy.toFixed(0)}m`);
    return newCoord;
  };

  const removeLastCoordinate = () => {
    if (manualCoordinates.length > 0) {
      setManualCoordinates(prev => prev.slice(0, -1));
      console.log('🗑️ Removed last coordinate');
    }
  };

  const clearManualCoordinates = () => {
    setManualCoordinates([]);
    console.log('🗑️ Cleared all manual coordinates');
  };

  const startManualMode = () => {
    setIsManualMode(true);
    setIsRecording(true);
    console.log('✏️ Started manual plotting mode');
  };

  const completeManualMode = () => {
    setIsManualMode(false);
    setIsRecording(false);
    console.log('🏁 Completed manual plotting mode');
  };

  const exportToJSON = (filename: string = 'boundary-coordinates') => {
    if (manualCoordinates.length === 0) {
      alert('No coordinates to export');
      return;
    }

    // Convert to simple lat/lng format
    const exportData = manualCoordinates.map(coord => ({
      lat: coord.lat,
      lng: coord.lng,
      accuracy: coord.original.accuracy,
      timestamp: coord.original.timestamp
    }));

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`💾 Exported ${manualCoordinates.length} coordinates to ${filename}.json`);
  };

  return {
    isManualMode,
    isRecording,
    manualCoordinates,
    addCurrentLocationAsCoordinate,
    removeLastCoordinate,
    clearManualCoordinates,
    startManualMode,
    completeManualMode,
    exportToJSON,
    setManualCoordinates,
  };
};