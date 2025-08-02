import { useState } from 'react';
import { Coordinate } from './useFileUpload';

export const usePlotMode = (coordinates: Coordinate[], setCoordinates: (coords: Coordinate[]) => void) => {
  const [isPlotMode, setIsPlotMode] = useState(false);
  const [plotProgress, setPlotProgress] = useState(0);

  const markPointAsPlotted = (pointId: number) => {
    const updatedCoords = coordinates.map(coord => 
      coord.id === pointId 
        ? { ...coord, plotted: true }
        : coord
    );
    setCoordinates(updatedCoords);
    
    // Update progress
    const plottedCount = updatedCoords.filter(c => c.plotted).length;
    const progress = (plottedCount / coordinates.length) * 100;
    setPlotProgress(progress);
    
    console.log(`✅ Point ${pointId + 1} marked as plotted! Progress: ${progress.toFixed(0)}%`);
  };

  const resetPlotProgress = () => {
    const resetCoords = coordinates.map(coord => ({ ...coord, plotted: false }));
    setCoordinates(resetCoords);
    setPlotProgress(0);
    console.log('🔄 Plot progress reset');
  };

  const togglePlotMode = () => {
    setIsPlotMode(!isPlotMode);
    console.log(isPlotMode ? '🏠 Exiting plot mode' : '🎯 Entering plot mode');
  };

  const getPlottedCount = () => coordinates.filter(c => c.plotted).length;
  const getTotalCount = () => coordinates.length;

  return {
    isPlotMode,
    plotProgress,
    markPointAsPlotted,
    resetPlotProgress,
    togglePlotMode,
    getPlottedCount,
    getTotalCount,
  };
};