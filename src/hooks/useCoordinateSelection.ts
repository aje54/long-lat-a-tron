import { useState } from 'react';

export const useCoordinateSelection = () => {
  const [selectedCoordinate, setSelectedCoordinate] = useState<number | null>(null);
  const [centerCoordinate, setCenterCoordinate] = useState<number | null>(null);

  const handleCoordinateSelect = (id: number) => {
    console.log('handleCoordinateSelect called with id:', id);
    console.log('Current selectedCoordinate:', selectedCoordinate);
    const newSelection = id === selectedCoordinate ? null : id;
    console.log('Setting selectedCoordinate to:', newSelection);
    setSelectedCoordinate(newSelection);
  };
  
  const handleCoordinateCenter = (id: number) => {
    console.log('handleCoordinateCenter called with id:', id);
    setCenterCoordinate(id);
    setSelectedCoordinate(id);
    setTimeout(() => setCenterCoordinate(null), 100);
  };
  
  const handleMarkerClick = (id: number) => {
    console.log('handleMarkerClick called with id:', id);
    console.log('Current selectedCoordinate:', selectedCoordinate);
    setSelectedCoordinate(id === selectedCoordinate ? null : id);
  };

  return {
    selectedCoordinate,
    centerCoordinate,
    handleCoordinateSelect,
    handleCoordinateCenter,
    handleMarkerClick,
  };
};