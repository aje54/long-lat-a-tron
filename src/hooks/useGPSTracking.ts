import { useState, useEffect } from 'react';
import { Coordinate } from './useFileUpload';

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export const useGPSTracking = (coordinates: Coordinate[]) => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingError, setTrackingError] = useState<string>('');
  const [watchId, setWatchId] = useState<number | null>(null);
  const [nearbyPoint, setNearbyPoint] = useState<Coordinate | null>(null);
  const [proximityThreshold] = useState(10); // 10 meters

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

  // Check if user is near any boundary points
  const checkProximity = (userLat: number, userLng: number) => {
    for (const coord of coordinates) {
      if (coord.plotted) continue; // Skip already plotted points
      
      const distance = calculateDistance(userLat, userLng, coord.lat, coord.lng);
      
      if (distance <= proximityThreshold) {
        console.log(`📍 Near point ${coord.id + 1}! Distance: ${distance.toFixed(1)}m`);
        setNearbyPoint(coord);
        
        // Vibrate if supported
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
        
        // Play notification sound
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+LyvmwfETSF0fPTgjMGHm7A7+OZURE');
          audio.play().catch(() => {}); // Ignore if audio fails
        } catch (e) {
          // Audio not supported
        }
        
        return;
      }
    }
    setNearbyPoint(null);
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setTrackingError('GPS not supported on this device');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000
    };

    const onSuccess = (position: GeolocationPosition) => {
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };
      
      setUserLocation(location);
      setTrackingError('');
      
      // Check if near any boundary points
      checkProximity(location.lat, location.lng);
      
      console.log('📍 GPS Update:', location.lat.toFixed(6), location.lng.toFixed(6), `±${location.accuracy.toFixed(0)}m`);
    };

    const onError = (error: GeolocationPositionError) => {
      let errorMessage = 'GPS error';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'GPS permission denied. Please enable location access.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'GPS position unavailable. Are you indoors?';
          break;
        case error.TIMEOUT:
          errorMessage = 'GPS timeout. Trying again...';
          break;
      }
      setTrackingError(errorMessage);
      console.error('GPS Error:', errorMessage);
    };

    const id = navigator.geolocation.watchPosition(onSuccess, onError, options);
    setWatchId(id);
    setIsTracking(true);
    console.log('🛰️ GPS tracking started');
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
    setUserLocation(null);
    setNearbyPoint(null);
    setTrackingError('');
    console.log('🛑 GPS tracking stopped');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    userLocation,
    isTracking,
    trackingError,
    nearbyPoint,
    proximityThreshold,
    startTracking,
    stopTracking,
    calculateDistance,
  };
};

export type { };