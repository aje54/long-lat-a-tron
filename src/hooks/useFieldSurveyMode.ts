import { useState, useEffect } from 'react';
import { Coordinate } from './useFileUpload';
import { UserLocation } from './useGPSTracking';

interface FieldSurveyState {
  isActive: boolean;
  currentTargetIndex: number;
  foundCoordinates: Set<number>;
  proximityThreshold: number;
  isNearTarget: boolean;
  distanceToTarget: number | null;
  completedCount: number;
  totalCount: number;
}

export const useFieldSurveyMode = (
  coordinates: Coordinate[],
  userLocation: UserLocation | null,
  isGPSTracking: boolean
) => {
  const [surveyState, setSurveyState] = useState<FieldSurveyState>({
    isActive: false,
    currentTargetIndex: 0,
    foundCoordinates: new Set(),
    proximityThreshold: 1, // 1 meter default for high accuracy
    isNearTarget: false,
    distanceToTarget: null,
    completedCount: 0,
    totalCount: coordinates.length
  });

  // Calculate distance between two points in meters
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Start field survey mode
  const startFieldSurvey = () => {
    if (coordinates.length === 0) {
      console.error('No coordinates available for field survey');
      return;
    }

    if (!isGPSTracking) {
      console.error('GPS tracking must be enabled for field survey');
      return;
    }

    setSurveyState(prev => ({
      ...prev,
      isActive: true,
      currentTargetIndex: 0,
      foundCoordinates: new Set(),
      completedCount: 0,
      totalCount: coordinates.length
    }));

    console.log('🎯 Field Survey Mode activated');
    console.log(`📍 Navigate to Point 1 of ${coordinates.length}`);
  };

  // Stop field survey mode
  const stopFieldSurvey = () => {
    setSurveyState(prev => ({
      ...prev,
      isActive: false,
      isNearTarget: false,
      distanceToTarget: null
    }));
    console.log('🛑 Field Survey Mode deactivated');
  };

  // Mark current target as found
  const markTargetAsFound = () => {
    const currentIndex = surveyState.currentTargetIndex;
    const newFoundCoords = new Set(surveyState.foundCoordinates);
    newFoundCoords.add(currentIndex);

    const completedCount = newFoundCoords.size;
    const nextIndex = findNextUnfoundTarget(currentIndex, newFoundCoords);

    setSurveyState(prev => ({
      ...prev,
      foundCoordinates: newFoundCoords,
      currentTargetIndex: nextIndex,
      completedCount,
      isNearTarget: false
    }));

    // Success feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([300, 100, 300]); // Double vibration for success
    }

    // Play success sound
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+LyvmwfETSF0fPTgjMGHm7A7+OZURE');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {
      // Audio not supported
    }

    console.log(`✅ Point ${currentIndex + 1} marked as found!`);
    
    if (completedCount >= coordinates.length) {
      console.log('🎉 All boundary points found! Survey complete!');
    } else {
      console.log(`📍 Navigate to Point ${nextIndex + 1} of ${coordinates.length}`);
    }
  };

  // Find next unfound target
  const findNextUnfoundTarget = (currentIndex: number, foundCoords: Set<number>): number => {
    // First try to find next unfound point after current
    for (let i = currentIndex + 1; i < coordinates.length; i++) {
      if (!foundCoords.has(i)) {
        return i;
      }
    }
    
    // If no unfound points after current, wrap around from beginning
    for (let i = 0; i <= currentIndex; i++) {
      if (!foundCoords.has(i)) {
        return i;
      }
    }
    
    // All points found
    return currentIndex;
  };

  // Skip to next unfound target
  const skipToNextTarget = () => {
    const nextIndex = findNextUnfoundTarget(surveyState.currentTargetIndex, surveyState.foundCoordinates);
    setSurveyState(prev => ({
      ...prev,
      currentTargetIndex: nextIndex,
      isNearTarget: false
    }));
    console.log(`⏭️ Skipped to Point ${nextIndex + 1}`);
  };

  // Go to specific target
  const goToTarget = (targetIndex: number) => {
    if (targetIndex >= 0 && targetIndex < coordinates.length) {
      setSurveyState(prev => ({
        ...prev,
        currentTargetIndex: targetIndex,
        isNearTarget: false
      }));
      console.log(`📍 Navigating to Point ${targetIndex + 1}`);
    }
  };

  // Set proximity threshold
  const setProximityThreshold = (threshold: number) => {
    setSurveyState(prev => ({
      ...prev,
      proximityThreshold: Math.max(1, Math.min(50, threshold)) // 1-50 meters
    }));
  };

  // Check proximity to current target
  useEffect(() => {
    if (!surveyState.isActive || !userLocation || coordinates.length === 0) {
      return;
    }

    const currentTarget = coordinates[surveyState.currentTargetIndex];
    if (!currentTarget) return;

    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      currentTarget.lat,
      currentTarget.lng
    );

    const wasNearTarget = surveyState.isNearTarget;
    const isNowNearTarget = distance <= surveyState.proximityThreshold;

    setSurveyState(prev => ({
      ...prev,
      distanceToTarget: distance,
      isNearTarget: isNowNearTarget
    }));

    // Trigger notification when entering proximity (not when staying in proximity)
    if (isNowNearTarget && !wasNearTarget) {
      // Vibration notification
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }

      // Audio notification
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+LyvmwfETSF0fPTgjMGHm7A7+OZURE');
        audio.volume = 0.7;
        audio.play().catch(() => {});
      } catch (e) {
        // Audio not supported
      }

      console.log(`🎯 ARRIVED! You're within ${distance.toFixed(1)}m of Point ${surveyState.currentTargetIndex + 1}`);
      console.log('📍 You can now physically mark this boundary point!');
    }
  }, [userLocation, surveyState.isActive, surveyState.currentTargetIndex, coordinates, surveyState.proximityThreshold, surveyState.isNearTarget]);

  // Get current target info
  const getCurrentTarget = () => {
    if (!surveyState.isActive || coordinates.length === 0) return null;
    
    const target = coordinates[surveyState.currentTargetIndex];
    if (!target) return null;

    return {
      ...target,
      index: surveyState.currentTargetIndex,
      number: surveyState.currentTargetIndex + 1,
      isFound: surveyState.foundCoordinates.has(surveyState.currentTargetIndex)
    };
  };

  // Get survey progress
  const getProgress = () => ({
    completed: surveyState.completedCount,
    total: surveyState.totalCount,
    percentage: surveyState.totalCount > 0 ? (surveyState.completedCount / surveyState.totalCount) * 100 : 0,
    remaining: surveyState.totalCount - surveyState.completedCount
  });

  // Check if survey is complete
  const isComplete = () => surveyState.completedCount >= coordinates.length;

  return {
    // State
    isActive: surveyState.isActive,
    isNearTarget: surveyState.isNearTarget,
    distanceToTarget: surveyState.distanceToTarget,
    proximityThreshold: surveyState.proximityThreshold,
    
    // Actions
    startFieldSurvey,
    stopFieldSurvey,
    markTargetAsFound,
    skipToNextTarget,
    goToTarget,
    setProximityThreshold,
    
    // Info
    getCurrentTarget,
    getProgress,
    isComplete,
    foundCoordinates: surveyState.foundCoordinates,
    
    // Utils
    calculateDistance
  };
};