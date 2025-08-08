import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Alert, AlertDescription } from './components/ui/alert';
import { Progress } from './components/ui/progress';
import { Input } from './components/ui/input';
import { 
  Target,
  MapPin,
  CheckCircle2,
  Navigation,
  SkipForward,
  Settings,
  Play,
  Square,
  Crosshair,
  AlertTriangle
} from 'lucide-react';

interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
}

interface Coordinate {
  id: number;
  lat: number;
  lng: number;
  plotted?: boolean;
}

interface FieldSurveyControlsProps {
  coordinates: Coordinate[];
  userLocation: UserLocation | null;
  isGPSTracking: boolean;
  isActive: boolean;
  isNearTarget: boolean;
  distanceToTarget: number | null;
  proximityThreshold: number;
  currentTarget: any;
  progress: { completed: number; total: number; percentage: number; remaining: number };
  isComplete: boolean;
  onStartSurvey: () => void;
  onStopSurvey: () => void;
  onMarkAsFound: () => void;
  onSkipTarget: () => void;
  onGoToTarget: (index: number) => void;
  onSetProximityThreshold: (threshold: number) => void;
  onStartGPSTracking: () => void;
}

const FieldSurveyControls: React.FC<FieldSurveyControlsProps> = ({
  coordinates,
  userLocation,
  isGPSTracking,
  isActive,
  isNearTarget,
  distanceToTarget,
  proximityThreshold,
  currentTarget,
  progress,
  isComplete,
  onStartSurvey,
  onStopSurvey,
  onMarkAsFound,
  onSkipTarget,
  onGoToTarget,
  onSetProximityThreshold,
  onStartGPSTracking,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(proximityThreshold.toString());

  // Update tempThreshold when proximityThreshold changes
  React.useEffect(() => {
    setTempThreshold(proximityThreshold.toString());
  }, [proximityThreshold]);

  const handleThresholdUpdate = () => {
    const newThreshold = parseFloat(tempThreshold);
    if (newThreshold >= 1 && newThreshold <= 50) {
      onSetProximityThreshold(newThreshold);
      setShowSettings(false);
    }
  };

  const formatDistance = (distance: number | null): string => {
    if (distance === null) return '--';
    if (distance < 1000) {
      return `${distance.toFixed(1)}m`;
    } else {
      return `${(distance / 1000).toFixed(2)}km`;
    }
  };

  const getDistanceColor = (distance: number | null): string => {
    if (distance === null) return 'text-gray-500';
    if (distance <= proximityThreshold) return 'text-green-600 font-bold';
    if (distance <= proximityThreshold * 2) return 'text-orange-600';
    return 'text-red-600';
  };

  if (coordinates.length === 0) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Field Survey Mode
          </CardTitle>
          <CardDescription>
            Navigate to boundary coordinates and physically mark them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-blue-200 bg-blue-50">
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              <strong>Load coordinates first.</strong> Upload a coordinate file or create coordinates using GPS recording to enable field survey mode.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isActive ? "border-blue-200 bg-blue-50" : "border-gray-200"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Field Survey Mode
          {isActive && (
            <Badge variant="default" className="bg-blue-600">
              <Navigation className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Navigate to boundary coordinates and physically mark them in the field
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        
        {/* Progress Display */}
        {isActive && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Survey Progress</span>
              <span className="text-sm text-gray-600">
                {progress.completed} of {progress.total} points found
              </span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
            
            {isComplete && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  🎉 <strong>Survey Complete!</strong> All {progress.total} boundary points have been found and marked.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Current Target Info */}
        {isActive && currentTarget && !isComplete && (
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700">
                    {currentTarget.number}
                  </div>
                  <div>
                    <p className="font-medium">Target Point {currentTarget.number}</p>
                    <p className="text-xs text-gray-500 font-mono">
                      {currentTarget.lat.toFixed(6)}, {currentTarget.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
                
                {currentTarget.isFound && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Found
                  </Badge>
                )}
              </div>

              {/* Distance Display */}
              {userLocation && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Distance:</span>
                  </div>
                  <div className={`text-lg font-mono ${getDistanceColor(distanceToTarget)}`}>
                    {formatDistance(distanceToTarget)}
                  </div>
                </div>
              )}

              {/* Near Target Indicator */}
              {isNearTarget && (
                <Alert className="mt-3 border-green-200 bg-green-50">
                  <Crosshair className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>🎯 ARRIVED!</strong> You're within {proximityThreshold}m of the target. 
                    You can now physically mark this boundary point!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}

        {/* GPS Status */}
        {!isGPSTracking && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>GPS required.</strong> Click "Start GPS Tracking" above to enable field survey mode.
            </AlertDescription>
          </Alert>
        )}

        {/* Control Buttons */}
        <div className="space-y-3">
          {!isGPSTracking ? (
            // Step 1: Start GPS Tracking first
            <Button
              onClick={onStartGPSTracking}
              disabled={coordinates.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Start GPS Tracking
            </Button>
          ) : !isActive ? (
            // Step 2: Once GPS is active, allow field survey
            <Button
              onClick={onStartSurvey}
              disabled={coordinates.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Field Survey
            </Button>
          ) : (
            // Step 3: Survey mode buttons
            <div className="space-y-2">
              <div className="flex gap-2">
                {!isComplete && (
                  <Button
                    onClick={onMarkAsFound}
                    disabled={!currentTarget}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Mark as Found
                  </Button>
                )}
                
                <Button
                  onClick={onStopSurvey}
                  variant="outline"
                  className="bg-gray-50"
                >
                  <Square className="h-4 w-4 mr-1" />
                  Stop Survey
                </Button>
              </div>

              {!isComplete && (
                <Button
                  onClick={onSkipTarget}
                  variant="outline"
                  className="w-full"
                  disabled={!currentTarget}
                >
                  <SkipForward className="h-4 w-4 mr-1" />
                  Skip to Next Point
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="space-y-3">
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="ghost"
            size="sm"
            className="text-gray-600"
          >
            <Settings className="h-4 w-4 mr-1" />
            Survey Settings
          </Button>

          {showSettings && (
            <div className="bg-gray-50 p-3 rounded-lg space-y-3">
              <div>
                <label className="text-sm font-medium">Proximity Alert Distance</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={tempThreshold}
                    onChange={(e) => setTempThreshold(e.target.value)}
                    className="flex-1"
                    placeholder="1"
                  />
                  <span className="flex items-center text-sm text-gray-600">meters</span>
                  <Button size="sm" onClick={handleThresholdUpdate}>
                    Update
                  </Button>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Alert distance: {proximityThreshold}m (recommended: 1-3m for high accuracy)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        {isActive && !isComplete && (
          <Alert className="border-blue-200 bg-blue-50">
            <Target className="h-4 w-4" />
            <AlertDescription>
              <strong>Navigate to the target point.</strong> When you're within {proximityThreshold}m, 
              your phone will vibrate and alert you. Mark the boundary physically, then tap "Mark as Found" to continue.
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Stats */}
        {coordinates.length > 0 && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Points:</span>
                <span className="font-medium ml-2">{progress.total}</span>
              </div>
              <div>
                <span className="text-gray-600">Alert Distance:</span>
                <span className="font-medium ml-2">{proximityThreshold}m</span>
              </div>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default FieldSurveyControls;